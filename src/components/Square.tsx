'use client';

import { useEffect, useRef } from 'react';
import { Player } from '@/domain/types';
import { playMove } from '@/utils/sounds';

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
  const prevValue = useRef(value);

  useEffect(() => {
    if (value && !prevValue.current) playMove();
    prevValue.current = value;
  }, [value]);

  const effectClass = isWinning ? 'square-win' : isLosing ? 'square-lose' : '';

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
      className={`${value === 'X' ? 'bg-green-500' : 'bg-red-600'} square-stamp ${effectClass} max-w-60 max-h-60 min-h-24 min-w-24 text-7xl text-slate-200 border border-solid border-black dark:border-gray-500 rounded-lg`}
      disabled
    >
      {value}
    </button>
  );
};

export default Square;
