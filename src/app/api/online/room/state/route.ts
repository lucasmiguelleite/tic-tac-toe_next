import { NextResponse } from 'next/server';
import { getRoom, updatePlayerSeen, getOpponentSeen } from '@/domain/onlineStore';

const DISCONNECT_THRESHOLD_MS = 15000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const playerId = searchParams.get('playerId');

  if (!roomId || !playerId) {
    return NextResponse.json({ error: 'roomId and playerId are required' }, { status: 400 });
  }

  const room = await getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const yourRole = room.playerX === playerId ? 'X' : room.playerO === playerId ? 'O' : null;

  // Update own lastSeen via separate key — no read-modify-write on room
  await updatePlayerSeen(roomId, playerId, room.playerX, room.playerO);

  // Read opponent lastSeen from separate key
  const opponentLastSeen = yourRole ? await getOpponentSeen(roomId, yourRole) : null;
  const now = Date.now();
  const opponentDisconnected = room.disconnected && room.disconnected !== yourRole;
  const opponentConnected = !opponentDisconnected && room.status !== 'waiting'
    && opponentLastSeen !== null && now - opponentLastSeen < DISCONNECT_THRESHOLD_MS;

  return NextResponse.json({
    board: room.board,
    currentPlayer: room.currentPlayer,
    winner: room.winner,
    roomStatus: room.status,
    opponentConnected,
    yourRole,
    yourNickname: yourRole === 'X' ? room.nicknameX : room.nicknameO,
    opponentNickname: yourRole === 'X' ? room.nicknameO : room.nicknameX,
    restartRequestedBy: room.restartRequestedBy,
    createdAt: room.createdAt,
  });
}
