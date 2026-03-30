import {
  activateMockPremium,
  createDefaultEntitlements,
  isFeatureUnlocked,
  resetToFreeEntitlements,
  restoreFromSnapshot,
} from '@/lib/monetization';
import {
  clearEntitlementsCache,
  readEntitlementsCache,
  writeEntitlementsCache,
} from '@/lib/monetization-cache';

describe('monetization core', () => {
  beforeEach(async () => {
    await clearEntitlementsCache();
  });

  it('starts in the free tier with premium features locked', () => {
    const entitlements = createDefaultEntitlements();

    expect(entitlements.tier).toBe('free');
    expect(isFeatureUnlocked(entitlements, 'main_snapshot')).toBe(true);
    expect(isFeatureUnlocked(entitlements, 'long_history')).toBe(false);
    expect(isFeatureUnlocked(entitlements, 'watchlists')).toBe(false);
  });

  it('activates premium features in the mock purchase flow', () => {
    const entitlements = activateMockPremium('monthly');

    expect(entitlements.tier).toBe('premium');
    expect(entitlements.plan).toBe('monthly');
    expect(isFeatureUnlocked(entitlements, 'deeper_drilldowns')).toBe(true);
    expect(isFeatureUnlocked(entitlements, 'ad_free')).toBe(true);
  });

  it('restores from an existing snapshot and falls back to free otherwise', () => {
    const premiumSnapshot = activateMockPremium('annual');
    const restoredPremium = restoreFromSnapshot(premiumSnapshot);
    const restoredFree = restoreFromSnapshot(null);

    expect(restoredPremium.tier).toBe('premium');
    expect(restoredPremium.source).toBe('mock_restore');
    expect(restoredFree.tier).toBe('free');
  });

  it('writes and reads the entitlement cache', async () => {
    const entitlements = activateMockPremium('monthly');

    await writeEntitlementsCache(entitlements);
    const cached = await readEntitlementsCache();

    expect(cached).toEqual(entitlements);
  });

  it('can reset back to the free tier state', () => {
    const entitlements = resetToFreeEntitlements();

    expect(entitlements.tier).toBe('free');
    expect(entitlements.plan).toBeNull();
    expect(isFeatureUnlocked(entitlements, 'ad_free')).toBe(false);
  });
});
