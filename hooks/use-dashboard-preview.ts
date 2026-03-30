import { useCallback, useEffect, useState } from 'react';

import { getApiBaseUrl } from '@/lib/api-config';
import { fetchDashboardHealth, fetchDashboardSnapshot, type DashboardHealth, type DashboardSnapshot } from '@/lib/dashboard-api';
import { readDashboardPreviewCache, writeDashboardPreviewCache } from '@/lib/dashboard-cache';

type PreviewStatus = 'loading' | 'ready' | 'error';
type SnapshotOrigin = 'none' | 'live' | 'cached';

export type DashboardPreviewState = {
  status: PreviewStatus;
  snapshot: DashboardSnapshot | null;
  health: DashboardHealth | null;
  errorMessage: string | null;
  isRefreshing: boolean;
  lastLoadedAt: string | null;
  cacheSavedAt: string | null;
  snapshotOrigin: SnapshotOrigin;
  lastRefreshFailed: boolean;
  apiBaseUrl: string;
};

const INITIAL_STATE: Omit<DashboardPreviewState, 'apiBaseUrl'> = {
  status: 'loading',
  snapshot: null,
  health: null,
  errorMessage: null,
  isRefreshing: false,
  lastLoadedAt: null,
  cacheSavedAt: null,
  snapshotOrigin: 'none',
  lastRefreshFailed: false,
};

export function useDashboardPreview(): DashboardPreviewState & { refresh: () => void } {
  const apiBaseUrl = getApiBaseUrl();
  const [state, setState] = useState<DashboardPreviewState>({
    ...INITIAL_STATE,
    apiBaseUrl,
  });

  const loadPreview = useCallback(async (mode: 'initial' | 'manual') => {
    setState((previousState) => ({
      ...previousState,
      status: mode === 'initial' && !previousState.snapshot ? 'loading' : previousState.status,
      isRefreshing: mode === 'manual' || (mode === 'initial' && previousState.snapshot !== null),
      errorMessage: null,
      lastRefreshFailed: false,
      apiBaseUrl,
    }));

    const [snapshotResult, healthResult] = await Promise.allSettled([
      fetchDashboardSnapshot(apiBaseUrl),
      fetchDashboardHealth(apiBaseUrl),
    ]);

    if (snapshotResult.status === 'fulfilled') {
      const savedAt = new Date().toISOString();
      const health = healthResult.status === 'fulfilled' ? healthResult.value : null;

      void writeDashboardPreviewCache({
        apiBaseUrl,
        snapshot: snapshotResult.value,
        health,
        savedAt,
      });

      setState({
        status: 'ready',
        snapshot: snapshotResult.value,
        health,
        errorMessage: null,
        isRefreshing: false,
        lastLoadedAt: savedAt,
        cacheSavedAt: savedAt,
        snapshotOrigin: 'live',
        lastRefreshFailed: false,
        apiBaseUrl,
      });

      return;
    }

    const errorMessage = snapshotResult.reason instanceof Error ? snapshotResult.reason.message : 'unexpected_error';

    setState((previousState) => ({
      status: previousState.snapshot ? 'ready' : 'error',
      snapshot: previousState.snapshot,
      health: healthResult.status === 'fulfilled' ? healthResult.value : previousState.health,
      errorMessage,
      isRefreshing: false,
      lastLoadedAt: previousState.lastLoadedAt,
      cacheSavedAt: previousState.cacheSavedAt,
      snapshotOrigin: previousState.snapshotOrigin,
      lastRefreshFailed: true,
      apiBaseUrl,
    }));
  }, [apiBaseUrl]);

  const hydrateFromCacheAndLoad = useCallback(async () => {
    const cachedRecord = await readDashboardPreviewCache(apiBaseUrl);

    if (cachedRecord) {
      setState((previousState) => ({
        ...previousState,
        status: 'ready',
        snapshot: cachedRecord.snapshot,
        health: cachedRecord.health,
        errorMessage: null,
        isRefreshing: true,
        lastLoadedAt: cachedRecord.savedAt,
        cacheSavedAt: cachedRecord.savedAt,
        snapshotOrigin: 'cached',
        lastRefreshFailed: false,
        apiBaseUrl,
      }));
    }

    await loadPreview('initial');
  }, [apiBaseUrl, loadPreview]);

  useEffect(() => {
    void hydrateFromCacheAndLoad();
  }, [hydrateFromCacheAndLoad]);

  return {
    ...state,
    refresh: () => {
      void loadPreview('manual');
    },
  };
}
