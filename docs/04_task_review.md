# Revision y optimizacion del guion

## Cambios para hacerlo mas eficiente

- no migrar primero todos los charts; primero dominio y API
- no portar toda la UI web de golpe; empezar por la lectura principal y los drilldowns de mayor valor
- mantener la primera version iOS en modo `read-heavy`, no `feature-heavy`
- reutilizar contratos del backend existente antes de inventar nuevos modelos
- centralizar `i18n`, `source_mode` y `data provenance` como pilares del proyecto

## Mejoras sugeridas

- definir desde la Fase 1 un paquete de tipos compartidos o un contrato JSON versionado
- medir tiempos reales de snapshot para decidir cache local antes de implementar polling
- usar previews y mocks pequenos por pantalla en vez de montar una app gigante desde el principio
- preparar una estrategia de feature flags para charts avanzados

## Recortes recomendados para el MVP iOS

- dejar fuera por ahora ajustes complejos, auth y notificaciones
- dejar charts avanzados multi-serie para una fase posterior
- centrar la primera release en lectura del dato y trazabilidad

## Riesgos a vigilar

- intentar replicar la web exactamente en vez de adaptar la experiencia a iPhone
- esconder los estados de degradacion para “hacerlo bonito”
- dispersar traducciones y labels en vez de usar una capa comun
- mezclar cambios de arquitectura y cambios visuales en la misma iteracion
