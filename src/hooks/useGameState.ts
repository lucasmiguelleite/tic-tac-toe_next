'use client';

import { useState, useCallback, useMemo } from 'react';
import { BoardState, GameResult, Player } from '@/domain/types';
import { makeMove as engineMakeMove, computeGameResult } from '@/domain/gameEngine';

export const useGameState = () => {
  const [squares, setSquares] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  // winner is derived from the board, not stored — avoids setState-in-effect.
  const winner = useMemo<GameResult>(() => computeGameResult(squares), [squares]);

  const makeMove = useCallback((index: number) => {
    setSquares((prev) => engineMakeMove(prev, index, currentPlayer));
    setCurrentPlayer((p) => (p === 'X' ? 'O' : 'X'));
  }, [currentPlayer]);

  const restart = useCallback(() => {
    setSquares(Array(9).fill(null));
    setCurrentPlayer('X');
  }, []);

  return { squares, currentPlayer, winner, makeMove, restart };
};
