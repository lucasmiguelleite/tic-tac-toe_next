'use client';

import { useCallback, useEffect, useRef } from 'react';

const INITIAL_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30000;

/** Shared WebSocket transport with exponential reconnect and latest callback. */
export const useReconnectableWebSocket = <TIncoming, TOutgoing>(url: string | null, enabled: boolean, onMessage: (message: TIncoming) => void) => {
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => {
    if (!enabled || !url || typeof WebSocket === 'undefined') return;
    let disposed = false; let socket: WebSocket | null = null; let retry: ReturnType<typeof setTimeout> | null = null; let delay = INITIAL_RECONNECT_MS;
    const connect = () => {
      if (disposed) return;
      socket = new WebSocket(url); socketRef.current = socket;
      socket.addEventListener('open', () => { delay = INITIAL_RECONNECT_MS; });
      socket.addEventListener('message', (event) => { try { onMessageRef.current(JSON.parse(event.data) as TIncoming); } catch { /* polling re-synchronizes */ } });
      socket.addEventListener('close', () => { if (!disposed) { retry = setTimeout(connect, delay); delay = Math.min(delay * 2, MAX_RECONNECT_MS); } });
    };
    connect();
    return () => { disposed = true; if (retry) clearTimeout(retry); socket?.close(); socketRef.current = null; };
  }, [url, enabled]);
  return useCallback((message: TOutgoing) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return false;
    socketRef.current.send(JSON.stringify(message)); return true;
  }, []);
};
