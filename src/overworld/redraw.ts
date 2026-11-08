/**
 * The world redrawn in front of you. When a story flag changes a map (a place rubbed out, coloured back
 * in, a sketched hamlet coloured, a wall rising), `redraw(kind)` keeps a picture of the view as it was,
 * rebuilds the map, and takes the old picture away the way the story says:
 *   - `erase`: rubbed out band by band, an eraser at the edge, crumbs behind it;
 *   - `restore`: colour flooding out in a circle, sparkles along its edge;
 *   - `sketch`: pencil strokes hatching the new drawing in, a pencil at their tip;
 *   - `rise`: the new drawing rising from the bottom (a wall going up), dust along its edge.
 * The pure parts (where the change is, how much of it shows at a time) are tested.
 */
import { clamp01, easeIn, easeInOut, easeOut, seg } from '../anim/ease';

export type RedrawKind = 'erase' | 'restore' | 'sketch' | 'rise';

/** How long each redraw takes (ms of scene time: holding B hurries it). */
export const REDRAW_MS: Record<RedrawKind, number> = { erase: 1700, restore: 1900, sketch: 2300, rise: 1500 };

export interface Rect { x: number; y: number; w: number; h: number }

/** The tiles that differ between two versions of a map (same size), as a rectangle of tiles, or null. */
export function changedBounds(before: string[], after: string[], w: number): Rect | null {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  const n = Math.min(before.length, after.length);
  for (let i = 0; i < n; i++) {
    if (before[i] === after[i]) continue;
    const x = i % w, y = Math.floor(i / w);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Bands of an eraser sweep: for each band, how far along it the new drawing shows (0 to 1). */
export function eraseBands(t: number, bands: number): number[] {
  return Array.from({ length: bands }, (_, i) => easeInOut(seg(t, i * 0.07, i * 0.07 + 0.55)));
}

/** The colour flood's radius, as a share of the farthest corner. */
export const restoreRadius = (t: number) => easeIn(clamp01(t)) * 1.06;

/** Pencil strokes hatching the new drawing in: how much of each stroke is drawn (0 to 1). */
export function sketchStrokes(t: number, strokes: number): number[] {
  const done = clamp01(t) * strokes * 1.15;
  return Array.from({ length: strokes }, (_, i) => easeOut(clamp01(done - i)));
}

/** The rising drawing's height, as a share of the area. */
export const riseHeight = (t: number) => easeOut(clamp01(t));
