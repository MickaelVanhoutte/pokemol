/**
 * Drawing helpers for the planches (src/story/planches.ts): a picture pencilled in or rubbed out stroke by stroke,
 * the pencil and the eraser doing it, crumbs, eyelids, paper grain and a slow camera. Everything is drawn from the
 * time alone, so a canvas Android emptied paints itself again on the next frame.
 */
import { clamp01, easeInOut, lerp, type P } from '../../anim/ease';
import { seeded } from '../paper/pencilCanvas';
import type { Kit } from './planche';

/** The pencil look of the overworld (src/overworld/game.ts): a drawing still in graphite. */
export const SKETCH = 'grayscale(1) contrast(0.55) brightness(1.45)';
/** Only a drawing's pencil lines, dark on white (drawn with `multiply`, the colours stay underneath). */
export const LINES = 'grayscale(1) contrast(1.8) brightness(1.2)';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A `w`×`h` picture fitted in a box, centred. */
export function fit(w: number, h: number, box: Box): Box {
  const s = Math.min(box.w / w, box.h / h);
  return { x: box.x + (box.w - w * s) / 2, y: box.y + (box.h - h * s) / 2, w: w * s, h: h * s };
}

/** A camera key: looking at (`x`, `y`) of the drawing, zoomed `z`, from `at` ms. */
export interface CamKey {
  at: number;
  x: number;
  y: number;
  z: number;
}

/** The camera at `t`, moving smoothly from key to key (`calm`: it stays on the first one). */
export function camAt(keys: CamKey[], t: number, calm = false): CamKey {
  if (calm || t <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t < b.at) {
      const k = easeInOut(clamp01((t - a.at) / (b.at - a.at)));
      return { at: t, x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k) };
    }
  }
  return keys[keys.length - 1];
}

/** Puts the camera on: (`cam.x`, `cam.y`) in the middle of the `w`×`h` screen, zoomed. */
export function look(ctx: CanvasRenderingContext2D, w: number, h: number, cam: CamKey) {
  ctx.translate(w / 2, h / 2);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);
}

/** Paper grain: the same specks every frame. */
export function grain(ctx: CanvasRenderingContext2D, box: Box, seed: number, n = 360, dark = 'rgba(70, 55, 40, 0.10)', light = 'rgba(255, 255, 255, 0.28)') {
  const r = seeded(seed);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = r() < 0.55 ? dark : light;
    ctx.fillRect(box.x + r() * box.w, box.y + r() * box.h, 1 + r() * 1.5, 1);
  }
}

/** One row's zigzag points, back and forth like a hand hatching (always the same ones for a seed). */
function rowPoints(box: Box, rows: number, i: number, r: () => number): P[] {
  const rowH = box.h / rows;
  // an even count, so every row zigzags in step and the rows overlap evenly
  const n = 2 * Math.max(1, Math.ceil(box.w / (rowH * 1.8)));
  const y0 = box.y + (i + 0.5) * rowH;
  const rtl = i % 2 === 1;
  const pts: P[] = [];
  for (let j = 0; j <= n; j++) {
    const u = j / n;
    pts.push([box.x + box.w * (rtl ? 1 - u : u) + (r() - 0.5) * rowH * 0.2, y0 + (j % 2 ? -0.7 : 0.7) * rowH + (r() - 0.5) * rowH * 0.3]);
  }
  return pts;
}

/**
 * Hatching strokes covering `box` row by row from the top as `k` goes from 0 to 1 (all of it at 1), drawn in
 * black on a mask. Returns where the stroke is at (for the pencil or the eraser), or null.
 */
export function hatchMask(m: CanvasRenderingContext2D, box: Box, k: number, seed: number, rows = 9): P | null {
  m.fillStyle = m.strokeStyle = '#000';
  if (k <= 0) return null;
  if (k >= 1) {
    m.fillRect(box.x, box.y, box.w, box.h);
    return null;
  }
  const r = seeded(seed);
  const rowH = box.h / rows;
  m.lineWidth = rowH * 1.6;
  m.lineCap = 'round';
  m.lineJoin = 'round';
  const done = k * rows;
  let tip: P | null = null;
  for (let i = 0; i < rows && i < done; i++) {
    const pts = rowPoints(box, rows, i, r);
    const upTo = Math.min(1, done - i) * (pts.length - 1);
    m.beginPath();
    m.moveTo(pts[0][0], pts[0][1]);
    for (let j = 1; j <= Math.ceil(upTo); j++) {
      const f = Math.min(1, upTo - (j - 1));
      const x = lerp(pts[j - 1][0], pts[j][0], f), y = lerp(pts[j - 1][1], pts[j][1], f);
      m.lineTo(x, y);
      tip = [x, y];
    }
    m.stroke();
  }
  return tip;
}

/**
 * Draws part `box` of picture `img` (in its own pixels; it is drawn at `dest`) through hatching. `in`: that part is
 * pencilled in as `k` goes from 0 to 1, over what is already drawn; `out`: the whole picture is drawn, and that
 * part is rubbed out. `filter`: drawn in graphite (LINES, `blend: 'multiply'`: only the lines darken the paper).
 * Returns the stroke's tip, in the picture's pixels.
 */
export function hatched(
  ctx: CanvasRenderingContext2D, kit: Kit, slot: number, img: HTMLImageElement, dest: Box,
  o: { box: Box; k: number; seed: number; mode: 'in' | 'out'; rows?: number; filter?: string; blend?: GlobalCompositeOperation },
): P | null {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  if (!iw || !ih) return null;
  if (o.mode === 'in' && o.k <= 0) return null;
  ctx.save();
  if (o.blend) ctx.globalCompositeOperation = o.blend;
  const tip = drawHatched(ctx, kit, slot, img, dest, o);
  ctx.restore();
  return tip;
}

function drawHatched(
  ctx: CanvasRenderingContext2D, kit: Kit, slot: number, img: HTMLImageElement, dest: Box,
  o: { box: Box; k: number; seed: number; mode: 'in' | 'out'; rows?: number; filter?: string },
): P | null {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const { box } = o;
  if (o.filter) ctx.filter = o.filter;
  if (o.mode === 'out' && o.k <= 0) {
    ctx.drawImage(img, dest.x, dest.y, dest.w, dest.h);
    ctx.filter = 'none';
    return null;
  }
  if (o.mode === 'in' && o.k >= 1) {
    const sx = dest.w / iw, sy = dest.h / ih;
    ctx.drawImage(img, box.x, box.y, box.w, box.h, dest.x + box.x * sx, dest.y + box.y * sy, box.w * sx, box.h * sy);
    ctx.filter = 'none';
    return null;
  }
  ctx.filter = 'none';
  const pic = kit.scratch(slot, iw, ih), mask = kit.scratch(slot + 1, iw, ih);
  const pc = pic.getContext('2d')!, mc = mask.getContext('2d')!;
  if (o.filter) pc.filter = o.filter;
  pc.drawImage(img, 0, 0);
  pc.filter = 'none';
  mc.save();
  mc.beginPath();
  mc.rect(box.x, box.y, box.w, box.h);
  mc.clip();
  const tip = hatchMask(mc, box, o.k, o.seed, o.rows);
  mc.restore();
  pc.globalCompositeOperation = o.mode === 'in' ? 'destination-in' : 'destination-out';
  pc.drawImage(mask, 0, 0);
  pc.globalCompositeOperation = 'source-over';
  ctx.drawImage(pic, dest.x, dest.y, dest.w, dest.h);
  return tip;
}

/** From the picture's pixels to the screen box it is drawn in. */
export const toDest = (img: { naturalWidth: number; naturalHeight: number }, dest: Box, p: P): P =>
  [dest.x + (p[0] / img.naturalWidth) * dest.w, dest.y + (p[1] / img.naturalHeight) * dest.h];

/** A yellow pencil, its lead at (`x`, `y`), `s` its length. */
export function pencil(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle = -0.8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const k = s / 60;
  ctx.scale(k, k);
  ctx.fillStyle = 'rgba(30, 20, 40, 0.18)';
  ctx.fillRect(4, 1, 60, 10);
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(0, -5, 60, 10);
  ctx.fillStyle = '#d9a63a';
  ctx.fillRect(0, 2, 60, 3);
  ctx.fillStyle = '#e88aa8';
  ctx.fillRect(56, -5, 8, 10);
  ctx.fillStyle = '#e8c9a0';
  ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-13, 0); ctx.lineTo(0, 5); ctx.fill();
  ctx.fillStyle = '#3f3b46';
  ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(-13, 0); ctx.lineTo(-8, 2); ctx.fill();
  ctx.restore();
}

/** A pink eraser in its paper sleeve, rubbing at (`x`, `y`), `s` its length. */
export function eraser(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, angle = -0.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const k = s / 50;
  ctx.scale(k, k);
  ctx.fillStyle = 'rgba(30, 20, 40, 0.2)';
  ctx.fillRect(-6, -8, 50, 18);
  ctx.fillStyle = '#f27fa0';
  ctx.beginPath();
  ctx.roundRect(-10, -11, 22, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#5a7fc0';
  ctx.fillRect(8, -11, 34, 20);
  ctx.fillStyle = '#f5f0e4';
  ctx.fillRect(12, -7, 26, 4);
  ctx.strokeStyle = '#3a3346';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(8, -11, 34, 20);
  ctx.restore();
}

/** Eraser crumbs: `n` of them come off along (`x0`…`x1`, `y`) between `from` and `to` ms and fall `fall` px. */
export function crumbs(ctx: CanvasRenderingContext2D, t: number, o: { x0: number; x1: number; y: number; from: number; to: number; n: number; seed: number; size: number; fall: number; colour?: string }) {
  const r = seeded(o.seed);
  const life = 1300;
  for (let i = 0; i < o.n; i++) {
    const born = lerp(o.from, o.to, r()), x = lerp(o.x0, o.x1, r()), spin = (r() - 0.5) * 0.012, drift = (r() - 0.5) * 0.04;
    const sz = o.size * (0.6 + r() * 0.8), pink = r() < 0.45;
    const age = t - born;
    if (age < 0 || age > life) continue;
    const u = age / life;
    const px = x + drift * age, py = o.y + o.fall * u * u;
    ctx.save();
    ctx.globalAlpha = 1 - clamp01((u - 0.7) / 0.3);
    ctx.translate(px, py);
    ctx.rotate(spin * age);
    ctx.fillStyle = o.colour ?? (pink ? '#e992ae' : '#b9b3c6');
    ctx.fillRect(-sz / 2, -sz / 3, sz, (sz * 2) / 3);
    ctx.strokeStyle = 'rgba(58, 51, 70, 0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-sz / 2, -sz / 3, sz, (sz * 2) / 3);
    ctx.restore();
  }
}

/**
 * Eyelids over a `w`×`h` screen, `l` from 0 (open) to 1 (shut): an almond-shaped opening, the lids meeting at the
 * corners first (the prologue falling asleep, src/ui/views/SleepIntroView.tsx; waking up). `lash`: their edge.
 */
export function lids(e: CanvasRenderingContext2D, w: number, h: number, l: number, fill: string | CanvasGradient = '#07050b', lash?: string) {
  if (l <= 0) return;
  e.fillStyle = fill;
  const edge = (h / 2) * l, corner = Math.min(h / 2 + 2, edge * 1.6 + l * 40), mid = edge * (0.3 + 0.7 * l);
  for (const top of [true, false]) {
    const y = (v: number) => (top ? v : h - v);
    e.beginPath();
    e.moveTo(0, y(0)); e.lineTo(w, y(0)); e.lineTo(w, y(corner));
    e.quadraticCurveTo(w / 2, y(2 * mid - corner), 0, y(corner));
    e.fill();
    if (lash) {
      e.strokeStyle = lash;
      e.lineWidth = 3;
      e.beginPath();
      e.moveTo(w, y(corner));
      e.quadraticCurveTo(w / 2, y(2 * mid - corner), 0, y(corner));
      e.stroke();
    }
  }
}
