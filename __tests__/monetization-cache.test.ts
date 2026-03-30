import { clearEntitlementsCache, readEntitlementsCache, writeEntitlementsCache } from '@/lib/monetization-cache';
import { activateMockPremium } from '@/lib/monetization';

describe('monetization cache', () => {
  it('writes and reads entitlements from storage', async () => {
    const entitlements = activateMockPremium('monthly');

    await writeEntitlementsCache(entitlements);

    await expect(readEntitlementsCache()).resolves.toEqual(entitlements);
  });

  it('clears the stored entitlement state', async () => {
    await writeEntitlementsCache(activateMockPremium('annual'));
    await clearEntitlementsCache();

    await expect(readEntitlementsCache()).resolves.toBeNull();
  });
});
