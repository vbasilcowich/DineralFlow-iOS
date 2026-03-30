# Prompt 03 - API Client

## Objetivo

Conectar la app iOS con la API actual de DineralFlow.

## Limites

- no montar toda la UI
- no implementar cache persistente avanzada aun

## Entregables

- cliente HTTP tipado
- configuracion de entorno local
- llamadas a `health`, `snapshot`, `history` y `asset detail`
- estados `loading`, `success`, `error`, `degraded`

## Criterio de exito

- la app puede leer datos reales del backend local
- los fallos de red se muestran con honestidad
