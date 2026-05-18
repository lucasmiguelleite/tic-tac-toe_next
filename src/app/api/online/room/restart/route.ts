import { NextResponse } from 'next/server';
import { getRoom, updateRoom } from '@/domain/onlineStore';
import { BoardState } from '@/domain/types';

export async function POST(request: Request) {
  const { roomId, playerId } = await request.json();

  if (!roomId || !playerId) {
    return NextResponse.json({ error: 'roomId and playerId are required' }, { status: 400 });
  }

  const room = await getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  const playerRole = room.playerX === playerId ? 'X' : room.playerO === playerId ? 'O' : null;
  if (!playerRole) {
    return NextResponse.json({ error: 'Not a player in this room' }, { status: 403 });
  }

  if (!room.restartRequestedBy) {
    await updateRoom(roomId, { restartRequestedBy: playerRole });
    return NextResponse.json({
      board: room.board,
      currentPlayer: room.currentPlayer,
      winner: room.winner,
      waitingForOpponent: true,
    });
  }

  if (room.restartRequestedBy === playerRole) {
    return NextResponse.json({ waitingForOpponent: true });
  }

  // Opponent requested restart — reset and swap roles
  const newPlayerX = room.playerO;
  const newPlayerO = room.playerX;

  await updateRoom(roomId, {
    board: Array(9).fill(null) as BoardState,
    currentPlayer: 'X',
    winner: null,
    status: 'playing',
    playerX: newPlayerX,
    playerO: newPlayerO,
    restartRequestedBy: null,
  });

  return NextResponse.json({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    waitingForOpponent: false,
  });
}
