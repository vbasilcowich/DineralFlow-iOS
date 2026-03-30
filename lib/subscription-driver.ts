import {
  activateMockPremium,
  createDefaultEntitlements,
  resetToFreeEntitlements,
  restoreFromSnapshot,
  type EntitlementsSnapshot,
  type SubscriptionPlan,
} from '@/lib/monetization';
import { resolveBillingState, type BillingState } from '@/lib/billing-config';

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

export function createMockSubscriptionDriver(cache: CacheAdapter): SubscriptionDriver {
  return {
    billing: resolveBillingState({
      provider: 'mock',
      platform: 'web',
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

export function createSubscriptionDriver(
  cache: CacheAdapter,
  billing = resolveBillingState(),
): SubscriptionDriver {
  if (billing.provider === 'mock') {
    return createMockSubscriptionDriver(cache);
  }

  return createRevenueCatStubDriver(cache, billing);
}

export function createFallbackSubscriptionState(): EntitlementsSnapshot {
  return createDefaultEntitlements();
}
