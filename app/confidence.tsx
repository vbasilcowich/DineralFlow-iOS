import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardPreview } from '@/hooks/use-dashboard-preview';
import { useMonetization } from '@/hooks/use-monetization';
import {
  formatBucketLabel,
  formatConfidence,
  formatCoverage,
  formatFreshnessLocalized,
  formatProviderIssueMessageLocalized,
  formatSourceMode,
  formatFlowScore,
  localizeBriefText,
} from '@/lib/dashboard-presenter';
import { useLanguage } from '@/lib/language';

function ConfidenceBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.barGroup}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{formatConfidence(value)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.max(6, Math.min(100, value))}%` }]} />
      </View>
    </View>
  );
}

export default function ConfidenceScreen() {
  const router = useRouter();
  const auth = useAuth();
  const preview = useDashboardPreview();
  const monetization = useMonetization();
  const { language } = useLanguage();
  const snapshot = preview.snapshot;
  const isPremium = monetization.accessTier === 'premium';
  const primaryFlow = snapshot?.top_flows[0] ?? null;
  const secondaryFlow = snapshot?.top_flows[1] ?? null;
  const visibleEvidence = snapshot?.market_brief.evidence.slice(0, isPremium ? 3 : 1) ?? [];
  const visibleIssues = snapshot?.provider_issues.slice(0, isPremium ? 3 : 1) ?? [];
  const conflictCount = (snapshot?.risks.length ?? 0) + (snapshot?.provider_issues.length ?? 0);

  const copy = language === 'es'
    ? {
        title: 'Como se calcula la confianza',
        body: 'La app no inventa este porcentaje. Lo usa para resumir cuanta conviccion tiene la lectura segun cobertura, acuerdo entre senales, frescura y fricciones detectadas.',
        methodology: 'Metodologia',
        methodologyTitle: 'Las cuatro piezas que mueven la confianza',
        methodologyBody: 'La confianza sube cuando las senales principales empujan en la misma direccion, hay buena cobertura, los datos son recientes y aparecen menos conflictos. Baja cuando faltan piezas o varias pruebas se contradicen.',
        signalAgreement: 'Acuerdo entre senales',
        signalAgreementDetail: 'Miramos si la tendencia principal y la secundaria apuntan a una historia parecida o si tiran en direcciones distintas.',
        coverage: 'Cobertura',
        coverageDetail: 'Cuanta evidencia esperada ha conseguido cubrir el backend en este snapshot.',
        freshness: 'Frescura',
        freshnessDetail: 'Cuanto tiempo ha pasado desde la ultima actualizacion guardada.',
        friction: 'Friccion',
        frictionDetail: 'Numero de alertas, riesgos o incidencias activas alrededor de la lectura actual.',
        currentRead: 'Lectura actual',
        currentReadTitle: 'Tendencia primaria y secundaria publicadas',
        currentReadBody: 'Estas son las dos corrientes que mejor explican el snapshot actual. La tendencia primaria sigue siendo la mas destacada, pero ahora dejamos visible tambien la secundaria para que el mercado se vea menos binario.',
        noPrimary: 'Todavia no hay una tendencia primaria publicada.',
        currentEvidence: 'Evidencia actual',
        currentEvidenceTitle: 'De donde sale la confianza de esta lectura',
        currentEvidenceBody: 'En gratis mostramos una vista previa metodologica y una parte de la evidencia real. Premium desbloquea mas prueba, mas conflictos y la capa detallada de analisis.',
        sourceMode: 'Modo del snapshot',
        premiumLocked: 'Detalle premium',
        premiumLockedTitle: 'El analisis profundo y las graficas viven aqui',
        premiumLockedBody: 'La capa premium debe abrir el desglose completo de confianza: mas evidencia, mas conflictos, mas historico y graficas dedicadas por cesta.',
        openPremium: 'Abrir premium',
        backHome: 'Volver al resumen',
        confidence: 'Confianza',
        secondary: 'Secundaria',
        primary: 'Primaria',
      }
    : {
        title: 'How confidence works',
        body: 'The app does not invent this percentage. It uses confidence to summarise how much conviction the reading has based on coverage, signal agreement, freshness, and detected friction.',
        methodology: 'Methodology',
        methodologyTitle: 'The four parts behind confidence',
        methodologyBody: 'Confidence rises when the main signals move in the same direction, coverage is healthy, data is fresh, and fewer conflicts show up. It drops when expected pieces are missing or multiple clues disagree.',
        signalAgreement: 'Signal agreement',
        signalAgreementDetail: 'We look at whether the primary and secondary flows support a similar story or pull in different directions.',
        coverage: 'Coverage',
        coverageDetail: 'How much of the expected evidence the backend covered in this snapshot.',
        freshness: 'Freshness',
        freshnessDetail: 'How long it has been since the latest stored update.',
        friction: 'Friction',
        frictionDetail: 'How many active risks, warnings, or provider issues are pressing against the current read.',
        currentRead: 'Current read',
        currentReadTitle: 'Published primary and secondary flows',
        currentReadBody: 'These are the two currents that best explain the current snapshot. The primary flow stays highlighted, but the secondary one is now visible too so the market read feels less binary.',
        noPrimary: 'No primary flow has been published yet.',
        currentEvidence: 'Current evidence',
        currentEvidenceTitle: 'Where the confidence comes from right now',
        currentEvidenceBody: 'Free shows a methodological preview and part of the real evidence. Premium unlocks more proof, more conflicts, and the deeper analysis layer.',
        sourceMode: 'Snapshot mode',
        premiumLocked: 'Premium depth',
        premiumLockedTitle: 'Full confidence analysis and charts live here',
        premiumLockedBody: 'Premium should open the full confidence breakdown: more evidence, more conflicts, deeper history, and dedicated charts by basket.',
        openPremium: 'Open premium',
        backHome: 'Back to summary',
        confidence: 'Confidence',
        secondary: 'Secondary',
        primary: 'Primary',
      };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <LanguageSwitcher />
      </View>

      <SectionCard
        eyebrow={copy.methodology}
        title={copy.title}
        body={copy.body}
        variant="contrast">
        <View style={styles.heroMeta}>
          <Pill
            label={
              snapshot
                ? `${copy.confidence}: ${formatConfidence(snapshot.global_confidence)}`
                : `${copy.confidence}: --`
            }
            tone="success"
          />
          <Pill
            label={
              snapshot
                ? `${copy.sourceMode}: ${formatSourceMode(snapshot.source_mode, language)}`
                : `${copy.sourceMode}: --`
            }
            tone="soft"
          />
        </View>
      </SectionCard>

      <SectionCard
        eyebrow={copy.methodology}
        title={copy.methodologyTitle}
        body={copy.methodologyBody}>
        <View style={styles.metricGrid}>
          <MetricCard
            label={copy.signalAgreement}
            value={
              primaryFlow && secondaryFlow
                ? `${formatConfidence(primaryFlow.confidence)} / ${formatConfidence(secondaryFlow.confidence)}`
                : primaryFlow
                  ? formatConfidence(primaryFlow.confidence)
                  : '--'
            }
            detail={copy.signalAgreementDetail}
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
                : '--'
            }
            detail={copy.freshnessDetail}
          />
          <MetricCard
            label={copy.friction}
            value={String(conflictCount)}
            detail={copy.frictionDetail}
          />
        </View>
      </SectionCard>

      <SectionCard
        eyebrow={copy.currentRead}
        title={copy.currentReadTitle}
        body={copy.currentReadBody}>
        {primaryFlow ? (
          <View style={styles.readStack}>
            <View style={[styles.readCard, styles.readCardPrimary]}>
              <Text style={styles.readLabel}>{copy.primary}</Text>
              <Text style={styles.readTitle}>
                {formatBucketLabel(primaryFlow.bucket_key, language)}
              </Text>
              <ConfidenceBar
                label={`${copy.confidence} - ${formatBucketLabel(primaryFlow.bucket_key, language)}`}
                value={primaryFlow.confidence}
              />
                <Text style={styles.readMeta}>
                {(language === 'es' ? 'Fuerza del flujo' : 'Flow strength')} {formatFlowScore(primaryFlow.score)}
                </Text>
            </View>

            {secondaryFlow ? (
              <View style={styles.readCard}>
                <Text style={styles.readLabel}>{copy.secondary}</Text>
                <Text style={styles.readTitleSecondary}>
                  {formatBucketLabel(secondaryFlow.bucket_key, language)}
                </Text>
                <ConfidenceBar
                  label={`${copy.confidence} - ${formatBucketLabel(secondaryFlow.bucket_key, language)}`}
                  value={secondaryFlow.confidence}
                />
                <Text style={styles.readMeta}>
                  {(language === 'es' ? 'Fuerza del flujo' : 'Flow strength')} {formatFlowScore(secondaryFlow.score)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.helperText}>{copy.noPrimary}</Text>
        )}
      </SectionCard>

      <SectionCard
        eyebrow={copy.currentEvidence}
        title={copy.currentEvidenceTitle}
        body={copy.currentEvidenceBody}>
        <View style={styles.list}>
          {visibleEvidence.map((item) => (
            <View key={item.signal_key} style={styles.listRow}>
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{localizeBriefText(item.label, language)}</Text>
                <Text style={styles.listBody}>{localizeBriefText(item.summary, language)}</Text>
              </View>
              <View style={styles.listMeta}>
                <Text style={styles.listValue}>{item.delta_text}</Text>
                <Text style={styles.listSubvalue}>{item.provider_label}</Text>
              </View>
            </View>
          ))}
        </View>

        {visibleIssues.length > 0 ? (
          <View style={styles.issueList}>
            {visibleIssues.map((issue) => (
              <Text key={`${issue.provider_key}:${issue.message}`} style={styles.issueText}>
                - {formatProviderIssueMessageLocalized(issue, language)}
              </Text>
            ))}
          </View>
        ) : null}
      </SectionCard>

      {!isPremium ? (
        <SectionCard
          eyebrow={copy.premiumLocked}
          title={copy.premiumLockedTitle}
          body={copy.premiumLockedBody}>
          <View style={styles.buttonRow}>
        <ActionButton
          label={copy.openPremium}
          icon="arrow.right"
          variant="primary"
          onPress={() => {
            if (auth.providerMode === 'backend' && !auth.isAuthenticated) {
              router.push({
                pathname: '/auth/login' as never,
                params: { redirect: '/paywall?feature=deeper_drilldowns' },
              } as never);
              return;
            }

            router.push({
              pathname: '/paywall',
              params: { feature: 'deeper_drilldowns' },
            });
          }}
        />
      </View>
        </SectionCard>
      ) : null}

      <View style={styles.buttonRow}>
        <ActionButton
          label={copy.backHome}
          icon="arrow.right"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  readStack: {
    gap: 12,
  },
  readCard: {
    borderRadius: 22,
    backgroundColor: shellPalette.panelMuted,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 16,
    gap: 10,
  },
  readCardPrimary: {
    backgroundColor: shellPalette.accentSoft,
    borderColor: 'rgba(62,157,120,0.20)',
  },
  readLabel: {
    color: shellPalette.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  readTitle: {
    color: shellPalette.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  readTitleSecondary: {
    color: shellPalette.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  readMeta: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    fontWeight: '700',
  },
  barGroup: {
    gap: 6,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  barLabel: {
    flex: 1,
    color: shellPalette.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  barValue: {
    color: shellPalette.text,
    fontSize: 13,
    fontWeight: '800',
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: shellPalette.panelSoft,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: shellPalette.accent,
  },
  list: {
    gap: 2,
    backgroundColor: shellPalette.panelMuted,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: shellPalette.border,
    paddingHorizontal: 14,
  },
  listRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: shellPalette.border,
  },
  listCopy: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  listBody: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
  },
  listMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  listValue: {
    color: shellPalette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  listSubvalue: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
  },
  issueList: {
    gap: 8,
    paddingTop: 4,
  },
  issueText: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
  },
  helperText: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
