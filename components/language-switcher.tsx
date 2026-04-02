import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shellPalette } from '@/constants/shell';
import { useLanguage, type AppLanguage } from '@/lib/language';

const OPTIONS: { key: AppLanguage; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { key: 'es', label: 'Espa\u00f1ol', flag: '\u{1F1EA}\u{1F1F8}' },
];

export function LanguageSwitcher({
  stretch = false,
  variant = 'panel',
}: {
  stretch?: boolean;
  variant?: 'panel' | 'dock';
} = {}) {
  const { language, setLanguage } = useLanguage();
  const isDock = variant === 'dock';

  return (
    <View
      style={[
        styles.container,
        stretch && styles.containerStretch,
        isDock && styles.containerDock,
      ]}>
      {OPTIONS.map((option) => {
        const active = option.key === language;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            onPress={() => setLanguage(option.key)}
            testID={`language-${option.key}`}
            style={({ pressed }) => [
              styles.option,
              stretch && styles.optionStretch,
              isDock && styles.optionDock,
              active && styles.optionActive,
              pressed && styles.optionPressed,
            ]}>
            <Text style={[styles.flag, active && styles.flagActive]}>{option.flag}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 4,
  },
  containerStretch: {
    width: '100%',
  },
  containerDock: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    gap: 6,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 14,
  },
  optionStretch: {
    flex: 1,
    width: undefined,
  },
  optionDock: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(27,39,61,0.08)',
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  optionActive: {
    backgroundColor: shellPalette.accentSoft,
  },
  optionPressed: {
    opacity: 0.82,
  },
  flag: {
    fontSize: 20,
  },
  flagActive: {
    transform: [{ scale: 1.02 }],
  },
});
