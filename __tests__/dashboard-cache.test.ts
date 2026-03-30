import {
  parseDashboardPreviewCache,
  serializeDashboardPreviewCache,
  type DashboardPreviewCacheRecord,
} from '@/lib/dashboard-cache';

const sampleRecord: DashboardPreviewCacheRecord = {
  version: 1,
  savedAt: '2026-03-30T10:00:00.000Z',
  apiBaseUrl: 'http://127.0.0.1:8000',
  snapshot: {
    as_of: '2026-03-30T00:00:00+00:00',
    source_mode: 'live',
    effective_providers: ['fred', 'twelve_data'],
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
  },
  health: {
    status: 'ok',
    app_name: 'Market Flow API',
    environment: 'local',
    enabled_market_providers: ['twelve_data'],
    enabled_macro_providers: ['fred'],
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
