import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { shellPalette } from '@/constants/shell';

type PillProps = {
  label: string;
  tone?: 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'soft';
};

const PILL_TONES = {
  accent: {
    backgroundColor: shellPalette.accentSoft,
    borderColor: 'rgba(62,157,120,0.18)',
    textColor: shellPalette.accentStrong,
  },
  info: {
    backgroundColor: 'rgba(90,136,229,0.12)',
    borderColor: 'rgba(90,136,229,0.18)',
    textColor: shellPalette.info,
  },
  success: {
    backgroundColor: 'rgba(52,165,111,0.12)',
    borderColor: 'rgba(52,165,111,0.18)',
    textColor: shellPalette.success,
  },
  warning: {
    backgroundColor: 'rgba(231,163,75,0.14)',
    borderColor: 'rgba(231,163,75,0.20)',
    textColor: shellPalette.warning,
  },
  danger: {
    backgroundColor: 'rgba(213,100,104,0.14)',
    borderColor: 'rgba(213,100,104,0.18)',
    textColor: shellPalette.danger,
  },
  soft: {
    backgroundColor: shellPalette.panelMuted,
    borderColor: shellPalette.border,
    textColor: shellPalette.textSoft,
  },
} as const;

export function Pill({ label, tone = 'soft' }: PillProps) {
  const toneStyle = PILL_TONES[tone];

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: toneStyle.backgroundColor,
          borderColor: toneStyle.borderColor,
        },
      ]}>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.76}
        style={[styles.pillText, { color: toneStyle.textColor }]}>
        {label}
      </Text>
    </View>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'surface' | 'accent' | 'contrast';
};

export function MetricCard({
  label,
  value,
  detail,
  tone = 'surface',
}: MetricCardProps) {
  const isContrast = tone === 'contrast';
  const isAccent = tone === 'accent';

  return (
    <View
      style={[
        styles.metricCard,
        tone === 'accent' && styles.metricCard_accent,
        tone === 'contrast' && styles.metricCard_contrast,
      ]}>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        style={[
          styles.metricLabel,
          (isAccent || isContrast) && styles.metricLabelStrong,
          isContrast && styles.metricLabelContrast,
        ]}>
        {label}
      </Text>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.62}
        style={[styles.metricValue, isContrast && styles.metricValueContrast]}>
        {value}
      </Text>
      <Text
        style={[
          styles.metricDetail,
          isAccent && styles.metricDetailAccent,
          isContrast && styles.metricDetailContrast,
        ]}>
        {detail}
      </Text>
    </View>
  );
}

type SectionCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  children?: ReactNode;
  variant?: 'surface' | 'accent' | 'contrast';
};

export function SectionCard({
  eyebrow,
  title,
  body,
  children,
  variant = 'surface',
}: SectionCardProps) {
  const isContrast = variant === 'contrast';
  const isAccent = variant === 'accent';

  return (
    <View
      style={[
        styles.sectionCard,
        variant === 'accent' && styles.sectionCard_accent,
        variant === 'contrast' && styles.sectionCard_contrast,
      ]}>
      <Text
        style={[
          styles.eyebrow,
          isAccent && styles.eyebrowAccent,
          isContrast && styles.eyebrowContrast,
        ]}>
        {eyebrow}
      </Text>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={[
          styles.sectionTitle,
          (isAccent || isContrast) && styles.sectionTitleContrast,
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionBody,
          isAccent && styles.sectionBodyAccent,
          isContrast && styles.sectionBodyContrast,
        ]}>
        {body}
      </Text>
      {children}
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  icon: 'arrow.right' | 'folder.fill' | 'arrow.clockwise';
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'purchase' | 'purchaseAlt';
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export function ActionButton({
  label,
  icon,
  onPress,
  variant = 'secondary',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  const isPurchase = variant === 'purchase';
  const isPurchaseAlt = variant === 'purchaseAlt';
  const usesContrastLabel = isPrimary || isPurchase || isPurchaseAlt;
  const iconColor = disabled
    ? usesContrastLabel
      ? shellPalette.contrastText
      : shellPalette.textMuted
    : usesContrastLabel
      ? shellPalette.contrastText
      : shellPalette.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.actionButton,
        isPrimary ? styles.actionPrimary : styles.actionSecondary,
        isPurchase && styles.actionPurchase,
        isPurchaseAlt && styles.actionPurchaseAlt,
        disabled && styles.actionDisabled,
        disabled && isPurchase && styles.actionDisabledPurchase,
        disabled && isPurchaseAlt && styles.actionDisabledPurchaseAlt,
        pressed && !disabled && styles.actionPressed,
      ]}>
      <IconSymbol
        name={icon}
        size={18}
        color={iconColor}
      />
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.76}
        style={[
          styles.actionLabel,
          usesContrastLabel && styles.actionLabelPrimary,
          disabled && styles.actionLabelDisabled,
          disabled && usesContrastLabel && styles.actionLabelDisabledContrast,
        ]}>
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
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.65,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  metricCard: {
    flex: 1,
    flexBasis: '45%',
    minWidth: 150,
    padding: 16,
    borderRadius: 18,
    backgroundColor: shellPalette.panelMuted,
    borderWidth: 1,
    borderColor: shellPalette.border,
    gap: 6,
  },
  metricCard_accent: {
    backgroundColor: shellPalette.accentSoft,
    borderColor: 'rgba(62,157,120,0.14)',
  },
  metricCard_contrast: {
    backgroundColor: shellPalette.contrastSoft,
    borderColor: 'rgba(245,248,251,0.08)',
  },
  metricLabel: {
    color: shellPalette.textMuted,
    fontSize: 11.5,
    textTransform: 'uppercase',
    letterSpacing: 0.85,
    fontWeight: '800',
  },
  metricLabelStrong: {
    color: shellPalette.textSoft,
  },
  metricLabelContrast: {
    color: 'rgba(245,248,251,0.72)',
  },
  metricValue: {
    color: shellPalette.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: 0,
    flexShrink: 1,
  },
  metricValueContrast: {
    color: shellPalette.contrastText,
  },
  metricDetail: {
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  metricDetailAccent: {
    color: shellPalette.accentStrong,
  },
  metricDetailContrast: {
    color: 'rgba(245,248,251,0.72)',
  },
  sectionCard: {
    borderRadius: 28,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 20,
    gap: 12,
    shadowColor: shellPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionCard_accent: {
    backgroundColor: shellPalette.accent,
    borderColor: 'rgba(45,126,97,0.18)',
  },
  sectionCard_contrast: {
    backgroundColor: shellPalette.contrast,
    borderColor: 'rgba(245,248,251,0.08)',
  },
  eyebrow: {
    color: shellPalette.accentStrong,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  eyebrowAccent: {
    color: 'rgba(245,248,251,0.82)',
  },
  eyebrowContrast: {
    color: 'rgba(245,248,251,0.68)',
  },
  sectionTitle: {
    color: shellPalette.text,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionTitleContrast: {
    color: shellPalette.contrastText,
  },
  sectionBody: {
    color: shellPalette.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionBodyAccent: {
    color: 'rgba(245,248,251,0.84)',
  },
  sectionBodyContrast: {
    color: 'rgba(245,248,251,0.78)',
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
    maxWidth: '100%',
  },
  actionPrimary: {
    backgroundColor: shellPalette.accent,
    borderColor: 'rgba(45,126,97,0.24)',
  },
  actionSecondary: {
    backgroundColor: shellPalette.panelMuted,
    borderColor: shellPalette.border,
  },
  actionPurchase: {
    backgroundColor: '#27B874',
    borderColor: '#209A62',
  },
  actionPurchaseAlt: {
    backgroundColor: '#4C78FF',
    borderColor: '#3D63D8',
  },
  actionPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  actionDisabled: {
    opacity: 0.52,
  },
  actionDisabledPurchase: {
    opacity: 1,
    backgroundColor: '#7FD5AF',
    borderColor: '#68BF9A',
  },
  actionDisabledPurchaseAlt: {
    opacity: 1,
    backgroundColor: '#8CA8FF',
    borderColor: '#758FD8',
  },
  actionLabel: {
    color: shellPalette.text,
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
  },
  actionLabelPrimary: {
    color: shellPalette.contrastText,
  },
  actionLabelDisabled: {
    color: shellPalette.textMuted,
  },
  actionLabelDisabledContrast: {
    color: shellPalette.contrastText,
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
    width: 64,
    borderRadius: 16,
    backgroundColor: shellPalette.panelMuted,
    borderWidth: 1,
    borderColor: shellPalette.border,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  phaseBadgeText: {
    color: shellPalette.accentStrong,
    fontSize: 11,
    fontWeight: '900',
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
    color: shellPalette.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingTop: 2,
  },
});
