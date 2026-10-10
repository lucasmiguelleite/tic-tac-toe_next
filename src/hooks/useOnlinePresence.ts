'use client';

import { useEffect, useState } from 'react';
import { onlineApi } from '@/utils/onlineApi';

const PRESENCE_REFRESH_MS = 15_000;
const COUNT_REFRESH_MS = 5_000;

export type UseOnlinePresenceResult = {
  onlinePlayers: number | null;
};

export const useOnlinePresence = (): UseOnlinePresenceResult => {
  const [onlinePlayers, setOnlinePlayers] = useState<number | null>(null);
  const [presenceId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    let active = true;

    const updateCount = (count: number) => {
      if (active) setOnlinePlayers(count);
    };
    const heartbeat = async () => {
      try {
        const { response, data } = await onlineApi.updatePresence(presenceId);
        if (response.ok) updateCount(data.count);
      } catch {
        // The next heartbeat or count refresh will restore the indicator.
      }
    };
    const refreshCount = async () => {
      try {
        const { response, data } = await onlineApi.onlinePlayerCount();
        if (response.ok) updateCount(data.count);
      } catch {
        // Keep the last known count while the connection recovers.
      }
    };

    void heartbeat();
    const heartbeatId = setInterval(() => void heartbeat(), PRESENCE_REFRESH_MS);
    const countId = setInterval(() => void refreshCount(), COUNT_REFRESH_MS);

    return () => {
      active = false;
      clearInterval(heartbeatId);
      clearInterval(countId);
      void onlineApi.removePresence(presenceId);
    };
  }, [presenceId]);

  return { onlinePlayers };
};
