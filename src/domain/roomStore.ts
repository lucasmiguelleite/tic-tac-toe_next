import { BoardState, Player, Room } from './types';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;
export const ROOM_TTL_MS = 30 * 60 * 1000;

const rooms = new Map<string, Room>();

export const generateId = (): string =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

const generateCode = (): string => {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
};

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

export const cleanupRooms = () => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL_MS) rooms.delete(id);
  }
};

export const clearRooms = () => rooms.clear();
