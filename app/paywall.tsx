import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useMonetization } from '@/hooks/use-monetization';
import { PAYWALL_PLAN_COPY, PREMIUM_FEATURE_COPY } from '@/lib/monetization';

export default function PaywallScreen() {
  const monetization = useMonetization();
  const isPremium = monetization.accessTier === 'premium';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Pill label="Premium" tone={isPremium ? 'success' : 'accent'} />
        <Text style={styles.title}>
          {isPremium ? 'Premium is unlocked in this development build.' : 'Premium unlocks the deeper workflow.'}
        </Text>
        <Text style={styles.body}>
          This paywall is a development-safe phase 1 stub. It lets us validate free versus premium
          flows, feature gating, and restore behavior before wiring real StoreKit or RevenueCat credentials.
        </Text>
      </View>

      <SectionCard
        eyebrow="Current access"
        title={isPremium ? 'Premium access is active' : 'Free tier is active'}
        body={
          isPremium
            ? 'This state unlocks deeper drilldowns, longer history, future watchlists, and an ad-free experience.'
            : 'The free tier keeps the main snapshot readable while reserving deeper depth and future convenience features for premium.'
        }>
        <View style={styles.badgeRow}>
          <Pill label={`Tier: ${monetization.accessTier}`} tone={isPremium ? 'success' : 'info'} />
          {monetization.entitlements.plan ? (
            <Pill label={`Plan: ${monetization.entitlements.plan}`} tone="soft" />
          ) : null}
          <Pill label={`Source: ${monetization.entitlements.source}`} tone="soft" />
        </View>
        {monetization.lastAction ? (
          <Text style={styles.metaText}>Last action: {monetization.lastAction}</Text>
        ) : null}
        {monetization.errorMessage ? (
          <Text style={styles.errorText}>Error: {monetization.errorMessage}</Text>
        ) : null}
      </SectionCard>

      <SectionCard
        eyebrow="What premium adds"
        title="Sell depth, not noisy feeds"
        body="Premium should monetize richer interpretation and convenience. The first implementation keeps the promise intentionally narrow and honest.">
        <View style={styles.featureList}>
          {PREMIUM_FEATURE_COPY.map((item) => (
            <Text key={item} style={styles.featureItem}>
              - {item}
            </Text>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Plans"
        title="Mock purchase actions for phase 1"
        body="These buttons are development placeholders. They simulate the purchase state transitions we will later wire to StoreKit and RevenueCat.">
        <View style={styles.planGrid}>
          {PAYWALL_PLAN_COPY.map((plan) => (
            <View key={plan.key} style={styles.planCard}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planDetail}>{plan.detail}</Text>
              <ActionButton
                label={`Activate ${plan.title}`}
                icon="arrow.right"
                variant="primary"
                onPress={() => void monetization.purchaseMockPremium(plan.key)}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Restore and reset"
        title="State transitions we need before real billing"
        body="Restore purchases and downgrade handling are product-critical. This development paywall keeps those flows testable now.">
        <View style={styles.buttonRow}>
          <ActionButton
            label="Restore purchases"
            icon="arrow.clockwise"
            onPress={() => void monetization.restorePurchases()}
          />
          <ActionButton
            label="Reset to free"
            icon="folder.fill"
            onPress={() => void monetization.resetToFree()}
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: {
    color: shellPalette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: shellPalette.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  planCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
    borderRadius: 20,
    backgroundColor: shellPalette.panelSoft,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 16,
    gap: 10,
  },
  planTitle: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  planDetail: {
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
