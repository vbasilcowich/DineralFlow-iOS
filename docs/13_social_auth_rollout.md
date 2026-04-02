# Social Auth Rollout

This phase prepares `DineralFlow-iOS` for Google and Apple sign-in without pretending the providers are already active in every environment.

## What is already implemented

- The home header now exposes account, language, and premium controls in the order we want to keep.
- Login and register screens include:
  - `Continue with Google`
  - `Continue with Apple`
- The iOS app can exchange a verified social identity token with the backend through:
  - `POST /api/mobile/auth/social/google`
  - `POST /api/mobile/auth/social/apple`
- The backend keeps social identities linked to local users, then creates a normal authenticated session.

## What still needs real credentials

### Google

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- Optional: `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- Backend allowlist:
  - `GOOGLE_AUTH_ALLOWED_CLIENT_IDS`

### Apple

- Native iOS build with `usesAppleSignIn`
- Backend allowlist:
  - `APPLE_AUTH_ALLOWED_AUDIENCES`
- For the native iOS app, this should normally include:
  - `com.dineralflow.ios`

## Current behavior

- If the provider is not configured, the app shows a clear message instead of simulating a successful social sign-in.
- Google can be wired from web or native once the OAuth client IDs exist.
- Apple sign-in is visible only on iOS and stays disabled in web preview.

## Why this rollout is staged

- Social sign-in changes security boundaries, not just UI.
- Premium access is server-authoritative, so the backend must validate the identity token before a session is created.
- This keeps the product honest while letting us finish the UX and the account flow first.
