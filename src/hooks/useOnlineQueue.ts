'use client';

import { useState, useCallback } from 'react';
import { Player } from '@/domain/types';
import { onlineApi } from '@/utils/onlineApi';

const MAX_BACKOFF_MS = 30000;
const JITTER_MAX_MS = 1000;

export const useOnlineQueue = () => {
  const [queueId, setQueueId] = useState<string | null>(null);

  const enterQueue = useCallback(async (nickname: string | undefined, onMatch: (roomId: string, playerId: string, playerRole: Player) => void, onQueued: (queueId: string) => void) => {
    try {
      const { data } = await onlineApi.enterQueue(nickname);
      if (data.matched && data.matchResult) {
        onMatch(data.matchResult.roomId, data.matchResult.playerId, data.matchResult.playerRole);
      } else {
        setQueueId(data.queueId);
        onQueued(data.queueId);
      }
      return true;
    } catch {
      return false;
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
        const { response: res, data } = await onlineApi.queueStatus(id);
        if (!active) return;
        consecutiveErrors = 0;
        if (res.status === 404) { onTimeout(); return; }
        if (res.ok) {
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
      await onlineApi.exitQueue(id);
    }
    setQueueId(null);
  }, []);

  return { queueId, enterQueue, pollQueue, exitQueue };
};
