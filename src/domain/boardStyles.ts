import { BoardStyle } from '@/context/SettingsContext';

export type BoardStyleConfig = {
  gridClass: string;
  stampClass: string;
  winClass: string;
  strikeClass: (isOnline: boolean, isYourWin: boolean) => string;
  drawStrikeClass: string;
  hasGridLines: boolean;
  gridLineColor: string;
  gridLineWidth: string;
  gridLineHeight: string;
  svgContainment: 'inset' | 'extended';
  selectorBg: string;
};

export const boardStyleConfigs: Record<BoardStyle, BoardStyleConfig> = {
  classic: {
    gridClass: 'relative grid gap-1 grid-cols-3 mb-5 overflow-visible',
    stampClass: 'square-stamp',
    winClass: 'square-win',
    strikeClass: (isOnline, isYourWin) => isOnline ? (isYourWin ? 'strike-win' : 'strike-lose') : 'strike-win',
    drawStrikeClass: 'strike-draw',
    hasGridLines: false,
    gridLineColor: '',
    gridLineWidth: '',
    gridLineHeight: '',
    svgContainment: 'extended',
    selectorBg: '',
  },
  paper: {
    gridClass: 'relative grid grid-cols-3 mb-5 overflow-visible bg-[#f5f0e1] rounded-xl p-4',
    stampClass: 'stamp-paper',
    winClass: 'square-win-paper',
    strikeClass: () => 'strike-pencil',
    drawStrikeClass: 'strike-pencil',
    hasGridLines: true,
    gridLineColor: 'bg-[#3a3a3a]',
    gridLineWidth: 'h-[3px]',
    gridLineHeight: 'w-[3px]',
    svgContainment: 'inset',
    selectorBg: 'bg-[#f5f0e1]',
  },
  neon: {
    gridClass: 'relative grid gap-0.5 grid-cols-3 mb-5 overflow-visible bg-gray-950 rounded-lg p-1',
    stampClass: 'stamp-neon',
    winClass: 'square-win-neon',
    strikeClass: () => 'strike-neon',
    drawStrikeClass: 'strike-neon',
    hasGridLines: false,
    gridLineColor: '',
    gridLineWidth: '',
    gridLineHeight: '',
    svgContainment: 'extended',
    selectorBg: 'bg-gray-950',
  },
  chalk: {
    gridClass: 'relative grid grid-cols-3 mb-5 overflow-visible bg-[#2d4a3e] rounded-xl p-4',
    stampClass: 'stamp-chalk',
    winClass: 'square-win-chalk',
    strikeClass: () => 'strike-chalk',
    drawStrikeClass: 'strike-chalk',
    hasGridLines: true,
    gridLineColor: 'bg-white/70',
    gridLineWidth: 'h-[4px]',
    gridLineHeight: 'w-[4px]',
    svgContainment: 'inset',
    selectorBg: 'bg-[#2d4a3e]',
  },
};

export const boardStyleKeys: BoardStyle[] = ['classic', 'paper', 'neon', 'chalk'];
