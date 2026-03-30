# Monetization Foundation Prompt

You are implementing phase 1 monetization for `DineralFlow-iOS`.

## Goal

Add a subscription-first foundation without ads.

## Scope

- integrate subscription state management suitable for iOS
- prefer `RevenueCat` for purchase state and entitlements
- add local models for `free` and `premium`
- add feature gating for dashboard depth, history windows, watchlists, and alerts
- add paywall entry points
- add `Restore Purchases`
- keep the app functional if purchase services are temporarily unavailable
- align the product with a `snapshot-based` and `public-data-first` launch posture

## Constraints

- do not add ads in this phase
- do not put market-data provider keys in the app
- assume backend remains the source of truth for market data
- do not position `Twelve Data` or `Alpha Vantage` as part of the intended commercial launch offer
- use development-build compatible choices for Expo and iOS native code
- keep UI honest: no fake unlocked state, no invented subscription status

## Required outputs

- code changes
- updated docs if architecture changes
- tests for gating, restore flow state, and free vs premium behavior
- a short verification checklist

## Acceptance criteria

- free mode works
- premium mode unlocks intended screens
- restore purchases is visible
- no premium-only content unlocks without entitlement
- tests cover the gating rules
