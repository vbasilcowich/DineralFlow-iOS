# Decision de arquitectura

## Opcion recomendada

`Expo + React Native + Expo Router + TypeScript`

## Por que gana

- funciona desde Windows
- reutiliza bien el conocimiento y parte del modelo mental del frontend actual
- permite pruebas locales reales en web y en Expo Go
- facilita una futura salida a iOS sin rehacer todo el proyecto
- reduce la dependencia inmediata de macOS para las primeras fases

## Otras opciones descartadas por ahora

### SwiftUI nativo

- mejor integracion iOS
- pero bloquea el flujo principal en este PC porque necesita macOS y Xcode

### Capacitor

- util para envoltorio web
- pero no es la mejor base si queremos una experiencia iOS realmente adaptada a tactil, navegacion y layouts nativos

## Stack objetivo

- `Expo Router` para navegacion
- `TypeScript` para dominio y contratos
- cliente API tipado
- capa de estado ligera
- cache local y fetch declarativo en fases posteriores
- charts nativos en una fase separada, no en el scaffold inicial

## Que requiere macOS mas adelante

- simulador iOS nativo
- desarrollo nativo avanzado
- firma local de builds iOS
- depuracion Xcode

## Que puede requerir pago

- `Apple Developer Program` para TestFlight y App Store
- servicios cloud opcionales de build si decidimos usarlos fuera del flujo gratuito
