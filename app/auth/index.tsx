import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ActionButton, Pill, SectionCard } from '@/components/shell';
import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/language';

export default function AuthHubScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { language } = useLanguage();

  const copy = useMemo(
    () =>
      language === 'es'
        ? {
            eyebrow: 'Cuenta',
            title: 'Accede para guardar tu progreso',
            body: 'La cuenta permite sincronizar el estado de acceso, reactivar compras y preparar el paso a funciones premium sin perder contexto entre dispositivos.',
            login: 'Entrar',
            register: 'Crear cuenta',
            verify: 'Verificar email',
            signedIn: 'Sesion activa',
            signedOut: 'Sin sesion activa',
            signedInBody: 'Ya hay una sesion guardada en este dispositivo. Puedes seguir, volver a verificar el correo o cerrar sesion.',
            signedOutBody: 'Crea una cuenta o entra con tu correo y contrasena para activar la capa autenticada.',
            pending: 'Verificacion pendiente',
            backendMode: 'Modo autenticado',
            mockMode: 'Modo demo local',
            logout: 'Cerrar sesion',
            backHome: 'Volver al resumen',
          }
        : {
            eyebrow: 'Account',
            title: 'Sign in to save your progress',
            body: 'An account lets the app sync access state, reactivate purchases, and prepare premium features without losing context between devices.',
            login: 'Sign in',
            register: 'Create account',
            verify: 'Verify email',
            signedIn: 'Session active',
            signedOut: 'No active session',
            signedInBody: 'A session is already stored on this device. You can continue, verify email again, or sign out.',
            signedOutBody: 'Create an account or sign in with your email and password to activate the authenticated layer.',
            pending: 'Verification pending',
            backendMode: 'Authenticated mode',
            mockMode: 'Local demo mode',
            logout: 'Sign out',
            backHome: 'Back to summary',
          },
    [language],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <LanguageSwitcher />
      </View>

      <SectionCard
        eyebrow={copy.eyebrow}
        title={copy.title}
        body={copy.body}
        variant="contrast">
        <View style={styles.badgeRow}>
          <Pill
            label={auth.providerMode === 'backend' ? copy.backendMode : copy.mockMode}
            tone={auth.providerMode === 'backend' ? 'success' : 'info'}
          />
          <Pill
            label={auth.status === 'signed_in' ? copy.signedIn : copy.signedOut}
            tone={auth.status === 'signed_in' ? 'success' : 'soft'}
          />
          {auth.verificationRequired ? <Pill label={copy.pending} tone="warning" /> : null}
        </View>

        <View style={styles.sessionCard}>
          <Text style={styles.sessionTitle}>
            {auth.isAuthenticated ? copy.signedIn : copy.signedOut}
          </Text>
          <Text style={styles.sessionBody}>
            {auth.isAuthenticated ? copy.signedInBody : copy.signedOutBody}
          </Text>
          {auth.userEmail ? <Text style={styles.sessionMeta}>{auth.userEmail}</Text> : null}
        </View>

        <View style={styles.buttonRow}>
          <ActionButton
            label={copy.login}
            icon="arrow.right"
            variant="primary"
            onPress={() => router.push('/auth/login' as never)}
          />
          <ActionButton
            label={copy.register}
            icon="arrow.right"
            variant="secondary"
            onPress={() => router.push('/auth/register' as never)}
          />
          {auth.verificationRequired ? (
            <ActionButton
              label={copy.verify}
              icon="arrow.right"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/auth/verify-email' as never,
                  params: {
                    email: auth.pendingVerificationEmail ?? auth.userEmail ?? '',
                    token: auth.pendingVerificationToken ?? '',
                    verificationUrl: auth.pendingVerificationUrl ?? '',
                  },
                } as never)
              }
            />
          ) : null}
        </View>
      </SectionCard>

      {auth.isAuthenticated ? (
        <SectionCard
          eyebrow={copy.eyebrow}
          title={copy.signedIn}
          body={copy.signedInBody}>
          <View style={styles.buttonRow}>
            <ActionButton
              label={copy.logout}
              icon="folder.fill"
              variant="secondary"
              onPress={() => void auth.logout()}
            />
            <ActionButton
              label={copy.backHome}
              icon="arrow.right"
              onPress={() => router.back()}
            />
          </View>
        </SectionCard>
      ) : null}

      {auth.lastError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{auth.lastError}</Text>
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sessionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: shellPalette.border,
    backgroundColor: shellPalette.panelMuted,
    padding: 16,
    gap: 8,
  },
  sessionTitle: {
    color: shellPalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sessionBody: {
    color: shellPalette.textSoft,
    fontSize: 13.5,
    lineHeight: 19,
  },
  sessionMeta: {
    color: shellPalette.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
