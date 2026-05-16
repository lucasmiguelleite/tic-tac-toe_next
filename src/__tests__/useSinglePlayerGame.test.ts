import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSinglePlayerGame } from '@/hooks/useSinglePlayerGame';

describe('useSinglePlayerGame', () => {
  it('starts in difficulty selection phase', () => {
    const { result } = renderHook(() => useSinglePlayerGame());
    expect(result.current.difficultySelected).toBe(false);
    expect(result.current.playerSelected).toBe(false);
  });

  it('advances to player selection after difficulty', () => {
    const { result } = renderHook(() => useSinglePlayerGame());
    act(() => result.current.selectDifficulty('hard'));
    expect(result.current.difficultySelected).toBe(true);
    expect(result.current.playerSelected).toBe(false);
  });

  it('enters game after player selection', () => {
    const { result } = renderHook(() => useSinglePlayerGame());
    act(() => result.current.selectDifficulty('hard'));
    act(() => result.current.selectPlayer('X'));
    expect(result.current.playerSelected).toBe(true);
    expect(result.current.squares).toEqual(Array(9).fill(null));
  });

  it('player can make a move when it is their turn', () => {
    const { result } = renderHook(() => useSinglePlayerGame());
    act(() => result.current.selectDifficulty('hard'));
    act(() => result.current.selectPlayer('X'));
    act(() => result.current.makeMove(4));
    expect(result.current.squares[4]).toBe('X');
  });

  it('player cannot move when it is not their turn', () => {
    const { result } = renderHook(() => useSinglePlayerGame());
    act(() => result.current.selectDifficulty('hard'));
    act(() => result.current.selectPlayer('O'));
    // O's turn but currentPlayer is X, so move should be ignored
    act(() => result.current.makeMove(4));
    expect(result.current.squares[4]).toBeNull();
  });

  it('restart resets the board', () => {
    const { result } = renderHook(() => useSinglePlayerGame());
    act(() => result.current.selectDifficulty('hard'));
    act(() => result.current.selectPlayer('X'));
    act(() => result.current.makeMove(0));
    act(() => result.current.restart());
    expect(result.current.squares).toEqual(Array(9).fill(null));
    expect(result.current.winner).toBeNull();
  });
});
