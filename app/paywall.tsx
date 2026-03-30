import { useEffect, useRef } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ActionButton, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useMonetization } from '@/hooks/use-monetization';
import { usePaywallConfig } from '@/hooks/use-paywall-config';
import {
  getFeatureDescriptor,
  isEntitlementFeature,
  PAYWALL_PLAN_COPY,
} from '@/lib/monetization';

export default function PaywallScreen() {
  const monetization = useMonetization();
  const isPremium = monetization.accessTier === 'premium';
  const usingMockBilling = monetization.billingProvider === 'mock';
  const usingRevenueCatBilling = monetization.billingProvider === 'revenuecat';
  const didSyncOnOpenRef = useRef(false);
  const params = useLocalSearchParams<{ feature?: string | string[] }>();
  const featureParam = Array.isArray(params.feature) ? params.feature[0] : params.feature;
  const focusedFeature = featureParam && isEntitlementFeature(featureParam) ? featureParam : null;
  const focusedDescriptor = focusedFeature ? getFeatureDescriptor(focusedFeature) : null;
  const paywallConfig = usePaywallConfig(focusedFeature, monetization.entitlements);
  const heroTitle = focusedDescriptor
    ? isPremium
      ? `${focusedDescriptor.title} is already part of premium.`
      : paywallConfig.config.headline
    : isPremium
      ? 'Premium is unlocked in this development build.'
      : paywallConfig.config.headline;
  const heroBody = focusedDescriptor
    ? paywallConfig.config.body
    : paywallConfig.config.body;

  useEffect(() => {
    if (didSyncOnOpenRef.current) {
      return;
    }

    didSyncOnOpenRef.current = true;
    void monetization.syncEntitlements('paywall_opened');
  }, [monetization]);

  const openLegalLink = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Pill label="Premium" tone={isPremium ? 'success' : 'accent'} />
        <Pill
          label={usingMockBilling ? 'Mock billing' : 'RevenueCat billing'}
          tone={usingMockBilling ? 'warning' : 'info'}
        />
        <Pill
          label={paywallConfig.source === 'backend' ? 'Backend paywall' : 'Local paywall fallback'}
          tone={paywallConfig.source === 'backend' ? 'success' : 'soft'}
        />
        {focusedDescriptor ? <Pill label={`Focus: ${focusedDescriptor.title}`} tone="soft" /> : null}
        <Text style={styles.title}>{heroTitle}</Text>
        <Text style={styles.body}>{heroBody}</Text>
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
          <Pill label={`Contract: ${monetization.entitlementsContractState}`} tone="soft" />
          <Pill label={`Billing: ${monetization.billingStatus}`} tone="soft" />
        </View>
        {focusedDescriptor ? (
          <Text style={styles.metaText}>
            This paywall was opened from the {focusedDescriptor.title} upgrade path.
          </Text>
        ) : null}
        <Text style={styles.metaText}>
          Entitlements sync: {monetization.entitlementsSyncStatus}
        </Text>
        <Text style={styles.metaText}>
          Contract revision: {monetization.entitlementsContractVersion}
        </Text>
        {monetization.entitlementsLastSyncAt ? (
          <Text style={styles.metaText}>
            Last access sync: {new Date(monetization.entitlementsLastSyncAt).toLocaleString()}
          </Text>
        ) : null}
        {monetization.entitlementsSyncMessage ? (
          <Text style={styles.metaText}>{monetization.entitlementsSyncMessage}</Text>
        ) : null}
        {paywallConfig.errorMessage ? (
          <Text style={styles.metaText}>Paywall config fallback: {paywallConfig.errorMessage}</Text>
        ) : null}
        <Text style={styles.metaText}>{monetization.billingStatusMessage}</Text>
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
          {paywallConfig.config.highlights.map((item) => (
            <Text key={item} style={styles.featureItem}>
              - {item}
            </Text>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Plans"
        title={
          monetization.canStartPurchase
            ? usingRevenueCatBilling
              ? 'RevenueCat purchase actions are ready for native builds'
              : 'Purchase actions for phase 1'
            : 'Billing setup still blocks real purchase start'
        }
        body={
          monetization.canStartPurchase
            ? usingRevenueCatBilling
              ? 'This build can start RevenueCat purchases in a native development build or TestFlight build. Web and Expo Go still only preview the paywall shell.'
              : 'These actions are ready for the current billing mode. In this build they still use a safe development flow.'
            : monetization.requiresNativeBillingBuild
              ? 'This build can show the paywall shell, but real purchase start needs native iOS billing setup and the missing configuration values.'
              : 'Billing start is disabled until the current provider is configured.'
        }>
        <View style={styles.planGrid}>
          {PAYWALL_PLAN_COPY.map((plan) => (
            <View key={plan.key} style={styles.planCard}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planDetail}>{plan.detail}</Text>
              <ActionButton
                label={usingMockBilling ? `Activate ${plan.title}` : `Start ${plan.title}`}
                icon="arrow.right"
                variant="primary"
                disabled={!monetization.canStartPurchase || monetization.isProcessing}
                onPress={() => void monetization.purchasePremium(plan.key)}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Legal links"
        title="Use the backend legal destinations from the current paywall contract"
        body="The paywall copy and legal links should come from the same contract so the commercial layer stays auditable.">
        <View style={styles.buttonRow}>
          <ActionButton
            label="Open terms"
            icon="arrow.right"
            onPress={() => openLegalLink(paywallConfig.config.legal_links.terms_url)}
          />
          <ActionButton
            label="Open privacy"
            icon="arrow.right"
            onPress={() => openLegalLink(paywallConfig.config.legal_links.privacy_url)}
          />
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Restore and reset"
        title={usingMockBilling ? 'State transitions we need before real billing' : 'Restore and sync access state'}
        body={
          usingMockBilling
            ? 'Restore purchases and downgrade handling are product-critical. This development paywall keeps those flows testable now.'
            : 'RevenueCat builds should focus on restore and sync. Resetting to free remains a mock-only developer shortcut.'
        }>
        <View style={styles.buttonRow}>
          <ActionButton
            label="Refresh access"
            icon="arrow.clockwise"
            disabled={monetization.isProcessing}
            onPress={() => void monetization.syncEntitlements()}
          />
          <ActionButton
            label="Restore purchases"
            icon="arrow.clockwise"
            disabled={monetization.isProcessing}
            onPress={() => void monetization.restorePurchases()}
          />
          {usingMockBilling ? (
            <ActionButton
              label="Reset to free"
              icon="folder.fill"
              disabled={monetization.isProcessing}
              onPress={() => void monetization.resetToFree()}
            />
          ) : null}
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
