import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineGame } from '@/hooks/useOnlineGame';

const mockFetch = (data: unknown, ok = true, status = 200) => {
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
};

describe('useOnlineGame', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(navigator, 'sendBeacon', { value: vi.fn().mockReturnValue(true), writable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts in select-mode phase', () => {
    const { result } = renderHook(() => useOnlineGame());
    expect(result.current.phase).toBe('select-mode');
    expect(result.current.error).toBeNull();
  });

  it('creates a room and enters lobby', async () => {
    mockFetch({ roomId: 'ABC123', playerId: 'p1', playerRole: 'X', nickname: 'player-p1' });
    const { result } = renderHook(() => useOnlineGame());
    await act(async () => result.current.createRoom());
    expect(result.current.phase).toBe('lobby');
    expect(result.current.roomId).toBe('ABC123');
  });

  it('joins a room and enters playing phase', async () => {
    mockFetch({ playerId: 'p2', playerRole: 'O', nickname: 'player-p2' });
    mockFetch({ board: Array(9).fill(null), currentPlayer: 'X', winner: null, yourRole: 'O', yourNickname: 'player-p2', opponentNickname: 'player-p1', opponentConnected: true, restartRequestedBy: null, roomStatus: 'playing' });
    const { result } = renderHook(() => useOnlineGame());
    await act(async () => result.current.joinRoom('ABC123'));
    expect(result.current.phase).toBe('playing');
    expect(result.current.yourRole).toBe('O');
  });

  it('handles join room error', async () => {
    mockFetch({ error: 'Room not found' }, false, 404);
    const { result } = renderHook(() => useOnlineGame());
    await act(async () => result.current.joinRoom('ZZZZZZ'));
    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBe('Room not found');
  });

  it('enters queue when no match found', async () => {
    mockFetch({ queueId: 'q1', matched: false, matchResult: null });
    const { result } = renderHook(() => useOnlineGame());
    await act(async () => result.current.enterQueue());
    expect(result.current.phase).toBe('in-queue');
  });

  it('enters matched phase when match found immediately', async () => {
    mockFetch({ queueId: 'q2', matched: true, matchResult: { roomId: 'R1', playerId: 'p1', playerRole: 'X' } });
    const { result } = renderHook(() => useOnlineGame());
    await act(async () => result.current.enterQueue());
    expect(result.current.phase).toBe('matched');
    expect(result.current.roomId).toBe('R1');
  });

  it('exits to select-mode', async () => {
    mockFetch({ roomId: 'ABC123', playerId: 'p1', playerRole: 'X', nickname: 'player-p1' });
    const { result } = renderHook(() => useOnlineGame());
    await act(async () => result.current.createRoom());
    act(() => result.current.exit());
    expect(result.current.phase).toBe('select-mode');
    expect(result.current.roomId).toBeNull();
  });
});
