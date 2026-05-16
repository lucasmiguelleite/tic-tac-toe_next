'use client';

import { BoardState, GameResult } from '@/domain/types';
import Square from './Square';

const Board = ({
  squares,
  onSquareClick,
  winner,
}: {
  squares: BoardState;
  onSquareClick: (index: number) => void;
  winner: GameResult;
}) => (
  <div className="flex justify-center min-w-max">
    <div className="grid gap-1 grid-cols-3 mb-5">
      {squares.map((value, i) => (
        <Square
          key={i}
          value={value}
          onClick={() => onSquareClick(i)}
          disabled={Boolean(winner)}
        />
      ))}
    </div>
  </div>
);

export default Board;
