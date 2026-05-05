import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Pill } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useLanguage } from '@/lib/language';
import type { FeatureGateState } from '@/lib/monetization';

type FeatureGateCardProps = {
  title: string;
  value: string;
  detail: string;
  status: FeatureGateState;
  actionLabel: string;
  onPress: () => void;
};

const STATUS_COPY: Record<
  FeatureGateState,
  { label: string; tone: 'info' | 'warning' | 'success' }
> = {
  preview: {
    label: 'Free preview',
    tone: 'info',
  },
  locked: {
    label: 'Premium only',
    tone: 'warning',
  },
  unlocked: {
    label: 'Premium active',
    tone: 'success',
  },
};

export function FeatureGateCard({
  title,
  value,
  detail,
  status,
  actionLabel,
  onPress,
}: FeatureGateCardProps) {
  const { language } = useLanguage();
  const statusCopy = STATUS_COPY[status];
  const localizedStatusLabel =
    language === 'es'
      ? ({
          'Free preview': 'Vista gratis',
          'Premium only': 'Solo premium',
          'Premium active': 'Premium activo',
        } as const)[statusCopy.label]
      : statusCopy.label;
  const statusStyle =
    status === 'unlocked'
      ? styles.card_unlocked
      : status === 'locked'
        ? styles.card_locked
        : styles.card_preview;

  return (
    <View style={[styles.card, statusStyle]}>
      <Pill label={localizedStatusLabel ?? statusCopy.label} tone={statusCopy.tone} />
      <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.78} style={styles.title}>
        {title}
      </Text>
      <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.76} style={styles.value}>
        {value}
      </Text>
      <Text style={styles.detail}>{detail}</Text>
      <ActionButton
        label={actionLabel}
        icon="arrow.right"
        variant={status === 'unlocked' ? 'secondary' : 'primary'}
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
    borderRadius: 22,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 16,
    gap: 10,
    shadowColor: shellPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  card_preview: {
    backgroundColor: shellPalette.panel,
  },
  card_locked: {
    backgroundColor: '#FFF8F5',
    borderColor: 'rgba(213,100,104,0.14)',
  },
  card_unlocked: {
    backgroundColor: '#F5FBF8',
    borderColor: 'rgba(62,157,120,0.16)',
  },
  title: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  value: {
    color: shellPalette.accentStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  detail: {
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
});
