import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { BillingProvider, BillingStatus } from '@/lib/billing-config';
import { useAuth } from '@/hooks/use-auth';
import {
  type BillingMirrorState,
  createLocalEntitlementsFallback,
  fetchMobileEntitlements,
  getEntitlementsSyncErrorMessage,
  normalizeBackendEntitlements,
  refreshMobileEntitlements,
  type EntitlementsRefreshReason,
} from '@/lib/entitlements-api';
import type { BackendEntitlementsResponse } from '@/lib/entitlements-contract';
import {
  isCachedBackendContractStale,
  clearEntitlementsContractCache,
  readEntitlementsContractCache,
  type CachedBackendEntitlementsContract,
  writeEntitlementsContractCache,
} from '@/lib/entitlements-contract-cache';
import {
  isFeatureUnlocked,
  type AccessTier,
  type EntitlementFeature,
  type EntitlementsSnapshot,
  type HistoryWindow,
  type SubscriptionPlan,
} from '@/lib/monetization';
import {
  clearEntitlementsCache,
  readEntitlementsCache,
  writeEntitlementsCache,
} from '@/lib/monetization-cache';
import { createFallbackSubscriptionState, createSubscriptionDriver } from '@/lib/subscription-driver';

type EntitlementsSyncStatus = 'idle' | 'syncing' | 'ready' | 'cached' | 'stale' | 'error';

type MonetizationContextValue = {
  entitlements: EntitlementsSnapshot;
  entitlementsContract: BackendEntitlementsResponse;
  isReady: boolean;
  isProcessing: boolean;
  lastAction: string | null;
  errorMessage: string | null;
  entitlementsSyncStatus: EntitlementsSyncStatus;
  entitlementsSyncMessage: string | null;
  entitlementsContractState: 'backend_live' | 'backend_cached' | 'local_fallback' | 'local_premium_mirror';
  entitlementsLastSyncAt: string | null;
  entitlementsContractVersion: string;
  accessTier: AccessTier;
  billingProvider: BillingProvider;
  billingStatus: BillingStatus;
  billingStatusMessage: string;
  canStartPurchase: boolean;
  requiresNativeBillingBuild: boolean;
  allowedHistoryWindows: HistoryWindow[];
  maxTopFlows: number;
  diagnosticsAccess: 'preview' | 'full';
  syncEntitlements: (reason?: EntitlementsRefreshReason) => Promise<void>;
  purchasePremium: (plan: Exclude<SubscriptionPlan, null>) => Promise<void>;
  restorePurchases: () => Promise<void>;
  resetToFree: () => Promise<void>;
  hasFeature: (feature: EntitlementFeature) => boolean;
};

const MonetizationContext = createContext<MonetizationContextValue | null>(null);

function shouldPreserveLocalPremium(
  billingProvider: BillingProvider,
  entitlements: EntitlementsSnapshot,
): boolean {
  return (
    (billingProvider === 'mock' || billingProvider === 'revenuecat') &&
    entitlements.tier === 'premium' &&
    (
      entitlements.source === 'mock_purchase' ||
      entitlements.source === 'mock_restore' ||
      entitlements.source === 'revenuecat_purchase' ||
      entitlements.source === 'revenuecat_restore' ||
      entitlements.source === 'revenuecat_sync'
    )
  );
}

function getCachedSyncStatus(
  cachedContract: CachedBackendEntitlementsContract,
): Extract<EntitlementsSyncStatus, 'cached' | 'stale'> {
  return cachedContract.freshness === 'stale' ? 'stale' : 'cached';
}

function getCachedSyncMessage(
  cachedContract: CachedBackendEntitlementsContract,
  errorMessage?: string,
): string {
  if (errorMessage) {
    return cachedContract.freshness === 'stale'
      ? `Using stale cached access rules after sync failure: ${errorMessage}`
      : `Using cached access rules after sync failure: ${errorMessage}`;
  }

  return cachedContract.freshness === 'stale'
    ? 'Stored backend access rules are stale and will be refreshed.'
    : 'Using the last stored backend access rules.';
}

function buildBillingMirrorState(
  entitlements: EntitlementsSnapshot,
  billingProvider: BillingProvider,
  mode: 'purchase' | 'restore' | 'reset',
): BillingMirrorState | null {
  if (mode === 'reset') {
      return {
        access_tier: 'free',
        plan: null,
        source: 'mock_reset',
        billing_provider: 'mock',
        purchased_at: entitlements.updatedAt,
        expires_at: null,
    };
  }

  if (billingProvider !== 'mock' && billingProvider !== 'revenuecat') {
    return null;
  }

  const source =
    mode === 'purchase'
      ? billingProvider === 'mock'
        ? 'mock_purchase'
        : 'revenuecat_purchase'
      : billingProvider === 'mock'
        ? 'mock_restore'
        : 'revenuecat_restore';

  return {
    access_tier: entitlements.tier,
    plan: entitlements.plan,
    source,
    billing_provider: billingProvider,
    purchased_at: entitlements.updatedAt,
    expires_at: null,
  };
}

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const driver = useMemo(
    () =>
      createSubscriptionDriver({
        read: readEntitlementsCache,
        write: writeEntitlementsCache,
        clear: clearEntitlementsCache,
      }),
    [],
  );
  const [entitlements, setEntitlements] = useState<EntitlementsSnapshot>(createFallbackSubscriptionState());
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entitlementsSyncStatus, setEntitlementsSyncStatus] = useState<EntitlementsSyncStatus>('idle');
  const [entitlementsSyncMessage, setEntitlementsSyncMessage] = useState<string | null>(null);
  const [backendContractCache, setBackendContractCache] = useState<CachedBackendEntitlementsContract | null>(null);
  const entitlementsRef = useRef(entitlements);
  const backendContractCacheRef = useRef<CachedBackendEntitlementsContract | null>(null);
  const backendAuthToken = auth.providerMode === 'backend' ? auth.accessToken : null;

  useEffect(() => {
    entitlementsRef.current = entitlements;
  }, [entitlements]);

  useEffect(() => {
    backendContractCacheRef.current = backendContractCache;
  }, [backendContractCache]);

  useEffect(() => {
    if (auth.providerMode !== 'backend' || backendAuthToken) {
      return;
    }

    setBackendContractCache(null);
    setEntitlements(createFallbackSubscriptionState());
    setEntitlementsSyncStatus('idle');
    setEntitlementsSyncMessage('Authenticate to sync backend entitlements.');

    void clearEntitlementsContractCache();
    void clearEntitlementsCache();
  }, [auth.providerMode, backendAuthToken]);

  const syncEntitlementsFromBackend = useCallback(async (
    localEntitlements: EntitlementsSnapshot,
    options: {
      force?: boolean;
      reason?: EntitlementsRefreshReason;
      cachedContract?: CachedBackendEntitlementsContract | null;
      billingState?: BillingMirrorState | null;
    } = {},
  ) => {
    if (auth.providerMode === 'backend' && !backendAuthToken) {
      setEntitlementsSyncStatus('idle');
      setEntitlementsSyncMessage('Authenticate to sync backend entitlements.');
      setBackendContractCache(null);
      return;
    }

    const cachedContract = options.cachedContract ?? backendContractCacheRef.current ?? (await readEntitlementsContractCache());

    if (cachedContract && backendContractCacheRef.current === null) {
      setBackendContractCache(cachedContract);
    }

    const preserveLocalPremium = shouldPreserveLocalPremium(driver.billing.provider, localEntitlements);
    const normalizedCached = cachedContract ? normalizeBackendEntitlements(cachedContract.contract) : null;
    const cachedIsStale = cachedContract ? isCachedBackendContractStale(cachedContract) : true;

    if (!options.force && cachedContract && !cachedIsStale) {
      setBackendContractCache(cachedContract);
      setEntitlementsSyncStatus('cached');
      setEntitlementsSyncMessage(getCachedSyncMessage(cachedContract));

      if (!preserveLocalPremium && normalizedCached) {
        setEntitlements(normalizedCached);
        await writeEntitlementsCache(normalizedCached);
      }
      return;
    }

    setEntitlementsSyncStatus('syncing');
    setEntitlementsSyncMessage(null);

    try {
      const remoteEntitlements = options.reason
        ? await refreshMobileEntitlements(options.reason, backendAuthToken, undefined, options.billingState ?? null)
        : await fetchMobileEntitlements(backendAuthToken);
      const normalizedRemote = normalizeBackendEntitlements(remoteEntitlements);
      const cachedRemote = await writeEntitlementsContractCache(remoteEntitlements);

      setBackendContractCache(cachedRemote);
      setEntitlementsSyncStatus(cachedRemote.freshness === 'stale' ? 'stale' : 'ready');
      setEntitlementsSyncMessage(
        cachedRemote.freshness === 'stale'
          ? 'Backend access rules are stale.'
          : 'Access rules synced from backend.',
      );

      if (!preserveLocalPremium) {
        setEntitlements(normalizedRemote);
        setLastAction('Synced entitlements from backend');
        await writeEntitlementsCache(normalizedRemote);
      }
    } catch (error) {
      const syncErrorMessage = getEntitlementsSyncErrorMessage(error);

      if (cachedContract) {
        setBackendContractCache(cachedContract);
        setEntitlementsSyncStatus(getCachedSyncStatus(cachedContract));
        setEntitlementsSyncMessage(getCachedSyncMessage(cachedContract, syncErrorMessage));

        if (!preserveLocalPremium && normalizedCached) {
          setEntitlements(normalizedCached);
          await writeEntitlementsCache(normalizedCached);
        }
        return;
      }

      setEntitlementsSyncStatus('error');
      setEntitlementsSyncMessage(syncErrorMessage);
      setBackendContractCache(null);
    }
  }, [auth.providerMode, backendAuthToken, driver.billing.provider]);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const [result, cachedContract] = await Promise.all([
        driver.hydrate(),
        readEntitlementsContractCache(),
      ]);

      if (!mounted) {
        return;
      }

      const hydratedEntitlements = result.entitlements ?? createFallbackSubscriptionState();
      const preserveLocalPremium = shouldPreserveLocalPremium(driver.billing.provider, hydratedEntitlements);

      setLastAction(result.lastAction);

      if (auth.providerMode === 'backend' && !backendAuthToken) {
        setEntitlements(createFallbackSubscriptionState());
        setBackendContractCache(null);
        setEntitlementsSyncStatus('idle');
        setEntitlementsSyncMessage('Authenticate to sync backend entitlements.');
      } else if (cachedContract) {
        const normalizedCached = normalizeBackendEntitlements(cachedContract.contract);

        setBackendContractCache(cachedContract);
        setEntitlementsSyncStatus(getCachedSyncStatus(cachedContract));
        setEntitlementsSyncMessage(getCachedSyncMessage(cachedContract));

        if (preserveLocalPremium) {
          setEntitlements(hydratedEntitlements);
        } else {
          setEntitlements(normalizedCached);
          await writeEntitlementsCache(normalizedCached);
        }
      } else {
        setEntitlements(hydratedEntitlements);
      }

      setIsReady(true);

      if (preserveLocalPremium) {
        void syncEntitlementsFromBackend(hydratedEntitlements, {
          force: true,
          reason: 'manual_retry',
          cachedContract,
          billingState: buildBillingMirrorState(hydratedEntitlements, driver.billing.provider, 'restore'),
        });
        return;
      }

      if (!cachedContract || isCachedBackendContractStale(cachedContract)) {
        void syncEntitlementsFromBackend(hydratedEntitlements, {
          force: true,
          cachedContract,
        });
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [auth.providerMode, backendAuthToken, driver, syncEntitlementsFromBackend]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const currentContract = backendContractCacheRef.current;
      const shouldSync = !currentContract || isCachedBackendContractStale(currentContract);

      if (nextState === 'active' && isReady && shouldSync) {
        void syncEntitlementsFromBackend(entitlementsRef.current, {
          force: true,
          reason: 'app_foreground',
          cachedContract: currentContract,
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isReady, syncEntitlementsFromBackend]);

  const purchasePremium = async (plan: Exclude<SubscriptionPlan, null>) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await driver.purchasePremium(plan);
      setEntitlements(result.entitlements);
      setLastAction(result.lastAction);
      await syncEntitlementsFromBackend(result.entitlements, {
        force: true,
        reason: 'manual_retry',
        cachedContract: backendContractCacheRef.current,
        billingState: buildBillingMirrorState(result.entitlements, driver.billing.provider, 'purchase'),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'purchase_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const restorePurchases = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await driver.restorePurchases();
      setEntitlements(result.entitlements);
      setLastAction(result.lastAction);
      await syncEntitlementsFromBackend(result.entitlements, {
        force: true,
        reason: 'restore_attempted',
        cachedContract: backendContractCacheRef.current,
        billingState: buildBillingMirrorState(result.entitlements, driver.billing.provider, 'restore'),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'restore_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToFree = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await driver.resetToFree();
      setEntitlements(result.entitlements);
      setLastAction(result.lastAction);
      await syncEntitlementsFromBackend(result.entitlements, {
        force: true,
        reason: 'manual_retry',
        cachedContract: backendContractCacheRef.current,
        billingState: buildBillingMirrorState(result.entitlements, driver.billing.provider, 'reset'),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'reset_to_free_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const preserveLocalPremiumContract = shouldPreserveLocalPremium(driver.billing.provider, entitlements);
  const backendContract = backendContractCache?.contract ?? null;
  const effectiveContract =
    preserveLocalPremiumContract
      ? createLocalEntitlementsFallback(entitlements)
      : backendContract ?? createLocalEntitlementsFallback(entitlements);
  const entitlementsContractState =
    preserveLocalPremiumContract
      ? 'local_premium_mirror'
      : backendContract
        ? entitlementsSyncStatus === 'ready'
          ? 'backend_live'
          : 'backend_cached'
        : 'local_fallback';

  const value = useMemo<MonetizationContextValue>(
    () => ({
      entitlements,
      entitlementsContract: effectiveContract,
      isReady,
      isProcessing,
      lastAction,
      errorMessage,
      entitlementsSyncStatus,
      entitlementsSyncMessage,
      entitlementsContractState,
      entitlementsLastSyncAt:
        effectiveContract.last_sync_at ?? effectiveContract.server_time ?? effectiveContract.updated_at,
      entitlementsContractVersion: effectiveContract.contract_version,
      accessTier: entitlements.tier,
      billingProvider: driver.billing.provider,
      billingStatus: driver.billing.status,
      billingStatusMessage: driver.billing.statusMessage,
      canStartPurchase: driver.billing.canStartPurchase,
      requiresNativeBillingBuild: driver.billing.requiresNativeBuild,
      allowedHistoryWindows: effectiveContract.limits.allowed_history_windows,
      maxTopFlows: effectiveContract.limits.max_top_flows,
      diagnosticsAccess: effectiveContract.limits.diagnostics_access,
      syncEntitlements: async (reason = 'manual_retry') => {
        await syncEntitlementsFromBackend(entitlementsRef.current, {
          force: true,
          reason,
          cachedContract: backendContractCacheRef.current,
        });
      },
      purchasePremium,
      restorePurchases,
      resetToFree,
      hasFeature: (feature) => isFeatureUnlocked(entitlements, feature),
    }),
    [
      driver.billing.canStartPurchase,
      driver.billing.provider,
      driver.billing.requiresNativeBuild,
      driver.billing.status,
      driver.billing.statusMessage,
      effectiveContract,
      entitlements,
      entitlementsContractState,
      entitlementsSyncMessage,
      entitlementsSyncStatus,
      errorMessage,
      isProcessing,
      isReady,
      lastAction,
      syncEntitlementsFromBackend,
    ],
  );

  return <MonetizationContext.Provider value={value}>{children}</MonetizationContext.Provider>;
}

export function useMonetization() {
  const context = useContext(MonetizationContext);

  if (!context) {
    throw new Error('useMonetization must be used inside MonetizationProvider');
  }

  return context;
}
