import { Platform } from 'react-native';

export type GoogleSocialAuthConfig = {
  iosClientId: string | null;
  webClientId: string | null;
  expoClientId: string | null;
};

export function getGoogleSocialAuthConfig(): GoogleSocialAuthConfig {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || null;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || null;
  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID?.trim() || null;

  return {
    iosClientId,
    webClientId,
    expoClientId,
  };
}

export function isGoogleSocialAuthConfigured(): boolean {
  const config = getGoogleSocialAuthConfig();
  return Boolean(config.iosClientId || config.webClientId || config.expoClientId);
}

export function isAppleSocialAuthVisible(): boolean {
  return Platform.OS === 'ios';
}
