import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';

const wrapper = ({ children }: { children: React.ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  window.matchMedia = vi.fn().mockReturnValue({ matches: false } as MediaQueryList);
});

describe('useSettings', () => {
  it('defaults to light theme when no preference stored', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('defaults to dark theme when system prefers dark', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.theme).toBe('dark');
    vi.restoreAllMocks();
  });

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setTheme('dark'));
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('defaults to en locale when navigator.language is not pt', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.locale).toBe('en');
  });

  it('defaults to pt locale when navigator.language starts with pt', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt-BR');
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.locale).toBe('pt');
    vi.restoreAllMocks();
  });

  it('persists locale to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setLocale('pt'));
    expect(localStorage.getItem('locale')).toBe('pt');
  });

  it('defaults boardStyle to classic', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.boardStyle).toBe('classic');
  });

  it('persists boardStyle to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setBoardStyle('neon'));
    expect(localStorage.getItem('boardStyle')).toBe('neon');
  });

  it('t() translates with current locale', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.t('site.title')).toBe('Tic-Tac-Toe #');
    act(() => result.current.setLocale('pt'));
    expect(result.current.t('site.title')).toBe('Jogo da Velha #');
  });

  it('sound defaults are applied', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    expect(result.current.sound.volume).toBe(80);
    expect(result.current.sound.movesEnabled).toBe(true);
  });

  it('persists sound settings to localStorage', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    act(() => result.current.setSound({ ...result.current.sound, volume: 50 }));
    const stored = JSON.parse(localStorage.getItem('soundSettings')!);
    expect(stored.volume).toBe(50);
  });
});
