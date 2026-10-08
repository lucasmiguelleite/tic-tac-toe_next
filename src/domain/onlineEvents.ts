import { publish } from './onlineStorage';

const roomChannel = (roomId: string) => `tic-tac-toe:room-events:${roomId}`;
const ROOM_UPDATED = JSON.stringify({ type: 'room-updated' });

/** Notifies all connected room clients to retrieve the authoritative state. */
export const publishRoomUpdated = (roomId: string) => publish(roomChannel(roomId), ROOM_UPDATED);

export const getRoomEventChannel = roomChannel;
