import { getApiBaseUrl } from '@/lib/api-config';

export type AuthProviderMode = 'mock' | 'backend';
export type AuthStatus = 'loading' | 'signed_out' | 'signed_in';
export type AuthVerificationStatus = 'verified' | 'pending' | 'unknown';

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  provider: AuthProviderMode;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser;
  verificationStatus: AuthVerificationStatus;
  updatedAt: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type SocialAuthProvider = 'google' | 'apple';

export type SocialAuthCredentials = {
  provider: SocialAuthProvider;
  idToken: string;
  email?: string | null;
  displayName?: string | null;
  authorizationCode?: string | null;
};

export type AuthVerificationRequest = {
  token: string;
};

export type AuthState = {
  status: AuthStatus;
  session: AuthSession | null;
  pendingVerificationEmail: string | null;
  pendingVerificationToken: string | null;
  pendingVerificationUrl: string | null;
  lastError: string | null;
  lastAction: string | null;
};

const AUTH_STORAGE_PREFIX = 'dineralflow:auth';

export function getAuthStorageKey(name: string): string {
  return `${AUTH_STORAGE_PREFIX}:${name}`;
}

export function getAuthApiBaseUrl(): string {
  return getApiBaseUrl();
}

export function resolveAuthProviderMode(): AuthProviderMode {
  return process.env.EXPO_PUBLIC_AUTH_PROVIDER === 'backend' ? 'backend' : 'mock';
}

function cleanEmail(value: string): string {
  return value.trim().toLowerCase();
}

function createUserId(email: string): string {
  return `user_${cleanEmail(email).replace(/[^a-z0-9]+/g, '_')}`;
}

export function createMockAuthSession(
  email: string,
  verified = true,
  now = new Date().toISOString(),
): AuthSession {
  return {
    provider: 'mock',
    accessToken: `mock_${createUserId(email)}_${Date.now()}`,
    refreshToken: null,
    user: {
      id: createUserId(email),
      email: cleanEmail(email),
      emailVerified: verified,
      displayName: cleanEmail(email).split('@')[0] ?? null,
      createdAt: now,
      updatedAt: now,
    },
    verificationStatus: verified ? 'verified' : 'pending',
    updatedAt: now,
  };
}
