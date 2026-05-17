'use client';

import { useState } from 'react';
import { Player } from '@/domain/types';
import { useSettings } from '@/context/SettingsContext';
import { playExitWarning } from '@/utils/sounds';

const OnlineGameActions = ({
  onExit,
  showPlayAgain,
  onPlayAgain,
  restartRequestedBy,
  yourRole,
}: {
  onExit: () => void;
  showPlayAgain?: boolean;
  onPlayAgain?: () => void;
  restartRequestedBy: Player | null;
  yourRole: Player | null;
}) => {
  const { t } = useSettings();
  const [confirmExit, setConfirmExit] = useState(false);

  if (confirmExit) {
    return (
      <div className="flex flex-col items-center gap-3 mt-3">
        <p className="text-2xl font-bold">{t('online.leaveMatch')}</p>
        <div className="flex gap-3">
          <button
            className="w-36 h-10 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold text-lg cursor-pointer"
            onClick={() => { playExitWarning(); onExit(); }}
          >
            {t('online.yesLeave')}
          </button>
          <button
            className="w-28 h-10 border border-gray-300 dark:border-gray-600 rounded-md font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => setConfirmExit(false)}
          >
            {t('online.cancel')}
          </button>
        </div>
      </div>
    );
  }

  const youClicked = restartRequestedBy === yourRole;
  const opponentClicked = restartRequestedBy && restartRequestedBy !== yourRole;
  const votes = (youClicked ? 1 : 0) + (opponentClicked ? 1 : 0);

  const voteColor = votes === 0
    ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
    : votes === 1
      ? 'bg-yellow-400 text-yellow-900'
      : 'bg-green-500 text-white';

  return (
    <div className="flex flex-col items-center">
      {showPlayAgain && (
        <div className="flex flex-col items-center gap-1 mb-2 mt-3">
          <span className={`text-lg font-bold px-4 py-1 rounded-full ${voteColor}`}>{votes}/2</span>
          <button
            className="w-48 text-2xl bg-green-500 hover:bg-green-600 text-white rounded-md p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onPlayAgain}
            disabled={youClicked}
          >
            {youClicked ? t('online.waiting') : t('online.playAgain')}
          </button>
        </div>
      )}
      <button
        className="border-0 border-black w-40 mt-3 mx-2 text-2xl bg-red-400 hover:bg-red-500 text-white rounded-md p-1 cursor-pointer"
        onClick={() => { playExitWarning(); setConfirmExit(true); }}
      >
        {t('online.cancel')}
      </button>
    </div>
  );
};

export default OnlineGameActions;
