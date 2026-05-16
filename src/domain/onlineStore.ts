import { BoardState, Player, Room, QueueEntry } from './types';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;
const ROOM_TTL_MS = 30 * 60 * 1000;
const QUEUE_TTL_MS = 2 * 60 * 1000;

const rooms = new Map<string, Room>();
const queue = new Map<string, QueueEntry>();

export function _resetStore() {
  rooms.clear();
  queue.clear();
}

const generateCode = (): string => {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
};

const generateId = (): string =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export const createRoom = (nickname?: string) => {
  let roomId = generateCode();
  while (rooms.has(roomId)) roomId = generateCode();

  const playerId = generateId();
  const name = nickname?.trim() || `player-${playerId}`;
  const now = Date.now();

  const room: Room = {
    roomId,
    status: 'waiting',
    board: Array(9).fill(null) as BoardState,
    currentPlayer: 'X',
    winner: null,
    playerX: playerId,
    playerO: null,
    nicknameX: name,
    nicknameO: '',
    lastSeenX: now,
    lastSeenO: 0,
    restartRequestedBy: null,
    disconnected: null,
    createdAt: now,
  };

  rooms.set(roomId, room);
  return { roomId, playerId, playerRole: 'X' as Player, nickname: name };
};

export const joinRoom = (roomId: string, nickname?: string) => {
  const room = rooms.get(roomId);
  if (!room) return { ok: false as const, error: 'Room not found', status: 404 };
  if (room.status !== 'waiting') return { ok: false as const, error: 'Room is full', status: 409 };

  const playerId = generateId();
  const name = nickname?.trim() || `player-${playerId}`;
  room.playerO = playerId;
  room.nicknameO = name;
  room.status = 'playing';
  room.lastSeenO = Date.now();
  return { ok: true as const, playerId, playerRole: 'O' as Player, nickname: name };
};

export const getRoom = (roomId: string): Room | undefined => rooms.get(roomId);

export const updateRoom = (roomId: string, updates: Partial<Room>) => {
  const room = rooms.get(roomId);
  if (!room) return undefined;
  Object.assign(room, updates);
  return room;
};

export const disconnectPlayer = (roomId: string, playerId: string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  if (room.playerX === playerId) room.disconnected = 'X';
  else if (room.playerO === playerId) room.disconnected = 'O';
};

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

export const cleanup = () => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL_MS) rooms.delete(id);
  }
  for (const [id, entry] of queue) {
    if (now - entry.enteredAt > QUEUE_TTL_MS) queue.delete(id);
  }
};
