export type AccessTier = 'free' | 'premium';
export type SubscriptionPlan = 'monthly' | 'annual' | null;
export type HistoryWindow = '7d' | '30d' | '90d';
export type EntitlementFeature =
  | 'main_snapshot'
  | 'selected_baskets'
  | 'short_history'
  | 'provenance'
  | 'deeper_drilldowns'
  | 'long_history'
  | 'confidence_breakdown'
  | 'watchlists'
  | 'alerts'
  | 'ad_free';
export type EntitlementSource =
  | 'default'
  | 'cache'
  | 'mock_purchase'
  | 'mock_restore'
  | 'revenuecat_purchase'
  | 'revenuecat_restore'
  | 'revenuecat_sync'
  | 'backend_sync';
export type FeatureGateState = 'preview' | 'locked' | 'unlocked';

type FeatureDescriptor = {
  title: string;
  freeValue: string;
  freeDetail: string;
  premiumValue: string;
  premiumDetail: string;
  paywallTitle: string;
  paywallBody: string;
  freeState: Exclude<FeatureGateState, 'unlocked'>;
  ctaLabel: string;
};

export type EntitlementsSnapshot = {
  tier: AccessTier;
  plan: SubscriptionPlan;
  source: EntitlementSource;
  updatedAt: string;
  features: Record<EntitlementFeature, boolean>;
};

export const ENTITLEMENT_FEATURES: EntitlementFeature[] = [
  'main_snapshot',
  'selected_baskets',
  'short_history',
  'provenance',
  'deeper_drilldowns',
  'long_history',
  'confidence_breakdown',
  'watchlists',
  'alerts',
  'ad_free',
] as const;

export const PREMIUM_FEATURES: EntitlementFeature[] = [
  'deeper_drilldowns',
  'long_history',
  'confidence_breakdown',
  'watchlists',
  'alerts',
  'ad_free',
];

export const HOME_PREMIUM_FEATURES: EntitlementFeature[] = [
  'long_history',
  'deeper_drilldowns',
  'alerts',
] as const;

export const HISTORY_WINDOWS: HistoryWindow[] = ['7d', '30d', '90d'];

export const PREMIUM_FEATURE_COPY = [
  'Full theme drilldowns and deeper detail',
  'Longer history windows',
  'Watchlists and alerting later in phase 1+',
  'Always ad-free',
] as const;

const FEATURE_DESCRIPTORS: Record<EntitlementFeature, FeatureDescriptor> = {
  main_snapshot: {
    title: 'Main snapshot',
    freeValue: 'Included in free',
    freeDetail: 'The latest stored macro and regime snapshot stays visible in every tier.',
    premiumValue: 'Included in premium',
    premiumDetail: 'Premium keeps the same headline snapshot and adds more depth around it.',
    paywallTitle: 'The main snapshot stays readable in every tier.',
    paywallBody: 'Premium does not paywall the core regime reading. It pays for deeper context and convenience around that reading.',
    freeState: 'preview',
    ctaLabel: 'Review premium depth',
  },
  selected_baskets: {
    title: 'Selected themes',
    freeValue: 'Included in free',
    freeDetail: 'Free keeps the key themes visible so the product remains understandable on first open.',
    premiumValue: 'Included in premium',
    premiumDetail: 'Premium keeps the same core themes and adds richer follow-through around them.',
    paywallTitle: 'Selected themes stay visible in free.',
    paywallBody: 'Premium should monetize deeper interpretation, not hide the basic product outline.',
    freeState: 'preview',
    ctaLabel: 'Review premium depth',
  },
  short_history: {
    title: 'Short history',
    freeValue: 'Short window',
    freeDetail: 'Free can stay anchored to a short history window so the reading remains useful without heavy data costs.',
    premiumValue: 'Short plus long windows',
    premiumDetail: 'Premium expands history access and keeps the short window in context.',
    paywallTitle: 'Longer history starts from a useful short window.',
    paywallBody: 'Free keeps the recent arc readable. Premium unlocks the longer context that helps users interpret regime changes more confidently.',
    freeState: 'preview',
    ctaLabel: 'Unlock longer history',
  },
  provenance: {
    title: 'Provenance',
    freeValue: 'Included in free',
    freeDetail: 'Source, freshness, and fallback honesty should stay visible regardless of tier.',
    premiumValue: 'Included in premium',
    premiumDetail: 'Premium keeps provenance visible and adds more depth around the same evidence.',
    paywallTitle: 'Source and freshness should stay visible in every tier.',
    paywallBody: 'Premium should never depend on hiding where the data came from. Trust starts with provenance, even in the free tier.',
    freeState: 'preview',
    ctaLabel: 'Review premium depth',
  },
  deeper_drilldowns: {
    title: 'Theme drilldowns',
    freeValue: 'Preview only',
    freeDetail: 'Free can preview that deeper theme evidence exists, but the full diagnostic layer stays premium.',
    premiumValue: 'Full theme drilldowns',
    premiumDetail: 'Premium unlocks fuller driver, friction, and evidence context around each theme.',
    paywallTitle: 'Premium unlocks the deeper theme drilldowns.',
    paywallBody: 'The free tier should show that deeper evidence exists. Premium unlocks the full drilldown layer, not just a teaser headline.',
    freeState: 'preview',
    ctaLabel: 'Unlock drilldowns',
  },
  long_history: {
    title: 'Longer history',
    freeValue: '7-day preview',
    freeDetail: 'Free can stay on the recent stretch so the product remains cheap to run and easy to understand.',
    premiumValue: '30 and 90-day windows',
    premiumDetail: 'Premium unlocks longer arcs so users can compare the latest snapshot with a broader backdrop.',
    paywallTitle: 'Longer history unlocks the full snapshot arc.',
    paywallBody: 'Free keeps a short lookback. Premium expands that into longer windows so users can see whether the latest move is persistent or only short-term noise.',
    freeState: 'preview',
    ctaLabel: 'Unlock longer history',
  },
  confidence_breakdown: {
    title: 'Confidence breakdown',
    freeValue: 'Preview only',
    freeDetail: 'Free can explain the headline confidence at a high level without exposing the full evidence ledger.',
    premiumValue: 'Full confidence methodology',
    premiumDetail: 'Premium unlocks the weighting, evidence ordering, and conflicts behind each confidence reading.',
    paywallTitle: 'Premium unlocks the deeper confidence breakdown.',
    paywallBody: 'Free keeps the top-line confidence readable. Premium opens the methodology, evidence trail, and conflict handling behind that number.',
    freeState: 'preview',
    ctaLabel: 'Unlock confidence detail',
  },
  watchlists: {
    title: 'Watchlists',
    freeValue: 'Not included yet',
    freeDetail: 'Watchlists are planned for premium once the first subscription layer is stable.',
    premiumValue: 'Planned premium feature',
    premiumDetail: 'Premium is the natural home for watchlists once the backend and legal posture are ready.',
    paywallTitle: 'Watchlists are a premium convenience layer.',
    paywallBody: 'They should arrive after the core subscription workflow is stable, not before. Premium is where that convenience belongs.',
    freeState: 'locked',
    ctaLabel: 'Join premium',
  },
  alerts: {
    title: 'Alerts',
    freeValue: 'Locked in free',
    freeDetail: 'Free can show that alerts exist in the product map, but configuration should stay premium.',
    premiumValue: 'Alert layer enabled later',
    premiumDetail: 'Premium is where scheduled alerts and future watchlist actions belong once the backend is ready.',
    paywallTitle: 'Premium is where alerts belong.',
    paywallBody: 'The free tier can acknowledge that alerting exists, but actual alert configuration should stay in premium because it creates recurring backend and product cost.',
    freeState: 'locked',
    ctaLabel: 'Unlock alerts',
  },
  ad_free: {
    title: 'Ad-free experience',
    freeValue: 'Free may add ads later',
    freeDetail: 'Native ads belong only in the free tier, later, and in clearly separated placements.',
    premiumValue: 'Always ad-free',
    premiumDetail: 'Premium should stay clear of ad placements and keep the product focused on signal quality.',
    paywallTitle: 'Premium keeps the app ad-free.',
    paywallBody: 'If ads arrive later, they should stay out of premium and out of critical analysis areas. Premium pays for a cleaner workflow.',
    freeState: 'locked',
    ctaLabel: 'Stay ad-free',
  },
};

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
    confidence_breakdown: premium,
    watchlists: premium,
    alerts: premium,
    ad_free: premium,
  };
}

export function mergeFeatureOverrides(
  tier: AccessTier,
  overrides: Partial<Record<EntitlementFeature, boolean>> = {},
): Record<EntitlementFeature, boolean> {
  return {
    ...buildFeatureMap(tier),
    ...overrides,
  };
}

export function buildEntitlements(
  tier: AccessTier,
  plan: SubscriptionPlan,
  source: EntitlementSource,
  updatedAt = new Date().toISOString(),
  featureOverrides: Partial<Record<EntitlementFeature, boolean>> = {},
): EntitlementsSnapshot {
  return {
    tier,
    plan,
    source,
    updatedAt,
    features: mergeFeatureOverrides(tier, featureOverrides),
  };
}

export function createDefaultEntitlements(): EntitlementsSnapshot {
  return buildEntitlements('free', null, 'default');
}

export function activateMockPremium(plan: Exclude<SubscriptionPlan, null>): EntitlementsSnapshot {
  return buildEntitlements('premium', plan, 'mock_purchase');
}

export function activateRevenueCatPremium(
  plan: SubscriptionPlan,
  source: Extract<EntitlementSource, 'revenuecat_purchase' | 'revenuecat_restore' | 'revenuecat_sync'>,
  updatedAt = new Date().toISOString(),
): EntitlementsSnapshot {
  return buildEntitlements('premium', plan, source, updatedAt);
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

export function isEntitlementFeature(value: string): value is EntitlementFeature {
  return ENTITLEMENT_FEATURES.includes(value as EntitlementFeature);
}

export function getFeatureDescriptor(feature: EntitlementFeature): FeatureDescriptor {
  return FEATURE_DESCRIPTORS[feature];
}

export function getFeatureGateState(
  entitlements: EntitlementsSnapshot,
  feature: EntitlementFeature,
): FeatureGateState {
  if (isFeatureUnlocked(entitlements, feature)) {
    return 'unlocked';
  }

  return FEATURE_DESCRIPTORS[feature].freeState;
}

export function canAccessHistoryWindow(
  entitlements: EntitlementsSnapshot,
  window: HistoryWindow,
): boolean {
  if (window === '7d') {
    return true;
  }

  return isFeatureUnlocked(entitlements, 'long_history');
}

export function getAvailableHistoryWindows(
  entitlements: EntitlementsSnapshot,
): HistoryWindow[] {
  return HISTORY_WINDOWS.filter((window) => canAccessHistoryWindow(entitlements, window));
}

export function isFeatureUnlocked(
  entitlements: EntitlementsSnapshot,
  feature: EntitlementFeature,
): boolean {
  return entitlements.features[feature];
}
