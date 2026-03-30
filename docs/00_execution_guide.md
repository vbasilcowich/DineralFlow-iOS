# Guia de ejecucion

## Objetivo

Convertir `DineralFlow` en una app iOS utilizable sin perder:

- dashboard principal
- cestas y scores
- drilldowns de origen, evolucion, activos, impulsores y fricciones
- trazabilidad de datos reales
- regla de no inventar datos

## Restriccion tecnica principal

Este PC es Windows. Eso significa:

- si podemos desarrollar una app orientada a iOS
- si podemos probar logica, UI web de Expo, lint, typecheck y tests unitarios
- no podemos ejecutar el simulador iOS nativo de Xcode aqui

## Eleccion operativa

Usaremos `Expo + React Native + Expo Router`.

## Criterio de trabajo

- tareas cortas
- alcance pequeno por iteracion
- prompts con ownership claro
- una sola mejora importante por bloque
- validacion local al final de cada bloque

## Regla de contexto

No migraremos todo a la vez. Cada fase debe poder completarse y verificarse sin exigir una generacion enorme de codigo.

## Estado real tras la fundacion

- el repo ya compila y valida en Windows
- `npm run lint`, `npm run typecheck`, `npm run test` y `npm run doctor` pasan
- `npm run web` responde correctamente en localhost
- la plantilla de Expo ya fue sustituida por una shell inicial de producto

## Bloqueo actual

- el remoto GitHub previsto para `DineralFlow-iOS` todavia no existe o no es accesible
- antes de hacer push necesitaremos confirmar la URL final del repo o crearlo en GitHub
