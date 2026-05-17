const getContext = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
})();

type SoundSettings = { volume: number; movesEnabled: boolean; eventsEnabled: boolean; uiEnabled: boolean };
type SoundCategory = 'moves' | 'events' | 'ui';

const defaultSettings: SoundSettings = { volume: 80, movesEnabled: true, eventsEnabled: true, uiEnabled: true };
let cache: SoundSettings = { ...defaultSettings };

export const updateSoundCache = (settings: SoundSettings) => { cache = settings; };

const getSettings = () => cache;

const isEnabled = (category: SoundCategory) => {
  const s = getSettings();
  if (s.volume === 0) return false;
  if (category === 'moves') return s.movesEnabled;
  if (category === 'events') return s.eventsEnabled;
  return s.uiEnabled;
};

const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
  const ctx = getContext();
  const vol = volume * (getSettings().volume / 100);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration);
};

export const playWin = () => {
  if (!isEnabled('events')) return;
  playTone(523.25, 0, 0.2, 'square', 0.1);
  playTone(659.25, 0.12, 0.2, 'square', 0.1);
  playTone(783.99, 0.24, 0.3, 'square', 0.12);
  playTone(1046.50, 0.4, 0.5, 'square', 0.1);
};

export const playLose = () => {
  if (!isEnabled('events')) return;
  playTone(392, 0, 0.25, 'sawtooth', 0.08);
  playTone(349.23, 0.2, 0.25, 'sawtooth', 0.08);
  playTone(311.13, 0.4, 0.4, 'sawtooth', 0.06);
};

export const playDraw = () => {
  if (!isEnabled('events')) return;
  playTone(440, 0, 0.15, 'triangle', 0.1);
  playTone(415.30, 0.12, 0.15, 'triangle', 0.1);
  playTone(440, 0.24, 0.2, 'triangle', 0.08);
};

export const playDisconnect = () => {
  if (!isEnabled('events')) return;
  playTone(250, 0, 0.3, 'sawtooth', 0.1);
  playTone(200, 0.15, 0.3, 'sawtooth', 0.08);
  playTone(150, 0.3, 0.5, 'sawtooth', 0.06);
};

export const playEnterQueue = () => {
  if (!isEnabled('ui')) return;
  playTone(440, 0, 0.15, 'sine', 0.1);
  playTone(523.25, 0.1, 0.2, 'sine', 0.1);
};

export const playMatchFound = () => {
  if (!isEnabled('ui')) return;
  playTone(523.25, 0, 0.1, 'square', 0.1);
  playTone(659.25, 0.08, 0.1, 'square', 0.1);
  playTone(783.99, 0.16, 0.15, 'square', 0.1);
  playTone(1046.50, 0.26, 0.3, 'square', 0.12);
};

export const playRestartVote = () => {
  if (!isEnabled('ui')) return;
  playTone(587.33, 0, 0.12, 'sine', 0.12);
  playTone(783.99, 0.1, 0.15, 'sine', 0.12);
};

export const playClick = () => {
  if (!isEnabled('ui')) return;
  playTone(660, 0, 0.06, 'sine', 0.08);
};

export const playMove = () => {
  if (!isEnabled('moves')) return;
  playTone(200, 0, 0.08, 'sawtooth', 0.12);
  playTone(150, 0.02, 0.06, 'square', 0.06);
};

export const playExitWarning = () => {
  if (!isEnabled('ui')) return;
  playTone(330, 0, 0.15, 'sawtooth', 0.08);
  playTone(330, 0.2, 0.15, 'sawtooth', 0.08);
};
