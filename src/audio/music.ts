/**
 * Plays the game's tunes from their recordings (`src/audio/recordings/<id>.m4a`, made by `npm run music`
 * from the notes of `tunes.ts`). Reading a recording costs a phone almost nothing, so the music never
 * crackles. Each file name carries a hash of its content: a re-recorded tune is downloaded again, the
 * others stay cached.
 *
 * `preloadMusic()` downloads every recording in the background when the game starts. They stay
 * compressed (4 MB) and are decoded only when played: decoded, all of them would take about 100 MB, so
 * only the jingles and the last few tunes are kept decoded.
 */
import { prefs } from '../state/prefs';
import { LOOP_MARGIN, jingleIds, trackIds, trackSeconds, type JingleId, type TrackId } from './tunes';

export { jingleIds, trackIds, trackSeconds, type JingleId, type TrackId } from './tunes';

type TuneId = TrackId | JingleId;
interface Sound {
  src: AudioBufferSourceNode;
  gain: GainNode;
}

const FILES = import.meta.glob<string>('./recordings/*.m4a', { query: '?url', import: 'default', eager: true });
const urlOf = (id: TuneId): string | undefined => FILES[`./recordings/${id}.m4a`];
const isTrack = new Set<TuneId>(trackIds());

let ctx: AudioContext | null = null;
/** The tune playing or loading. */
let current: TrackId | null = null;
let playing: (Sound & { id: TrackId }) | null = null;
let jingle: Sound | null = null;
let startedAt = 0;
/** Each play or stop moves it on, so a recording that finishes loading late doesn't start. */
let turn = 0;

function audio(): AudioContext | null {
  try {
    // music needs no quick reaction: a bigger buffer keeps it steady on a busy phone
    ctx ??= new AudioContext({ latencyHint: 'playback' });
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** The compressed recordings, downloaded once. */
const files = new Map<TuneId, Promise<ArrayBuffer | null>>();

function download(id: TuneId): Promise<ArrayBuffer | null> {
  let p = files.get(id);
  if (!p) {
    const url = urlOf(id);
    p = url ? fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null) : Promise.resolve(null);
    // a failed download is tried again next time
    void p.then((b) => b || files.delete(id));
    files.set(id, p);
  }
  return p;
}

/** Downloads every recording, one after the other, the title theme and the jingles first. */
export async function preloadMusic() {
  for (const id of new Set<TuneId>(['title', ...jingleIds(), ...trackIds()])) await download(id);
}

/** Decoded recordings, the most recent last. */
const decoded = new Map<TuneId, Promise<AudioBuffer | null>>();
/** Tunes kept decoded besides the jingles (a few megabytes each). */
const KEEP = 3;

/**
 * Blends the last moments of a tune's loop into the music just before its start, so the jump back to
 * the start is seamless whatever the encoder changed on either side.
 */
function smoothSeam(buf: AudioBuffer, id: TrackId) {
  const sr = buf.sampleRate, loop = trackSeconds(id) * sr, end = Math.floor((LOOP_MARGIN + trackSeconds(id)) * sr);
  const n = Math.round(0.02 * sr);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch);
    for (let k = 0; k <= n + 1 && end - n + k + 1 < d.length; k++) {
      const i = end - n + k, at = i - loop, j = Math.floor(at), fr = at - j, w = Math.min(1, (k + 1) / n);
      d[i] = d[i] * (1 - w) + (d[j] * (1 - fr) + d[j + 1] * fr) * w;
    }
  }
  return buf;
}

function load(c: AudioContext, id: TuneId): Promise<AudioBuffer | null> {
  let p = decoded.get(id);
  if (p) decoded.delete(id);
  // decodeAudioData takes the bytes it is given: it gets a copy, the download stays for next time
  else
    p = download(id)
      .then((b) => (b ? c.decodeAudioData(b.slice(0)) : null))
      .then((buf) => (buf && isTrack.has(id) ? smoothSeam(buf, id as TrackId) : buf))
      .catch(() => null);
  void p.then((b) => b || decoded.delete(id));
  decoded.set(id, p);
  const tunes = [...decoded.keys()].filter((k) => isTrack.has(k));
  for (const old of tunes.slice(0, Math.max(0, tunes.length - KEEP))) decoded.delete(old);
  return p;
}

/** Starts a recording now, rising from silence over `fadeIn` seconds; a tune loops. */
function start(c: AudioContext, buf: AudioBuffer, fadeIn: number, loop: TrackId | null): Sound & { t: number } {
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  const t = c.currentTime + 0.02;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(1, t + fadeIn);
  src.connect(gain).connect(c.destination);
  if (loop) {
    src.loop = true;
    src.loopStart = LOOP_MARGIN;
    src.loopEnd = LOOP_MARGIN + trackSeconds(loop);
  }
  src.start(t, loop ? LOOP_MARGIN : 0);
  return { src, gain, t };
}

/** Stops a recording in a few milliseconds, without a click. */
function cut(c: AudioContext, s: Sound) {
  const g = s.gain.gain, t = c.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0, t + 0.04);
  s.src.stop(t + 0.05);
}

/** How far the playing tune is into its loop (seconds), 0 when nothing plays. */
export function musicPosition(): number {
  if (!ctx || !playing) return 0;
  return Math.max(0, ctx.currentTime - startedAt) % trackSeconds(playing.id);
}

/**
 * Starts a looping tune (no-op if it is already playing or music is off). `force`: the music box
 * plays even when the music option is off. `fadeIn`: seconds to rise from silence (the prologue).
 */
export function playMusic(id: TrackId, force = false, fadeIn = 0) {
  if (!force && (!prefs.value.music || !prefs.value.sound)) return stopMusic();
  if (current === id) return;
  stopMusic();
  const c = audio();
  if (!c) return;
  current = id;
  const mine = turn;
  void load(c, id).then((buf) => {
    if (!buf || mine !== turn) return;
    // a short rise even without a fade: the recording starts on the notes still ringing from its end
    const { src, gain, t } = start(c, buf, Math.max(0.15, fadeIn), id);
    playing = { id, src, gain };
    startedAt = t;
  });
}

export function stopMusic() {
  turn++;
  current = null;
  if (ctx) {
    if (playing) cut(ctx, playing);
    if (jingle) cut(ctx, jingle);
  }
  playing = null;
  jingle = null;
}

/** Lowers the music to silence over `seconds`, then stops it (unless another tune started meanwhile). */
export function fadeOutMusic(seconds: number) {
  if (!ctx || !playing) return stopMusic();
  const p = playing, g = p.gain.gain, t = ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0.0001, t + seconds);
  setTimeout(() => {
    if (playing === p) stopMusic();
  }, seconds * 1000);
}

let jingleTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Plays a jingle once over the music (which stops), then brings the music back (unless `resume` is
 * false or something else started meanwhile). With the music off, `fallback` (a short sound effect)
 * plays instead.
 */
export function playJingle(id: JingleId, opts: { fallback?: () => void; resume?: boolean; force?: boolean } = {}) {
  if (!opts.force && (!prefs.value.music || !prefs.value.sound)) {
    opts.fallback?.();
    return;
  }
  const back = opts.resume === false ? null : current ?? resumeAfter;
  stopMusic();
  const c = audio();
  if (!c) return;
  resumeAfter = back;
  const mine = turn;
  void load(c, id).then((buf) => {
    if (mine !== turn) return;
    if (buf) {
      const s = start(c, buf, 0.005, null);
      jingle = s;
      s.src.onended = () => {
        if (jingle === s) jingle = null;
      };
    }
    if (jingleTimer) clearTimeout(jingleTimer);
    jingleTimer = setTimeout(() => {
      jingleTimer = null;
      const again = resumeAfter;
      resumeAfter = null;
      if (!current && again) playMusic(again);
    }, buf ? (trackSeconds(id) + 0.4) * 1000 : 0);
  });
}
/** The tune to bring back once the jingle is over. */
let resumeAfter: TrackId | null = null;

// browsers only start sound after a touch or a key press
if (typeof window !== 'undefined') {
  const unlock = () => void ctx?.resume();
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
}

export function currentTrack(): TrackId | null {
  return current;
}
