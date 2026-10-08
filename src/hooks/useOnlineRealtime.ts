'use client';

import { useCallback, useEffect, useRef } from 'react';

const INITIAL_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30000;

/**
 * Subscribes to room invalidation events. REST remains authoritative: each
 * event prompts a fresh state read, avoiding duplicated game rules on clients.
 */
export const useOnlineRealtime = (
  roomId: string | null,
  playerId: string | null,
  enabled: boolean,
  onState: (state: Record<string, unknown>) => void,
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onStateRef = useRef(onState);
  useEffect(() => { onStateRef.current = onState; }, [onState]);
  useEffect(() => {
    if (!enabled || !roomId || !playerId || typeof WebSocket === 'undefined') return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = INITIAL_RECONNECT_MS;

    const connect = () => {
      if (disposed) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const params = new URLSearchParams({ roomId, playerId });
      socket = new WebSocket(`${protocol}//${window.location.host}/api/online/realtime?${params}`);
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        reconnectDelay = INITIAL_RECONNECT_MS;
      });
      socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data) as { type?: string; state?: Record<string, unknown> };
          if (message.type === 'state' && message.state) onStateRef.current(message.state);
        } catch {
          // Ignore malformed events; the polling fallback will re-synchronize.
        }
      });
      socket.addEventListener('close', () => {
        if (disposed) return;
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_MS);
      });
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
      socketRef.current = null;
    };
  }, [roomId, playerId, enabled]);

  return useCallback((message: Record<string, unknown>) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return false;
    socketRef.current.send(JSON.stringify(message));
    return true;
  }, []);
};
