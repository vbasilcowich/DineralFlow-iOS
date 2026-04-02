import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { LanguageSwitcher } from '@/components/language-switcher';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/language';

export const APP_DOCK_TAB_SPACER = 220;
export const APP_DOCK_SCREEN_SPACER = 150;

function isDockVisible(pathname: string) {
  return true;
}

export function FloatingAppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { language } = useLanguage();

  if (!isDockVisible(pathname)) {
    return null;
  }

  const onHome = pathname === '/' || pathname === '/index';
  const onPremium = pathname.startsWith('/paywall');
  const onAccount = pathname.startsWith('/auth');
  const bottomOffset = onHome ? 96 : 24;

  const copy =
    language === 'es'
      ? {
          home: 'Inicio',
          account: auth.isAuthenticated ? 'Perfil' : 'Cuenta',
          premium: 'Premium',
          homeHint: 'Volver al inicio',
          accountHint: 'Abrir cuenta y sesion',
          premiumHint: 'Abrir premium y el paywall',
        }
      : {
          home: 'Home',
          account: auth.isAuthenticated ? 'Profile' : 'Account',
          premium: 'Premium',
          homeHint: 'Return to the home screen',
          accountHint: 'Open account and sign-in area',
          premiumHint: 'Open premium and the paywall',
        };

  return (
    <View style={[styles.layer, styles.layerPointerEvents, { bottom: bottomOffset }]}>
      <View style={styles.wrap}>
        <View style={styles.bar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.home}
            accessibilityHint={copy.homeHint}
            onPress={() => router.push('/' as never)}
            testID="dock-home-button"
            style={({ pressed }) => [
              styles.itemButton,
              styles.lightButton,
              onHome && styles.activeLightButton,
              pressed && styles.itemPressed,
            ]}>
            <IconSymbol
              name="house.fill"
              size={18}
              color={onHome ? shellPalette.accentStrong : shellPalette.text}
            />
            <Text style={[styles.itemLabel, onHome && styles.itemLabelActive]}>{copy.home}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.account}
            accessibilityHint={copy.accountHint}
            onPress={() => router.push('/auth' as never)}
            testID="dock-account-button"
            style={({ pressed }) => [
              styles.itemButton,
              styles.lightButton,
              onAccount && styles.activeLightButton,
              pressed && styles.itemPressed,
            ]}>
            <IconSymbol
              name="person.fill"
              size={18}
              color={onAccount ? shellPalette.accentStrong : shellPalette.text}
            />
            <Text style={[styles.itemLabel, onAccount && styles.itemLabelActive]}>{copy.account}</Text>
          </Pressable>

          <View style={styles.languageSlot}>
            <LanguageSwitcher stretch variant="dock" />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.premium}
            accessibilityHint={copy.premiumHint}
            onPress={() => router.push('/paywall' as never)}
            testID="dock-premium-button"
            style={({ pressed }) => [
              styles.itemButton,
              styles.premiumButton,
              onPremium && styles.activePremiumButton,
              pressed && styles.itemPressed,
            ]}>
            <IconSymbol name="crown.fill" size={18} color={shellPalette.contrastText} />
            <Text style={styles.premiumLabel}>{copy.premium}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  layerPointerEvents: {
    pointerEvents: 'box-none',
  },
  wrap: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    backgroundColor: 'rgba(248,250,252,0.76)',
    shadowColor: 'rgba(27,39,61,0.18)',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  itemButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  lightButton: {
    backgroundColor: shellPalette.panel,
    borderColor: shellPalette.border,
  },
  activeLightButton: {
    backgroundColor: shellPalette.accentSoft,
    borderColor: 'rgba(62,157,120,0.20)',
  },
  premiumButton: {
    backgroundColor: shellPalette.contrast,
    borderColor: 'rgba(245,248,251,0.12)',
  },
  activePremiumButton: {
    backgroundColor: '#24344A',
  },
  languageSlot: {
    flex: 1,
  },
  itemLabel: {
    color: shellPalette.text,
    fontSize: 13.5,
    fontWeight: '800',
  },
  itemLabelActive: {
    color: shellPalette.accentStrong,
  },
  premiumLabel: {
    color: shellPalette.contrastText,
    fontSize: 13.5,
    fontWeight: '800',
  },
  itemPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
