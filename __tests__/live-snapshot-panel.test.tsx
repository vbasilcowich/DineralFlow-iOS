import { fireEvent, render, screen } from '@testing-library/react-native';

import { LiveSnapshotPanel } from '@/components/live-snapshot-panel';
import type { DashboardPreviewState } from '@/hooks/use-dashboard-preview';

function createPreviewState(): DashboardPreviewState {
  return {
    status: 'ready',
    snapshot: {
      as_of: '2026-03-30T08:00:00Z',
      source_mode: 'live',
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
    },
    health: {
      status: 'ok',
      app_name: 'Market Flow API',
      environment: 'local',
      enabled_market_providers: ['fred'],
      enabled_macro_providers: ['eia'],
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

    render(
      <LiveSnapshotPanel
        state={createPreviewState()}
        onRefresh={jest.fn()}
        accessTier="free"
        maxTopFlows={1}
        diagnosticsAccess="preview"
        onOpenPaywall={onOpenPaywall}
      />,
    );

    expect(screen.getByText('Equities')).toBeTruthy();
    expect(screen.queryByText('Safe assets')).toBeNull();
    expect(
      screen.getByText(/Premium unlocks a wider flow list and the deeper basket drilldowns/i),
    ).toBeTruthy();
    expect(screen.getByText('Provider diagnostics preview')).toBeTruthy();
    expect(screen.queryByText('Inventory series delayed by one release window.')).toBeNull();

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

    expect(screen.getByText('Equities')).toBeTruthy();
    expect(screen.getByText('Safe assets')).toBeTruthy();
    expect(screen.getByText('Prototype data diagnostics')).toBeTruthy();
    expect(screen.getByText('Inventory series delayed by one release window.')).toBeTruthy();
    expect(
      screen.queryByText(/Premium unlocks a wider flow list and the deeper basket drilldowns/i),
    ).toBeNull();
  });
});
