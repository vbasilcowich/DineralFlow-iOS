import {
  getBillingConfig,
  resolveBillingState,
  type BillingConfig,
} from '@/lib/billing-config';

const ORIGINAL_ENV = process.env;

function withEnv(values: Record<string, string | undefined>) {
  process.env = {
    ...ORIGINAL_ENV,
    ...values,
  };
}

describe('billing config', () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('defaults to mock billing when no provider is configured', () => {
    withEnv({
      EXPO_PUBLIC_BILLING_PROVIDER: undefined,
      EXPO_PUBLIC_REVENUECAT_API_KEY_IOS: undefined,
      EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID: undefined,
      EXPO_PUBLIC_REVENUECAT_OFFERING_ID: undefined,
    });

    expect(getBillingConfig().provider).toBe('mock');
    expect(resolveBillingState(getBillingConfig()).status).toBe('mock');
  });

  it('reports missing RevenueCat configuration when required keys are absent', () => {
    const config: BillingConfig = {
      provider: 'revenuecat',
      platform: 'ios',
      executionEnvironment: 'standalone',
      revenueCatApiKeyIos: null,
      revenueCatEntitlementId: 'premium',
      revenueCatOfferingId: 'default',
    };

    expect(resolveBillingState(config)).toMatchObject({
      provider: 'revenuecat',
      status: 'missing_configuration',
      canStartPurchase: false,
    });
  });

  it('reports native-build requirement on web when RevenueCat config exists', () => {
    const config: BillingConfig = {
      provider: 'revenuecat',
      platform: 'web',
      executionEnvironment: 'bare',
      revenueCatApiKeyIos: 'appl_mock',
      revenueCatEntitlementId: 'premium',
      revenueCatOfferingId: 'default',
    };

    expect(resolveBillingState(config)).toMatchObject({
      provider: 'revenuecat',
      status: 'requires_native_build',
      canStartPurchase: false,
    });
  });

  it('reports ready when the config is present on a supported native build', () => {
    const config: BillingConfig = {
      provider: 'revenuecat',
      platform: 'ios',
      executionEnvironment: 'standalone',
      revenueCatApiKeyIos: 'appl_mock',
      revenueCatEntitlementId: 'premium',
      revenueCatOfferingId: 'default',
    };

    expect(resolveBillingState(config)).toMatchObject({
      provider: 'revenuecat',
      status: 'ready',
      canStartPurchase: true,
    });
  });

  it('keeps RevenueCat blocked inside Expo Go store client mode', () => {
    const config: BillingConfig = {
      provider: 'revenuecat',
      platform: 'ios',
      executionEnvironment: 'storeClient',
      revenueCatApiKeyIos: 'appl_mock',
      revenueCatEntitlementId: 'premium',
      revenueCatOfferingId: 'default',
    };

    expect(resolveBillingState(config)).toMatchObject({
      provider: 'revenuecat',
      status: 'requires_native_build',
      canStartPurchase: false,
    });
  });
});
