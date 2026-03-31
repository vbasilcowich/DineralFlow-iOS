import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FeatureGateCard } from '@/components/feature-gate-card';
import { HistoryAccessPanel } from '@/components/history-access-panel';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LiveSnapshotPanel } from '@/components/live-snapshot-panel';
import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/shell';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  legalBoundaryNotes,
  roadmapItems,
  shellPalette,
} from '@/constants/shell';
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

function getGreetingLabel(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 19) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const preview = useDashboardPreview();
  const monetization = useMonetization();
  const { language } = useLanguage();
  const isPremium = monetization.accessTier === 'premium';
  const snapshot = preview.snapshot;
  const greetingLabel = getGreetingLabel();
  const copy = language === 'es'
      ? {
        greeting: greetingLabel === 'Good morning'
          ? 'Buenos dias'
          : greetingLabel === 'Good afternoon'
            ? 'Buenas tardes'
            : 'Buenas noches',
        title: 'Tu resumen de mercado',
        subtitle: 'Inteligencia de mercado basada en snapshots y apoyada en fuentes publicas.',
        latestBrief: 'Ultimo resumen de mercado',
        overallConfidence: 'Confianza global',
        premium: 'Premium',
        free: 'Gratis',
        waiting: 'Esperando el snapshot del backend. La app mantiene la interfaz lista incluso cuando la API no esta disponible.',
        noLeader: 'Sin lider aun',
        primaryFlow: 'Tendencia primaria',
        secondaryFlow: 'Tendencia secundaria',
        noSecondary: 'Sin tendencia secundaria clara',
        score: 'Score',
        confidence: 'Confianza',
        explainConfidence: 'Como se calcula la confianza',
        leadBasket: 'Cesta lider',
        unavailable: 'No disponible',
        snapshotMode: 'Modo snapshot',
        metricsLeadBasket: 'Cesta lider',
        metricsLeadBasketDetail: 'La cesta mas fuerte publicada por el ultimo snapshot guardado.',
        coverage: 'Cobertura',
        coverageDetail: 'Cuanta evidencia esperada cubrio el backend en esta lectura.',
        freshness: 'Frescura',
        freshnessDetail: 'Cuanto tiempo ha pasado desde la ultima actualizacion del snapshot en backend.',
        pending: 'Pendiente',
        premiumDepth: 'Profundidad premium',
        premiumDepthTitle: 'La capa gratis sigue siendo util y premium anade mas profundidad',
        premiumDepthBody: 'El lenguaje visual es mas amable, pero las reglas del producto no cambian: gratis demuestra valor y premium desbloquea mas contexto alrededor del mismo snapshot.',
        reviewPremium: 'Revisar acceso premium',
        trustRules: 'Reglas de confianza',
        trustRulesTitle: 'El diseno puede sentirse mas amable sin debilitar la postura del producto',
        trustRulesBody: 'Estas notas siguen visibles porque la app siempre debe explicar como se mantiene honesta en lo comercial y en lo legal.',
        shipsNext: 'Siguiente envio',
        shipsNextTitle: 'Fases cortas para mantener el producto manejable',
        shipsNextBody: 'La ruta de lanzamiento sigue siendo incremental: mantener la capa gratis legible, anadir profundidad premium con cuidado y no fingir que ya existe un terminal completo.',
        openRoadmap: 'Abrir roadmap',
        freeVsPremium: 'Ver gratis vs premium',
      }
    : {
        greeting: `${greetingLabel} - DineralFlow`,
        title: 'Your market summary',
        subtitle: 'Snapshot-first market intelligence built around public-data-backed briefs.',
        latestBrief: 'Latest market brief',
        overallConfidence: 'Overall confidence',
        premium: 'Premium',
        free: 'Free',
        waiting: 'Waiting for the backend snapshot. The app keeps the design ready even when the API is unavailable.',
        noLeader: 'No leader yet',
        primaryFlow: 'Primary flow',
        secondaryFlow: 'Secondary flow',
        noSecondary: 'No clear secondary flow yet',
        score: 'Score',
        confidence: 'Confidence',
        explainConfidence: 'How confidence works',
        leadBasket: 'Lead basket',
        unavailable: 'Unavailable',
        snapshotMode: 'Snapshot mode',
        metricsLeadBasket: 'Lead basket',
        metricsLeadBasketDetail: 'The strongest basket published by the latest stored snapshot.',
        coverage: 'Coverage',
        coverageDetail: 'How much of the expected evidence the backend covered in this reading.',
        freshness: 'Freshness',
        freshnessDetail: 'How long ago the current snapshot was refreshed on the backend.',
        pending: 'Pending',
        premiumDepth: 'Premium depth',
        premiumDepthTitle: 'Free stays useful, premium adds the deeper layers',
        premiumDepthBody: 'The visual language is friendlier now, but the product rules stay the same: free proves value and premium unlocks more context around the same snapshot.',
        reviewPremium: 'Review premium access',
        trustRules: 'Trust rules',
        trustRulesTitle: 'Design can feel softer without weakening the product stance',
        trustRulesBody: 'These notes remain visible because the app should always explain how it stays commercially and legally honest.',
        shipsNext: 'What ships next',
        shipsNextTitle: 'Short phases that keep the product manageable',
        shipsNextBody: 'The launch path remains incremental: keep the free tier readable, add premium depth carefully, and avoid pretending we already have a full terminal.',
        openRoadmap: 'Open roadmap',
        freeVsPremium: 'View free vs premium',
      };
  const tierCards = language === 'es'
    ? [
        {
          key: 'free',
          label: 'Gratis',
          value: 'Snapshot util',
          detail: 'Lectura principal y contexto corto para validar el producto.',
        },
        {
          key: 'premium',
          label: 'Premium',
          value: 'Mas profundidad',
          detail: 'Mas historia, mas detalle y experiencia sin anuncios.',
        },
      ]
    : [
        {
          key: 'free',
          label: 'Free',
          value: 'Useful snapshot',
          detail: 'Core reading and short context to prove the product.',
        },
        {
          key: 'premium',
          label: 'Premium',
          value: 'Deeper context',
          detail: 'More history, more detail, and an ad-free experience.',
        },
      ];
  const trustNotes = language === 'es'
    ? [
        'No prometer cobertura en tiempo real de nivel terminal en v1.',
        'No presentar Twelve Data o Alpha Vantage como base comercial del lanzamiento iOS.',
        'Mostrar siempre frescura, procedencia y si la pantalla usa el ultimo snapshot guardado.',
      ]
    : legalBoundaryNotes;
  const shippingItems = language === 'es'
    ? [
        'Lanzar una capa gratis util con el ultimo snapshot guardado, cestas seleccionadas e historico corto.',
        'Anadir Premium como primera capa de monetizacion para drilldowns completos, mas historia, watchlists y alertas.',
        'Mantener el posicionamiento comercial ligado a fuentes publicas y actualizaciones programadas del backend.',
        'Dejar los anuncios native para mas adelante y solo en la capa gratis, en lugares claramente separados.',
      ]
    : roadmapItems;
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
          title: 'Drilldowns de cestas',
          freeValue: 'Solo vista previa',
          freeDetail: 'Gratis puede mostrar que existe evidencia mas profunda, pero la capa diagnostica completa se queda en premium.',
          premiumValue: 'Drilldowns completos',
          premiumDetail: 'Premium desbloquea mas contexto de impulsores, fricciones y evidencia por cesta.',
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
    router.push({
      pathname: '/paywall',
      params: { feature },
    });
  };
  const openConfidence = () => {
    router.push('/confidence');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={preview.isRefreshing}
          onRefresh={preview.refresh}
          tintColor={shellPalette.accentStrong}
        />
      }>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.greeting}>{copy.greeting}</Text>
          <Text style={styles.pageTitle}>{copy.title}</Text>
          <Text style={styles.pageSubtitle}>{copy.subtitle}</Text>
        </View>

        <View style={styles.headerActions}>
          <LanguageSwitcher />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/roadmap')}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
            <IconSymbol name="list.bullet.rectangle.fill" size={20} color={shellPalette.text} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/paywall')}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
            <IconSymbol name="folder.fill" size={20} color={shellPalette.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <Text style={styles.summaryLabel}>{copy.latestBrief}</Text>
          <Pill label={isPremium ? copy.premium : copy.free} tone={isPremium ? 'success' : 'soft'} />
        </View>

        <Text style={styles.summarySmallLabel}>{copy.overallConfidence}</Text>
        <Text style={styles.summaryValue}>
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
            <Text style={styles.summaryFlowTitle}>
              {primaryFlow ? formatBucketLabel(primaryFlow.bucket_key, language) : copy.noLeader}
            </Text>
            <View style={styles.summaryFlowMeta}>
              <Text style={styles.summaryFlowMetaValue}>
                {primaryFlow ? `${copy.score} ${primaryFlow.score > 0 ? '+' : ''}${primaryFlow.score.toFixed(1)}` : '--'}
              </Text>
              <Text style={styles.summaryFlowMetaValue}>
                {primaryFlow ? `${formatConfidence(primaryFlow.confidence)} ${copy.confidence.toLowerCase()}` : '--'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryFlowCard}>
            <Text style={styles.summaryTrendLabel}>{copy.secondaryFlow}</Text>
            <Text style={styles.summaryFlowTitleSecondary}>
              {secondaryFlow
                ? formatBucketLabel(secondaryFlow.bucket_key, language)
                : copy.noSecondary}
            </Text>
            <View style={styles.summaryFlowMeta}>
              <Text style={styles.summaryFlowMetaMuted}>
                {secondaryFlow ? `${copy.score} ${secondaryFlow.score > 0 ? '+' : ''}${secondaryFlow.score.toFixed(1)}` : formatSourceMode(snapshot?.source_mode ?? 'unavailable', language)}
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
          <View key={card.key} style={styles.tierCard}>
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
        body={copy.premiumDepthBody}>
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

      <SectionCard
        eyebrow={copy.trustRules}
        title={copy.trustRulesTitle}
        body={copy.trustRulesBody}>
        <View style={styles.guardrailList}>
          {trustNotes.map((item) => (
            <Text key={item} style={styles.guardrailItem}>
              - {item}
            </Text>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow={copy.shipsNext}
        title={copy.shipsNextTitle}
        body={copy.shipsNextBody}>
        {shippingItems.map((item, index) => (
          <View
            key={item}
            style={[styles.roadmapLine, index === shippingItems.length - 1 && styles.roadmapLastLine]}>
            <Text style={styles.roadmapDot}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.roadmapText}>{item}</Text>
          </View>
        ))}
        <View style={styles.bottomActions}>
          <ActionButton
            label={copy.openRoadmap}
            icon="arrow.right"
            variant="secondary"
            onPress={() => router.push('/roadmap')}
          />
          <ActionButton
            label={copy.freeVsPremium}
            icon="folder.fill"
            variant="primary"
            onPress={() => router.push('/paywall')}
          />
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: shellPalette.bg,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 36,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  greeting: {
    color: shellPalette.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  pageTitle: {
    color: shellPalette.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  pageSubtitle: {
    color: shellPalette.textSoft,
    fontSize: 14.5,
    lineHeight: 21,
    maxWidth: 320,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 4,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: shellPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
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
    letterSpacing: -0.8,
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
    letterSpacing: -0.3,
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
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 16,
    gap: 8,
    shadowColor: shellPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
  guardrailList: {
    gap: 10,
  },
  guardrailItem: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  roadmapLine: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: shellPalette.border,
  },
  roadmapLastLine: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  roadmapDot: {
    minWidth: 38,
    color: shellPalette.accentStrong,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  roadmapText: {
    flex: 1,
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
  },
});
