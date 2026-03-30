import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Pill } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
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
  const statusCopy = STATUS_COPY[status];

  return (
    <View style={styles.card}>
      <Pill label={statusCopy.label} tone={statusCopy.tone} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
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
    borderRadius: 20,
    backgroundColor: shellPalette.panelSoft,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 16,
    gap: 10,
  },
  title: {
    color: shellPalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  value: {
    color: shellPalette.accentSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  detail: {
    color: shellPalette.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
});
