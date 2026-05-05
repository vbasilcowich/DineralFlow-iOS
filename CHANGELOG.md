# Changelog

## beta 0.04.10

- localized backend snapshot, paywall, monetization, auth, and technical status copy so the visible app follows the selected EN/ES language consistently
- hardened button flows for legal links, social auth, and back navigation so missing URLs or provider failures show controlled UI feedback instead of raw errors
- improved compact iOS text handling across premium cards, social buttons, plan titles, and touched analysis headings
- added regression coverage for Cloudflare seed translations, status/error localization, and incomplete paywall legal-link contracts
- validated Home, Premium, Account, Login, Register, and Confidence on iPhone 17 in EN/ES against the live Cloudflare backend

## beta 0.04.9

- deployed the Cloudflare Worker backend to production at `https://dineralflow-api.v-basilcowich.workers.dev` and applied D1 remote migrations
- fixed `PUBLIC_BASE_URL` in the Worker environment so auth verification links resolve to the real deployed domain
- introduced a lean instruction system with `.instructions.md` plus `docs/ai_lookup.md` to reduce prompt size, context load, and token consumption
- updated backend, pricing, and setup documentation to prioritize the zero-cost deployment path and low-cost fallback path

## beta 0.04.8

- added a zero-cost Cloudflare Workers/D1 backend package with mobile-compatible snapshot, history, auth, entitlements, paywall, and RevenueCat webhook endpoints
- added D1 migrations, scheduled snapshot refresh behavior, seed data, and contract tests for the Worker backend
- documented the cheapest deployment path using Workers Free, D1 Free, Cron Triggers, and Resend Free, with Fly.io + Neon Free as the low-cost fallback
- updated environment guidance so the iOS app can point at a deployed `workers.dev` API and switch auth into backend mode

## beta 0.04.7

- extracted the floating utility dock into a shared app-level component so `Home`, `Auth`, `Premium`, `Confidence`, and legal screens all expose the same navigation layer
- added a dedicated `Home` shortcut to the dock and removed duplicated top-of-screen language controls from the secondary routes
- redesigned the premium plan cards with stronger contrast and more saturated purchase CTAs so the paywall reads like a buying surface instead of a muted settings panel
- updated screen spacing and tests to reflect the new global dock behavior while keeping `typecheck`, `lint`, and `jest` green

## beta 0.04.6

- rebuilt the top utility controls as a floating glass dock integrated into the home screen instead of a brittle inline header row
- fixed missing account and premium icons on web by adding the new symbol mappings and turning the controls into labeled actions
- prepared Google and Apple sign-in UX on login and register screens, with honest setup-required states when provider credentials are still missing
- added Expo social-auth dependencies, Apple Sign In capability wiring, and rollout documentation for enabling real provider credentials later
- expanded auth client coverage with social-login tests while keeping the app green on `typecheck`, `lint`, and `jest`

## beta 0.04.4

- redesigned the app shell around a friendlier public-data-first market brief while preserving the darker analysis core
- restored the bilingual switcher using US and Spain flags and reconnected the main screens to `EN / ES` state
- upgraded the cash-flow snapshot to show a highlighted primary flow plus a secondary flow with separate confidence readings
- added a dedicated confidence screen so free users can inspect how the confidence percentage is formed and premium can upsell deeper analysis and charts
- expanded test coverage for the new language switcher behavior, confidence route, and the updated snapshot panel hierarchy

## beta 0.04.5

- aligned the app with the authenticated backend contract for register, login, verify-email, logout, entitlements, and paywall
- added account auth flows plus local legal screens for terms, privacy, sources, and the financial disclaimer
- improved accessibility with shared button semantics, stable `testID`s, selected-state language flags, and accessible history window controls
- replaced visible `Score` copy with `Flow strength`, removed prototype wording from the main brief panel, and localized timestamps by app language
- expanded the paywall to expose all backend legal links and prepared the app config with an iOS `bundleIdentifier`

## beta 0.04.3

- integrated `RevenueCat Test Store` into the native billing layer with a real subscription driver built on `react-native-purchases`
- promoted native `RevenueCat` builds to `ready` while keeping `web` and `Expo Go` in an honest `requires_native_build` state
- preserved locally purchased premium access against a lagging free backend contract by mirroring RevenueCat entitlements through the existing contract layer
- added `expo-dev-client`, `eas.json`, local env wiring, iPad testing checklist, and new tests for RevenueCat billing, entitlement mirrors, and billing-state resolution

## beta 0.04.2

- moved monetization to a backend-sourced entitlements contract with a separate cached contract layer and explicit `ready / cached / stale / error` sync states
- added mobile history access gating and entitlements-aware limits for top flows and diagnostics so free and premium now diverge through the contract instead of only local UI rules
- introduced mobile contract helpers, paywall config loading, history hooks, and dedicated tests for entitlements, cached contract freshness, history access, and paywall behavior
- taught the paywall to refresh access on open and to use legal destinations from the current backend paywall contract

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
