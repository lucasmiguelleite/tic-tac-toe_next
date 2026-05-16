export type Player = 'X' | 'O';
export type GameResult = Player | 'BOTH' | null;
export type BoardState = (Player | null)[];
export type Difficulty = 'easy' | 'medium' | 'hard';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export type Room = {
  roomId: string;
  status: RoomStatus;
  board: BoardState;
  currentPlayer: Player;
  winner: GameResult;
  playerX: string | null;
  playerO: string | null;
  nicknameX: string;
  nicknameO: string;
  lastSeenX: number;
  lastSeenO: number;
  restartRequestedBy: Player | null;
  disconnected: Player | null;
  createdAt: number;
};

export type QueueEntry = {
  queueId: string;
  matched: boolean;
  matchResult: {
    roomId: string;
    playerId: string;
    playerRole: Player;
  } | null;
  nickname?: string;
  enteredAt: number;
};

export type OnlinePhase =
  | 'select-mode'
  | 'creating-room'
  | 'lobby'
  | 'joining-room'
  | 'in-queue'
  | 'matched'
  | 'playing'
  | 'opponent-disconnected'
  | 'error';
