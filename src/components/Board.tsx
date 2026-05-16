'use client';

import { BoardState, GameResult } from '@/domain/types';
import Square from './Square';

const Board = ({
  squares,
  onSquareClick,
  winner,
  isYourTurn = true,
}: {
  squares: BoardState;
  onSquareClick: (index: number) => void;
  winner: GameResult;
  isYourTurn?: boolean;
}) => (
  <div className="flex justify-center min-w-max">
    <div className="grid gap-1 grid-cols-3 mb-5">
      {squares.map((value, i) => (
        <Square
          key={i}
          value={value}
          onClick={() => onSquareClick(i)}
          disabled={Boolean(winner) || !isYourTurn}
        />
      ))}
    </div>
  </div>
);

export default Board;
