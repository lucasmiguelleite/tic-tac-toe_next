import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRoom,
  joinRoom,
  getRoom,
  updateRoom,
  enterQueue,
  pollQueue,
  exitQueue,
  cleanup,
  _resetStore,
} from '@/domain/onlineStore';

beforeEach(async () => {
  await _resetStore();
});

describe('createRoom', () => {
  it('returns a room with waiting status and playerX assigned', async () => {
    const result = await createRoom();
    expect(result.roomId).toHaveLength(6);
    expect(result.playerRole).toBe('X');
    expect(result.playerId).toBeTruthy();

    const room = await getRoom(result.roomId);
    expect(room?.status).toBe('waiting');
    expect(room?.playerX).toBe(result.playerId);
    expect(room?.playerO).toBeNull();
  });

  it('generates different room codes for different calls', async () => {
    const a = await createRoom();
    const b = await createRoom();
    expect(a.roomId).not.toBe(b.roomId);
  });

  it('uses only non-ambiguous characters', async () => {
    const ambiguous = /[OI01]/;
    for (let i = 0; i < 20; i++) {
      const { roomId } = await createRoom();
      expect(ambiguous.test(roomId)).toBe(false);
    }
  });
});

describe('joinRoom', () => {
  it('joins a waiting room as player O', async () => {
    const { roomId } = await createRoom();
    const result = await joinRoom(roomId);
    expect(result).toEqual({ ok: true, playerId: expect.any(String), playerRole: 'O', nickname: expect.any(String) });

    const room = await getRoom(roomId);
    expect(room?.status).toBe('playing');
    expect(room?.playerO).toBe((result as { ok: true; playerId: string }).playerId);
  });

  it('returns error for non-existent room', async () => {
    const result = await joinRoom('ZZZZZZ');
    expect(result).toEqual({ ok: false, error: 'Room not found', status: 404 });
  });

  it('returns error for full room', async () => {
    const { roomId } = await createRoom();
    await joinRoom(roomId);
    const result = await joinRoom(roomId);
    expect(result).toEqual({ ok: false, error: 'Room is full', status: 409 });
  });
});

describe('enterQueue', () => {
  it('returns unmatched when queue is empty', async () => {
    const result = await enterQueue();
    expect(result.matched).toBe(false);
    expect(result.queueId).toBeTruthy();
  });

  it('matches two players when second enters', async () => {
    const first = await enterQueue();
    const second = await enterQueue();

    expect(first.matched).toBe(false);
    expect(second.matched).toBe(true);
    expect(second.matchResult?.roomId).toBeTruthy();
    expect(second.matchResult?.playerRole).toBe('O');

    const firstPoll = await pollQueue(first.queueId);
    expect(firstPoll?.matched).toBe(true);
    expect(firstPoll?.matchResult?.playerRole).toBe('X');
  });

  it('keeps matched entries from being reused', async () => {
    await enterQueue();
    await enterQueue();
    const third = await enterQueue();
    expect(third.matched).toBe(false);
  });

  it('eventually matches players that enter at the same time', async () => {
    const [first, second] = await Promise.all([enterQueue('Alice'), enterQueue('Bob')]);

    const firstPoll = await pollQueue(first.queueId);
    const secondPoll = await pollQueue(second.queueId);

    expect(firstPoll?.matched).toBe(true);
    expect(secondPoll?.matched).toBe(true);
    expect(firstPoll?.matchResult?.roomId).toBe(secondPoll?.matchResult?.roomId);
    expect(firstPoll?.matchResult?.playerRole).not.toBe(secondPoll?.matchResult?.playerRole);
  });
});

describe('exitQueue', () => {
  it('removes entry from queue', async () => {
    const { queueId } = await enterQueue();
    expect(await exitQueue(queueId)).toBe(true);
    expect(await pollQueue(queueId)).toBeNull();
  });

  it('returns false for non-existent entry', async () => {
    expect(await exitQueue('nonexistent')).toBe(false);
  });
});

describe('cleanup', () => {
  it('removes expired rooms', async () => {
    const { roomId } = await createRoom();
    const room = await getRoom(roomId);
    await updateRoom(roomId, { createdAt: Date.now() - 31 * 60 * 1000 });
    expect(room).toBeDefined();
    await cleanup();
    expect(await getRoom(roomId)).toBeUndefined();
  });

  it('keeps fresh queue entries', async () => {
    const { queueId } = await enterQueue();
    await cleanup();
    expect(await pollQueue(queueId)).not.toBeNull();
  });

  it('keeps non-expired rooms', async () => {
    const { roomId } = await createRoom();
    await cleanup();
    expect(await getRoom(roomId)).toBeDefined();
  });
});

describe('updateRoom', () => {
  it('updates room fields', async () => {
    const { roomId } = await createRoom();
    const updated = await updateRoom(roomId, { status: 'finished' });
    expect(updated?.status).toBe('finished');
  });

  it('returns undefined for non-existent room', async () => {
    expect(await updateRoom('ZZZZZZ', { status: 'finished' })).toBeUndefined();
  });
});
