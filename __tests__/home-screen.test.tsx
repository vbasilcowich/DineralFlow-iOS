import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';

const mockPush = jest.fn();
const mockUseDashboardPreview = jest.fn();
const mockUseMonetization = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
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

jest.mock('@/components/live-snapshot-panel', () => ({
  LiveSnapshotPanel: () => null,
}));

jest.mock('@/components/history-access-panel', () => ({
  HistoryAccessPanel: () => null,
}));

describe('HomeScreen feature gating', () => {
  beforeEach(() => {
    mockPush.mockClear();
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
      snapshot: null,
      health: null,
      errorMessage: null,
      isRefreshing: false,
      lastLoadedAt: null,
      cacheSavedAt: null,
      snapshotOrigin: 'none',
      lastRefreshFailed: false,
      apiBaseUrl: 'http://127.0.0.1:8000',
      refresh: jest.fn(),
    });
  });

  it('shows upgrade paths for the free tier', () => {
    mockUseMonetization.mockReturnValue({
      accessTier: 'free',
      entitlementsSyncStatus: 'ready',
      entitlementsContractVersion: 'mobile-entitlements.v1',
      entitlementsContractState: 'backend_live',
      maxTopFlows: 1,
      diagnosticsAccess: 'preview',
      allowedHistoryWindows: ['7d'],
      entitlements: {
        tier: 'free',
        plan: null,
        source: 'default',
        updatedAt: '2026-03-30T08:00:00Z',
        features: {
          main_snapshot: true,
          selected_baskets: true,
          short_history: true,
          provenance: true,
          deeper_drilldowns: false,
          long_history: false,
          confidence_breakdown: false,
          watchlists: false,
          alerts: false,
          ad_free: false,
        },
      },
    });

    const view = render(<HomeScreen />);

    expect(view.getByLabelText('English')).toBeTruthy();
    expect(view.getByLabelText('Español')).toBeTruthy();
    expect(screen.getByText('Longer history')).toBeTruthy();
    expect(screen.getByText('Theme drilldowns')).toBeTruthy();
    expect(screen.getByText('Alerts')).toBeTruthy();
    expect(screen.getByText('Unlock longer history')).toBeTruthy();
    expect(screen.getByText('Unlock drilldowns')).toBeTruthy();
    expect(screen.getByText('Unlock alerts')).toBeTruthy();

    fireEvent.press(screen.getByText('Unlock alerts'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/paywall',
      params: { feature: 'alerts' },
    });
  });

  it('shows unlocked premium cards when premium is active', () => {
    mockUseMonetization.mockReturnValue({
      accessTier: 'premium',
      entitlementsSyncStatus: 'ready',
      entitlementsContractVersion: 'mobile-entitlements.v1',
      entitlementsContractState: 'local_premium_mirror',
      maxTopFlows: 3,
      diagnosticsAccess: 'full',
      allowedHistoryWindows: ['7d', '30d', '90d'],
      entitlements: {
        tier: 'premium',
        plan: 'monthly',
        source: 'mock_purchase',
        updatedAt: '2026-03-30T08:00:00Z',
        features: {
          main_snapshot: true,
          selected_baskets: true,
          short_history: true,
          provenance: true,
          deeper_drilldowns: true,
          long_history: true,
          confidence_breakdown: true,
          watchlists: true,
          alerts: true,
          ad_free: true,
        },
      },
    });

    render(<HomeScreen />);

    expect(screen.getByText('30 and 90-day windows')).toBeTruthy();
    expect(screen.getByText('Full theme drilldowns')).toBeTruthy();
    expect(screen.getByText('Alert layer enabled later')).toBeTruthy();
    expect(screen.queryByText('Unlock alerts')).toBeNull();
    expect(screen.getAllByText('Review premium access')).toHaveLength(3);
  });
});
