import { BoardState, GameResult, OnlineRoomState, Player, QueueEntry } from '@/domain/types';
import { fetchWithRetry } from './fetchWithRetry';

type ApiError = { error?: string };
type CreateRoomResponse = { roomId: string; playerId: string; playerRole: Player; nickname: string };
type JoinRoomResponse = CreateRoomResponse;
type QueueResponse = Pick<QueueEntry, 'queueId' | 'matched' | 'matchResult'>;
type MoveResponse = { currentPlayer: Player; winner: GameResult };
type RestartResponse = { waitingForOpponent: boolean; board?: BoardState; currentPlayer?: Player; winner?: null };

const json = async <T>(input: string, init?: RequestInit): Promise<{ response: Response; data: T & ApiError }> => {
  const response = await fetchWithRetry(input, init);
  return { response, data: await response.json() as T & ApiError };
};

const post = <T>(path: string, body: unknown) => json<T>(path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

export const onlineApi = {
  createRoom: (nickname?: string) => post<CreateRoomResponse>('/api/online/room/create', { nickname }),
  joinRoom: (roomId: string, nickname?: string) => post<JoinRoomResponse>('/api/online/room/join', { roomId, nickname }),
  enterQueue: (nickname?: string) => post<QueueResponse>('/api/online/queue/enter', { nickname }),
  exitQueue: (queueId: string) => post<{ success: boolean }>('/api/online/queue/exit', { queueId }),
  roomState: (roomId: string, playerId: string) => json<OnlineRoomState>(`/api/online/room/state?${new URLSearchParams({ roomId, playerId })}`),
  move: (roomId: string, playerId: string, index: number) => post<MoveResponse>('/api/online/room/move', { roomId, playerId, index }),
  restart: (roomId: string, playerId: string) => post<RestartResponse>('/api/online/room/restart', { roomId, playerId }),
};
