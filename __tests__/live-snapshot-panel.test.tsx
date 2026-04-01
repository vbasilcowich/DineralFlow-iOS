import { fireEvent, render, screen } from '@testing-library/react-native';

import { LiveSnapshotPanel } from '@/components/live-snapshot-panel';
import type { DashboardPreviewState } from '@/hooks/use-dashboard-preview';

function createPreviewState(): DashboardPreviewState {
  return {
    status: 'ready',
    snapshot: {
      as_of: '2026-03-30T08:00:00Z',
      source_mode: 'partial_live',
      effective_providers: ['fred', 'eia'],
      headline: 'Energy and safe assets are leading the latest stored snapshot.',
      global_confidence: 76,
      coverage: 0.82,
      data_freshness: {
        status: 'fresh',
        seconds_since_refresh: 900,
      },
      leading_bucket: 'energy_complex',
      bucket_scores: [
        { bucket_key: 'energy_complex', score: 42.2, confidence: 78 },
        { bucket_key: 'safe_haven', score: 18.5, confidence: 67 },
      ],
      top_flows: [
        {
          bucket_key: 'risk_on',
          score: 14.3,
          confidence: 61,
          drivers: ['Breadth improving', 'Short pullback fading'],
        },
        {
          bucket_key: 'safe_haven',
          score: 10.1,
          confidence: 58,
          drivers: ['Gold bid stable'],
        },
      ],
      risks: ['Oil inventory surprise', 'Soft breadth outside the US'],
      provider_issues: [
        {
          provider_key: 'fred',
          severity: 'warning',
          message: 'Macro release still pending revision.',
        },
        {
          provider_key: 'eia',
          severity: 'info',
          message: 'Inventory series delayed by one release window.',
        },
      ],
      market_brief: {
        version: 'market_brief.public_data.v1',
        title: 'Defensive tone with persistent energy pressure',
        summary: 'The latest public-data snapshot is leaning defensive while the energy signal remains tight.',
        confidence: 71.4,
        updated_at: '2026-03-30T08:00:00Z',
        mode: 'deterministic',
        source_mode: 'partial_live',
        bullets: [
          'High-yield spreads widened, which adds defensive pressure.',
          'US crude inventories fell, which keeps energy tightness in place.',
          'The 10Y yield moved up, keeping rate pressure visible.',
        ],
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
            last_update_at: '2026-03-30T08:00:00Z',
          },
          {
            signal_key: 'energy_us_crude_inventories',
            label: 'US crude inventories',
            provider_key: 'eia',
            provider_label: 'EIA',
            latest_value: 428.2,
            previous_value: 431.5,
            delta_value: -3.3,
            delta_text: '-3.30 mbbl',
            summary: 'US crude inventories fell, which keeps energy tightness in place.',
            supports_theme: 0.35,
            last_update_at: '2026-03-30T08:00:00Z',
          },
        ],
        source_labels: ['FRED', 'EIA'],
        disclaimer: 'Informational analysis based on the latest stored public-data snapshot. Not investment advice.',
      },
    },
    health: {
      status: 'ok',
      app_name: 'Market Flow API',
      environment: 'local',
      enabled_market_providers: [],
      enabled_macro_providers: ['fred', 'eia'],
      available_jobs: ['snapshot_refresh'],
    },
    errorMessage: null,
    isRefreshing: false,
    lastLoadedAt: '2026-03-30T08:01:00Z',
    cacheSavedAt: '2026-03-30T08:01:00Z',
    snapshotOrigin: 'live',
    lastRefreshFailed: false,
    apiBaseUrl: 'http://127.0.0.1:8000',
  };
}

describe('LiveSnapshotPanel', () => {
  it('keeps the free tier concise and routes upgrade CTAs through the paywall', () => {
    const onOpenPaywall = jest.fn();
    const onOpenConfidence = jest.fn();

    render(
      <LiveSnapshotPanel
        state={createPreviewState()}
        onRefresh={jest.fn()}
        accessTier="free"
        maxTopFlows={1}
        diagnosticsAccess="preview"
        onOpenPaywall={onOpenPaywall}
        onOpenConfidence={onOpenConfidence}
      />,
    );

    expect(screen.getByText('Primary flow')).toBeTruthy();
    expect(screen.getByText('Secondary flow')).toBeTruthy();
    expect(screen.getByText('Energy')).toBeTruthy();
    expect(screen.getByText('Safe assets')).toBeTruthy();
    expect(screen.getByText('How confidence works')).toBeTruthy();
    expect(screen.getByText('Defensive tone with persistent energy pressure')).toBeTruthy();
    expect(screen.getAllByText(/High-yield spreads widened, which adds defensive pressure\./).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/US crude inventories fell, which keeps energy tightness in place\./).length).toBeGreaterThan(0);
    expect(screen.queryByText(/The 10Y yield moved up, keeping rate pressure visible\./)).toBeNull();
    expect(screen.getByText('High-yield spreads')).toBeTruthy();
    expect(screen.queryByText('US crude inventories')).toBeNull();
    expect(screen.getAllByText('Equities').length).toBeGreaterThan(0);

    fireEvent.press(screen.getByText('How confidence works'));
    expect(onOpenConfidence).toHaveBeenCalled();
    fireEvent.press(screen.getAllByText('Unlock drilldowns')[0]);
    expect(onOpenPaywall).toHaveBeenCalledWith('deeper_drilldowns');
  });

  it('shows the wider evidence set in premium', () => {
    render(
      <LiveSnapshotPanel
        state={createPreviewState()}
        onRefresh={jest.fn()}
        accessTier="premium"
        maxTopFlows={3}
        diagnosticsAccess="full"
      />,
    );

    expect(screen.getAllByText(/The 10Y yield moved up, keeping rate pressure visible\./).length).toBeGreaterThan(0);
    expect(screen.getByText('US crude inventories')).toBeTruthy();
    expect(screen.getAllByText('Safe assets').length).toBeGreaterThan(0);
    expect(screen.getByText('Backend diagnostics')).toBeTruthy();
    expect(screen.getByText('Inventory series delayed by one release window.')).toBeTruthy();
    expect(screen.queryByText(/Free shows a short evidence preview/i)).toBeNull();
  });
});
