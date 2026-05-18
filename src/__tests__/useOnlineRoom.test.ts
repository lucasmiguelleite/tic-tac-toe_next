import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineRoom } from '@/hooks/useOnlineRoom';

const mockFetch = (data: unknown, ok = true, status = 200) => {
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
};

describe('useOnlineRoom', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useOnlineRoom(null, null));
    expect(result.current.squares).toEqual(Array(9).fill(null));
    expect(result.current.currentPlayer).toBe('X');
    expect(result.current.winner).toBeNull();
    expect(result.current.yourRole).toBeNull();
    expect(result.current.createdAt).toBeNull();
  });

  it('applies state from server response', () => {
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    act(() => {
      result.current.applyState({
        board: ['X', ...Array(8).fill(null)],
        currentPlayer: 'O',
        winner: null,
        opponentConnected: true,
        yourRole: 'X',
        yourNickname: 'Alice',
        opponentNickname: 'Bob',
        restartRequestedBy: null,
        createdAt: 1000,
      });
    });
    expect(result.current.squares[0]).toBe('X');
    expect(result.current.currentPlayer).toBe('O');
    expect(result.current.yourNickname).toBe('Alice');
    expect(result.current.opponentNickname).toBe('Bob');
    expect(result.current.createdAt).toBe(1000);
  });

  it('fetches state from API', async () => {
    mockFetch({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      opponentConnected: true,
      yourRole: 'X',
      yourNickname: 'Alice',
      opponentNickname: '',
    });
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    await act(async () => result.current.fetchState());
    expect(result.current.yourRole).toBe('X');
  });

  it('makeMove sends request and updates player', async () => {
    mockFetch({ currentPlayer: 'O', winner: null });
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    act(() => {
      result.current.setInitialRoomState('X', 'Alice');
    });
    await act(async () => result.current.makeMove(0));
    expect(result.current.currentPlayer).toBe('O');
    expect(result.current.squares[0]).toBe('X');
  });

  it('makeMove skips if not your turn', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    act(() => {
      result.current.setInitialRoomState('O', 'Bob');
    });
    await act(async () => result.current.makeMove(0));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('restart sets waitingForOpponent when first request', async () => {
    mockFetch({ waitingForOpponent: true });
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    act(() => result.current.setInitialRoomState('X', 'Alice'));
    const restarted = await act(async () => result.current.restart('X'));
    expect(restarted).toBe(false);
    expect(result.current.restartRequestedBy).toBe('X');
  });

  it('restart resets board when opponent agreed', async () => {
    mockFetch({ waitingForOpponent: false });
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    act(() => result.current.setInitialRoomState('X', 'Alice'));
    const restarted = await act(async () => result.current.restart('X'));
    expect(restarted).toBe(true);
    expect(result.current.squares).toEqual(Array(9).fill(null));
    expect(result.current.winner).toBeNull();
  });

  it('resetRoom clears all state', () => {
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    act(() => {
      result.current.applyState({
        board: ['X', ...Array(8).fill(null)],
        currentPlayer: 'O',
        winner: 'X',
        yourRole: 'X',
        yourNickname: 'Alice',
        opponentNickname: 'Bob',
        createdAt: 1000,
      });
    });
    act(() => result.current.resetRoom());
    expect(result.current.squares).toEqual(Array(9).fill(null));
    expect(result.current.yourRole).toBeNull();
    expect(result.current.createdAt).toBeNull();
    expect(result.current.opponentNickname).toBe('');
  });

  it('pollGameState calls onDisconnect when opponent disconnects', async () => {
    const onDisconnect = vi.fn();
    const onExpired = vi.fn();
    mockFetch({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      opponentConnected: false,
      roomStatus: 'playing',
    });
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    let cleanup: () => void = () => {};
    act(() => { cleanup = result.current.pollGameState(onDisconnect, onExpired); });
    await act(async () => { vi.advanceTimersByTimeAsync(100); });
    expect(onDisconnect).toHaveBeenCalled();
    cleanup();
  });

  it('pollGameState calls onExpired on 404', async () => {
    const onDisconnect = vi.fn();
    const onExpired = vi.fn();
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, status: 404, json: () => Promise.resolve({}) } as Response);
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    let cleanup: () => void = () => {};
    act(() => { cleanup = result.current.pollGameState(onDisconnect, onExpired); });
    await act(async () => { vi.advanceTimersByTimeAsync(100); });
    expect(onExpired).toHaveBeenCalled();
    cleanup();
  });

  it('pollGameState uses 1s polling when it is your turn', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        board: Array(9).fill(null),
        currentPlayer: 'X',
        winner: null,
        opponentConnected: true,
        roomStatus: 'playing',
        yourRole: 'X',
      }),
    } as Response);
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    let cleanup: () => void = () => {};
    act(() => { cleanup = result.current.pollGameState(vi.fn(), vi.fn()); });

    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('pollGameState backs off to 2s polling when waiting for opponent', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        board: Array(9).fill(null),
        currentPlayer: 'O',
        winner: null,
        opponentConnected: true,
        roomStatus: 'playing',
        yourRole: 'X',
      }),
    } as Response);
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    let cleanup: () => void = () => {};
    act(() => { cleanup = result.current.pollGameState(vi.fn(), vi.fn()); });

    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it('pollLobby calls onOpponentJoined when roomStatus is playing', async () => {
    const onJoined = vi.fn();
    mockFetch({ roomStatus: 'playing', yourNickname: 'Alice' });
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    let cleanup: () => void = () => {};
    act(() => { cleanup = result.current.pollLobby(onJoined); });
    await act(async () => { vi.advanceTimersByTimeAsync(2500); });
    expect(onJoined).toHaveBeenCalled();
    cleanup();
  });

  it('createdAt is not overwritten once set', () => {
    const { result } = renderHook(() => useOnlineRoom('ABC123', 'p1'));
    act(() => {
      result.current.applyState({ createdAt: 1000 });
    });
    act(() => {
      result.current.applyState({ createdAt: 2000 });
    });
    expect(result.current.createdAt).toBe(1000);
  });
});
