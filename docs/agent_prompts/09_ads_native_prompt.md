# Native Ads Prompt

You are implementing phase 2 monetization for `DineralFlow-iOS`.

## Goal

Add native ads only to the free tier without damaging the product experience.

## Scope

- integrate `Google AdMob`
- use native ads only
- add backend-driven ad config and a remote kill switch
- add frequency caps
- ensure premium users never see ads

## Forbidden placements

- onboarding
- login
- signup
- paywall
- loading or error screens
- main score header
- charts
- driver or friction explanations
- alerts

## Allowed placements

- after the first complete block on the free home screen
- at the end of long free detail screens
- in clearly separated sponsored blocks

## Constraints

- no interstitials
- no rewarded ads
- no app open ads in this phase
- do not block core reading of the dashboard
- follow privacy and consent requirements

## Required outputs

- code changes
- ad placement rules
- kill switch support
- tests for premium no-ads behavior and placement logic
- updated docs if needed

## Acceptance criteria

- free users can see native ads only in approved locations
- premium users see no ads
- ad load failure leaves a clean UI
- ads can be disabled remotely

