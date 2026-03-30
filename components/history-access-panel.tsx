import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MetricCard, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useDashboardHistory, type HistoryWindow } from '@/hooks/use-dashboard-history';
import type { EntitlementFeature, EntitlementsSnapshot } from '@/lib/monetization';
import {
  formatBucketLabel,
  formatConfidence,
  formatHistorySummary,
  formatLoadError,
} from '@/lib/dashboard-presenter';

type HistoryAccessPanelProps = {
  entitlements: EntitlementsSnapshot;
  allowedHistoryWindows: HistoryWindow[];
  onOpenPaywall: (feature: EntitlementFeature) => void;
};

const HISTORY_WINDOWS: HistoryWindow[] = ['7d', '30d', '90d'];

export function HistoryAccessPanel({
  entitlements,
  allowedHistoryWindows,
  onOpenPaywall,
}: HistoryAccessPanelProps) {
  const isPremium = entitlements.tier === 'premium';
  const defaultWindow = allowedHistoryWindows.includes('30d') ? '30d' : '7d';
  const historyState = useDashboardHistory(defaultWindow);
  const averageConfidence =
    historyState.history && historyState.history.points.length > 0
      ? Math.round(
          historyState.history.points.reduce(
            (accumulator, point) => accumulator + point.global_confidence,
            0,
          ) / historyState.history.points.length,
        )
      : null;
  const latestPoint =
    historyState.history && historyState.history.points.length > 0
      ? historyState.history.points[historyState.history.points.length - 1]
      : null;

  return (
    <SectionCard
      eyebrow="History access"
      title="Real snapshot history, gated by window"
      body="The app should use the backend history endpoint directly. Free keeps the recent 7-day window. Premium unlocks longer ranges without pretending to be a live terminal.">
      <View style={styles.windowRow}>
        {HISTORY_WINDOWS.map((window) => {
          const locked = !allowedHistoryWindows.includes(window);
          const active = historyState.selectedWindow === window;

          return (
            <Pressable
              key={window}
              onPress={() => {
                if (locked) {
                  onOpenPaywall('long_history');
                  return;
                }

                historyState.setWindow(window);
              }}
              style={({ pressed }) => [
                styles.windowPill,
                active && styles.windowPillActive,
                locked && styles.windowPillLocked,
                pressed && styles.windowPillPressed,
              ]}>
              <Text style={[styles.windowLabel, active && styles.windowLabelActive]}>
                {window}
              </Text>
              {locked ? <Text style={styles.windowLock}>Premium</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.badgeRow}>
        <Pill label={`Window: ${historyState.selectedWindow}`} tone="soft" />
        <Pill label={isPremium ? 'Premium history' : 'Free history'} tone={isPremium ? 'success' : 'info'} />
        {historyState.isRefreshing ? <Pill label="Refreshing" tone="info" /> : null}
      </View>

      {historyState.status === 'loading' && !historyState.history ? (
        <Text style={styles.helperText}>Loading the real history window from the backend...</Text>
      ) : null}

      {historyState.status === 'error' && !historyState.history ? (
        <Text style={styles.helperText}>{formatLoadError(historyState.errorMessage)}</Text>
      ) : null}

      {historyState.history ? (
        <>
          <View style={styles.metricGrid}>
            <MetricCard
              label="Points"
              value={String(historyState.history.points.length)}
              detail="Number of backend snapshots currently returned for this window."
            />
            <MetricCard
              label="Average confidence"
              value={averageConfidence !== null ? formatConfidence(averageConfidence) : '-'}
              detail="Average confidence across the loaded history window."
            />
            <MetricCard
              label="Latest leader"
              value={latestPoint ? formatBucketLabel(latestPoint.leading_bucket) : '-'}
              detail="Leading basket in the latest point of this window."
            />
          </View>

          {historyState.history.points.length > 0 ? (
            <View style={styles.list}>
              {historyState.history.points.slice(-4).reverse().map((point) => (
                <View key={`${point.timestamp}:${point.leading_bucket}`} style={styles.listRow}>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{formatBucketLabel(point.leading_bucket)}</Text>
                    <Text style={styles.listBody}>{formatHistorySummary(point)}</Text>
                  </View>
                  <View style={styles.listMeta}>
                    <Text style={styles.listValue}>{formatConfidence(point.global_confidence)}</Text>
                    <Text style={styles.listDate}>
                      {new Date(point.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>
              The backend did not return enough real history points for this window yet.
            </Text>
          )}
        </>
      ) : null}

      {!isPremium ? (
        <Text style={styles.helperText}>
          Premium unlocks the 30-day and 90-day windows while the free tier stays anchored to 7 days.
        </Text>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  windowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  windowPill: {
    minWidth: 86,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: shellPalette.border,
    backgroundColor: shellPalette.panelSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  windowPillActive: {
    borderColor: 'rgba(212,175,55,0.42)',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  windowPillLocked: {
    opacity: 0.72,
  },
  windowPillPressed: {
    opacity: 0.88,
  },
  windowLabel: {
    color: shellPalette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  windowLabelActive: {
    color: shellPalette.accentSoft,
  },
  windowLock: {
    color: shellPalette.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  helperText: {
    color: shellPalette.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 2,
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
    fontSize: 15,
    fontWeight: '800',
  },
  listDate: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
