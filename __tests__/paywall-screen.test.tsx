import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import PaywallScreen from '@/app/paywall';

const mockUseLocalSearchParams = jest.fn();
const mockUseMonetization = jest.fn();
const mockUsePaywallConfig = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock('@/hooks/use-monetization', () => ({
  useMonetization: () => mockUseMonetization(),
}));

jest.mock('@/hooks/use-paywall-config', () => ({
  usePaywallConfig: (...args: unknown[]) => mockUsePaywallConfig(...args),
}));

describe('PaywallScreen', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockUseLocalSearchParams.mockReturnValue({});
    mockUsePaywallConfig.mockReturnValue({
      status: 'ready',
      source: 'backend',
      errorMessage: null,
      config: {
        schema_version: 'v1',
        offering_id: 'default',
        entitlement_id: 'premium',
        default_feature: null,
        default_plan: 'annual',
        headline: 'Premium unlocks the deeper workflow.',
        body: 'Free keeps the short recent arc. Premium unlocks longer history windows, deeper basket drilldowns, and later alerts.',
        highlights: ['30 and 90-day windows', 'Deeper basket drilldowns'],
        legal_links: {
          terms_url: 'https://example.com/terms',
          privacy_url: 'https://example.com/privacy',
        },
      },
    });
  });

  it('uses feature-specific copy when opened from a locked feature path', () => {
    mockUseLocalSearchParams.mockReturnValue({ feature: 'long_history' });
    const syncEntitlements = jest.fn();
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
      entitlementsSyncStatus: 'ready',
      entitlementsContractState: 'backend_live',
      entitlementsLastSyncAt: '2026-03-30T08:01:00Z',
      entitlementsContractVersion: 'mobile-entitlements.v1',
      lastAction: null,
      errorMessage: null,
      isProcessing: false,
      syncEntitlements,
      purchasePremium: jest.fn(),
      restorePurchases: jest.fn(),
      resetToFree: jest.fn(),
    });

    render(<PaywallScreen />);

    expect(screen.getByText('Premium unlocks the deeper workflow.')).toBeTruthy();
    expect(
      screen.getByText(
        'This paywall was opened from the Longer history upgrade path.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Billing setup still blocks real purchase start')).toBeTruthy();
    expect(screen.getByText('Start Monthly')).toBeTruthy();
    expect(screen.getByText('Open terms')).toBeTruthy();
    expect(syncEntitlements).toHaveBeenCalledWith('paywall_opened');
  });

  it('shows the generic unlocked state when premium is already active', () => {
    const syncEntitlements = jest.fn();
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
      entitlementsSyncStatus: 'ready',
      entitlementsContractState: 'local_premium_mirror',
      entitlementsLastSyncAt: '2026-03-30T08:01:00Z',
      entitlementsContractVersion: 'local-premium-mirror.v1',
      lastAction: 'Activated premium (annual)',
      errorMessage: null,
      isProcessing: false,
      syncEntitlements,
      purchasePremium: jest.fn(),
      restorePurchases: jest.fn(),
      resetToFree: jest.fn(),
    });

    render(<PaywallScreen />);

    expect(screen.getByText('Premium is unlocked in this development build.')).toBeTruthy();
    expect(screen.getByText('Premium access is active')).toBeTruthy();
    expect(screen.getByText('Activate Monthly')).toBeTruthy();
    expect(syncEntitlements).toHaveBeenCalledWith('paywall_opened');
  });

  it('opens backend legal links from the current paywall contract', async () => {
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
      entitlementsSyncStatus: 'ready',
      entitlementsContractState: 'backend_live',
      entitlementsLastSyncAt: '2026-03-30T08:01:00Z',
      entitlementsContractVersion: 'mobile-entitlements.v1',
      lastAction: null,
      errorMessage: null,
      isProcessing: false,
      syncEntitlements: jest.fn(),
      purchasePremium: jest.fn(),
      restorePurchases: jest.fn(),
      resetToFree: jest.fn(),
    });

    render(<PaywallScreen />);

    fireEvent.press(screen.getByText('Open terms'));
    fireEvent.press(screen.getByText('Open privacy'));

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenNthCalledWith(1, 'https://example.com/terms');
      expect(Linking.openURL).toHaveBeenNthCalledWith(2, 'https://example.com/privacy');
    });
  });
});
