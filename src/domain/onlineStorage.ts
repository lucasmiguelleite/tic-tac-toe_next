import { Redis } from '@upstash/redis';

type MemoryEntry = {
  value: unknown;
  expiresAt: number | null;
};

const memoryStore = new Map<string, MemoryEntry>();

const hasRedisEnv = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasRedisEnv ? Redis.fromEnv() : null;

const isExpired = (entry: MemoryEntry, now = Date.now()) => (
  entry.expiresAt !== null && entry.expiresAt <= now
);

const pruneExpiredMemory = () => {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (isExpired(entry, now)) memoryStore.delete(key);
  }
};

export const getValue = async <T>(key: string): Promise<T | null> => {
  if (redis) return redis.get<T>(key);

  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (isExpired(entry)) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value as T;
};

export const setValue = async <T>(key: string, value: T, ttlSeconds: number): Promise<void> => {
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
    return;
  }

  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const setIfNotExists = async <T>(key: string, value: T, ttlSeconds: number): Promise<boolean> => {
  if (redis) {
    const result = await redis.set(key, value, { ex: ttlSeconds, nx: true });
    return result === 'OK';
  }

  const existing = memoryStore.get(key);
  if (existing && !isExpired(existing)) return false;

  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return true;
};

export const deleteValue = async (key: string): Promise<boolean> => {
  if (redis) {
    const deleted = await redis.del(key);
    return deleted > 0;
  }

  return memoryStore.delete(key);
};

export const getKeys = async (pattern: string): Promise<string[]> => {
  if (redis) return redis.keys(pattern);

  pruneExpiredMemory();
  const prefix = pattern.endsWith('*') ? pattern.slice(0, -1) : pattern;
  return Array.from(memoryStore.keys()).filter((key) => key.startsWith(prefix));
};

export const clearKeys = async (pattern: string): Promise<void> => {
  const keys = await getKeys(pattern);
  if (!keys.length) return;

  if (redis) {
    await redis.del(...keys);
    return;
  }

  keys.forEach((key) => memoryStore.delete(key));
};
