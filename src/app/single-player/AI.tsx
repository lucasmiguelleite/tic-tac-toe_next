import { calculateWinner } from "./Board";

let ai: 'X' | 'O';

export const bestMove = (board: Array<'X' | 'O' | null>, player: 'X' | 'O', aiPlayer: 'X' | 'O', difficulty: "easy" | "medium" | "hard",) => {
  // "Easy" mode
  if (difficulty === "easy" && Math.random() < 0.6){
      // Choose a random play 60% of the times
      const availableMoves = [];
      for (let i: number = 0; i < 9; i++){
        if(!board[i]) availableMoves.push(i);
      }
      return availableMoves.length > 0 ? board[availableMoves[Math.floor(Math.random() * availableMoves.length)]] = aiPlayer : null;
  }

  // "Medium" mode
  if (difficulty === "medium" && Math.random() < 0.3){
      // Choose a random play 30% of the times
      const availableMoves = [];
      for (let i: number = 0; i < 9; i++){
        if(board[i]==null) availableMoves.push(i);
      }
      return availableMoves.length > 0 ? board[availableMoves[Math.floor(Math.random() * availableMoves.length)]] = aiPlayer : null;
  }
  
  // "Hard" mode
  let bestScore: number = -Infinity;
  let move: number = 0;
  for (let i: number = 0; i < 9; i++) {
    // Is the spot avaliable?
    if (board[i] == null) {
      board[i] = aiPlayer;

      // 'false' leaves the 'X' impossible to defeat
      let score = minimax(board, 0, false, aiPlayer, player);

      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return board[move] = aiPlayer;
}

export const minimax = (board: Array<'X' | 'O' | null>, depth: number, isMaximizing: boolean, aiPlayer: 'X' | 'O', player: 'X' | 'O',) => {
  let result = calculateWinner(board);

  if (result !== null && result === aiPlayer) return 10 - depth;
  if (result !== null && result === player) return depth - 10;
  if (result !== null && result === 'BOTH') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i: number = 0; i < 9; i++) {
      // Is the spot avaliable?
      if (board[i] == null) {
        board[i] = aiPlayer;
        bestScore = Math.max(bestScore, minimax(board, depth + 1, false, aiPlayer, player));
        board[i] = null
      }
    }
    return bestScore;
  } 
  else {
    let bestScore = Infinity;

    for (let i: number = 0; i < 9; i++) {
      // Is the spot avaliable?
      if (board[i] == null) {
        board[i] = player;
        bestScore = Math.min(bestScore, minimax(board, depth + 1, true, aiPlayer, player));
        board[i] = null
      }
    }
    return bestScore;
  }
}