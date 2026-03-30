import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PhaseRow, Pill, SectionCard } from '@/components/shell';
import { projectPhases, shellPalette } from '@/constants/shell';

export default function RoadmapScreen() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pill label="Roadmap" tone="info" />
        <Text style={styles.title}>A short, honest migration path</Text>
        <Text style={styles.body}>
          The mobile app will grow in phases so each step can be tested and reviewed before the
          next one starts. This avoids building a large, fragile iOS port in one jump.
        </Text>
      </View>

      <SectionCard
        eyebrow="Plan"
        title="What gets built first"
        body="The first release should be useful even if the data layer is still incomplete. The emphasis is on navigation, legibility, and a clean handoff to the live backend later.">
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
        eyebrow="Constraints"
        title="What we can and cannot do on this machine"
        body="Expo and React Native are enough to develop the app shell here, run tests, and iterate on the UI. For native iOS simulator builds, signing, and final device testing we will need macOS with Xcode.">
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>Current focus</Text>
          <Text style={styles.calloutText}>
            Keep the repo lean, keep the design sober, and move one screen at a time from placeholder
            to real data.
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
