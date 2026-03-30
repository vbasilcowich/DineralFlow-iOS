# Monetization Quality Prompt

You are running QA for iOS monetization in `DineralFlow-iOS`.

## Goal

Verify subscriptions, entitlement syncing, fallback behavior, and future ad safety.

## Scope

- free vs premium gating
- restore purchases
- expiration and downgrade behavior
- cached snapshot behavior
- privacy and App Store readiness
- ad placement safety for future phases

## Required checks

- purchase success
- restore success
- premium unlock without app restart
- downgrade after expiration
- no ads in premium
- no ads in forbidden screens
- ATT and consent readiness if ads are enabled
- legal and subscription copy present

## Output format

- findings first, ordered by severity
- explicit residual risks
- short summary of what passed

