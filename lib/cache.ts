// Simple in-memory cache implementation for Next.js

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get a value from cache, or set it if it doesn't exist
 * @param key Cache key
 * @param getValue Function that returns a Promise with the value to cache
 * @param ttl Time to live in milliseconds (default: 5 minutes)
 * @returns The cached or newly fetched value
 */
export async function getOrSet<T>(
  key: string,
  getValue: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  // Return cached value if it exists and hasn't expired
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // Otherwise, get the new value and cache it
  const value = await getValue();
  cache.set(key, {
    value,
    expiresAt: now + ttl,
  });

  return value;
}

/**
 * Clear the entire cache or a specific key
 * @param key Optional key to clear. If not provided, clears the entire cache.
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
