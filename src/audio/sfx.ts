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

export const sfx = {
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
