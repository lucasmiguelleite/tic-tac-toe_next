import { calculateWinner } from "./Board";

let ai: 'X' | 'O';

export const bestMove = (
  board: Array<'X' | 'O' | null>,
  player: 'X' | 'O',
) => {
  // AI to make its turn 
  let bestScore: number = -Infinity;
  let move: number = 0;
  ai = player === 'X' ? 'O' : 'X';
  for (let i: number = 0; i < 9; i++) {
    // Is the spot avaliable?
    if (board[i] == null) {
      board[i] = ai;
      let score = minimax(board, 0, false, ai);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  console.log(board[move] = ai);
  return board[move.i] = ai;
}

let scores = {
  'X': 1,
  'O': -1,
  'BOTH': 0,
}

export const minimax = (board: Array<'X' | 'O' | null>, depth: number, isMaximizing: boolean, ai: 'X' | 'O') => {
  let result = calculateWinner(board);

  if (result !== null) {
    return scores[result];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i: number = 0; i < 9; i++) {
      // Is the spot avaliable?
      if (board[i] == null) {
        board[i] = ai;
        let score = minimax(board, depth + 1, false, ai);
        board[i] = null
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    let human: 'X' | 'O' = ai === 'X' ? 'O' : 'X';

    for (let i: number = 0; i < 9; i++) {
      // Is the spot avaliable?
      if (board[i] == null) {
        board[i] = human;
        let score = minimax(board, depth + 1, true, ai);
        board[i] = null
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}