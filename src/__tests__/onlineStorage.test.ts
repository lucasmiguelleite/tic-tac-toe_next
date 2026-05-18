import { afterEach, describe, expect, it, vi } from 'vitest';

type EnvKeys =
  | 'UPSTASH_REDIS_REST_URL'
  | 'UPSTASH_REDIS_REST_TOKEN'
  | 'KV_REST_API_URL'
  | 'KV_REST_API_TOKEN';

const ENV_KEYS: EnvKeys[] = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
];

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  for (const key of ENV_KEYS) {
    if (ORIGINAL_ENV[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = ORIGINAL_ENV[key];
    }
  }
});

describe('onlineStorage env resolution', () => {
  it('uses UPSTASH_REDIS_REST_* variables when present', async () => {
    const setMock = vi.fn(async () => 'OK');
    const constructorMock = vi.fn();
    class RedisMock {
      constructor(options: unknown) {
        constructorMock(options);
      }

      get = vi.fn();
      set = setMock;
      del = vi.fn();
      keys = vi.fn();
    }
    vi.doMock('@upstash/redis', () => ({ Redis: RedisMock }));

    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'upstash-token';
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const storage = await import('@/domain/onlineStorage');
    await storage.setValue('k1', { test: true }, 60);

    expect(constructorMock).toHaveBeenCalledWith({
      url: 'https://upstash.example.com',
      token: 'upstash-token',
    });
    expect(setMock).toHaveBeenCalledWith('k1', { test: true }, { ex: 60 });
  });

  it('uses KV_REST_API_* variables when UPSTASH vars are absent', async () => {
    const setMock = vi.fn(async () => 'OK');
    const constructorMock = vi.fn();
    class RedisMock {
      constructor(options: unknown) {
        constructorMock(options);
      }

      get = vi.fn();
      set = setMock;
      del = vi.fn();
      keys = vi.fn();
    }
    vi.doMock('@upstash/redis', () => ({ Redis: RedisMock }));

    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.KV_REST_API_URL = 'https://kv.example.com';
    process.env.KV_REST_API_TOKEN = 'kv-token';

    const storage = await import('@/domain/onlineStorage');
    await storage.setValue('k2', 'value', 30);

    expect(constructorMock).toHaveBeenCalledWith({
      url: 'https://kv.example.com',
      token: 'kv-token',
    });
    expect(setMock).toHaveBeenCalledWith('k2', 'value', { ex: 30 });
  });

  it('falls back to in-memory store when no REST vars are configured', async () => {
    const constructorMock = vi.fn();
    class RedisMock {
      constructor(options: unknown) {
        constructorMock(options);
      }

      get = vi.fn();
      set = vi.fn();
      del = vi.fn();
      keys = vi.fn();
    }
    vi.doMock('@upstash/redis', () => ({ Redis: RedisMock }));

    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const storage = await import('@/domain/onlineStorage');
    await storage.setValue('k3', 'memory', 10);
    const value = await storage.getValue<string>('k3');

    expect(constructorMock).not.toHaveBeenCalled();
    expect(value).toBe('memory');
  });
});
