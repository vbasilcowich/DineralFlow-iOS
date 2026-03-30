import {
  activateMockPremium,
  createDefaultEntitlements,
  type EntitlementsSnapshot,
} from '@/lib/monetization';
import { createFallbackSubscriptionState, createMockSubscriptionDriver } from '@/lib/subscription-driver';

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

    expect(result.entitlements).toEqual(createDefaultEntitlements());
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
});

