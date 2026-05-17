'use client';

import { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

const SettingsBar = () => {
  const { theme, locale, sound, setTheme, setLocale, setSound, t } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const allOff = !sound.movesEnabled && !sound.eventsEnabled && !sound.uiEnabled;

  return (
    <div ref={ref} className="fixed top-3 right-3 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg hover:scale-110 transition-transform"
        aria-label="Settings"
      >
        ⚙️
      </button>

      {open && (
        <div className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 flex flex-col gap-4">
          <p className="font-bold text-lg text-center">{t('settings.title')}</p>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('settings.theme')}</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1 text-sm rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('settings.language')}</span>
            <button
              onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
              className="px-3 py-1 text-sm rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {locale === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
            </button>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Volume */}
          <div className="flex items-center justify-between">
            <span className="text-sm">{t('sound.volume')}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sound.volume}
              onChange={(e) => setSound({ ...sound, volume: Number(e.target.value) })}
              className="w-24 accent-blue-500"
            />
          </div>

          {/* Sound toggles */}
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
      )}
    </div>
  );
};

export default SettingsBar;
