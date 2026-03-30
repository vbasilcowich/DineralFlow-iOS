import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LiveSnapshotPanel } from '@/components/live-snapshot-panel';
import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/shell';
import {
  accessTiers,
  dashboardCards,
  legalBoundaryNotes,
  roadmapItems,
  shellPalette,
} from '@/constants/shell';
import { useDashboardPreview } from '@/hooks/use-dashboard-preview';
import { useMonetization } from '@/hooks/use-monetization';

export default function HomeScreen() {
  const router = useRouter();
  const preview = useDashboardPreview();
  const monetization = useMonetization();
  const isPremium = monetization.accessTier === 'premium';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={preview.isRefreshing}
          onRefresh={preview.refresh}
          tintColor={shellPalette.accent}
        />
      }>
      <View style={styles.hero}>
        <Pill label="DineralFlow iOS" tone="accent" />
        <Pill label={isPremium ? 'Premium unlocked' : 'Free tier active'} tone={isPremium ? 'success' : 'info'} />
        <Text style={styles.kicker}>Snapshot-based finance app for iPhone</Text>
        <Text style={styles.title}>Global capital regime with a free tier and premium depth.</Text>
        <Text style={styles.body}>
          The launch product is being redesigned around scheduled snapshots, public-data-first
          sourcing, and a clear free versus premium model. The goal is to monetize without
          pretending the app is a real-time terminal on day one.
        </Text>
        <View style={styles.actions}>
          <ActionButton
            label="Open roadmap"
            icon="arrow.right"
            variant="primary"
            onPress={() => router.push('/roadmap')}
          />
          <ActionButton
            label="View free vs premium"
            icon="folder.fill"
            onPress={() => router.push('/paywall')}
          />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          label="Launch mode"
          value="Latest snapshot"
          detail="The app should read the latest stored backend snapshot, not call data vendors on every open."
        />
        <MetricCard
          label="Access tier"
          value={isPremium ? 'Premium' : 'Free'}
          detail={
            isPremium
              ? 'Premium unlocks deeper drilldowns, longer history, and a clean ad-free posture.'
              : 'Free keeps the main snapshot readable while premium adds depth and convenience.'
          }
        />
      </View>

      <SectionCard
        eyebrow="Free and premium"
        title="Monetize depth, not noisy raw feeds"
        body="The free tier should prove the product clearly. Premium should unlock more history, deeper drilldowns, and future convenience features without turning the app into a licensing trap.">
        <View style={styles.grid}>
          {accessTiers.map((card) => (
            <View key={card.key} style={styles.gridCard}>
              <Text style={styles.gridTitle}>{card.label}</Text>
              <Text style={styles.gridValue}>{card.value}</Text>
              <Text style={styles.gridDetail}>{card.detail}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Launch guardrails"
        title="Rules that keep the first paid version defensible"
        body="These are product and legal guardrails, not just engineering preferences. The app should look like a trustworthy analytics product, not an improvised market-feed wrapper.">
        <View style={styles.guardrailList}>
          {legalBoundaryNotes.map((item) => (
            <Text key={item} style={styles.guardrailItem}>
              - {item}
            </Text>
          ))}
        </View>
      </SectionCard>

      <LiveSnapshotPanel state={preview} onRefresh={preview.refresh} accessTier={monetization.accessTier} />

      <SectionCard
        eyebrow="Project status"
        title="Short phases that keep the product commercially sane"
        body="The mobile app now needs more than UI migration. Each phase must keep product scope, legal positioning, and monetization aligned before we add more depth.">
        {roadmapItems.map((item, index) => (
          <View
            key={item}
            style={[styles.roadmapLine, index === roadmapItems.length - 1 && styles.roadmapLastLine]}>
            <Text style={styles.roadmapDot}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.roadmapText}>{item}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard
        eyebrow="Product map"
        title="What the first monetizable release should contain"
        body="The first paid-ready version should focus on a clear snapshot product, honest evidence, and a premium layer that adds depth rather than pretending to be exchange-grade real-time data.">
        <View style={styles.grid}>
          {dashboardCards.map((card) => (
            <View key={card.key} style={styles.gridCard}>
              <Text style={styles.gridTitle}>{card.title}</Text>
              <Text style={styles.gridValue}>{card.value}</Text>
              <Text style={styles.gridDetail}>{card.detail}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Platform note"
        title="Windows is enough for product shaping, macOS is needed for release work"
        body="We can shape the product, the paywall model, the gating rules, and the snapshot workflow on this PC. Final iOS simulator builds, signing, and App Store delivery still require macOS and Xcode.">
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Current technical position</Text>
          <Text style={styles.noticeBody}>
            Expo Router, TypeScript, local unit tests, and a backend preview already exist. The
            next product step is to make the app monetizable without depending on legally fragile
            launch data sources.
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 18,
  },
  hero: {
    borderRadius: 30,
    padding: 22,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    gap: 12,
  },
  kicker: {
    color: shellPalette.accentSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: shellPalette.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  body: {
    color: shellPalette.textSoft,
    fontSize: 15.5,
    lineHeight: 23,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    color: shellPalette.accent,
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
  guardrailList: {
    gap: 10,
  },
  guardrailItem: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
    borderRadius: 20,
    backgroundColor: shellPalette.panelSoft,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 16,
    gap: 6,
  },
  gridTitle: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  gridValue: {
    color: shellPalette.accentSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  gridDetail: {
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  notice: {
    borderRadius: 20,
    backgroundColor: 'rgba(121,184,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(121,184,255,0.18)',
    padding: 16,
    gap: 8,
  },
  noticeTitle: {
    color: shellPalette.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  noticeBody: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
});
