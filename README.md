# DineralFlow iOS

Repositorio nuevo para la migracion de `DineralFlow` desde web hacia una app iOS centrada en iPhone.

## Decision tecnica actual

- Base recomendada: `Expo + React Native + Expo Router + TypeScript`
- Motivo: permite trabajar desde Windows, reutilizar logica de dominio del proyecto web y probar rapido sin depender de Xcode en cada iteracion
- Objetivo de producto: mantener paridad funcional con el dashboard web, sus drilldowns, el contexto de procedencia y la regla de no inventar datos

## Que podemos probar en este PC

- `npm run web`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run doctor`

## Que no podemos hacer totalmente aqui

- Ejecutar el simulador iOS nativo de Xcode
- Firmar builds iOS nativos locales
- Publicar en App Store o TestFlight

## Dependencias y costes relevantes

- `Node.js`, `Expo`, `React Native`, `TypeScript`, `Jest`: libres y gratuitas
- `GitHub CLI`: libre y gratuita
- `Expo Go` en iPhone: gratuita para desarrollo
- `Apple Developer Program`: de pago si queremos distribuir por TestFlight o App Store
- `macOS + Xcode`: necesarios para simulador iOS nativo y ciertos pasos de firma/build local

## Estructura documental

- [docs/00_execution_guide.md](E:/VsCodeApps/DineralFlow-iOS/docs/00_execution_guide.md)
- [docs/01_feature_inventory.md](E:/VsCodeApps/DineralFlow-iOS/docs/01_feature_inventory.md)
- [docs/02_architecture_decision.md](E:/VsCodeApps/DineralFlow-iOS/docs/02_architecture_decision.md)
- [docs/03_task_script.md](E:/VsCodeApps/DineralFlow-iOS/docs/03_task_script.md)
- [docs/04_task_review.md](E:/VsCodeApps/DineralFlow-iOS/docs/04_task_review.md)
- [docs/05_monetization_architecture.md](E:/VsCodeApps/DineralFlow-iOS/docs/05_monetization_architecture.md)
- [docs/06_pricing_and_cost_model.md](E:/VsCodeApps/DineralFlow-iOS/docs/06_pricing_and_cost_model.md)
- [docs/07_backend_service_plan.md](E:/VsCodeApps/DineralFlow-iOS/docs/07_backend_service_plan.md)
- [docs/08_monetization_test_plan.md](E:/VsCodeApps/DineralFlow-iOS/docs/08_monetization_test_plan.md)
- [docs/09_user_flow_explained.md](E:/VsCodeApps/DineralFlow-iOS/docs/09_user_flow_explained.md)
- [docs/10_release_readiness_monetization.md](E:/VsCodeApps/DineralFlow-iOS/docs/10_release_readiness_monetization.md)
- [docs/agent_prompts](E:/VsCodeApps/DineralFlow-iOS/docs/agent_prompts)

## Comandos

```bash
npm install
npm run web
npm run lint
npm run typecheck
npm run test
npm run doctor
```

## Configuracion de API local

- por defecto la app usa `http://127.0.0.1:8000`
- para probarla en `Expo Go` sobre un iPhone, define `EXPO_PUBLIC_API_BASE_URL` con la IP LAN del backend, por ejemplo `http://192.168.1.20:8000`
- la home puede conservar el ultimo `snapshot` valido en cache local para mostrarlo si falla el refresco en vivo
- la monetizacion de fase 1 usa `EXPO_PUBLIC_BILLING_PROVIDER=mock`
- para el salto posterior a `RevenueCat`, la app ya reconoce:
  - `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
  - `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`
  - `EXPO_PUBLIC_REVENUECAT_OFFERING_ID`
- se incluye una plantilla en [ .env.example](E:/VsCodeApps/DineralFlow-iOS/.env.example)

## Estado actual

- Nuevo repo local creado en `E:\\VsCodeApps\\DineralFlow-iOS`
- Shell inicial de DineralFlow creada sobre Expo Router
- Plan de migracion documentado
- Infraestructura inicial de testing preparada para Windows
- Validacion local completada: `lint`, `typecheck`, `test`, `doctor` y `npm run web`
- Preview inicial del backend local integrada en la home
- Fallback local con cache del ultimo `snapshot` valido integrado en la app
