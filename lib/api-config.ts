import { Platform } from 'react-native';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000';

export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }

  return DEFAULT_API_BASE_URL;
}

export function getApiBaseUrlNote(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL?.trim()) {
    return 'Using EXPO_PUBLIC_API_BASE_URL from the local environment.';
  }

  if (Platform.OS === 'web') {
    return 'Using the current browser hostname with port 8000 for web development on this PC.';
  }

  return 'Using localhost by default. For Expo Go on a phone, set EXPO_PUBLIC_API_BASE_URL to the backend LAN address.';
}
