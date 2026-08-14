'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BoardState, Difficulty, GameResult, Player } from '@/domain/types';
import { makeMove as engineMakeMove, computeGameResult } from '@/domain/gameEngine';
import { bestMove } from '@/domain/ai';

export const useSinglePlayerGame = () => {
  const [squares, setSquares] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [player, setPlayer] = useState<Player>('X');
  const [aiPlayer, setAiPlayer] = useState<Player>('O');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [difficultySelected, setDifficultySelected] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(false);

  // winner is derived from the board, not stored — avoids setState-in-effect.
  const winner = useMemo<GameResult>(() => computeGameResult(squares), [squares]);

  // Effect's only job is the AI side-effect (scheduling its move); game-over is
  // read from the derived `winner` instead of calling setState here.
  useEffect(() => {
    if (winner !== null) return;
    if (!playerSelected) return;
    if (aiPlayer !== currentPlayer) return;
    const move = bestMove(squares, aiPlayer, player, difficulty);
    if (move === -1) return;
    const timeout = setTimeout(() => {
      setSquares((prev) => engineMakeMove(prev, move, aiPlayer));
      setCurrentPlayer((p) => (p === 'X' ? 'O' : 'X'));
    }, 100);
    return () => clearTimeout(timeout);
  }, [squares, winner, aiPlayer, currentPlayer, player, difficulty, playerSelected]);

  const makeMove = useCallback((index: number) => {
    if (currentPlayer !== player) return;
    setSquares((prev) => engineMakeMove(prev, index, currentPlayer));
    setCurrentPlayer((p) => (p === 'X' ? 'O' : 'X'));
  }, [currentPlayer, player]);

  const restart = useCallback(() => {
    setSquares(Array(9).fill(null));
    setCurrentPlayer('X');
  }, []);

  const selectDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setDifficultySelected(true);
  }, []);

  const selectPlayer = useCallback((p: Player) => {
    setPlayer(p);
    setAiPlayer(p === 'X' ? 'O' : 'X');
    setPlayerSelected(true);
  }, []);

  return {
    squares,
    currentPlayer,
    winner,
    player,
    makeMove,
    restart,
    difficultySelected,
    playerSelected,
    selectDifficulty,
    selectPlayer,
  };
};
