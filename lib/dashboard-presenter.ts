import type { DashboardHealth } from '@/lib/dashboard-api';

const BUCKET_LABELS: Record<string, string> = {
  risk_on: 'Equities',
  safe_haven: 'Safe assets',
  usd_liquidity: 'US dollar cash',
  inflation_hedge: 'Inflation hedges',
  emerging_markets: 'Emerging markets',
  energy_complex: 'Energy',
};

const SOURCE_MODE_LABELS: Record<string, string> = {
  live: 'Live data',
  partial_live: 'Partial live data',
  unavailable: 'Unavailable',
};

export type StatusTone = 'success' | 'warning' | 'danger';

export function formatBucketLabel(bucketKey: string): string {
  return BUCKET_LABELS[bucketKey] ?? bucketKey.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatSourceMode(sourceMode: string): string {
  return SOURCE_MODE_LABELS[sourceMode] ?? sourceMode.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getSourceModeTone(sourceMode: string): StatusTone {
  if (sourceMode === 'live') {
    return 'success';
  }

  if (sourceMode === 'partial_live') {
    return 'warning';
  }

  return 'danger';
}

export function formatConfidence(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCoverage(value: number): string {
  const normalizedValue = value <= 1 ? value * 100 : value;
  return `${normalizedValue.toFixed(1)}%`;
}

export function formatFlowScore(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}`;
}

export function formatFreshness(secondsSinceRefresh: number): string {
  if (secondsSinceRefresh < 60) {
    return `${secondsSinceRefresh}s ago`;
  }

  const minutes = Math.round(secondsSinceRefresh / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = (minutes / 60).toFixed(1);
  return `${hours}h ago`;
}

export function formatProviderName(providerKey: string): string {
  const providerMap: Record<string, string> = {
    alpha_vantage: 'Alpha Vantage',
    twelve_data: 'Twelve Data',
    fred: 'FRED',
    ecb: 'ECB',
    world_bank: 'World Bank',
    eia: 'EIA',
  };

  return providerMap[providerKey] ?? providerKey.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getConfiguredProviders(health: DashboardHealth | null): string[] {
  if (!health) {
    return [];
  }

  return [...new Set([...health.enabled_market_providers, ...health.enabled_macro_providers])];
}

export function formatLoadError(errorMessage: string | null): string {
  if (!errorMessage) {
    return 'Unable to reach the local API.';
  }

  if (errorMessage === 'http_404') {
    return 'The local API is reachable, but the expected endpoint was not found.';
  }

  if (errorMessage === 'http_500') {
    return 'The local API responded with an internal error.';
  }

  if (errorMessage === 'signal_aborted') {
    return 'The local API did not respond before the request timeout.';
  }

  if (errorMessage === 'Failed to fetch' || errorMessage === 'Network request failed') {
    return 'The browser could not complete the request to the local API.';
  }

  return 'The local API could not be reached from this app load.';
}
