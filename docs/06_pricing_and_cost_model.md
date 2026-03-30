# Pricing and Cost Model

## Important note

Prices below were reviewed on `2026-03-30` from official sources and may change.

For planning, split costs into:

- development and distribution
- backend and hosting
- subscriptions tooling
- market data
- ads

## 1. Development and distribution costs

### Apple Developer Program

- `99 USD / year`
- required to distribute on the App Store and TestFlight

### Expo

- Expo open source tooling is free
- `EAS Free`: available with limited quota
- `EAS Starter`: `19 USD / month + usage`
- `EAS Production`: `199 USD / month + usage`

## Practical recommendation

- start with Expo free or local/dev builds if enough
- move to `EAS Starter` only when native build cadence becomes painful

## 2. Subscription tooling

### RevenueCat

- free up to `2.5k USD` monthly tracked revenue
- `1%` of monthly tracked revenue after `2.5k USD`

## Practical recommendation

- use RevenueCat from day 1
- its cost is small compared with market data and saves a lot of implementation risk

## 3. Hosting and backend

### Railway

- `Hobby`: `5 USD` minimum usage
- `Pro`: `20 USD` minimum usage
- public API, healthchecks, domains, secrets, cron jobs, private networking

### Vercel

- `Hobby`: personal non-commercial use only
- `Pro`: `20 USD / month + usage`

## Practical recommendation

- for the iOS product backend, use `Railway Pro` first
- keep `Vercel Pro` optional for the web frontend only

## 4. Market data costs

This is the most important line item.

## Current test providers

### FRED

- no listed subscription fee in our current use
- legal caveat: some series may have third-party restrictions

### EIA

- government publications are in the public domain
- attribution is still recommended

### Alpha Vantage

- free tier: `25 API requests per day`
- premium starts at `49.99 USD / month` for `75 requests/min`
- also lists `99.99`, `149.99`, `199.99`, and `249.99 USD / month` tiers

### Twelve Data

- Basic plan: free
- current business pricing page lists:
- `Venture`: `499 USD / month` or `4,990 USD billed yearly`
- `Enterprise`: `1,099 USD / month` or `10,992 USD billed yearly`
- the same pricing page also shows `Venture from 149 USD / month` in its comparison grid
- conclusion: we must validate the final commercial quote with Twelve Data before committing budget

## Most important conclusion

Infrastructure is not the expensive part.

The expensive part is commercial market data with external display rights.

## 5. Ad stack costs

### Google AdMob

- no upfront platform subscription is required to get started
- monetization depends on impressions, fill, geography, consent, and ad demand

### Meta mediation

- do not budget it as phase 1 cost
- revisit only in phase 3
- the integration burden is real, but the revenue upside is uncertain until we test live traffic

## 6. Apple platform commission

### Small Business Program

- reduced commission rate of `15%` on paid apps and in-app purchases for eligible developers up to the threshold described by Apple

## Practical assumption for early stage planning

- if eligible, plan with `15%` Apple commission
- if not eligible later, review unit economics again

## 7. Suggested monthly budget ranges

## Stage A: prototype / internal pilot

- Apple Developer Program: `~8.25 USD / month` if annualized
- Railway Pro: `20 USD / month`
- RevenueCat: `0 USD` if under threshold
- Expo: `0 to 19 USD / month`
- Market data: keep current test setup, but do not treat it as final commercial licensing

## Stage B: first paid release

- Apple Developer Program: `99 USD / year`
- Railway Pro: `20 USD / month`
- RevenueCat: `0 USD` to low variable cost
- Expo Starter optional: `19 USD / month`
- Twelve Data commercial plan likely becomes the dominant cost

## Stage C: scaled paid product

- Apple Developer Program
- Railway Pro or higher
- RevenueCat variable fee
- Twelve Data commercial plan
- observability and support tools
- optional Vercel Pro for the web product

## 8. Recommendation on cost discipline

1. keep backend and hosting lean
2. use RevenueCat early
3. avoid adding ads until subscription and retention data exist
4. pay for commercial market data only when we know exactly which displayed series need those rights

## 9. Budget warning

If we sell the iOS app before solving commercial market data rights, we risk legal and operational problems.

That risk is bigger than overspending on hosting by `20-40 USD / month`.

## 10. Cheapest viable path

If the priority is to cut costs aggressively at the start, the right move is not "find more free real-time APIs".

The right move is:

- stop depending on per-app-load provider calls
- stop aiming for real-time in v1
- publish scheduled snapshots from the backend
- expose more derived analytics and less raw third-party market data

## Recommended low-cost operating model

### App behavior

- the app never calls external data vendors directly
- the app only calls our backend
- the backend serves the latest stored snapshot plus cached history

### Backend behavior

- scheduled jobs fetch data a limited number of times per day
- snapshots are stored in the database
- users all read from the same stored snapshot until the next refresh

## Suggested snapshot cadence

### Cheapest safe starting point

- `1-4 snapshots/day` for general market regime
- refresh shortly after major market closes or key macro release windows
- energy data refreshed on publication cadence, not every app open

### If we need more freshness later

- move to `6-12 snapshots/day`
- only move to `24/day` if the source licenses and unit economics actually support it

## Why 24 snapshots per day may still be wasteful

If a series is daily, weekly, or event-driven, publishing hourly snapshots does not create new information.

It only creates more compute and more apparent freshness.

## 11. Cheapest content strategy

### Show first

- basket scores
- confidence
- drivers and frictions
- provenance
- snapshot history
- macro and energy series from public or quasi-public sources

### Limit at first

- raw real-time quote charts
- per-asset intraday charts
- high-frequency refresh
- wide market coverage across many exchanges

## 12. Cheapest provider strategy

### Good low-cost backbone

- `FRED` for macro
- `EIA` for energy
- `ECB` for euro area statistics
- `World Bank` for slower structural indicators

### Use with caution

- `Alpha Vantage free`
- `Twelve Data free/basic`

They may be acceptable for development or internal evaluation, but they are not a safe foundation for external paid display unless the exact rights are covered by the paid tier and product terms.

## 13. Recommended launch posture

The cheapest serious launch is:

- no real-time promise
- no per-user vendor calls
- scheduled backend snapshots
- paid app value based on analytics, explanations, and derived signals
- limited direct display of third-party raw market data until commercial rights are validated

## 14. What this changes in product terms

The app should describe the data as:

- latest available snapshot
- refreshed on a scheduled basis
- live when applicable, but not guaranteed real-time

This is cheaper, safer, and easier to defend legally than claiming real-time intelligence everywhere.

## Official sources

- Apple Developer Program membership: https://developer.apple.com/programs/enroll/
- Apple membership details and fees: https://developer.apple.com/programs/whats-included/
- App Store Small Business Program: https://developer.apple.com/app-store/small-business-program/
- RevenueCat pricing: https://www.revenuecat.com/pricing/
- Expo pricing: https://expo.dev/pricing
- Expo plans: https://docs.expo.dev/billing/plans/
- Railway pricing: https://railway.com/pricing
- Railway Public API: https://docs.railway.com/integrations/api
- Vercel pricing: https://vercel.com/pricing
- Twelve Data business pricing: https://twelvedata.com/pricing-business
- Twelve Data terms: https://twelvedata.com/terms
- ECB statistics reuse policy: https://www.ecb.europa.eu/stats/ecb_statistics/governance_and_quality_framework/html/usage_policy.en.html
- ECB Data API: https://data-api.ecb.europa.eu/service/
- World Bank dataset terms: https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets
- Alpha Vantage support: https://www.alphavantage.co/support/
- Alpha Vantage premium: https://www.alphavantage.co/premium/
- Alpha Vantage realtime data policy: https://www.alphavantage.co/realtime_data_policy/
- FRED API terms: https://fred.stlouisfed.org/docs/api/terms_of_use.html
- EIA copyrights and reuse: https://www.eia.gov/about/copyrights_reuse.php
