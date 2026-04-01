import { fireEvent, render, screen } from '@testing-library/react-native';

import ConfidenceScreen from '@/app/confidence';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockUseDashboardPreview = jest.fn();
const mockUseMonetization = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock('@/hooks/use-dashboard-preview', () => ({
  useDashboardPreview: () => mockUseDashboardPreview(),
}));

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/use-monetization', () => ({
  useMonetization: () => mockUseMonetization(),
}));

describe('ConfidenceScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
    mockUseAuth.mockReturnValue({
      providerMode: 'mock',
      isAuthenticated: false,
      accessToken: null,
      verificationRequired: false,
      pendingVerificationEmail: null,
      userEmail: null,
      status: 'signed_out',
      lastError: null,
      lastAction: null,
      clearError: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      verifyEmail: jest.fn(),
      logout: jest.fn(),
      refreshSession: jest.fn(),
    });
    mockUseDashboardPreview.mockReturnValue({
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
            bucket_key: 'energy_complex',
            score: 42.2,
            confidence: 78,
            drivers: ['Energy breadth improving'],
          },
          {
            bucket_key: 'safe_haven',
            score: 18.5,
            confidence: 67,
            drivers: ['Gold demand stable'],
          },
        ],
        risks: ['Oil inventory surprise'],
        provider_issues: [
          {
            provider_key: 'fred',
            severity: 'warning',
            message: 'live_coverage_incomplete',
          },
        ],
        market_brief: {
          title: 'Defensive tone with persistent energy pressure',
          summary: 'The latest public-data snapshot is leaning defensive while the energy signal remains tight.',
          confidence: 71.4,
          updated_at: '2026-03-30T08:00:00Z',
          mode: 'deterministic',
          source_mode: 'partial_live',
          bullets: [],
          evidence: [
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
      health: null,
      errorMessage: null,
      isRefreshing: false,
      lastLoadedAt: '2026-03-30T08:01:00Z',
      cacheSavedAt: '2026-03-30T08:01:00Z',
      snapshotOrigin: 'live',
      lastRefreshFailed: false,
      apiBaseUrl: 'http://127.0.0.1:8000',
      refresh: jest.fn(),
    });
  });

  it('shows methodology plus an upsell path for free users', () => {
    mockUseMonetization.mockReturnValue({
      accessTier: 'free',
    });

    render(<ConfidenceScreen />);

    expect(screen.getByText('How confidence works')).toBeTruthy();
    expect(screen.getByText('Published primary and secondary flows')).toBeTruthy();
    expect(screen.getByText('Energy')).toBeTruthy();
    expect(screen.getByText('Safe assets')).toBeTruthy();
    expect(screen.getByText('Open premium')).toBeTruthy();

    fireEvent.press(screen.getByText('Open premium'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/paywall',
      params: { feature: 'deeper_drilldowns' },
    });
  });
});
