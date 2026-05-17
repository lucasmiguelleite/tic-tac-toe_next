'use client';

import { Player } from '@/domain/types';
import { useSettings } from '@/context/SettingsContext';

const Square = ({
  value,
  onClick,
  disabled,
  isWinning = false,
  isLosing = false,
}: {
  value: Player | null;
  onClick: () => void;
  disabled: boolean;
  isWinning?: boolean;
  isLosing?: boolean;
}) => {
  const { boardStyle } = useSettings();

  const stampClass = boardStyle === 'paper' ? 'stamp-paper'
    : boardStyle === 'neon' ? 'stamp-neon'
    : boardStyle === 'chalk' ? 'stamp-chalk'
    : 'square-stamp';

  const winClass = isWinning
    ? (boardStyle === 'neon' ? 'square-win-neon'
      : boardStyle === 'chalk' ? 'square-win-chalk'
      : boardStyle === 'paper' ? 'square-win-paper'
      : 'square-win')
    : '';
  const loseClass = isLosing ? 'square-lose' : '';
  const effectClass = `${winClass} ${loseClass}`.trim();

  if (boardStyle === 'paper') return <PaperSquare value={value} onClick={onClick} disabled={disabled} stampClass={stampClass} effectClass={effectClass} />;
  if (boardStyle === 'neon') return <NeonSquare value={value} onClick={onClick} disabled={disabled} stampClass={stampClass} effectClass={effectClass} />;
  if (boardStyle === 'chalk') return <ChalkSquare value={value} onClick={onClick} disabled={disabled} stampClass={stampClass} effectClass={effectClass} />;
  return <ClassicSquare value={value} onClick={onClick} disabled={disabled} stampClass={stampClass} effectClass={effectClass} />;
};

export default Square;

/* ── Classic ─────────────────────────────────── */

const ClassicSquare = ({ value, onClick, disabled, stampClass, effectClass }: SquareBase) => {
  if (!value) {
    return (
      <button
        className={`${effectClass} max-w-60 max-h-60 min-h-24 min-w-24 text-7xl text-background border border-solid border-black dark:border-gray-500 rounded-lg hover:text-slate-300`}
        onClick={onClick}
        disabled={disabled}
      />
    );
  }
  return (
    <button
      className={`${value === 'X' ? 'bg-green-500' : 'bg-red-600'} ${stampClass} ${effectClass} max-w-60 max-h-60 min-h-24 min-w-24 text-7xl text-slate-200 border border-solid border-black dark:border-gray-500 rounded-lg`}
      disabled
    >
      {value}
    </button>
  );
};

/* ── Paper ───────────────────────────────────── */

const PaperSquare = ({ value, onClick, disabled, stampClass, effectClass }: SquareBase) => {
  if (!value) {
    return (
      <button
        className="max-w-60 max-h-60 min-h-24 min-w-24 rounded-sm"
        onClick={onClick}
        disabled={disabled}
      />
    );
  }
  return (
    <button
      className={`${stampClass} max-w-60 max-h-60 min-h-24 min-w-24 relative rounded-sm`}
      disabled
    >
      <div className={`relative w-full h-full ${effectClass}`}>{value === 'X' ? <PencilX /> : <PencilO />}</div>
    </button>
  );
};

const PencilX = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="absolute w-[70%] h-[4px] bg-[#3a3a3a] rounded-full" style={{ transform: 'rotate(45deg)' }} />
    <div className="absolute w-[70%] h-[4px] bg-[#3a3a3a] rounded-full" style={{ transform: 'rotate(-45deg)' }} />
  </div>
);

const PencilO = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-[55%] h-[55%] rounded-full border-[4px] border-[#3a3a3a]" />
  </div>
);

/* ── Neon ─────────────────────────────────────── */

const NeonSquare = ({ value, onClick, disabled, stampClass, effectClass }: SquareBase) => {
  if (!value) {
    return (
      <button
        className={`${effectClass} max-w-60 max-h-60 min-h-24 min-w-24 bg-gray-950 border border-cyan-900/40 rounded hover:border-cyan-500/60`}
        onClick={onClick}
        disabled={disabled}
      />
    );
  }
  const isX = value === 'X';
  return (
    <button
      className={`${stampClass} ${effectClass} max-w-60 max-h-60 min-h-24 min-w-24 bg-gray-950 border rounded text-7xl font-bold ${isX ? 'text-cyan-400 border-cyan-500/60 neon-glow-cyan' : 'text-fuchsia-400 border-fuchsia-500/60 neon-glow-magenta'}`}
      disabled
    >
      {value}
    </button>
  );
};

/* ── Chalk ────────────────────────────────────── */

const ChalkSquare = ({ value, onClick, disabled, stampClass, effectClass }: SquareBase) => {
  if (!value) {
    return (
      <button
        className="max-w-60 max-h-60 min-h-24 min-w-24 rounded-sm"
        onClick={onClick}
        disabled={disabled}
      />
    );
  }
  return (
    <button
      className={`${stampClass} max-w-60 max-h-60 min-h-24 min-w-24 relative rounded-sm`}
      disabled
    >
      <div className={`relative w-full h-full ${effectClass}`}>{value === 'X' ? <ChalkX /> : <ChalkO />}</div>
    </button>
  );
};

const ChalkX = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="absolute w-[70%] h-[5px] bg-white/80 rounded-full chalk-texture" style={{ transform: 'rotate(45deg)' }} />
    <div className="absolute w-[70%] h-[5px] bg-white/80 rounded-full chalk-texture" style={{ transform: 'rotate(-45deg)' }} />
  </div>
);

const ChalkO = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-[55%] h-[55%] rounded-full border-[5px] border-white/80 chalk-texture" />
  </div>
);

/* ── Shared types ─────────────────────────────── */

type SquareBase = {
  value: Player | null;
  onClick: () => void;
  disabled: boolean;
  stampClass: string;
  effectClass: string;
};
