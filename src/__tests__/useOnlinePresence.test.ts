import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

const response = (data: unknown) => ({
  ok: true,
  json: () => Promise.resolve(data),
}) as Response;

describe('useOnlinePresence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, 'fetch').mockResolvedValue(response({ count: 2 }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('registers the player and exposes the authoritative online count', async () => {
    const { result, unmount } = renderHook(() => useOnlinePresence());

    await act(async () => {});

    expect(result.current.onlinePlayers).toBe(2);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/online/presence',
      expect.objectContaining({ method: 'POST' }),
    );

    unmount();
    expect(global.fetch).toHaveBeenLastCalledWith(
      '/api/online/presence',
      expect.objectContaining({ method: 'DELETE', keepalive: true }),
    );
  });

  it('refreshes the displayed count', async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(response({ count: 1 }));
    fetchMock.mockResolvedValueOnce(response({ count: 3 }));

    const { result } = renderHook(() => useOnlinePresence());
    await act(async () => {});
    expect(result.current.onlinePlayers).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(result.current.onlinePlayers).toBe(3);
  });
});
