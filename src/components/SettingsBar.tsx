'use client';

import { useSettings } from '@/context/SettingsContext';

const SettingsBar = () => {
  const { theme, locale, setTheme, setLocale } = useSettings();

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
    </div>
  );
};

export default SettingsBar;
