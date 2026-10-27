/** Tiny chiptune sound effects synthesized with WebAudio (no audio files needed). */
import { prefs } from '../state/prefs';

let ctx: AudioContext | null = null;

export function sfxEnabled(): boolean {
  return prefs.value.sound;
}

function audio(): AudioContext | null {
  if (!sfxEnabled()) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Note {
  f: number;
  /** Start offset in seconds. */
  at?: number;
  dur: number;
  to?: number;
  type?: OscillatorType;
  vol?: number;
}

function play(notes: Note[]) {
  const a = audio();
  if (!a) return;
  const now = a.currentTime;
  for (const n of notes) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = n.type ?? 'square';
    const t0 = now + (n.at ?? 0);
    o.frequency.setValueAtTime(n.f, t0);
    if (n.to) o.frequency.exponentialRampToValueAtTime(n.to, t0 + n.dur);
    const v = n.vol ?? 0.06;
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.dur);
    o.connect(g).connect(a.destination);
    o.start(t0);
    o.stop(t0 + n.dur + 0.02);
  }
}

/** A short breath of filtered noise (the rough part of a cry); `to` sweeps the filter. */
function noise(at: number, dur: number, freq: number, vol = 0.03, to?: number) {
  const a = audio();
  if (!a) return;
  const len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  const g = a.createGain();
  const t0 = a.currentTime + at;
  bp.frequency.setValueAtTime(freq, t0);
  if (to) bp.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t0);
}

function hashId(s: string): number {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/**
 * Each species' cry, made up from its id so it never changes: 2 to 4 gliding chirps on one
 * waveform, plus a breath of noise.
 */
function cry(species: string) {
  const h = hashId(`cry:${species}`);
  const base = 230 + (h % 9) * 52;
  const type = (['square', 'triangle', 'sawtooth'] as OscillatorType[])[(h >>> 4) % 3];
  const rising = ((h >>> 7) & 1) === 0;
  const count = 2 + ((h >>> 9) % 3);
  const notes: Note[] = [];
  let t = 0;
  for (let i = 0; i < count; i++) {
    const f = base * (1 + ((h >>> (11 + i * 3)) % 6) / 8);
    const dur = 0.07 + ((h >>> (13 + i)) % 3) * 0.035;
    notes.push({ f, to: f * (rising ? 1.4 : 0.68), at: t, dur, type, vol: 0.05 });
    t += dur * 0.85;
  }
  play(notes);
  noise(0, Math.min(0.25, t), base * 3, 0.025);
}

export const sfx = {
  cry,
  blip: () => play([{ f: 880, dur: 0.05, vol: 0.035 }]),
  confirm: () => play([{ f: 660, dur: 0.06 }, { f: 990, at: 0.06, dur: 0.08 }]),
  hit: () => play([{ f: 220, to: 70, dur: 0.18, type: 'sawtooth', vol: 0.07 }]),
  heal: () => play([{ f: 520, dur: 0.08, type: 'triangle', vol: 0.08 }, { f: 780, at: 0.08, dur: 0.12, type: 'triangle', vol: 0.08 }]),
  coin: () => play([{ f: 988, dur: 0.06, vol: 0.05 }, { f: 1319, at: 0.06, dur: 0.14, vol: 0.05 }]),
  energy: () => play([{ f: 400, to: 900, dur: 0.12, type: 'triangle', vol: 0.06 }]),
  ko: () => play([{ f: 440, to: 110, dur: 0.45, type: 'square', vol: 0.06 }]),
  door: () => play([{ f: 300, dur: 0.05, vol: 0.04 }, { f: 200, at: 0.05, dur: 0.08, vol: 0.04 }]),
  encounter: () => play([0, 1, 2, 3, 4, 5].map((i) => ({ f: i % 2 ? 660 : 880, at: i * 0.07, dur: 0.07, vol: 0.05 }))),
  victory: () => play([523, 659, 784, 1047].map((f, i) => ({ f, at: i * 0.11, dur: i === 3 ? 0.35 : 0.1, vol: 0.06 }))),
  capture: () => play([784, 988, 1175, 1568].map((f, i) => ({ f, at: i * 0.09, dur: 0.12, type: 'triangle' as const, vol: 0.08 }))),
  levelUp: () => play([659, 784, 988, 1319].map((f, i) => ({ f, at: i * 0.08, dur: 0.1, vol: 0.05 }))),
  sparkle: () => play([1568, 2093, 2637].map((f, i) => ({ f, at: i * 0.05, dur: 0.08, type: 'triangle' as const, vol: 0.04 }))),
};

/** Sounds of the move animations, one per kind of effect (`src/ui/battle/fx`). */
const FX = {
  fire: () => { noise(0, 0.45, 400, 0.16, 1600); noise(0.05, 0.35, 200, 0.1, 500); },
  water: () => { noise(0, 0.3, 1800, 0.1, 700); play([{ f: 700, to: 300, dur: 0.12, type: 'sine', vol: 0.05 }]); },
  wave: () => { noise(0, 0.9, 500, 0.15, 1500); noise(0.4, 0.5, 1200, 0.12, 400); },
  rain: () => { for (let i = 0; i < 8; i++) noise(i * 0.08, 0.05, 2500 + i * 200, 0.08); },
  bubble: () => play([0, 1, 2, 3].map((i) => ({ f: 500 + i * 180, to: 900 + i * 200, at: i * 0.07, dur: 0.06, type: 'sine' as const, vol: 0.05 }))),
  thunder: () => { noise(0, 0.5, 2500, 0.12, 600); play([{ f: 90, to: 45, dur: 0.4, type: 'sawtooth', vol: 0.05 }]); },
  spark: () => { for (let i = 0; i < 4; i++) noise(i * 0.05, 0.03, 4000, 0.12); },
  wind: () => noise(0, 0.5, 500, 0.1, 1400),
  whoosh: () => noise(0, 0.18, 800, 0.11, 2500),
  slash: () => noise(0, 0.14, 2500, 0.14, 6000),
  jab: () => { noise(0, 0.04, 3000, 0.1); play([{ f: 900, to: 600, dur: 0.04, vol: 0.03 }]); },
  bite: () => { play([{ f: 900, to: 500, dur: 0.05, vol: 0.05 }, { f: 700, to: 300, at: 0.06, dur: 0.06, vol: 0.05 }]); noise(0.05, 0.04, 2000, 0.08); },
  punch: () => { play([{ f: 160, to: 50, dur: 0.15, type: 'sine', vol: 0.09 }]); noise(0, 0.06, 900, 0.04); },
  rock: () => { for (let i = 0; i < 3; i++) noise(i * 0.07, 0.08, 500 + i * 150, 0.15); },
  quake: () => { play([{ f: 55, to: 40, dur: 0.7, type: 'sawtooth', vol: 0.05 }]); noise(0, 0.7, 180, 0.12, 120); },
  beam: () => play([{ f: 300, to: 900, dur: 0.45, type: 'triangle', vol: 0.05 }, { f: 600, to: 1800, dur: 0.45, type: 'square', vol: 0.015 }]),
  charge: () => play([{ f: 200, to: 1200, dur: 0.7, type: 'triangle', vol: 0.04 }]),
  psychic: () => play([600, 800, 600, 900, 650].map((f, i) => ({ f, at: i * 0.07, dur: 0.08, type: 'sine' as const, vol: 0.045 }))),
  ghost: () => play([{ f: 320, to: 200, dur: 0.3, type: 'triangle', vol: 0.05 }, { f: 200, to: 380, at: 0.28, dur: 0.35, type: 'triangle', vol: 0.05 }]),
  sludge: () => { play([{ f: 220, to: 80, dur: 0.22, type: 'sawtooth', vol: 0.04 }]); noise(0, 0.15, 400, 0.08); },
  song: () => play([523, 659, 784, 659].map((f, i) => ({ f, at: i * 0.12, dur: 0.12, type: 'triangle' as const, vol: 0.05 }))),
  snore: () => play([{ f: 180, to: 120, dur: 0.35, type: 'triangle', vol: 0.05 }]),
  buzz: () => play([{ f: 110, dur: 0.5, type: 'sawtooth', vol: 0.03 }, { f: 116, dur: 0.5, type: 'square', vol: 0.02 }]),
  ice: () => { noise(0, 0.3, 6000, 0.08); play([{ f: 1800, to: 2400, dur: 0.2, type: 'triangle', vol: 0.03 }]); },
  twinkle: () => play([1568, 2093, 1760].map((f, i) => ({ f, at: i * 0.06, dur: 0.07, type: 'triangle' as const, vol: 0.03 }))),
  shine: () => play([784, 1047, 1319, 1568].map((f, i) => ({ f, at: i * 0.06, dur: 0.12, type: 'triangle' as const, vol: 0.04 }))),
  statUp: () => play([392, 494, 587, 784].map((f, i) => ({ f, at: i * 0.06, dur: 0.07, vol: 0.04 }))),
  statDown: () => play([784, 587, 494, 392].map((f, i) => ({ f, at: i * 0.06, dur: 0.07, vol: 0.04 }))),
  heal: () => sfx.heal(),
  shield: () => play([{ f: 1200, dur: 0.25, type: 'triangle', vol: 0.05 }, { f: 1800, at: 0.04, dur: 0.3, type: 'triangle', vol: 0.03 }]),
  pop: () => play([{ f: 300, to: 900, dur: 0.08, vol: 0.04 }]),
  tick: () => play([{ f: 1000, dur: 0.03, vol: 0.04 }]),
} satisfies Record<string, () => void>;

export type FxSound = keyof typeof FX;

export function fxSound(kind: FxSound) {
  FX[kind]();
}

