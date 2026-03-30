import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ActionButton, PhaseRow, Pill, SectionCard } from '@/components/shell';
import { projectPhases, shellPalette } from '@/constants/shell';
import { useMonetization } from '@/hooks/use-monetization';

export default function RoadmapScreen() {
  const router = useRouter();
  const monetization = useMonetization();
  const isPremium = monetization.accessTier === 'premium';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pill label="Roadmap" tone="info" />
        <Pill label={isPremium ? 'Premium active' : 'Free tier active'} tone={isPremium ? 'success' : 'soft'} />
        <Text style={styles.title}>A short path to a public-data launch</Text>
        <Text style={styles.body}>
          The iOS app should grow in phases that protect product clarity, monetization, and legal
          positioning. The goal is not to port every screen quickly, but to ship a paid product we
          can defend technically and commercially.
        </Text>
        <View style={styles.headerActions}>
          <ActionButton
            label={isPremium ? 'Review premium state' : 'Open paywall'}
            icon="arrow.right"
            variant="primary"
            onPress={() => router.push('/paywall')}
          />
        </View>
      </View>

      <SectionCard
        eyebrow="Plan"
        title="What gets built before a paid launch"
        body="The first release should be useful with scheduled snapshots and public-data-friendly positioning. Premium should add depth later without depending on real-time promises or risky feed assumptions.">
        <View style={styles.phaseList}>
          {projectPhases.map((phase) => (
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
        eyebrow="Launch rule"
        title="The product should say latest snapshot, not real-time"
        body="The launch positioning should avoid suggesting exchange-grade real-time coverage. We should publish the latest available snapshot, explain how fresh it is, and keep the data stance honest on every screen.">
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>Commercial guardrail</Text>
          <Text style={styles.calloutText}>
            Twelve Data and Alpha Vantage may still exist in prototype environments, but they
            should not define the commercial iOS launch story while we are optimizing for low-cost
            legal safety.
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
  header: {
    borderRadius: 30,
    padding: 22,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    gap: 12,
  },
  title: {
    color: shellPalette.text,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  body: {
    color: shellPalette.textSoft,
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
    backgroundColor: 'rgba(212,175,55,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.18)',
    padding: 16,
    gap: 8,
  },
  calloutLabel: {
    color: shellPalette.accentSoft,
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
