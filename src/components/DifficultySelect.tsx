'use client';

import { Difficulty } from '@/domain/types';
import { useSettings } from '@/context/SettingsContext';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

const DifficultySelect = ({ onSelect }: { onSelect: (d: Difficulty) => void }) => {
  const { t } = useSettings();
  return (
    <div className="relative">
      <div className="static grid grid-cols-1 mx-10 h-max md:mt-52">
        <div className="inline-flex justify-center">
          <p className="font-bold text-4xl mb-10 text-center">{t('difficulty.title')}</p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap justify-center mb-12">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => onSelect(d)}
              className="border border-gray-300 dark:border-gray-600 rounded-full mr-2 mb-2 md:mb-0 text-center w-52 h-20 hover:bg-gray-600 hover:text-white dark:hover:bg-gray-500"
            >
              <p className="font-bold text-2xl">{t(`difficulty.${d}`)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DifficultySelect;
