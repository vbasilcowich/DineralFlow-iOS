import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { shellPalette } from '@/constants/shell';

type PillProps = {
  label: string;
  tone?: 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'soft';
};

export function Pill({ label, tone = 'soft' }: PillProps) {
  const toneStyle = {
    accent: styles.pill_accent,
    info: styles.pill_info,
    success: styles.pill_success,
    warning: styles.pill_warning,
    danger: styles.pill_danger,
    soft: styles.pill_soft,
  }[tone];

  return (
    <View style={[styles.pill, toneStyle]}>
      <Text style={[styles.pillText, tone !== 'soft' && styles.pillTextStrong]}>{label}</Text>
    </View>
  );
}

type MetricProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

type SectionCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  children?: ReactNode;
};

export function SectionCard({ eyebrow, title, body, children }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      {children}
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  icon: 'arrow.right' | 'chart.bar.xaxis' | 'folder.fill' | 'arrow.clockwise';
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function ActionButton({ label, icon, onPress, variant = 'secondary' }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        variant === 'primary' ? styles.actionPrimary : styles.actionSecondary,
        pressed && styles.actionPressed,
      ]}>
      <IconSymbol
        name={icon}
        size={18}
        color={variant === 'primary' ? shellPalette.bg : shellPalette.text}
      />
      <Text style={[styles.actionLabel, variant === 'primary' && styles.actionLabelPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

type PhaseRowProps = {
  label: string;
  title: string;
  description: string;
  status: string;
};

export function PhaseRow({ label, title, description, status }: PhaseRowProps) {
  return (
    <View style={styles.phaseRow}>
      <View style={styles.phaseBadge}>
        <Text style={styles.phaseBadgeText}>{label}</Text>
      </View>
      <View style={styles.phaseContent}>
        <Text style={styles.phaseTitle}>{title}</Text>
        <Text style={styles.phaseDescription}>{description}</Text>
      </View>
      <Text style={styles.phaseStatus}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pill_soft: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: shellPalette.border,
  },
  pill_accent: {
    backgroundColor: 'rgba(212,175,55,0.14)',
    borderColor: 'rgba(212,175,55,0.28)',
  },
  pill_info: {
    backgroundColor: 'rgba(121,184,255,0.14)',
    borderColor: 'rgba(121,184,255,0.26)',
  },
  pill_success: {
    backgroundColor: 'rgba(124,214,166,0.14)',
    borderColor: 'rgba(124,214,166,0.26)',
  },
  pill_warning: {
    backgroundColor: 'rgba(246,195,106,0.14)',
    borderColor: 'rgba(246,195,106,0.26)',
  },
  pill_danger: {
    backgroundColor: 'rgba(240,140,140,0.14)',
    borderColor: 'rgba(240,140,140,0.26)',
  },
  pillText: {
    color: shellPalette.textSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pillTextStrong: {
    color: shellPalette.text,
  },
  metricCard: {
    flex: 1,
    minWidth: 130,
    padding: 16,
    borderRadius: 24,
    backgroundColor: shellPalette.panelSoft,
    borderWidth: 1,
    borderColor: shellPalette.border,
    gap: 6,
  },
  metricLabel: {
    color: shellPalette.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontWeight: '700',
  },
  metricValue: {
    color: shellPalette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  metricDetail: {
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    borderRadius: 28,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 20,
    gap: 12,
  },
  eyebrow: {
    color: shellPalette.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: shellPalette.text,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
  },
  sectionBody: {
    color: shellPalette.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  actionButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionPrimary: {
    backgroundColor: shellPalette.accent,
    borderColor: 'rgba(212,175,55,0.55)',
  },
  actionSecondary: {
    backgroundColor: shellPalette.panelSoft,
    borderColor: shellPalette.border,
  },
  actionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  actionLabel: {
    color: shellPalette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  actionLabelPrimary: {
    color: shellPalette.bg,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: shellPalette.border,
  },
  phaseBadge: {
    width: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: shellPalette.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  phaseBadgeText: {
    color: shellPalette.textSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  phaseContent: {
    flex: 1,
    gap: 4,
  },
  phaseTitle: {
    color: shellPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  phaseDescription: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
  },
  phaseStatus: {
    color: shellPalette.accentSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingTop: 2,
  },
});
