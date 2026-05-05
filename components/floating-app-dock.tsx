import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/language-switcher';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/language';

export const APP_DOCK_TAB_SPACER = 28;
export const APP_DOCK_SCREEN_SPACER = 28;

function isDockVisible(pathname: string) {
  return true;
}

export function FloatingAppDock() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();

  if (!isDockVisible(pathname)) {
    return null;
  }

  const onHome = pathname === '/' || pathname === '/index';
  const onPremium = pathname.startsWith('/paywall');
  const onAccount = pathname.startsWith('/auth');
  const bottomPadding = Math.max(insets.bottom, 8);

  const copy =
    language === 'es'
      ? {
          home: 'Inicio',
          account: auth.isAuthenticated ? 'Perfil' : 'Cuenta',
          premium: 'Premium',
          homeHint: 'Volver al inicio',
          accountHint: 'Abrir cuenta y sesion',
          premiumHint: 'Abrir premium y la pantalla de acceso',
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
    <View style={[styles.layer, styles.layerPointerEvents, { paddingBottom: bottomPadding }]}>
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
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
              style={[styles.itemLabel, onHome && styles.itemLabelActive]}>
              {copy.home}
            </Text>
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
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
              style={[styles.itemLabel, onAccount && styles.itemLabelActive]}>
              {copy.account}
            </Text>
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
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={styles.premiumLabel}>
              {copy.premium}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    backgroundColor: shellPalette.bg,
    paddingTop: 8,
  },
  layerPointerEvents: {
    pointerEvents: 'box-none',
  },
  wrap: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 14,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    backgroundColor: '#F8FAFC',
    shadowColor: 'rgba(27,39,61,0.18)',
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  itemButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: 6,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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
    width: 82,
    flexShrink: 0,
  },
  itemLabel: {
    color: shellPalette.text,
    width: '100%',
    fontSize: 11,
    lineHeight: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  itemLabelActive: {
    color: shellPalette.accentStrong,
  },
  premiumLabel: {
    color: shellPalette.contrastText,
    width: '100%',
    fontSize: 11,
    lineHeight: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  itemPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
