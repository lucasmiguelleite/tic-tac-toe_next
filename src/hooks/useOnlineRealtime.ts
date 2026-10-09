'use client';

import { useMemo } from 'react';
import { OnlineRoomState, RoomClientMessage, RoomServerMessage } from '@/domain/types';
import { useReconnectableWebSocket } from './useReconnectableWebSocket';

export const useOnlineRealtime = (
  roomId: string | null,
  playerId: string | null,
  enabled: boolean,
  onState: (state: OnlineRoomState) => void,
) => {
  const url = useMemo(() => roomId && playerId && typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/online/realtime?${new URLSearchParams({ roomId, playerId })}` : null, [roomId, playerId]);
  return useReconnectableWebSocket<RoomServerMessage, RoomClientMessage>(url, enabled, (message) => {
    if (message.type === 'state') onState(message.state);
  });
};
