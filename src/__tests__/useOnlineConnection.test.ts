import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineConnection } from '@/hooks/useOnlineConnection';

describe('useOnlineConnection', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(navigator, 'sendBeacon', { value: vi.fn().mockReturnValue(true), writable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns disconnect function', () => {
    const { result } = renderHook(() => useOnlineConnection('ABC123', 'p1'));
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('disconnect sends beacon with room and player data', () => {
    const { result } = renderHook(() => useOnlineConnection('ABC123', 'p1'));
    act(() => result.current.disconnect());
    expect(navigator.sendBeacon).toHaveBeenCalledWith(
      '/api/online/room/disconnect',
      JSON.stringify({ roomId: 'ABC123', playerId: 'p1' }),
    );
  });

  it('disconnect does nothing without roomId or playerId', () => {
    const { result } = renderHook(() => useOnlineConnection(null, null));
    act(() => result.current.disconnect());
    expect(navigator.sendBeacon).not.toHaveBeenCalled();
  });

  it('registers beforeunload listener when roomId and playerId are set', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useOnlineConnection('ABC123', 'p1'));
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('does not register listener without roomId or playerId', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useOnlineConnection(null, null));
    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});
