import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { shellPalette } from '@/constants/shell';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/lib/language';
import { getGoogleSocialAuthConfig, isAppleSocialAuthVisible } from '@/lib/social-auth-config';


WebBrowser.maybeCompleteAuthSession();

type SocialAuthButtonsProps = {
  mode: 'login' | 'register';
  onAuthenticated: () => void;
};

export function SocialAuthButtons({ mode, onAuthenticated }: SocialAuthButtonsProps) {
  const auth = useAuth();
  const { language } = useLanguage();
  const googleConfig = useMemo(getGoogleSocialAuthConfig, []);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isAppleBusy, setIsAppleBusy] = useState(false);

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: googleConfig.iosClientId ?? undefined,
    webClientId: googleConfig.webClientId ?? undefined,
    scopes: ['openid', 'email', 'profile'],
    responseType: 'id_token',
  });

  const copy = language === 'es'
    ? {
        divider: 'o continua con',
        google: mode === 'login' ? 'Continuar con Google' : 'Registrarme con Google',
        apple: mode === 'login' ? 'Continuar con Apple' : 'Registrarme con Apple',
        googleUnavailable: 'Google login necesita los client IDs del proyecto.',
        appleUnavailable: 'Apple login se activa en una build nativa de iPhone o iPad.',
        missingToken: 'La respuesta del proveedor no incluyo un token valido.',
      }
    : {
        divider: 'or continue with',
        google: mode === 'login' ? 'Continue with Google' : 'Sign up with Google',
        apple: mode === 'login' ? 'Continue with Apple' : 'Sign up with Apple',
        googleUnavailable: 'Google login needs the project client IDs first.',
        appleUnavailable: 'Apple login becomes available in a native iPhone or iPad build.',
        missingToken: 'The provider response did not include a valid token.',
      };

  useEffect(() => {
    let mounted = true;

    if (!isAppleSocialAuthVisible()) {
      setIsAppleAvailable(false);
      return;
    }

    void AppleAuthentication.isAvailableAsync()
      .then((available) => {
        if (mounted) {
          setIsAppleAvailable(available);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAppleAvailable(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const response = googleResponse as
      | {
          type?: string;
          params?: Record<string, string | undefined>;
          authentication?: { idToken?: string | null } | null;
        }
      | null
      | undefined;

    if (!response || response.type !== 'success') {
      return;
    }

    const idToken =
      response.params?.id_token ??
      response.authentication?.idToken ??
      null;

    if (!idToken) {
      setLocalError(copy.missingToken);
      return;
    }

    void auth.loginWithSocial({
      provider: 'google',
      idToken,
    }).then((result) => {
      if (result.session) {
        onAuthenticated();
      }
    });
  }, [auth, copy.missingToken, googleResponse, onAuthenticated]);

  const triggerGoogle = async () => {
    if (!googleConfig.iosClientId && !googleConfig.webClientId && !googleConfig.expoClientId) {
      setLocalError(copy.googleUnavailable);
      return;
    }

    setLocalError(null);
    await promptGoogleAsync();
  };

  const triggerApple = async () => {
    if (!isAppleAvailable) {
      setLocalError(copy.appleUnavailable);
      return;
    }

    setLocalError(null);
    setIsAppleBusy(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        setLocalError(copy.missingToken);
        return;
      }

      const displayName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const result = await auth.loginWithSocial({
        provider: 'apple',
        idToken: credential.identityToken,
        email: credential.email ?? null,
        displayName: displayName || null,
        authorizationCode: credential.authorizationCode ?? null,
      });

      if (result.session) {
        onAuthenticated();
      }
    } catch (error) {
      if (error instanceof Error) {
        setLocalError(error.message);
      } else {
        setLocalError(copy.appleUnavailable);
      }
    } finally {
      setIsAppleBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{copy.divider}</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonStack}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.google}
          accessibilityState={{ disabled: !googleRequest }}
          onPress={() => void triggerGoogle()}
          style={({ pressed }) => [
            styles.socialButton,
            pressed && styles.socialButtonPressed,
          ]}>
          <Text style={styles.socialButtonPrimary}>G</Text>
          <Text style={styles.socialButtonLabel}>{copy.google}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.apple}
          accessibilityState={{ disabled: !isAppleAvailable || isAppleBusy }}
          onPress={() => void triggerApple()}
          style={({ pressed }) => [
            styles.socialButton,
            (!isAppleAvailable || isAppleBusy) && styles.socialButtonDisabled,
            pressed && styles.socialButtonPressed,
          ]}>
          {isAppleBusy ? (
            <ActivityIndicator color={shellPalette.text} size="small" />
          ) : (
            <Text style={styles.socialButtonPrimary}></Text>
          )}
          <Text style={styles.socialButtonLabel}>{copy.apple}</Text>
        </Pressable>
      </View>

      {localError ? <Text style={styles.helperText}>{localError}</Text> : null}
      {auth.lastError ? <Text style={styles.helperText}>{auth.lastError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: shellPalette.border,
  },
  dividerText: {
    color: shellPalette.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  buttonStack: {
    gap: 10,
  },
  socialButton: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: shellPalette.border,
    backgroundColor: shellPalette.panel,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialButtonDisabled: {
    opacity: 0.58,
  },
  socialButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  socialButtonPrimary: {
    color: shellPalette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  socialButtonLabel: {
    color: shellPalette.text,
    fontSize: 14,
    fontWeight: '800',
  },
  helperText: {
    color: shellPalette.textSoft,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
