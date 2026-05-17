import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

class MockAudioContext {
  state = 'running';
  currentTime = 0;
  resume = vi.fn();
  createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: { value: 0 },
    connect: vi.fn(() => ({ connect: vi.fn(() => ({ destination: {} })) })),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(() => ({ destination: {} })),
  }));
}

let mockCtx: MockAudioContext;

beforeAll(() => {
  vi.stubGlobal('AudioContext', class {
    constructor() {
      mockCtx = new MockAudioContext();
      return mockCtx;
    }
  });
});

import { updateSoundCache, playWin, playLose, playDraw, playMove, playClick } from '@/utils/sounds';

beforeEach(() => {
  updateSoundCache({ volume: 80, movesEnabled: true, eventsEnabled: true, uiEnabled: true });
  if (mockCtx) {
    mockCtx.createOscillator.mockClear();
    mockCtx.createGain.mockClear();
  }
});

describe('sounds gate logic', () => {
  it('plays event sound when eventsEnabled is true', () => {
    playWin();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('skips event sound when eventsEnabled is false', () => {
    updateSoundCache({ volume: 80, movesEnabled: true, eventsEnabled: false, uiEnabled: true });
    playWin();
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('plays move sound when movesEnabled is true', () => {
    playMove();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('skips move sound when movesEnabled is false', () => {
    updateSoundCache({ volume: 80, movesEnabled: false, eventsEnabled: true, uiEnabled: true });
    playMove();
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('plays ui sound when uiEnabled is true', () => {
    playClick();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('skips ui sound when uiEnabled is false', () => {
    updateSoundCache({ volume: 80, movesEnabled: true, eventsEnabled: true, uiEnabled: false });
    playClick();
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('skips all sounds when volume is 0', () => {
    updateSoundCache({ volume: 0, movesEnabled: true, eventsEnabled: true, uiEnabled: true });
    playWin();
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('plays lose when eventsEnabled', () => {
    playLose();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('plays draw when eventsEnabled', () => {
    playDraw();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });
});
