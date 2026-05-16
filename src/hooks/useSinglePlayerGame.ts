'use client';

import { useState, useEffect, useCallback } from 'react';
import { BoardState, Difficulty, GameResult, Player } from '@/domain/types';
import { calculateWinner, checkDraw, makeMove as engineMakeMove } from '@/domain/gameEngine';
import { bestMove } from '@/domain/ai';

export const useSinglePlayerGame = () => {
  const [squares, setSquares] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<GameResult>(null);
  const [player, setPlayer] = useState<Player>('X');
  const [aiPlayer, setAiPlayer] = useState<Player>('O');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [difficultySelected, setDifficultySelected] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(false);

  useEffect(() => {
    const result = calculateWinner(squares);
    if (result) {
      setWinner(result);
      return;
    }
    if (checkDraw(squares)) {
      setWinner('BOTH');
      return;
    }
    if (aiPlayer === currentPlayer && playerSelected) {
      const move = bestMove(squares, aiPlayer, player, difficulty);
      if (move !== -1) {
        const timeout = setTimeout(() => {
          setSquares((prev) => engineMakeMove(prev, move, aiPlayer));
          setCurrentPlayer((p) => (p === 'X' ? 'O' : 'X'));
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [squares, aiPlayer, currentPlayer, player, difficulty, playerSelected]);

  const makeMove = useCallback((index: number) => {
    if (currentPlayer !== player) return;
    setSquares((prev) => {
      if (prev[index]) return prev;
      return prev.map((cell, i) => (i === index ? currentPlayer : cell));
    });
    setCurrentPlayer((p) => (p === 'X' ? 'O' : 'X'));
  }, [currentPlayer, player]);

  const restart = useCallback(() => {
    setSquares(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
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
    makeMove,
    restart,
    difficultySelected,
    playerSelected,
    selectDifficulty,
    selectPlayer,
  };
};
