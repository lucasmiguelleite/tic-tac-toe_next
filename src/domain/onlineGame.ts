import { BoardState, OnlineRoomState, Player } from './types';
import { calculateWinner, checkDraw, makeMove } from './gameEngine';
import { disconnectPlayer, getOpponentSeen, getRoom, updatePlayerSeen, updateRoom, withRoomLock } from './onlineStore';
import { publishRoomUpdated } from './onlineEvents';

const DISCONNECT_THRESHOLD_MS = 15000;

type Failure = { ok: false; status: number; error: string };
type Success<T> = { ok: true; data: T };
type Result<T> = Success<T> | Failure;

const roleFor = (playerId: string, playerX: string | null, playerO: string | null): Player | null => (
  playerX === playerId ? 'X' : playerO === playerId ? 'O' : null
);

export const getOnlineRoomState = async (roomId: string, playerId: string): Promise<Result<OnlineRoomState>> => {
  const room = await getRoom(roomId);
  if (!room) return { ok: false, status: 404, error: 'Room not found' };
  const yourRole = roleFor(playerId, room.playerX, room.playerO);
  if (!yourRole) return { ok: false, status: 403, error: 'Not a player in this room' };
  await updatePlayerSeen(roomId, playerId, room.playerX, room.playerO);
  const opponentLastSeen = await getOpponentSeen(roomId, yourRole);
  const opponentDisconnected = room.disconnected && room.disconnected !== yourRole;
  const opponentConnected = !opponentDisconnected && room.status !== 'waiting'
    && opponentLastSeen !== null && Date.now() - opponentLastSeen < DISCONNECT_THRESHOLD_MS;
  return { ok: true, data: {
    board: room.board, currentPlayer: room.currentPlayer, winner: room.winner,
    roomStatus: room.status, opponentConnected, yourRole,
    yourNickname: yourRole === 'X' ? room.nicknameX : room.nicknameO,
    opponentNickname: yourRole === 'X' ? room.nicknameO : room.nicknameX,
    restartRequestedBy: room.restartRequestedBy, createdAt: room.createdAt,
  } };
};

export const moveOnlineGame = async (roomId: string, playerId: string, index: number): Promise<Result<Record<string, unknown>>> => {
  return withRoomLock(roomId, async () => {
  const room = await getRoom(roomId);
  if (!room) return { ok: false, status: 404, error: 'Room not found' };
  if (room.status !== 'playing') return { ok: false, status: 409, error: 'Game is not in progress' };
  const role = roleFor(playerId, room.playerX, room.playerO);
  if (!role) return { ok: false, status: 403, error: 'Not a player in this room' };
  if (role !== room.currentPlayer) return { ok: false, status: 403, error: 'Not your turn' };
  if (room.winner) return { ok: false, status: 409, error: 'Game is already over' };
  const board = makeMove(room.board, index, room.currentPlayer);
  if (board === room.board) return { ok: false, status: 409, error: 'Cell already occupied' };
  const winner = calculateWinner(board);
  const result = winner || (checkDraw(board) ? 'BOTH' : null);
  const currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
  await updateRoom(roomId, { board, currentPlayer, winner: result, status: result ? 'finished' : 'playing' });
  await updatePlayerSeen(roomId, playerId, room.playerX, room.playerO);
  await publishRoomUpdated(roomId);
  return { ok: true, data: { board, currentPlayer, winner: result } };
  }, { ok: false, status: 409, error: 'Room is busy' });
};

export const restartOnlineGame = async (roomId: string, playerId: string): Promise<Result<{ waitingForOpponent: boolean; board?: BoardState; currentPlayer?: Player; winner?: null }>> => {
  return withRoomLock(roomId, async () => {
  const room = await getRoom(roomId);
  if (!room) return { ok: false, status: 404, error: 'Room not found' };
  const role = roleFor(playerId, room.playerX, room.playerO);
  if (!role) return { ok: false, status: 403, error: 'Not a player in this room' };
  if (!room.restartRequestedBy) {
    await updateRoom(roomId, { restartRequestedBy: role });
    await publishRoomUpdated(roomId);
    return { ok: true, data: { waitingForOpponent: true } };
  }
  if (room.restartRequestedBy === role) return { ok: true, data: { waitingForOpponent: true } };
  await updateRoom(roomId, {
    board: Array(9).fill(null) as BoardState, currentPlayer: 'X', winner: null, status: 'playing',
    playerX: room.playerO, playerO: room.playerX,
    nicknameX: room.nicknameO, nicknameO: room.nicknameX, restartRequestedBy: null,
  });
  await publishRoomUpdated(roomId);
  return { ok: true, data: { waitingForOpponent: false, board: Array(9).fill(null) as BoardState, currentPlayer: 'X', winner: null } };
  }, { ok: false, status: 409, error: 'Room is busy' });
};

export const disconnectOnlinePlayer = async (roomId: string, playerId: string) => {
  await disconnectPlayer(roomId, playerId);
  await publishRoomUpdated(roomId);
};
