'use client';

import { BoardState, GameResult, Player } from '@/domain/types';
import { useSettings } from '@/context/SettingsContext';
import { boardStyleConfigs } from '@/domain/boardStyles';
import Square from './Square';

export const cellCenter = (index: number) => {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return { x: col + 0.5, y: row + 0.5 };
};

export const extend = (start: { x: number; y: number }, end: { x: number; y: number }, amount: number) => {
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

type BaseBoardProps = {
  squares: BoardState;
  onSquareClick: (index: number) => void;
  winner: GameResult;
  winLine?: number[] | null;
  winnerPlayer?: Player | null;
};

type LocalBoardProps = BaseBoardProps;

type OnlineBoardProps = BaseBoardProps & {
  isYourTurn: boolean;
  yourRole: Player;
  winnerPlayer: Player | null;
};

const GridLines = ({ color, width, height }: { color: string; width: string; height: string }) => (
  <div className="absolute inset-0 pointer-events-none z-[1]">
    <div className={`absolute ${height} top-0 bottom-0`} style={{ left: '33.33%', transform: 'translateX(-50%) rotate(0.3deg)' }}>
      <div className={`w-full h-full ${color} rounded-full`} />
    </div>
    <div className={`absolute ${height} top-0 bottom-0`} style={{ left: '66.66%', transform: 'translateX(-50%) rotate(-0.2deg)' }}>
      <div className={`w-full h-full ${color} rounded-full`} />
    </div>
    <div className={`absolute ${width} left-0 right-0`} style={{ top: '33.33%', transform: 'translateY(-50%) rotate(0.2deg)' }}>
      <div className={`w-full h-full ${color} rounded-full`} />
    </div>
    <div className={`absolute ${width} left-0 right-0`} style={{ top: '66.66%', transform: 'translateY(-50%) rotate(-0.3deg)' }}>
      <div className={`w-full h-full ${color} rounded-full`} />
    </div>
  </div>
);

const BoardInner = ({
  squares,
  onSquareClick,
  winner,
  isYourTurn = true,
  winLine = null,
  winnerPlayer = null,
  yourRole,
}: LocalBoardProps & { isYourTurn?: boolean; yourRole?: Player }) => {
  const { locale, boardStyle } = useSettings();
  const config = boardStyleConfigs[boardStyle];
  const isOnlineWin = yourRole !== undefined;
  const isYourWin = isOnlineWin && winnerPlayer === yourRole;
  const loser = winnerPlayer === 'X' ? 'O' : winnerPlayer === 'O' ? 'X' : null;

  const showStrike = winLine && winner && winner !== 'BOTH';
  const start = winLine ? cellCenter(winLine[0]) : null;
  const end = winLine ? cellCenter(winLine[2]) : null;
  const line = start && end ? extend(start, end, 0.5) : null;
  const strikeClass = config.strikeClass(isOnlineWin, isYourWin);
  const svgClass = config.svgContainment === 'inset' ? 'inset-0 w-full h-full' : '-inset-[15%] w-[130%] h-[130%]';

  return (
    <div className="flex justify-center w-full overflow-hidden">
      <div className={config.gridClass}>
        {config.hasGridLines && <GridLines color={config.gridLineColor} width={config.gridLineWidth} height={config.gridLineHeight} />}
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
            className={`absolute pointer-events-none z-10 ${svgClass}`}
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
        {winner === 'BOTH' && locale === 'pt' && (
          <svg
            className={`absolute pointer-events-none z-10 ${svgClass}`}
            viewBox="-0.3 -0.3 3.6 3.6"
            preserveAspectRatio="none"
          >
            <line x1="-0.2" y1="0.2" x2="1.5" y2="2.8" className={config.drawStrikeClass} strokeWidth={0.08} strokeLinecap="round" />
            <line x1="3.2" y1="0.2" x2="1.5" y2="2.8" className={config.drawStrikeClass} strokeWidth={0.08} strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

export const LocalBoard = (props: LocalBoardProps) => <BoardInner {...props} />;
export const OnlineBoard = (props: OnlineBoardProps) => <BoardInner {...props} />;
