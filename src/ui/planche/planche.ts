/**
 * Planches: the story's few big moments drawn full screen, stroke by stroke (src/story/planches.ts). A planche is
 * a drawing function of its time `t` (scene time, so holding B runs it three times faster), beats that change its
 * caption (a press jumps to the next one), and sounds. It shows over the world, under the dialog box and the touch
 * buttons: a script can keep it on screen while someone talks (`withPlanche`).
 */
import { signal } from '@preact/signals';
import type { LText } from '../../i18n';
import type { SoundId } from '../../audio/sfx';

/** A moment of the planche: a press jumps to the next one; `caption` is shown from then on (none: no caption). */
export interface Beat {
  at: number;
  caption?: LText;
}

/** A sound once (`at`), or the pencil scratching / the eraser rubbing between `from` and `to`. */
export type Cue = { at: number; sound: SoundId } | { from: number; to: number; sound: 'pencil' | 'rub' };

/** What a planche draws with: its pictures, loaded before it starts, and work canvases kept while it plays. */
export interface Kit {
  img(name: string): HTMLImageElement | undefined;
  /** A work canvas `i`, `w`×`h` and cleared. */
  scratch(i: number, w: number, h: number): HTMLCanvasElement;
  /** MOUVEMENTS : DOUX: no zooming or shaking. */
  calm: boolean;
}

export interface Planche {
  id: string;
  /** Its length, in scene ms. */
  ms: number;
  beats: Beat[];
  /** `tap`: it holds its last picture until a press; `auto`: it goes on by itself. */
  end: 'tap' | 'auto';
  /** The pictures it draws, by name (data URLs, made in the browser when it starts). */
  images?: () => Record<string, string>;
  /** Draws the picture at `t` (0…ms, and past `ms` while it holds) on `w`×`h` CSS pixels, everything from `t`. */
  draw(ctx: CanvasRenderingContext2D, t: number, w: number, h: number, kit: Kit): void;
  cues?: Cue[];
  /** See-through: the world shows behind it, through this CSS `backdrop-filter` (waking up: blurred, then sharp). */
  veil?: (t: number) => string;
}

/** The beat showing at `t`. */
export function beatAt(p: Planche, t: number): number {
  let i = 0;
  while (i + 1 < p.beats.length && p.beats[i + 1].at <= t) i++;
  return i;
}

/** Where a press at `t` jumps: the next beat, or the end. */
export function nextStop(p: Planche, t: number): number {
  return p.beats.find((b) => b.at > t)?.at ?? p.ms;
}

/** The one-off sounds whose time comes in (`a`, `b`] (a jump forward plays none: they would all ring at once). */
export function soundsBetween(p: Planche, a: number, b: number): SoundId[] {
  const out: SoundId[] = [];
  for (const c of p.cues ?? []) if ('at' in c && c.at > a && c.at <= b) out.push(c.sound);
  return out;
}

/** The pencil or the eraser heard at `t`. */
export function scratchAt(p: Planche, t: number): 'pencil' | 'rub' | null {
  for (const c of p.cues ?? []) if ('from' in c && t >= c.from && t < c.to) return c.sound;
  return null;
}

// ------------------------------------------------------------------ on screen

interface Run {
  planche: Planche;
  /** Stays on its last picture once it gets there (`withPlanche`), until `closePlanche`. */
  keep: boolean;
  /** Reached its end (kept) or closed. */
  reached: () => void;
  /** Asked to go (kept planches). */
  closing: boolean;
  closed?: () => void;
}

export const plancheOverlay = signal<Run | null>(null);

/** Plays a planche and waits for it (an `end: 'tap'` one waits for a press at the end). */
export function showPlanche(p: Planche): Promise<void> {
  return new Promise((resolve) => (plancheOverlay.value = { planche: p, keep: false, reached: resolve, closing: false }));
}

/** Plays a planche and keeps it on screen while `during` runs (someone talking over it), then it goes. */
export async function withPlanche(p: Planche, during: () => Promise<void>) {
  await new Promise<void>((resolve) => (plancheOverlay.value = { planche: p, keep: true, reached: resolve, closing: false }));
  try {
    await during();
  } finally {
    const run = plancheOverlay.peek();
    if (run?.planche === p) {
      await new Promise<void>((resolve) => {
        run.closed = resolve;
        plancheOverlay.value = { ...run, closing: true };
      });
    }
  }
}

/** Fading out at the end (ms). */
export const PLANCHE_OUT_MS = 350;
