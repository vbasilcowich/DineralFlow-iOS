import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AppState, Pressable, Text, View, type AppStateStatus } from 'react-native';

import { MonetizationProvider, useMonetization } from '@/hooks/use-monetization';
import {
  clearEntitlementsContractCache,
  writeEntitlementsContractCache,
} from '@/lib/entitlements-contract-cache';
import type { BackendEntitlementsResponse } from '@/lib/entitlements-contract';
import type { HistoryWindow } from '@/lib/monetization';

const mockFetchMobileEntitlements = jest.fn();
const mockRefreshMobileEntitlements = jest.fn();
const appStateListeners: Array<(state: AppStateStatus) => void> = [];
const mockUseAuth = jest.fn();

jest.mock('@/lib/entitlements-api', () => {
  const actual = jest.requireActual('@/lib/entitlements-api');
  return {
    ...actual,
    fetchMobileEntitlements: (...args: unknown[]) => mockFetchMobileEntitlements(...args),
    refreshMobileEntitlements: (...args: unknown[]) => mockRefreshMobileEntitlements(...args),
  };
});

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

function createFreeBackendContract(
  overrides: Partial<BackendEntitlementsResponse> = {},
): BackendEntitlementsResponse {
  const nowIso = new Date(Date.now()).toISOString();

  return {
    schema_version: 'v1' as const,
    access_tier: 'free' as const,
    plan: null,
    source: 'fallback' as const,
    updated_at: nowIso,
    expires_at: null,
    server_time: nowIso,
    stale_after_seconds: 900,
    contract_version: 'contract.v1',
    paywall_revision: 'paywall.v1',
    sync_status: 'ok' as const,
    last_sync_at: nowIso,
    sync_reason: 'manual_retry',
    billing_provider: 'none' as const,
    features: {
      main_snapshot: true,
      selected_baskets: true,
      short_history: true,
      provenance: true,
      deeper_drilldowns: false,
      long_history: false,
      confidence_breakdown: false,
      watchlists: false,
      alerts: false,
      ad_free: false,
    },
    limits: {
      allowed_history_windows: ['7d'] as HistoryWindow[],
      max_top_flows: 1,
      diagnostics_access: 'preview' as const,
    },
    ads: {
      enabled: false,
      mode: 'none' as const,
    },
    ...overrides,
  };
}

function createPremiumBackendContract(
  overrides: Partial<BackendEntitlementsResponse> = {},
): BackendEntitlementsResponse {
  const base = createFreeBackendContract();

  return {
    ...base,
    access_tier: 'premium' as const,
    plan: 'annual' as const,
    source: 'backend' as const,
    features: {
      ...base.features,
      deeper_drilldowns: true,
      long_history: true,
      confidence_breakdown: true,
      ad_free: true,
    },
    limits: {
      allowed_history_windows: ['7d', '30d', '90d'] as HistoryWindow[],
      max_top_flows: 3,
      diagnostics_access: 'full' as const,
    },
    ...overrides,
  };
}

function MonetizationProbe() {
  const monetization = useMonetization();

  return (
    <View>
      <Text testID="tier">{monetization.accessTier}</Text>
      <Text testID="ready">{String(monetization.isReady)}</Text>
      <Text testID="processing">{String(monetization.isProcessing)}</Text>
      <Text testID="billing-provider">{monetization.billingProvider}</Text>
      <Text testID="billing-status">{monetization.billingStatus}</Text>
      <Text testID="can-start-purchase">{String(monetization.canStartPurchase)}</Text>
      <Text testID="source">{monetization.entitlements.source}</Text>
      <Text testID="sync-status">{monetization.entitlementsSyncStatus}</Text>
      <Text testID="sync-message">{monetization.entitlementsSyncMessage ?? ''}</Text>
      <Text testID="max-top-flows">{String(monetization.maxTopFlows)}</Text>
      <Text testID="feature-long-history">{String(monetization.hasFeature('long_history'))}</Text>
      <Pressable onPress={() => void monetization.syncEntitlements()}>
        <Text>sync-entitlements</Text>
      </Pressable>
      <Pressable onPress={() => void monetization.purchasePremium('monthly')}>
        <Text>activate-monthly</Text>
      </Pressable>
      <Pressable onPress={() => void monetization.restorePurchases()}>
        <Text>restore</Text>
      </Pressable>
      <Pressable onPress={() => void monetization.resetToFree()}>
        <Text>reset</Text>
      </Pressable>
    </View>
  );
}

describe('useMonetization provider', () => {
  beforeEach(() => {
    appStateListeners.length = 0;
    jest.restoreAllMocks();
    mockUseAuth.mockReturnValue({
      providerMode: 'mock',
      isAuthenticated: false,
      accessToken: null,
      verificationRequired: false,
      pendingVerificationEmail: null,
      pendingVerificationToken: null,
      pendingVerificationUrl: null,
      userEmail: null,
      status: 'signed_out',
      lastError: null,
      lastAction: null,
      clearError: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      verifyEmail: jest.fn(),
      logout: jest.fn(),
      refreshSession: jest.fn(),
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      appStateListeners.push(listener);
      return { remove: jest.fn() };
    });

    mockFetchMobileEntitlements.mockReset();
    mockRefreshMobileEntitlements.mockReset();
    mockFetchMobileEntitlements.mockResolvedValue(createFreeBackendContract());
    mockRefreshMobileEntitlements.mockResolvedValue(createFreeBackendContract());
  });

  afterEach(async () => {
    await AsyncStorage.clear();
    await clearEntitlementsContractCache();
  });

  it('hydrates to a ready free state by default', async () => {
    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    expect(screen.getByTestId('tier').props.children).toBe('free');
    expect(screen.getByTestId('billing-provider').props.children).toBe('mock');
    expect(screen.getByTestId('billing-status').props.children).toBe('mock');
    expect(screen.getByTestId('can-start-purchase').props.children).toBe('true');
    expect(screen.getByTestId('source').props.children).toBe('backend_sync');
    expect(screen.getByTestId('sync-status').props.children).toBe('ready');
    expect(screen.getByTestId('max-top-flows').props.children).toBe('1');
    expect(screen.getByTestId('feature-long-history').props.children).toBe('false');
    expect(mockFetchMobileEntitlements).toHaveBeenCalledTimes(1);
  });

  it('uses a fresh cached backend contract without fetching on startup', async () => {
    await writeEntitlementsContractCache(createPremiumBackendContract());

    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    expect(screen.getByTestId('tier').props.children).toBe('premium');
    expect(screen.getByTestId('source').props.children).toBe('backend_sync');
    expect(screen.getByTestId('sync-status').props.children).toBe('cached');
    expect(screen.getByTestId('max-top-flows').props.children).toBe('3');
    expect(mockFetchMobileEntitlements).not.toHaveBeenCalled();
  });

  it('switches to premium after a mock purchase and returns to free after reset', async () => {
    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('activate-monthly'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('premium');
    });
    expect(screen.getByTestId('feature-long-history').props.children).toBe('true');
    expect(mockRefreshMobileEntitlements).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByText('reset'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('free');
    });
    expect(screen.getByTestId('feature-long-history').props.children).toBe('false');
    expect(mockRefreshMobileEntitlements).toHaveBeenCalledTimes(2);
  });

  it('can restore a cached premium state after a mock purchase', async () => {
    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('activate-monthly'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('premium');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('restore'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('tier').props.children).toBe('premium');
    });
    expect(mockRefreshMobileEntitlements).toHaveBeenCalledTimes(2);
  });

  it('can manually refresh the entitlement contract from backend', async () => {
    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-status').props.children).toBe('ready');
    });

    await act(async () => {
      fireEvent.press(screen.getByText('sync-entitlements'));
    });

    await waitFor(() => {
      expect(mockRefreshMobileEntitlements).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('sync-status').props.children).toBe('ready');
    });
  });

  it('keeps the cached backend contract when a stale refresh fails', async () => {
    const staleServerContract = createPremiumBackendContract({
      server_time: '2026-03-30T08:00:00Z',
      last_sync_at: '2026-03-30T08:00:00Z',
      stale_after_seconds: 1,
    });

    await writeEntitlementsContractCache(staleServerContract, Date.parse('2026-03-30T08:05:01Z'));
    mockFetchMobileEntitlements.mockRejectedValueOnce(new Error('network_down'));

    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('sync-status').props.children).toBe('stale');
    });

    expect(screen.getByTestId('tier').props.children).toBe('premium');
    expect(screen.getByTestId('max-top-flows').props.children).toBe('3');
    expect(screen.getByTestId('sync-message').props.children).toContain('stale cached access rules');
    expect(mockFetchMobileEntitlements).toHaveBeenCalledTimes(1);
  });

  it('refreshes on foreground only when the backend contract is stale', async () => {
    const baseNow = Date.parse('2026-03-30T09:00:00Z');
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(baseNow);

    await writeEntitlementsContractCache(createFreeBackendContract({
      server_time: '2026-03-30T09:00:00Z',
      last_sync_at: '2026-03-30T09:00:00Z',
      stale_after_seconds: 900,
    }), baseNow);

    render(
      <MonetizationProvider>
        <MonetizationProbe />
      </MonetizationProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').props.children).toBe('true');
    });

    expect(mockFetchMobileEntitlements).not.toHaveBeenCalled();

    await act(async () => {
      appStateListeners.at(-1)?.('active');
    });

    expect(mockRefreshMobileEntitlements).not.toHaveBeenCalled();

    nowSpy.mockReturnValue(baseNow + 16 * 60 * 1000);

    await act(async () => {
      appStateListeners.at(-1)?.('active');
    });

    await waitFor(() => {
      expect(mockRefreshMobileEntitlements).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('sync-status').props.children).toBe('ready');
    });
  });
});
