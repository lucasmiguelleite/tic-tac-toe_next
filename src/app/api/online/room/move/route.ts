import { NextResponse } from 'next/server';
import { cleanup, getRoom, updateRoom } from '@/domain/onlineStore';
import { makeMove, calculateWinner, checkDraw } from '@/domain/gameEngine';

export async function POST(request: Request) {
  await cleanup();
  const { roomId, playerId, index } = await request.json();

  if (!roomId || !playerId || typeof index !== 'number') {
    return NextResponse.json({ error: 'roomId, playerId, and index are required' }, { status: 400 });
  }

  const room = await getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  if (room.status !== 'playing') {
    return NextResponse.json({ error: 'Game is not in progress' }, { status: 409 });
  }

  const playerRole = room.playerX === playerId ? 'X' : room.playerO === playerId ? 'O' : null;
  if (!playerRole) {
    return NextResponse.json({ error: 'Not a player in this room' }, { status: 403 });
  }

  if (playerRole !== room.currentPlayer) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 403 });
  }

  if (room.winner) {
    return NextResponse.json({ error: 'Game is already over' }, { status: 409 });
  }

  const newBoard = makeMove(room.board, index, room.currentPlayer);
  if (newBoard === room.board) {
    return NextResponse.json({ error: 'Cell already occupied' }, { status: 409 });
  }

  const winner = calculateWinner(newBoard);
  const isDraw = !winner && checkDraw(newBoard);
  const nextPlayer = room.currentPlayer === 'X' ? 'O' : 'X';

  await updateRoom(roomId, {
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: winner || (isDraw ? 'BOTH' : null),
    status: winner || isDraw ? 'finished' : 'playing',
  });

  return NextResponse.json({
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: winner || (isDraw ? 'BOTH' : null),
  });
}
