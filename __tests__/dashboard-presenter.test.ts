import {
  formatBucketLabel,
  formatCoverage,
  formatFreshness,
  formatSourceMode,
  getConfiguredProviders,
  getSourceModeTone,
} from '@/lib/dashboard-presenter';

describe('dashboard presenter helpers', () => {
  it('formats known basket labels in plain language', () => {
    expect(formatBucketLabel('risk_on')).toBe('Equities');
    expect(formatBucketLabel('energy_complex')).toBe('Energy');
  });

  it('normalizes coverage values from fractions to percentages', () => {
    expect(formatCoverage(0.8958)).toBe('89.6%');
    expect(formatCoverage(72.4)).toBe('72.4%');
  });

  it('maps source mode labels and tones', () => {
    expect(formatSourceMode('live')).toBe('Live data');
    expect(getSourceModeTone('live')).toBe('success');
    expect(getSourceModeTone('partial_live')).toBe('warning');
    expect(getSourceModeTone('unavailable')).toBe('danger');
  });

  it('formats freshness in a readable short form', () => {
    expect(formatFreshness(42)).toBe('42s ago');
    expect(formatFreshness(360)).toBe('6m ago');
  });

  it('deduplicates configured providers from health metadata', () => {
    expect(
      getConfiguredProviders({
        status: 'ok',
        app_name: 'Market Flow API',
        environment: 'local',
        enabled_market_providers: ['twelve_data', 'twelve_data'],
        enabled_macro_providers: ['fred'],
        available_jobs: ['market_pull'],
      }),
    ).toEqual(['twelve_data', 'fred']);
  });
});
