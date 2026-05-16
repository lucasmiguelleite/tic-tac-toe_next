'use client';

import { useState, useEffect, useCallback } from 'react';
import { BoardState, GameResult, Player } from '@/domain/types';
import { calculateWinner, checkDraw, makeMove as engineMakeMove } from '@/domain/gameEngine';

export const useGameState = () => {
  const [squares, setSquares] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<GameResult>(null);

  useEffect(() => {
    const result = calculateWinner(squares);
    if (result) {
      setWinner(result);
    } else if (checkDraw(squares)) {
      setWinner('BOTH');
    }
  }, [squares]);

  const makeMove = useCallback((index: number) => {
    setSquares((prev) => {
      const next = engineMakeMove(prev, index, currentPlayer);
      if (next === prev) return prev;
      setCurrentPlayer((p) => (p === 'X' ? 'O' : 'X'));
      return next;
    });
  }, [currentPlayer]);

  const restart = useCallback(() => {
    setSquares(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  }, []);

  return { squares, currentPlayer, winner, makeMove, restart };
};
