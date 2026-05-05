export const ENTITLEMENT_FEATURES = [
  "main_snapshot",
  "selected_baskets",
  "short_history",
  "provenance",
  "deeper_drilldowns",
  "long_history",
  "confidence_breakdown",
  "watchlists",
  "alerts",
  "ad_free",
];

export const HISTORY_WINDOWS = ["7d", "30d", "90d"];
export const CONTRACT_VERSION = "dineralflow.cloudflare.entitlements.v1";
export const PAYWALL_REVISION = "dineralflow.cloudflare.paywall.v1";

export function buildFeatureMap(accessTier) {
  const premium = accessTier === "premium";

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

export function normalizePlan(value) {
  return value === "monthly" || value === "annual" ? value : null;
}

export function normalizeTier(value) {
  return value === "premium" ? "premium" : "free";
}

export function normalizeBillingProvider(value) {
  return value === "mock" || value === "revenuecat" ? value : "none";
}

export function createEntitlementsResponse(input = {}, now = new Date().toISOString()) {
  const accessTier = normalizeTier(input.access_tier);
  const plan = accessTier === "premium" ? normalizePlan(input.plan) ?? "annual" : null;
  const billingProvider = normalizeBillingProvider(input.billing_provider);
  const updatedAt = input.updated_at ?? now;

  return {
    schema_version: "v1",
    access_tier: accessTier,
    plan,
    source: input.source ?? (input.user_id ? "backend" : "fallback"),
    updated_at: updatedAt,
    expires_at: input.expires_at ?? null,
    server_time: now,
    stale_after_seconds: 900,
    contract_version: CONTRACT_VERSION,
    paywall_revision: PAYWALL_REVISION,
    sync_status: "ok",
    last_sync_at: now,
    sync_reason: input.sync_reason ?? null,
    billing_provider: billingProvider,
    features: buildFeatureMap(accessTier),
    limits: {
      allowed_history_windows: accessTier === "premium" ? ["7d", "30d", "90d"] : ["7d"],
      max_top_flows: accessTier === "premium" ? 3 : 1,
      diagnostics_access: accessTier === "premium" ? "full" : "preview",
    },
    ads: {
      enabled: false,
      mode: "none",
    },
  };
}

export function createPaywallResponse(feature = null) {
  const validFeature = ENTITLEMENT_FEATURES.includes(feature) ? feature : null;

  return {
    schema_version: "v1",
    offering_id: "default",
    entitlement_id: "premium",
    default_feature: validFeature,
    default_plan: "annual",
    headline: validFeature === "long_history"
      ? "Longer history unlocks the full snapshot arc."
      : "Premium unlocks the deeper workflow.",
    body: validFeature === "deeper_drilldowns"
      ? "Free keeps the main read clear. Premium opens the deeper driver, friction, and evidence layer behind the same stored snapshot."
      : "Free keeps the short recent arc. Premium unlocks longer history windows, deeper theme drilldowns, and later alerts.",
    highlights: [
      "30 and 90-day windows",
      "Deeper theme drilldowns",
      "Alerts later in phase 1",
      "Ad-free experience",
    ],
    legal_links: {
      terms_url: "/legal/terms",
      privacy_url: "/legal/privacy",
      data_sources_url: "/legal/sources",
      financial_disclaimer_url: "/legal/disclaimer",
    },
  };
}
