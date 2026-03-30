import { getApiBaseUrl } from '@/lib/api-config';

const REQUEST_TIMEOUT_MS = 3500;

export type DashboardHealth = {
  status: string;
  app_name: string;
  environment: string;
  enabled_market_providers: string[];
  enabled_macro_providers: string[];
  available_jobs: string[];
};

export type DataFreshness = {
  status: string;
  seconds_since_refresh: number;
};

export type TopFlow = {
  bucket_key: string;
  score: number;
  confidence: number;
  drivers: string[];
};

export type ProviderIssue = {
  provider_key: string;
  severity: string;
  message: string;
};

export type BucketScore = {
  bucket_key: string;
  score: number;
  confidence: number;
};

export type DashboardSnapshot = {
  as_of: string;
  source_mode: string;
  effective_providers: string[];
  headline: string;
  global_confidence: number;
  coverage: number;
  data_freshness: DataFreshness;
  leading_bucket: string;
  bucket_scores: BucketScore[];
  top_flows: TopFlow[];
  risks: string[];
  provider_issues: ProviderIssue[];
};

async function fetchJson<T>(path: string, apiBaseUrl: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: 'no-store',
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

export async function fetchDashboardSnapshot(apiBaseUrl = getApiBaseUrl()): Promise<DashboardSnapshot> {
  return fetchJson<DashboardSnapshot>('/api/dashboard/snapshot', apiBaseUrl);
}

export async function fetchDashboardHealth(apiBaseUrl = getApiBaseUrl()): Promise<DashboardHealth> {
  return fetchJson<DashboardHealth>('/health', apiBaseUrl);
}
