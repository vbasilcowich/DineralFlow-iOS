import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  isFeatureUnlocked,
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
import { createFallbackSubscriptionState, createMockSubscriptionDriver } from '@/lib/subscription-driver';

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
  const driver = useMemo(
    () =>
      createMockSubscriptionDriver({
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

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const result = await driver.hydrate();

      if (!mounted) {
        return;
      }

      if (result.entitlements) {
        setEntitlements(result.entitlements);
      }

      setLastAction(result.lastAction);
      setIsReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [driver]);

  const purchaseMockPremium = async (plan: Exclude<SubscriptionPlan, null>) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await driver.purchasePremium(plan);
      setEntitlements(result.entitlements);
      setLastAction(result.lastAction);
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
      const result = await driver.restorePurchases();
      setEntitlements(result.entitlements);
      setLastAction(result.lastAction);
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
      const result = await driver.resetToFree();
      setEntitlements(result.entitlements);
      setLastAction(result.lastAction);
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
