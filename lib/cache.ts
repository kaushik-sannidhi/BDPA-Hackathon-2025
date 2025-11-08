// Simple in-memory TTL cache with in-flight de-duplication and size bound.
// Server-only usage.

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();
const pending = new Map<string, Promise<any>>();

const DEFAULT_TTL_SECONDS = Number(process.env.GEMINI_CACHE_TTL_SECONDS ?? 1800); // 30 min
const MAX_ENTRIES = Number(process.env.GEMINI_CACHE_MAX_ENTRIES ?? 200);
const DISABLED = (process.env.GEMINI_CACHE_DISABLED ?? "").toLowerCase() === "true" || process.env.GEMINI_CACHE_DISABLED === "1";

function evictIfNeeded() {
  while (cache.size > MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (!firstKey) break;
    cache.delete(firstKey);
  }
}

export async function getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<T> {
  if (!key) {
    // No key? Don't cache.
    return fetcher();
  }
  if (DISABLED) {
    return fetcher();
  }

  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    // Touch for simple LRU behavior
    cache.delete(key);
    cache.set(key, hit);
    return hit.value as T;
  }

  const inFlight = pending.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const p = (async () => {
    try {
      const value = await fetcher();
      cache.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
      evictIfNeeded();
      return value as T;
    } finally {
      pending.delete(key);
    }
  })();

  pending.set(key, p);
  return p;
}

export function clearCache() {
  cache.clear();
  pending.clear();
}
