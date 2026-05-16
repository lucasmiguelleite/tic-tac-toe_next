export { createRoom, joinRoom, getRoom, updateRoom, disconnectPlayer } from './roomStore';
export { enterQueue, pollQueue, exitQueue } from './queueStore';

import { clearRooms, cleanupRooms } from './roomStore';
import { clearQueue, cleanupQueue } from './queueStore';

export function _resetStore() {
  clearRooms();
  clearQueue();
}

export const cleanup = () => {
  cleanupRooms();
  cleanupQueue();
};
