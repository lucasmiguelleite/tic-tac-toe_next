'use client';

import { useMemo } from 'react';
import { Player, QueueServerMessage } from '@/domain/types';
import { onlineRealtimeUrl, useReconnectableWebSocket } from './useReconnectableWebSocket';

export const useOnlineQueueRealtime = (
  queueId: string | null,
  enabled: boolean,
  onMatch: (roomId: string, playerId: string, role: Player) => void,
) => {
  const url = useMemo(() => queueId ? onlineRealtimeUrl({ queueId }) : null, [queueId]);
  return useReconnectableWebSocket<QueueServerMessage, never>(url, enabled, (message) => {
    if (message.type === 'queue' && message.queue.matched && message.queue.matchResult) {
      const { roomId, playerId, playerRole } = message.queue.matchResult;
      onMatch(roomId, playerId, playerRole);
    }
  });
};
