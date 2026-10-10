import { clearKeys, deleteValue, getKeys, setValue } from './onlineStorage';

const PRESENCE_PREFIX = 'tic-tac-toe:presence:';
const PRESENCE_TTL_SECONDS = 45;

const presenceKey = (presenceId: string) => `${PRESENCE_PREFIX}${presenceId}`;

export const markPlayerOnline = async (presenceId: string): Promise<void> => {
  await setValue(presenceKey(presenceId), true, PRESENCE_TTL_SECONDS);
};

export const markPlayerOffline = async (presenceId: string): Promise<boolean> => (
  deleteValue(presenceKey(presenceId))
);

export const getOnlinePlayerCount = async (): Promise<number> => (
  (await getKeys(`${PRESENCE_PREFIX}*`)).length
);

export const clearPresence = async (): Promise<void> => {
  await clearKeys(`${PRESENCE_PREFIX}*`);
};
