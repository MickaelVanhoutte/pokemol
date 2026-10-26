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

/** A short breath of filtered noise (the rough part of a cry). */
function noise(at: number, dur: number, freq: number, vol = 0.03) {
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
  bp.frequency.value = freq;
  const g = a.createGain();
  const t0 = a.currentTime + at;
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
