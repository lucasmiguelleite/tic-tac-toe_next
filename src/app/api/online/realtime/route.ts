import { NextResponse } from 'next/server';
import { experimental_upgradeWebSocket } from '@vercel/functions';
import { getRoom } from '@/domain/onlineStore';
import { getRoomEventChannel } from '@/domain/onlineEvents';
import { subscribe } from '@/domain/onlineStorage';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const playerId = searchParams.get('playerId');
  if (!roomId || !playerId) {
    return NextResponse.json({ error: 'roomId and playerId are required' }, { status: 400 });
  }

  const room = await getRoom(roomId);
  if (!room || (room.playerX !== playerId && room.playerO !== playerId)) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return experimental_upgradeWebSocket((socket) => {
    const unsubscribe = subscribe(getRoomEventChannel(roomId), (message) => {
      if (socket.readyState === socket.OPEN) socket.send(message);
    });
    socket.on('close', unsubscribe);
    socket.on('error', unsubscribe);
  });
}
