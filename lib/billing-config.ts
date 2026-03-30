import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type BillingProvider = 'mock' | 'revenuecat';
export type BillingStatus =
  | 'mock'
  | 'ready'
  | 'missing_configuration'
  | 'requires_native_build'
  | 'sdk_not_installed';

export type BillingConfig = {
  provider: BillingProvider;
  platform: string;
  executionEnvironment: string | null;
  revenueCatApiKeyIos: string | null;
  revenueCatEntitlementId: string | null;
  revenueCatOfferingId: string | null;
};

export type BillingState = {
  provider: BillingProvider;
  status: BillingStatus;
  canStartPurchase: boolean;
  requiresNativeBuild: boolean;
  statusMessage: string;
};

function cleanEnvValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getBillingConfig(): BillingConfig {
  const providerEnv = cleanEnvValue(process.env.EXPO_PUBLIC_BILLING_PROVIDER);
  const provider: BillingProvider = providerEnv === 'revenuecat' ? 'revenuecat' : 'mock';

  return {
    provider,
    platform: Platform.OS,
    executionEnvironment: Constants.executionEnvironment ?? null,
    revenueCatApiKeyIos: cleanEnvValue(process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS),
    revenueCatEntitlementId: cleanEnvValue(process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID),
    revenueCatOfferingId: cleanEnvValue(process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID),
  };
}

export function resolveBillingState(config = getBillingConfig()): BillingState {
  if (config.provider === 'mock') {
    return {
      provider: 'mock',
      status: 'mock',
      canStartPurchase: true,
      requiresNativeBuild: false,
      statusMessage:
        'This build uses mock billing so we can validate free versus premium flows before StoreKit credentials exist.',
    };
  }

  if (!config.revenueCatApiKeyIos || !config.revenueCatEntitlementId || !config.revenueCatOfferingId) {
    return {
      provider: 'revenuecat',
      status: 'missing_configuration',
      canStartPurchase: false,
      requiresNativeBuild: true,
      statusMessage:
        'RevenueCat mode is selected, but the required public keys or entitlement identifiers are missing in this build.',
    };
  }

  if (config.platform === 'web' || config.executionEnvironment === 'storeClient') {
    return {
      provider: 'revenuecat',
      status: 'requires_native_build',
      canStartPurchase: false,
      requiresNativeBuild: true,
      statusMessage:
        'RevenueCat needs a native development build. Web and Expo Go can only exercise the paywall shell.',
    };
  }

  return {
    provider: 'revenuecat',
    status: 'ready',
    canStartPurchase: true,
    requiresNativeBuild: true,
    statusMessage:
      'RevenueCat is configured for a native build. Use a development build or TestFlight build to start purchases on-device.',
  };
}
