'use client';

import { useEffect, useRef } from 'react';
import { BoardState, GameResult, Player } from '@/domain/types';
import { playWin, playLose, playDraw, playMove } from '@/utils/sounds';

export const useGameSounds = ({
  squares,
  winner,
  playerRole,
}: {
  squares: BoardState;
  winner: GameResult;
  playerRole?: Player;
}) => {
  const prevWinnerRef = useRef<GameResult>(null);
  const prevSquaresRef = useRef<BoardState>(squares);

  useEffect(() => {
    if (winner && winner !== prevWinnerRef.current) {
      if (winner === 'BOTH') playDraw();
      else if (playerRole) winner === playerRole ? playWin() : playLose();
      else playWin();
    }
    prevWinnerRef.current = winner;
  }, [winner, playerRole]);

  useEffect(() => {
    const newPlacements = squares.some((cell, i) => cell && !prevSquaresRef.current[i]);
    if (newPlacements) playMove();
    prevSquaresRef.current = squares;
  }, [squares]);
};
