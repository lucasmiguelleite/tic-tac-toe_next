import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Room } from '@/domain/types';

vi.mock('@/domain/onlineStore', () => ({
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
  getRoom: vi.fn(),
  updateRoom: vi.fn(),
  disconnectPlayer: vi.fn(),
}));

vi.mock('@/domain/onlineStorage', () => ({
  setValue: vi.fn(),
}));

vi.mock('@/domain/roomStore', () => ({
  ROOM_TTL_SECONDS: 1800,
  roomKey: (id: string) => `tic-tac-toe:room:${id}`,
}));

vi.mock('@/domain/gameEngine', () => ({
  makeMove: vi.fn(),
  calculateWinner: vi.fn(),
  checkDraw: vi.fn(),
}));

import { POST as createRoom } from '@/app/api/online/room/create/route';
import { POST as joinRoom } from '@/app/api/online/room/join/route';
import { GET as getState } from '@/app/api/online/room/state/route';
import { POST as move } from '@/app/api/online/room/move/route';
import { POST as restart } from '@/app/api/online/room/restart/route';
import { POST as disconnect } from '@/app/api/online/room/disconnect/route';
import * as store from '@/domain/onlineStore';
import * as engine from '@/domain/gameEngine';

const makeRoom = (overrides: Partial<Room> = {}): Room => ({
  roomId: 'ABC123',
  status: 'playing',
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  playerX: 'p1',
  playerO: 'p2',
  nicknameX: 'Alice',
  nicknameO: 'Bob',
  lastSeenX: Date.now(),
  lastSeenO: Date.now(),
  restartRequestedBy: null,
  disconnected: null,
  createdAt: Date.now(),
  ...overrides,
});

const json = async (res: Response) => res.json();

describe('POST /api/online/room/create', () => {
  it('returns 201 with room data', async () => {
    vi.mocked(store.createRoom).mockReturnValue({
      roomId: 'ABC123', playerId: 'p1', playerRole: 'X', nickname: 'Alice',
    });
    const req = new Request('http://localhost/api/online/room/create', {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Alice' }),
    });
    const res = await createRoom(req);
    expect(res.status).toBe(201);
    expect(await json(res)).toEqual({
      roomId: 'ABC123', playerId: 'p1', playerRole: 'X', nickname: 'Alice',
    });
  });

  it('works without body', async () => {
    vi.mocked(store.createRoom).mockReturnValue({
      roomId: 'DEF456', playerId: 'p2', playerRole: 'X', nickname: 'player-p2',
    });
    const req = new Request('http://localhost/api/online/room/create', { method: 'POST' });
    const res = await createRoom(req);
    expect(res.status).toBe(201);
  });
});

describe('POST /api/online/room/join', () => {
  it('returns player data on success', async () => {
    vi.mocked(store.joinRoom).mockReturnValue({
      ok: true, playerId: 'p2', playerRole: 'O', nickname: 'Bob',
    });
    const req = new Request('http://localhost/api/online/room/join', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'abc123', nickname: 'Bob' }),
    });
    const res = await joinRoom(req);
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({
      playerId: 'p2', playerRole: 'O', nickname: 'Bob',
    });
    expect(store.joinRoom).toHaveBeenCalledWith('ABC123', 'Bob');
  });

  it('returns 400 if roomId is missing', async () => {
    const req = new Request('http://localhost/api/online/room/join', {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Bob' }),
    });
    const res = await joinRoom(req);
    expect(res.status).toBe(400);
    expect((await json(res)).error).toBe('roomId is required');
  });

  it('returns error from store', async () => {
    vi.mocked(store.joinRoom).mockReturnValue({
      ok: false, error: 'Room not found', status: 404,
    });
    const req = new Request('http://localhost/api/online/room/join', {
      method: 'POST',
      body: JSON.stringify({ roomId: 'ZZZ' }),
    });
    const res = await joinRoom(req);
    expect(res.status).toBe(404);
    expect((await json(res)).error).toBe('Room not found');
  });
});

describe('GET /api/online/room/state', () => {
  it('returns 400 if missing params', async () => {
    const req = new Request('http://localhost/api/online/room/state');
    const res = await getState(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 if room not found', async () => {
    vi.mocked(store.getRoom).mockReturnValue(undefined);
    const req = new Request('http://localhost/api/online/room/state?roomId=X&playerId=Y');
    const res = await getState(req);
    expect(res.status).toBe(404);
  });

  it('returns room state for player X', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    const req = new Request('http://localhost/api/online/room/state?roomId=ABC123&playerId=p1');
    const res = await getState(req);
    expect(res.status).toBe(200);
    const data = await json(res);
    expect(data.yourRole).toBe('X');
    expect(data.yourNickname).toBe('Alice');
    expect(data.opponentNickname).toBe('Bob');
    expect(data.board).toEqual(Array(9).fill(null));
    expect(data.createdAt).toBeDefined();
  });

  it('returns room state for player O', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    const req = new Request('http://localhost/api/online/room/state?roomId=ABC123&playerId=p2');
    const res = await getState(req);
    const data = await json(res);
    expect(data.yourRole).toBe('O');
    expect(data.yourNickname).toBe('Bob');
    expect(data.opponentNickname).toBe('Alice');
  });
});

describe('POST /api/online/room/move', () => {
  const validBody = { roomId: 'ABC123', playerId: 'p1', index: 0 };

  it('returns 400 if missing params', async () => {
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify({ roomId: 'ABC123' }),
    });
    const res = await move(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 if room not found', async () => {
    vi.mocked(store.getRoom).mockReturnValue(undefined);
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await move(req);
    expect(res.status).toBe(404);
  });

  it('returns 409 if game not in progress', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom({ status: 'waiting' }));
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await move(req);
    expect(res.status).toBe(409);
  });

  it('returns 403 if not a player', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify({ ...validBody, playerId: 'unknown' }),
    });
    const res = await move(req);
    expect(res.status).toBe(403);
  });

  it('returns 403 if not your turn', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify({ ...validBody, playerId: 'p2' }),
    });
    const res = await move(req);
    expect(res.status).toBe(403);
  });

  it('returns 409 if game already over', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom({ winner: 'X' }));
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await move(req);
    expect(res.status).toBe(409);
  });

  it('returns 409 if cell occupied', async () => {
    const board = Array(9).fill(null) as (string | null)[];
    board[0] = 'O';
    vi.mocked(store.getRoom).mockReturnValue(makeRoom({ board: board as Room['board'] }));
    vi.mocked(engine.makeMove).mockReturnValue(board);
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await move(req);
    expect(res.status).toBe(409);
    expect((await json(res)).error).toBe('Cell already occupied');
  });

  it('makes a move and returns new state', async () => {
    const newBoard = ['X', ...Array(8).fill(null)];
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    vi.mocked(engine.makeMove).mockReturnValue(newBoard);
    vi.mocked(engine.calculateWinner).mockReturnValue(null);
    vi.mocked(engine.checkDraw).mockReturnValue(false);
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await move(req);
    expect(res.status).toBe(200);
    const data = await json(res);
    expect(data.currentPlayer).toBe('O');
    expect(data.winner).toBeNull();
    expect(store.updateRoom).toHaveBeenCalled();
  });

  it('detects win and sets winner', async () => {
    const winBoard = ['X', 'X', 'X', ...Array(6).fill(null)];
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    vi.mocked(engine.makeMove).mockReturnValue(winBoard);
    vi.mocked(engine.calculateWinner).mockReturnValue('X');
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await move(req);
    const data = await json(res);
    expect(data.winner).toBe('X');
    expect(store.updateRoom).toHaveBeenCalledWith('ABC123', expect.objectContaining({ status: 'finished' }));
  });

  it('detects draw', async () => {
    const fullBoard = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    vi.mocked(engine.makeMove).mockReturnValue(fullBoard);
    vi.mocked(engine.calculateWinner).mockReturnValue(null);
    vi.mocked(engine.checkDraw).mockReturnValue(true);
    const req = new Request('http://localhost/api/online/room/move', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await move(req);
    const data = await json(res);
    expect(data.winner).toBe('BOTH');
  });
});

describe('POST /api/online/room/restart', () => {
  const validBody = { roomId: 'ABC123', playerId: 'p1' };

  it('returns 400 if missing params', async () => {
    const req = new Request('http://localhost/api/online/room/restart', {
      method: 'POST', body: JSON.stringify({}),
    });
    const res = await restart(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 if room not found', async () => {
    vi.mocked(store.getRoom).mockReturnValue(undefined);
    const req = new Request('http://localhost/api/online/room/restart', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await restart(req);
    expect(res.status).toBe(404);
  });

  it('returns 403 if not a player', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom());
    const req = new Request('http://localhost/api/online/room/restart', {
      method: 'POST', body: JSON.stringify({ ...validBody, playerId: 'unknown' }),
    });
    const res = await restart(req);
    expect(res.status).toBe(403);
  });

  it('first restart request returns waitingForOpponent', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom({ winner: 'X' }));
    const req = new Request('http://localhost/api/online/room/restart', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await restart(req);
    expect(res.status).toBe(200);
    const data = await json(res);
    expect(data.waitingForOpponent).toBe(true);
    expect(store.updateRoom).toHaveBeenCalledWith('ABC123', expect.objectContaining({ restartRequestedBy: 'X' }));
  });

  it('same player restart again returns waitingForOpponent', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom({ winner: 'X', restartRequestedBy: 'X' }));
    const req = new Request('http://localhost/api/online/room/restart', {
      method: 'POST', body: JSON.stringify(validBody),
    });
    const res = await restart(req);
    const data = await json(res);
    expect(data.waitingForOpponent).toBe(true);
  });

  it('opponent accepts restart: resets board and swaps roles', async () => {
    vi.mocked(store.getRoom).mockReturnValue(makeRoom({ winner: 'X', restartRequestedBy: 'X' }));
    const req = new Request('http://localhost/api/online/room/restart', {
      method: 'POST', body: JSON.stringify({ roomId: 'ABC123', playerId: 'p2' }),
    });
    const res = await restart(req);
    const data = await json(res);
    expect(data.waitingForOpponent).toBe(false);
    expect(data.winner).toBeNull();
    expect(data.currentPlayer).toBe('X');
    expect(store.updateRoom).toHaveBeenCalledWith('ABC123', expect.objectContaining({
      playerX: 'p2', playerO: 'p1', restartRequestedBy: null,
    }));
  });
});

describe('POST /api/online/room/disconnect', () => {
  it('returns 400 if missing params', async () => {
    const req = new Request('http://localhost/api/online/room/disconnect', {
      method: 'POST', body: JSON.stringify({}),
    });
    const res = await disconnect(req);
    expect(res.status).toBe(400);
  });

  it('disconnects and returns success', async () => {
    const req = new Request('http://localhost/api/online/room/disconnect', {
      method: 'POST', body: JSON.stringify({ roomId: 'ABC123', playerId: 'p1' }),
    });
    const res = await disconnect(req);
    expect(res.status).toBe(200);
    expect((await json(res)).success).toBe(true);
    expect(store.disconnectPlayer).toHaveBeenCalledWith('ABC123', 'p1');
  });
});
