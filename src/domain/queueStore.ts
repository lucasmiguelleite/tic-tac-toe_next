import { QueueEntry } from './types';
import { generateId } from './utils';
import { createRoom, joinRoom } from './roomStore';
import { clearKeys, deleteValue, getKeys, getValue, setIfNotExists, setValue } from './onlineStorage';

export const QUEUE_TTL_MS = 2 * 60 * 1000;
const QUEUE_TTL_SECONDS = QUEUE_TTL_MS / 1000;
const QUEUE_KEY_PREFIX = 'tic-tac-toe:queue:';
const QUEUE_LOCK_KEY_PREFIX = 'tic-tac-toe:queue-lock:';
const QUEUE_LOCK_TTL_SECONDS = 5;
const MATCHMAKING_LOCK_KEY = `${QUEUE_LOCK_KEY_PREFIX}matchmaking`;

const queueKey = (queueId: string) => `${QUEUE_KEY_PREFIX}${queueId}`;

const withMatchmakingLock = async <T>(callback: () => Promise<T>, fallback: T): Promise<T> => {
  const locked = await setIfNotExists(MATCHMAKING_LOCK_KEY, '1', QUEUE_LOCK_TTL_SECONDS);
  if (!locked) return fallback;

  try {
    return await callback();
  } finally {
    await deleteValue(MATCHMAKING_LOCK_KEY);
  }
};

const getUnmatchedEntries = async () => {
  const queueKeys = await getKeys(`${QUEUE_KEY_PREFIX}*`);
  const entries: Array<{ key: string; entry: QueueEntry }> = [];

  for (const key of queueKeys) {
    const entry = await getValue<QueueEntry>(key);
    if (entry && !entry.matched) entries.push({ key, entry });
  }

  return entries.sort((a, b) => a.entry.enteredAt - b.entry.enteredAt);
};

const processNextMatch = async () => {
  const waitingEntries = await getUnmatchedEntries();
  if (waitingEntries.length < 2) return;

  const [first, second] = waitingEntries;
  const roomResult = await createRoom(first.entry.nickname);
  const joinResult = await joinRoom(roomResult.roomId, second.entry.nickname);

  first.entry.matched = true;
  first.entry.matchResult = {
    roomId: roomResult.roomId,
    playerId: roomResult.playerId,
    playerRole: roomResult.playerRole,
  };

  second.entry.matched = true;
  second.entry.matchResult = {
    roomId: roomResult.roomId,
    playerId: joinResult.ok ? joinResult.playerId : '',
    playerRole: 'O',
  };

  await setValue(first.key, first.entry, QUEUE_TTL_SECONDS);
  await setValue(second.key, second.entry, QUEUE_TTL_SECONDS);
};

const matchQueuedEntry = async (queueId: string) => {
  await processNextMatch();

  const latestCurrent = await getValue<QueueEntry>(queueKey(queueId));
  if (!latestCurrent) return null;
  return { matched: latestCurrent.matched, matchResult: latestCurrent.matchResult };
};

export const enterQueue = async (nickname?: string) => {
  const queueId = generateId();
  const now = Date.now();
  const entry: QueueEntry = {
    queueId,
    matched: false,
    matchResult: null,
    nickname,
    enteredAt: now,
  };
  await setValue(queueKey(queueId), entry, QUEUE_TTL_SECONDS);
  const matchResult = await withMatchmakingLock(
    () => matchQueuedEntry(queueId),
    { matched: false as const, matchResult: null },
  );
  return { queueId, ...matchResult };
};

export const pollQueue = async (queueId: string) => {
  const entry = await getValue<QueueEntry>(queueKey(queueId));
  if (!entry) return null;
  if (!entry.matched) {
    return withMatchmakingLock(
      () => matchQueuedEntry(queueId),
      { matched: entry.matched, matchResult: entry.matchResult },
    );
  }
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
