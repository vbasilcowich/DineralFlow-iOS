# Guion de tareas

## Fase 0 - Fundacion del repo

- ajustar identidad del repo y documentacion base
- preparar scripts `lint`, `typecheck`, `test`, `doctor`
- dejar prompts pequenos por fases

## Fase 1 - Paridad de dominio

- portar contratos tipados del dashboard
- definir modelos de buckets, drivers, conflicts, assets y provenance
- centralizar i18n desde el inicio

## Fase 2 - Capa de red

- configurar cliente API y entornos
- conectar `health`, `snapshot`, `history` y `asset detail`
- manejar estados `live`, `partial_live` y `unavailable`
- avance actual: home conectada a `health` y `snapshot` con estado honesto de carga, error y refresco
- avance actual: ultimo `snapshot` valido persistido en cache local para fallback sin datos inventados

## Fase 3 - Shell de navegacion iOS

- tabs o shell minima
- stacks para drilldowns
- rutas para dashboard, provenance, trend y asset detail

## Fase 4 - Dashboard principal

- cabecera del regimen
- workbench de cestas
- assets and regions
- recent trend

## Fase 5 - Drilldowns

- provenance
- basket detail
- drivers
- frictions
- asset detail

## Fase 6 - Charts y contenido

- charts tactiles
- copy mas claro
- refinado de estados vacios y degradados

## Fase 7 - Calidad y entrega

- tests unitarios
- pruebas manuales en Expo Go
- checklist para paso a Mac o EAS si hace falta

## Fase 8 - Monetizacion fase 1

- integrar suscripciones
- definir tiers `free` y `premium`
- anadir paywall y `restore purchases`
- sincronizar entitlements entre app y backend
- fijar el producto en modo `snapshot-based`
- retirar del posicionamiento comercial la dependencia de `Twelve Data` y `Alpha Vantage`
- avance actual: gating visible de `history`, `drilldowns` y `alerts` en la home y el paywall
- avance actual: historico real conectado al backend con ventanas cortas en `free` y largas en `premium`
- avance actual: contrato `entitlements/paywall` definido en local para futura sincronizacion backend/app
- siguiente paso documental cerrado: integrar `RevenueCat Test Store` en builds de desarrollo y dejar checklist de prueba en iPad
- avance actual:
  - `RevenueCat Test Store` integrado en la app con `react-native-purchases`
  - el driver de suscripcion ya usa `purchase`, `restore` e `hydrate` reales en builds nativos
  - `Expo Go` y `web` siguen mostrando solo el shell del paywall
  - el repo ya incluye `eas.json` y el checklist [docs/12_ipad_revenuecat_test_store_checklist.md](E:/VsCodeApps/DineralFlow-iOS/docs/12_ipad_revenuecat_test_store_checklist.md)
- decision operativa actual:
  - `Expo Go` solo para preview del flujo
  - `development build` para pruebas reales de RevenueCat
  - usar `Test Store public API key` en debug/dev builds
  - migrar a `iOS public SDK key` solo en builds de App Store/TestFlight
- prerequisitos de prueba en iPad:
  - `expo-dev-client`
  - `EAS CLI`
  - cuenta `Expo`
  - cuenta de pago `Apple Developer` para firmar builds de dispositivo iOS
  - dispositivo registrado si usamos distribucion interna `ad hoc`
- referencia operativa: [docs/12_ipad_revenuecat_test_store_checklist.md](E:/VsCodeApps/DineralFlow-iOS/docs/12_ipad_revenuecat_test_store_checklist.md)

## Fase 9 - Monetizacion fase 2

- anadir `native ads` solo al tier gratuito
- crear `ad config` remoto y kill switch
- aplicar frequency caps y exclusiones de pantallas criticas

## Fase 10 - Monetizacion fase 3

- evaluar mediacion con Meta
- comparar `AdMob only` vs `AdMob + Meta`
- activar solo si mejora ingresos sin empeorar privacidad, operacion o UX

## Fase 11 - Release monetizable

- bateria de pruebas final
- checklist legal y App Store
- validacion de costes y licencias de market data
- confirmar que la promesa comercial no depende de feeds con derechos no validados
