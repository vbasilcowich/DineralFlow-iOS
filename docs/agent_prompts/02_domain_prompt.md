# Prompt 02 - Domain Models

## Objetivo

Portar al repo iOS los contratos de dominio necesarios para leer el dashboard sin inventar datos.

## Limites

- no construir UI compleja
- no tocar charts
- no tocar mas alla de modelos, mappers y helpers de formato

## Entregables

- tipos para snapshot, history, asset detail, buckets, drivers, conflicts y provenance
- helpers de `source_mode`
- capa de i18n minima

## Criterio de exito

- los tipos cubren el backend actual
- hay una sola fuente de verdad para labels y modos de dato
