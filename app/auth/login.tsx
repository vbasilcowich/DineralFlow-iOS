import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { APP_DOCK_SCREEN_SPACER } from '@/components/floating-app-dock';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { ActionButton, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/language';
import { localizeErrorMessage } from '@/lib/localized-copy';
import { backOrReplace } from '@/lib/router-safe';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string | string[]; email?: string | string[] }>();
  const redirectParam = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;
  const emailParam = Array.isArray(params.email) ? params.email[0] : params.email;
  const auth = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState(emailParam ?? auth.userEmail ?? auth.pendingVerificationEmail ?? '');
  const [password, setPassword] = useState('');

  const copy = language === 'es'
    ? {
        eyebrow: 'Acceso',
        title: 'Entrar con correo y contrasena',
        body: 'Usa la misma cuenta para sincronizar acceso, restaurar compras y mantener el premium asociado al backend autenticado cuando este disponible.',
        email: 'Correo',
        password: 'Contrasena',
        submit: 'Entrar',
        back: 'Volver',
        helper: 'Si todavia no tienes cuenta, puedes crearla primero.',
        createAccount: 'Crear cuenta',
        error: 'Error de acceso',
        verifyHint: 'Si el backend pide verificacion, te llevaremos al siguiente paso.',
      }
    : {
        eyebrow: 'Sign in',
        title: 'Sign in with email and password',
        body: 'Use the same account to sync access, restore purchases, and keep premium tied to the authenticated backend when available.',
        email: 'Email',
        password: 'Password',
        submit: 'Sign in',
        back: 'Back',
        helper: 'If you do not have an account yet, create one first.',
        createAccount: 'Create account',
        error: 'Sign-in error',
        verifyHint: 'If the backend asks for verification, we will move you to the next step.',
      };

  const submit = async () => {
    const normalizedEmail = normalizeEmail(email);
    const result = await auth.login({
      email: normalizedEmail,
      password,
    });

    if (result.requiresVerification) {
      router.replace({
        pathname: '/auth/verify-email' as never,
        params: {
          email: result.pendingVerificationEmail ?? normalizedEmail,
          redirect: redirectParam ?? '/auth',
        },
      } as never);
      return;
    }

    if (redirectParam) {
      router.replace(redirectParam as never);
      return;
    }

    router.replace('/auth' as never);
  };

  const handleSocialAuthenticated = () => {
    if (redirectParam) {
      router.replace(redirectParam as never);
      return;
    }

    router.replace('/auth' as never);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <SectionCard eyebrow={copy.eyebrow} title={copy.title} body={copy.body} variant="contrast">
        <SocialAuthButtons mode="login" onAuthenticated={handleSocialAuthenticated} />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{copy.email}</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
            placeholder="name@example.com"
            placeholderTextColor={shellPalette.textMuted}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{copy.password}</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            secureTextEntry
            placeholder="********"
            placeholderTextColor={shellPalette.textMuted}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.buttonRow}>
          <ActionButton
            label={copy.submit}
            icon="arrow.right"
            variant="primary"
            onPress={() => void submit()}
          />
          <ActionButton
            label={copy.createAccount}
            icon="arrow.right"
            variant="secondary"
            onPress={() => router.replace('/auth/register' as never)}
          />
          <ActionButton
            label={copy.back}
            icon="arrow.right"
            variant="secondary"
            onPress={() => backOrReplace(router, '/auth')}
          />
        </View>

        <Text style={styles.helperText}>{copy.helper}</Text>
        <Text style={styles.helperText}>{copy.verifyHint}</Text>
      </SectionCard>

      {auth.lastError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{copy.error}: {localizeErrorMessage(auth.lastError, language)}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: shellPalette.bg,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: APP_DOCK_SCREEN_SPACER,
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: shellPalette.textSoft,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: shellPalette.border,
    backgroundColor: shellPalette.panelMuted,
    color: shellPalette.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  helperText: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
  },
  errorCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(213,100,104,0.28)',
    backgroundColor: 'rgba(213,100,104,0.12)',
    padding: 14,
  },
  errorText: {
    color: shellPalette.danger,
    fontSize: 13.5,
    lineHeight: 19,
  },
});
