import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MetricCard, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useDashboardHistory, type HistoryWindow } from '@/hooks/use-dashboard-history';
import { useLanguage } from '@/lib/language';
import type { EntitlementFeature, EntitlementsSnapshot } from '@/lib/monetization';
import {
  formatBucketLabel,
  formatConfidence,
  formatHistorySummaryLocalized,
  formatLocalizedDate,
  formatLoadErrorLocalized,
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
  const { language } = useLanguage();
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
  const copy = language === 'es'
    ? {
        eyebrow: 'Evolucion reciente',
        title: 'Historico guardado con reglas de acceso claras',
        body: 'La app lee directamente el endpoint historico del backend. Gratis mantiene visible el arco reciente de 7 dias, mientras premium desbloquea ventanas mas largas sin prometer tiempo real.',
        premiumLabel: 'Premium',
        window: 'Ventana',
        premiumHistory: 'Historico premium',
        freeHistory: 'Historico gratis',
        refreshing: 'Actualizando',
        loading: 'Cargando la ventana historica real desde el backend...',
        points: 'Puntos',
        pointsDetail: 'Numero de snapshots del backend devueltos para esta ventana.',
        averageConfidence: 'Confianza media',
        confidenceDetail: 'Confianza media a lo largo de la ventana cargada.',
        latestLeader: 'Lider mas reciente',
        latestLeaderDetail: 'Cesta lider en el ultimo punto de esta ventana.',
        noHistory: 'El backend todavia no devolvio suficientes puntos historicos reales para esta ventana.',
        upsell: 'Premium desbloquea las ventanas de 30 y 90 dias mientras la capa gratis se mantiene anclada a 7 dias.',
      }
    : {
        eyebrow: 'Recent evolution',
        title: 'Stored history with clear access rules',
        body: 'The app reads the backend history endpoint directly. Free keeps the recent 7-day arc visible, while premium unlocks the longer windows without promising real-time data.',
        premiumLabel: 'Premium',
        window: 'Window',
        premiumHistory: 'Premium history',
        freeHistory: 'Free history',
        refreshing: 'Refreshing',
        loading: 'Loading the real history window from the backend...',
        points: 'Points',
        pointsDetail: 'Number of backend snapshots currently returned for this window.',
        averageConfidence: 'Average confidence',
        confidenceDetail: 'Average confidence across the loaded history window.',
        latestLeader: 'Latest leader',
        latestLeaderDetail: 'Leading basket in the latest point of this window.',
        noHistory: 'The backend did not return enough real history points for this window yet.',
        upsell: 'Premium unlocks the 30-day and 90-day windows while the free tier stays anchored to 7 days.',
      };

  return (
    <SectionCard
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}>
      <View style={styles.windowRow}>
        {HISTORY_WINDOWS.map((window) => {
          const locked = !allowedHistoryWindows.includes(window);
          const active = historyState.selectedWindow === window;

          return (
            <Pressable
              key={window}
              accessibilityRole="button"
              accessibilityLabel={language === 'es' ? `Ventana ${window}` : `${window} window`}
              accessibilityHint={
                locked
                  ? language === 'es'
                    ? 'Abre el paywall premium'
                    : 'Opens the premium paywall'
                  : language === 'es'
                    ? 'Carga esta ventana historica'
                    : 'Loads this history window'
              }
              accessibilityState={{ selected: active, disabled: locked }}
              onPress={() => {
                if (locked) {
                  onOpenPaywall('long_history');
                  return;
                }

                historyState.setWindow(window);
              }}
              testID={`history-window-${window}`}
              style={({ pressed }) => [
                styles.windowPill,
                active && styles.windowPillActive,
                locked && styles.windowPillLocked,
                pressed && styles.windowPillPressed,
              ]}>
              <Text style={[styles.windowLabel, active && styles.windowLabelActive]}>
                {window}
              </Text>
              {locked ? <Text style={styles.windowLock}>{copy.premiumLabel}</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.badgeRow}>
        <Pill label={`${copy.window}: ${historyState.selectedWindow}`} tone="soft" />
        <Pill label={isPremium ? copy.premiumHistory : copy.freeHistory} tone={isPremium ? 'success' : 'info'} />
        {historyState.isRefreshing ? <Pill label={copy.refreshing} tone="info" /> : null}
      </View>

      {historyState.status === 'loading' && !historyState.history ? (
        <Text style={styles.helperText}>{copy.loading}</Text>
      ) : null}

      {historyState.status === 'error' && !historyState.history ? (
        <Text style={styles.helperText}>
          {formatLoadErrorLocalized(historyState.errorMessage, language)}
        </Text>
      ) : null}

      {historyState.history ? (
        <>
          <View style={styles.metricGrid}>
            <MetricCard
              label={copy.points}
              value={String(historyState.history.points.length)}
              detail={copy.pointsDetail}
            />
            <MetricCard
              label={copy.averageConfidence}
              value={averageConfidence !== null ? formatConfidence(averageConfidence) : '-'}
              detail={copy.confidenceDetail}
            />
            <MetricCard
              label={copy.latestLeader}
              value={latestPoint ? formatBucketLabel(latestPoint.leading_bucket, language) : '-'}
              detail={copy.latestLeaderDetail}
            />
          </View>

          {historyState.history.points.length > 0 ? (
            <View style={styles.list}>
              {historyState.history.points.slice(-4).reverse().map((point) => (
                <View key={`${point.timestamp}:${point.leading_bucket}`} style={styles.listRow}>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>
                      {formatBucketLabel(point.leading_bucket, language)}
                    </Text>
                    <Text style={styles.listBody}>
                      {formatHistorySummaryLocalized(point, language)}
                    </Text>
                  </View>
                  <View style={styles.listMeta}>
                    <Text style={styles.listValue}>{formatConfidence(point.global_confidence)}</Text>
                    <Text style={styles.listDate}>
                      {formatLocalizedDate(point.timestamp, language)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.helperText}>{copy.noHistory}</Text>
          )}
        </>
      ) : null}

      {!isPremium ? (
        <Text style={styles.helperText}>{copy.upsell}</Text>
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: shellPalette.border,
    backgroundColor: shellPalette.panelMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  windowPillActive: {
    borderColor: 'rgba(62,157,120,0.22)',
    backgroundColor: shellPalette.accentSoft,
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
    color: shellPalette.accentStrong,
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
    fontSize: 15,
    fontWeight: '800',
  },
  listDate: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
