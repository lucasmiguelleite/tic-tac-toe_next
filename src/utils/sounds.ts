const getContext = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
})();

const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration);
};

export const playWin = () => {
  playTone(523.25, 0, 0.2, 'square', 0.1);
  playTone(659.25, 0.12, 0.2, 'square', 0.1);
  playTone(783.99, 0.24, 0.3, 'square', 0.12);
  playTone(1046.50, 0.4, 0.5, 'square', 0.1);
};

export const playLose = () => {
  playTone(392, 0, 0.25, 'sawtooth', 0.08);
  playTone(349.23, 0.2, 0.25, 'sawtooth', 0.08);
  playTone(311.13, 0.4, 0.4, 'sawtooth', 0.06);
};

export const playEnterQueue = () => {
  playTone(440, 0, 0.15, 'sine', 0.1);
  playTone(523.25, 0.1, 0.2, 'sine', 0.1);
};

export const playMatchFound = () => {
  playTone(523.25, 0, 0.1, 'square', 0.1);
  playTone(659.25, 0.08, 0.1, 'square', 0.1);
  playTone(783.99, 0.16, 0.15, 'square', 0.1);
  playTone(1046.50, 0.26, 0.3, 'square', 0.12);
};

export const playRestartVote = () => {
  playTone(587.33, 0, 0.12, 'sine', 0.12);
  playTone(783.99, 0.1, 0.15, 'sine', 0.12);
};
