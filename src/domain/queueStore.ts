import { QueueEntry } from './types';
import { generateId, createRoom, joinRoom, clearRooms } from './roomStore';

export const QUEUE_TTL_MS = 2 * 60 * 1000;

const queue = new Map<string, QueueEntry>();

export const enterQueue = (nickname?: string) => {
  const queueId = generateId();
  const now = Date.now();

  for (const [, entry] of queue) {
    if (!entry.matched) {
      const roomResult = createRoom(entry.nickname);
      const joinResult = joinRoom(roomResult.roomId, nickname);

      entry.matched = true;
      entry.matchResult = {
        roomId: roomResult.roomId,
        playerId: roomResult.playerId,
        playerRole: roomResult.playerRole,
      };

      const newEntry: QueueEntry = {
        queueId,
        matched: true,
        matchResult: {
          roomId: roomResult.roomId,
          playerId: joinResult.ok ? joinResult.playerId : '',
          playerRole: 'O',
        },
        nickname,
        enteredAt: now,
      };

      queue.set(queueId, newEntry);
      return { queueId, matched: true, matchResult: newEntry.matchResult };
    }
  }

  const entry: QueueEntry = {
    queueId,
    matched: false,
    matchResult: null,
    nickname,
    enteredAt: now,
  };
  queue.set(queueId, entry);
  return { queueId, matched: false as const, matchResult: null };
};

export const pollQueue = (queueId: string) => {
  const entry = queue.get(queueId);
  if (!entry) return null;
  return { matched: entry.matched, matchResult: entry.matchResult };
};

export const exitQueue = (queueId: string): boolean => queue.delete(queueId);

export const cleanupQueue = () => {
  const now = Date.now();
  for (const [id, entry] of queue) {
    if (now - entry.enteredAt > QUEUE_TTL_MS) queue.delete(id);
  }
};

export const clearQueue = () => queue.clear();
