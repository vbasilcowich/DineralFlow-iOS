import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ActionButton, PhaseRow, Pill, SectionCard } from '@/components/shell';
import { projectPhases, shellPalette } from '@/constants/shell';
import { useMonetization } from '@/hooks/use-monetization';
import { useLanguage } from '@/lib/language';

export default function RoadmapScreen() {
  const router = useRouter();
  const monetization = useMonetization();
  const { language } = useLanguage();
  const isPremium = monetization.accessTier === 'premium';
  const copy = language === 'es'
    ? {
        roadmap: 'Roadmap',
        premiumActive: 'Premium activo',
        freeActive: 'Capa gratis activa',
        title: 'Un camino corto hacia un lanzamiento mas claro y seguro',
        body: 'La app iOS debe crecer por fases que protejan la claridad del producto, la monetizacion y el posicionamiento legal. La meta no es portar todas las pantallas deprisa, sino lanzar un producto de pago que podamos defender tecnica y comercialmente.',
        reviewPremium: 'Revisar premium',
        openPaywall: 'Abrir paywall',
        plan: 'Plan',
        planTitle: 'Que se construye antes del lanzamiento de pago',
        planBody: 'La primera version debe ser util con snapshots programados y un posicionamiento compatible con fuentes publicas. Premium debe anadir profundidad despues sin depender de promesas de tiempo real ni de supuestos arriesgados sobre los feeds.',
        launchRule: 'Regla de lanzamiento',
        launchTitle: 'El producto debe decir ultimo snapshot, no tiempo real',
        launchBody: 'El posicionamiento inicial debe evitar sugerir cobertura en tiempo real de nivel mercado. Debemos publicar el ultimo snapshot disponible, explicar su frescura y mantener la postura de datos honesta en cada pantalla.',
        guardrail: 'Guardarrail comercial',
        guardrailBody: 'Algunos feeds de mercado restringidos pueden seguir existiendo en entornos internos, pero no deben definir la historia comercial del lanzamiento iOS mientras optimizamos seguridad legal y costes bajos.',
      }
    : {
        roadmap: 'Roadmap',
        premiumActive: 'Premium active',
        freeActive: 'Free tier active',
        title: 'A short path to a friendlier, safer launch',
        body: 'The iOS app should grow in phases that protect product clarity, monetization, and legal positioning. The goal is not to port every screen quickly, but to ship a paid product we can defend technically and commercially.',
        reviewPremium: 'Review premium state',
        openPaywall: 'Open paywall',
        plan: 'Plan',
        planTitle: 'What gets built before a paid launch',
        planBody: 'The first release should be useful with scheduled snapshots and public-data-friendly positioning. Premium should add depth later without depending on real-time promises or risky feed assumptions.',
        launchRule: 'Launch rule',
        launchTitle: 'The product should say latest snapshot, not real-time',
        launchBody: 'The launch positioning should avoid suggesting exchange-grade real-time coverage. We should publish the latest available snapshot, explain how fresh it is, and keep the data stance honest on every screen.',
        guardrail: 'Commercial guardrail',
        guardrailBody: 'Some restricted market feeds may still exist in internal environments, but they should not define the commercial iOS launch story while we are optimizing for low-cost legal safety.',
      };
  const phases = language === 'es'
    ? [
        {
          key: 'foundation',
          label: 'Base',
          title: 'Shell de snapshots y marco de producto',
          description: 'Cerrar el modelo free/premium, la postura basada en datos publicos y la narrativa de snapshots programados.',
          status: 'En curso',
        },
        {
          key: 'publicData',
          label: 'Datos publicos',
          title: 'Macro, energia y evidencia mas segura',
          description: 'Priorizar fuentes publicas y faciles de atribuir antes de ampliar a market data licenciada.',
          status: 'Planificado',
        },
        {
          key: 'premium',
          label: 'Premium',
          title: 'Suscripciones, paywall y entitlements',
          description: 'Desbloquear profundidad, historico, watchlists y alertas antes de introducir anuncios.',
          status: 'Planificado',
        },
        {
          key: 'ads',
          label: 'Ads',
          title: 'Solo native ads en free y mas adelante',
          description: 'Introducir anuncios native solo despues de las suscripciones y solo en lugares que no rompan la confianza.',
          status: 'Diferido',
        },
        {
          key: 'release',
          label: 'Release',
          title: 'Backend reforzado y camino a App Store',
          description: 'Preparar hosting, suscripciones de App Store, textos legales y el traspaso posterior a macOS/Xcode.',
          status: 'Bloqueado por macOS',
        },
      ]
    : projectPhases;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.switcherRow}>
        <LanguageSwitcher />
      </View>
      <View style={styles.header}>
        <Pill label={copy.roadmap} tone="info" />
        <Pill label={isPremium ? copy.premiumActive : copy.freeActive} tone={isPremium ? 'success' : 'soft'} />
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>
        <View style={styles.headerActions}>
          <ActionButton
            label={isPremium ? copy.reviewPremium : copy.openPaywall}
            icon="arrow.right"
            variant="primary"
            onPress={() => router.push('/paywall')}
          />
        </View>
      </View>

      <SectionCard
        eyebrow={copy.plan}
        title={copy.planTitle}
        body={copy.planBody}>
        <View style={styles.phaseList}>
          {phases.map((phase) => (
            <PhaseRow
              key={phase.key}
              label={phase.label}
              title={phase.title}
              description={phase.description}
              status={phase.status}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow={copy.launchRule}
        title={copy.launchTitle}
        body={copy.launchBody}>
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>{copy.guardrail}</Text>
          <Text style={styles.calloutText}>{copy.guardrailBody}</Text>
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
  switcherRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  header: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: shellPalette.accent,
    borderWidth: 1,
    borderColor: 'rgba(45,126,97,0.16)',
    gap: 12,
    shadowColor: 'rgba(39, 105, 81, 0.24)',
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    color: shellPalette.contrastText,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  body: {
    color: 'rgba(245,248,251,0.84)',
    fontSize: 15,
    lineHeight: 22,
  },
  phaseList: {
    gap: 2,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  callout: {
    borderRadius: 20,
    backgroundColor: shellPalette.panelMuted,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 16,
    gap: 8,
  },
  calloutLabel: {
    color: shellPalette.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  calloutText: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
});
