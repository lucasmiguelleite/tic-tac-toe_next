import { GameResult, Player } from '@/domain/types';

const GameStatus = ({
  winner,
  currentPlayer,
  yourRole,
  opponentConnected,
  opponentNickname,
  yourNickname,
  waitingForOpponentRestart,
}: {
  winner: GameResult;
  currentPlayer: Player;
  yourRole?: Player;
  opponentConnected?: boolean;
  opponentNickname?: string;
  yourNickname?: string;
  waitingForOpponentRestart?: boolean;
}) => {
  if (waitingForOpponentRestart) {
    return (
      <div className="flex justify-center text-center my-10 mx-10">
        <p className="font-bold text-3xl">Waiting for opponent to restart...</p>
      </div>
    );
  }

  if (opponentConnected === false) {
    return (
      <div className="flex justify-center text-center my-10 mx-10">
        <p className="font-bold text-3xl text-red-500">Opponent disconnected</p>
      </div>
    );
  }

  const playerName = (role: Player) => {
    if (role === yourRole && yourNickname) return yourNickname;
    if (role !== yourRole && opponentNickname) return opponentNickname;
    return `Player ${role}`;
  };

  return (
    <div className="flex justify-center text-center my-10 mx-10">
      {!winner && (
        <p className="font-bold text-2xl sm:text-4xl text-center max-w-full break-all">
          {yourRole
            ? currentPlayer === yourRole
              ? 'Your turn'
              : <span className="block truncate max-w-[60vw] sm:max-w-none mx-auto">{playerName(currentPlayer)}'s turn</span>
            : `It's ${currentPlayer} turn`}
        </p>
      )}
      {winner && winner !== 'BOTH' && (
        <p className="font-bold text-4xl">
          {yourRole
            ? winner === yourRole
              ? 'You win!'
              : 'You lose!'
            : `Player ${winner} is the winner`}
        </p>
      )}
      {winner === 'BOTH' && <p className="font-bold text-4xl">Draw</p>}
    </div>
  );
};

export default GameStatus;
