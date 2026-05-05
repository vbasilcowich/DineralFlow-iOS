# Backend Service Plan

## Goal

Define where the logic should live once we move the data and monetization logic outside the iOS app.

## Recommended answer

Keep the logic outside the app.

Use the iOS app as a client of the DineralFlow backend.

## Why

- API keys stay safe
- market data can be cached once and reused by all clients
- entitlements and ads can be controlled centrally
- feature flags can be changed without a new app release
- legal notices and attribution can stay consistent across web and app

## What stays in the backend

- market data ingestion
- normalization
- snapshots and history generation
- freshness checks
- provider failover
- pricing and entitlement logic
- paywall configuration
- ad configuration
- kill switches
- webhook processing from subscription tooling

## What stays in the app

- UI
- local cache
- display rules
- restore purchases UI
- offline fallback
- final rendering decisions

## Recommended hosting plan

### Phase A

- host the first public API on `Cloudflare Workers Free`
- store mobile contract state in `Cloudflare D1 Free`
- use Cloudflare Cron Triggers for scheduled snapshot refreshes
- use `Resend Free` for low-volume verification email

### Phase B

- upgrade to `Cloudflare Workers Paid` only if the free limits become tight
- fallback to `Fly.io + Neon Free` if the existing FastAPI backend must be deployed as-is
- keep Railway Pro as a later convenience option, not the first spend

## Why Cloudflare first

- it can start at `0 USD/month`
- Workers are public HTTPS by default
- D1 covers the current lightweight contract state
- Cron Triggers match the scheduled-snapshot product posture
- the first paid step is small: Workers Paid around `5 USD/month`
- the app reads stored snapshots instead of causing per-user vendor calls

## Minimum service map

### api

- Cloudflare Worker
- public HTTPS endpoint
- mobile auth endpoints
- dashboard snapshot/history endpoints

### d1

- user and entitlement state
- snapshots
- history
- provider usage
- audit trail

### cron-refresh

- initially refreshes stored derived snapshots without paid provider calls
- later pulls data from providers when licensing is confirmed
- updates normalized series
- updates snapshots and cached derived views

## Minimum new backend modules

- `auth`
- `subscriptions`
- `entitlements`
- `paywalls`
- `ads`
- `feature_flags`

## Minimum endpoints for iOS

- `GET /health`
- `GET /api/dashboard/snapshot`
- `GET /api/dashboard/history?window=7d|30d|90d`
- `POST /api/mobile/auth/register`
- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/verify-email`
- `GET /api/mobile/auth/me`
- `POST /api/mobile/auth/logout`
- `GET /api/mobile/entitlements`
- `POST /api/mobile/entitlements/refresh`
- `GET /api/mobile/paywall`
- `POST /api/mobile/webhooks/revenuecat`

## Recommended subscription flow

1. app requests paywall config
2. app starts StoreKit purchase through RevenueCat
3. RevenueCat confirms purchase
4. RevenueCat webhook updates backend entitlement state
5. app refreshes `entitlements`
6. premium features unlock immediately

## Cheapest data architecture for launch

### Do not do this

- do not call market-data providers every time the app opens
- do not compute snapshots on every user request
- do not let each client consume provider quota independently

### Do this instead

- run ingestion jobs on a schedule
- write normalized data to the backend database
- precompute the latest snapshot
- let every app user read the same stored snapshot

## Suggested cadence by data family

### Market regime and baskets

- `1-4` snapshots per day to start
- refresh around meaningful market windows instead of every app load

### Macro

- refresh on publication cadence or a few times per day
- many macro series do not justify high-frequency polling

### Energy

- refresh on release cadence
- weekly EIA data should trigger targeted refreshes, not constant polling

## Product rule

The app may say "latest snapshot" or "latest available update", but should avoid implying exchange-grade real-time coverage unless we actually license and operate it that way.

## Lowest-cost v1 endpoint posture

### Public data reads for the app

- `GET /v1/dashboard/snapshot`
- `GET /v1/dashboard/history`
- `GET /v1/assets/{assetKey}`

These should serve cached/stored backend data, not fresh provider calls.

### Internal jobs

- internal refresh jobs populate the database
- provider calls happen in jobs, not in end-user request paths

## Recommended ad flow later

1. app asks backend for ad config
2. backend decides whether ads are enabled
3. app only renders ads in allowed placements
4. premium users get no ad placements

## Data caching rules

### Cache in app

- last valid snapshot
- lightweight history windows already fetched
- current user entitlement state

### Do not treat app cache as source of truth

- billing state
- provider freshness
- ad enablement
- feature flags

## Security notes

- do not ship provider API keys in the app
- do not ship ad mediation secrets in plaintext
- store only the minimum user state needed client-side
- use backend-driven feature flags for emergency rollback

## Cost note

Backend hosting cost is manageable.

Commercial market data rights remain the real scaling risk and cost driver.

## Legal note

If a provider only allows internal use on its free or base plan, then using it to show raw paid content to app users can conflict with the business model.

That means:

- internal analytics may still be usable
- external raw display may not be
- derived scores may be safer than raw price redistribution, but still need provider-specific review

We should treat free vendor market data as prototyping material unless the external display rights are clearly granted.

## Official sources

- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Fly.io pricing: https://fly.io/docs/about/pricing/
- Neon pricing: https://neon.com/pricing
- Resend pricing: https://resend.com/pricing
- Railway pricing: https://railway.com/pricing
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- RevenueCat pricing: https://www.revenuecat.com/pricing/
- RevenueCat webhooks and platform docs: https://www.revenuecat.com/docs
- Twelve Data terms: https://twelvedata.com/terms
- FRED API terms: https://fred.stlouisfed.org/docs/api/terms_of_use.html
- EIA copyrights and reuse: https://www.eia.gov/about/copyrights_reuse.php
- World Bank dataset terms: https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets
- ECB statistics reuse policy: https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html
