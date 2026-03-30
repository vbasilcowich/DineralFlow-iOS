export type AccessTier = 'free' | 'premium';
export type SubscriptionPlan = 'monthly' | 'annual' | null;
export type EntitlementFeature =
  | 'main_snapshot'
  | 'selected_baskets'
  | 'short_history'
  | 'provenance'
  | 'deeper_drilldowns'
  | 'long_history'
  | 'watchlists'
  | 'alerts'
  | 'ad_free';
export type EntitlementSource = 'default' | 'cache' | 'mock_purchase' | 'mock_restore';

export type EntitlementsSnapshot = {
  tier: AccessTier;
  plan: SubscriptionPlan;
  source: EntitlementSource;
  updatedAt: string;
  features: Record<EntitlementFeature, boolean>;
};

export const PREMIUM_FEATURES: EntitlementFeature[] = [
  'deeper_drilldowns',
  'long_history',
  'watchlists',
  'alerts',
  'ad_free',
];

export const PREMIUM_FEATURE_COPY = [
  'Full basket drilldowns and deeper detail',
  'Longer history windows',
  'Watchlists and alerting later in phase 1+',
  'Always ad-free',
] as const;

export const PAYWALL_PLAN_COPY = [
  {
    key: 'monthly',
    title: 'Monthly',
    detail: 'Flexible access to premium depth while we validate the first paid workflow.',
  },
  {
    key: 'annual',
    title: 'Annual',
    detail: 'Lower-friction long-term access once the premium workflow is stable.',
  },
] as const;

function buildFeatureMap(tier: AccessTier): Record<EntitlementFeature, boolean> {
  const premium = tier === 'premium';

  return {
    main_snapshot: true,
    selected_baskets: true,
    short_history: true,
    provenance: true,
    deeper_drilldowns: premium,
    long_history: premium,
    watchlists: premium,
    alerts: premium,
    ad_free: premium,
  };
}

export function buildEntitlements(
  tier: AccessTier,
  plan: SubscriptionPlan,
  source: EntitlementSource,
  updatedAt = new Date().toISOString(),
): EntitlementsSnapshot {
  return {
    tier,
    plan,
    source,
    updatedAt,
    features: buildFeatureMap(tier),
  };
}

export function createDefaultEntitlements(): EntitlementsSnapshot {
  return buildEntitlements('free', null, 'default');
}

export function activateMockPremium(plan: Exclude<SubscriptionPlan, null>): EntitlementsSnapshot {
  return buildEntitlements('premium', plan, 'mock_purchase');
}

export function restoreFromSnapshot(
  snapshot: EntitlementsSnapshot | null,
): EntitlementsSnapshot {
  if (!snapshot) {
    return createDefaultEntitlements();
  }

  return {
    ...snapshot,
    source: 'mock_restore',
    updatedAt: new Date().toISOString(),
  };
}

export function resetToFreeEntitlements(): EntitlementsSnapshot {
  return buildEntitlements('free', null, 'default');
}

export function isFeatureUnlocked(
  entitlements: EntitlementsSnapshot,
  feature: EntitlementFeature,
): boolean {
  return entitlements.features[feature];
}
