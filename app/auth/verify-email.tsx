import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { APP_DOCK_SCREEN_SPACER } from '@/components/floating-app-dock';
import { ActionButton, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/language';
import { localizeErrorMessage } from '@/lib/localized-copy';
import { backOrReplace } from '@/lib/router-safe';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email?: string | string[];
    redirect?: string | string[];
  }>();
  const emailParam = Array.isArray(params.email) ? params.email[0] : params.email;
  const redirectParam = Array.isArray(params.redirect) ? params.redirect[0] : params.redirect;
  const auth = useAuth();
  const { language } = useLanguage();
  const [email, setEmail] = useState(emailParam ?? auth.pendingVerificationEmail ?? auth.userEmail ?? '');
  const [token, setToken] = useState('');

  const copy = useMemo(
    () =>
      language === 'es'
        ? {
            eyebrow: 'Verificacion',
            title: 'Confirma tu correo',
            body: 'Introduce el codigo de verificacion emitido por el backend. En desarrollo puedes obtenerlo desde los detalles de verificacion devueltos por la API.',
            email: 'Correo',
            token: 'Codigo de verificacion',
            submit: 'Verificar',
            back: 'Volver',
            helper: 'Si no has recibido el codigo, vuelve a registro o inicio de sesion y revisa los detalles de verificacion devueltos por el backend.',
            done: 'Correo verificado',
            successBody: 'La cuenta ya puede pasar al inicio de sesion autenticado y usar la capa premium en servidor.',
            continueToLogin: 'Ir al inicio de sesion',
          }
        : {
            eyebrow: 'Verification',
            title: 'Confirm your email',
            body: 'Enter the verification token issued by the backend. In development you can use the verification details returned by the API.',
            email: 'Email',
            token: 'Verification token',
            submit: 'Verify',
            back: 'Back',
            helper: 'If you did not receive the token, reopen register or sign in and check the verification details returned by the backend.',
            done: 'Email verified',
            successBody: 'The account can now move into the authenticated sign-in flow and the premium layer.',
            continueToLogin: 'Go to sign in',
          },
    [language],
  );

  const submit = async () => {
    const result = await auth.verifyEmail({
      token: token.trim(),
    });

    if (result.session) {
      router.replace((redirectParam ?? '/auth') as never);
      return;
    }

    router.replace({
      pathname: '/auth/login' as never,
      params: {
        email: normalizeEmail(email),
        redirect: redirectParam ?? '/auth',
      },
    } as never);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
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
          <Text style={styles.label}>{copy.token}</Text>
          <TextInput
            autoCapitalize="characters"
            autoComplete="one-time-code"
            placeholder="paste-token-here"
            placeholderTextColor={shellPalette.textMuted}
            style={styles.input}
            value={token}
            onChangeText={setToken}
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
            label={copy.back}
            icon="arrow.right"
            variant="secondary"
            onPress={() => backOrReplace(router, '/auth')}
          />
        </View>

        <Text style={styles.helperText}>{copy.helper}</Text>
      </SectionCard>

      {auth.session?.user.emailVerified ? (
        <SectionCard eyebrow={copy.done} title={copy.done} body={copy.successBody}>
          <ActionButton
            label={copy.continueToLogin}
            icon="arrow.right"
            variant="primary"
            onPress={() =>
              router.replace({
                pathname: '/auth/login' as never,
                params: {
                  email: normalizeEmail(email),
                  redirect: redirectParam ?? '/auth',
                },
              } as never)
            }
          />
        </SectionCard>
      ) : null}

      {auth.lastError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{localizeErrorMessage(auth.lastError, language)}</Text>
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
