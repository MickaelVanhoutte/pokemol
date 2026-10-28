/**
 * The player's own drawing (the Atelier des Brouillons, src/data/custom.ts): trimmed to what was drawn, and its
 * overworld miniature made in the browser, like `npm run minis` makes the others (tools/minis.ts).
 * Pure functions on RGBA pixels, so they run in the browser and in tests.
 */
import { pixelize, type Rgba } from './mini';

/** Largest miniature before its outline, as tools/minis.ts: about one map tile. */
export const MINI_W = 18, MINI_H = 16;

/** The box around what was drawn (alpha above 5), with a small margin; null for an empty sheet. */
export function drawnBox(img: Rgba, margin = 6): { x: number; y: number; w: number; h: number } | null {
  const { width: w, height: h, data } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 5) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  x0 = Math.max(0, x0 - margin);
  y0 = Math.max(0, y0 - margin);
  x1 = Math.min(w - 1, x1 + margin);
  y1 = Math.min(h - 1, y1 + margin);
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * The miniature of a trimmed drawing. A child's pencil lines are thin: shrunk by averaging they would vanish, so
 * a pixel of the miniature is drawn as soon as a little of its square is drawn (the average colour of what is),
 * and what the lines enclose is filled with paper, so the miniature reads as a shape. Then the pixel-art pass of
 * the other miniatures (a few flat colours, a dark outline).
 */
export function miniOfDrawing(img: Rgba): Rgba {
  const { width: w, height: h, data } = img;
  const k = Math.min(MINI_W / w, MINI_H / h);
  const mw = Math.max(1, Math.round(w * k)), mh = Math.max(1, Math.round(h * k));
  const out = new Uint8ClampedArray(mw * mh * 4);
  for (let cy = 0; cy < mh; cy++) {
    for (let cx = 0; cx < mw; cx++) {
      const sx0 = Math.floor((cx * w) / mw), sx1 = Math.max(sx0 + 1, Math.floor(((cx + 1) * w) / mw));
      const sy0 = Math.floor((cy * h) / mh), sy1 = Math.max(sy0 + 1, Math.floor(((cy + 1) * h) / mh));
      let n = 0, r = 0, g = 0, b = 0;
      for (let y = sy0; y < sy1; y++) {
        for (let x = sx0; x < sx1; x++) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 40) continue;
          n++;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
      }
      if (n / ((sx1 - sx0) * (sy1 - sy0)) < 0.06) continue;
      // brighter, like the others (saturation 1.6, brightness 0.96)
      const c = [r / n, g / n, b / n];
      const l = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
      const o = (cy * mw + cx) * 4;
      for (let j = 0; j < 3; j++) out[o + j] = Math.max(0, Math.min(255, (l + (c[j] - l) * 1.6) * 0.96));
      out[o + 3] = 255;
    }
  }
  // what the lines enclose: every empty pixel the outside can't reach is paper
  const outside = new Uint8Array(mw * mh);
  const stack: number[] = [];
  for (let x = 0; x < mw; x++) stack.push(x, (mh - 1) * mw + x);
  for (let y = 0; y < mh; y++) stack.push(y * mw, y * mw + mw - 1);
  while (stack.length) {
    const i = stack.pop()!;
    if (outside[i] || out[i * 4 + 3]) continue;
    outside[i] = 1;
    const x = i % mw, y = (i - x) / mw;
    if (x > 0) stack.push(i - 1);
    if (x < mw - 1) stack.push(i + 1);
    if (y > 0) stack.push(i - mw);
    if (y < mh - 1) stack.push(i + mw);
  }
  for (let i = 0; i < mw * mh; i++) {
    if (out[i * 4 + 3] || outside[i]) continue;
    out.set([250, 246, 236, 255], i * 4);
  }
  return pixelize({ data: out, width: mw, height: mh });
}

/** Grows the set pixels of a mask by `r` (a square around each), in two passes. */
function dilate(mask: Uint8Array, w: number, h: number, r: number): Uint8Array {
  if (r <= 0) return mask;
  const row = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let run = -1;
    for (let x = 0; x < w; x++) if (mask[y * w + x]) run = x; else if (run >= 0 && x - run <= r) row[y * w + x] = 1;
    run = -1;
    for (let x = w - 1; x >= 0; x--) if (mask[y * w + x]) { run = x; row[y * w + x] = 1; } else if (run >= 0 && run - x <= r) row[y * w + x] = 1;
  }
  for (let x = 0; x < w; x++) {
    let run = -1;
    for (let y = 0; y < h; y++) if (row[y * w + x]) run = y; else if (run >= 0 && y - run <= r) out[y * w + x] = 1;
    run = -1;
    for (let y = h - 1; y >= 0; y--) if (row[y * w + x]) { run = y; out[y * w + x] = 1; } else if (run >= 0 && run - y <= r) out[y * w + x] = 1;
  }
  return out;
}

/**
 * The area a tap of the fill pencil colours in: on the paper, what the lines around the point enclose (gaps of a
 * hand-drawn line up to about `gap` × 2 pixels are closed), grown back a little so the crayon runs under the lines;
 * on a colour, the patch of that colour. Null when the area reaches the edge of the sheet (the outline isn't
 * closed: filling would colour the whole page).
 */
export function fillArea(img: Rgba, px: number, py: number, gap = 3): Uint8Array | null {
  const { width: w, height: h, data } = img;
  const x0 = Math.round(px), y0 = Math.round(py);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return null;
  const at = y0 * w + x0;
  const onPaper = data[at * 4 + 3] < 40;
  const [r, g, b] = [data[at * 4], data[at * 4 + 1], data[at * 4 + 2]];
  const wall = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const a = data[i * 4 + 3];
    wall[i] = onPaper ? (a >= 40 ? 1 : 0)
      : a < 40 || (data[i * 4] - r) ** 2 + (data[i * 4 + 1] - g) ** 2 + (data[i * 4 + 2] - b) ** 2 > 60 ** 2 ? 1 : 0;
  }
  // close the little gaps of a hand-drawn line, unless the tap is right against it
  let walls = dilate(wall, w, h, gap);
  if (walls[at]) walls = wall;
  const area = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let n = 0;
  stack[n++] = at;
  area[at] = 1;
  while (n) {
    const i = stack[--n];
    const x = i % w, y = (i - x) / w;
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return null;
    for (const j of [i - 1, i + 1, i - w, i + w]) {
      if (area[j] || walls[j]) continue;
      area[j] = 1;
      stack[n++] = j;
    }
  }
  if (!onPaper) {
    // a colour: the whole patch of it, never over the lines around
    const grown = dilate(area, w, h, gap);
    for (let i = 0; i < w * h; i++) grown[i] &= wall[i] ^ 1;
    return grown;
  }
  return dilate(area, w, h, gap + 2);
}
