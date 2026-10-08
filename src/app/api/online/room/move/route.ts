import { NextResponse } from 'next/server';
import { moveOnlineGame } from '@/domain/onlineGame';

export async function POST(request: Request) {
  const { roomId, playerId, index } = await request.json();

  if (!roomId || !playerId || typeof index !== 'number') {
    return NextResponse.json({ error: 'roomId, playerId, and index are required' }, { status: 400 });
  }

  const result = await moveOnlineGame(roomId, playerId, index);
  return result.ok
    ? NextResponse.json(result.data)
    : NextResponse.json({ error: result.error }, { status: result.status });
}
