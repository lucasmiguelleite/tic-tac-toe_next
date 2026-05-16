import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '@/hooks/useGameState';

describe('useGameState', () => {
  it('starts with empty board, X as current player, no winner', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.squares).toEqual(Array(9).fill(null));
    expect(result.current.currentPlayer).toBe('X');
    expect(result.current.winner).toBeNull();
  });

  it('places X on empty cell and switches to O', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.makeMove(4));
    expect(result.current.squares[4]).toBe('X');
    expect(result.current.currentPlayer).toBe('O');
  });

  it('does not overwrite an occupied cell', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.makeMove(4));
    act(() => result.current.makeMove(4));
    expect(result.current.squares[4]).toBe('X');
  });

  it('detects a win', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.makeMove(0)); // X
    act(() => result.current.makeMove(3)); // O
    act(() => result.current.makeMove(1)); // X
    act(() => result.current.makeMove(4)); // O
    act(() => result.current.makeMove(2)); // X wins top row
    expect(result.current.winner).toBe('X');
  });

  it('detects a draw', () => {
    const { result } = renderHook(() => useGameState());
    // X O X | X O O | O X X — no winner
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
    for (const m of moves) {
      act(() => result.current.makeMove(m));
    }
    expect(result.current.winner).toBe('BOTH');
  });

  it('restart resets the game', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.makeMove(0));
    act(() => result.current.restart());
    expect(result.current.squares).toEqual(Array(9).fill(null));
    expect(result.current.currentPlayer).toBe('X');
    expect(result.current.winner).toBeNull();
  });
});
