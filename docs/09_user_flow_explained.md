# How DineralFlow Works

## Plain-language guide

This document explains the app in a more human way, without too much jargon.

## The short version

`DineralFlow` is not supposed to invent market data inside the phone.

The phone app is the screen.
The backend is the engine room.

## What happens when you open the app

1. the app opens
2. it asks the backend for the latest market snapshot
3. the backend checks which data sources are available
4. the backend builds a market reading from those sources
5. the app shows the result
6. if the live request fails, the app can show the last valid snapshot it saved locally

## Where the numbers come from

Right now, our test stack is based mainly on:

- `Twelve Data` for part of market data
- `FRED` for macro data
- `EIA` for energy data
- `Alpha Vantage` as an extra provider and fallback

The app should always explain:

- where the data came from
- when it was last updated
- whether it is fully live, partially live, or cached

## Why we do not want the full API inside the app

Because then we would have to put provider keys inside the phone app.

That would be bad because:

- the keys could leak
- every user would hit the providers directly
- we would burn through rate limits faster
- it would be harder to control freshness and consistency

So the better idea is:

- backend talks to the data providers
- app talks only to our backend

## How free and premium should work

### Free

The free version should let people understand the product.

It should show:

- the main dashboard
- some basket summaries
- some history
- enough information to trust the product

It should not show:

- the full depth of every drilldown
- the longest histories
- advanced alerts
- the most premium convenience features

### Premium

Premium should unlock the deeper value:

- more detail
- more history
- more drilldowns
- watchlists
- alerts
- no ads

## Why we want subscriptions first

Because this is a finance product.

People need to trust it.
If we start by filling it with ads, the product can feel cheap before it proves its value.

Subscription first means:

- cleaner UX
- easier product positioning
- less privacy complexity on day 1
- clearer App Store submission story

## Where ads would fit later

Only in the free version.

And only in places that do not break the reading experience.

Good places:

- after the first full block of content
- at the end of a long free detail page
- in a clearly labeled sponsored module

Bad places:

- inside charts
- between score and explanation
- on the paywall
- in alerts
- on loading or error screens

## What we would pay for

### Core costs

- Apple Developer Program: `99 USD / year`
- hosting backend: likely `Railway Pro` from `20 USD / month`
- subscription tooling: `RevenueCat`, free until `2.5k USD` monthly tracked revenue, then `1%`
- optional Expo cloud services if we need them

### The expensive part

The expensive part is not hosting.

The expensive part is commercial market data rights.

That is why we should be careful about which raw prices we show directly to paid users.

## Why data licensing matters so much

Some providers are fine for internal or trial use, but not automatically for showing price data to paying users in an app.

So our plan has to be:

- keep the product honest
- show derived analytics where possible
- buy commercial display rights only for the data we really need to expose

## How we save money at the beginning

The cheapest path is not to refresh the whole world every time someone opens the app.

Instead:

1. the backend collects data a few times per day
2. it stores a finished snapshot
3. all users read that stored snapshot
4. the next refresh replaces it when new data is available

This is much cheaper than:

- live calls on every app load
- lots of raw chart requests
- pretending we are a real-time terminal from day 1

## What this means for the user

The app can still be useful without being real-time.

For example:

- "latest market snapshot"
- "updated today"
- "last refreshed after the US close"
- "latest macro release processed"

That is honest, cheaper, and usually enough for this kind of product at the start.

## Which free sources are safer

The safest backbone for a cheap early version is:

- `FRED`
- `EIA`
- `ECB`
- `World Bank`

These are much better candidates for public-facing analytics than building the whole product around free stock quote APIs.

## Which free sources are riskier for a paid app

- `Twelve Data Basic`
- `Alpha Vantage free`

Why?

Because the issue is not just technical access.
The issue is whether the plan allows the kind of external commercial display we want.

So we should use them carefully for testing and internal modelling unless the paid tier and rights are clearly validated.

## The practical architecture we are heading toward

### App

- UI
- local cache
- paywall
- free/premium logic
- later, native ad rendering for free only

### Backend

- market data collection
- scoring
- user entitlement status
- paywall config
- ad config
- feature flags

## Simple summary

The app should stay light.
The backend should stay smart.
The free tier should prove value.
The premium tier should monetize trust.
Ads should come later, and only where they do not damage the product.

## Official sources

- Apple Developer Program membership: https://developer.apple.com/programs/enroll/
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- RevenueCat pricing: https://www.revenuecat.com/pricing/
- Railway pricing: https://railway.com/pricing
- Expo pricing: https://expo.dev/pricing
- Twelve Data business pricing: https://twelvedata.com/pricing-business
- Alpha Vantage premium: https://www.alphavantage.co/premium/
- FRED API terms: https://fred.stlouisfed.org/docs/api/terms_of_use.html
- EIA copyrights and reuse: https://www.eia.gov/about/copyrights_reuse.php
