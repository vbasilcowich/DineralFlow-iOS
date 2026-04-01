# Entitlements Contract v1

## Goal

Move the subscription truth out of the app over time without forcing a large rewrite.

The app can keep a local fallback during development, but the commercial path should converge on:

- app purchase state from `RevenueCat`
- backend mirror of entitlements
- backend-driven paywall config
- consistent gating across iOS, web, and future clients

## Recommended endpoints

- `GET /v1/entitlements`
- `GET /v1/paywall`
- `POST /v1/subscriptions/webhook/revenuecat`
- optional later: `POST /v1/entitlements/refresh`

## `GET /v1/entitlements`

```json
{
  "schema_version": "v1",
  "access_tier": "premium",
  "plan": "annual",
  "source": "revenuecat_mirror",
  "updated_at": "2026-03-30T09:00:00Z",
  "expires_at": null,
  "features": {
    "main_snapshot": true,
    "selected_baskets": true,
    "short_history": true,
    "provenance": true,
    "deeper_drilldowns": true,
    "long_history": true,
    "watchlists": true,
    "alerts": true,
    "ad_free": true
  },
  "limits": {
    "allowed_history_windows": ["7d", "30d", "90d"],
    "max_top_flows": 3,
    "diagnostics_access": "full"
  },
  "ads": {
    "enabled": false,
    "mode": "none"
  }
}
```

## `GET /v1/paywall`

```json
{
  "schema_version": "v1",
  "offering_id": "default",
  "entitlement_id": "premium",
  "default_feature": "long_history",
  "default_plan": "annual",
  "headline": "Premium unlocks the deeper workflow.",
  "body": "Free keeps the short recent arc. Premium unlocks longer windows, deeper drilldowns, and later alerts.",
  "highlights": [
    "30 and 90-day windows",
    "Deeper basket drilldowns",
    "Alerts later in phase 1",
    "Ad-free experience"
  ],
  "legal_links": {
    "terms_url": "http://127.0.0.1:8000/api/legal/terms",
    "privacy_url": "http://127.0.0.1:8000/api/legal/privacy",
    "data_sources_url": "http://127.0.0.1:8000/api/legal/sources",
    "financial_disclaimer_url": "http://127.0.0.1:8000/api/legal/disclaimer"
  }
}
```

## Related history endpoint

- `GET /api/dashboard/history?window=7d|30d|90d`

Client rule:
- `free`: only `7d`
- `premium`: `7d`, `30d`, `90d`

Reason:
- the history payload should stay about stored trend points
- the entitlement contract should decide which windows the app may expose

## Why this shape

- `features` keeps the app gating explicit and testable.
- `limits` avoids hardcoding product caps only in the client.
- `ads` lets the backend control future ad posture centrally.
- `default_feature` gives context-aware paywall copy without duplicating logic in every screen.
- a separate paywall envelope lets copy and legal links change without shipping a new app build

## Current local bridge

While the backend contract is still being developed, the app mirrors the same shape locally in:

- [entitlements-contract.ts](E:/VsCodeApps/DineralFlow-iOS/lib/entitlements-contract.ts)

That bridge keeps the UI aligned with the backend contract while we still use local mock billing during development.
