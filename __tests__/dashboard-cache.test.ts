import {
  parseDashboardPreviewCache,
  serializeDashboardPreviewCache,
  type DashboardPreviewCacheRecord,
} from '@/lib/dashboard-cache';

const sampleRecord: DashboardPreviewCacheRecord = {
  version: 2,
  savedAt: '2026-03-30T10:00:00.000Z',
  apiBaseUrl: 'http://127.0.0.1:8000',
  viewerKey: 'backend:test@example.com',
  snapshot: {
    as_of: '2026-03-30T00:00:00+00:00',
    source_mode: 'partial_live',
    effective_providers: ['fred', 'eia'],
    headline: 'Energy leadership remains in focus',
    global_confidence: 78.2,
    coverage: 0.95,
    data_freshness: {
      status: 'fresh',
      seconds_since_refresh: 120,
    },
    leading_bucket: 'energy_complex',
    bucket_scores: [],
    top_flows: [],
    risks: [],
    provider_issues: [],
    market_brief: {
      version: 'market_brief.public_data.v1',
      title: 'Defensive tone is building',
      summary: 'The latest public-data snapshot leans more cautious than supportive for risk assets.',
      confidence: 71.4,
      updated_at: '2026-03-30T00:00:00+00:00',
      mode: 'deterministic',
      source_mode: 'live',
      bullets: ['High-yield spreads widened, which adds defensive pressure.'],
      evidence: [
        {
          signal_key: 'macro_us_credit_spread_hy',
          label: 'High-yield spreads',
          provider_key: 'fred',
          provider_label: 'FRED',
          latest_value: 3.8,
          previous_value: 3.6,
          delta_value: 0.2,
          delta_text: '+0.20 pts',
          summary: 'High-yield spreads widened, which adds defensive pressure.',
          supports_theme: 0.4,
          last_update_at: '2026-03-30T00:00:00+00:00',
        },
      ],
      source_labels: ['FRED'],
      disclaimer: 'Informational analysis based on the latest stored public-data snapshot. Not investment advice.',
    },
  },
  health: {
    status: 'ok',
    app_name: 'Market Flow API',
    environment: 'local',
    enabled_market_providers: [],
    enabled_macro_providers: ['fred', 'eia'],
    available_jobs: ['market_pull'],
  },
};

describe('dashboard cache serialization', () => {
  it('round-trips a valid cache record', () => {
    const rawValue = serializeDashboardPreviewCache(sampleRecord);
    expect(parseDashboardPreviewCache(rawValue)).toEqual(sampleRecord);
  });

  it('rejects cache records with the wrong version', () => {
    const rawValue = JSON.stringify({
      ...sampleRecord,
      version: 99,
    });

    expect(parseDashboardPreviewCache(rawValue)).toBeNull();
  });

  it('rejects malformed payloads', () => {
    expect(parseDashboardPreviewCache('not_json')).toBeNull();
    expect(parseDashboardPreviewCache(JSON.stringify({ nope: true }))).toBeNull();
  });
});
