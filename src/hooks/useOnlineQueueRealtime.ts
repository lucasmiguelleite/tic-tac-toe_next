'use client';

import { useEffect, useRef } from 'react';
import { Player, QueueServerMessage } from '@/domain/types';

export const useOnlineQueueRealtime = (
  queueId: string | null,
  enabled: boolean,
  onMatch: (roomId: string, playerId: string, role: Player) => void,
) => {
  const onMatchRef = useRef(onMatch);
  useEffect(() => { onMatchRef.current = onMatch; }, [onMatch]);
  useEffect(() => {
    if (!enabled || !queueId || typeof WebSocket === 'undefined') return;
    let disposed = false;
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let delay = 1000;
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/api/online/realtime?${new URLSearchParams({ queueId })}`);
      socket.addEventListener('open', () => { delay = 1000; });
      socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as QueueServerMessage;
          if (message.type === 'queue' && message.queue?.matched && message.queue.matchResult) {
            const { roomId, playerId, playerRole } = message.queue.matchResult;
            onMatchRef.current(roomId, playerId, playerRole);
          }
        } catch { /* reconnect or queue expiry is handled by the server response. */ }
      });
      socket.addEventListener('close', () => {
        if (disposed) return;
        retry = setTimeout(connect, delay);
        delay = Math.min(delay * 2, 30000);
      });
    };
    connect();
    return () => { disposed = true; if (retry) clearTimeout(retry); socket?.close(); };
  }, [queueId, enabled]);
};
