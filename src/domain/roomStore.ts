import { BoardState, Player, Room } from './types';
import { generateId } from './utils';
import { clearKeys, deleteValue, getKeys, getValue, setValue } from './onlineStorage';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;
export const ROOM_TTL_MS = 30 * 60 * 1000;
const ROOM_TTL_SECONDS = ROOM_TTL_MS / 1000;
const ROOM_KEY_PREFIX = 'tic-tac-toe:room:';

export { generateId };

const roomKey = (roomId: string) => `${ROOM_KEY_PREFIX}${roomId}`;

const generateCode = (): string => {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
};

export const createRoom = async (nickname?: string) => {
  let roomId = generateCode();
  while (await getRoom(roomId)) roomId = generateCode();

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

  await setValue(roomKey(roomId), room, ROOM_TTL_SECONDS);
  return { roomId, playerId, playerRole: 'X' as Player, nickname: name };
};

export const joinRoom = async (roomId: string, nickname?: string) => {
  const room = await getRoom(roomId);
  if (!room) return { ok: false as const, error: 'Room not found', status: 404 };
  if (room.status !== 'waiting') return { ok: false as const, error: 'Room is full', status: 409 };

  const playerId = generateId();
  const name = nickname?.trim() || `player-${playerId}`;
  room.playerO = playerId;
  room.nicknameO = name;
  room.status = 'playing';
  room.lastSeenO = Date.now();
  await setValue(roomKey(roomId), room, ROOM_TTL_SECONDS);
  return { ok: true as const, playerId, playerRole: 'O' as Player, nickname: name };
};

export const getRoom = async (roomId: string): Promise<Room | undefined> => {
  const room = await getValue<Room>(roomKey(roomId));
  return room ?? undefined;
};

export const updateRoom = async (roomId: string, updates: Partial<Room>) => {
  const room = await getRoom(roomId);
  if (!room) return undefined;
  Object.assign(room, updates);
  await setValue(roomKey(roomId), room, ROOM_TTL_SECONDS);
  return room;
};

export const disconnectPlayer = async (roomId: string, playerId: string) => {
  const room = await getRoom(roomId);
  if (!room) return;
  if (room.playerX === playerId) room.disconnected = 'X';
  else if (room.playerO === playerId) room.disconnected = 'O';
  await setValue(roomKey(roomId), room, ROOM_TTL_SECONDS);
};

export const cleanupRooms = async () => {
  const now = Date.now();
  const keys = await getKeys(`${ROOM_KEY_PREFIX}*`);
  for (const key of keys) {
    const room = await getValue<Room>(key);
    if (room && now - room.createdAt > ROOM_TTL_MS) await deleteValue(key);
  }
};

export const clearRooms = () => clearKeys(`${ROOM_KEY_PREFIX}*`);
