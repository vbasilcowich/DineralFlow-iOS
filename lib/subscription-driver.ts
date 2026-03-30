import {
  activateMockPremium,
  createDefaultEntitlements,
  resetToFreeEntitlements,
  restoreFromSnapshot,
  type EntitlementsSnapshot,
  type SubscriptionPlan,
} from '@/lib/monetization';
import { getBillingConfig, resolveBillingState, type BillingConfig, type BillingState } from '@/lib/billing-config';
import {
  hydrateRevenueCatState,
  purchaseRevenueCatPlan,
  restoreRevenueCatState,
} from '@/lib/revenuecat-client';

export type SubscriptionDriver = {
  billing: BillingState;
  hydrate: () => Promise<{ entitlements: EntitlementsSnapshot | null; lastAction: string | null }>;
  purchasePremium: (plan: Exclude<SubscriptionPlan, null>) => Promise<{
    entitlements: EntitlementsSnapshot;
    lastAction: string;
  }>;
  restorePurchases: () => Promise<{
    entitlements: EntitlementsSnapshot;
    lastAction: string;
  }>;
  resetToFree: () => Promise<{
    entitlements: EntitlementsSnapshot;
    lastAction: string;
  }>;
};

type CacheAdapter = {
  read: () => Promise<EntitlementsSnapshot | null>;
  write: (snapshot: EntitlementsSnapshot) => Promise<void>;
  clear: () => Promise<void>;
};

type DriverResult = {
  entitlements: EntitlementsSnapshot | null;
  lastAction: string | null;
};

type PurchaseDriverResult = {
  entitlements: EntitlementsSnapshot;
  lastAction: string;
};

export function createMockSubscriptionDriver(cache: CacheAdapter): SubscriptionDriver {
  return {
    billing: resolveBillingState({
      provider: 'mock',
      platform: 'web',
      executionEnvironment: 'bare',
      revenueCatApiKeyIos: null,
      revenueCatEntitlementId: null,
      revenueCatOfferingId: null,
    }),
    async hydrate() {
      const cached = await cache.read();

      return {
        entitlements: cached,
        lastAction: cached ? 'Loaded cached entitlement state' : null,
      };
    },

    async purchasePremium(plan) {
      const entitlements = activateMockPremium(plan);
      await cache.write(entitlements);

      return {
        entitlements,
        lastAction: `Mock premium activated (${plan})`,
      };
    },

    async restorePurchases() {
      const cached = await cache.read();
      const entitlements = restoreFromSnapshot(cached);
      await cache.write(entitlements);

      return {
        entitlements,
        lastAction: cached ? 'Restored cached purchases' : 'No purchases to restore',
      };
    },

    async resetToFree() {
      const entitlements = resetToFreeEntitlements();
      await cache.clear();
      await cache.write(entitlements);

      return {
        entitlements,
        lastAction: 'Reset to free tier',
      };
    },
  };
}

export function createRevenueCatStubDriver(cache: CacheAdapter, billing: BillingState): SubscriptionDriver {
  return {
    billing,
    async hydrate() {
      const cached = await cache.read();

      return {
        entitlements: cached,
        lastAction: cached ? 'Loaded cached entitlement state' : null,
      };
    },
    async purchasePremium() {
      throw new Error(billing.status);
    },
    async restorePurchases() {
      const cached = await cache.read();
      const entitlements = restoreFromSnapshot(cached);
      await cache.write(entitlements);

      return {
        entitlements,
        lastAction: cached ? 'Restored cached purchases' : 'No purchases to restore',
      };
    },
    async resetToFree() {
      const entitlements = resetToFreeEntitlements();
      await cache.clear();
      await cache.write(entitlements);

      return {
        entitlements,
        lastAction: 'Reset to free tier',
      };
    },
  };
}

export function createRevenueCatSubscriptionDriver(
  cache: CacheAdapter,
  billingConfig: BillingConfig,
  billing: BillingState,
): SubscriptionDriver {
  async function runHydrationOperation(
    operation: () => Promise<DriverResult>,
    fallbackLastAction: string | null = null,
  ): Promise<DriverResult> {
    try {
      const result = await operation();

      if (result.entitlements) {
        await cache.write(result.entitlements);
      }

      return result;
    } catch (error) {
      const cached = await cache.read();

      if (cached) {
        return {
          entitlements: cached,
          lastAction: fallbackLastAction ?? 'Loaded cached entitlement state after RevenueCat error',
        };
      }

      throw error;
    }
  }

  return {
    billing,
    async hydrate() {
      return runHydrationOperation(
        () => hydrateRevenueCatState(billingConfig),
        'Loaded cached entitlement state after RevenueCat sync failure',
      );
    },
    async purchasePremium(plan) {
      const result = await purchaseRevenueCatPlan(billingConfig, plan);
      await cache.write(result.entitlements);

      return result;
    },
    async restorePurchases() {
      const result = await runHydrationOperation(
        () => restoreRevenueCatState(billingConfig),
        'Loaded cached entitlement state after RevenueCat restore failure',
      );
      const entitlements = result.entitlements ?? resetToFreeEntitlements();

      return {
        entitlements,
        lastAction: result.lastAction ?? 'No active RevenueCat purchases to restore',
      } satisfies PurchaseDriverResult;
    },
    async resetToFree() {
      const entitlements = resetToFreeEntitlements();
      await cache.clear();
      await cache.write(entitlements);

      return {
        entitlements,
        lastAction: 'Cleared local entitlement cache',
      };
    },
  };
}

export function createSubscriptionDriver(
  cache: CacheAdapter,
  billingConfig = getBillingConfig(),
  billing = resolveBillingState(billingConfig),
): SubscriptionDriver {
  if (billing.provider === 'mock') {
    return createMockSubscriptionDriver(cache);
  }

  if (billing.status !== 'ready') {
    return createRevenueCatStubDriver(cache, billing);
  }

  return createRevenueCatSubscriptionDriver(cache, billingConfig, billing);
}

export function createFallbackSubscriptionState(): EntitlementsSnapshot {
  return createDefaultEntitlements();
}
