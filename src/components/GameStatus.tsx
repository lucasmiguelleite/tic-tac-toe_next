'use client';

import { GameResult, Player } from '@/domain/types';
import { useTranslation } from '@/context/SettingsContext';

type LocalGameStatusProps = {
  winner: GameResult;
  currentPlayer: Player;
};

type OnlineGameStatusProps = LocalGameStatusProps & {
  yourRole: Player;
  opponentConnected: boolean;
  opponentNickname: string;
  yourNickname: string;
  waitingForOpponentRestart: boolean;
};

const GameStatusInner = ({
  winner,
  currentPlayer,
  yourRole,
  opponentConnected,
  opponentNickname,
  yourNickname,
  waitingForOpponentRestart,
}: LocalGameStatusProps & { yourRole?: Player; opponentConnected?: boolean; opponentNickname?: string; yourNickname?: string; waitingForOpponentRestart?: boolean }) => {
  const { t } = useTranslation();

  if (waitingForOpponentRestart) {
    return (
      <div className="flex justify-center text-center my-10 mx-10">
        <p className="font-bold text-3xl">{t('status.waitingRestart')}</p>
      </div>
    );
  }

  if (opponentConnected === false) {
    return (
      <div className="flex justify-center text-center my-10 mx-10">
        <p className="font-bold text-3xl text-red-500">{t('status.opponentDisconnected')}</p>
      </div>
    );
  }

  const playerName = (role: Player) => {
    if (role === yourRole && yourNickname) return yourNickname;
    if (role !== yourRole && opponentNickname) return opponentNickname;
    return `Player ${role}`;
  };

  return (
    <div className="flex justify-center text-center my-10 mx-4 sm:mx-10 max-w-full overflow-hidden">
      {!winner && (
        <p className="font-bold text-2xl sm:text-4xl text-center max-w-full break-all">
          {yourRole
            ? currentPlayer === yourRole
              ? t('status.yourTurn')
              : <span className="block truncate max-w-[60vw] sm:max-w-none mx-auto">{t('status.playerTurn', { name: playerName(currentPlayer) })}</span>
            : t('status.itsTurn', { player: currentPlayer })}
        </p>
      )}
      {winner && winner !== 'BOTH' && (
        <p className="font-bold text-4xl max-w-full">
          {yourRole
            ? winner === yourRole
              ? t('status.youWin')
              : t('status.youLose')
            : t('status.playerWins', { player: winner })}
        </p>
      )}
      {winner === 'BOTH' && <p className="font-bold text-4xl">{t('status.draw')}</p>}
    </div>
  );
};

export const LocalGameStatus = (props: LocalGameStatusProps) => <GameStatusInner {...props} />;
export const OnlineGameStatus = (props: OnlineGameStatusProps) => <GameStatusInner {...props} />;
