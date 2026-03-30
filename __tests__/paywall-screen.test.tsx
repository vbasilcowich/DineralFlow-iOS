import { render, screen } from '@testing-library/react-native';

import PaywallScreen from '@/app/paywall';

const mockUseLocalSearchParams = jest.fn();
const mockUseMonetization = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock('@/hooks/use-monetization', () => ({
  useMonetization: () => mockUseMonetization(),
}));

describe('PaywallScreen', () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({});
  });

  it('uses feature-specific copy when opened from a locked feature path', () => {
    mockUseLocalSearchParams.mockReturnValue({ feature: 'long_history' });
    mockUseMonetization.mockReturnValue({
      accessTier: 'free',
      billingProvider: 'revenuecat',
      billingStatus: 'requires_native_build',
      billingStatusMessage: 'RevenueCat needs a native iOS build before real purchases can start.',
      canStartPurchase: false,
      requiresNativeBillingBuild: true,
      entitlements: {
        tier: 'free',
        plan: null,
        source: 'default',
        updatedAt: '2026-03-30T08:00:00Z',
      },
      lastAction: null,
      errorMessage: null,
      isProcessing: false,
      purchasePremium: jest.fn(),
      restorePurchases: jest.fn(),
      resetToFree: jest.fn(),
    });

    render(<PaywallScreen />);

    expect(screen.getByText('Longer history unlocks the full snapshot arc.')).toBeTruthy();
    expect(
      screen.getByText(
        'This paywall was opened from the Longer history upgrade path.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Billing setup still blocks real purchase start')).toBeTruthy();
    expect(screen.getByText('Start Monthly')).toBeTruthy();
  });

  it('shows the generic unlocked state when premium is already active', () => {
    mockUseMonetization.mockReturnValue({
      accessTier: 'premium',
      billingProvider: 'mock',
      billingStatus: 'mock',
      billingStatusMessage: 'Mock billing mode is active for development.',
      canStartPurchase: true,
      requiresNativeBillingBuild: false,
      entitlements: {
        tier: 'premium',
        plan: 'annual',
        source: 'mock_purchase',
        updatedAt: '2026-03-30T08:00:00Z',
      },
      lastAction: 'Activated premium (annual)',
      errorMessage: null,
      isProcessing: false,
      purchasePremium: jest.fn(),
      restorePurchases: jest.fn(),
      resetToFree: jest.fn(),
    });

    render(<PaywallScreen />);

    expect(screen.getByText('Premium is unlocked in this development build.')).toBeTruthy();
    expect(screen.getByText('Premium access is active')).toBeTruthy();
    expect(screen.getByText('Activate Monthly')).toBeTruthy();
  });
});
