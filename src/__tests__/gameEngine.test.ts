import { describe, it, expect } from 'vitest';
import { calculateWinner, checkDraw, computeGameResult, makeMove } from '@/domain/gameEngine';
import { BoardState } from '@/domain/types';

describe('calculateWinner', () => {
  it('returns null for empty board', () => {
    expect(calculateWinner(Array(9).fill(null))).toBeNull();
  });

  it('returns X for top row', () => {
    const board: BoardState = ['X', 'X', 'X', null, null, null, null, null, null];
    expect(calculateWinner(board)).toBe('X');
  });

  it('returns O for middle row', () => {
    const board: BoardState = [null, null, null, 'O', 'O', 'O', null, null, null];
    expect(calculateWinner(board)).toBe('O');
  });

  it('returns X for bottom row', () => {
    const board: BoardState = [null, null, null, null, null, null, 'X', 'X', 'X'];
    expect(calculateWinner(board)).toBe('X');
  });

  it('returns O for left column', () => {
    const board: BoardState = ['O', null, null, 'O', null, null, 'O', null, null];
    expect(calculateWinner(board)).toBe('O');
  });

  it('returns X for main diagonal', () => {
    const board: BoardState = ['X', null, null, null, 'X', null, null, null, 'X'];
    expect(calculateWinner(board)).toBe('X');
  });

  it('returns O for anti diagonal', () => {
    const board: BoardState = [null, null, 'O', null, 'O', null, 'O', null, null];
    expect(calculateWinner(board)).toBe('O');
  });

  it('returns null when no winner yet', () => {
    const board: BoardState = ['X', 'O', null, null, 'X', null, null, null, 'O'];
    expect(calculateWinner(board)).toBeNull();
  });
});

describe('checkDraw', () => {
  it('returns true when board is full with no winner', () => {
    const board: BoardState = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(checkDraw(board)).toBe(true);
  });

  it('returns false when there is a winner', () => {
    const board: BoardState = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    expect(checkDraw(board)).toBe(false);
  });

  it('returns false when board has empty spots', () => {
    const board: BoardState = ['X', null, null, null, null, null, null, null, null];
    expect(checkDraw(board)).toBe(false);
  });

  it('returns false for empty board', () => {
    expect(checkDraw(Array(9).fill(null))).toBe(false);
  });
});

describe('computeGameResult', () => {
  it('returns null for empty board', () => {
    expect(computeGameResult(Array(9).fill(null))).toBeNull();
  });

  it('returns null while the game is still ongoing', () => {
    const board: BoardState = ['X', 'O', null, null, 'X', null, null, null, 'O'];
    expect(computeGameResult(board)).toBeNull();
  });

  it('returns the winning player when there is a winner', () => {
    const board: BoardState = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    expect(computeGameResult(board)).toBe('X');
  });

  it('returns "BOTH" on a full board with no winner (draw)', () => {
    const board: BoardState = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(computeGameResult(board)).toBe('BOTH');
  });

  it('prefers a winner over a full board (no false draw)', () => {
    const board: BoardState = ['X', 'O', 'X', 'X', 'X', 'O', 'O', 'X', 'X'];
    expect(computeGameResult(board)).toBe('X');
  });
});

describe('makeMove', () => {
  it('places player on empty cell', () => {
    const board: BoardState = Array(9).fill(null);
    const result = makeMove(board, 4, 'X');
    expect(result[4]).toBe('X');
  });

  it('does not mutate the original board', () => {
    const board: BoardState = Array(9).fill(null);
    makeMove(board, 4, 'X');
    expect(board[4]).toBeNull();
  });

  it('returns same board if cell is already occupied', () => {
    const board: BoardState = ['X', null, null, null, null, null, null, null, null];
    const result = makeMove(board, 0, 'O');
    expect(result[0]).toBe('X');
    expect(result).toEqual(board);
  });

  it('preserves other cells', () => {
    const board: BoardState = ['X', null, 'O', null, null, null, null, null, null];
    const result = makeMove(board, 1, 'X');
    expect(result[0]).toBe('X');
    expect(result[1]).toBe('X');
    expect(result[2]).toBe('O');
  });
});
