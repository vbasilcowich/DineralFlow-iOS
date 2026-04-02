import { getAuthApiBaseUrl } from '@/lib/auth';

const REQUEST_TIMEOUT_MS = 3500;

type JsonRequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
};

export type BackendAuthUser = {
  user_id?: string | null;
  email?: string | null;
  email_verified?: boolean | null;
  email_verified_at?: string | null;
  created_at?: string | null;
};

export type BackendAuthRegisterResponse = {
  user?: BackendAuthUser | null;
  verification_required?: boolean | null;
  verification_delivery?: string | null;
  verification_expires_at?: string | null;
  development_verification_token?: string | null;
  development_verification_url?: string | null;
};

export type BackendAuthSessionResponse = {
  user?: BackendAuthUser | null;
  access_token?: string | null;
  token_type?: string | null;
  expires_at?: string | null;
};

export type BackendAuthVerifyResponse = {
  user?: BackendAuthUser | null;
  verified?: boolean | null;
};

export type BackendAuthMeResponse = {
  user?: BackendAuthUser | null;
};

export type AuthUserRecord = {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthSessionRecord = {
  token: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  emailVerified: boolean;
  verificationStatus: 'verified' | 'pending' | 'unknown';
  user: AuthUserRecord;
};

export type RegisterAccountResult = {
  user: AuthUserRecord;
  verificationRequired: boolean;
  verificationDelivery: string;
  verificationExpiresAt: string | null;
  developmentVerificationToken: string | null;
  developmentVerificationUrl: string | null;
};

export type VerifyEmailResult = {
  user: AuthUserRecord;
  verified: boolean;
};

export type SocialAuthProvider = 'google' | 'apple';

export type SocialLoginPayload = {
  idToken: string;
  email?: string | null;
  displayName?: string | null;
  authorizationCode?: string | null;
};

function cleanText(value: string | null | undefined, fallback = ''): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function createFallbackUser(email: string): AuthUserRecord {
  const lowerEmail = email.trim().toLowerCase() || 'account@example.com';
  const slug = lowerEmail.replace(/[^a-z0-9]+/g, '_');
  const now = new Date().toISOString();

  return {
    id: `user_${slug || 'local'}`,
    email: lowerEmail,
    emailVerified: false,
    emailVerifiedAt: null,
    displayName: lowerEmail.split('@')[0] ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeAuthUser(
  payload: BackendAuthUser | null | undefined,
  fallbackEmail = 'account@example.com',
): AuthUserRecord {
  const fallback = createFallbackUser(fallbackEmail);
  const email = cleanText(payload?.email, fallback.email);

  return {
    id: cleanText(payload?.user_id, fallback.id),
    email,
    emailVerified: Boolean(payload?.email_verified),
    emailVerifiedAt: payload?.email_verified_at ?? null,
    displayName: email.split('@')[0] ?? fallback.displayName,
    createdAt: cleanText(payload?.created_at, fallback.createdAt),
    updatedAt: cleanText(payload?.created_at, fallback.updatedAt),
  };
}

export function normalizeAuthSession(
  payload: BackendAuthSessionResponse | BackendAuthMeResponse,
  options: {
    fallbackEmail?: string;
    token?: string | null;
    expiresAt?: string | null;
  } = {},
): AuthSessionRecord {
  const user = normalizeAuthUser(payload.user, options.fallbackEmail);
  const token = cleanText(
    'access_token' in payload ? payload.access_token : options.token,
    options.token ?? '',
  ) || null;
  const expiresAt =
    ('expires_at' in payload ? cleanText(payload.expires_at, '') : cleanText(options.expiresAt, '')) || null;
  const emailVerified = user.emailVerified;

  return {
    token,
    refreshToken: null,
    expiresAt,
    emailVerified,
    verificationStatus: emailVerified ? 'verified' : 'pending',
    user,
  };
}

async function fetchJson<T>(
  path: string,
  options: JsonRequestOptions = {},
  apiBaseUrl = getAuthApiBaseUrl(),
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {};

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: 'no-store',
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = `http_${response.status}`;

      try {
        const errorPayload = (await response.json()) as { detail?: unknown; error?: { message?: unknown } };
        if (typeof errorPayload.detail === 'string' && errorPayload.detail.trim().length > 0) {
          errorMessage = errorPayload.detail.trim();
        } else if (
          typeof errorPayload.error?.message === 'string' &&
          errorPayload.error.message.trim().length > 0
        ) {
          errorMessage = errorPayload.error.message.trim();
        }
      } catch {
        // Keep HTTP fallback label when the response is empty or not JSON.
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function loginAccount(
  payload: { email: string; password: string },
  apiBaseUrl = getAuthApiBaseUrl(),
): Promise<AuthSessionRecord> {
  const response = await fetchJson<BackendAuthSessionResponse>(
    '/api/mobile/auth/login',
    {
      method: 'POST',
      body: payload,
    },
    apiBaseUrl,
  );

  return normalizeAuthSession(response, {
    fallbackEmail: payload.email,
  });
}

export async function registerAccount(
  payload: { email: string; password: string },
  apiBaseUrl = getAuthApiBaseUrl(),
): Promise<RegisterAccountResult> {
  const response = await fetchJson<BackendAuthRegisterResponse>(
    '/api/mobile/auth/register',
    {
      method: 'POST',
      body: payload,
    },
    apiBaseUrl,
  );

  return {
    user: normalizeAuthUser(response.user, payload.email),
    verificationRequired: response.verification_required !== false,
    verificationDelivery: cleanText(response.verification_delivery, 'outbox'),
    verificationExpiresAt: cleanText(response.verification_expires_at, '') || null,
    developmentVerificationToken: cleanText(response.development_verification_token, '') || null,
    developmentVerificationUrl: cleanText(response.development_verification_url, '') || null,
  };
}

export async function loginWithSocialAccount(
  provider: SocialAuthProvider,
  payload: SocialLoginPayload,
  apiBaseUrl = getAuthApiBaseUrl(),
): Promise<AuthSessionRecord> {
  const response = await fetchJson<BackendAuthSessionResponse>(
    `/api/mobile/auth/social/${provider}`,
    {
      method: 'POST',
      body: {
        id_token: payload.idToken,
        email: payload.email ?? null,
        display_name: payload.displayName ?? null,
        authorization_code: payload.authorizationCode ?? null,
      },
    },
    apiBaseUrl,
  );

  return normalizeAuthSession(response, {
    fallbackEmail: payload.email ?? `${provider}@example.com`,
  });
}

export async function verifyEmailAccount(
  payload: { token: string },
  apiBaseUrl = getAuthApiBaseUrl(),
): Promise<VerifyEmailResult> {
  const response = await fetchJson<BackendAuthVerifyResponse>(
    '/api/mobile/auth/verify-email',
    {
      method: 'POST',
      body: payload,
    },
    apiBaseUrl,
  );

  return {
    user: normalizeAuthUser(response.user),
    verified: response.verified !== false,
  };
}

export async function fetchCurrentAccount(
  token: string,
  apiBaseUrl = getAuthApiBaseUrl(),
): Promise<AuthSessionRecord> {
  const response = await fetchJson<BackendAuthMeResponse>(
    '/api/mobile/auth/me',
    {
      token,
    },
    apiBaseUrl,
  );

  return normalizeAuthSession(response, { token });
}

export async function logoutAccount(
  token: string | null,
  apiBaseUrl = getAuthApiBaseUrl(),
): Promise<void> {
  if (!token) {
    return;
  }

  try {
    await fetchJson<{ success: boolean }>(
      '/api/mobile/auth/logout',
      {
        method: 'POST',
        token,
      },
      apiBaseUrl,
    );
  } catch {
    return;
  }
}
