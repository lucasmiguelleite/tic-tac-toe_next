'use client';

import { useSettings } from '@/context/SettingsContext';

const SoundMenu = () => {
  const { sound, setSound, t } = useSettings();

  const allOff = !sound.movesEnabled && !sound.eventsEnabled && !sound.uiEnabled;

  const toggleAll = () => {
    const on = !allOff;
    setSound({ ...sound, movesEnabled: on, eventsEnabled: on, uiEnabled: on });
  };

  return (
    <div className="absolute top-12 right-0 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 flex flex-col gap-3 z-50">
      <button onClick={toggleAll} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 self-end">
        {allOff ? t('sound.volume') + ': OFF' : '✓ All'}
      </button>

      <label className="flex items-center justify-between text-sm">
        <span>{t('sound.volume')}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={sound.volume}
          onChange={(e) => setSound({ ...sound, volume: Number(e.target.value) })}
          className="w-24 accent-blue-500"
        />
      </label>

      <hr className="border-gray-200 dark:border-gray-700" />

      <label className="flex items-center justify-between text-sm cursor-pointer">
        <span>{t('sound.moves')}</span>
        <input
          type="checkbox"
          checked={sound.movesEnabled}
          onChange={(e) => setSound({ ...sound, movesEnabled: e.target.checked })}
          className="accent-blue-500 w-4 h-4"
        />
      </label>

      <label className="flex items-center justify-between text-sm cursor-pointer">
        <span>{t('sound.events')}</span>
        <input
          type="checkbox"
          checked={sound.eventsEnabled}
          onChange={(e) => setSound({ ...sound, eventsEnabled: e.target.checked })}
          className="accent-blue-500 w-4 h-4"
        />
      </label>

      <label className="flex items-center justify-between text-sm cursor-pointer">
        <span>{t('sound.ui')}</span>
        <input
          type="checkbox"
          checked={sound.uiEnabled}
          onChange={(e) => setSound({ ...sound, uiEnabled: e.target.checked })}
          className="accent-blue-500 w-4 h-4"
        />
      </label>
    </div>
  );
};

export default SoundMenu;
