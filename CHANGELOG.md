# Changelog

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
