import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ActionButton, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/language';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string | string[] }>();
  const redirectParam = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;
  const auth = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const copy = language === 'es'
    ? {
        eyebrow: 'Cuenta nueva',
        title: 'Crear cuenta',
        body: 'La cuenta autentica el acceso premium en servidor, permite restaurar compras y queda pendiente de verificacion por email antes de iniciar sesion.',
        email: 'Email',
        password: 'Contrasena',
        confirmPassword: 'Confirmar contrasena',
        submit: 'Crear cuenta',
        back: 'Volver',
        helper: 'Tras registrarte, te llevaremos a verificar el email si hace falta.',
        signIn: 'Ya tengo cuenta',
        mismatch: 'Las contrasenas no coinciden',
        error: 'Error al crear la cuenta',
      }
    : {
        eyebrow: 'New account',
        title: 'Create account',
        body: 'The account authenticates premium access on the server, supports purchase restore, and stays pending until email verification is completed before sign-in.',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Create account',
        back: 'Back',
        helper: 'After signup, we will move you to email verification if needed.',
        signIn: 'I already have an account',
        mismatch: 'Passwords do not match',
        error: 'Could not create account',
      };

  const submit = async () => {
    if (password !== confirmPassword) {
      setLocalError(copy.mismatch);
      return;
    }

    setLocalError(null);
    const normalizedEmail = normalizeEmail(email);
    const result = await auth.register({
      email: normalizedEmail,
      password,
    });

    if (result.requiresVerification) {
      router.replace({
        pathname: '/auth/verify-email' as never,
        params: {
          email: result.pendingVerificationEmail ?? normalizedEmail,
          redirect: redirectParam ?? '/auth/login',
        },
      } as never);
      return;
    }

    router.replace((redirectParam ?? '/auth/login') as never);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <LanguageSwitcher />
      </View>

      <SectionCard eyebrow={copy.eyebrow} title={copy.title} body={copy.body} variant="contrast">
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
            autoComplete="new-password"
            secureTextEntry
            placeholder="********"
            placeholderTextColor={shellPalette.textMuted}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{copy.confirmPassword}</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="new-password"
            secureTextEntry
            placeholder="********"
            placeholderTextColor={shellPalette.textMuted}
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            label={copy.signIn}
            icon="arrow.right"
            variant="secondary"
            onPress={() => router.replace('/auth/login' as never)}
          />
          <ActionButton
            label={copy.back}
            icon="arrow.right"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>

        <Text style={styles.helperText}>{copy.helper}</Text>
      </SectionCard>

      {localError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{localError}</Text>
        </View>
      ) : null}

      {auth.lastError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{copy.error}: {auth.lastError}</Text>
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
    paddingBottom: 36,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
