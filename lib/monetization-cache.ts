import AsyncStorage from '@react-native-async-storage/async-storage';

import type { EntitlementsSnapshot } from '@/lib/monetization';

const STORAGE_KEY = 'dineralflow:monetization:v1';

export async function readEntitlementsCache(): Promise<EntitlementsSnapshot | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as EntitlementsSnapshot;
  } catch {
    return null;
  }
}

export async function writeEntitlementsCache(snapshot: EntitlementsSnapshot): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export async function clearEntitlementsCache(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
