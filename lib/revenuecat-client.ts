import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import type { BillingConfig } from '@/lib/billing-config';
import {
  activateRevenueCatPremium,
  resetToFreeEntitlements,
  type EntitlementsSnapshot,
  type SubscriptionPlan,
} from '@/lib/monetization';

type RevenueCatConfig = Pick<
  BillingConfig,
  'revenueCatApiKeyIos' | 'revenueCatEntitlementId' | 'revenueCatOfferingId'
>;

type RevenueCatResult = {
  entitlements: EntitlementsSnapshot;
  lastAction: string;
};

let configuredApiKey: string | null = null;

function requireConfigValue(value: string | null, label: string): string {
  if (!value) {
    throw new Error(`revenuecat_${label}_missing`);
  }

  return value;
}

async function ensureRevenueCatConfigured(config: RevenueCatConfig): Promise<void> {
  const apiKey = requireConfigValue(config.revenueCatApiKeyIos, 'api_key');
  const alreadyConfigured =
    configuredApiKey === apiKey && (await Purchases.isConfigured().catch(() => false));

  if (alreadyConfigured) {
    return;
  }

  await Purchases.setLogLevel(LOG_LEVEL.INFO).catch(() => {});
  Purchases.configure({ apiKey });
  configuredApiKey = apiKey;
}

function inferPlanFromIdentifier(productIdentifier: string | null | undefined): SubscriptionPlan {
  if (!productIdentifier) {
    return null;
  }

  const normalized = productIdentifier.toLowerCase();

  if (normalized.includes('year') || normalized.includes('annual')) {
    return 'annual';
  }

  if (normalized.includes('month')) {
    return 'monthly';
  }

  return null;
}

function getActiveEntitlement(
  customerInfo: CustomerInfo,
  entitlementId: string,
) {
  return (
    customerInfo.entitlements.active[entitlementId] ??
    customerInfo.entitlements.all[entitlementId] ??
    null
  );
}

function buildRevenueCatEntitlements(
  customerInfo: CustomerInfo,
  config: RevenueCatConfig,
  source: 'revenuecat_purchase' | 'revenuecat_restore' | 'revenuecat_sync',
  preferredPlan: SubscriptionPlan = null,
): EntitlementsSnapshot {
  const entitlementId = requireConfigValue(config.revenueCatEntitlementId, 'entitlement_id');
  const entitlement = getActiveEntitlement(customerInfo, entitlementId);

  if (!entitlement?.isActive) {
    return resetToFreeEntitlements();
  }

  const inferredPlan =
    preferredPlan ??
    inferPlanFromIdentifier(entitlement.productIdentifier) ??
    inferPlanFromIdentifier(customerInfo.activeSubscriptions[0]) ??
    null;

  return activateRevenueCatPremium(
    inferredPlan,
    source,
    customerInfo.requestDate ?? new Date().toISOString(),
  );
}

async function getRevenueCatOffering(config: RevenueCatConfig): Promise<PurchasesOffering> {
  await ensureRevenueCatConfigured(config);

  const offeringId = requireConfigValue(config.revenueCatOfferingId, 'offering_id');
  const offerings = await Purchases.getOfferings();
  const offering = offerings.all[offeringId] ?? offerings.current;

  if (!offering) {
    throw new Error(`revenuecat_offering_not_found:${offeringId}`);
  }

  return offering;
}

function getRevenueCatPackage(
  offering: PurchasesOffering,
  plan: Exclude<SubscriptionPlan, null>,
): PurchasesPackage | null {
  if (plan === 'monthly') {
    return (
      offering.monthly ??
      offering.availablePackages.find((candidate) => candidate.packageType === PACKAGE_TYPE.MONTHLY) ??
      null
    );
  }

  return (
    offering.annual ??
    offering.availablePackages.find((candidate) => candidate.packageType === PACKAGE_TYPE.ANNUAL) ??
    null
  );
}

function toRevenueCatErrorMessage(error: unknown): string {
  const purchasesError = error as Partial<PurchasesError> | undefined;
  const code = purchasesError?.code;

  if (purchasesError?.userCancelled || code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
    return 'purchase_cancelled';
  }

  if (
    code === Purchases.PURCHASES_ERROR_CODE.NETWORK_ERROR ||
    code === Purchases.PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR
  ) {
    return 'network_error';
  }

  if (code === Purchases.PURCHASES_ERROR_CODE.TEST_STORE_SIMULATED_PURCHASE_ERROR) {
    return 'test_store_purchase_failed';
  }

  if (typeof purchasesError?.message === 'string' && purchasesError.message.trim().length > 0) {
    return purchasesError.message.trim();
  }

  return 'revenuecat_operation_failed';
}

export async function hydrateRevenueCatState(
  config: RevenueCatConfig,
): Promise<RevenueCatResult> {
  try {
    await ensureRevenueCatConfigured(config);
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlements = buildRevenueCatEntitlements(customerInfo, config, 'revenuecat_sync');

    return {
      entitlements,
      lastAction:
        entitlements.tier === 'premium'
          ? 'Loaded RevenueCat customer state'
          : 'No active RevenueCat entitlement',
    };
  } catch (error) {
    throw new Error(toRevenueCatErrorMessage(error));
  }
}

export async function purchaseRevenueCatPlan(
  config: RevenueCatConfig,
  plan: Exclude<SubscriptionPlan, null>,
): Promise<RevenueCatResult> {
  try {
    const offering = await getRevenueCatOffering(config);
    const aPackage = getRevenueCatPackage(offering, plan);

    if (!aPackage) {
      throw new Error(`revenuecat_package_not_found:${plan}`);
    }

    const purchase = await Purchases.purchasePackage(aPackage);
    const entitlements = buildRevenueCatEntitlements(
      purchase.customerInfo,
      config,
      'revenuecat_purchase',
      plan,
    );

    return {
      entitlements,
      lastAction: `RevenueCat purchase completed (${plan})`,
    };
  } catch (error) {
    throw new Error(toRevenueCatErrorMessage(error));
  }
}

export async function restoreRevenueCatState(
  config: RevenueCatConfig,
): Promise<RevenueCatResult> {
  try {
    await ensureRevenueCatConfigured(config);
    const customerInfo = await Purchases.restorePurchases();
    const entitlements = buildRevenueCatEntitlements(customerInfo, config, 'revenuecat_restore');

    return {
      entitlements,
      lastAction:
        entitlements.tier === 'premium'
          ? 'Restored RevenueCat purchases'
          : 'No active RevenueCat purchases to restore',
    };
  } catch (error) {
    throw new Error(toRevenueCatErrorMessage(error));
  }
}

export function resetRevenueCatClientForTests() {
  configuredApiKey = null;
}
