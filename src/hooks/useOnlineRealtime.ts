'use client';

import { useMemo } from 'react';
import { OnlineRoomState, RoomClientMessage, RoomServerMessage } from '@/domain/types';
import { onlineRealtimeUrl, useReconnectableWebSocket } from './useReconnectableWebSocket';

export const useOnlineRealtime = (
  roomId: string | null,
  playerId: string | null,
  enabled: boolean,
  onState: (state: OnlineRoomState) => void,
) => {
  const url = useMemo(() => roomId && playerId ? onlineRealtimeUrl({ roomId, playerId }) : null, [roomId, playerId]);
  return useReconnectableWebSocket<RoomServerMessage, RoomClientMessage>(url, enabled, (message) => {
    if (message.type === 'state') onState(message.state);
  });
};
