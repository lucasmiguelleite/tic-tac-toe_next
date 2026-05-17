'use client';

import { BoardState, GameResult, Player } from '@/domain/types';
import Square from './Square';

const cellCenter = (index: number) => {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return { x: col + 0.5, y: row + 0.5 };
};

const extend = (start: { x: number; y: number }, end: { x: number; y: number }, amount: number) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return {
    x1: start.x - (dx / len) * amount,
    y1: start.y - (dy / len) * amount,
    x2: end.x + (dx / len) * amount,
    y2: end.y + (dy / len) * amount,
  };
};

const Board = ({
  squares,
  onSquareClick,
  winner,
  isYourTurn = true,
  winLine = null,
  winnerPlayer = null,
  yourRole,
}: {
  squares: BoardState;
  onSquareClick: (index: number) => void;
  winner: GameResult;
  isYourTurn?: boolean;
  winLine?: number[] | null;
  winnerPlayer?: Player | null;
  yourRole?: Player;
}) => {
  const isOnlineWin = yourRole !== undefined;
  const isYourWin = isOnlineWin && winnerPlayer === yourRole;
  const loser = winnerPlayer === 'X' ? 'O' : winnerPlayer === 'O' ? 'X' : null;

  const showStrike = winLine && winner && winner !== 'BOTH';
  const start = winLine ? cellCenter(winLine[0]) : null;
  const end = winLine ? cellCenter(winLine[2]) : null;
  const line = start && end ? extend(start, end, 0.5) : null;
  const strikeClass = isOnlineWin ? (isYourWin ? 'strike-win' : 'strike-lose') : 'strike-win';

  return (
    <div className="flex justify-center min-w-max">
      <div className="relative grid gap-1 grid-cols-3 mb-5 overflow-visible">
        {squares.map((value, i) => {
          const isWinning = winLine ? winLine.includes(i) : false;
          const isLosing = !isWinning && loser !== null && value === loser;

          return (
            <Square
              key={i}
              value={value}
              onClick={() => onSquareClick(i)}
              disabled={Boolean(winner) || !isYourTurn}
              isWinning={isWinning}
              isLosing={isLosing}
            />
          );
        })}
        {showStrike && line && (
          <svg
            className="absolute -inset-[15%] w-[130%] h-[130%] pointer-events-none z-10"
            viewBox="-0.3 -0.3 3.6 3.6"
            preserveAspectRatio="none"
          >
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={strikeClass}
              strokeWidth={0.09}
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Board;
