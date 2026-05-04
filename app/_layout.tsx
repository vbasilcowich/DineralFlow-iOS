import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { FloatingAppDock } from '@/components/floating-app-dock';
import { shellPalette } from '@/constants/shell';
import { AuthProvider } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LanguageProvider } from '@/lib/language';
import { MonetizationProvider } from '@/hooks/use-monetization';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
        <AuthProvider>
          <MonetizationProvider>
            <View style={styles.appShell}>
              <View style={styles.navigator}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen name="legal" options={{ headerShown: false }} />
                  <Stack.Screen name="confidence" options={{ headerShown: false }} />
                  <Stack.Screen name="paywall" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
              </View>
              <FloatingAppDock />
            </View>
            <StatusBar style="light" />
          </MonetizationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: shellPalette.bg,
  },
  navigator: {
    flex: 1,
  },
});
