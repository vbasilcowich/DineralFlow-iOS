import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shellPalette } from '@/constants/shell';
import { useLanguage, type AppLanguage } from '@/lib/language';

const OPTIONS: { key: AppLanguage; label: string; flag: string }[] = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'es', label: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const active = option.key === language;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            onPress={() => setLanguage(option.key)}
            style={({ pressed }) => [
              styles.option,
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
    gap: 8,
    borderRadius: 18,
    backgroundColor: shellPalette.panel,
    borderWidth: 1,
    borderColor: shellPalette.border,
    padding: 4,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 14,
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
