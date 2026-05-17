import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { BoardState, GameResult } from '@/domain/types';

vi.mock('@/utils/sounds', () => ({
  playWin: vi.fn(),
  playLose: vi.fn(),
  playDraw: vi.fn(),
  playMove: vi.fn(),
}));

import { playWin, playLose, playDraw, playMove } from '@/utils/sounds';

const mocked = {
  playWin: vi.mocked(playWin),
  playLose: vi.mocked(playLose),
  playDraw: vi.mocked(playDraw),
  playMove: vi.mocked(playMove),
};

beforeEach(() => {
  vi.clearAllMocks();
});

const emptyBoard: BoardState = Array(9).fill(null);

describe('useGameSounds', () => {
  it('plays win when winner changes to a player (no playerRole)', () => {
    const props = { squares: emptyBoard, winner: null as GameResult };
    const { rerender } = renderHook(({ squares, winner }) => useGameSounds({ squares, winner }), {
      initialProps: props,
    });
    rerender({ squares: emptyBoard, winner: 'X' });
    expect(mocked.playWin).toHaveBeenCalledTimes(1);
  });

  it('plays win when winner === playerRole', () => {
    const props = { squares: emptyBoard, winner: null as GameResult, playerRole: 'X' as const };
    const { rerender } = renderHook(
      ({ squares, winner, playerRole }) => useGameSounds({ squares, winner, playerRole }),
      { initialProps: props },
    );
    rerender({ squares: emptyBoard, winner: 'X', playerRole: 'X' });
    expect(mocked.playWin).toHaveBeenCalledTimes(1);
    expect(mocked.playLose).not.toHaveBeenCalled();
  });

  it('plays lose when winner !== playerRole', () => {
    const props = { squares: emptyBoard, winner: null as GameResult, playerRole: 'X' as const };
    const { rerender } = renderHook(
      ({ squares, winner, playerRole }) => useGameSounds({ squares, winner, playerRole }),
      { initialProps: props },
    );
    rerender({ squares: emptyBoard, winner: 'O', playerRole: 'X' });
    expect(mocked.playLose).toHaveBeenCalledTimes(1);
    expect(mocked.playWin).not.toHaveBeenCalled();
  });

  it('plays draw when winner is BOTH', () => {
    const props = { squares: emptyBoard, winner: null as GameResult };
    const { rerender } = renderHook(({ squares, winner }) => useGameSounds({ squares, winner }), {
      initialProps: props,
    });
    rerender({ squares: emptyBoard, winner: 'BOTH' });
    expect(mocked.playDraw).toHaveBeenCalledTimes(1);
  });

  it('does not replay win if winner has not changed', () => {
    const props = { squares: emptyBoard, winner: null as GameResult };
    const { rerender } = renderHook(({ squares, winner }) => useGameSounds({ squares, winner }), {
      initialProps: props,
    });
    rerender({ squares: emptyBoard, winner: 'X' });
    rerender({ squares: emptyBoard, winner: 'X' });
    expect(mocked.playWin).toHaveBeenCalledTimes(1);
  });

  it('plays move when a new square is placed', () => {
    const board2: BoardState = [...emptyBoard];
    board2[4] = 'X';

    const { rerender } = renderHook(
      ({ squares, winner }) => useGameSounds({ squares, winner }),
      { initialProps: { squares: emptyBoard, winner: null as GameResult } },
    );
    rerender({ squares: board2, winner: null });
    expect(mocked.playMove).toHaveBeenCalledTimes(1);
  });

  it('does not play move when squares change without new placement', () => {
    const board1: BoardState = [...emptyBoard];
    board1[0] = 'X';
    const board2: BoardState = [...board1];

    const { rerender } = renderHook(
      ({ squares, winner }) => useGameSounds({ squares, winner }),
      { initialProps: { squares: board1, winner: null as GameResult } },
    );
    rerender({ squares: board2, winner: null });
    expect(mocked.playMove).not.toHaveBeenCalled();
  });
});
