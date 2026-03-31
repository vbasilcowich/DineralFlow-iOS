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

export type HistoryWindow = '7d' | '30d' | '90d';

export type ProviderIssue = {
  provider_key: string;
  severity: string;
  message: string;
};

export type MarketBriefEvidence = {
  signal_key: string;
  label: string;
  provider_key: string;
  provider_label: string;
  latest_value: number | null;
  previous_value: number | null;
  delta_value: number | null;
  delta_text: string;
  summary: string;
  supports_theme: number;
  last_update_at: string;
};

export type MarketBrief = {
  title: string;
  summary: string;
  confidence: number;
  updated_at: string;
  mode: string;
  source_mode: string;
  bullets: string[];
  evidence: MarketBriefEvidence[];
  source_labels: string[];
  disclaimer: string;
};

export type BucketScore = {
  bucket_key: string;
  score: number;
  confidence: number;
};

export type DashboardHistoryPoint = {
  timestamp: string;
  headline: string;
  global_confidence: number;
  leading_bucket: string;
  leading_score: number;
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
  market_brief: MarketBrief;
};

export type DashboardHistoryResponse = {
  window: HistoryWindow;
  points: DashboardHistoryPoint[];
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

export async function fetchDashboardHistory(
  window: HistoryWindow,
  apiBaseUrl = getApiBaseUrl(),
): Promise<DashboardHistoryResponse> {
  return fetchJson<DashboardHistoryResponse>(`/api/dashboard/history?window=${window}`, apiBaseUrl);
}
