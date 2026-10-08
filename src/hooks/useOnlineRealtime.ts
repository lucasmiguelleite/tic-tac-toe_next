'use client';

import { useEffect } from 'react';

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
  onRoomUpdated: () => void,
) => {
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

      socket.addEventListener('open', () => {
        reconnectDelay = INITIAL_RECONNECT_MS;
        onRoomUpdated();
      });
      socket.addEventListener('message', (event) => {
        try {
          if ((JSON.parse(event.data) as { type?: string }).type === 'room-updated') onRoomUpdated();
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
    };
  }, [roomId, playerId, enabled, onRoomUpdated]);
};
