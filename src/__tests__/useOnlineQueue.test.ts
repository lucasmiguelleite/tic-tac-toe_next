import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineQueue } from '@/hooks/useOnlineQueue';

const mockFetch = (data: unknown, ok = true, status = 200) => {
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
};

describe('useOnlineQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts with null queueId', () => {
    const { result } = renderHook(() => useOnlineQueue());
    expect(result.current.queueId).toBeNull();
  });

  it('enters queue without match and sets queueId', async () => {
    mockFetch({ queueId: 'q1', matched: false, matchResult: null });
    const onMatch = vi.fn();
    const onQueued = vi.fn();
    const { result } = renderHook(() => useOnlineQueue());
    await act(async () => {
      await result.current.enterQueue('Alice', onMatch, onQueued);
    });
    expect(result.current.queueId).toBe('q1');
    expect(onQueued).toHaveBeenCalledWith('q1');
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('enters queue with immediate match', async () => {
    mockFetch({
      queueId: 'q2', matched: true, matchResult: { roomId: 'R1', playerId: 'p1', playerRole: 'X' },
    });
    const onMatch = vi.fn();
    const onQueued = vi.fn();
    const { result } = renderHook(() => useOnlineQueue());
    await act(async () => {
      await result.current.enterQueue('Bob', onMatch, onQueued);
    });
    expect(onMatch).toHaveBeenCalledWith('R1', 'p1', 'X');
    expect(onQueued).not.toHaveBeenCalled();
  });

  it('polls and detects match', async () => {
    mockFetch({ matched: true, matchResult: { roomId: 'R1', playerId: 'p1', playerRole: 'X' } });
    const onMatch = vi.fn();
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useOnlineQueue());
    let cleanup: () => void = () => {};
    act(() => { cleanup = result.current.pollQueue('q1', onMatch, onTimeout); });
    await act(async () => { vi.advanceTimersByTimeAsync(2500); });
    expect(onMatch).toHaveBeenCalledWith('R1', 'p1', 'X');
    cleanup();
  });

  it('poll calls onTimeout on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, status: 404, json: () => Promise.resolve({}) } as Response);
    const onMatch = vi.fn();
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useOnlineQueue());
    let cleanup: () => void = () => {};
    act(() => { cleanup = result.current.pollQueue('q1', onMatch, onTimeout); });
    await act(async () => { vi.advanceTimersByTimeAsync(2500); });
    expect(onTimeout).toHaveBeenCalled();
    cleanup();
  });

  it('poll returns noop if id is null', () => {
    const { result } = renderHook(() => useOnlineQueue());
    const cleanup = result.current.pollQueue(null, vi.fn(), vi.fn());
    expect(typeof cleanup).toBe('function');
  });

  it('exits queue and resets queueId', async () => {
    mockFetch({ queueId: 'q1', matched: false, matchResult: null });
    mockFetch({ success: true });
    const { result } = renderHook(() => useOnlineQueue());
    await act(async () => {
      await result.current.enterQueue('Alice', vi.fn(), vi.fn());
    });
    expect(result.current.queueId).toBe('q1');
    await act(async () => result.current.exitQueue('q1'));
    expect(result.current.queueId).toBeNull();
  });

  it('exitQueue does nothing if id is null', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const { result } = renderHook(() => useOnlineQueue());
    await act(async () => result.current.exitQueue(null));
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
