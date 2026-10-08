import { NextResponse } from 'next/server';
import { restartOnlineGame } from '@/domain/onlineGame';

export async function POST(request: Request) {
  const { roomId, playerId } = await request.json();

  if (!roomId || !playerId) {
    return NextResponse.json({ error: 'roomId and playerId are required' }, { status: 400 });
  }

  const result = await restartOnlineGame(roomId, playerId);
  return result.ok
    ? NextResponse.json(result.data)
    : NextResponse.json({ error: result.error }, { status: result.status });
}
