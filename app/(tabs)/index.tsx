import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { APP_DOCK_TAB_SPACER } from '@/components/floating-app-dock';
import { FeatureGateCard } from '@/components/feature-gate-card';
import { HistoryAccessPanel } from '@/components/history-access-panel';
import { LiveSnapshotPanel } from '@/components/live-snapshot-panel';
import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardPreview } from '@/hooks/use-dashboard-preview';
import { useMonetization } from '@/hooks/use-monetization';
import { useLanguage } from '@/lib/language';
import {
  formatBucketLabel,
  formatConfidence,
  formatCoverage,
  formatFreshnessLocalized,
  formatSourceMode,
  localizeBriefText,
} from '@/lib/dashboard-presenter';
import {
  getFeatureDescriptor,
  getFeatureGateState,
  HOME_PREMIUM_FEATURES,
  type EntitlementFeature,
} from '@/lib/monetization';

export default function HomeScreen() {
  const router = useRouter();
  const preview = useDashboardPreview();
  const auth = useAuth();
  const monetization = useMonetization();
  const { language } = useLanguage();
  const isPremium = monetization.accessTier === 'premium';
  const snapshot = preview.snapshot;
  const copy = language === 'es'
      ? {
        account: auth.isAuthenticated ? 'Perfil' : 'Cuenta',
        latestBrief: 'Lectura principal del mercado',
        overallConfidence: 'Confianza global',
        premium: 'Premium',
        free: 'Gratis',
        waiting: 'Esperando el snapshot del backend. La app mantiene la interfaz lista incluso cuando la API no esta disponible.',
        noLeader: 'Sin lider aun',
        primaryFlow: 'Tendencia primaria',
        secondaryFlow: 'Tendencia secundaria',
        noSecondary: 'Sin tendencia secundaria clara',
        flowStrength: 'Fuerza del flujo',
        confidence: 'Confianza',
        explainConfidence: 'Como se calcula la confianza',
        unavailable: 'No disponible',
        snapshotMode: 'Modo snapshot',
        metricsLeadBasket: 'Tema dominante',
        metricsLeadBasketDetail: 'El tema de mercado mas fuerte publicado por el ultimo snapshot guardado.',
        coverage: 'Cobertura',
        coverageDetail: 'Cuanta evidencia esperada cubrio el backend en esta lectura.',
        freshness: 'Frescura',
        freshnessDetail: 'Cuanto tiempo ha pasado desde la ultima actualizacion del snapshot en backend.',
        pending: 'Pendiente',
        premiumDepth: 'Profundidad premium',
        premiumDepthTitle: 'Gratis te orienta. Premium te deja profundizar de verdad.',
        premiumDepthBody: 'La comparativa usa valores simulados para explicar visualmente cuanto se amplian las capas de lectura y comodidad cuando se activa premium.',
        reviewPremium: 'Revisar acceso premium',
        freeVsPremium: 'Ver gratis vs premium',
        chartHint: 'Valores simulados para representar la diferencia de profundidad entre capas.',
        freeColumn: 'Gratis',
        premiumColumn: 'Premium',
        compareRows: [
          { key: 'history', label: 'Profundidad historica', free: 24, premium: 84 },
          { key: 'evidence', label: 'Evidencia visible', free: 36, premium: 88 },
          { key: 'conflicts', label: 'Conflictos y matices', free: 22, premium: 78 },
          { key: 'convenience', label: 'Comodidad del producto', free: 14, premium: 74 },
        ],
      }
    : {
        account: auth.isAuthenticated ? 'Profile' : 'Account',
        latestBrief: 'Main market read',
        overallConfidence: 'Overall confidence',
        premium: 'Premium',
        free: 'Free',
        waiting: 'Waiting for the backend snapshot. The app keeps the design ready even when the API is unavailable.',
        noLeader: 'No leader yet',
        primaryFlow: 'Primary flow',
        secondaryFlow: 'Secondary flow',
        noSecondary: 'No clear secondary flow yet',
        flowStrength: 'Flow strength',
        confidence: 'Confidence',
        explainConfidence: 'How confidence works',
        unavailable: 'Unavailable',
        snapshotMode: 'Snapshot mode',
        metricsLeadBasket: 'Leading theme',
        metricsLeadBasketDetail: 'The strongest market theme published by the latest stored snapshot.',
        coverage: 'Coverage',
        coverageDetail: 'How much of the expected evidence the backend covered in this reading.',
        freshness: 'Freshness',
        freshnessDetail: 'How long ago the current snapshot was refreshed on the backend.',
        pending: 'Pending',
        premiumDepth: 'Premium depth',
        premiumDepthTitle: 'Free keeps you oriented. Premium adds real depth.',
        premiumDepthBody: 'This comparison uses simulated values to show how much more depth and convenience premium adds on top of the same stored snapshot.',
        reviewPremium: 'Review premium access',
        freeVsPremium: 'View free vs premium',
        chartHint: 'Simulated values used to visualise the depth gap between tiers.',
        freeColumn: 'Free',
        premiumColumn: 'Premium',
        compareRows: [
          { key: 'history', label: 'History depth', free: 24, premium: 84 },
          { key: 'evidence', label: 'Visible evidence', free: 36, premium: 88 },
          { key: 'conflicts', label: 'Conflicts and nuance', free: 22, premium: 78 },
          { key: 'convenience', label: 'Product convenience', free: 14, premium: 74 },
        ],
      };
  const tierCards = language === 'es'
    ? [
        {
          key: 'free',
          label: 'Gratis',
          value: 'Lectura clara',
          detail: 'Resumen principal, contexto corto y una foto util del mercado.',
        },
        {
          key: 'premium',
          label: 'Premium',
          value: 'Mas contexto',
          detail: 'Mas historia, mas detalle, mejor seguimiento y experiencia sin anuncios.',
        },
      ]
    : [
        {
          key: 'free',
          label: 'Free',
          value: 'Clear read',
          detail: 'Main summary, short context, and a useful market picture.',
        },
        {
          key: 'premium',
          label: 'Premium',
          value: 'Deeper context',
          detail: 'More history, more detail, better follow-through, and no ads.',
        },
      ];
  const localizedFeatureCopy: Partial<
    Record<
      EntitlementFeature,
      {
        title: string;
        freeValue: string;
        freeDetail: string;
        premiumValue: string;
        premiumDetail: string;
        ctaLabel: string;
      }
    >
  > = language === 'es'
    ? {
        long_history: {
          title: 'Mas historico',
          freeValue: 'Vista previa de 7 dias',
          freeDetail: 'La capa gratis se queda con el tramo reciente para contener costes y seguir siendo clara.',
          premiumValue: 'Ventanas de 30 y 90 dias',
          premiumDetail: 'Premium desbloquea arcos mas largos para poner el ultimo snapshot en contexto.',
          ctaLabel: 'Desbloquear historico',
        },
        deeper_drilldowns: {
          title: 'Desglose por temas',
          freeValue: 'Solo vista previa',
          freeDetail: 'Gratis puede mostrar que existe evidencia mas profunda, pero la capa diagnostica completa se queda en premium.',
          premiumValue: 'Desglose completo',
          premiumDetail: 'Premium desbloquea mas contexto de impulsores, fricciones y evidencia por tema.',
          ctaLabel: 'Desbloquear detalle',
        },
        alerts: {
          title: 'Alertas',
          freeValue: 'Bloqueadas en gratis',
          freeDetail: 'La capa gratis puede mostrar que las alertas existen, pero la configuracion debe quedarse en premium.',
          premiumValue: 'Capa de alertas preparada',
          premiumDetail: 'Premium es donde deben vivir las alertas programadas y las futuras acciones de watchlist.',
          ctaLabel: 'Desbloquear alertas',
        },
      }
    : {};
  const primaryFlow = snapshot?.top_flows[0] ?? null;
  const secondaryFlow = snapshot?.top_flows[1] ?? null;
  const openPaywallForFeature = (feature: EntitlementFeature) => {
    if (auth.providerMode === 'backend' && !auth.isAuthenticated) {
      router.push({
        pathname: '/auth/login' as never,
        params: { redirect: `/paywall?feature=${feature}` },
      } as never);
      return;
    }

    router.push({
      pathname: '/paywall',
      params: { feature },
    });
  };
  const openConfidence = () => {
    if (auth.providerMode === 'backend' && !auth.isAuthenticated) {
      router.push({
        pathname: '/auth/login' as never,
        params: { redirect: '/confidence' },
      } as never);
      return;
    }

    router.push('/confidence');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={preview.isRefreshing}
            onRefresh={preview.refresh}
            tintColor={shellPalette.accentStrong}
          />
        }>
        <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            style={styles.summaryLabel}>
            {copy.latestBrief}
          </Text>
          <Pill label={isPremium ? copy.premium : copy.free} tone={isPremium ? 'success' : 'soft'} />
        </View>

        <Text style={styles.summarySmallLabel}>{copy.overallConfidence}</Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          style={styles.summaryValue}>
          {snapshot ? formatConfidence(snapshot.global_confidence) : '--'}
        </Text>

        <Text style={styles.summaryBody}>
          {snapshot
            ? localizeBriefText(snapshot.market_brief.summary, language)
            : copy.waiting}
        </Text>

        <View style={styles.summaryFlowStack}>
          <View style={[styles.summaryFlowCard, styles.summaryFlowPrimary]}>
            <Text style={styles.summaryTrendLabel}>{copy.primaryFlow}</Text>
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={styles.summaryFlowTitle}>
              {primaryFlow ? formatBucketLabel(primaryFlow.bucket_key, language) : copy.noLeader}
            </Text>
            <View style={styles.summaryFlowMeta}>
              <Text style={styles.summaryFlowMetaValue}>
                {primaryFlow ? `${copy.flowStrength} ${primaryFlow.score > 0 ? '+' : ''}${primaryFlow.score.toFixed(1)}` : '--'}
              </Text>
              <Text style={styles.summaryFlowMetaValue}>
                {primaryFlow ? `${formatConfidence(primaryFlow.confidence)} ${copy.confidence.toLowerCase()}` : '--'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryFlowCard}>
            <Text style={styles.summaryTrendLabel}>{copy.secondaryFlow}</Text>
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.76}
              style={styles.summaryFlowTitleSecondary}>
              {secondaryFlow
                ? formatBucketLabel(secondaryFlow.bucket_key, language)
                : copy.noSecondary}
            </Text>
            <View style={styles.summaryFlowMeta}>
              <Text style={styles.summaryFlowMetaMuted}>
                {secondaryFlow ? `${copy.flowStrength} ${secondaryFlow.score > 0 ? '+' : ''}${secondaryFlow.score.toFixed(1)}` : formatSourceMode(snapshot?.source_mode ?? 'unavailable', language)}
              </Text>
              <Text style={styles.summaryFlowMetaMuted}>
                {secondaryFlow
                  ? `${formatConfidence(secondaryFlow.confidence)} ${copy.confidence.toLowerCase()}`
                  : snapshot ? copy.snapshotMode : copy.pending}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryActionRow}>
          <ActionButton
            label={copy.explainConfidence}
            icon="arrow.right"
            variant="secondary"
            onPress={openConfidence}
          />
          <View style={styles.summaryModeChip}>
            <Text style={styles.summaryModeValue}>
              {snapshot ? formatSourceMode(snapshot.source_mode, language) : copy.unavailable}
            </Text>
          </View>
        </View>
        </View>

        <View style={styles.metricsRow}>
        <MetricCard
          label={copy.metricsLeadBasket}
          value={snapshot ? formatBucketLabel(snapshot.leading_bucket, language) : '--'}
          detail={copy.metricsLeadBasketDetail}
          tone="accent"
        />
        <MetricCard
          label={copy.coverage}
          value={snapshot ? formatCoverage(snapshot.coverage) : '--'}
          detail={copy.coverageDetail}
        />
        <MetricCard
          label={copy.freshness}
          value={
            snapshot
              ? formatFreshnessLocalized(snapshot.data_freshness.seconds_since_refresh, language)
              : copy.pending
          }
          detail={copy.freshnessDetail}
        />
        </View>

        <View style={styles.tierStrip}>
        {tierCards.map((card) => (
          <View
            key={card.key}
            style={[
              styles.tierCard,
              card.key === 'free' ? styles.tierCardFree : styles.tierCardPremium,
            ]}>
            <Text style={styles.tierLabel}>{card.label}</Text>
            <Text style={styles.tierValue}>{card.value}</Text>
            <Text style={styles.tierDetail}>{card.detail}</Text>
          </View>
        ))}
        </View>

        <LiveSnapshotPanel
          state={preview}
          onRefresh={preview.refresh}
          accessTier={monetization.accessTier}
          maxTopFlows={monetization.maxTopFlows}
          diagnosticsAccess={monetization.diagnosticsAccess}
          onOpenPaywall={openPaywallForFeature}
          onOpenConfidence={openConfidence}
        />

        <SectionCard
          eyebrow={copy.premiumDepth}
          title={copy.premiumDepthTitle}
          body={copy.premiumDepthBody}
          variant="contrast">
          <View style={styles.comparisonBoard}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonHint}>{copy.chartHint}</Text>
              <View style={styles.comparisonLegend}>
                <Pill label={copy.freeColumn} tone="soft" />
                <Pill label={copy.premiumColumn} tone="success" />
              </View>
            </View>
            <View style={styles.comparisonRows}>
              {copy.compareRows.map((row) => (
                <View key={row.key} style={styles.compareRow}>
                  <View style={styles.compareHeader}>
                    <Text style={styles.compareLabel}>{row.label}</Text>
                    <Text style={styles.compareValues}>
                      {row.free} / {row.premium}
                    </Text>
                  </View>
                  <View style={styles.compareTrack}>
                    <View style={[styles.compareFillFree, { width: `${row.free}%` }]} />
                    <View style={[styles.compareFillPremium, { width: `${row.premium}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.grid}>
            {HOME_PREMIUM_FEATURES.map((feature) => {
              const descriptor = getFeatureDescriptor(feature);
              const localizedDescriptor = localizedFeatureCopy[feature];
              const gateState = getFeatureGateState(monetization.entitlements, feature);
              const unlocked = gateState === 'unlocked';

              return (
                <FeatureGateCard
                  key={feature}
                  title={localizedDescriptor?.title ?? descriptor.title}
                  value={
                    unlocked
                      ? localizedDescriptor?.premiumValue ?? descriptor.premiumValue
                      : localizedDescriptor?.freeValue ?? descriptor.freeValue
                  }
                  detail={
                    unlocked
                      ? localizedDescriptor?.premiumDetail ?? descriptor.premiumDetail
                      : localizedDescriptor?.freeDetail ?? descriptor.freeDetail
                  }
                  status={gateState}
                  actionLabel={unlocked ? copy.reviewPremium : localizedDescriptor?.ctaLabel ?? descriptor.ctaLabel}
                  onPress={() => openPaywallForFeature(feature)}
                />
              );
            })}
          </View>
        </SectionCard>

        <HistoryAccessPanel
          entitlements={monetization.entitlements}
          allowedHistoryWindows={monetization.allowedHistoryWindows}
          onOpenPaywall={openPaywallForFeature}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: shellPalette.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: APP_DOCK_TAB_SPACER,
    gap: 18,
  },
  summaryCard: {
    borderRadius: 28,
    padding: 22,
    gap: 14,
    backgroundColor: shellPalette.accent,
    shadowColor: 'rgba(39, 105, 81, 0.24)',
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    color: 'rgba(245,248,251,0.78)',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  summarySmallLabel: {
    color: 'rgba(245,248,251,0.68)',
    fontSize: 12.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: shellPalette.contrastText,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: 0,
  },
  summaryBody: {
    color: 'rgba(245,248,251,0.84)',
    fontSize: 15,
    lineHeight: 22,
  },
  summaryTrendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryFlowStack: {
    gap: 10,
  },
  summaryFlowCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(245,248,251,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  summaryFlowPrimary: {
    backgroundColor: 'rgba(245,248,251,0.18)',
  },
  summaryFlowTitle: {
    color: shellPalette.contrastText,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: 0,
  },
  summaryFlowTitleSecondary: {
    color: shellPalette.contrastText,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
  },
  summaryFlowMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryFlowMetaValue: {
    color: shellPalette.contrastText,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryFlowMetaMuted: {
    color: 'rgba(245,248,251,0.74)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  summaryTrendChip: {
    flex: 1,
    minWidth: 130,
    borderRadius: 18,
    backgroundColor: 'rgba(245,248,251,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  summaryTrendValue: {
    color: shellPalette.contrastText,
    fontSize: 15,
    fontWeight: '800',
  },
  summaryTrendLabel: {
    color: 'rgba(245,248,251,0.70)',
    fontSize: 12.5,
    fontWeight: '600',
  },
  summaryActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  summaryModeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(245,248,251,0.12)',
  },
  summaryModeValue: {
    color: 'rgba(245,248,251,0.82)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tierStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  tierCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    shadowColor: shellPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tierCardFree: {
    backgroundColor: shellPalette.panel,
    borderColor: shellPalette.border,
  },
  tierCardPremium: {
    backgroundColor: shellPalette.accentSoft,
    borderColor: 'rgba(62,157,120,0.18)',
  },
  tierLabel: {
    color: shellPalette.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  tierValue: {
    color: shellPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  tierDetail: {
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  comparisonBoard: {
    gap: 14,
    marginBottom: 6,
  },
  comparisonHeader: {
    gap: 10,
  },
  comparisonHint: {
    color: 'rgba(245,248,251,0.70)',
    fontSize: 13,
    lineHeight: 18,
  },
  comparisonLegend: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  comparisonRows: {
    gap: 10,
  },
  compareRow: {
    gap: 8,
  },
  compareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  compareLabel: {
    color: shellPalette.contrastText,
    fontSize: 14,
    fontWeight: '700',
  },
  compareValues: {
    color: 'rgba(245,248,251,0.60)',
    fontSize: 12.5,
    fontWeight: '700',
  },
  compareTrack: {
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(245,248,251,0.10)',
    overflow: 'hidden',
    position: 'relative',
  },
  compareFillFree: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: '#CAD2DE',
  },
  compareFillPremium: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: shellPalette.accent,
    opacity: 0.92,
  },
});
