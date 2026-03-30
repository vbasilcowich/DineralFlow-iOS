# Monetization Test Plan

## Goal

Create a practical QA matrix for:

- subscriptions
- free vs premium gating
- future native ads
- backend fallback
- App Store review and privacy readiness

## Test groups

## A. Subscription core

- user can open the paywall from intended entry points
- user sees plan name, price, billing period, and restore purchases
- successful purchase unlocks premium without app restart
- restore purchases works on a fresh install
- expired subscription downgrades the user correctly
- canceled subscription remains active until expiration
- backend entitlement state matches app state

## B. Free vs premium gating

- free users see only allowed baskets and shorter history
- premium users see full drilldowns
- premium users never see ads
- fallback cached snapshot does not incorrectly unlock premium
- kill switch can disable premium features if needed without crashing the app

## C. Backend and cache

- app loads real snapshot when backend is available
- app shows cached snapshot when backend refresh fails
- entitlement refresh failure does not corrupt previous valid entitlement state
- stale state is labeled clearly

## D. Ads phase 2

- no ads in premium
- no ads in forbidden screens
- native ad renders only in approved placements
- ad request failure leaves no broken placeholder
- frequency caps work per session and per day
- remote kill switch disables all ads without new binary

## E. Privacy and App Store

- ATT prompt only appears if needed for the chosen ad setup
- UMP or equivalent consent flow appears where legally required
- privacy labels are updated to match real SDK behavior
- restore purchases is visible
- subscription terms are clear before purchase
- no personalized investment advice wording appears

## F. Billing and analytics

- conversion funnel events are sent correctly
- free to premium conversion can be measured
- premium churn events can be measured
- ad impression and ad revenue events do not exist in premium flows

## Automation targets

### Unit tests

- entitlement reducer
- paywall presenter
- feature gating rules
- ad placement eligibility rules
- frequency cap logic

### Integration tests

- snapshot + entitlement boot sequence
- RevenueCat purchase success and restore mocks
- premium downgrade flow
- cached snapshot with stale entitlement

### Manual tests

- payment UI
- interrupted purchase
- App Store sandbox behavior
- no visual overlap between content and ads
- low connectivity behavior

## Release gates

### Phase 1 gate

- subscription purchase works
- restore works
- free and premium gating works
- App Store copy is ready

### Phase 2 gate

- native ads only in approved placements
- premium remains ad-free
- privacy flow validated
- remote kill switch tested

### Phase 3 gate

- Meta mediation tested in a separate branch or environment
- no regression in fill, crashes, or privacy friction
- compare AdMob-only vs AdMob+Meta on real cohorts

## Success metrics to watch

- conversion from free to premium
- trial to paid conversion
- churn
- ARPDAU
- retention day 1, 7, and 30
- session length
- drilldown open rate
- ad impact on retention

## Official sources

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Expo in-app purchases guide: https://docs.expo.dev/guides/in-app-purchases/
- Expo tracking transparency: https://docs.expo.dev/versions/latest/sdk/tracking-transparency/
- AdMob iOS privacy guide: https://developers.google.com/admob/ios/privacy
- AdMob native ads: https://developers.google.com/admob/ios/native
- RevenueCat pricing and docs: https://www.revenuecat.com/pricing/

