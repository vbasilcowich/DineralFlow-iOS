import { fireEvent, render, screen } from '@testing-library/react-native';

import { HistoryAccessPanel } from '@/components/history-access-panel';

const mockUseDashboardHistory = jest.fn();

jest.mock('@/hooks/use-dashboard-history', () => ({
  useDashboardHistory: (...args: unknown[]) => mockUseDashboardHistory(...args),
}));

const FREE_ENTITLEMENTS = {
  tier: 'free' as const,
  plan: null,
  source: 'default' as const,
  updatedAt: '2026-03-30T08:00:00Z',
  features: {
    main_snapshot: true,
    selected_baskets: true,
    short_history: true,
    provenance: true,
    deeper_drilldowns: false,
    long_history: false,
    watchlists: false,
    alerts: false,
    ad_free: false,
  },
};

const PREMIUM_ENTITLEMENTS = {
  ...FREE_ENTITLEMENTS,
  tier: 'premium' as const,
  plan: 'monthly' as const,
  source: 'mock_purchase' as const,
  features: {
    main_snapshot: true,
    selected_baskets: true,
    short_history: true,
    provenance: true,
    deeper_drilldowns: true,
    long_history: true,
    watchlists: true,
    alerts: true,
    ad_free: true,
  },
};

describe('HistoryAccessPanel', () => {
  beforeEach(() => {
    mockUseDashboardHistory.mockReset();
  });

  it('keeps 30d and 90d behind the paywall in free', () => {
    const onOpenPaywall = jest.fn();
    const setWindow = jest.fn();

    mockUseDashboardHistory.mockReturnValue({
      status: 'ready',
      history: {
        window: '7d',
        points: [
          {
            timestamp: '2026-03-28T08:00:00Z',
            headline: 'Energy is gaining strength.',
            global_confidence: 74,
            leading_bucket: 'energy_complex',
            leading_score: 18.2,
          },
        ],
      },
      selectedWindow: '7d',
      errorMessage: null,
      isRefreshing: false,
      lastLoadedAt: '2026-03-30T08:01:00Z',
      apiBaseUrl: 'http://127.0.0.1:8000',
      setWindow,
      refresh: jest.fn(),
    });

    render(
      <HistoryAccessPanel
        entitlements={FREE_ENTITLEMENTS}
        allowedHistoryWindows={['7d']}
        onOpenPaywall={onOpenPaywall}
      />,
    );

    expect(screen.getByText('Stored history with clear access rules')).toBeTruthy();
    expect(screen.getByText('Free history')).toBeTruthy();

    fireEvent.press(screen.getByText('30d'));
    expect(onOpenPaywall).toHaveBeenCalledWith('long_history');
    expect(setWindow).not.toHaveBeenCalled();
  });

  it('allows premium users to switch to longer windows', () => {
    const onOpenPaywall = jest.fn();
    const setWindow = jest.fn();

    mockUseDashboardHistory.mockReturnValue({
      status: 'ready',
      history: {
        window: '30d',
        points: [
          {
            timestamp: '2026-03-30T08:00:00Z',
            headline: 'Safe assets are easing while energy holds up.',
            global_confidence: 79,
            leading_bucket: 'safe_haven',
            leading_score: 12.4,
          },
        ],
      },
      selectedWindow: '30d',
      errorMessage: null,
      isRefreshing: false,
      lastLoadedAt: '2026-03-30T08:01:00Z',
      apiBaseUrl: 'http://127.0.0.1:8000',
      setWindow,
      refresh: jest.fn(),
    });

    render(
      <HistoryAccessPanel
        entitlements={PREMIUM_ENTITLEMENTS}
        allowedHistoryWindows={['7d', '30d', '90d']}
        onOpenPaywall={onOpenPaywall}
      />,
    );

    expect(screen.getByText('Premium history')).toBeTruthy();
    fireEvent.press(screen.getByText('90d'));
    expect(setWindow).toHaveBeenCalledWith('90d');
    expect(onOpenPaywall).not.toHaveBeenCalled();
  });
});
