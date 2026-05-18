'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Locale } from '@/i18n/translations';
import { translate } from '@/i18n/translations';
import { updateSoundCache } from '@/utils/sounds';

type Theme = 'light' | 'dark';
export type BoardStyle = 'classic' | 'paper' | 'neon' | 'chalk';

export type SoundSettings = {
  volume: number;
  movesEnabled: boolean;
  eventsEnabled: boolean;
  uiEnabled: boolean;
};

const defaultSoundSettings: SoundSettings = {
  volume: 80,
  movesEnabled: true,
  eventsEnabled: true,
  uiEnabled: true,
};

type SettingsContextType = {
  theme: Theme;
  locale: Locale;
  sound: SoundSettings;
  boardStyle: BoardStyle;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  setSound: (settings: SoundSettings) => void;
  setBoardStyle: (style: BoardStyle) => void;
  t: (key: string, params?: Record<string, string>) => string;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

const LoadingBar = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
    <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className="loading-bar h-full bg-blue-500 rounded-full" />
    </div>
  </div>
);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const useTranslation = () => {
  const { t, locale } = useSettings();
  return { t, locale };
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [locale, setLocaleState] = useState<Locale>('en');
  const [sound, setSoundState] = useState<SoundSettings>(defaultSoundSettings);
  const [boardStyle, setBoardStyleState] = useState<BoardStyle>('classic');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    const storedSound = localStorage.getItem('soundSettings');

    const initialTheme = storedTheme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const initialLocale = storedLocale ||
      (navigator.language.startsWith('pt') ? 'pt' : 'en');
    const initialSound = storedSound ? { ...defaultSoundSettings, ...JSON.parse(storedSound) } : defaultSoundSettings;
    const initialBoardStyle = (localStorage.getItem('boardStyle') as BoardStyle) || 'classic';

    setThemeState(initialTheme);
    setLocaleState(initialLocale);
    setSoundState(initialSound);
    updateSoundCache(initialSound);
    setBoardStyleState(initialBoardStyle);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    setReady(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  }, []);

  const setSound = useCallback((s: SoundSettings) => {
    setSoundState(s);
    updateSoundCache(s);
    localStorage.setItem('soundSettings', JSON.stringify(s));
  }, []);

  const setBoardStyle = useCallback((style: BoardStyle) => {
    setBoardStyleState(style);
    localStorage.setItem('boardStyle', style);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    return translate(locale, key, params);
  }, [locale]);

  const value = useMemo(() => ({ theme, locale, sound, boardStyle, setTheme, setLocale, setSound, setBoardStyle, t }), [theme, locale, sound, boardStyle, setTheme, setLocale, setSound, setBoardStyle, t]);

  if (!ready) return <LoadingBar />;

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
