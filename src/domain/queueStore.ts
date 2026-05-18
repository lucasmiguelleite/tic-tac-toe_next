import { QueueEntry } from './types';
import { generateId } from './utils';
import { createRoom, joinRoom } from './roomStore';
import { clearKeys, deleteValue, getKeys, getValue, setIfNotExists, setValue } from './onlineStorage';

export const QUEUE_TTL_MS = 2 * 60 * 1000;
const QUEUE_TTL_SECONDS = QUEUE_TTL_MS / 1000;
const QUEUE_KEY_PREFIX = 'tic-tac-toe:queue:';
const QUEUE_LOCK_KEY_PREFIX = 'tic-tac-toe:queue-lock:';
const QUEUE_LOCK_TTL_SECONDS = 5;

const queueKey = (queueId: string) => `${QUEUE_KEY_PREFIX}${queueId}`;
const queueLockKey = (queueId: string) => `${QUEUE_LOCK_KEY_PREFIX}${queueId}`;

export const enterQueue = async (nickname?: string) => {
  const queueId = generateId();
  const now = Date.now();
  const queueKeys = await getKeys(`${QUEUE_KEY_PREFIX}*`);

  for (const key of queueKeys) {
    const entry = await getValue<QueueEntry>(key);
    if (!entry) continue;
    if (!entry.matched) {
      const lockKey = queueLockKey(entry.queueId);
      const locked = await setIfNotExists(lockKey, '1', QUEUE_LOCK_TTL_SECONDS);
      if (!locked) continue;

      try {
        const latestEntry = await getValue<QueueEntry>(key);
        if (!latestEntry || latestEntry.matched) continue;

        const roomResult = await createRoom(latestEntry.nickname);
        const joinResult = await joinRoom(roomResult.roomId, nickname);

        latestEntry.matched = true;
        latestEntry.matchResult = {
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

        await setValue(key, latestEntry, QUEUE_TTL_SECONDS);
        await setValue(queueKey(queueId), newEntry, QUEUE_TTL_SECONDS);
        return { queueId, matched: true, matchResult: newEntry.matchResult };
      } finally {
        await deleteValue(lockKey);
      }
    }
  }

  const entry: QueueEntry = {
    queueId,
    matched: false,
    matchResult: null,
    nickname,
    enteredAt: now,
  };
  await setValue(queueKey(queueId), entry, QUEUE_TTL_SECONDS);
  return { queueId, matched: false as const, matchResult: null };
};

export const pollQueue = async (queueId: string) => {
  const entry = await getValue<QueueEntry>(queueKey(queueId));
  if (!entry) return null;
  return { matched: entry.matched, matchResult: entry.matchResult };
};

export const exitQueue = (queueId: string): Promise<boolean> => deleteValue(queueKey(queueId));

export const cleanupQueue = async () => {
  const now = Date.now();
  const keys = await getKeys(`${QUEUE_KEY_PREFIX}*`);
  for (const key of keys) {
    const entry = await getValue<QueueEntry>(key);
    if (entry && now - entry.enteredAt > QUEUE_TTL_MS) await deleteValue(key);
  }
};

export const clearQueue = async () => {
  await clearKeys(`${QUEUE_KEY_PREFIX}*`);
  await clearKeys(`${QUEUE_LOCK_KEY_PREFIX}*`);
};
