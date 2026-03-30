import {
  canAccessHistoryWindow,
  type EntitlementFeature,
  type EntitlementsSnapshot,
  type HistoryWindow,
} from '@/lib/monetization';

export type BackendEntitlementsSource = 'backend' | 'revenuecat_mirror' | 'fallback';
export type BackendEntitlementsSyncStatus = 'ok' | 'stale' | 'error' | 'unconfigured';
export type BackendBillingProvider = 'none' | 'mock' | 'revenuecat';

export type BackendEntitlementsResponse = {
  schema_version: 'v1';
  access_tier: 'free' | 'premium';
  plan: 'monthly' | 'annual' | null;
  source: BackendEntitlementsSource;
  updated_at: string;
  expires_at: string | null;
  server_time: string;
  stale_after_seconds: number;
  contract_version: string;
  paywall_revision: string;
  sync_status: BackendEntitlementsSyncStatus;
  last_sync_at: string | null;
  sync_reason: string | null;
  billing_provider: BackendBillingProvider;
  features: Record<EntitlementFeature, boolean>;
  limits: {
    allowed_history_windows: HistoryWindow[];
    max_top_flows: number;
    diagnostics_access: 'preview' | 'full';
  };
  ads: {
    enabled: boolean;
    mode: 'none' | 'free_native_only';
  };
};

export type BackendPaywallResponse = {
  schema_version: 'v1';
  offering_id: string;
  entitlement_id: string;
  default_feature: EntitlementFeature | null;
  default_plan: 'monthly' | 'annual';
  headline: string;
  body: string;
  highlights: string[];
  legal_links: {
    terms_url: string;
    privacy_url: string;
  };
};

const LOCAL_STALE_AFTER_SECONDS = 15 * 60;

function createLocalTimestamp(): string {
  return new Date().toISOString();
}

function isLocalPremiumMirrorSource(source: EntitlementsSnapshot['source']): boolean {
  return (
    source === 'mock_purchase' ||
    source === 'mock_restore' ||
    source === 'revenuecat_purchase' ||
    source === 'revenuecat_restore' ||
    source === 'revenuecat_sync'
  );
}

function parseBackendTimestamp(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isBackendContractStale(
  contract: BackendEntitlementsResponse,
  now = Date.now(),
): boolean {
  if (contract.sync_status === 'stale') {
    return true;
  }

  const anchor =
    parseBackendTimestamp(contract.last_sync_at) ??
    parseBackendTimestamp(contract.server_time) ??
    parseBackendTimestamp(contract.updated_at);

  if (anchor === null) {
    return true;
  }

  return now - anchor >= contract.stale_after_seconds * 1000;
}

export function buildLocalEntitlementsMirror(
  entitlements: EntitlementsSnapshot,
): BackendEntitlementsResponse {
  const allowedHistoryWindows: HistoryWindow[] = ['7d', '30d', '90d'].filter((window) =>
    canAccessHistoryWindow(entitlements, window as HistoryWindow),
  ) as HistoryWindow[];
  const timestamp = createLocalTimestamp();
  const localPremium = isLocalPremiumMirrorSource(entitlements.source);
  const revenueCatMirror =
    entitlements.source === 'revenuecat_purchase' ||
    entitlements.source === 'revenuecat_restore' ||
    entitlements.source === 'revenuecat_sync';
  const source: BackendEntitlementsSource =
    entitlements.source === 'backend_sync'
      ? 'backend'
      : localPremium
        ? 'revenuecat_mirror'
        : 'fallback';

  return {
    schema_version: 'v1',
    access_tier: entitlements.tier,
    plan: entitlements.plan,
    source,
    updated_at: entitlements.updatedAt,
    expires_at: null,
    server_time: timestamp,
    stale_after_seconds: LOCAL_STALE_AFTER_SECONDS,
    contract_version: localPremium
      ? revenueCatMirror
        ? 'local-premium-mirror.revenuecat.v1'
        : 'local-premium-mirror.v1'
      : 'local-fallback.v1',
    paywall_revision: 'paywall.local.v1',
    sync_status: localPremium ? 'ok' : 'unconfigured',
    last_sync_at: localPremium ? timestamp : null,
    sync_reason: localPremium
      ? revenueCatMirror
        ? 'local_revenuecat_mirror'
        : 'local_mirror'
      : 'local_fallback',
    billing_provider: localPremium ? (revenueCatMirror ? 'revenuecat' : 'mock') : 'none',
    features: entitlements.features,
    limits: {
      allowed_history_windows: allowedHistoryWindows,
      max_top_flows: entitlements.tier === 'premium' ? 3 : 1,
      diagnostics_access: entitlements.tier === 'premium' ? 'full' : 'preview',
    },
    ads: {
      enabled: !entitlements.features.ad_free,
      mode: entitlements.features.ad_free ? 'none' : 'free_native_only',
    },
  };
}
