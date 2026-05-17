'use client';

import { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import SoundMenu from './SoundMenu';

const SettingsBar = () => {
  const { theme, locale, sound, setTheme, setLocale } = useSettings();
  const [showSound, setShowSound] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allOff = !sound.movesEnabled && !sound.eventsEnabled && !sound.uiEnabled;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSound(false);
      }
    };
    if (showSound) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSound]);

  return (
    <div className="fixed top-3 right-3 z-50 flex gap-2">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg hover:scale-110 transition-transform"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button
        onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-bold hover:scale-110 transition-transform"
        aria-label="Toggle language"
      >
        {locale === 'en' ? 'PT' : 'EN'}
      </button>
      <div ref={ref} className="relative">
        <button
          onClick={() => setShowSound(!showSound)}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg hover:scale-110 transition-transform"
          aria-label="Sound settings"
        >
          {allOff || sound.volume === 0 ? '🔇' : '🔊'}
        </button>
        {showSound && <SoundMenu />}
      </div>
    </div>
  );
};

export default SettingsBar;
