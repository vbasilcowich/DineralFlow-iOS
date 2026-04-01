import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAuthStorageKey, type AuthSession } from '@/lib/auth';

const SESSION_KEY = getAuthStorageKey('session');
const PENDING_EMAIL_KEY = getAuthStorageKey('pending-verification-email');

export async function readStoredAuthSession(): Promise<AuthSession | null> {
  const value = await AsyncStorage.getItem(SESSION_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    return null;
  }
}

export async function writeStoredAuthSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function readPendingVerificationEmail(): Promise<string | null> {
  return AsyncStorage.getItem(PENDING_EMAIL_KEY);
}

export async function writePendingVerificationEmail(email: string | null): Promise<void> {
  if (!email) {
    await AsyncStorage.removeItem(PENDING_EMAIL_KEY);
    return;
  }

  await AsyncStorage.setItem(PENDING_EMAIL_KEY, email);
}

export async function clearPendingVerificationEmail(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_EMAIL_KEY);
}

