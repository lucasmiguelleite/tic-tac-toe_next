'use client';

import { useCallback, useEffect } from 'react';

export const useOnlineConnection = (roomId: string | null, playerId: string | null) => {
  useEffect(() => {
    if (!roomId || !playerId) return;
    const handleUnload = () => {
      navigator.sendBeacon(
        '/api/online/room/disconnect',
        JSON.stringify({ roomId, playerId }),
      );
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [roomId, playerId]);

  const disconnect = useCallback(() => {
    if (roomId && playerId) {
      navigator.sendBeacon(
        '/api/online/room/disconnect',
        JSON.stringify({ roomId, playerId }),
      );
    }
  }, [roomId, playerId]);

  return { disconnect };
};
