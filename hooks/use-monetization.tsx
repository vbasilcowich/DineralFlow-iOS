import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  activateMockPremium,
  createDefaultEntitlements,
  isFeatureUnlocked,
  resetToFreeEntitlements,
  restoreFromSnapshot,
  type AccessTier,
  type EntitlementFeature,
  type EntitlementsSnapshot,
  type SubscriptionPlan,
} from '@/lib/monetization';
import {
  clearEntitlementsCache,
  readEntitlementsCache,
  writeEntitlementsCache,
} from '@/lib/monetization-cache';

type MonetizationContextValue = {
  entitlements: EntitlementsSnapshot;
  isReady: boolean;
  isProcessing: boolean;
  lastAction: string | null;
  errorMessage: string | null;
  accessTier: AccessTier;
  purchaseMockPremium: (plan: Exclude<SubscriptionPlan, null>) => Promise<void>;
  restorePurchases: () => Promise<void>;
  resetToFree: () => Promise<void>;
  hasFeature: (feature: EntitlementFeature) => boolean;
};

const MonetizationContext = createContext<MonetizationContextValue | null>(null);

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [entitlements, setEntitlements] = useState<EntitlementsSnapshot>(createDefaultEntitlements());
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const cached = await readEntitlementsCache();

      if (!mounted) {
        return;
      }

      if (cached) {
        setEntitlements(cached);
        setLastAction('Loaded cached entitlement state');
      }

      setIsReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const purchaseMockPremium = async (plan: Exclude<SubscriptionPlan, null>) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const nextEntitlements = activateMockPremium(plan);
      await writeEntitlementsCache(nextEntitlements);
      setEntitlements(nextEntitlements);
      setLastAction(`Mock premium activated (${plan})`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'mock_purchase_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const restorePurchases = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const cached = await readEntitlementsCache();
      const restored = restoreFromSnapshot(cached);
      await writeEntitlementsCache(restored);
      setEntitlements(restored);
      setLastAction(cached ? 'Restored cached purchases' : 'No purchases to restore');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'mock_restore_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToFree = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const nextEntitlements = resetToFreeEntitlements();
      await clearEntitlementsCache();
      await writeEntitlementsCache(nextEntitlements);
      setEntitlements(nextEntitlements);
      setLastAction('Reset to free tier');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'reset_to_free_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const value = useMemo<MonetizationContextValue>(
    () => ({
      entitlements,
      isReady,
      isProcessing,
      lastAction,
      errorMessage,
      accessTier: entitlements.tier,
      purchaseMockPremium,
      restorePurchases,
      resetToFree,
      hasFeature: (feature) => isFeatureUnlocked(entitlements, feature),
    }),
    [entitlements, errorMessage, isProcessing, isReady, lastAction],
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
