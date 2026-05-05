import type { AppLanguage } from '@/lib/language';

const SPANISH_TEXT: Record<string, string> = {
  'Premium unlocks the deeper workflow.': 'Premium desbloquea el flujo mas profundo.',
  'Premium is already active in this build.': 'Premium ya esta activo en esta compilacion.',
  'Free keeps the core snapshot readable. Premium unlocks longer history, deeper theme drilldowns, and later alerts without pretending the app is a real-time terminal.':
    'Gratis mantiene legible la lectura principal. Premium desbloquea mas historico, desglose por temas y futuras alertas sin presentar la app como una terminal en tiempo real.',
  'Free keeps the short recent arc. Premium unlocks longer history windows, deeper theme drilldowns, and later alerts.':
    'Gratis mantiene visible el tramo corto reciente. Premium desbloquea mas historico, desglose por temas y futuras alertas.',
  'Free keeps the short recent arc. Premium unlocks longer history windows, deeper basket drilldowns, and later alerts.':
    'Gratis mantiene visible el tramo corto reciente. Premium desbloquea mas historico, desglose por temas y futuras alertas.',
  'Free keeps the main read clear. Premium opens the deeper driver, friction, and evidence layer behind the same stored snapshot.':
    'Gratis mantiene clara la lectura principal. Premium abre la capa profunda de impulsores, fricciones y evidencia detras de la misma lectura guardada.',
  'Longer history unlocks the full snapshot arc.': 'Mas historico desbloquea el arco completo de la lectura.',
  '30 and 90-day windows': 'Ventanas de 30 y 90 dias',
  'Deeper theme drilldowns': 'Desglose por temas mas profundo',
  'Deeper basket drilldowns': 'Desglose por temas mas profundo',
  'Alerts later in phase 1': 'Alertas mas adelante en la fase 1',
  'Ad-free experience': 'Experiencia sin anuncios',
  Monthly: 'Mensual',
  Annual: 'Anual',
  'Flexible access to premium depth while we validate the first paid workflow.':
    'Acceso flexible a la profundidad premium mientras validamos el primer flujo de pago.',
  'Lower-friction long-term access once the premium workflow is stable.':
    'Acceso de largo plazo con menos friccion cuando el flujo premium sea estable.',

  'Main snapshot': 'Lectura principal',
  'Included in free': 'Incluido en gratis',
  'The latest stored macro and regime snapshot stays visible in every tier.':
    'La ultima lectura macro y de regimen guardada sigue visible en todos los niveles.',
  'Included in premium': 'Incluido en premium',
  'Premium keeps the same headline snapshot and adds more depth around it.':
    'Premium mantiene la misma lectura principal y anade mas profundidad alrededor.',
  'The main snapshot stays readable in every tier.': 'La lectura principal sigue legible en todos los niveles.',
  'Premium does not paywall the core regime reading. It pays for deeper context and convenience around that reading.':
    'Premium no bloquea la lectura central de regimen. Paga por mas contexto y comodidad alrededor de esa lectura.',
  'Review premium depth': 'Revisar profundidad premium',
  'Selected themes': 'Temas seleccionados',
  'Free keeps the key themes visible so the product remains understandable on first open.':
    'Gratis mantiene visibles los temas clave para que el producto se entienda desde la primera apertura.',
  'Premium keeps the same core themes and adds richer follow-through around them.':
    'Premium mantiene los mismos temas centrales y anade seguimiento mas rico alrededor.',
  'Selected themes stay visible in free.': 'Los temas seleccionados siguen visibles en gratis.',
  'Premium should monetize deeper interpretation, not hide the basic product outline.':
    'Premium debe monetizar una interpretacion mas profunda, no ocultar el contorno basico del producto.',
  'Short history': 'Historico corto',
  'Short window': 'Ventana corta',
  'Free can stay anchored to a short history window so the reading remains useful without heavy data costs.':
    'Gratis puede quedarse anclado a una ventana corta para que la lectura siga siendo util sin costes de datos altos.',
  'Short plus long windows': 'Ventana corta y ventanas largas',
  'Premium expands history access and keeps the short window in context.':
    'Premium amplia el acceso historico y mantiene la ventana corta en contexto.',
  'Longer history starts from a useful short window.': 'El historico amplio parte de una ventana corta util.',
  'Free keeps the recent arc readable. Premium unlocks the longer context that helps users interpret regime changes more confidently.':
    'Gratis mantiene legible el arco reciente. Premium desbloquea el contexto largo que ayuda a interpretar cambios de regimen con mas confianza.',
  'Unlock longer history': 'Desbloquear historico',
  Provenance: 'Procedencia',
  'Source, freshness, and fallback honesty should stay visible regardless of tier.':
    'Fuente, frescura y honestidad del respaldo deben seguir visibles en cualquier nivel.',
  'Premium keeps provenance visible and adds more depth around the same evidence.':
    'Premium mantiene visible la procedencia y anade mas profundidad sobre la misma evidencia.',
  'Source and freshness should stay visible in every tier.':
    'Fuente y frescura deben seguir visibles en todos los niveles.',
  'Premium should never depend on hiding where the data came from. Trust starts with provenance, even in the free tier.':
    'Premium nunca debe depender de ocultar de donde vienen los datos. La confianza empieza con la procedencia, tambien en gratis.',
  'Theme drilldowns': 'Desglose por temas',
  'Preview only': 'Solo vista previa',
  'Free can preview that deeper theme evidence exists, but the full diagnostic layer stays premium.':
    'Gratis puede mostrar que existe evidencia mas profunda, pero la capa diagnostica completa queda en premium.',
  'Full theme drilldowns': 'Desglose completo por temas',
  'Premium unlocks fuller driver, friction, and evidence context around each theme.':
    'Premium desbloquea mas contexto de impulsores, fricciones y evidencia alrededor de cada tema.',
  'Premium unlocks the deeper theme drilldowns.': 'Premium desbloquea el desglose profundo por temas.',
  'The free tier should show that deeper evidence exists. Premium unlocks the full drilldown layer, not just a teaser headline.':
    'La capa gratis debe mostrar que existe evidencia profunda. Premium desbloquea el desglose completo, no solo un titular de muestra.',
  'Unlock drilldowns': 'Desbloquear detalle',
  'Longer history': 'Mas historico',
  '7-day preview': 'Vista previa de 7 dias',
  'Free can stay on the recent stretch so the product remains cheap to run and easy to understand.':
    'Gratis puede quedarse en el tramo reciente para que el producto sea barato de operar y facil de entender.',
  'Premium unlocks longer arcs so users can compare the latest snapshot with a broader backdrop.':
    'Premium desbloquea arcos mas largos para comparar la ultima lectura con un contexto mas amplio.',
  'Free keeps a short lookback. Premium expands that into longer windows so users can see whether the latest move is persistent or only short-term noise.':
    'Gratis mantiene una mirada corta. Premium la amplia a ventanas mas largas para distinguir persistencia de ruido de corto plazo.',
  'Confidence breakdown': 'Desglose de confianza',
  'Free can explain the headline confidence at a high level without exposing the full evidence ledger.':
    'Gratis puede explicar la confianza principal a alto nivel sin exponer todo el registro de evidencia.',
  'Full confidence methodology': 'Metodologia completa de confianza',
  'Premium unlocks the weighting, evidence ordering, and conflicts behind each confidence reading.':
    'Premium desbloquea ponderaciones, orden de evidencia y conflictos detras de cada lectura de confianza.',
  'Premium unlocks the deeper confidence breakdown.': 'Premium desbloquea el desglose profundo de confianza.',
  'Free keeps the top-line confidence readable. Premium opens the methodology, evidence trail, and conflict handling behind that number.':
    'Gratis mantiene legible la confianza principal. Premium abre la metodologia, la evidencia y el manejo de conflictos detras de ese numero.',
  'Unlock confidence detail': 'Desbloquear detalle de confianza',
  Watchlists: 'Listas de seguimiento',
  'Not included yet': 'Todavia no incluido',
  'Watchlists are planned for premium once the first subscription layer is stable.':
    'Las listas de seguimiento estan previstas para premium cuando la primera capa de suscripcion sea estable.',
  'Planned premium feature': 'Funcion premium planificada',
  'Premium is the natural home for watchlists once the backend and legal posture are ready.':
    'Premium es el lugar natural para las listas de seguimiento cuando backend y postura legal esten listos.',
  'Watchlists are a premium convenience layer.': 'Las listas de seguimiento son una capa de comodidad premium.',
  'They should arrive after the core subscription workflow is stable, not before. Premium is where that convenience belongs.':
    'Deben llegar despues de estabilizar la suscripcion principal. Premium es donde encaja esa comodidad.',
  'Join premium': 'Unirse a premium',
  Alerts: 'Alertas',
  'Locked in free': 'Bloqueadas en gratis',
  'Free can show that alerts exist in the product map, but configuration should stay premium.':
    'Gratis puede mostrar que las alertas existen en el mapa de producto, pero su configuracion debe quedarse en premium.',
  'Alert layer enabled later': 'Capa de alertas preparada',
  'Premium is where scheduled alerts and future watchlist actions belong once the backend is ready.':
    'Premium es donde deben vivir las alertas programadas y futuras acciones de listas de seguimiento cuando el backend este listo.',
  'Premium is where alerts belong.': 'Premium es donde encajan las alertas.',
  'The free tier can acknowledge that alerting exists, but actual alert configuration should stay in premium because it creates recurring backend and product cost.':
    'La capa gratis puede mostrar que existen alertas, pero su configuracion real debe quedarse en premium porque genera coste recurrente de backend y producto.',
  'Unlock alerts': 'Desbloquear alertas',
  'Free may add ads later': 'Gratis podria anadir anuncios mas adelante',
  'Native ads belong only in the free tier, later, and in clearly separated placements.':
    'Los anuncios nativos solo pertenecen a la capa gratis, mas adelante y en espacios claramente separados.',
  'Always ad-free': 'Siempre sin anuncios',
  'Premium should stay clear of ad placements and keep the product focused on signal quality.':
    'Premium debe mantenerse sin anuncios y centrar el producto en calidad de senal.',
  'Premium keeps the app ad-free.': 'Premium mantiene la app sin anuncios.',
  'If ads arrive later, they should stay out of premium and out of critical analysis areas. Premium pays for a cleaner workflow.':
    'Si llegan anuncios mas adelante, deben quedar fuera de premium y de las areas criticas de analisis. Premium paga un flujo mas limpio.',
  'Stay ad-free': 'Mantener sin anuncios',

  'Public-data snapshot points to a cautious risk-on rotation.':
    'La lectura de datos publicos apunta a una rotacion risk-on prudente.',
  'Cautious risk-on leadership with public-data constraints':
    'Liderazgo risk-on prudente con limitaciones de datos publicos',
  'The latest stored snapshot shows equities leading with moderate confidence while energy contributes a secondary impulse. Treat the read as a scheduled analytical snapshot, not a live trading feed.':
    'La ultima lectura guardada muestra liderazgo de renta variable con confianza moderada, mientras energia aporta un impulso secundario. Lee esta senal como una lectura analitica programada, no como un canal de trading en vivo.',
  'The scheduled Worker refreshed the stored read without calling paid market-data vendors. The product remains in low-cost snapshot mode.':
    'El Worker programado actualizo la lectura guardada sin llamar a proveedores de datos de mercado de pago. El producto sigue en modo de lectura programada de bajo coste.',
  'Risk assets remain the leading theme in the stored read.':
    'Los activos de riesgo siguen siendo el tema dominante en la lectura guardada.',
  'Energy adds support, but confidence stays moderate because source cadence is mixed.':
    'Energia anade apoyo, pero la confianza sigue moderada porque las fuentes actualizan a ritmos distintos.',
  'Safe-haven pressure is not leading, though it remains a useful caveat.':
    'La presion refugio no lidera, aunque sigue siendo un matiz util.',
  'Risk-on public mix': 'Mezcla publica risk-on',
  'The stored composite improved from the prior run and supports a risk-on headline.':
    'El compuesto guardado mejoro frente a la ejecucion anterior y apoya un titular risk-on.',
  'Energy inventory proxy': 'Proxy de inventarios energeticos',
  'Energy contributes a secondary impulse, but it should be read on its release cadence.':
    'Energia aporta un impulso secundario, pero debe leerse segun su cadencia de publicacion.',
  'The snapshot is scheduled and should not be read as real-time market coverage.':
    'La lectura es programada y no debe leerse como cobertura de mercado en tiempo real.',
  'Public macro and energy series update at different publication cadences.':
    'Las series publicas macro y de energia actualizan con cadencias de publicacion distintas.',
  'Commercial market-data rights still need provider-specific review before paid launch.':
    'Los derechos comerciales de datos de mercado aun requieren revision por proveedor antes del lanzamiento de pago.',
  'The zero-cost backend is serving stored derived snapshots, not paid live quote feeds.':
    'El backend de coste cero sirve lecturas derivadas guardadas, no canales de cotizaciones de pago en vivo.',
  'Risk-on leadership strengthened in the latest stored snapshot.':
    'El liderazgo risk-on se reforzo en la ultima lectura guardada.',
  'Stored snapshot kept risk-on as the leading theme.':
    'La lectura guardada mantuvo risk-on como tema dominante.',

  'This build uses mock billing so we can validate free versus premium flows before StoreKit credentials exist.':
    'Esta compilacion usa facturacion de prueba para validar flujos gratis y premium antes de tener credenciales de StoreKit.',
  'RevenueCat mode is selected, but the required public keys or entitlement identifiers are missing in this build.':
    'RevenueCat esta seleccionado, pero faltan claves publicas o identificadores de acceso en esta compilacion.',
  'RevenueCat needs a native development build. Web and Expo Go can only exercise the paywall shell.':
    'RevenueCat necesita una compilacion nativa de desarrollo. Web y Expo Go solo pueden probar la estructura premium.',
  'RevenueCat is configured for a native build. Use a development build or TestFlight build to start purchases on-device.':
    'RevenueCat esta configurado para una compilacion nativa. Usa una compilacion de desarrollo o TestFlight para iniciar compras en el dispositivo.',
  'Loaded cached entitlement state': 'Estado de acceso cargado desde memoria local',
  'Mock premium activated (monthly)': 'Premium de prueba activado (mensual)',
  'Mock premium activated (annual)': 'Premium de prueba activado (anual)',
  'Restored cached purchases': 'Compras restauradas desde memoria local',
  'No purchases to restore': 'No hay compras para restaurar',
  'Reset to free tier': 'Vuelto al nivel gratis',
  'Loaded cached entitlement state after RevenueCat error':
    'Estado de acceso cargado desde memoria local tras un error de RevenueCat',
  'Loaded cached entitlement state after RevenueCat sync failure':
    'Estado de acceso cargado desde memoria local tras fallar la sincronizacion de RevenueCat',
  'Loaded cached entitlement state after RevenueCat restore failure':
    'Estado de acceso cargado desde memoria local tras fallar la restauracion de RevenueCat',
  'No active RevenueCat purchases to restore': 'No hay compras activas de RevenueCat para restaurar',
  'Cleared local entitlement cache': 'Memoria local de acceso limpiada',
  'Synced entitlements from backend': 'Accesos sincronizados desde backend',
  'Authenticate to sync backend entitlements.': 'Inicia sesion para sincronizar accesos con backend.',
  'Backend access rules are stale.': 'Las reglas de acceso del backend estan obsoletas.',
  'Access rules synced from backend.': 'Reglas de acceso sincronizadas desde backend.',
  'Stored backend access rules are stale and will be refreshed.':
    'Las reglas de acceso guardadas del backend estan obsoletas y se actualizaran.',
  'Using the last stored backend access rules.':
    'Usando las ultimas reglas de acceso del backend guardadas.',
  'Please verify your email before signing in.':
    'Verifica tu email antes de iniciar sesion.',
};

const SPANISH_STATUS: Record<string, string> = {
  free: 'Gratis',
  premium: 'Premium',
  monthly: 'Mensual',
  annual: 'Anual',
  default: 'Por defecto',
  cache: 'Memoria local',
  backend_sync: 'Backend sincronizado',
  mock_purchase: 'Compra de prueba',
  mock_restore: 'Restauracion de prueba',
  revenuecat_purchase: 'Compra RevenueCat',
  revenuecat_restore: 'Restauracion RevenueCat',
  revenuecat_sync: 'RevenueCat sincronizado',
  backend_live: 'Backend activo',
  backend_cached: 'Backend en memoria local',
  local_fallback: 'Respaldo local',
  local_premium_mirror: 'Copia premium local',
  mock: 'Prueba',
  ready: 'Listo',
  idle: 'En espera',
  syncing: 'Sincronizando',
  cached: 'En memoria local',
  stale: 'Obsoleto',
  error: 'Error',
  missing_configuration: 'Configuracion pendiente',
  requires_native_build: 'Requiere compilacion nativa',
  sdk_not_installed: 'SDK no instalado',
  fresh: 'Reciente',
  partial: 'Parcial',
  unavailable: 'No disponible',
  warning: 'Advertencia',
  info: 'Info',
  danger: 'Riesgo',
  ok: 'Correcto',
};

export function localizeStaticText(text: string | null | undefined, language: AppLanguage = 'en'): string {
  if (!text) {
    return '';
  }

  if (language === 'en') {
    return text;
  }

  return SPANISH_TEXT[text] ?? text;
}

export function localizeStatusValue(value: string | null | undefined, language: AppLanguage = 'en'): string {
  if (!value) {
    return '--';
  }

  if (language === 'en') {
    return value.replace(/_/g, ' ');
  }

  return SPANISH_STATUS[value] ?? value.replace(/_/g, ' ');
}

export function localizeErrorMessage(message: string | null | undefined, language: AppLanguage = 'en'): string {
  if (!message) {
    return language === 'es' ? 'La accion no pudo completarse.' : 'The action could not be completed.';
  }

  const localized = localizeStaticText(message, language);
  if (localized !== message) {
    return localized;
  }

  if (/^http_(\d{3})$/.test(message)) {
    const status = message.replace('http_', '');
    return language === 'es' ? `La API devolvio HTTP ${status}.` : `The API returned HTTP ${status}.`;
  }

  const codeLabels: Record<string, Record<AppLanguage, string>> = {
    auth_refresh_failed: {
      en: 'Could not refresh the saved session.',
      es: 'No se pudo actualizar la sesion guardada.',
    },
    auth_login_failed: {
      en: 'Could not sign in.',
      es: 'No se pudo iniciar sesion.',
    },
    auth_register_failed: {
      en: 'Could not create the account.',
      es: 'No se pudo crear la cuenta.',
    },
    auth_social_failed: {
      en: 'Social sign-in could not be completed.',
      es: 'No se pudo completar el acceso social.',
    },
    auth_verify_failed: {
      en: 'Could not verify the email.',
      es: 'No se pudo verificar el email.',
    },
    paywall_config_failed: {
      en: 'The paywall configuration could not be loaded.',
      es: 'No se pudo cargar la configuracion premium.',
    },
    purchase_failed: {
      en: 'The purchase could not be completed.',
      es: 'La compra no pudo completarse.',
    },
    restore_failed: {
      en: 'Purchases could not be restored.',
      es: 'No se pudieron restaurar las compras.',
    },
    reset_to_free_failed: {
      en: 'Could not return to the free tier.',
      es: 'No se pudo volver al nivel gratis.',
    },
    missing_configuration: {
      en: 'Billing configuration is incomplete.',
      es: 'La configuracion de facturacion esta incompleta.',
    },
    requires_native_build: {
      en: 'A native iOS build is required for this action.',
      es: 'Esta accion requiere una compilacion nativa de iOS.',
    },
    sdk_not_installed: {
      en: 'The billing SDK is not installed in this build.',
      es: 'El SDK de facturacion no esta instalado en esta compilacion.',
    },
    entitlements_sync_failed: {
      en: 'Access state could not be synced.',
      es: 'No se pudo sincronizar el estado de acceso.',
    },
  };

  if (codeLabels[message]) {
    return codeLabels[message][language];
  }

  if (/^[a-z0-9_:-]+$/i.test(message)) {
    return language === 'es'
      ? `Estado tecnico: ${message}.`
      : `Technical status: ${message}.`;
  }

  return message;
}

export function localizeSyncMessage(message: string | null | undefined, language: AppLanguage = 'en'): string {
  if (!message) {
    return '';
  }

  if (language === 'en') {
    return message;
  }

  if (message.startsWith('Using stale cached access rules after sync failure: ')) {
    const detail = message.replace('Using stale cached access rules after sync failure: ', '');
    return `Usando reglas de acceso obsoletas tras fallar la sincronizacion: ${localizeErrorMessage(detail, language)}`;
  }

  if (message.startsWith('Using cached access rules after sync failure: ')) {
    const detail = message.replace('Using cached access rules after sync failure: ', '');
    return `Usando reglas de acceso en memoria local tras fallar la sincronizacion: ${localizeErrorMessage(detail, language)}`;
  }

  return localizeErrorMessage(message, language);
}
