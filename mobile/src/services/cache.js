import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = '@piu_cache:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export async function isOnline() {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable !== false;
}

export async function setCached(key, data) {
  try {
    const entry = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (_) {}
}

export async function getCached(key, ttl = DEFAULT_TTL) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > ttl) return null;
    return data;
  } catch (_) {
    return null;
  }
}

export async function clearCached(key) {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch (_) {}
}

export async function clearAllCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (_) {}
}

/**
 * Fetch with offline caching.
 * - Online: fetches fresh data, stores in cache, returns it.
 * - Offline: returns stale cache (any age) if available.
 * Returns { data, fromCache: boolean, offline: boolean }
 */
export async function getWithCache(key, fetcher, ttl = DEFAULT_TTL) {
  const online = await isOnline();

  if (online) {
    try {
      const result = await fetcher();
      const data = result?.data ?? result;
      await setCached(key, data);
      return { data, fromCache: false, offline: false };
    } catch (err) {
      const cached = await getCached(key, Infinity);
      if (cached !== null) return { data: cached, fromCache: true, offline: false };
      throw err;
    }
  } else {
    const cached = await getCached(key, Infinity);
    return { data: cached ?? [], fromCache: true, offline: true };
  }
}
