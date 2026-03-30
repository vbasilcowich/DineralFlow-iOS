# Checklist de prueba en iPad con RevenueCat Test Store

## Objetivo

Validar el flujo `free -> paywall -> premium -> restore` en un iPad real sin depender todavia de `App Store Connect`.

## Lo que ya esta preparado en el repo

- `react-native-purchases`
- `expo-dev-client`
- configuracion local de RevenueCat en `.env.local`
- offering `default`
- entitlement `premium`
- productos `monthly` y `yearly` en `Test Store`
- [eas.json](E:/VsCodeApps/DineralFlow-iOS/eas.json) con perfil `development`

## Lo que necesitas de tu lado

- cuenta `Expo`
- cuenta de pago `Apple Developer`
- iPad fisico
- la app `Expo Go` no basta para compras reales

## Flujo correcto de prueba

1. Tener el backend local encendido si quieres probar tambien `snapshot`, `history` y gating contra API.
2. En el repo iOS, usar el entorno local de RevenueCat ya preparado.
3. Lanzar un build de desarrollo iOS:
   - `npm run build:ios:development`
4. Instalar ese build en el iPad.
5. Abrir la app usando `expo start --dev-client` o `npm run start:dev-client`.
6. Probar:
   - home en `free`
   - apertura del paywall
   - compra mensual
   - compra anual
   - `restore purchases`
   - conservacion del tier premium cuando el backend siga devolviendo `free`

## Lo que NO valida esta fase

- compra real con Apple Sandbox
- productos reales de `App Store Connect`
- TestFlight
- cobro real a usuario final

## Paso posterior

Cuando pasemos de `Test Store` a Apple real:

- crear app iOS en RevenueCat para `App Store`
- sacar la `iOS public SDK key`
- sustituir `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`
- crear productos en `App Store Connect`
- probar en Sandbox/TestFlight

## Referencias oficiales

- RevenueCat Expo installation: https://www.revenuecat.com/docs/getting-started/installation/expo
- RevenueCat Test Store: https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store
- Expo development builds: https://docs.expo.dev/develop/development-builds/create-a-build/
