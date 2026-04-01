import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearEntitlementsContractCache,
  isCachedBackendContractStale,
  readEntitlementsContractCache,
  writeEntitlementsContractCache,
} from '@/lib/entitlements-contract-cache';
import type { BackendEntitlementsResponse } from '@/lib/entitlements-contract';
import type { HistoryWindow } from '@/lib/monetization';

function createBackendContract(
  overrides: Partial<BackendEntitlementsResponse> = {},
): BackendEntitlementsResponse {
  const nowIso = new Date(Date.now()).toISOString();

  return {
    schema_version: 'v1' as const,
    access_tier: 'free' as const,
    plan: null,
    source: 'fallback' as const,
    updated_at: nowIso,
    expires_at: null,
    server_time: nowIso,
    stale_after_seconds: 900,
    contract_version: 'contract.v1',
    paywall_revision: 'paywall.v1',
    sync_status: 'ok' as const,
    last_sync_at: nowIso,
    sync_reason: 'manual_retry',
    billing_provider: 'none' as const,
    features: {
      main_snapshot: true,
      selected_baskets: true,
      short_history: true,
      provenance: true,
      deeper_drilldowns: false,
      long_history: false,
      confidence_breakdown: false,
      watchlists: false,
      alerts: false,
      ad_free: false,
    },
    limits: {
      allowed_history_windows: ['7d'] as HistoryWindow[],
      max_top_flows: 1,
      diagnostics_access: 'preview' as const,
    },
    ads: {
      enabled: false,
      mode: 'none' as const,
    },
    ...overrides,
  };
}

describe('entitlements contract cache', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
    await clearEntitlementsContractCache();
  });

  it('writes and reads a cached backend contract separately from local entitlements', async () => {
    const cached = await writeEntitlementsContractCache(createBackendContract(), Date.parse('2026-03-30T09:00:00Z'));

    expect(cached.cached_at).toBe('2026-03-30T09:00:00.000Z');
    expect(cached.freshness).toBe('fresh');

    const restored = await readEntitlementsContractCache(Date.parse('2026-03-30T09:01:00Z'));

    expect(restored).not.toBeNull();
    expect(restored?.contract.contract_version).toBe('contract.v1');
    expect(restored?.freshness).toBe('fresh');
  });

  it('marks the cached contract stale when backend metadata is expired', async () => {
    const staleContract = createBackendContract({
      last_sync_at: '2026-03-30T08:00:00Z',
      server_time: '2026-03-30T08:00:00Z',
      stale_after_seconds: 60,
    });

    const cached = await writeEntitlementsContractCache(staleContract, Date.parse('2026-03-30T08:01:01Z'));
    const restored = await readEntitlementsContractCache(Date.parse('2026-03-30T08:02:30Z'));

    expect(isCachedBackendContractStale(cached, Date.parse('2026-03-30T08:02:30Z'))).toBe(true);
    expect(restored?.freshness).toBe('stale');
  });
});
