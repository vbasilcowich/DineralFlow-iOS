import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  isBackendContractStale,
  type BackendEntitlementsResponse,
} from '@/lib/entitlements-contract';

const STORAGE_KEY = 'dineralflow:entitlements-contract:v2';

export type CachedBackendEntitlementsContract = {
  contract: BackendEntitlementsResponse;
  cached_at: string;
  freshness: 'fresh' | 'stale';
};

function buildCachedBackendEntitlementsContract(
  contract: BackendEntitlementsResponse,
  now = Date.now(),
): CachedBackendEntitlementsContract {
  return {
    contract,
    cached_at: new Date(now).toISOString(),
    freshness: isBackendContractStale(contract, now) ? 'stale' : 'fresh',
  };
}

export function isCachedBackendContractStale(
  cachedContract: CachedBackendEntitlementsContract,
  now = Date.now(),
): boolean {
  return buildCachedBackendEntitlementsContract(cachedContract.contract, now).freshness === 'stale';
}

export async function readEntitlementsContractCache(
  now = Date.now(),
): Promise<CachedBackendEntitlementsContract | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as CachedBackendEntitlementsContract;

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.contract ||
      typeof parsed.cached_at !== 'string'
    ) {
      return null;
    }

    return buildCachedBackendEntitlementsContract(parsed.contract, now);
  } catch {
    return null;
  }
}

export async function writeEntitlementsContractCache(
  contract: BackendEntitlementsResponse,
  now = Date.now(),
): Promise<CachedBackendEntitlementsContract> {
  const cachedContract = buildCachedBackendEntitlementsContract(contract, now);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedContract));
  return cachedContract;
}

export async function clearEntitlementsContractCache(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
