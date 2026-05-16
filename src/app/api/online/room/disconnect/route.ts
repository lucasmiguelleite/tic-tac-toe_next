import { NextResponse } from 'next/server';
import { cleanup, disconnectPlayer } from '@/domain/onlineStore';

export async function POST(request: Request) {
  cleanup();
  const { roomId, playerId } = await request.json();
  if (!roomId || !playerId) {
    return NextResponse.json({ error: 'roomId and playerId are required' }, { status: 400 });
  }
  disconnectPlayer(roomId, playerId);
  return NextResponse.json({ success: true });
}
