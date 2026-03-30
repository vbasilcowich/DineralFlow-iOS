import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ActionButton, MetricCard, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '../constants/shell';
import type { DashboardPreviewState } from '@/hooks/use-dashboard-preview';
import type { AccessTier, EntitlementFeature } from '@/lib/monetization';
import { getApiBaseUrlNote } from '@/lib/api-config';
import {
  formatBucketLabel,
  formatConfidence,
  formatCoverage,
  formatFlowScore,
  formatFreshness,
  formatLoadError,
  formatSourceMode,
  getSourceModeTone,
} from '@/lib/dashboard-presenter';

type LiveSnapshotPanelProps = {
  state: DashboardPreviewState;
  onRefresh: () => void;
  accessTier: AccessTier;
  maxTopFlows: number;
  diagnosticsAccess: 'preview' | 'full';
  onOpenPaywall?: (feature: EntitlementFeature) => void;
};

export function LiveSnapshotPanel({
  state,
  onRefresh,
  accessTier,
  maxTopFlows,
  diagnosticsAccess,
  onOpenPaywall,
}: LiveSnapshotPanelProps) {
  const { snapshot, health } = state;
  const showingCachedSnapshot = state.snapshotOrigin === 'cached';
  const isPremium = accessTier === 'premium';
  const topFlowLimit = maxTopFlows;
  const visibleRisks = snapshot ? snapshot.risks.slice(0, isPremium ? snapshot.risks.length : 1) : [];
  const visibleProviderIssues = snapshot
    ? snapshot.provider_issues.slice(0, diagnosticsAccess === 'full' ? snapshot.provider_issues.length : 1)
    : [];

  return (
    <SectionCard
      eyebrow="Prototype backend preview"
      title="Latest backend snapshot for development"
      body="This panel is for technical validation of the current backend connection. The commercial iOS launch is being repositioned around scheduled snapshots and public-data-first sourcing, so this preview is not the final product promise.">
      <View style={styles.buttonRow}>
        <ActionButton
          label="Refresh snapshot"
          icon="arrow.clockwise"
          variant="primary"
          onPress={onRefresh}
        />
      </View>

      <View style={styles.connectionRow}>
        <Text style={styles.connectionLabel}>{health?.app_name ?? 'Prototype API'}</Text>
        <Text style={styles.connectionValue}>{state.apiBaseUrl}</Text>
      </View>
      <Text style={styles.connectionNote}>{getApiBaseUrlNote()}</Text>

      {state.status === 'loading' && !snapshot ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={shellPalette.accent} />
          <Text style={styles.loadingTitle}>Connecting to the prototype backend...</Text>
          <Text style={styles.loadingBody}>
            Waiting for `/api/dashboard/snapshot` and `/health`.
          </Text>
        </View>
      ) : null}

      {state.status === 'error' && !snapshot ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Prototype snapshot unavailable</Text>
          <Text style={styles.errorBody}>{formatLoadError(state.errorMessage)}</Text>
          {state.errorMessage ? (
            <Text style={styles.errorHint}>Technical detail: {state.errorMessage}</Text>
          ) : null}
          <Text style={styles.errorHint}>
            If you are using Expo Go on a phone, switch `EXPO_PUBLIC_API_BASE_URL` from localhost
            to the backend LAN address.
          </Text>
        </View>
      ) : null}

      {snapshot ? (
        <>
          <View style={styles.badgeRow}>
            <Pill
              label={formatSourceMode(snapshot.source_mode)}
              tone={getSourceModeTone(snapshot.source_mode)}
            />
            {showingCachedSnapshot ? (
              <Pill label="Cached snapshot" tone="warning" />
            ) : (
              <Pill label="Live fetch" tone="success" />
            )}
            {state.lastRefreshFailed ? <Pill label="Sync failed" tone="danger" /> : null}
            {state.isRefreshing ? <Pill label="Refreshing" tone="info" /> : null}
            {state.lastLoadedAt ? (
              <Pill
                label={`Loaded ${new Date(state.lastLoadedAt).toLocaleTimeString()}`}
                tone="soft"
              />
            ) : null}
          </View>

          {showingCachedSnapshot || state.lastRefreshFailed ? (
            <View style={styles.cacheCard}>
              <Text style={styles.cacheTitle}>
                {showingCachedSnapshot ? 'Showing the last saved snapshot' : 'Live refresh failed'}
              </Text>
              <Text style={styles.cacheBody}>
                {showingCachedSnapshot
                  ? 'This screen is currently reading the last valid snapshot stored on the device. No values were fabricated during this fallback.'
                  : 'The most recent network refresh did not complete, so the app is keeping the last successful snapshot visible.'}
              </Text>
              {state.errorMessage ? (
                <Text style={styles.cacheHint}>{formatLoadError(state.errorMessage)}</Text>
              ) : null}
              {state.cacheSavedAt ? (
                <Text style={styles.cacheHint}>
                  Cached at {new Date(state.cacheSavedAt).toLocaleString()}.
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.metricGrid}>
            <MetricCard
              label="Confidence"
              value={formatConfidence(snapshot.global_confidence)}
              detail="Confidence published in the latest stored backend snapshot."
            />
            <MetricCard
              label="Coverage"
              value={formatCoverage(snapshot.coverage)}
              detail="Coverage level declared by the backend for this reading."
            />
            <MetricCard
              label="Freshness"
              value={formatFreshness(snapshot.data_freshness.seconds_since_refresh)}
              detail={`Freshness status: ${snapshot.data_freshness.status}.`}
            />
            <MetricCard
              label="Leading basket"
              value={formatBucketLabel(snapshot.leading_bucket)}
              detail={`Snapshot timestamp: ${new Date(snapshot.as_of).toLocaleString()}.`}
            />
          </View>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>Headline</Text>
            <Text style={styles.blockValue}>{snapshot.headline}</Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>Commercial launch profile</Text>
            <Text style={styles.blockBody}>
              The paid iOS product is being redesigned around stored snapshots, public-data-first
              sourcing, and free versus premium depth. This development preview may still use
              prototype feeds that are not part of the launch positioning.
            </Text>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockLabel}>Top flows</Text>
            {snapshot.top_flows.length > 0 ? (
              snapshot.top_flows.slice(0, topFlowLimit).map((flow) => (
                <View key={flow.bucket_key} style={styles.listRow}>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{formatBucketLabel(flow.bucket_key)}</Text>
                    <Text style={styles.listBody}>
                      {flow.drivers.length > 0
                        ? flow.drivers.join(' | ')
                        : 'No driver labels published in this row.'}
                    </Text>
                  </View>
                  <View style={styles.listMeta}>
                    <Text style={styles.listValue}>{formatFlowScore(flow.score)}</Text>
                    <Text style={styles.listSubvalue}>{formatConfidence(flow.confidence)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.blockBody}>No top-flow rows were returned by the backend.</Text>
            )}
            {accessTier === 'free' && snapshot.top_flows.length > topFlowLimit ? (
              <View style={styles.upsellBlock}>
                <Text style={styles.blockBody}>
                  Free stays concise and shows the strongest published flow first. Premium unlocks
                  a wider flow list and the deeper basket drilldowns planned for phase 1.
                </Text>
                {onOpenPaywall ? (
                  <ActionButton
                    label="Unlock drilldowns"
                    icon="arrow.right"
                    variant="primary"
                    onPress={() => onOpenPaywall('deeper_drilldowns')}
                  />
                ) : null}
              </View>
            ) : null}
          </View>

          {snapshot.risks.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>Risks reported by the backend</Text>
              {visibleRisks.map((risk) => (
                <Text key={risk} style={styles.bulletRow}>
                  - {risk}
                </Text>
              ))}
              {!isPremium && snapshot.risks.length > visibleRisks.length ? (
                <Text style={styles.blockBody}>
                  Premium keeps the rest of the published risk list visible around the same
                  snapshot.
                </Text>
              ) : null}
            </View>
          ) : null}

          {snapshot.provider_issues.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.blockLabel}>
                {diagnosticsAccess === 'full' ? 'Prototype data diagnostics' : 'Provider diagnostics preview'}
              </Text>
              {visibleProviderIssues.map((issue) => (
                <View key={`${issue.provider_key}:${issue.message}`} style={styles.issueRow}>
                  <Text style={styles.issueSeverity}>{issue.severity.toUpperCase()}</Text>
                  <Text style={styles.issueMessage}>{issue.message}</Text>
                </View>
              ))}
              {diagnosticsAccess !== 'full' && snapshot.provider_issues.length > visibleProviderIssues.length ? (
                <View style={styles.upsellBlock}>
                  <Text style={styles.blockBody}>
                    Free shows only a preview of backend diagnostics. Premium unlocks the full
                    provider issue list and the deeper evidence layer around it.
                  </Text>
                  {onOpenPaywall ? (
                    <ActionButton
                      label="Unlock drilldowns"
                      icon="arrow.right"
                      onPress={() => onOpenPaywall('deeper_drilldowns')}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  connectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  connectionLabel: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  connectionValue: {
    flex: 1,
    textAlign: 'right',
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  connectionNote: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: shellPalette.border,
    backgroundColor: shellPalette.panelSoft,
    gap: 10,
    alignItems: 'flex-start',
  },
  loadingTitle: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  loadingBody: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
  },
  errorCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(240,140,140,0.25)',
    backgroundColor: 'rgba(240,140,140,0.08)',
    gap: 8,
  },
  errorTitle: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  errorBody: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  errorHint: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
  },
  cacheCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(246,195,106,0.24)',
    backgroundColor: 'rgba(246,195,106,0.08)',
    gap: 8,
  },
  cacheTitle: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  cacheBody: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  cacheHint: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  block: {
    gap: 10,
  },
  upsellBlock: {
    gap: 10,
    paddingTop: 6,
  },
  blockLabel: {
    color: shellPalette.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  blockValue: {
    color: shellPalette.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  blockBody: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 16,
    fontWeight: '800',
  },
  listSubvalue: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
  },
  bulletRow: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  issueRow: {
    gap: 4,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: shellPalette.border,
  },
  issueSeverity: {
    color: shellPalette.warning,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  issueMessage: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
  },
});
