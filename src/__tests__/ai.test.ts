import { describe, it, expect } from 'vitest';
import { bestMove } from '@/domain/ai';
import { BoardState } from '@/domain/types';

describe('bestMove (hard)', () => {
  it('takes the winning move', () => {
    const board: BoardState = ['O', 'O', null, null, null, null, null, null, null];
    expect(bestMove(board, 'O', 'X', 'hard')).toBe(2);
  });

  it('blocks opponent from winning', () => {
    const board: BoardState = ['X', 'X', null, null, null, null, null, null, null];
    expect(bestMove(board, 'O', 'X', 'hard')).toBe(2);
  });

  it('picks a valid optimal move on empty board', () => {
    const board: BoardState = Array(9).fill(null);
    const move = bestMove(board, 'O', 'X', 'hard');
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });

  it('does not mutate the board', () => {
    const board: BoardState = [null, null, null, null, null, null, null, null, null];
    const copy = [...board];
    bestMove(board, 'O', 'X', 'hard');
    expect(board).toEqual(copy);
  });

  it('returns a valid move index when moves are available', () => {
    const board: BoardState = ['X', 'O', 'X', 'O', 'X', 'O', null, null, null];
    const move = bestMove(board, 'O', 'X', 'hard');
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
    expect(board[move]).toBeNull();
  });
});

describe('bestMove (easy)', () => {
  it('returns a valid index on an empty spot', () => {
    const board: BoardState = Array(9).fill(null);
    const move = bestMove(board, 'O', 'X', 'easy');
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });

  it('does not mutate the board', () => {
    const board: BoardState = Array(9).fill(null);
    const copy = [...board];
    bestMove(board, 'O', 'X', 'easy');
    expect(board).toEqual(copy);
  });
});

describe('bestMove (medium)', () => {
  it('returns a valid index on an empty spot', () => {
    const board: BoardState = Array(9).fill(null);
    const move = bestMove(board, 'O', 'X', 'medium');
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });
});

describe('bestMove (full board)', () => {
  it('returns -1 when no moves available', () => {
    const board: BoardState = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(bestMove(board, 'O', 'X', 'hard')).toBe(-1);
  });
});
