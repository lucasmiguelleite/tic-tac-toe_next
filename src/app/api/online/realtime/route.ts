import { NextResponse } from 'next/server';
import { experimental_upgradeWebSocket } from '@vercel/functions';
import { getQueueStatus, getRoom } from '@/domain/onlineStore';
import { getQueueEventChannel, getRoomEventChannel } from '@/domain/onlineEvents';
import { subscribe } from '@/domain/onlineStorage';
import { getOnlineRoomState, moveOnlineGame, restartOnlineGame } from '@/domain/onlineGame';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const playerId = searchParams.get('playerId');
  const queueId = searchParams.get('queueId');

  if (queueId && !roomId && !playerId) {
    if (!await getQueueStatus(queueId)) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    return experimental_upgradeWebSocket((socket) => {
      const sendQueue = async () => {
        const queue = await getQueueStatus(queueId);
        if (queue && socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: 'queue', queue }));
      };
      const unsubscribe = subscribe(getQueueEventChannel(queueId), () => { void sendQueue(); });
      void sendQueue();
      socket.on('close', unsubscribe);
      socket.on('error', unsubscribe);
    });
  }

  if (!roomId || !playerId) {
    return NextResponse.json({ error: 'roomId and playerId are required' }, { status: 400 });
  }

  const room = await getRoom(roomId);
  if (!room || (room.playerX !== playerId && room.playerO !== playerId)) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return experimental_upgradeWebSocket((socket) => {
    const sendState = async () => {
      const state = await getOnlineRoomState(roomId, playerId);
      if (socket.readyState !== socket.OPEN) return;
      socket.send(JSON.stringify(state.ok ? { type: 'state', state: state.data } : { type: 'error', error: state.error }));
    };
    const unsubscribe = subscribe(getRoomEventChannel(roomId), () => { void sendState(); });
    const heartbeat = setInterval(() => { void getOnlineRoomState(roomId, playerId); }, 10000);
    void sendState();
    socket.on('message', async (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as { type?: string; index?: unknown };
        if (message.type === 'move' && typeof message.index === 'number') {
          const result = await moveOnlineGame(roomId, playerId, message.index);
          if (!result.ok && socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: 'error', error: result.error }));
        } else if (message.type === 'restart') {
          const result = await restartOnlineGame(roomId, playerId);
          if (!result.ok && socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: 'error', error: result.error }));
        }
      } catch {
        if (socket.readyState === socket.OPEN) socket.send(JSON.stringify({ type: 'error', error: 'Invalid message' }));
      }
    });
    const cleanup = () => { clearInterval(heartbeat); unsubscribe(); };
    socket.on('close', cleanup);
    socket.on('error', cleanup);
  });
}
