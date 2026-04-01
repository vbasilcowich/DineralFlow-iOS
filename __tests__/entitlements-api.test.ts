import { activateMockPremium, createDefaultEntitlements } from '@/lib/monetization';
import {
  createLocalEntitlementsFallback,
  createLocalPaywallFallback,
  getEntitlementsSyncErrorMessage,
  normalizeBackendEntitlements,
} from '@/lib/entitlements-api';

describe('entitlements api helpers', () => {
  it('normalizes backend entitlements into the local snapshot shape', () => {
    const snapshot = normalizeBackendEntitlements({
      schema_version: 'v1',
      access_tier: 'free',
      plan: null,
      source: 'fallback',
      updated_at: '2026-03-30T08:00:00Z',
      expires_at: null,
      server_time: '2026-03-30T08:05:00Z',
      stale_after_seconds: 900,
      contract_version: 'contract.v1',
      paywall_revision: 'paywall.v1',
      sync_status: 'ok',
      last_sync_at: '2026-03-30T08:05:00Z',
      sync_reason: 'manual_retry',
      billing_provider: 'none',
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
        allowed_history_windows: ['7d'],
        max_top_flows: 1,
        diagnostics_access: 'preview',
      },
      ads: {
        enabled: false,
        mode: 'none',
      },
    });

    expect(snapshot.tier).toBe('free');
    expect(snapshot.source).toBe('backend_sync');
    expect(snapshot.features.long_history).toBe(false);
  });

  it('builds a local entitlements fallback from the current snapshot', () => {
    const fallback = createLocalEntitlementsFallback(activateMockPremium('annual'));

    expect(fallback.access_tier).toBe('premium');
    expect(fallback.limits.allowed_history_windows).toEqual(['7d', '30d', '90d']);
    expect(fallback.ads.mode).toBe('none');
  });

  it('builds a local paywall fallback with contextual feature copy', () => {
    const config = createLocalPaywallFallback('long_history', createDefaultEntitlements());

    expect(config.default_feature).toBe('long_history');
    expect(config.headline).toBe('Longer history unlocks the full snapshot arc.');
    expect(config.highlights.length).toBeGreaterThan(0);
  });

  it('normalizes sync errors into a stable label', () => {
    expect(getEntitlementsSyncErrorMessage(new Error('network_down'))).toBe('network_down');
    expect(getEntitlementsSyncErrorMessage('opaque')).toBe('entitlements_sync_failed');
  });
});
