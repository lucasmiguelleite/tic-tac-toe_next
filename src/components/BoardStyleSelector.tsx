'use client';

import { BoardStyle, useSettings } from '@/context/SettingsContext';

const styles: BoardStyle[] = ['classic', 'paper', 'neon', 'chalk'];

const MiniSquare = ({ filled, style }: { filled: 'X' | 'O' | null; style: BoardStyle }) => {
  const base = 'w-2.5 h-2.5';
  if (!filled) return <div className={base} />;
  if (style === 'classic') {
    return <div className={`${base} rounded-sm ${filled === 'X' ? 'bg-green-500' : 'bg-red-600'}`} />;
  }
  if (style === 'paper') {
    return (
      <div className={`${base} relative`}>
        {filled === 'X' ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-[60%] h-[1.5px] bg-[#3a3a3a]" style={{ transform: 'rotate(45deg)' }} />
              <div className="absolute w-[60%] h-[1.5px] bg-[#3a3a3a]" style={{ transform: 'rotate(-45deg)' }} />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[50%] h-[50%] rounded-full border border-[#3a3a3a]" />
          </div>
        )}
      </div>
    );
  }
  if (style === 'neon') {
    return <div className={`${base} rounded-sm bg-gray-950 border ${filled === 'X' ? 'border-cyan-400' : 'border-fuchsia-400'}`} />;
  }
  return (
    <div className={`${base} relative`}>
      {filled === 'X' ? (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-[60%] h-[1.5px] bg-white/80" style={{ transform: 'rotate(45deg)' }} />
            <div className="absolute w-[60%] h-[1.5px] bg-white/80" style={{ transform: 'rotate(-45deg)' }} />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[50%] h-[50%] rounded-full border border-white/80" />
        </div>
      )}
    </div>
  );
};

const miniBoard: (null | 'X' | 'O')[] = [
  'X', null, 'O',
  null, 'X', null,
  null, null, 'X',
];

const BoardStyleSelector = () => {
  const { boardStyle, setBoardStyle, t } = useSettings();

  return (
    <div>
      <span className="text-sm">{t('settings.boardStyle')}</span>
      <div className="flex gap-2 mt-1.5">
        {styles.map((style) => {
          const selected = boardStyle === style;
          const bgClass = style === 'paper' ? 'bg-[#f5f0e1]'
            : style === 'neon' ? 'bg-gray-950'
            : style === 'chalk' ? 'bg-[#2d4a3e]'
            : '';
          return (
            <button
              key={style}
              onClick={() => setBoardStyle(style)}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-md transition-all ${selected ? 'ring-2 ring-blue-500 scale-105' : 'hover:bg-gray-100 dark:hover:bg-gray-700 opacity-60 hover:opacity-100'}`}
              title={t(`boardStyle.${style}`)}
            >
              <div className={`grid grid-cols-3 gap-px p-1 rounded ${bgClass}`}>
                {miniBoard.map((cell, i) => (
                  <MiniSquare key={i} filled={cell} style={style} />
                ))}
              </div>
              <span className="text-[9px] leading-none opacity-70">{t(`boardStyle.${style}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BoardStyleSelector;
