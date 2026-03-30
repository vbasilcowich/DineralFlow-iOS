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

  if (config.platform === 'web') {
    return {
      provider: 'revenuecat',
      status: 'requires_native_build',
      canStartPurchase: false,
      requiresNativeBuild: true,
      statusMessage:
        'RevenueCat needs a native iOS development build or simulator target. Web can only exercise the paywall shell.',
    };
  }

  return {
    provider: 'revenuecat',
    status: 'sdk_not_installed',
    canStartPurchase: false,
    requiresNativeBuild: true,
    statusMessage:
      'RevenueCat configuration is present, but the native purchases SDK is not wired into this repo yet.',
  };
}

