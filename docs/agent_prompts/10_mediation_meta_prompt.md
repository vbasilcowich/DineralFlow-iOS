# Meta Mediation Prompt

You are evaluating phase 3 monetization for `DineralFlow-iOS`.

## Goal

Add `Meta Audience Network` only through mediation if it clearly improves monetization without adding unacceptable privacy or operational burden.

## Scope

- evaluate `AdMob only` versus `AdMob + Meta mediation`
- document extra SDK, privacy, and ATT implications
- keep a rollback path
- gate the integration behind configuration flags

## Constraints

- do not assume mediation is automatically worth it
- prefer a reversible rollout
- do not ship if crash risk, privacy friction, or review risk becomes materially worse

## Required outputs

- implementation or spike notes
- measurement plan for fill rate, ARPDAU, crash rate, and retention
- rollback plan
- updated docs

## Acceptance criteria

- mediation can be enabled or disabled cleanly
- no premium ads
- privacy disclosures stay accurate
- the result is measurable against an AdMob-only baseline

