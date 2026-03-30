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

## Estado actual

- Nuevo repo local creado en `E:\\VsCodeApps\\DineralFlow-iOS`
- Shell inicial de DineralFlow creada sobre Expo Router
- Plan de migracion documentado
- Infraestructura inicial de testing preparada para Windows
- Validacion local completada: `lint`, `typecheck`, `test`, `doctor` y `npm run web`

## Bloqueo actual

- El remoto configurado `https://github.com/vbasilcowich/DineralFlow-iOS.git` no existe o no es accesible desde este entorno
- Para completar la parte GitHub necesitaremos crear ese repo real o decidir otra URL de destino
