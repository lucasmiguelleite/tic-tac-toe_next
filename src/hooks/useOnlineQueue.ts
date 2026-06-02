'use client';

import { useState, useCallback } from 'react';
import { Player } from '@/domain/types';
import { fetchWithRetry } from '@/utils/fetchWithRetry';

const MAX_BACKOFF_MS = 30000;
const JITTER_MAX_MS = 1000;

export const useOnlineQueue = () => {
  const [queueId, setQueueId] = useState<string | null>(null);

  const enterQueue = useCallback(async (nickname: string | undefined, onMatch: (roomId: string, playerId: string, playerRole: Player) => void, onQueued: (queueId: string) => void) => {
    try {
      const res = await fetchWithRetry('/api/online/queue/enter', {
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
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let consecutiveErrors = 0;

    const poll = async () => {
      if (!active) return;
      try {
        const res = await fetch(`/api/online/queue/poll?queueId=${id}`);
        if (!active) return;
        consecutiveErrors = 0;
        if (res.status === 404) { onTimeout(); return; }
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          if (data.matched && data.matchResult) {
            onMatch(data.matchResult.roomId, data.matchResult.playerId, data.matchResult.playerRole);
            return;
          }
        }
        timeoutId = setTimeout(poll, 2000);
      } catch {
        consecutiveErrors++;
        const jitter = Math.floor(Math.random() * JITTER_MAX_MS);
        const delay = Math.min(2000 * Math.pow(2, consecutiveErrors) + jitter, MAX_BACKOFF_MS);
        timeoutId = setTimeout(poll, delay);
      }
    };
    poll();
    return () => { active = false; if (timeoutId) clearTimeout(timeoutId); };
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
