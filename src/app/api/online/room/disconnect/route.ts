import { NextResponse } from 'next/server';
import { disconnectPlayer } from '@/domain/onlineStore';
import { publishRoomUpdated } from '@/domain/onlineEvents';

export async function POST(request: Request) {
  const { roomId, playerId } = await request.json();
  if (!roomId || !playerId) {
    return NextResponse.json({ error: 'roomId and playerId are required' }, { status: 400 });
  }
  await disconnectPlayer(roomId, playerId);
  await publishRoomUpdated(roomId);
  return NextResponse.json({ success: true });
}
