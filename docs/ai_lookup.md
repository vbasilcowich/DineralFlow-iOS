# AI Lookup Map

Open this file only when the task needs file-level routing.

## UI and Layout

- Shared shell: `components/shell.tsx`
- Bottom navigation: `components/floating-app-dock.tsx`
- Home screen: `app/(tabs)/index.tsx`
- Snapshot panel: `components/live-snapshot-panel.tsx`

## Dashboard Data

- Live snapshot fetch/cache: `hooks/use-dashboard-preview.ts`
- History fetch: `hooks/use-dashboard-history.ts`
- API client: `lib/dashboard-api.ts`
- Formatting and labels: `lib/dashboard-presenter.ts`

## Auth

- Auth state and flows: `hooks/use-auth.tsx`
- Auth endpoints: `lib/auth-api.ts`
- Auth config/types: `lib/auth.ts`
- Main auth tests: `__tests__/use-auth.test.tsx`, `__tests__/auth-api.test.ts`

## Monetization

- Monetization state: `hooks/use-monetization.tsx`
- Entitlements contract: `lib/entitlements-contract.ts`
- Entitlements API bridge: `lib/entitlements-api.ts`
- Paywall UI: `app/paywall.tsx`

## Backend

- Worker entry: `backend-cloudflare/src/index.mjs`
- Routes and contract behavior: `backend-cloudflare/src/router.mjs`
- Seed data: `backend-cloudflare/src/seed.mjs`
- Persistence: `backend-cloudflare/src/store.mjs`
- Contract tests: `backend-cloudflare/tests/contracts.test.mjs`
- Setup and deploy notes: `backend-cloudflare/README.md`

## Product and Architecture

- Product direction: `docs/02_architecture_decision.md`
- Monetization architecture: `docs/05_monetization_architecture.md`
- Backend service posture: `docs/07_backend_service_plan.md`
