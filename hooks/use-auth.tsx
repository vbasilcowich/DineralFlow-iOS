import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  clearStoredAuthSession,
  readPendingVerificationEmail,
  readStoredAuthSession,
  writePendingVerificationEmail,
  writeStoredAuthSession,
} from '@/lib/auth-storage';
import {
  createMockAuthSession,
  resolveAuthProviderMode,
  type AuthCredentials,
  type AuthProviderMode,
  type AuthSession,
  type AuthState,
  type AuthVerificationRequest,
} from '@/lib/auth';
import {
  fetchCurrentAccount,
  loginAccount,
  logoutAccount,
  registerAccount,
  verifyEmailAccount,
} from '@/lib/auth-api';

type AuthActionResult = {
  session: AuthSession | null;
  requiresVerification: boolean;
  pendingVerificationEmail: string | null;
  pendingVerificationToken: string | null;
  pendingVerificationUrl: string | null;
  verified: boolean;
};

type AuthContextValue = AuthState & {
  providerMode: AuthProviderMode;
  isAuthenticated: boolean;
  userEmail: string | null;
  accessToken: string | null;
  verificationRequired: boolean;
  clearError: () => void;
  login: (credentials: AuthCredentials) => Promise<AuthActionResult>;
  register: (credentials: AuthCredentials) => Promise<AuthActionResult>;
  verifyEmail: (request: AuthVerificationRequest) => Promise<AuthActionResult>;
  logout: () => Promise<AuthActionResult>;
  refreshSession: () => Promise<AuthActionResult>;
};

const INITIAL_STATE: AuthState = {
  status: 'loading',
  session: null,
  pendingVerificationEmail: null,
  pendingVerificationToken: null,
  pendingVerificationUrl: null,
  lastError: null,
  lastAction: null,
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistAuthState(
  session: AuthSession | null,
  pendingVerificationEmail: string | null,
) {
  if (session) {
    await writeStoredAuthSession(session);
  } else {
    await clearStoredAuthSession();
  }

  await writePendingVerificationEmail(pendingVerificationEmail);
}

function buildActionResult(
  session: AuthSession | null,
  options: {
    pendingVerificationEmail?: string | null;
    pendingVerificationToken?: string | null;
    pendingVerificationUrl?: string | null;
    verified?: boolean;
  } = {},
): AuthActionResult {
  const requiresVerification =
    Boolean(options.pendingVerificationEmail) ||
    Boolean(session && (!session.user.emailVerified || session.verificationStatus !== 'verified'));

  return {
    session,
    requiresVerification: requiresVerification,
    pendingVerificationEmail:
      options.pendingVerificationEmail ??
      (requiresVerification ? session?.user.email ?? null : null),
    pendingVerificationToken: options.pendingVerificationToken ?? null,
    pendingVerificationUrl: options.pendingVerificationUrl ?? null,
    verified: options.verified ?? Boolean(session?.user.emailVerified),
  };
}

function mergeSession(base: AuthSession, next: AuthSession): AuthSession {
  return {
    ...base,
    ...next,
    user: {
      ...base.user,
      ...next.user,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const providerMode = useMemo(resolveAuthProviderMode, []);
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const applySession = useCallback(async (
    nextSession: AuthSession | null,
    options: {
      pendingVerificationEmail?: string | null;
      pendingVerificationToken?: string | null;
      pendingVerificationUrl?: string | null;
      lastAction?: string | null;
      lastError?: string | null;
      status?: AuthState['status'];
      verified?: boolean;
    } = {},
  ): Promise<AuthActionResult> => {
    await persistAuthState(nextSession, options.pendingVerificationEmail ?? null);

    setState({
      status: options.status ?? (nextSession ? 'signed_in' : 'signed_out'),
      session: nextSession,
      pendingVerificationEmail: options.pendingVerificationEmail ?? null,
      pendingVerificationToken: options.pendingVerificationToken ?? null,
      pendingVerificationUrl: options.pendingVerificationUrl ?? null,
      lastError: options.lastError ?? null,
      lastAction: options.lastAction ?? null,
    });

    return buildActionResult(nextSession, options);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const [storedSession, pendingVerificationEmail] = await Promise.all([
        readStoredAuthSession(),
        readPendingVerificationEmail(),
      ]);

      if (!mounted) {
        return;
      }

      if (!storedSession) {
        setState({
          ...INITIAL_STATE,
          status: 'signed_out',
          pendingVerificationEmail,
        });
        return;
      }

      if (providerMode !== 'backend' || !storedSession.accessToken) {
        setState({
          status: 'signed_in',
          session: storedSession,
          pendingVerificationEmail,
          pendingVerificationToken: null,
          pendingVerificationUrl: null,
          lastError: null,
          lastAction: 'Session restored from device storage',
        });
        return;
      }

      try {
        const refreshed = await fetchCurrentAccount(storedSession.accessToken);
        const merged = mergeSession(storedSession, {
          provider: 'backend',
          accessToken: refreshed.token ?? storedSession.accessToken,
          refreshToken: refreshed.refreshToken,
          user: {
            id: refreshed.user.id,
            email: refreshed.user.email,
            emailVerified: refreshed.emailVerified,
            displayName: refreshed.user.displayName,
            createdAt: refreshed.user.createdAt,
            updatedAt: refreshed.user.updatedAt,
          },
          verificationStatus: refreshed.verificationStatus,
          updatedAt: new Date().toISOString(),
        });

        await applySession(merged, {
          pendingVerificationEmail,
          lastAction: 'Session refreshed from backend',
        });
      } catch {
        await applySession(null, {
          pendingVerificationEmail,
          lastAction: 'Stored session cleared after refresh failure',
          lastError: 'auth_refresh_failed',
        });
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [applySession, providerMode]);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setState((previous) => ({
      ...previous,
      status: 'loading',
      lastError: null,
      lastAction: 'Signing in',
    }));

    try {
      if (providerMode === 'backend') {
        const response = await loginAccount(credentials);
        const session: AuthSession = {
          provider: 'backend',
          accessToken: response.token,
          refreshToken: response.refreshToken,
          user: {
            id: response.user.id,
            email: response.user.email,
            emailVerified: response.emailVerified,
            displayName: response.user.displayName,
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          },
          verificationStatus: response.verificationStatus,
          updatedAt: new Date().toISOString(),
        };

        return await applySession(session, {
          pendingVerificationEmail: null,
          pendingVerificationToken: null,
          pendingVerificationUrl: null,
          lastAction: 'Signed in',
        });
      }

      const session = createMockAuthSession(credentials.email, true);
      return await applySession(session, {
        pendingVerificationEmail: null,
        lastAction: 'Signed in locally',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'auth_login_failed';
      const verificationRequired = message === 'Please verify your email before signing in.';

      setState((previous) => ({
        ...previous,
        status: 'signed_out',
        pendingVerificationEmail: verificationRequired ? credentials.email.trim().toLowerCase() : previous.pendingVerificationEmail,
        pendingVerificationToken: null,
        pendingVerificationUrl: null,
        lastError: message,
        lastAction: verificationRequired ? 'Verification required before sign in' : 'Login failed',
      }));

      return buildActionResult(null, {
        pendingVerificationEmail: verificationRequired ? credentials.email.trim().toLowerCase() : null,
      });
    }
  }, [applySession, providerMode]);

  const register = useCallback(async (credentials: AuthCredentials) => {
    setState((previous) => ({
      ...previous,
      status: 'loading',
      lastError: null,
      lastAction: 'Creating account',
    }));

    try {
      if (providerMode === 'backend') {
        const response = await registerAccount(credentials);

        return await applySession(null, {
          pendingVerificationEmail: response.user.email,
          pendingVerificationToken: response.developmentVerificationToken,
          pendingVerificationUrl: response.developmentVerificationUrl,
          lastAction: 'Account created. Verify email to continue.',
        });
      }

      const session = createMockAuthSession(credentials.email, false);
      return await applySession(session, {
        pendingVerificationEmail: session.user.email,
        lastAction: 'Mock account created',
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        status: 'signed_out',
        lastError: error instanceof Error ? error.message : 'auth_register_failed',
        lastAction: 'Registration failed',
      }));
      return buildActionResult(stateRef.current.session, {
        pendingVerificationEmail: stateRef.current.pendingVerificationEmail,
        pendingVerificationToken: stateRef.current.pendingVerificationToken,
        pendingVerificationUrl: stateRef.current.pendingVerificationUrl,
      });
    }
  }, [applySession, providerMode]);

  const verifyEmail = useCallback(async (request: AuthVerificationRequest) => {
    setState((previous) => ({
      ...previous,
      status: 'loading',
      lastError: null,
      lastAction: 'Verifying email',
    }));

    try {
      if (providerMode === 'backend') {
        const response = await verifyEmailAccount(request);

        return await applySession(null, {
          pendingVerificationEmail: null,
          pendingVerificationToken: null,
          pendingVerificationUrl: null,
          lastAction: 'Email verified. Sign in to continue.',
          verified: response.verified,
        });
      }

      const current = stateRef.current.session ?? createMockAuthSession('account@example.com', false);
      const session: AuthSession = {
        ...current,
        user: {
          ...current.user,
          emailVerified: true,
          updatedAt: new Date().toISOString(),
        },
        verificationStatus: 'verified',
        updatedAt: new Date().toISOString(),
      };

      return await applySession(session, {
        pendingVerificationEmail: null,
        pendingVerificationToken: null,
        pendingVerificationUrl: null,
        lastAction: 'Mock email verified',
        verified: true,
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        status: previous.session ? 'signed_in' : 'signed_out',
        lastError: error instanceof Error ? error.message : 'auth_verify_failed',
        lastAction: 'Email verification failed',
      }));
      return buildActionResult(stateRef.current.session, {
        pendingVerificationEmail: stateRef.current.pendingVerificationEmail,
        pendingVerificationToken: stateRef.current.pendingVerificationToken,
        pendingVerificationUrl: stateRef.current.pendingVerificationUrl,
      });
    }
  }, [applySession, providerMode]);

  const logout = useCallback(async () => {
    const currentSession = stateRef.current.session;

    setState((previous) => ({
      ...previous,
      status: 'loading',
      lastError: null,
      lastAction: 'Signing out',
    }));

    try {
      if (providerMode === 'backend' && currentSession?.accessToken) {
        await logoutAccount(currentSession.accessToken);
      }
    } finally {
      return await applySession(null, {
        pendingVerificationEmail: null,
        pendingVerificationToken: null,
        pendingVerificationUrl: null,
        lastAction: 'Signed out',
      });
    }
  }, [applySession, providerMode]);

  const refreshSession = useCallback(async () => {
    const currentSession = stateRef.current.session;

    if (providerMode !== 'backend' || !currentSession?.accessToken) {
      setState((previous) => ({
        ...previous,
        lastAction: 'Local session refreshed',
      }));
      return buildActionResult(currentSession, {
        pendingVerificationEmail: stateRef.current.pendingVerificationEmail,
        pendingVerificationToken: stateRef.current.pendingVerificationToken,
        pendingVerificationUrl: stateRef.current.pendingVerificationUrl,
      });
    }

    try {
      const refreshed = await fetchCurrentAccount(currentSession.accessToken);
      const merged: AuthSession = {
        ...currentSession,
        provider: 'backend',
        accessToken: refreshed.token ?? currentSession.accessToken,
        refreshToken: refreshed.refreshToken,
        user: {
          id: refreshed.user.id,
          email: refreshed.user.email,
          emailVerified: refreshed.emailVerified,
          displayName: refreshed.user.displayName,
          createdAt: refreshed.user.createdAt,
          updatedAt: refreshed.user.updatedAt,
        },
        verificationStatus: refreshed.verificationStatus,
        updatedAt: new Date().toISOString(),
      };

      return await applySession(merged, {
        pendingVerificationEmail: null,
        pendingVerificationToken: null,
        pendingVerificationUrl: null,
        lastAction: 'Session refreshed',
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        lastError: error instanceof Error ? error.message : 'auth_refresh_failed',
        lastAction: 'Session refresh failed',
      }));
      return buildActionResult(currentSession, {
        pendingVerificationEmail: stateRef.current.pendingVerificationEmail,
        pendingVerificationToken: stateRef.current.pendingVerificationToken,
        pendingVerificationUrl: stateRef.current.pendingVerificationUrl,
      });
    }
  }, [applySession, providerMode]);

  const value = useMemo<AuthContextValue>(() => {
    const session = state.session;
    const isBackendAuthenticated = Boolean(session?.accessToken);

    return {
      ...state,
      providerMode,
      isAuthenticated: providerMode === 'backend' ? isBackendAuthenticated : Boolean(session),
      userEmail: session?.user.email ?? state.pendingVerificationEmail ?? null,
      accessToken: providerMode === 'backend' ? session?.accessToken ?? null : null,
      verificationRequired: Boolean(
        state.pendingVerificationEmail ||
        (session && (!session.user.emailVerified || session.verificationStatus !== 'verified')),
      ),
      clearError: () => {
        setState((previous) => ({ ...previous, lastError: null }));
      },
      login,
      register,
      verifyEmail,
      logout,
      refreshSession,
    };
  }, [login, logout, providerMode, register, refreshSession, state, verifyEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
