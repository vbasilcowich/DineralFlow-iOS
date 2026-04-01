import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DashboardHealth, DashboardSnapshot } from '@/lib/dashboard-api';

const DASHBOARD_PREVIEW_CACHE_KEY = 'dineralflow.dashboard.preview.v2';
const DASHBOARD_PREVIEW_CACHE_VERSION = 2;

export type DashboardPreviewCacheRecord = {
  version: number;
  savedAt: string;
  apiBaseUrl: string;
  viewerKey: string;
  snapshot: DashboardSnapshot;
  health: DashboardHealth | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDashboardPreviewCacheRecord(value: unknown): value is DashboardPreviewCacheRecord {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.version === 'number' &&
    typeof value.savedAt === 'string' &&
    typeof value.apiBaseUrl === 'string' &&
    typeof value.viewerKey === 'string' &&
    isObject(value.snapshot) &&
    (value.health === null || isObject(value.health))
  );
}

export function serializeDashboardPreviewCache(record: DashboardPreviewCacheRecord): string {
  return JSON.stringify(record);
}

export function parseDashboardPreviewCache(rawValue: string | null): DashboardPreviewCacheRecord | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isDashboardPreviewCacheRecord(parsedValue)) {
      return null;
    }

    if (parsedValue.version !== DASHBOARD_PREVIEW_CACHE_VERSION) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

export async function readDashboardPreviewCache(
  apiBaseUrl: string,
  viewerKey: string,
): Promise<DashboardPreviewCacheRecord | null> {
  const storedValue = await AsyncStorage.getItem(DASHBOARD_PREVIEW_CACHE_KEY);
  const parsedValue = parseDashboardPreviewCache(storedValue);

  if (!parsedValue) {
    return null;
  }

  if (parsedValue.apiBaseUrl !== apiBaseUrl || parsedValue.viewerKey !== viewerKey) {
    return null;
  }

  return parsedValue;
}

export async function writeDashboardPreviewCache(params: {
  apiBaseUrl: string;
  viewerKey: string;
  snapshot: DashboardSnapshot;
  health: DashboardHealth | null;
  savedAt: string;
}): Promise<void> {
  const record: DashboardPreviewCacheRecord = {
    version: DASHBOARD_PREVIEW_CACHE_VERSION,
    savedAt: params.savedAt,
    apiBaseUrl: params.apiBaseUrl,
    viewerKey: params.viewerKey,
    snapshot: params.snapshot,
    health: params.health,
  };

  await AsyncStorage.setItem(DASHBOARD_PREVIEW_CACHE_KEY, serializeDashboardPreviewCache(record));
}
