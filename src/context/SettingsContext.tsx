'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Locale } from '@/i18n/translations';
import { translate } from '@/i18n/translations';

type Theme = 'light' | 'dark';

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
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  setSound: (settings: SoundSettings) => void;
  t: (key: string, params?: Record<string, string>) => string;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [locale, setLocaleState] = useState<Locale>('en');
  const [sound, setSoundState] = useState<SoundSettings>(defaultSoundSettings);
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

    setThemeState(initialTheme);
    setLocaleState(initialLocale);
    setSoundState(initialSound);
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
    localStorage.setItem('soundSettings', JSON.stringify(s));
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    return translate(locale, key, params);
  }, [locale]);

  const value = useMemo(() => ({ theme, locale, sound, setTheme, setLocale, setSound, t }), [theme, locale, sound, setTheme, setLocale, setSound, t]);

  if (!ready) return null;

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
