/**
 * The music box the tunes are recorded on (`npm run music`, in Chrome, on an OfflineAudioContext): the
 * melody on a music box, the bass on a felt piano, the harmony or arpeggio on chimes, brushes, a shaker, a
 * wood block and a little bell for drums, all in a small room with a gentle compressor.
 *
 * A tune is recorded from its second loop on, so the notes still ringing from the loop before are
 * there at its start, and its randomness (each note a few cents off, as if played by hand) is seeded
 * by the note's place in the tune: every loop is the same, and the recording loops without a seam.
 */
import { JINGLES, LOOP_MARGIN, TRACKS, drumHits, parse, trackSeconds, type JingleId, type TrackId, type Voice } from '../../src/audio/tunes';

/** Loudness of the recordings, the same as the 8-bit music had beside the sound effects. */
const LEVEL = 0.042;
/** Seconds played before the recorded loop starts: longer than any note and its echo ring. */
const LEAD = 5;
/** Seconds recorded after a jingle, while it rings out. */
const TAIL = 2.5;

let seed = 1;
function reseed(n: number) {
  seed = n >>> 0 || 1;
}
/** mulberry32 */
function rand(): number {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
/** Played by hand, never quite in tune: a few cents either way. */
const wobble = (cents: number) => (rand() - 0.5) * cents;

/** Where every note goes: straight through a little warmth (`dry`) and into the reverb (`wet`). */
interface Room {
  c: BaseAudioContext;
  dry: AudioNode;
  wet: AudioNode;
  noise: AudioBuffer;
}

function room(c: BaseAudioContext): Room {
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 3;
  comp.attack.value = 0.01;
  comp.release.value = 0.2;
  comp.connect(c.destination);
  const master = c.createGain();
  master.gain.value = LEVEL;
  master.connect(comp);
  const dry = c.createBiquadFilter();
  dry.type = 'lowpass';
  dry.frequency.value = 6500;
  dry.connect(master);
  const wet = c.createGain();
  wet.gain.value = 0.32;
  const reverb = c.createConvolver();
  reverb.buffer = echo(c);
  wet.connect(reverb).connect(master);
  reseed(4242);
  const noise = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = rand() * 2 - 1;
  return { c, dry, wet, noise };
}

/** A small room's echo: two seconds of noise dying away, smoothed a little so it sounds soft. */
function echo(c: BaseAudioContext): AudioBuffer {
  reseed(777);
  const len = Math.floor(c.sampleRate * 2.4);
  const b = c.createBuffer(1, len, c.sampleRate);
  const d = b.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < len; i++) {
    prev = prev * 0.55 + (rand() * 2 - 1) * Math.exp((-3.2 * i) / c.sampleRate) * 0.45;
    d[i] = prev;
  }
  return b;
}

function out(r: Room, node: AudioNode, wet = true) {
  node.connect(r.dry);
  if (wet) node.connect(r.wet);
}

function osc(c: BaseAudioContext, type: OscillatorType, f: number, cents = 0): OscillatorNode {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = cents;
  return o;
}

/** [frequency ratio, level, how long it rings compared with the fundamental] */
type Overtone = [number, number, number];
const MUSIC_BOX: Overtone[] = [[1, 1, 1], [2, 0.22, 0.6], [4.2, 0.07, 0.3]];
const CHIME: Overtone[] = [[1, 1, 1], [2.76, 0.28, 0.5], [5.4, 0.08, 0.25]];

/**
 * A struck note that rings and fades away, the music box's and the chimes' (`ring`: seconds for a
 * C5, low notes ring longer). `detune` adds an out-of-tune double of the fundamental.
 */
function struck(r: Room, f: number, t: number, dur: number, amp: number, tones: Overtone[], ring: number, detune = 0) {
  const { c } = r;
  const decay = Math.min(ring * (523 / f) ** 0.35, dur * 2.5 + 0.35);
  const parts: [number, number, number, number][] = tones.map(([m, a, k]) => [m, a, k, wobble(9)]);
  if (detune) parts.push([1, 0.7, 1, detune]);
  for (const [m, a, k, cents] of parts) {
    const o = osc(c, 'sine', f * m, cents), g = c.createGain(), end = t + decay * k;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp * a, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    o.connect(g);
    out(r, g);
    o.start(t);
    o.stop(end + 0.02);
  }
}

const chime = (r: Room, f: number, t: number, dur: number, amp: number, detune = 0) => struck(r, f, t, dur, amp, CHIME, 1.2, detune);

/** A felt piano: a soft hammer, its tone darkening as the note fades, a short release. */
function piano(r: Room, f: number, t: number, dur: number, amp: number) {
  const { c } = r;
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.Q.value = 0.6;
  fl.frequency.setValueAtTime(Math.min(1500, f * 8), t);
  fl.frequency.setTargetAtTime(Math.max(300, f * 1.5), t + 0.02, 0.35);
  const g = c.createGain(), end = t + Math.max(dur, 0.12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.008);
  g.gain.setTargetAtTime(amp * 0.25, t + 0.01, 0.6);
  g.gain.setTargetAtTime(0.0001, end, 0.09);
  fl.connect(g);
  out(r, g);
  for (const [type, m, a, cents] of [['triangle', 1, 1, 0], ['sine', 1, 0.6, 5], ['sine', 2, 0.18, -3]] as const) {
    const o = osc(c, type, f * m, cents + wobble(6)), og = c.createGain();
    og.gain.value = a;
    o.connect(og).connect(fl);
    o.start(t);
    o.stop(end + 0.6);
  }
}

/** Plays one note of a voice: the melody on a music box, the bass on a felt piano, the harmony on chimes. */
function play(r: Room, role: number, v: Voice, f: number, t: number, dur: number, soft = 1) {
  if (role === 0) struck(r, f, t, dur, soft, MUSIC_BOX, 1.7, v.detune);
  else if (role === 1) piano(r, f, t, dur, 0.85 * soft);
  else chime(r, f, t, dur, 0.42 * soft, v.detune);
}

/** A soft burst of filtered noise: brushes and shakers. */
function hiss(r: Room, type: BiquadFilterType, hz: number, q: number, vol: number, attack: number, len: number, t: number) {
  const { c } = r;
  const s = c.createBufferSource();
  s.buffer = r.noise;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = hz;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(f).connect(g);
  out(r, g);
  // from a different place in the noise each time, so no two hits sound the same
  s.start(t, rand() * 0.5);
  s.stop(t + len + 0.02);
}

/** Brushes, a shaker, a wood block and a little bell keep the beat, softly. */
function drum(r: Room, kind: string, t: number) {
  const { c } = r;
  const lvl = 0.45;
  if (kind === 'k' || kind === 't') {
    // a soft kick (dry), or a low tom ringing in the room: [from, to, glide, length, volume]
    const [from, to, glide, len, vol] = kind === 'k' ? [110, 48, 0.14, 0.18, 0.55] : [160, 100, 0.25, 0.3, 0.45];
    const o = osc(c, 'sine', from), g = c.createGain();
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + glide);
    g.gain.setValueAtTime(vol * lvl, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(g);
    out(r, g, kind === 't');
    o.start(t);
    o.stop(t + len + 0.02);
    return;
  }
  if (kind === 'r') {
    for (const [m, a] of [[1, 1], [1.5, 0.4]]) {
      const o = osc(c, 'sine', 950 * m), g = c.createGain();
      g.gain.setValueAtTime(0.22 * lvl * a, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      o.connect(g);
      out(r, g);
      o.start(t);
      o.stop(t + 0.08);
    }
    return;
  }
  if (kind === 'c') {
    chime(r, 2093, t, 0.6, 0.25 * lvl);
    chime(r, 1568, t, 0.6, 0.18 * lvl);
    return;
  }
  // [filter, frequency, resonance, volume, attack, length]
  const [type, hz, q, vol, attack, len]: [BiquadFilterType, number, number, number, number, number] =
    kind === 'h' ? ['highpass', 7500, 0.7, 0.055, 0.006, 0.05]
      : kind === 'o' ? ['highpass', 6500, 0.7, 0.06, 0.01, 0.14]
        : ['bandpass', 2300, 0.8, 0.17, 0.012, 0.17];
  hiss(r, type, hz, q, vol * lvl, attack, len, t);
}

/**
 * Plays a tune into an offline context: a jingle once, a tune loop after loop until `until` seconds.
 * Returns the context, ready to render.
 */
function perform(id: TrackId | JingleId, sampleRate: number): { c: OfflineAudioContext; from: number; to: number } {
  const loops = id in TRACKS;
  const tr = loops ? TRACKS[id as TrackId] : JINGLES[id as JingleId];
  const from = loops ? LEAD : 0;
  const to = loops ? LEAD + trackSeconds(id) + 2 * LOOP_MARGIN : trackSeconds(id) + TAIL;
  const c = new OfflineAudioContext(1, Math.ceil(to * sampleRate), sampleRate);
  const r = room(c);
  const eighth = 60 / tr.bpm / 2;
  const swing = (tr.swing ?? 0) * eighth;
  // time of a position counted in eighths: off-beat eighths come a little late with a shuffle
  const at = (pos: number) => pos * eighth + (swing && Math.abs((pos % 2) - 1) < 1e-6 ? swing : 0);
  tr.voices.forEach((v, role) => {
    const notes = parse(v.notes);
    let pos = 0;
    for (let i = 0; at(pos) < to && (loops || i < notes.length); i = (i + 1) % notes.length) {
      const [f, len] = notes[i];
      const t0 = at(pos), t1 = at(pos + len);
      if (f) {
        reseed(role * 10007 + i + 1);
        play(r, role, v, f, t0, t1 - t0);
        if (v.echo) play(r, role, v, f, t0 + v.echo * eighth, t1 - t0, 0.3);
      }
      pos += len;
      if (!loops && i === notes.length - 1) break;
    }
  });
  const hits = drumHits(tr), step = tr.drumStep ?? 1;
  for (let k = 0; hits && at(k * step) < to && (loops || k < hits.length); k++) {
    const kind = hits[k % hits.length];
    reseed(900001 + (k % hits.length));
    if (kind !== '.') drum(r, kind, at(k * step));
  }
  return { c, from, to };
}

/** 16-bit mono WAV, base64 (to hand back to Node). */
function wav(pcm: Float32Array, sampleRate: number): string {
  const b = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const text = (o: number, s: string) => [...s].forEach((ch, i) => b.setUint8(o + i, ch.charCodeAt(0)));
  text(0, 'RIFF');
  b.setUint32(4, 36 + pcm.length * 2, true);
  text(8, 'WAVEfmt ');
  b.setUint32(16, 16, true);
  b.setUint16(20, 1, true);
  b.setUint16(22, 1, true);
  b.setUint32(24, sampleRate, true);
  b.setUint32(28, sampleRate * 2, true);
  b.setUint16(32, 2, true);
  b.setUint16(34, 16, true);
  text(36, 'data');
  b.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) b.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 32767, true);
  const bytes = new Uint8Array(b.buffer);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Records a tune (its loop, with `LOOP_MARGIN` seconds on each side) or a jingle, as a base64 WAV. */
export async function record(id: TrackId | JingleId, sampleRate = 44100): Promise<{ wav: string; peak: number; seconds: number }> {
  const { c, from, to } = perform(id, sampleRate);
  const all = (await c.startRendering()).getChannelData(0);
  const pcm = all.subarray(Math.round(from * sampleRate), Math.round(to * sampleRate));
  let peak = 0;
  for (const v of pcm) peak = Math.max(peak, Math.abs(v));
  return { wav: wav(pcm, sampleRate), peak, seconds: pcm.length / sampleRate };
}
