# Inventario funcional a migrar

## Home

- Cabecera principal `Global capital regime`
- Confianza global, cobertura, frescura y proveedores efectivos
- Selector de idioma `EN / ES`
- Badge de estado del dato `live / partial_live / unavailable`
- Accesos a `Provenance`, `Leading basket` y `Trend history`
- Workbench de cestas con selector y panel de evidencia
- `Assets and regions` con primer tap para expandir y segundo tap para abrir detalle
- `Recent trend` con grafico historico del bucket lider

## Drilldowns

- Procedencia y metodologia
- Detalle completo de cesta
- Impulsores positivos
- Fricciones y conflictos
- Evolucion temporal del regimen
- Detalle completo de activo

## Dominio reutilizable

- Buckets: `risk_on`, `safe_haven`, `duration`, `inflation_hedge`, `usd_liquidity`, `crypto_beta`, `em_carry`, `energy_complex`
- Entidades: `asset`, `driver`, `conflict`, `history point`, `source detail`, `methodology`, `provider issue`
- Modos de dato: `live`, `partial_live`, `unavailable`

## Estados UX a respetar

- estado normal con datos reales
- estado degradado por transporte, cobertura o frescura
- estado vacio cuando no hay lectura interpretable
- evidencia solo lectura
- interactividad concentrada en navegacion, cestas y assets

## Riesgos de migracion

- mucha densidad informativa para pantalla de iPhone
- navegacion profunda que no debe copiarse 1:1 desde web
- charts y tablas requieren rediseño tactil
- la trazabilidad del dato no se puede simplificar
- la capa bilingue debe ser centralizada desde el principio
