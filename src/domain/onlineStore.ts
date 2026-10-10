export { createRoom, joinRoom, getRoom, updateRoom, disconnectPlayer, updatePlayerSeen, getOpponentSeen, withRoomLock } from './roomStore';
export { enterQueue, pollQueue, getQueueStatus, exitQueue } from './queueStore';
export { getOnlinePlayerCount, markPlayerOffline, markPlayerOnline } from './presenceStore';

import { clearRooms, cleanupRooms } from './roomStore';
import { clearQueue, cleanupQueue } from './queueStore';
import { clearPresence } from './presenceStore';

export async function _resetStore() {
  await clearRooms();
  await clearQueue();
  await clearPresence();
}

export const cleanup = async () => {
  await cleanupRooms();
  await cleanupQueue();
};
