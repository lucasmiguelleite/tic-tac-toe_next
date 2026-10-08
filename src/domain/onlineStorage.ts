import { Redis } from '@upstash/redis';

type MemoryEntry = {
  value: unknown;
  expiresAt: number | null;
};

const memoryStore = new Map<string, MemoryEntry>();

const redisRestUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const hasRedisEnv = Boolean(redisRestUrl && redisRestToken);
const redis = hasRedisEnv ? new Redis({ url: redisRestUrl, token: redisRestToken }) : null;
const memorySubscribers = new Map<string, Set<(message: string) => void>>();

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

/** Publishes a lightweight notification; game state remains in the room store. */
export const publish = async (channel: string, message: string): Promise<void> => {
  if (redis) {
    await redis.publish(channel, message);
    return;
  }

  memorySubscribers.get(channel)?.forEach((listener) => listener(message));
};

/**
 * Subscribes a server-side listener to an Upstash Redis Pub/Sub channel.
 * The REST subscription is an SSE stream, which is forwarded to WebSocket
 * clients by the route handler. The in-memory variant keeps local development
 * and tests functional without Redis credentials.
 */
export const subscribe = (channel: string, onMessage: (message: string) => void): (() => void) => {
  if (!redis || !redisRestUrl || !redisRestToken) {
    const listeners = memorySubscribers.get(channel) ?? new Set<(message: string) => void>();
    listeners.add(onMessage);
    memorySubscribers.set(channel, listeners);
    return () => {
      listeners.delete(onMessage);
      if (!listeners.size) memorySubscribers.delete(channel);
    };
  }

  const abortController = new AbortController();
  void (async () => {
    try {
      const response = await fetch(`${redisRestUrl}/subscribe/${encodeURIComponent(channel)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisRestToken}`,
          Accept: 'text/event-stream',
        },
        signal: abortController.signal,
      });
      if (!response.ok || !response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (!abortController.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const event of events) {
          const data = event.split('\n').find((line) => line.startsWith('data:'))?.slice(5).trim();
          if (!data?.startsWith('message,')) continue;
          const payloadStart = data.indexOf(',', 'message,'.length);
          if (payloadStart >= 0) onMessage(data.slice(payloadStart + 1));
        }
      }
    } catch {
      // The WebSocket client reconnects and re-synchronizes its room state.
    }
  })();

  return () => abortController.abort();
};
