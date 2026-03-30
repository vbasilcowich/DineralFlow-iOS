# Changelog

## beta 0.04.1

- added visible `free / premium` gating cards on the home screen for longer history, deeper drilldowns, and alerts
- made the live snapshot panel behave differently by tier so free stays concise while premium shows a wider evidence layer
- taught the paywall to open with feature-specific copy based on the upgrade path that led into it
- added reusable gating UI and expanded test coverage for monetization rules, home gating, paywall context, and snapshot panel behavior

## beta 0.04

- implemented the phase 1 monetization foundation with a local `free / premium` entitlement model
- added a prototype paywall, restore flow, and device-local premium activation without real billing credentials
- wired a monetization provider into the app root and reflected the current tier in the home snapshot shell
- gated part of the snapshot experience so the free tier stays useful while premium signals deeper access
- extracted a small subscription driver layer and a `RevenueCat-ready` billing config so the stub flow is easier to replace with real billing later
- added monetization cache, provider, billing-config, and integration tests and kept `lint`, `typecheck`, and `test` green

## beta 0.03

- redefined the iOS product around a snapshot-based `free / premium` launch instead of a generic migration shell
- updated the home and roadmap screens to reflect public-data-first positioning and legal/monetization guardrails
- added documentation for monetization architecture, costs, backend hosting, testing, release readiness, and a plain-language product walkthrough
- added new agent prompts for subscription, native ads, Meta mediation, and monetization QA
- documented and reflected in the app that `Twelve Data` and `Alpha Vantage` are not part of the intended commercial launch posture
- added presenter coverage for prototype-only providers and kept `lint`, `typecheck`, and tests green

## beta 0.02

- connected the `Dashboard` tab to the live local DineralFlow backend preview
- added a cached snapshot fallback with `AsyncStorage` instead of inventing new figures when refresh fails
- improved web API resolution for localhost previews and surfaced clearer sync diagnostics in the preview panel
- added presenter and cache tests, and ignored local Expo preview log files

## beta 0.01

- created the new `DineralFlow-iOS` repository as the iPhone-focused migration target
- documented the migration plan, architectural decision, execution guide, task review, and agent prompts
- installed and aligned the Windows development stack for Expo, TypeScript, Jest, and Expo Doctor
- replaced the Expo starter screens with an initial DineralFlow shell using `Dashboard` and `Roadmap` tabs
- added a sober financial visual system and reusable shell components
- verified the local toolchain with `lint`, `typecheck`, `test`, `doctor`, and `npm run web`
