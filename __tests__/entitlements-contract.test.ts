import {
  activateMockPremium,
  activateRevenueCatPremium,
  createDefaultEntitlements,
} from '@/lib/monetization';
import { buildLocalEntitlementsMirror } from '@/lib/entitlements-contract';

describe('entitlements contract mirror', () => {
  it('maps the free tier into a backend-friendly contract', () => {
    const response = buildLocalEntitlementsMirror(createDefaultEntitlements());

    expect(response.schema_version).toBe('v1');
    expect(response.access_tier).toBe('free');
    expect(response.contract_version).toBe('local-fallback.v1');
    expect(response.sync_status).toBe('unconfigured');
    expect(response.billing_provider).toBe('none');
    expect(response.limits.allowed_history_windows).toEqual(['7d']);
    expect(response.limits.max_top_flows).toBe(1);
    expect(response.limits.diagnostics_access).toBe('preview');
    expect(response.ads.mode).toBe('free_native_only');
  });

  it('maps premium into the richer limits profile', () => {
    const response = buildLocalEntitlementsMirror(activateMockPremium('annual'));

    expect(response.access_tier).toBe('premium');
    expect(response.plan).toBe('annual');
    expect(response.contract_version).toBe('local-premium-mirror.v1');
    expect(response.sync_status).toBe('ok');
    expect(response.billing_provider).toBe('mock');
    expect(response.limits.allowed_history_windows).toEqual(['7d', '30d', '90d']);
    expect(response.limits.max_top_flows).toBe(3);
    expect(response.limits.diagnostics_access).toBe('full');
    expect(response.ads.mode).toBe('none');
  });

  it('maps local RevenueCat premium into a revenuecat-backed mirror contract', () => {
    const response = buildLocalEntitlementsMirror(
      activateRevenueCatPremium('monthly', 'revenuecat_purchase', '2026-03-30T12:00:00Z'),
    );

    expect(response.access_tier).toBe('premium');
    expect(response.plan).toBe('monthly');
    expect(response.source).toBe('revenuecat_mirror');
    expect(response.contract_version).toBe('local-premium-mirror.revenuecat.v1');
    expect(response.billing_provider).toBe('revenuecat');
    expect(response.sync_reason).toBe('local_revenuecat_mirror');
  });
});
