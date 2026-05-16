'use client';

import { useState, useCallback } from 'react';
import { Player } from '@/domain/types';

export const useOnlineQueue = () => {
  const [queueId, setQueueId] = useState<string | null>(null);

  const enterQueue = useCallback(async (nickname: string | undefined, onMatch: (roomId: string, playerId: string, playerRole: Player) => void, onQueued: (queueId: string) => void) => {
    try {
      const res = await fetch('/api/online/queue/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      if (data.matched && data.matchResult) {
        onMatch(data.matchResult.roomId, data.matchResult.playerId, data.matchResult.playerRole);
      } else {
        setQueueId(data.queueId);
        onQueued(data.queueId);
      }
    } catch {
      // Caller handles error
    }
  }, []);

  const pollQueue = useCallback((id: string | null, onMatch: (roomId: string, playerId: string, playerRole: Player) => void, onTimeout: () => void) => {
    if (!id) return () => {};
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/online/queue/poll?queueId=${id}`);
        if (res.status === 404) { onTimeout(); return; }
        if (res.ok) {
          const data = await res.json();
          if (data.matched && data.matchResult) {
            onMatch(data.matchResult.roomId, data.matchResult.playerId, data.matchResult.playerRole);
          }
        }
      } catch {
        // Retry
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const exitQueue = useCallback(async (id: string | null) => {
    if (id) {
      await fetch('/api/online/queue/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId: id }),
      });
    }
    setQueueId(null);
  }, []);

  return { queueId, enterQueue, pollQueue, exitQueue };
};
