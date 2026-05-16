'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Locale } from '@/i18n/translations';
import { translate } from '@/i18n/translations';

type Theme = 'light' | 'dark';

type SettingsContextType = {
  theme: Theme;
  locale: Locale;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const storedLocale = localStorage.getItem('locale') as Locale | null;

    const initialTheme = storedTheme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const initialLocale = storedLocale ||
      (navigator.language.startsWith('pt') ? 'pt' : 'en');

    setThemeState(initialTheme);
    setLocaleState(initialLocale);
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

  const t = useCallback((key: string, params?: Record<string, string>) => {
    return translate(locale, key, params);
  }, [locale]);

  const value = useMemo(() => ({ theme, locale, setTheme, setLocale, t }), [theme, locale, setTheme, setLocale, t]);

  if (!ready) return null;

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
