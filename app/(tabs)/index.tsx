import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/shell';
import { dashboardCards, roadmapItems, shellPalette } from '@/constants/shell';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Pill label="DineralFlow iOS" tone="accent" />
        <Text style={styles.kicker}>Mobile shell for the next version of the product</Text>
        <Text style={styles.title}>Global capital regime, rebuilt for iPhone.</Text>
        <Text style={styles.body}>
          This repo will migrate the dashboard, baskets, assets, drilldowns, and data provenance
          from the web app into a clean iOS experience. The first release stays honest about what
          exists today and what still needs to be connected.
        </Text>
        <View style={styles.actions}>
          <ActionButton
            label="Open roadmap"
            icon="arrow.right"
            variant="primary"
            onPress={() => router.push('/roadmap')}
          />
          <ActionButton
            label="Review platform note"
            icon="folder.fill"
            onPress={() => router.push('/roadmap')}
          />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard
          label="Scope"
          value="Product shell"
          detail="A small, testable starting point instead of a direct port of every web view."
        />
        <MetricCard
          label="Data stance"
          value="No invented data"
          detail="Future screens should always show source, freshness, and confidence."
        />
      </View>

      <SectionCard
        eyebrow="Project status"
        title="Short phases that keep the migration manageable"
        body="Each phase stays small so we can validate the app on Windows first and defer native iOS build work until the handoff to macOS/Xcode.">
        {roadmapItems.map((item, index) => (
          <View key={item} style={[styles.roadmapLine, index === roadmapItems.length - 1 && styles.roadmapLastLine]}>
            <Text style={styles.roadmapDot}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.roadmapText}>{item}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard
        eyebrow="Product map"
        title="What this iOS repo will gradually contain"
        body="The first mobile release will focus on clarity: the dashboard, basket detail, asset views, and evidence trail need to read well before they become feature-rich.">
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
        title="Windows is enough for this stage, macOS is needed later"
        body="We can build the shell, run the lint and test suite, and validate the app structure on this PC. Final iOS simulator builds, signing, and distribution will require macOS and Xcode.">
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Current local stack</Text>
          <Text style={styles.noticeBody}>
            Expo Router, TypeScript, local unit tests, and a sober visual system are already in
            place. The remaining work is to connect the real data model and replace placeholders
            screen by screen.
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
