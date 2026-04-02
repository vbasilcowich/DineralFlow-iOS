import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/shell';
import {
  formatBucketLabel,
  formatConfidence,
  formatCoverage,
  formatDriverKey,
  formatFlowScore,
  formatFreshnessLocalized,
  formatLocalizedDateTime,
  formatLocalizedTime,
  formatLoadErrorLocalized,
  formatProviderIssueMessageLocalized,
  formatRiskTextLocalized,
  formatSourceMode,
  getSourceModeTone,
  localizeBriefText,
} from '@/lib/dashboard-presenter';
import type { DashboardPreviewState } from '@/hooks/use-dashboard-preview';
import { useLanguage } from '@/lib/language';
import type { AccessTier, EntitlementFeature } from '@/lib/monetization';
import { shellPalette } from '../constants/shell';

type LiveSnapshotPanelProps = {
  state: DashboardPreviewState;
  onRefresh: () => void;
  accessTier: AccessTier;
  maxTopFlows: number;
  diagnosticsAccess: 'preview' | 'full';
  onOpenPaywall?: (feature: EntitlementFeature) => void;
  onOpenConfidence?: () => void;
};

export function LiveSnapshotPanel({
  state,
  onRefresh,
  accessTier,
  maxTopFlows,
  diagnosticsAccess,
  onOpenPaywall,
  onOpenConfidence,
}: LiveSnapshotPanelProps) {
  const { language } = useLanguage();
  const { snapshot } = state;
  const showingCachedSnapshot = state.snapshotOrigin === 'cached';
  const isPremium = accessTier === 'premium';
  const topFlowLimit = maxTopFlows;
  const visibleRisks = snapshot ? snapshot.risks.slice(0, isPremium ? snapshot.risks.length : 1) : [];
  const visibleProviderIssues = snapshot
    ? snapshot.provider_issues.slice(0, diagnosticsAccess === 'full' ? snapshot.provider_issues.length : 1)
    : [];
  const brief = snapshot?.market_brief ?? null;
  const visibleBriefBullets = brief?.bullets.slice(0, isPremium ? brief.bullets.length : 2) ?? [];
  const visibleBriefEvidence =
    brief?.evidence.slice(0, diagnosticsAccess === 'full' ? 3 : 1) ?? [];
  const primaryFlow = snapshot?.top_flows[0] ?? null;
  const secondaryFlow = snapshot?.top_flows[1] ?? null;

  const copy = language === 'es'
    ? {
        eyebrow: 'Analisis de mercado',
        title: 'Lo mas importante ahora mismo',
        body: 'Una lectura clara del mercado construida con el ultimo snapshot guardado. Resume que fuerza domina, cuanto convence y que frena la lectura.',
        refresh: 'Actualizar snapshot',
        unavailable: 'Snapshot no disponible',
        technicalDetail: 'Detalle tecnico',
        phoneHint: 'Si usas Expo Go en un telefono, cambia `EXPO_PUBLIC_API_BASE_URL` desde localhost a la IP local del backend.',
        cached: 'Snapshot en cache',
        fresh: 'Lectura reciente',
        failed: 'Actualizacion fallida',
        refreshing: 'Actualizando',
        loaded: 'Cargado',
        showingLast: 'Mostrando el ultimo snapshot guardado',
        lastFailed: 'Fallo la ultima actualizacion',
        cacheBody: 'Esta pantalla esta leyendo el ultimo snapshot valido guardado en el dispositivo. No se han inventado valores durante este fallback.',
        failedBody: 'La ultima actualizacion de red no termino bien, asi que la app mantiene visible el ultimo snapshot correcto.',
        cachedAt: 'Guardado en cache',
        confidence: 'Confianza',
        updated: 'Actualizado',
        sources: 'Fuentes',
        bulletHint: 'Premium muestra la lista completa de bullets publicada con este mismo snapshot.',
        evidenceHint: 'Gratis muestra solo una parte de la evidencia. Premium desbloquea mas de la capa de prueba detras de este mismo brief.',
        unlock: 'Desbloquear detalle',
        snapshotConfidence: 'Confianza del snapshot',
        coverage: 'Cobertura',
        freshness: 'Frescura',
        leadingBasket: 'Tema dominante',
        publicData: 'Postura de datos publicos',
        publicDataBody: 'Este lanzamiento se esta orientando alrededor de snapshots programados y fuentes mas faciles de usar comercialmente, como FRED y EIA, en lugar de feeds de mercado de pago.',
        scoreboard: 'Temas que estan moviendo la lectura',
        noDrivers: 'No se publicaron etiquetas de impulsores en esta fila.',
        noFlows: 'El backend no devolvio filas de flujo para esta lectura.',
        flowsHint: 'Gratis se mantiene conciso y muestra solo la parte principal. Premium desbloquea mas temas, mas contexto y el desglose profundo planificado para la fase 1.',
        frictions: 'Fricciones y matices',
        premiumRisks: 'Premium mantiene visible el resto de fricciones publicadas alrededor de este mismo snapshot.',
        diagnostics: 'Diagnosticos del backend',
        diagnosticsPreview: 'Vista previa de diagnosticos',
        diagnosticsHint: 'Gratis muestra solo una vista previa de los diagnosticos del backend. Premium desbloquea la lista completa de incidencias de proveedor y la capa de evidencia mas profunda.',
        primaryFlow: 'Tendencia primaria',
        secondaryFlow: 'Tendencia secundaria',
        flowStrength: 'Fuerza del flujo',
        explainConfidence: 'Como se calcula la confianza',
        confidencePreviewHint: 'La explicacion de confianza abre una pantalla separada con metodologia, preview del analisis y acceso premium al detalle.',
      }
    : {
        eyebrow: 'Market analysis',
        title: 'What matters most right now',
        body: 'A clear market read built from the latest stored snapshot. It shows which force is leading, how confident the read is, and what is holding it back.',
        refresh: 'Refresh snapshot',
        unavailable: 'Snapshot unavailable',
        technicalDetail: 'Technical detail',
        phoneHint: 'If you are using Expo Go on a phone, switch `EXPO_PUBLIC_API_BASE_URL` from localhost to the backend LAN address.',
        cached: 'Cached snapshot',
        fresh: 'Fresh fetch',
        failed: 'Refresh failed',
        refreshing: 'Refreshing',
        loaded: 'Loaded',
        showingLast: 'Showing the last saved snapshot',
        lastFailed: 'Fresh fetch failed',
        cacheBody: 'This screen is currently reading the last valid snapshot stored on the device. No values were fabricated during this fallback.',
        failedBody: 'The most recent network refresh did not complete, so the app is keeping the last successful snapshot visible.',
        cachedAt: 'Cached at',
        confidence: 'Confidence',
        updated: 'Updated',
        sources: 'Sources',
        bulletHint: 'Premium shows the full bullet list published with this same stored snapshot.',
        evidenceHint: 'Free shows a short evidence preview. Premium unlocks more of the proof layer behind the same brief.',
        unlock: 'Unlock drilldowns',
        snapshotConfidence: 'Snapshot confidence',
        coverage: 'Coverage',
        freshness: 'Freshness',
        leadingBasket: 'Leading theme',
        publicData: 'Public-data posture',
        publicDataBody: 'This launch path is being shaped around scheduled stored snapshots and sources that are easier to use commercially, such as FRED and EIA, rather than paid market feeds.',
        scoreboard: 'Themes shaping the read',
        noDrivers: 'No driver labels were published in this row.',
        noFlows: 'No flow rows were returned by the backend.',
        flowsHint: 'Free stays concise and shows the core read first. Premium unlocks more themes, more context, and the deeper drilldowns planned for phase 1.',
        frictions: 'Friction and caveats',
        premiumRisks: 'Premium keeps the rest of the published friction list visible around the same snapshot.',
        diagnostics: 'Backend diagnostics',
        diagnosticsPreview: 'Diagnostics preview',
        diagnosticsHint: 'Free shows only a preview of backend diagnostics. Premium unlocks the full provider issue list and the deeper evidence layer around it.',
        primaryFlow: 'Primary flow',
        secondaryFlow: 'Secondary flow',
        flowStrength: 'Flow strength',
        explainConfidence: 'How confidence works',
        confidencePreviewHint: 'The confidence view opens a separate screen with methodology, analysis preview, and premium access to deeper detail.',
      };

  return (
    <SectionCard
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}
      variant="contrast">
      <View style={styles.buttonRow}>
        <ActionButton
          label={copy.refresh}
          icon="arrow.clockwise"
          variant="primary"
          onPress={onRefresh}
        />
        {onOpenConfidence ? (
          <ActionButton
            label={copy.explainConfidence}
            icon="arrow.right"
            variant="secondary"
            onPress={onOpenConfidence}
          />
        ) : null}
      </View>

      {state.status === 'loading' && !snapshot ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={shellPalette.accent} />
          <Text style={styles.loadingTitle}>
            {language === 'es' ? 'Conectando con el backend local...' : 'Connecting to the local backend...'}
          </Text>
          <Text style={styles.loadingBody}>
            {language === 'es'
              ? 'Esperando `/api/dashboard/snapshot` y `/health`.'
              : 'Waiting for `/api/dashboard/snapshot` and `/health`.'}
          </Text>
        </View>
      ) : null}

      {state.status === 'error' && !snapshot ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{copy.unavailable}</Text>
          <Text style={styles.errorBody}>{formatLoadErrorLocalized(state.errorMessage, language)}</Text>
          {state.errorMessage ? (
            <Text style={styles.errorHint}>{copy.technicalDetail}: {state.errorMessage}</Text>
          ) : null}
          <Text style={styles.errorHint}>{copy.phoneHint}</Text>
        </View>
      ) : null}

      {snapshot ? (
        <>
          <View style={styles.badgeRow}>
            <Pill
              label={formatSourceMode(snapshot.source_mode, language)}
              tone={getSourceModeTone(snapshot.source_mode)}
            />
            {showingCachedSnapshot ? (
              <Pill label={copy.cached} tone="warning" />
            ) : (
              <Pill label={copy.fresh} tone="success" />
            )}
            {state.lastRefreshFailed ? <Pill label={copy.failed} tone="danger" /> : null}
            {state.isRefreshing ? <Pill label={copy.refreshing} tone="info" /> : null}
            {state.lastLoadedAt ? (
              <Pill
                label={`${copy.loaded} ${formatLocalizedTime(state.lastLoadedAt, language)}`}
                tone="soft"
              />
            ) : null}
          </View>

          {showingCachedSnapshot || state.lastRefreshFailed ? (
            <View style={styles.cacheCard}>
              <Text style={styles.cacheTitle}>
                {showingCachedSnapshot ? copy.showingLast : copy.lastFailed}
              </Text>
              <Text style={styles.cacheBody}>
                {showingCachedSnapshot ? copy.cacheBody : copy.failedBody}
              </Text>
              {state.errorMessage ? (
                <Text style={styles.cacheHint}>
                  {formatLoadErrorLocalized(state.errorMessage, language)}
                </Text>
              ) : null}
              {state.cacheSavedAt ? (
                <Text style={styles.cacheHint}>
                  {copy.cachedAt} {formatLocalizedDateTime(state.cacheSavedAt, language)}.
                </Text>
              ) : null}
            </View>
          ) : null}

          {brief ? (
            <View style={styles.briefCard}>
              {(primaryFlow || secondaryFlow) ? (
                <View style={styles.flowHierarchy}>
                  {primaryFlow ? (
                    <View style={[styles.flowCard, styles.flowCardPrimary]}>
                      <Text style={styles.flowLabel}>{copy.primaryFlow}</Text>
                      <Text style={styles.flowTitle}>
                        {formatBucketLabel(primaryFlow.bucket_key, language)}
                      </Text>
                      <View style={styles.flowMetaRow}>
                        <Text style={styles.flowMetaValue}>
                          {copy.flowStrength} {formatFlowScore(primaryFlow.score)}
                        </Text>
                        <Text style={styles.flowMetaValue}>
                          {formatConfidence(primaryFlow.confidence)} {copy.confidence.toLowerCase()}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {secondaryFlow ? (
                    <View style={styles.flowCard}>
                      <Text style={styles.flowLabel}>{copy.secondaryFlow}</Text>
                      <Text style={styles.flowTitleSecondary}>
                        {formatBucketLabel(secondaryFlow.bucket_key, language)}
                      </Text>
                      <View style={styles.flowMetaRow}>
                        <Text style={styles.flowMetaValueMuted}>
                          {copy.flowStrength} {formatFlowScore(secondaryFlow.score)}
                        </Text>
                        <Text style={styles.flowMetaValueMuted}>
                          {formatConfidence(secondaryFlow.confidence)} {copy.confidence.toLowerCase()}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.briefHeader}>
                <View style={styles.briefHeaderCopy}>
                  <Text style={styles.briefTitle}>{localizeBriefText(brief.title, language)}</Text>
                  <Text style={styles.briefSummary}>{localizeBriefText(brief.summary, language)}</Text>
                </View>
                <View style={styles.briefConfidenceBadge}>
                  <Text style={styles.briefConfidenceValue}>{formatConfidence(brief.confidence)}</Text>
                  <Text style={styles.briefConfidenceLabel}>{copy.confidence}</Text>
                </View>
              </View>

              <View style={styles.briefMetaRow}>
                <Text style={styles.briefMetaText}>
                  {copy.updated} {formatLocalizedDateTime(brief.updated_at, language)}
                </Text>
                <Text style={styles.briefMetaText}>
                  {copy.sources}: {brief.source_labels.join(', ') || 'Public dataset mix'}
                </Text>
              </View>

              <View style={styles.briefBullets}>
                {visibleBriefBullets.map((bullet) => (
                  <Text key={bullet} style={styles.briefBullet}>
                    - {localizeBriefText(bullet, language)}
                  </Text>
                ))}
              </View>

              {brief.bullets.length > visibleBriefBullets.length ? (
                <Text style={styles.briefHint}>{copy.bulletHint}</Text>
              ) : null}

              <View style={styles.evidenceList}>
                {visibleBriefEvidence.map((item) => (
                  <View key={item.signal_key} style={styles.evidenceCard}>
                    <View style={styles.evidenceHeader}>
                      <Text style={styles.evidenceTitle}>{localizeBriefText(item.label, language)}</Text>
                      <Text style={styles.evidenceDelta}>{item.delta_text}</Text>
                    </View>
                    <Text style={styles.evidenceBody}>{localizeBriefText(item.summary, language)}</Text>
                    <Text style={styles.evidenceMeta}>
                      {item.provider_label} - {formatLocalizedDateTime(item.last_update_at, language)}
                    </Text>
                  </View>
                ))}
              </View>

              {brief.evidence.length > visibleBriefEvidence.length ? (
                <View style={styles.upsellBlock}>
                  <Text style={styles.blockBody}>{copy.evidenceHint}</Text>
                  {onOpenPaywall ? (
                    <ActionButton
                      label={copy.unlock}
                      icon="arrow.right"
                      variant="primary"
                      onPress={() => onOpenPaywall('deeper_drilldowns')}
                    />
                  ) : null}
                </View>
              ) : null}

              {onOpenConfidence ? (
                <Text style={styles.briefHint}>{copy.confidencePreviewHint}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.metricGrid}>
            <MetricCard
              label={copy.snapshotConfidence}
              value={formatConfidence(snapshot.global_confidence)}
              detail={
                language === 'es'
                  ? 'Confianza publicada en el ultimo snapshot guardado por el backend.'
                  : 'Confidence published in the latest stored backend snapshot.'
              }
              tone="contrast"
            />
            <MetricCard
              label={copy.coverage}
              value={formatCoverage(snapshot.coverage)}
              detail={
                language === 'es'
                  ? 'Nivel de cobertura declarado por el backend para esta lectura.'
                  : 'Coverage level declared by the backend for this reading.'
              }
              tone="contrast"
            />
            <MetricCard
              label={copy.freshness}
              value={formatFreshnessLocalized(snapshot.data_freshness.seconds_since_refresh, language)}
              detail={
                language === 'es'
                  ? `Estado de frescura: ${snapshot.data_freshness.status}.`
                  : `Freshness status: ${snapshot.data_freshness.status}.`
              }
              tone="contrast"
            />
            <MetricCard
              label={copy.leadingBasket}
              value={formatBucketLabel(snapshot.leading_bucket, language)}
              detail={
                language === 'es'
                  ? `Marca temporal del snapshot: ${formatLocalizedDateTime(snapshot.as_of, language)}.`
                  : `Snapshot timestamp: ${formatLocalizedDateTime(snapshot.as_of, language)}.`
              }
              tone="contrast"
            />
          </View>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>{copy.publicData}</Text>
            <Text style={styles.blockBody}>{copy.publicDataBody}</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>{copy.scoreboard}</Text>
            {snapshot.top_flows.length > 0 ? (
              snapshot.top_flows.slice(0, topFlowLimit).map((flow) => (
                <View key={flow.bucket_key} style={styles.listRow}>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{formatBucketLabel(flow.bucket_key, language)}</Text>
                    <Text style={styles.listBody}>
                      {flow.drivers.length > 0
                        ? flow.drivers.map(formatDriverKey).join(' | ')
                        : copy.noDrivers}
                    </Text>
                  </View>
                  <View style={styles.listMeta}>
                    <Text style={styles.listValue}>{formatFlowScore(flow.score)}</Text>
                    <Text style={styles.listSubvalue}>{formatConfidence(flow.confidence)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.blockBody}>{copy.noFlows}</Text>
            )}
            {accessTier === 'free' && snapshot.top_flows.length > topFlowLimit ? (
              <View style={styles.upsellBlock}>
                <Text style={styles.blockBody}>{copy.flowsHint}</Text>
                {onOpenPaywall ? (
                  <ActionButton
                    label={copy.unlock}
                    icon="arrow.right"
                    variant="primary"
                    onPress={() => onOpenPaywall('deeper_drilldowns')}
                  />
                ) : null}
              </View>
            ) : null}
          </View>

          {snapshot.risks.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>{copy.frictions}</Text>
              {visibleRisks.map((risk) => (
                <Text key={risk} style={styles.bulletRow}>
                  - {formatRiskTextLocalized(risk, language)}
                </Text>
              ))}
              {!isPremium && snapshot.risks.length > visibleRisks.length ? (
                <Text style={styles.blockBody}>{copy.premiumRisks}</Text>
              ) : null}
            </View>
          ) : null}

          {snapshot.provider_issues.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>
                {diagnosticsAccess === 'full' ? copy.diagnostics : copy.diagnosticsPreview}
              </Text>
              {visibleProviderIssues.map((issue) => (
                <View key={`${issue.provider_key}:${issue.message}`} style={styles.issueRow}>
                  <Text style={styles.issueSeverity}>{issue.severity.toUpperCase()}</Text>
                  <Text style={styles.issueMessage}>{formatProviderIssueMessageLocalized(issue, language)}</Text>
                </View>
              ))}
              {diagnosticsAccess !== 'full' && snapshot.provider_issues.length > visibleProviderIssues.length ? (
                <View style={styles.upsellBlock}>
                  <Text style={styles.blockBody}>{copy.diagnosticsHint}</Text>
                  {onOpenPaywall ? (
                    <ActionButton
                      label={copy.unlock}
                      icon="arrow.right"
                      onPress={() => onOpenPaywall('deeper_drilldowns')}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245,248,251,0.08)',
    backgroundColor: shellPalette.contrastSoft,
    gap: 10,
    alignItems: 'flex-start',
  },
  loadingTitle: {
    color: shellPalette.contrastText,
    fontSize: 15,
    fontWeight: '800',
  },
  loadingBody: {
    color: 'rgba(245,248,251,0.74)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  errorCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(213,100,104,0.32)',
    backgroundColor: 'rgba(213,100,104,0.12)',
    gap: 8,
  },
  errorTitle: {
    color: shellPalette.contrastText,
    fontSize: 15,
    fontWeight: '800',
  },
  errorBody: {
    color: 'rgba(245,248,251,0.78)',
    fontSize: 14,
    lineHeight: 20,
  },
  errorHint: {
    color: 'rgba(245,248,251,0.62)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  cacheCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(231,163,75,0.28)',
    backgroundColor: 'rgba(231,163,75,0.12)',
    gap: 8,
  },
  cacheTitle: {
    color: shellPalette.contrastText,
    fontSize: 15,
    fontWeight: '800',
  },
  cacheBody: {
    color: 'rgba(245,248,251,0.78)',
    fontSize: 14,
    lineHeight: 20,
  },
  cacheHint: {
    color: 'rgba(245,248,251,0.62)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  briefCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245,248,251,0.08)',
    backgroundColor: shellPalette.contrastSoft,
    padding: 18,
    gap: 14,
  },
  flowHierarchy: {
    gap: 10,
  },
  flowCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245,248,251,0.08)',
    backgroundColor: 'rgba(245,248,251,0.03)',
    padding: 14,
    gap: 8,
  },
  flowCardPrimary: {
    backgroundColor: 'rgba(62,157,120,0.16)',
    borderColor: 'rgba(62,157,120,0.26)',
  },
  flowLabel: {
    color: 'rgba(245,248,251,0.60)',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  flowTitle: {
    color: shellPalette.contrastText,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  flowTitleSecondary: {
    color: shellPalette.contrastText,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  flowMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  flowMetaValue: {
    color: '#A7F0CF',
    fontSize: 13,
    fontWeight: '800',
  },
  flowMetaValueMuted: {
    color: 'rgba(245,248,251,0.70)',
    fontSize: 13,
    fontWeight: '700',
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  briefHeaderCopy: {
    flex: 1,
    gap: 8,
  },
  briefTitle: {
    color: shellPalette.contrastText,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.45,
  },
  briefSummary: {
    color: 'rgba(245,248,251,0.84)',
    fontSize: 15,
    lineHeight: 22,
  },
  briefConfidenceBadge: {
    minWidth: 88,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(62,157,120,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(62,157,120,0.22)',
    alignItems: 'center',
    gap: 2,
  },
  briefConfidenceValue: {
    color: '#8EE0BA',
    fontSize: 18,
    fontWeight: '900',
  },
  briefConfidenceLabel: {
    color: 'rgba(245,248,251,0.64)',
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  briefMetaRow: {
    gap: 4,
  },
  briefMetaText: {
    color: 'rgba(245,248,251,0.60)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  briefBullets: {
    gap: 8,
  },
  briefBullet: {
    color: 'rgba(245,248,251,0.82)',
    fontSize: 14,
    lineHeight: 20,
  },
  briefHint: {
    color: 'rgba(245,248,251,0.60)',
    fontSize: 12.5,
    lineHeight: 18,
  },
  evidenceList: {
    gap: 10,
  },
  evidenceCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245,248,251,0.08)',
    backgroundColor: 'rgba(245,248,251,0.03)',
    padding: 14,
    gap: 8,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  evidenceTitle: {
    flex: 1,
    color: shellPalette.contrastText,
    fontSize: 15,
    fontWeight: '800',
  },
  evidenceDelta: {
    color: '#8EE0BA',
    fontSize: 13,
    fontWeight: '800',
  },
  evidenceBody: {
    color: 'rgba(245,248,251,0.76)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  evidenceMeta: {
    color: 'rgba(245,248,251,0.54)',
    fontSize: 12,
    lineHeight: 17,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  block: {
    gap: 10,
  },
  upsellBlock: {
    gap: 10,
    paddingTop: 6,
  },
  blockLabel: {
    color: 'rgba(245,248,251,0.62)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  blockBody: {
    color: 'rgba(245,248,251,0.76)',
    fontSize: 14,
    lineHeight: 20,
  },
  listRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,248,251,0.10)',
  },
  listCopy: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    color: shellPalette.contrastText,
    fontSize: 15,
    fontWeight: '800',
  },
  listBody: {
    color: 'rgba(245,248,251,0.72)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  listMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  listValue: {
    color: shellPalette.contrastText,
    fontSize: 16,
    fontWeight: '800',
  },
  listSubvalue: {
    color: 'rgba(245,248,251,0.56)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  bulletRow: {
    color: 'rgba(245,248,251,0.76)',
    fontSize: 14,
    lineHeight: 20,
  },
  issueRow: {
    gap: 4,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245,248,251,0.10)',
  },
  issueSeverity: {
    color: shellPalette.warning,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  issueMessage: {
    color: 'rgba(245,248,251,0.74)',
    fontSize: 13.5,
    lineHeight: 19,
  },
});
