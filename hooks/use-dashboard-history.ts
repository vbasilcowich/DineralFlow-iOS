import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { getApiBaseUrl } from '@/lib/api-config';
import {
  fetchDashboardHistory,
  type DashboardHistoryResponse,
  type HistoryWindow,
} from '@/lib/dashboard-api';

type HistoryStatus = 'loading' | 'ready' | 'error';

export { type HistoryWindow } from '@/lib/dashboard-api';

export type DashboardHistoryState = {
  status: HistoryStatus;
  history: DashboardHistoryResponse | null;
  selectedWindow: HistoryWindow;
  errorMessage: string | null;
  isRefreshing: boolean;
  lastLoadedAt: string | null;
  apiBaseUrl: string;
  setWindow: (window: HistoryWindow) => void;
  refresh: () => void;
};

type InternalHistoryState = Omit<DashboardHistoryState, 'selectedWindow' | 'setWindow' | 'refresh'>;

const INITIAL_STATE: Omit<InternalHistoryState, 'apiBaseUrl'> = {
  status: 'loading',
  history: null,
  errorMessage: null,
  isRefreshing: false,
  lastLoadedAt: null,
};

export function useDashboardHistory(initialWindow: HistoryWindow): DashboardHistoryState {
  const auth = useAuth();
  const apiBaseUrl = getApiBaseUrl();
  const authToken = auth.providerMode === 'backend' ? auth.accessToken : null;
  const [selectedWindow, setSelectedWindow] = useState<HistoryWindow>(initialWindow);
  const [state, setState] = useState<InternalHistoryState>({
    ...INITIAL_STATE,
    apiBaseUrl,
  });

  useEffect(() => {
    setSelectedWindow(initialWindow);
  }, [initialWindow]);

  const loadHistory = useCallback(async (mode: 'initial' | 'manual') => {
    setState((previousState) => ({
      ...previousState,
      status:
        mode === 'initial' && !previousState.history ? 'loading' : previousState.status,
      isRefreshing: mode === 'manual' || previousState.history !== null,
      errorMessage: null,
      apiBaseUrl,
    }));

    try {
      const history = await fetchDashboardHistory(selectedWindow, apiBaseUrl, authToken);
      setState({
        status: 'ready',
        history,
        errorMessage: null,
        isRefreshing: false,
        lastLoadedAt: new Date().toISOString(),
        apiBaseUrl,
      });
    } catch (error) {
      setState((previousState) => ({
        ...previousState,
        status: previousState.history ? 'ready' : 'error',
        errorMessage: error instanceof Error ? error.message : 'unexpected_error',
        isRefreshing: false,
        apiBaseUrl,
      }));
    }
  }, [apiBaseUrl, authToken, selectedWindow]);

  useEffect(() => {
    void loadHistory('initial');
  }, [loadHistory]);

  return {
    ...state,
    selectedWindow,
    setWindow: (window) => {
      setSelectedWindow(window);
    },
    refresh: () => {
      void loadHistory('manual');
    },
  };
}
