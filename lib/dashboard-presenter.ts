import type { DashboardHealth, DashboardHistoryPoint, ProviderIssue } from '@/lib/dashboard-api';
import type { AppLanguage } from '@/lib/language';
import { localizeStaticText } from '@/lib/localized-copy';

function getLocale(language: AppLanguage): string {
  return language === 'es' ? 'es-ES' : 'en-US';
}

const BUCKET_LABELS: Record<AppLanguage, Record<string, string>> = {
  en: {
    risk_on: 'Equities',
    safe_haven: 'Safe assets',
    usd_liquidity: 'US dollar cash',
    inflation_hedge: 'Inflation hedges',
    emerging_markets: 'Emerging markets',
    energy_complex: 'Energy',
    duration: 'Long bonds',
    em_carry: 'Emerging market carry',
  },
  es: {
    risk_on: 'Renta variable',
    safe_haven: 'Activos refugio',
    usd_liquidity: 'Liquidez en dolares',
    inflation_hedge: 'Coberturas de inflacion',
    emerging_markets: 'Mercados emergentes',
    energy_complex: 'Energia',
    duration: 'Bonos largos',
    em_carry: 'Carry emergente',
  },
};

const SOURCE_MODE_LABELS: Record<AppLanguage, Record<string, string>> = {
  en: {
    live: 'Complete snapshot',
    partial_live: 'Partial coverage',
    unavailable: 'Unavailable',
  },
  es: {
    live: 'Lectura completa',
    partial_live: 'Cobertura parcial',
    unavailable: 'No disponible',
  },
};

const FRESHNESS_STATUS_LABELS: Record<AppLanguage, Record<string, string>> = {
  en: {
    fresh: 'Fresh',
    partial: 'Partial',
    stale: 'Stale',
    unavailable: 'Unavailable',
  },
  es: {
    fresh: 'Reciente',
    partial: 'Parcial',
    stale: 'Obsoleto',
    unavailable: 'No disponible',
  },
};

const PROVIDER_SEVERITY_LABELS: Record<AppLanguage, Record<string, string>> = {
  en: {
    info: 'Info',
    warning: 'Warning',
    danger: 'Danger',
    error: 'Error',
  },
  es: {
    info: 'Info',
    warning: 'Advertencia',
    danger: 'Riesgo',
    error: 'Error',
  },
};

const DRIVER_LABELS: Record<AppLanguage, Record<string, string>> = {
  en: {},
  es: {
    macro_growth: 'Crecimiento macro',
    credit_spreads: 'Diferenciales de credito',
    equity_momentum: 'Impulso de renta variable',
    energy_inventory: 'Inventarios energeticos',
    oil_momentum: 'Impulso del petroleo',
    gold_momentum: 'Impulso del oro',
    duration_pressure: 'Presion de duracion',
  },
};

export type StatusTone = 'success' | 'warning' | 'danger';

const BRIEF_TEXT_MAP: Record<AppLanguage, Record<string, string>> = {
  en: {},
  es: {
    'The public-data picture is mixed': 'La foto de datos publicos es mixta',
    'The latest public-data snapshot is not sending one clean regime signal, so the brief stays balanced rather than decisive.':
      'La ultima lectura de datos publicos no envia una sola senal clara de regimen, asi que se mantiene equilibrada en lugar de ser tajante.',
    'Defensive tone with persistent energy pressure': 'Tono defensivo con presion energetica persistente',
    'The latest public-data snapshot is leaning defensive while the energy signal remains tight.':
      'La ultima lectura de datos publicos se inclina hacia un tono defensivo mientras la senal energetica sigue tensa.',
    'Defensive tone is building': 'El tono defensivo va ganando fuerza',
    'The latest public-data snapshot leans more cautious than supportive for risk assets.':
      'La ultima lectura de datos publicos se inclina mas hacia la cautela que hacia el apoyo a los activos de riesgo.',
    'Conditions are stabilising': 'Las condiciones se estan estabilizando',
    'The latest public-data snapshot looks less defensive and more stable than the prior update.':
      'La ultima lectura de datos publicos parece menos defensiva y mas estable que en la actualizacion anterior.',
    'Inflation-linked pressure is still visible': 'La presion ligada a la inflacion sigue visible',
    'The latest public-data snapshot still shows inflation and energy pressure rather than a clean easing cycle.':
      'La ultima lectura de datos publicos sigue mostrando presion de inflacion y energia, no un ciclo de alivio limpio.',
    'High-yield spreads widened, which adds defensive pressure.':
      'Los diferenciales high yield se ampliaron, lo que anade presion defensiva.',
    'US crude inventories rose, which eases some energy tightness.':
      'Las reservas de crudo en EE. UU. subieron, lo que relaja parte de la tension energetica.',
    'US crude inventories fell, which keeps energy tightness in place.':
      'Las reservas de crudo en EE. UU. cayeron, lo que mantiene la tension energetica.',
    'US crude production slipped, which reinforces supply tightness.':
      'La produccion de crudo en EE. UU. se redujo, reforzando la tension de oferta.',
    'The volatility proxy eased, which helps calm risk conditions.':
      'El proxy de volatilidad se relajó, lo que ayuda a calmar el riesgo.',
    'The 10Y yield moved up, keeping rate pressure visible.':
      'El rendimiento del 10Y subio, manteniendo visible la presion de tipos.',
    'Informational analysis based on the latest stored public-data snapshot. Not investment advice.':
      'Analisis informativo basado en la ultima lectura guardada de datos publicos. No es asesoramiento de inversion.',
  },
};

export function formatBucketLabel(bucketKey: string, language: AppLanguage = 'en'): string {
  return BUCKET_LABELS[language][bucketKey]
    ?? bucketKey.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatSourceMode(sourceMode: string, language: AppLanguage = 'en'): string {
  return SOURCE_MODE_LABELS[language][sourceMode]
    ?? sourceMode.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatFreshnessStatus(status: string, language: AppLanguage = 'en'): string {
  return FRESHNESS_STATUS_LABELS[language][status]
    ?? status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatProviderIssueSeverity(severity: string, language: AppLanguage = 'en'): string {
  return PROVIDER_SEVERITY_LABELS[language][severity]
    ?? severity.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getSourceModeTone(sourceMode: string): StatusTone {
  if (sourceMode === 'live') {
    return 'success';
  }

  if (sourceMode === 'partial_live') {
    return 'warning';
  }

  return 'danger';
}

export function formatConfidence(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCoverage(value: number): string {
  const normalizedValue = value <= 1 ? value * 100 : value;
  return `${normalizedValue.toFixed(1)}%`;
}

export function formatFlowScore(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}`;
}

export function formatHistorySummary(point: DashboardHistoryPoint): string {
  return `${formatBucketLabel(point.leading_bucket)} led this stored snapshot at ${formatFlowScore(point.leading_score)} with ${formatConfidence(point.global_confidence)} confidence.`;
}

export function formatHistorySummaryLocalized(
  point: DashboardHistoryPoint,
  language: AppLanguage = 'en',
): string {
  if (language === 'es') {
    return `${formatBucketLabel(point.leading_bucket, 'es')} lidero esta lectura guardada con ${formatFlowScore(point.leading_score)} y ${formatConfidence(point.global_confidence)} de confianza.`;
  }

  return formatHistorySummary(point);
}

export function formatFreshness(secondsSinceRefresh: number): string {
  if (secondsSinceRefresh < 60) {
    return `${secondsSinceRefresh}s ago`;
  }

  const minutes = Math.round(secondsSinceRefresh / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = (minutes / 60).toFixed(1);
  return `${hours}h ago`;
}

export function formatFreshnessLocalized(
  secondsSinceRefresh: number,
  language: AppLanguage = 'en',
): string {
  if (language === 'en') {
    return formatFreshness(secondsSinceRefresh);
  }

  if (secondsSinceRefresh < 60) {
    return `hace ${secondsSinceRefresh}s`;
  }

  const minutes = Math.round(secondsSinceRefresh / 60);

  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = (minutes / 60).toFixed(1);
  return `hace ${hours} h`;
}

export function formatProviderName(providerKey: string): string {
  const providerMap: Record<string, string> = {
    alpha_vantage: 'Restricted market feed',
    twelve_data: 'Restricted market feed',
    fred: 'FRED',
    ecb: 'ECB',
    world_bank: 'World Bank',
    eia: 'EIA',
  };

  return providerMap[providerKey] ?? providerKey.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDriverKey(driverKey: string, language: AppLanguage = 'en'): string {
  return DRIVER_LABELS[language][driverKey] ?? driverKey
    .replace(/_(\d+)d$/i, ' $1d')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatRiskText(risk: string): string {
  if (risk.includes('Cobertura parcial')) {
    return 'Coverage is partial for this stored snapshot.';
  }
  if (risk.includes('conflictos')) {
    return 'Some leading signals are pulling in opposite directions.';
  }
  if (risk.includes('dispersion')) {
    return 'Internal dispersion is reducing conviction inside the leading theme.';
  }
  if (risk.includes('cripto')) {
    return 'Crypto beta is improving, but it is not steering the overall reading yet.';
  }
  return risk;
}

export function formatRiskTextLocalized(risk: string, language: AppLanguage = 'en'): string {
  const english = formatRiskText(risk);
  if (language === 'en') {
    return english;
  }
  const translated = {
    'Coverage is partial for this stored snapshot.': 'La cobertura es parcial para esta lectura guardada.',
    'Some leading signals are pulling in opposite directions.': 'Algunas senales principales tiran en direcciones opuestas.',
    'Internal dispersion is reducing conviction inside the leading theme.': 'La dispersion interna reduce la conviccion dentro del tema dominante.',
    'Crypto beta is improving, but it is not steering the overall reading yet.': 'La beta cripto mejora, pero todavia no dirige la lectura general.',
  } as const;
  return translated[english as keyof typeof translated] ?? localizeStaticText(english, language);
}

export function formatProviderIssueMessage(issue: ProviderIssue): string {
  const { message } = issue;

  if (message.startsWith('market_series_unavailable:')) {
    return 'Market proxies are disabled in the current public-data-first launch mode.';
  }
  if (message === 'live_coverage_incomplete') {
    return 'Coverage is intentionally partial because the launch path is using public-data-first sources.';
  }
  if (message.startsWith('coverage_summary:')) {
    return 'Macro and energy coverage are available, while market proxy coverage is currently disabled.';
  }
  if (message.startsWith('snapshot_source:')) {
    return `Snapshot mode: ${formatSourceMode(message.split(':')[1] ?? 'unavailable')}.`;
  }
  if (message.startsWith('effective_providers:')) {
    const providers = message.split(':')[1]?.split(',').filter(Boolean).map(formatProviderName) ?? [];
    return `Active providers: ${providers.join(', ') || 'none'}.`;
  }
  if (message === 'missing_api_key') {
    return 'A provider key is missing for this source.';
  }
  if (message === 'rate_limit_reached') {
    return 'A provider rate limit was reached during the latest refresh.';
  }
  if (message === 'auth_rejected') {
    return 'A provider rejected the current credentials.';
  }
  if (message.startsWith('fetch_failed:')) {
    return 'The backend could not refresh one of the configured series.';
  }

  return message;
}

export function formatProviderIssueMessageLocalized(
  issue: ProviderIssue,
  language: AppLanguage = 'en',
): string {
  const english = formatProviderIssueMessage(issue);
  if (language === 'en') {
    return english;
  }

  const translated = {
    'Market proxies are disabled in the current public-data-first launch mode.':
      'Los proxies de mercado estan desactivados en el modo actual de lanzamiento basado en datos publicos.',
    'Coverage is intentionally partial because the launch path is using public-data-first sources.':
      'La cobertura es intencionalmente parcial porque el lanzamiento usa fuentes de datos publicos.',
    'Macro and energy coverage are available, while market proxy coverage is currently disabled.':
      'La cobertura macro y de energia esta disponible, mientras que la de proxies de mercado esta desactivada.',
    'A provider key is missing for this source.':
      'Falta una clave de proveedor para esta fuente.',
    'A provider rate limit was reached during the latest refresh.':
      'Se alcanzo el limite de peticiones de un proveedor durante la ultima actualizacion.',
    'A provider rejected the current credentials.':
      'Un proveedor rechazo las credenciales actuales.',
    'The backend could not refresh one of the configured series.':
      'El backend no pudo actualizar una de las series configuradas.',
  } as const;

  if (english.startsWith('Snapshot mode: ')) {
    const mode = issue.message.split(':')[1] ?? 'unavailable';
    return `Modo de lectura: ${formatSourceMode(mode, 'es')}.`;
  }
  if (english.startsWith('Active providers: ')) {
    const providers = issue.message.split(':')[1]?.split(',').filter(Boolean).map((providerKey) => formatProviderName(providerKey.trim())) ?? [];
    return `Proveedores activos: ${providers.join(', ') || 'ninguno'}.`;
  }

  return translated[english as keyof typeof translated] ?? localizeStaticText(english, language);
}

export function localizeBriefText(text: string, language: AppLanguage = 'en'): string {
  return BRIEF_TEXT_MAP[language][text] ?? localizeStaticText(text, language);
}

export function formatLocalizedDateTime(
  timestamp: string | null | undefined,
  language: AppLanguage = 'en',
): string {
  if (!timestamp) {
    return '--';
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export function formatLocalizedDate(
  timestamp: string | null | undefined,
  language: AppLanguage = 'en',
): string {
  if (!timestamp) {
    return '--';
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: 'medium',
  }).format(parsed);
}

export function formatLocalizedTime(
  timestamp: string | null | undefined,
  language: AppLanguage = 'en',
): string {
  if (!timestamp) {
    return '--';
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(getLocale(language), {
    timeStyle: 'short',
  }).format(parsed);
}

export function hasRestrictedCommercialProvider(providerKeys: string[]): boolean {
  return providerKeys.some((providerKey) => providerKey === 'twelve_data' || providerKey === 'alpha_vantage');
}

export function getConfiguredProviders(health: DashboardHealth | null): string[] {
  if (!health) {
    return [];
  }

  return [...new Set([...health.enabled_market_providers, ...health.enabled_macro_providers])];
}

export function formatLoadError(errorMessage: string | null): string {
  if (!errorMessage) {
    return 'Unable to reach the API.';
  }

  if (errorMessage === 'http_404') {
    return 'The API is reachable, but the expected endpoint was not found.';
  }

  if (errorMessage === 'http_500') {
    return 'The API responded with an internal error.';
  }

  if (errorMessage === 'signal_aborted') {
    return 'The API did not respond before the request timeout.';
  }

  if (errorMessage === 'Failed to fetch' || errorMessage === 'Network request failed') {
    return 'The app could not complete the request to the API.';
  }

  return 'The API could not be reached from this app load.';
}

export function formatLoadErrorLocalized(
  errorMessage: string | null,
  language: AppLanguage = 'en',
): string {
  if (language === 'en') {
    return formatLoadError(errorMessage);
  }

  if (!errorMessage) {
    return 'No se pudo conectar con la API.';
  }

  if (errorMessage === 'http_404') {
    return 'La API responde, pero el endpoint esperado no existe.';
  }

  if (errorMessage === 'http_500') {
    return 'La API devolvio un error interno.';
  }

  if (errorMessage === 'signal_aborted') {
    return 'La API no respondio antes de que venciera el tiempo de espera.';
  }

  if (errorMessage === 'Failed to fetch' || errorMessage === 'Network request failed') {
    return 'La app no pudo completar la peticion a la API.';
  }

  return 'No se pudo acceder a la API desde esta carga de la app.';
}
