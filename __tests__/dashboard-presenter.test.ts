import {
  formatBucketLabel,
  formatCoverage,
  formatDriverKey,
  formatFreshnessStatus,
  formatFreshness,
  formatHistorySummary,
  formatProviderIssueMessageLocalized,
  formatProviderIssueSeverity,
  formatRiskTextLocalized,
  formatSourceMode,
  getConfiguredProviders,
  hasRestrictedCommercialProvider,
  getSourceModeTone,
  localizeBriefText,
} from '@/lib/dashboard-presenter';

describe('dashboard presenter helpers', () => {
  it('formats known basket labels in plain language', () => {
    expect(formatBucketLabel('risk_on')).toBe('Equities');
    expect(formatBucketLabel('energy_complex')).toBe('Energy');
    expect(formatBucketLabel('duration')).toBe('Long bonds');
    expect(formatBucketLabel('em_carry')).toBe('Emerging market carry');
  });

  it('normalizes coverage values from fractions to percentages', () => {
    expect(formatCoverage(0.8958)).toBe('89.6%');
    expect(formatCoverage(72.4)).toBe('72.4%');
  });

  it('maps source mode labels and tones', () => {
    expect(formatSourceMode('live')).toBe('Complete snapshot');
    expect(formatSourceMode('partial_live')).toBe('Partial coverage');
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

  it('flags providers that are not part of the intended public-data-first commercial posture', () => {
    expect(hasRestrictedCommercialProvider(['fred', 'eia'])).toBe(false);
    expect(hasRestrictedCommercialProvider(['fred', 'alpha_vantage'])).toBe(true);
    expect(hasRestrictedCommercialProvider(['twelve_data'])).toBe(true);
  });

  it('formats history summaries without depending on backend headline language', () => {
    expect(
      formatHistorySummary({
        timestamp: '2026-03-30T00:00:00Z',
        headline: 'Capital inclinando hacia refugios',
        global_confidence: 79.13,
        leading_bucket: 'safe_haven',
        leading_score: 48.78,
      }),
    ).toBe('Safe assets led this stored snapshot at +48.8 with 79% confidence.');
  });

  it('localizes Cloudflare seed snapshot copy for Spanish UI', () => {
    expect(
      localizeBriefText(
        'Cautious risk-on leadership with public-data constraints',
        'es',
      ),
    ).toBe('Liderazgo risk-on prudente con limitaciones de datos publicos');
    expect(
      localizeBriefText(
        'The latest stored snapshot shows equities leading with moderate confidence while energy contributes a secondary impulse. Treat the read as a scheduled analytical snapshot, not a live trading feed.',
        'es',
      ),
    ).toContain('lectura analitica programada');
    expect(formatDriverKey('credit_spreads', 'es')).toBe('Diferenciales de credito');
    expect(formatFreshnessStatus('fresh', 'es')).toBe('Reciente');
    expect(formatProviderIssueSeverity('warning', 'es')).toBe('Advertencia');
  });

  it('localizes backend risks and provider issues for Spanish UI', () => {
    expect(
      formatRiskTextLocalized(
        'The snapshot is scheduled and should not be read as real-time market coverage.',
        'es',
      ),
    ).toBe('La lectura es programada y no debe leerse como cobertura de mercado en tiempo real.');
    expect(
      formatProviderIssueMessageLocalized(
        {
          provider_key: 'market_data',
          severity: 'warning',
          message: 'The zero-cost backend is serving stored derived snapshots, not paid live quote feeds.',
        },
        'es',
      ),
    ).toBe('El backend de coste cero sirve lecturas derivadas guardadas, no canales de cotizaciones de pago en vivo.');
  });
});
