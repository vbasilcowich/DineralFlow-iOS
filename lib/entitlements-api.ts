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
import type { BillingProvider } from '@/lib/billing-config';

const REQUEST_TIMEOUT_MS = 3500;

export type EntitlementsRefreshReason =
  | 'app_foreground'
  | 'manual_retry'
  | 'paywall_opened'
  | 'restore_attempted';

export type BillingMirrorState = {
  access_tier: 'free' | 'premium';
  plan: 'monthly' | 'annual' | null;
  source:
    | 'mock_purchase'
    | 'mock_restore'
    | 'mock_reset'
    | 'revenuecat_purchase'
    | 'revenuecat_restore'
    | 'revenuecat_sync'
    ;
  billing_provider: 'mock' | 'revenuecat';
  purchased_at?: string | null;
  expires_at?: string | null;
};

type JsonRequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  authToken?: string | null;
};

async function fetchJson<T>(
  path: string,
  apiBaseUrl: string,
  options: JsonRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {};

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.authToken) {
      headers.Authorization = `Bearer ${options.authToken}`;
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: 'no-store',
      method: options.method ?? 'GET',
      headers,
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
  authToken: string | null = null,
  apiBaseUrl = getApiBaseUrl(),
): Promise<BackendEntitlementsResponse> {
  return fetchJson<BackendEntitlementsResponse>('/api/mobile/entitlements', apiBaseUrl, {
    authToken,
  });
}

export async function refreshMobileEntitlements(
  reason: EntitlementsRefreshReason,
  authToken: string | null = null,
  apiBaseUrl = getApiBaseUrl(),
  billingState: BillingMirrorState | null = null,
): Promise<BackendEntitlementsResponse> {
  try {
    return await fetchJson<BackendEntitlementsResponse>('/api/mobile/entitlements/refresh', apiBaseUrl, {
      method: 'POST',
      body: {
        reason,
        billing_state: billingState,
      },
      authToken,
    });
  } catch {
    return fetchMobileEntitlements(authToken, apiBaseUrl);
  }
}

export async function fetchMobilePaywall(
  feature: EntitlementFeature | null,
  authToken: string | null = null,
  apiBaseUrl = getApiBaseUrl(),
): Promise<BackendPaywallResponse> {
  const query = feature ? `?feature=${feature}` : '';
  return fetchJson<BackendPaywallResponse>(`/api/mobile/paywall${query}`, apiBaseUrl, {
    authToken,
  });
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

export function createBillingMirrorState(
  entitlements: EntitlementsSnapshot,
  billingProvider: BillingProvider,
): BillingMirrorState | null {
  if (entitlements.tier === 'premium') {
    if (entitlements.source === 'mock_purchase' || entitlements.source === 'mock_restore') {
      return {
        access_tier: 'premium',
        plan: entitlements.plan,
        source: entitlements.source,
        billing_provider: 'mock',
        purchased_at: entitlements.updatedAt,
        expires_at: null,
      };
    }

    if (
      entitlements.source === 'revenuecat_purchase' ||
      entitlements.source === 'revenuecat_restore' ||
      entitlements.source === 'revenuecat_sync'
    ) {
      return {
        access_tier: 'premium',
        plan: entitlements.plan,
        source: entitlements.source,
        billing_provider: 'revenuecat',
        purchased_at: entitlements.updatedAt,
        expires_at: null,
      };
    }
  }

  if (billingProvider === 'mock') {
    return {
      access_tier: 'free',
      plan: null,
      source: 'mock_reset',
      billing_provider: 'mock',
      purchased_at: null,
      expires_at: null,
    };
  }

  if (billingProvider === 'revenuecat') {
    return {
      access_tier: 'free',
      plan: null,
      source: 'revenuecat_sync',
      billing_provider: 'revenuecat',
      purchased_at: null,
      expires_at: null,
    };
  }

  return null;
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
      terms_url: '/legal/terms',
      privacy_url: '/legal/privacy',
      data_sources_url: '/legal/sources',
      financial_disclaimer_url: '/legal/disclaimer',
    },
  };
}

export function createLocalEntitlementsFallback(
  entitlements: EntitlementsSnapshot,
): BackendEntitlementsResponse {
  return buildLocalEntitlementsMirror(entitlements);
}
