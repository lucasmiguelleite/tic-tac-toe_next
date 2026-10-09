'use client';

import { useState, useCallback, useMemo } from 'react';
import { BoardState, GameResult, Player } from '@/domain/types';
import { createEmptyBoard, isValidMove, makeMove as engineMakeMove, computeGameResult, otherPlayer } from '@/domain/gameEngine';

export const useGameState = () => {
  const [squares, setSquares] = useState<BoardState>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  // winner is derived from the board, not stored — avoids setState-in-effect.
  const winner = useMemo<GameResult>(() => computeGameResult(squares), [squares]);

  const makeMove = useCallback((index: number) => {
    if (winner !== null || !isValidMove(squares, index)) return;
    setSquares((prev) => engineMakeMove(prev, index, currentPlayer));
    setCurrentPlayer(otherPlayer(currentPlayer));
  }, [currentPlayer, squares, winner]);

  const restart = useCallback(() => {
    setSquares(createEmptyBoard());
    setCurrentPlayer('X');
  }, []);

  return { squares, currentPlayer, winner, makeMove, restart };
};
