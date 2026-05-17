'use client';

import { useSettings } from '@/context/SettingsContext';
import { playExitWarning } from '@/utils/sounds';

const GameActions = ({ onRestart, onExit }: { onRestart: () => void; onExit: () => void }) => {
  const { t } = useSettings();
  return (
    <div className="flex flex-wrap md:flex-nowrap justify-center">
      <button
        className="border-0 border-black w-40 mt-3 mx-2 text-4xl bg-blue-200 dark:bg-blue-900 hover:bg-blue-400 dark:hover:bg-blue-700 rounded-md p-1 cursor-pointer"
        onClick={onRestart}
      >
        {t('actions.restart')}
      </button>
      <button
        className="border-0 border-black w-40 mt-3 mx-2 text-4xl bg-blue-200 dark:bg-blue-900 hover:bg-blue-400 dark:hover:bg-blue-700 rounded-md p-1 cursor-pointer"
        onClick={() => { playExitWarning(); onExit(); }}
      >
        {t('actions.exit')}
      </button>
    </div>
  );
};

export default GameActions;
