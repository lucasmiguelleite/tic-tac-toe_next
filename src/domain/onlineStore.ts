export { createRoom, joinRoom, getRoom, updateRoom, disconnectPlayer, updatePlayerSeen, getOpponentSeen, withRoomLock } from './roomStore';
export { enterQueue, pollQueue, getQueueStatus, exitQueue } from './queueStore';

import { clearRooms, cleanupRooms } from './roomStore';
import { clearQueue, cleanupQueue } from './queueStore';

export async function _resetStore() {
  await clearRooms();
  await clearQueue();
}

export const cleanup = async () => {
  await cleanupRooms();
  await cleanupQueue();
};
