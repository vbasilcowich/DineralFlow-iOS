# Release Readiness for Monetization

## Goal

Define the final checklist before we activate paid monetization in iOS.

## Product

- free vs premium boundaries are documented
- premium actually offers ongoing value
- no critical dashboard reading depends on ads
- premium is fully ad-free

## Apple and App Store

- Apple Developer Program active
- in-app purchase products created in App Store Connect
- pricing and subscription durations configured
- restore purchases UI is present
- renewal and cancellation copy is present
- app metadata discloses subscription requirement where needed

## Subscription tooling

- RevenueCat project created
- products and entitlements mapped correctly
- webhook connected to backend
- test users and sandbox accounts prepared

## Backend

- `entitlements` endpoint working
- `paywall` endpoint working
- feature flags working
- ad config endpoint ready even if ads are disabled
- logs and alerts for webhook failures

## Legal

- terms and privacy policy published
- financial disclaimer visible
- market data attribution requirements implemented
- pricing display rights reviewed for every visible paid data series

## Ads phase 2 readiness

- AdMob account configured
- native ad units created
- UMP or equivalent consent flow prepared
- ATT strategy decided
- no ads on forbidden screens
- remote kill switch tested

## Metrics

- free to premium funnel events tracked
- restore purchase events tracked
- churn and expiration tracked
- ad metrics isolated from subscription metrics

## Operational

- staging environment
- production environment
- rollback plan
- support email ready
- refund and billing support flow defined

## Do not launch if

- subscription state can desync between app and backend
- restore purchases is missing
- privacy labels are incomplete
- we have not validated external display rights for visible paid market data

## Official sources

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple Developer Program membership: https://developer.apple.com/programs/enroll/
- Apple app previews disclosure note: https://developer.apple.com/support/app-previews/
- RevenueCat pricing: https://www.revenuecat.com/pricing/
- AdMob privacy and UMP: https://developers.google.com/admob/ios/privacy

