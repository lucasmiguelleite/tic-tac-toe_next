'use client';

import { Player } from '@/domain/types';
import { useTranslation } from '@/context/SettingsContext';

const players: Player[] = ['X', 'O'];

const PlayerSelect = ({ onSelect, onBack }: { onSelect: (p: Player) => void; onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
        <div className="inline-flex justify-center">
          <p className="font-bold text-4xl mb-10 text-center">{t('player.select')}</p>
        </div>
        <div className="flex justify-center">
          {players.map((p) => (
            <button
              key={p}
              onClick={() => onSelect(p)}
              className="border border-gray-300 dark:border-gray-600 rounded-full mr-2 text-center w-52 h-20 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
            >
              <p className="font-bold text-2xl">{p}</p>
            </button>
          ))}
        </div>
        <div className="flex justify-center mt-4 mb-12">
          <button
            type="button"
            onClick={onBack}
            className="border border-gray-300 dark:border-gray-600 rounded-full text-center w-52 h-20 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
          >
            <p className="font-bold text-2xl">{t('actions.back')}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelect;
