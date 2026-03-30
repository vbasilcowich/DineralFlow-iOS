import {
  activateMockPremium,
  createDefaultEntitlements,
  type EntitlementsSnapshot,
} from '@/lib/monetization';
import { createFallbackSubscriptionState, createMockSubscriptionDriver, createSubscriptionDriver } from '@/lib/subscription-driver';
import Purchases from 'react-native-purchases';

function createMemoryCache(initialSnapshot: EntitlementsSnapshot | null = null) {
  let value = initialSnapshot;

  return {
    read: jest.fn(async () => value),
    write: jest.fn(async (snapshot: EntitlementsSnapshot) => {
      value = snapshot;
    }),
    clear: jest.fn(async () => {
      value = null;
    }),
    getCurrentValue: () => value,
  };
}

describe('subscription driver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hydrates from cache when a previous entitlement exists', async () => {
    const cache = createMemoryCache(activateMockPremium('annual'));
    const driver = createMockSubscriptionDriver(cache);

    await expect(driver.hydrate()).resolves.toEqual({
      entitlements: expect.objectContaining({ tier: 'premium', plan: 'annual' }),
      lastAction: 'Loaded cached entitlement state',
    });
  });

  it('returns a null entitlement state when no cache exists', async () => {
    const cache = createMemoryCache(null);
    const driver = createMockSubscriptionDriver(cache);

    await expect(driver.hydrate()).resolves.toEqual({
      entitlements: null,
      lastAction: null,
    });
  });

  it('writes premium state on mock purchase', async () => {
    const cache = createMemoryCache(null);
    const driver = createMockSubscriptionDriver(cache);

    const result = await driver.purchasePremium('monthly');

    expect(result.entitlements.tier).toBe('premium');
    expect(result.entitlements.plan).toBe('monthly');
    expect(cache.getCurrentValue()).toEqual(result.entitlements);
  });

  it('restores from cache when previous premium exists', async () => {
    const cache = createMemoryCache(activateMockPremium('monthly'));
    const driver = createMockSubscriptionDriver(cache);

    const result = await driver.restorePurchases();

    expect(result.entitlements.tier).toBe('premium');
    expect(result.entitlements.source).toBe('mock_restore');
    expect(result.lastAction).toBe('Restored cached purchases');
  });

  it('falls back to free state when restoring without prior purchase', async () => {
    const cache = createMemoryCache(null);
    const driver = createMockSubscriptionDriver(cache);

    const result = await driver.restorePurchases();

    expect(result.entitlements).toEqual(
      expect.objectContaining({
        tier: 'free',
        plan: null,
        source: 'default',
        features: createDefaultEntitlements().features,
      }),
    );
    expect(result.lastAction).toBe('No purchases to restore');
  });

  it('resets to free and clears cache', async () => {
    const cache = createMemoryCache(activateMockPremium('annual'));
    const driver = createMockSubscriptionDriver(cache);

    const result = await driver.resetToFree();

    expect(result.entitlements.tier).toBe('free');
    expect(cache.clear).toHaveBeenCalledTimes(1);
    expect(cache.getCurrentValue()).toEqual(result.entitlements);
  });

  it('provides a free fallback state for bootstrapping', () => {
    expect(createFallbackSubscriptionState()).toEqual(createDefaultEntitlements());
  });

  it('uses RevenueCat purchases when the billing mode is ready on native', async () => {
    const cache = createMemoryCache(null);
    const mockPurchases = Purchases as unknown as {
      isConfigured: jest.Mock;
      getOfferings: jest.Mock;
      purchasePackage: jest.Mock;
    };

    mockPurchases.isConfigured.mockResolvedValue(true);
    mockPurchases.getOfferings.mockResolvedValue({
      all: {
        default: {
          monthly: {
            identifier: '$rc_monthly',
            packageType: 'MONTHLY',
            product: { identifier: 'monthly' },
            presentedOfferingContext: { offeringIdentifier: 'default', placementIdentifier: null, targetingContext: null },
          },
        },
      },
      current: null,
    });
    mockPurchases.purchasePackage.mockResolvedValue({
      productIdentifier: 'monthly',
      customerInfo: {
        entitlements: {
          active: {
            premium: {
              identifier: 'premium',
              isActive: true,
              productIdentifier: 'monthly',
            },
          },
          all: {},
          verification: 'NOT_REQUESTED',
        },
        activeSubscriptions: ['monthly'],
        allPurchasedProductIdentifiers: ['monthly'],
        latestExpirationDate: null,
        firstSeen: '2026-03-30T00:00:00Z',
        originalAppUserId: 'anonymous',
        requestDate: '2026-03-30T12:00:00Z',
        allExpirationDates: {},
        allPurchaseDates: {},
        originalApplicationVersion: null,
        originalPurchaseDate: null,
        managementURL: null,
        nonSubscriptionTransactions: [],
        subscriptionsByProductIdentifier: {},
      },
    });

    const driver = createSubscriptionDriver(
      cache,
      {
        provider: 'revenuecat',
        platform: 'ios',
        executionEnvironment: 'standalone',
        revenueCatApiKeyIos: 'test_public_key',
        revenueCatEntitlementId: 'premium',
        revenueCatOfferingId: 'default',
      },
    );

    const result = await driver.purchasePremium('monthly');

    expect(result.entitlements.tier).toBe('premium');
    expect(result.entitlements.plan).toBe('monthly');
    expect(result.entitlements.source).toBe('revenuecat_purchase');
    expect(cache.getCurrentValue()).toEqual(result.entitlements);
  });

  it('restores RevenueCat purchases into the premium state when the entitlement is active', async () => {
    const cache = createMemoryCache(null);
    const mockPurchases = Purchases as unknown as {
      isConfigured: jest.Mock;
      restorePurchases: jest.Mock;
    };

    mockPurchases.isConfigured.mockResolvedValue(true);
    mockPurchases.restorePurchases.mockResolvedValue({
      entitlements: {
        active: {
          premium: {
            identifier: 'premium',
            isActive: true,
            productIdentifier: 'yearly',
          },
        },
        all: {},
        verification: 'NOT_REQUESTED',
      },
      activeSubscriptions: ['yearly'],
      allPurchasedProductIdentifiers: ['yearly'],
      latestExpirationDate: null,
      firstSeen: '2026-03-30T00:00:00Z',
      originalAppUserId: 'anonymous',
      requestDate: '2026-03-30T12:30:00Z',
      allExpirationDates: {},
      allPurchaseDates: {},
      originalApplicationVersion: null,
      originalPurchaseDate: null,
      managementURL: null,
      nonSubscriptionTransactions: [],
      subscriptionsByProductIdentifier: {},
    });

    const driver = createSubscriptionDriver(
      cache,
      {
        provider: 'revenuecat',
        platform: 'ios',
        executionEnvironment: 'standalone',
        revenueCatApiKeyIos: 'test_public_key',
        revenueCatEntitlementId: 'premium',
        revenueCatOfferingId: 'default',
      },
    );

    const result = await driver.restorePurchases();

    expect(result.entitlements.tier).toBe('premium');
    expect(result.entitlements.plan).toBe('annual');
    expect(result.entitlements.source).toBe('revenuecat_restore');
  });
});
