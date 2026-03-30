# Monetization Architecture

## Objective

Define the monetization architecture for `DineralFlow-iOS` using this sequence:

1. Phase 1: subscription first
2. Phase 2: native ads only in the free tier
3. Phase 3: Meta mediation only if it improves revenue without hurting privacy, operations, or UX

## Product thesis

`DineralFlow` is a trust product before it is an ad product.

That means:

- the app should earn primarily through subscription
- ads must never interfere with reading the dashboard
- premium must stay ad-free
- nothing critical for interpreting a score should be hidden behind an ad

## Recommended business model

### Free

- main snapshot
- a smaller set of baskets
- shorter history windows
- limited refresh cadence
- no exports
- no advanced alerts
- no watchlist sync
- ads allowed only from phase 2 onward

### Premium

- full dashboard
- full basket drilldowns
- longer history
- full asset detail
- watchlist and alerts
- no ads
- earlier access to new features

### Team

- keep out of scope for the first iOS release
- design for it in backend entitlements, but do not build it yet

## Feature boundary to use now

### Free should include

- latest stored snapshot
- headline regime reading
- limited basket list
- shorter history windows
- provenance and freshness labels
- a clear explanation that data is snapshot-based

### Premium should include

- all baskets and deeper basket detail
- longer history windows
- richer drilldowns
- watchlists
- alerts
- ad-free experience

## Data policy for the commercial iOS launch

The commercial iOS launch should not depend on `Twelve Data` or `Alpha Vantage` as part of its outward market-data promise.

The recommended commercial posture is:

- public-data-first
- scheduled snapshots
- less raw quote display
- more derived analytics and explanations

The current backend preview may still mention those providers for development, but that is not the intended monetized launch contract.

## Monetization phases

## Phase 1: subscriptions

- use Apple in-app purchase for digital features unlocked inside the iOS app
- use StoreKit in the Apple ecosystem
- use `RevenueCat` to simplify subscription state, entitlements, restore purchases, and future experimentation
- keep the app usable in free mode even if subscription services are temporarily unavailable

## Phase 2: ads only in free

- use `Google AdMob`
- use native ads only
- no interstitials
- no rewarded ads
- no app open ads in the first ad rollout
- add a remote kill switch so ads can be disabled without shipping a new binary

## Phase 3: Meta mediation

- only evaluate after we have enough traffic to measure fill rate and ARPDAU
- integrate Meta through AdMob mediation, not as a parallel ad stack in the first attempt
- ship it only if operational complexity and privacy burden remain acceptable

## Why the logic should live outside the app

The app should not contain the full market-data backend.

Keep outside the app:

- provider API keys
- market data ingestion
- normalization
- cache and freshness logic
- entitlements
- paywall config
- ad config and frequency caps
- feature flags

Keep inside the app:

- UI
- local cache of last valid snapshot
- local gating for already-known entitlements
- ad rendering rules
- paywall presentation

## Recommended technical split

### Client

- Expo / React Native app
- local cache for snapshot and subscription state
- StoreKit purchase flow through RevenueCat
- feature gating based on entitlements returned by backend plus RevenueCat state

### Backend

- current DineralFlow API extracted as the single data authority
- market data aggregation
- user profile
- entitlement mirror
- paywall config
- ad placement config
- feature flags

## Minimum backend endpoints to add

- `GET /v1/me`
- `GET /v1/entitlements`
- `GET /v1/paywall`
- `GET /v1/ads/config`
- `GET /v1/feature-flags`
- `POST /v1/subscriptions/webhook/revenuecat`

## Paywall principles

- show a clear free vs premium comparison
- show billing period clearly
- include restore purchases
- include legal copy for renewal and cancellation
- do not lock the user out of the entire app

## Ad placement rules

### Ads allowed later

- after the first complete content block on the free home screen
- at the end of a long detail screen
- in long free lists with clear separation
- as a clearly labeled `Sponsored` block

### Ads forbidden

- onboarding
- login
- signup
- paywall
- loading or error states
- main score header
- charts
- driver explanations
- frictions
- alerts
- any screen that feels like a direct financial recommendation

## App Store and compliance notes

- Apple requires in-app purchase for digital features unlocked in the app
- subscriptions must provide ongoing value and clear pricing
- financial apps need careful wording and should avoid drifting into personalized investment advice
- ads may require ATT and privacy disclosures depending on tracking behavior

## Recommended implementation order

1. subscription foundation with RevenueCat and feature gating
2. backend entitlement endpoints
3. paywall and restore purchases
4. test matrix for free and premium
5. native ads in free only
6. Meta mediation only after real ad revenue data exists

## Official sources

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple business models: https://developer.apple.com/app-store/business-models/
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/
- RevenueCat pricing: https://www.revenuecat.com/pricing/
- Expo in-app purchases guide: https://docs.expo.dev/guides/in-app-purchases/
- Expo tracking transparency: https://docs.expo.dev/versions/latest/sdk/tracking-transparency/
- AdMob iOS quick start: https://developers.google.com/admob/ios/quick-start
- AdMob native ads: https://developers.google.com/admob/ios/native
- AdMob privacy and UMP: https://developers.google.com/admob/ios/privacy
- Google Ad Manager iOS mediation for Meta: https://developers.google.com/ad-manager/mobile-ads-sdk/ios/mediation/meta
