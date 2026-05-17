import { describe, it, expect } from 'vitest';
import { boardStyleConfigs, boardStyleKeys } from '@/domain/boardStyles';
import { cellCenter, extend } from '@/components/Board';

describe('boardStyles registry', () => {
  it('contains all style keys', () => {
    expect(boardStyleKeys).toEqual(['classic', 'paper', 'neon', 'chalk']);
  });

  it('has config for every key', () => {
    for (const key of boardStyleKeys) {
      expect(boardStyleConfigs[key]).toBeDefined();
    }
  });

  it('strikeClass returns correct value per style', () => {
    expect(boardStyleConfigs.classic.strikeClass(true, true)).toBe('strike-win');
    expect(boardStyleConfigs.classic.strikeClass(true, false)).toBe('strike-lose');
    expect(boardStyleConfigs.classic.strikeClass(false, false)).toBe('strike-win');
    expect(boardStyleConfigs.paper.strikeClass(true, true)).toBe('strike-pencil');
    expect(boardStyleConfigs.neon.strikeClass(true, false)).toBe('strike-neon');
    expect(boardStyleConfigs.chalk.strikeClass(false, false)).toBe('strike-chalk');
  });

  it('drawStrikeClass is defined for all styles', () => {
    for (const key of boardStyleKeys) {
      expect(boardStyleConfigs[key].drawStrikeClass).toBeTruthy();
    }
  });

  it('has consistent svgContainment with hasGridLines', () => {
    for (const key of boardStyleKeys) {
      const config = boardStyleConfigs[key];
      if (config.hasGridLines) {
        expect(config.svgContainment).toBe('inset');
      }
    }
  });

  it('gridLineColor and gridLineWidth are set when hasGridLines', () => {
    for (const key of boardStyleKeys) {
      const config = boardStyleConfigs[key];
      if (config.hasGridLines) {
        expect(config.gridLineColor).toBeTruthy();
        expect(config.gridLineWidth).toBeTruthy();
        expect(config.gridLineHeight).toBeTruthy();
      }
    }
  });
});

describe('cellCenter', () => {
  it('returns center of top-left cell (index 0)', () => {
    expect(cellCenter(0)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('returns center of top-right cell (index 2)', () => {
    expect(cellCenter(2)).toEqual({ x: 2.5, y: 0.5 });
  });

  it('returns center of center cell (index 4)', () => {
    expect(cellCenter(4)).toEqual({ x: 1.5, y: 1.5 });
  });

  it('returns center of bottom-right cell (index 8)', () => {
    expect(cellCenter(8)).toEqual({ x: 2.5, y: 2.5 });
  });
});

describe('extend', () => {
  it('extends a horizontal line', () => {
    const result = extend({ x: 0.5, y: 0.5 }, { x: 2.5, y: 0.5 }, 0.5);
    expect(result.x1).toBeCloseTo(0);
    expect(result.y1).toBeCloseTo(0.5);
    expect(result.x2).toBeCloseTo(3);
    expect(result.y2).toBeCloseTo(0.5);
  });

  it('extends a diagonal line', () => {
    const result = extend({ x: 0.5, y: 0.5 }, { x: 2.5, y: 2.5 }, 0.5);
    expect(result.x1).toBeCloseTo(0.1464);
    expect(result.y1).toBeCloseTo(0.1464);
    expect(result.x2).toBeCloseTo(2.8536);
    expect(result.y2).toBeCloseTo(2.8536);
  });
});
