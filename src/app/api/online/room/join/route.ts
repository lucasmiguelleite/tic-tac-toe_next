import { NextResponse } from 'next/server';
import { cleanup, joinRoom } from '@/domain/onlineStore';

export async function POST(request: Request) {
  cleanup();
  const { roomId, nickname } = await request.json();
  if (!roomId || typeof roomId !== 'string') {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
  }
  const result = joinRoom(roomId.toUpperCase().trim(), nickname);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ playerId: result.playerId, playerRole: result.playerRole, nickname: result.nickname });
}
