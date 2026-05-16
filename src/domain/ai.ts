import { BoardState, Difficulty, Player } from './types';
import { calculateWinner } from './gameEngine';

const minimax = (
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player,
): number => {
  const result = calculateWinner(board);
  if (result === aiPlayer) return 10 - depth;
  if (result === humanPlayer) return depth - 10;
  if (board.every((cell) => cell !== null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiPlayer;
        best = Math.max(best, minimax(board, depth + 1, false, aiPlayer, humanPlayer));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = humanPlayer;
        best = Math.min(best, minimax(board, depth + 1, true, aiPlayer, humanPlayer));
        board[i] = null;
      }
    }
    return best;
  }
};

const optimalMove = (board: BoardState, aiPlayer: Player, humanPlayer: Player): number => {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiPlayer;
      const score = minimax(board, 0, false, aiPlayer, humanPlayer);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

const randomMove = (board: BoardState, aiPlayer: Player): number => {
  const available = board.reduce<number[]>((acc, cell, i) => {
    if (!cell) acc.push(i);
    return acc;
  }, []);
  if (available.length === 0) return -1;
  return available[Math.floor(Math.random() * available.length)];
};

type DifficultyStrategy = (board: BoardState, aiPlayer: Player, humanPlayer: Player) => number;

const difficultyStrategies: Record<Difficulty, DifficultyStrategy> = {
  easy: (board, aiPlayer, _humanPlayer) =>
    Math.random() < 0.6 ? randomMove(board, aiPlayer) : optimalMove(board, aiPlayer, _humanPlayer),
  medium: (board, aiPlayer, humanPlayer) =>
    Math.random() < 0.3 ? randomMove(board, aiPlayer) : optimalMove(board, aiPlayer, humanPlayer),
  hard: (board, aiPlayer, humanPlayer) =>
    optimalMove(board, aiPlayer, humanPlayer),
};

export const bestMove = (
  board: BoardState,
  aiPlayer: Player,
  humanPlayer: Player,
  difficulty: Difficulty,
): number => {
  const copy: BoardState = [...board];
  const strategy = difficultyStrategies[difficulty];
  return strategy(copy, aiPlayer, humanPlayer);
};
