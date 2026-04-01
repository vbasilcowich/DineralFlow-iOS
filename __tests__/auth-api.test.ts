import {
  fetchCurrentAccount,
  loginAccount,
  logoutAccount,
  normalizeAuthUser,
  normalizeAuthSession,
  registerAccount,
  verifyEmailAccount,
} from '@/lib/auth-api';

describe('auth api helpers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('normalizes backend auth payloads into a local session record', () => {
    const session = normalizeAuthSession({
      access_token: 'token-123',
      expires_at: '2026-03-31T08:00:00Z',
      user: {
        user_id: 'user-123',
        email: 'Person@example.com',
        email_verified: true,
        email_verified_at: '2026-03-30T08:05:00Z',
        created_at: '2026-03-30T08:00:00Z',
      },
    });

    expect(session.token).toBe('token-123');
    expect(session.expiresAt).toBe('2026-03-31T08:00:00Z');
    expect(session.user.email).toBe('Person@example.com');
    expect(session.emailVerified).toBe(true);
    expect(session.verificationStatus).toBe('verified');
  });

  it('normalizes backend auth users into the local user shape', () => {
    const user = normalizeAuthUser({
      user_id: 'user-123',
      email: 'Person@example.com',
      email_verified: false,
      created_at: '2026-03-30T08:00:00Z',
    });

    expect(user.id).toBe('user-123');
    expect(user.displayName).toBe('Person');
    expect(user.emailVerified).toBe(false);
  });

  it('normalizes incomplete payloads with safe fallbacks', () => {
    const session = normalizeAuthSession({});

    expect(session.user.email).toBe('account@example.com');
    expect(session.token).toBeNull();
    expect(session.refreshToken).toBeNull();
  });

  it('sends bearer tokens for current account fetches', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          user_id: 'user-1',
          email: 'test@example.com',
          email_verified: true,
          email_verified_at: '2026-03-30T08:05:00Z',
          created_at: '2026-03-30T08:00:00Z',
        },
      }),
    } as Response);

    await fetchCurrentAccount('access-token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/auth/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      }),
    );
  });

  it('uses the expected auth endpoints for login register verify and logout', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        user: {
          user_id: 'user-1',
          email: 'test@example.com',
          email_verified: false,
          created_at: '2026-03-30T08:00:00Z',
        },
        access_token: 'token-123',
        expires_at: '2026-03-31T08:00:00Z',
        verification_delivery: 'outbox',
        verification_required: true,
        verification_expires_at: '2026-03-31T08:00:00Z',
        development_verification_token: 'dev-token',
        verified: true,
      }),
    } as Response);

    await loginAccount({ email: 'test@example.com', password: 'secret' });
    const registerResult = await registerAccount({ email: 'test@example.com', password: 'secret' });
    await verifyEmailAccount({ token: 'dev-token' });
    await logoutAccount('access-token');

    expect(registerResult.developmentVerificationToken).toBe('dev-token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/auth/register'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/auth/verify-email'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      }),
    );
  });
});
