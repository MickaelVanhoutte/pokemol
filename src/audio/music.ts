/**
 * Tiny chiptune music player (Web Audio): a square-wave melody, a triangle bass and noise
 * drums, scheduled a little ahead of time and looped. All tunes are original.
 *
 * Patterns are space-separated notes with a length in eighth notes: "C5:2 E5 G5:4 .:2"
 * (no length = 1 eighth, "." = rest, "|" = bar line, ignored).
 */
import { prefs } from '../state/prefs';

export type TrackId =
  | 'title' | 'town' | 'route' | 'cave' | 'gomme' | 'edge' | 'center'
  | 'wild' | 'trainer' | 'leader' | 'final' | 'ending';

interface Track {
  bpm: number;
  lead: string;
  bass: string;
  /** k = kick, h = hat, s = snare, . = nothing; one character per eighth note. */
  drums?: string;
  wave?: OscillatorType;
}

const TRACKS: Record<TrackId, Track> = {
  title: {
    bpm: 108,
    lead: 'E5 G5 C6:2 B5 G5 A5:2 | F5 A5 D6:2 C6 A5 B5:2 | G5 C6 E6:2 D6 C6 B5 A5 | G5:4 .:2 G4 A4 |'
      + ' C5 E5 G5:2 F5 E5 D5:2 | E5 G5 C6:2 B5 A5 G5:2 | A5 F5 D5 F5 E5 C5 D5 B4 | C5:6 .:2 |',
    bass: 'C3:2 G3:2 C3:2 G3:2 | F3:2 C4:2 F3:2 C4:2 | E3:2 B3:2 A3:2 E3:2 | G3:2 D4:2 G3:2 D4:2 |'
      + ' C3:2 G3:2 F3:2 C4:2 | C3:2 G3:2 E3:2 B3:2 | F3:2 C4:2 G3:2 D4:2 | C3:4 G3:4 |',
    drums: 'k.h.s.h.k.h.s.h.',
  },
  town: {
    bpm: 96,
    lead: 'G4 C5 E5:2 D5 C5 D5:2 | E5 G5 E5 C5 D5:4 | F5 E5 D5 C5 B4 C5 D5:2 | C5:6 .:2 |'
      + ' A4 C5 F5:2 E5 D5 C5:2 | B4 D5 G5:2 F5 E5 D5:2 | E5 C5 A4 C5 D5 B4 G4 B4 | C5:6 .:2 |',
    bass: 'C3:4 G3:4 | A2:4 G3:4 | F3:4 G3:4 | C3:4 G2:4 | F3:4 C4:4 | G3:4 D4:4 | A3:4 G3:4 | C3:4 C3:4 |',
    drums: 'k...h...k.k.h...',
    wave: 'triangle',
  },
  route: {
    bpm: 132,
    lead: 'C5 D5 E5 G5:2 E5 D5 C5 | A4 C5 D5:2 C5 A4 G4:2 | C5 E5 G5:2 A5 G5 E5 C5 | D5:6 .:2 |'
      + ' E5 F5 G5 A5:2 G5 F5 E5 | D5 E5 F5:2 E5 D5 C5:2 | A4 C5 D5 E5 G5 E5 D5 B4 | C5:6 .:2 |',
    bass: 'C3 C3 G3 C3 C3 G3 C3 G3 | F3 F3 C4 F3 G3 G3 D4 G3 | A3 A3 E3 A3 F3 F3 C4 F3 | G3 G3 D4 G3 G3 G3 B3 G3 |'
      + ' C3 C3 G3 C3 A3 A3 E3 A3 | F3 F3 C4 F3 G3 G3 D4 G3 | F3 F3 C4 F3 G3 G3 D4 G3 | C3 C3 G3 C3 C3:4 |',
    drums: 'k.h.s.h.k.k.s.h.',
  },
  cave: {
    bpm: 84,
    lead: 'A4:2 C5 E5 D5:2 C5 B4 | A4:4 .:2 E4:2 | F4:2 A4 C5 B4:2 A4 G#4 | A4:6 .:2 |'
      + ' C5:2 E5 A5 G5:2 E5 C5 | D5:4 .:2 B4:2 | C5 B4 A4 G#4 A4 B4 C5 E5 | A4:6 .:2 |',
    bass: 'A2:4 E3:4 | A2:4 E3:4 | F2:4 C3:4 | E2:4 E3:4 | A2:4 E3:4 | G2:4 D3:4 | F2:4 E2:4 | A2:8 |',
    drums: 'k.......h.......',
    wave: 'triangle',
  },
  gomme: {
    bpm: 120,
    lead: 'E5 E5 .:2 D#5 E5 G5:2 | F5 E5 D5 B4 C5:4 | E5 E5 .:2 D#5 E5 A5:2 | G#5:4 E5:4 |'
      + ' A4 C5 E5 A5 G#5 E5 C5 A4 | B4 D5 F5 B5 A5 F5 D5 B4 | C5 E5 A5 C6 B5 G#5 E5 B4 | A4:6 .:2 |',
    bass: 'A2 A2 E3 A2 A2 A2 E3 A2 | D3 D3 A3 D3 E3 E3 B3 E3 | A2 A2 E3 A2 A2 A2 E3 A2 | E3 E3 B3 E3 E3 E3 G#3 E3 |'
      + ' A2 A2 E3 A2 A2 A2 E3 A2 | D3 D3 A3 D3 D3 D3 A3 D3 | C3 C3 G3 C3 E3 E3 B3 E3 | A2 A2 E3 A2 A2:4 |',
    drums: 'k.s.k.s.k.s.k.ss',
  },
  edge: {
    bpm: 72,
    lead: 'E5:4 D5:2 C5:2 | G4:8 | A4:4 B4:2 C5:2 | D5:8 | E5:4 G5:2 E5:2 | D5:4 C5:4 | A4:2 C5:2 B4:2 G4:2 | C5:8 |',
    bass: 'C3:8 | E3:8 | F3:8 | G3:8 | A3:8 | F3:8 | D3:4 G3:4 | C3:8 |',
    wave: 'triangle',
  },
  center: {
    bpm: 100,
    lead: 'C5 E5 G5 E5 C6:2 G5:2 | A5 F5 C5 F5 A5:2 G5:2 | F5 D5 B4 D5 G5:2 F5:2 | E5 C5 G4 C5 E5:4 |',
    bass: 'C3:4 E3:4 | F3:4 A3:4 | G3:4 B3:4 | C3:4 G3:4 |',
    drums: 'k...h...k...h...',
    wave: 'triangle',
  },
  wild: {
    bpm: 156,
    lead: 'A4 C5 E5 A5 G5 E5 C5 E5 | F5 E5 D5 C5 B4 C5 D5 B4 | A4 C5 E5 A5 G5 A5 B5 C6 | B5 G5 E5 B4 E5:4 |'
      + ' C6 B5 A5 G5 F5 E5 D5 C5 | D5 E5 F5 G5 A5 G5 F5 E5 | F5 G5 A5 B5 C6 B5 A5 G#5 | A5:4 E5:4 |',
    bass: 'A2 A3 A2 A3 A2 A3 A2 A3 | D3 D4 D3 D4 E3 E4 E3 E4 | A2 A3 A2 A3 F2 F3 F2 F3 | E3 E4 E3 E4 E3 E4 E3 E4 |'
      + ' F2 F3 F2 F3 C3 C4 C3 C4 | D3 D4 D3 D4 E3 E4 E3 E4 | F3 F4 F3 F4 E3 E4 E3 E4 | A2 A3 A2 A3 E3 E4 E3 E4 |',
    drums: 'k.hsk.hsk.hsk.hs',
  },
  trainer: {
    bpm: 160,
    lead: 'D5 F5 A5 D6 C6 A5 F5 A5 | G5 A5 A#5 A5 G5 F5 E5 C5 | D5 F5 A5 D6 E6 D6 C6 A5 | A#5 A5 G5 E5 F5:4 |'
      + ' A#5 A5 G5 F5 E5 F5 G5 A5 | C6 A#5 A5 G5 F5 E5 D5 E5 | F5 G5 A5 C6 D6 C6 A5 F5 | E5 C#5 E5 A5 D5:4 |',
    bass: 'D3 D4 D3 D4 D3 D4 D3 D4 | G2 G3 G2 G3 C3 C4 C3 C4 | D3 D4 D3 D4 A2 A3 A2 A3 | A#2 A#3 C3 C4 F3 F4 F3 F4 |'
      + ' A#2 A#3 A#2 A#3 C3 C4 C3 C4 | F3 F4 F3 F4 G3 G4 G3 G4 | D3 D4 D3 D4 A#2 A#3 A#2 A#3 | A2 A3 A2 A3 D3 D4 D3 D4 |',
    drums: 'k.hsk.hsk.hsk.ss',
  },
  leader: {
    bpm: 168,
    lead: 'E5 E5 G5 E5 B5 A5 G5 E5 | D5 D5 F#5 D5 A5 G5 F#5 D5 | C5 E5 G5 C6 B5 G5 E5 G5 | F#5 A5 B5 D6 B5:4 |'
      + ' E6 D6 B5 G5 A5 B5 G5 E5 | D6 C6 A5 F#5 G5 A5 F#5 D5 | C6 B5 A5 G5 F#5 G5 A5 F#5 | E5:4 B4:4 |',
    bass: 'E3 E4 E3 E4 E3 E4 E3 E4 | D3 D4 D3 D4 D3 D4 D3 D4 | C3 C4 C3 C4 C3 C4 C3 C4 | B2 B3 B2 B3 B2 B3 B2 B3 |'
      + ' E3 E4 E3 E4 C3 C4 C3 C4 | D3 D4 D3 D4 B2 B3 B2 B3 | A2 A3 A2 A3 B2 B3 B2 B3 | E3 E4 E3 E4 B2 B3 B2 B3 |',
    drums: 'k.hsk.hsk.hsk.ss',
  },
  final: {
    bpm: 150,
    lead: 'C5 D#5 G5 C6 B5 G5 D#5 G5 | G#5 G5 F5 D#5 D5 D#5 F5 D5 | C5 D#5 G5 C6 D6 C6 B5 G5 | G#5 G5 F5 D5 G5:4 |'
      + ' D#6 D6 C6 G#5 G5 G#5 G5 F5 | D#5 F5 G5 G#5 G5 F5 D#5 D5 | C5 D5 D#5 F5 G5 G#5 B5 D6 | C6:4 G5:4 |',
    bass: 'C3 C4 C3 C4 C3 C4 C3 C4 | F2 F3 F2 F3 G2 G3 G2 G3 | C3 C4 C3 C4 G#2 G#3 G#2 G#3 | F2 F3 F2 F3 G2 G3 G2 G3 |'
      + ' G#2 G#3 G#2 G#3 D#3 D#4 D#3 D#4 | F2 F3 F2 F3 G2 G3 G2 G3 | G#2 G#3 G#2 G#3 G2 G3 G2 G3 | C3 C4 C3 C4 G2 G3 G2 G3 |',
    drums: 'k.hsk.hsk.ksk.ss',
  },
  ending: {
    bpm: 80,
    lead: 'G4 C5 E5:2 D5 C5 G4:2 | A4 C5 F5:2 E5 D5 C5:2 | B4 D5 G5:2 F5 E5 D5:2 | E5:6 .:2 |'
      + ' C5 E5 G5:2 A5 G5 E5:2 | F5 E5 D5:2 C5 D5 E5:2 | D5 C5 B4 C5 D5:2 G4:2 | C5:6 .:2 |',
    bass: 'C3:4 E3:4 | F3:4 A3:4 | G3:4 B3:4 | C3:4 G3:4 | A3:4 E3:4 | F3:4 C3:4 | G3:4 G2:4 | C3:8 |',
    wave: 'triangle',
  },
};

const NOTE: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

/** "C#5" → frequency; "." → null. */
function freq(n: string): number | null {
  if (n === '.') return null;
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return null;
  const midi = (Number(m[2]) + 1) * 12 + NOTE[m[1]];
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Parses a pattern into [frequency|null, length in eighths]. */
export function parse(pattern: string): [number | null, number][] {
  return pattern
    .split(/\s+/)
    .filter((t) => t && t !== '|')
    .map((t) => {
      const [n, len] = t.split(':');
      return [freq(n), len ? Number(len) : 1];
    });
}

/** Total length in eighths (lead and bass of a track must match). */
export const lengthOf = (pattern: string) => parse(pattern).reduce((a, [, l]) => a + l, 0);

export function trackIds(): TrackId[] {
  return Object.keys(TRACKS) as TrackId[];
}
export function trackLengths(id: TrackId): { lead: number; bass: number; drums: number } {
  const t = TRACKS[id];
  return { lead: lengthOf(t.lead), bass: lengthOf(t.bass), drums: t.drums?.length ?? 0 };
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: TrackId | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let noise: AudioBuffer | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0.11;
      master.connect(ctx.destination);
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, f: number, t: number, dur: number, wave: OscillatorType, vol: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = wave;
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.setValueAtTime(vol * 0.8, t + dur * 0.6);
  g.gain.linearRampToValueAtTime(0, t + dur * 0.95);
  o.connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur);
}

function drum(c: AudioContext, kind: string, t: number) {
  if (kind === 'k') {
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g).connect(master!);
    o.start(t);
    o.stop(t + 0.15);
    return;
  }
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = kind === 'h' ? 'highpass' : 'bandpass';
  f.frequency.value = kind === 'h' ? 7000 : 1800;
  const g = c.createGain();
  const len = kind === 'h' ? 0.04 : 0.1;
  g.gain.setValueAtTime(kind === 'h' ? 0.25 : 0.45, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  s.connect(f).connect(g).connect(master!);
  s.start(t);
  s.stop(t + len);
}

/** Length of one loop of a tune, in seconds. */
export function trackSeconds(id: TrackId): number {
  const t = TRACKS[id];
  return (lengthOf(t.lead) * 60) / t.bpm / 2;
}

let startedAt = 0;

/** How far the playing tune is into its loop (seconds), 0 when nothing plays. */
export function musicPosition(): number {
  if (!ctx || !current || !timer) return 0;
  return Math.max(0, ctx.currentTime - startedAt) % trackSeconds(current);
}

/**
 * Starts a looping tune (no-op if it is already playing or music is off). `force`: the music box
 * plays even when the music option is off.
 */
export function playMusic(id: TrackId, force = false) {
  if (!force && (!prefs.value.music || !prefs.value.sound)) return stopMusic();
  if (current === id && timer) return;
  stopMusic();
  const c = audio();
  if (!c) return;
  current = id;
  const tr = TRACKS[id];
  const eighth = 60 / tr.bpm / 2;
  const voices = [
    { notes: parse(tr.lead), wave: tr.wave ?? 'square', vol: tr.wave === 'triangle' ? 0.5 : 0.22, i: 0, at: 0 },
    { notes: parse(tr.bass), wave: 'triangle' as OscillatorType, vol: 0.55, i: 0, at: 0 },
  ];
  const drums = tr.drums ?? '';
  let drumStep = 0;
  let drumAt = 0;
  const start = c.currentTime + 0.08;
  startedAt = start;
  for (const v of voices) v.at = start;
  drumAt = start;
  const tick = () => {
    const horizon = c.currentTime + 0.25;
    for (const v of voices) {
      while (v.at < horizon) {
        const [f, len] = v.notes[v.i];
        if (f) tone(c, f, v.at, len * eighth, v.wave, v.vol);
        v.at += len * eighth;
        v.i = (v.i + 1) % v.notes.length;
      }
    }
    if (drums) {
      while (drumAt < horizon) {
        const k = drums[drumStep];
        if (k !== '.') drum(c, k, drumAt);
        drumAt += eighth;
        drumStep = (drumStep + 1) % drums.length;
      }
    }
  };
  tick();
  timer = setInterval(tick, 60);
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  current = null;
  if (master && ctx) {
    // cut the notes already scheduled
    master.disconnect();
    master = null;
  }
}

// browsers only start sound after a touch or a key press
if (typeof window !== 'undefined') {
  const unlock = () => void ctx?.resume();
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
}

export function currentTrack(): TrackId | null {
  return current;
}
