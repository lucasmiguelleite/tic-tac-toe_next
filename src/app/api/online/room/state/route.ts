import { NextResponse } from 'next/server';
import { cleanup, getRoom, updateRoom } from '@/domain/onlineStore';

export async function GET(request: Request) {
  await cleanup();
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

  const now = Date.now();
  if (room.playerX === playerId) {
    room.lastSeenX = now;
  } else if (room.playerO === playerId) {
    room.lastSeenO = now;
  }
  await updateRoom(roomId, room);

  const yourRole = room.playerX === playerId ? 'X' : room.playerO === playerId ? 'O' : null;
  const opponentLastSeen = yourRole === 'X' ? room.lastSeenO : room.lastSeenX;
  const opponentDisconnected = room.disconnected && room.disconnected !== yourRole;
  const opponentConnected = !opponentDisconnected && room.status !== 'waiting'
    && opponentLastSeen > 0 && now - opponentLastSeen < 5000;

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
