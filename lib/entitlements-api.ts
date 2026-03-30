import { getApiBaseUrl } from '@/lib/api-config';
import {
  buildLocalEntitlementsMirror,
  type BackendEntitlementsResponse,
  type BackendPaywallResponse,
} from '@/lib/entitlements-contract';
import {
  buildEntitlements,
  getFeatureDescriptor,
  type EntitlementFeature,
  type EntitlementsSnapshot,
} from '@/lib/monetization';

const REQUEST_TIMEOUT_MS = 3500;

export type EntitlementsRefreshReason =
  | 'app_foreground'
  | 'manual_retry'
  | 'paywall_opened'
  | 'restore_attempted';

type JsonRequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
};

async function fetchJson<T>(
  path: string,
  apiBaseUrl: string,
  options: JsonRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: 'no-store',
      method: options.method ?? 'GET',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`http_${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMobileEntitlements(
  apiBaseUrl = getApiBaseUrl(),
): Promise<BackendEntitlementsResponse> {
  return fetchJson<BackendEntitlementsResponse>('/api/mobile/entitlements', apiBaseUrl);
}

export async function refreshMobileEntitlements(
  reason: EntitlementsRefreshReason,
  apiBaseUrl = getApiBaseUrl(),
): Promise<BackendEntitlementsResponse> {
  try {
    return await fetchJson<BackendEntitlementsResponse>('/api/mobile/entitlements/refresh', apiBaseUrl, {
      method: 'POST',
      body: { reason },
    });
  } catch {
    return fetchMobileEntitlements(apiBaseUrl);
  }
}

export async function fetchMobilePaywall(
  feature: EntitlementFeature | null,
  apiBaseUrl = getApiBaseUrl(),
): Promise<BackendPaywallResponse> {
  const query = feature ? `?feature=${feature}` : '';
  return fetchJson<BackendPaywallResponse>(`/api/mobile/paywall${query}`, apiBaseUrl);
}

export function normalizeBackendEntitlements(
  response: BackendEntitlementsResponse,
): EntitlementsSnapshot {
  return {
    ...buildEntitlements(
      response.access_tier,
      response.plan,
      'backend_sync',
      response.updated_at,
    ),
    features: response.features,
  };
}

export function getEntitlementsSyncErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'entitlements_sync_failed';
}

export function createLocalPaywallFallback(
  feature: EntitlementFeature | null,
  entitlements: EntitlementsSnapshot,
): BackendPaywallResponse {
  const descriptor = feature ? getFeatureDescriptor(feature) : null;

  return {
    schema_version: 'v1',
    offering_id: 'default',
    entitlement_id: 'premium',
    default_feature: feature,
    default_plan: 'annual',
    headline:
      entitlements.tier === 'premium'
        ? 'Premium is already active in this build.'
        : descriptor?.paywallTitle ?? 'Premium unlocks the deeper workflow.',
    body:
      descriptor?.paywallBody ??
      'Free keeps the core snapshot readable. Premium unlocks longer history, deeper drilldowns, and later alerts without pretending the app is a real-time terminal.',
    highlights: descriptor
      ? [descriptor.premiumValue, descriptor.premiumDetail]
      : [
          '30 and 90-day windows',
          'Deeper basket drilldowns',
          'Alerts later in phase 1',
          'Ad-free experience',
        ],
    legal_links: {
      terms_url: 'https://example.com/terms',
      privacy_url: 'https://example.com/privacy',
    },
  };
}

export function createLocalEntitlementsFallback(
  entitlements: EntitlementsSnapshot,
): BackendEntitlementsResponse {
  return buildLocalEntitlementsMirror(entitlements);
}
