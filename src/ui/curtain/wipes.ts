/**
 * The transitions between screens, drawn in coloured pencil: a cover runs the screen over (green
 * strokes swirling in from the grass, an ink blot in a cave, a watercolour wave on the water, ink
 * hatching for a trainer, eraser bands for Team Gomme, ink splashes for a boss, stars and a rainbow
 * for a legend, a page turning), then a reveal opens the next screen (the page torn open, rubbed
 * away or lifted).
 *
 * Each frame is drawn from scratch from its progress `t` (0 to 1): a canvas whose pixels were
 * dropped (Android, low memory) paints itself again on the next frame.
 */
import { Brush } from '../battle/fx/brush';
import { INK, PAL, PAPER, RAINBOW, SPARK, type Anchor, type Env, type P } from '../battle/fx/core';
import { clamp01, easeIn, easeInOut, easeOut, lerp, seg } from '../../anim/ease';
import type { SoundId } from '../../audio/sfx';

export type CoverKind = 'grass' | 'cave' | 'water' | 'trainer' | 'gomme' | 'boss' | 'legend' | 'page';
export type RevealKind = 'tear' | 'erase' | 'lift' | 'fade';

export const COVER_KINDS: CoverKind[] = ['grass', 'cave', 'water', 'trainer', 'gomme', 'boss', 'legend', 'page'];
export const REVEAL_KINDS: RevealKind[] = ['tear', 'erase', 'lift', 'fade'];

/** How long each cover takes, in ms at normal speed. */
export const COVER_MS: Record<CoverKind, number> = {
  grass: 760, cave: 700, water: 800, trainer: 720, gomme: 780, boss: 900, legend: 1400, page: 440,
};
/** How long each reveal takes, in ms at normal speed. */
export const REVEAL_MS: Record<RevealKind, number> = { tear: 640, erase: 680, lift: 540, fade: 320 };
/** A simple fade, for MOUVEMENTS : DOUX. */
export const CALM_MS = 320;

/** What the screen looks like once covered: a crayon colour hatched over a darker one. */
export const SHEET: Record<CoverKind, { fill: string; hatch: string }> = {
  grass: { fill: '#24401f', hatch: '#3e6a2c' },
  cave: { fill: INK, hatch: '#433a55' },
  water: { fill: '#21467c', hatch: '#3a6cb0' },
  trainer: { fill: INK, hatch: '#433a55' },
  gomme: { fill: PAPER, hatch: '#e4d9c6' },
  boss: { fill: '#1b1624', hatch: '#3a2f4a' },
  legend: { fill: '#231b3f', hatch: '#3d3272' },
  page: { fill: PAPER, hatch: '#e4d9c6' },
};

/** Sounds of each cover and reveal, with when they play (share of its duration). */
export const COVER_SOUNDS: Record<CoverKind, [SoundId, number][]> = {
  grass: [['swoosh', 0], ['swoosh', 0.35]],
  cave: [['splat', 0.05]],
  water: [['wave', 0]],
  trainer: [['swoosh', 0], ['pencil', 0.3], ['swoosh', 0.55]],
  gomme: [['rub', 0], ['rub', 0.3], ['rub', 0.6]],
  boss: [['splat', 0], ['splat', 0.16], ['splat', 0.32], ['splat', 0.48], ['thud', 0.62]],
  legend: [['shine', 0], ['twinkle', 0.3], ['swoosh', 0.5], ['shiny', 0.62]],
  page: [['page', 0]],
};
export const REVEAL_SOUNDS: Record<RevealKind, [SoundId, number][]> = {
  tear: [['tear', 0]],
  erase: [['rub', 0], ['rub', 0.35]],
  lift: [['page', 0]],
  fade: [],
};

const ANCHOR: Anchor = { x: 0, y: 0, top: 0, bottom: 0, left: 0, right: 0, size: 1 };

/** The `Env` the move animations' brush expects, for a whole screen `w`×`h` (CSS pixels). */
export function screenEnv(w: number, h: number, seed: number): Env {
  return { w, h, user: ANCHOR, target: ANCHOR, userSide: 0, dir: 1, k: Math.max(0.7, Math.min(w, h) / 300), seed, crit: false, eff: 1 };
}

function poly(ctx: CanvasRenderingContext2D, pts: P[], color: string, alpha = 1) {
  if (pts.length < 3) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** The covered screen: a flat crayon colour with pencil hatching over it. */
export function drawSheet(b: Brush, kind: CoverKind, alpha = 1) {
  if (alpha <= 0.01) return;
  const { ctx, env } = b;
  const s = SHEET[kind];
  ctx.globalAlpha = alpha;
  ctx.fillStyle = s.fill;
  ctx.fillRect(0, 0, env.w, env.h);
  ctx.globalAlpha = 1;
  b.wash(s.hatch, 0.5 * alpha, { gap: 7, angle: -0.6, seed: 31 });
  // the light ones (paper) get a few stray graphite marks, so they read as a page
  if (s.fill === PAPER) b.wash('#cfc4b2', 0.18 * alpha, { gap: 22, angle: 0.9, seed: 33 });
}

/** Absolute pencil width (the brush scales its widths by `k`). */
const px = (b: Brush, w: number) => w / b.env.k;

// ------------------------------------------------------------------ covers

type Draw = (b: Brush, t: number) => void;

/** Green crayon strokes swirling in from the edges, leaves spinning with them. */
const grass: Draw = (b, t) => {
  const { w, h } = b.env;
  const cx = w / 2, cy = h / 2, R = Math.hypot(w, h) / 2;
  const cols = [PAL.plante[1], PAL.plante[2], '#3e6a2c', '#86c95e'];
  const N = 22;
  for (let i = 0; i < N; i++) {
    const p = easeOut(seg(t, (i / N) * 0.55, (i / N) * 0.55 + 0.38));
    if (p <= 0) continue;
    const r = R * (1.08 - (i / N) * 0.98);
    const a0 = i * 2.39996;
    const pts: P[] = [];
    for (let j = 0; j <= 14; j++) {
      const a = a0 + 2.8 * p * (j / 14);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    b.line(pts, cols[i % 4], px(b, R * 0.26), { seed: i + 1, jit: 3 });
  }
  for (let i = 0; i < 9; i++) {
    const p = seg(t, i * 0.04, 0.7 + i * 0.03);
    if (p <= 0 || p >= 1) continue;
    const a = i * 0.7 + p * 5;
    const r = R * (1.05 - easeIn(p));
    b.doodle('leaf', PAL.plante[i % 2 ? 1 : 0], cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.min(w, h) * 0.1, { rot: a, seed: i });
  }
  drawSheet(b, 'grass', seg(t, 0.72, 1));
};

/** An ink blot spreading from the middle (where the player stands), drops flying ahead of it. */
const cave: Draw = (b, t) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const cx = w / 2, cy = h / 2, R = Math.hypot(w, h) / 2;
  const rr = lerp(R * 0.04, R * 1.25, easeInOut(t));
  for (let j = 0; j < 10; j++) {
    const a = j * 0.63 + 0.4;
    const d = rr * (1.12 + (j % 3) * 0.16) + R * 0.06;
    const s = R * (0.03 + (j % 4) * 0.012) * (1 - t * 0.4);
    poly(ctx, b.blob(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, s, 40 + j, 9, 0.25), INK);
  }
  poly(ctx, b.blob(cx, cy, rr, rr * 0.94, 11, 26, 0.12), INK);
  drawSheet(b, 'cave', seg(t, 0.85, 1));
};

/** A watercolour wave rising from the bottom, a lighter one ahead of it, foam on top. */
const water: Draw = (b, t) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const amp = h * 0.035;
  const waves: [number, string, string, number][] = [[0.1, '#7fb4ea', '#a9d2f5', 1.3], [0, SHEET.water.fill, SHEET.water.hatch, 0]];
  for (const [lead, fill, hatch, phase] of waves) {
    const k = easeInOut(clamp01(t * 1.06 + lead));
    const level = h + amp * 2 - (h + amp * 5) * k;
    const top: P[] = [];
    for (let i = 0; i <= 18; i++) {
      const x = -10 + ((w + 20) * i) / 18;
      top.push([x, level + Math.sin((x / w) * Math.PI * 3 + t * 9 + phase) * amp]);
    }
    const shape: P[] = [...top, [w + 10, h + 10], [-10, h + 10]];
    poly(ctx, shape, fill);
    b.fill(shape, hatch, { gap: 7, angle: 0.18, wash: 0, alpha: 0.6, seed: 5 });
    b.line(top, '#e2f3ff', px(b, Math.max(3, h * 0.012)), { seed: 7, jit: 2 });
  }
  drawSheet(b, 'water', seg(t, 0.9, 1));
};

/** Thick ink hatching zig-zagging from one corner to the other. */
const trainer: Draw = (b, t) => {
  const { w, h } = b.env;
  const n = 24;
  const lw = (w + h) / 11;
  const done = t * 1.15 * n;
  for (let i = 0; i < n; i++) {
    const k = clamp01(done - i);
    if (k <= 0) break;
    const off = (i / n) * (w + h) * 1.12 - h * 0.25;
    const a: P = [off + h * 0.05, -lw];
    const c: P = [off - h * 0.95, h + lw];
    const [s, e] = i % 2 ? [c, a] : [a, c];
    b.line([s, [lerp(s[0], e[0], easeOut(k)), lerp(s[1], e[1], easeOut(k))]], i % 3 ? INK : '#433a55', px(b, lw), { seed: i, jit: 5 });
  }
  drawSheet(b, 'trainer', seg(t, 0.86, 1));
};

/** A pink eraser at the edge of a band of paper (crumbs behind it). */
function eraser(b: Brush, x: number, y: number, bh: number, dir: 1 | -1) {
  const { ctx } = b;
  const ew = bh * 0.62, eh = bh * 0.72;
  const x0 = dir > 0 ? x - ew * 0.2 : x - ew * 0.8;
  const body: P[] = [[x0, y - eh / 2], [x0 + ew, y - eh / 2], [x0 + ew, y + eh / 2], [x0, y + eh / 2]];
  poly(ctx, body, '#f4a3ba');
  b.line([...body, body[0]], '#b8607a', px(b, 1.6), { seed: 3 });
  // its paper sleeve
  const sx = dir > 0 ? x0 : x0 + ew * 0.5;
  const sleeve: P[] = [[sx, y - eh / 2 - 1], [sx + ew * 0.5, y - eh / 2 - 1], [sx + ew * 0.5, y + eh / 2 + 1], [sx, y + eh / 2 + 1]];
  poly(ctx, sleeve, '#fffdf4');
  b.line([...sleeve, sleeve[0]], '#8a7f96', px(b, 1.2), { seed: 4 });
  const r = b.rand(Math.round(y));
  for (let i = 0; i < 7; i++) {
    const cx = x - dir * (6 + r() * bh * 0.9), cy = y + (r() - 0.5) * bh * 0.8;
    poly(ctx, b.blob(cx, cy, 1.5 + r() * 2.5, 1.2 + r() * 2, 70 + i, 6, 0.3), i % 2 ? '#e9b4c3' : '#c9bfb2');
  }
}

/** Bands of paper rubbed in from both sides, an eraser at the edge of each one. */
const gomme: Draw = (b, t) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const bands = 7, bh = h / bands;
  for (let i = 0; i < bands; i++) {
    const k = easeInOut(seg(t, i * 0.065, i * 0.065 + 0.5));
    if (k <= 0) continue;
    const y = i * bh;
    const right = i % 2 === 1;
    const x0 = right ? w - w * k : 0;
    ctx.fillStyle = PAPER;
    ctx.fillRect(x0, y, w * k, bh + 1);
    // graphite rubbed into smudges
    b.line([[x0 + 4, y + bh * 0.3], [x0 + w * k - 4, y + bh * 0.42]], '#d9cfbf', px(b, bh * 0.22), { seed: i + 9, alpha: 0.6 });
    if (k < 1) eraser(b, right ? x0 : x0 + w * k, y + bh / 2, bh, right ? -1 : 1);
  }
  drawSheet(b, 'gomme', seg(t, 0.9, 1));
};

/** Big ink splashes landing one after the other, the last one drowning the page. */
const SPLATS: [number, number, number][] = [[0.22, 0.28, 0.42], [0.78, 0.22, 0.46], [0.28, 0.76, 0.48], [0.8, 0.8, 0.52], [0.5, 0.5, 1.3]];
const boss: Draw = (b, t) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const R = Math.hypot(w, h) / 2;
  SPLATS.forEach(([fx, fy, size], j) => {
    const p = easeOut(seg(t, j * 0.16, j * 0.16 + 0.2));
    if (p <= 0) return;
    const cx = fx * w, cy = fy * h, r = R * size * p;
    const r0 = b.rand(j + 50);
    const pts: P[] = [];
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const q = i % 2 ? 0.8 + r0() * 0.15 : 1 + r0() * 0.35;
      pts.push([cx + Math.cos(a) * r * q, cy + Math.sin(a) * r * q]);
    }
    poly(ctx, pts, j === SPLATS.length - 1 ? SHEET.boss.fill : INK);
    for (let i = 0; i < 5; i++) {
      const a = r0() * Math.PI * 2, d = r * (1.25 + r0() * 0.4), s = r * (0.06 + r0() * 0.06);
      poly(ctx, b.blob(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s, s, j * 9 + i, 8, 0.3), INK);
    }
  });
  drawSheet(b, 'boss', seg(t, 0.9, 1));
};

/** Stars gathering in the middle of a darkening page, then rainbow rings flooding out of it. */
const legend: Draw = (b, t) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const cx = w / 2, cy = h / 2, R = Math.hypot(w, h) / 2;
  ctx.globalAlpha = 0.75 * seg(t, 0, 0.45);
  ctx.fillStyle = SHEET.legend.fill;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  const rings = [...RAINBOW, SHEET.legend.fill];
  rings.forEach((col, j) => {
    const p = easeIn(seg(t, 0.42 + j * 0.05, 0.78 + j * 0.035));
    if (p <= 0) return;
    poly(ctx, b.blob(cx, cy, R * 1.2 * p, R * 1.2 * p, 90 + j, 24, 0.06), col);
  });
  const S = 16;
  for (let j = 0; j < S; j++) {
    const p = easeIn(seg(t, j * 0.012, 0.42 + j * 0.008));
    const a = (j / S) * Math.PI * 2 + 0.3 + p * 1.6;
    const r = R * 1.05 * (1 - p);
    const alpha = 1 - seg(t, 0.44, 0.56);
    if (alpha <= 0) break;
    b.star(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.min(w, h) * (0.035 + (j % 3) * 0.012) * (1 - p * 0.4), j % 4 ? SPARK : '#ffd84a', { points: 5, inner: 0.42, alpha, seed: j, rot: p * 3 });
  }
  drawSheet(b, 'legend', seg(t, 0.92, 1));
};

/** A page turning from the right edge, its back curling over. */
const page: Draw = (b, t) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const e = easeInOut(t);
  const curl = w * 0.22 * (1 - e * 0.6);
  const x = lerp(w + curl, -curl, e);
  ctx.fillStyle = PAPER;
  ctx.fillRect(x, 0, w - x + 1, h);
  b.wash('#e4d9c6', 0.4, { gap: 7, seed: 31 });
  // the wash covers everything: clear what the page hasn't reached yet
  ctx.clearRect(0, 0, Math.max(0, x - curl * 0.75), h);
  const g = ctx.createLinearGradient(x - curl * 0.75 - 18, 0, x - curl * 0.75, 0);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(40,30,50,0.28)');
  ctx.fillStyle = g;
  ctx.fillRect(x - curl * 0.75 - 18, 0, 18, h);
  // the page's back, curling over
  const flap: P[] = [[x, 0], [x - curl * 0.75, h * 0.04], [x - curl * 0.6, h], [x, h]];
  poly(ctx, flap, '#fffcf2');
  b.line([flap[0], flap[1], flap[2], flap[3]], '#8a7f96', px(b, 1.4), { seed: 12 });
  drawSheet(b, 'page', seg(t, 0.94, 1));
};

export const COVERS: Record<CoverKind, Draw> = { grass, cave, water, trainer, gomme, boss, legend, page };

// ------------------------------------------------------------------ reveals

/** A jagged line across the screen, where the page tears. */
function tearLine(b: Brush, w: number, h: number): P[] {
  const r = b.rand(77);
  const pts: P[] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const x = -20 + ((w + 40) * i) / n;
    pts.push([x, lerp(h * 0.6, h * 0.4, i / n) + (i % 2 ? -1 : 1) * (4 + r() * 8)]);
  }
  return pts;
}

/** The covered page torn in two from the middle, both halves flying off. */
const tear = (b: Brush, t: number, kind: CoverKind) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const e = easeIn(t);
  const jag = tearLine(b, w, h);
  const halves: [P[], number, number, number][] = [
    [[[-40, -40], [w + 40, -40], ...[...jag].reverse()], -w * 0.12, -h * 0.75, -0.07],
    [[...jag, [w + 40, h + 40], [-40, h + 40]], w * 0.12, h * 0.75, 0.07],
  ];
  for (const [shape, dx, dy, rot] of halves) {
    ctx.save();
    ctx.translate(w / 2 + dx * e, h / 2 + dy * e);
    ctx.rotate(rot * e);
    ctx.translate(-w / 2, -h / 2);
    ctx.beginPath();
    shape.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    drawSheet(b, kind);
    ctx.restore();
    ctx.save();
    ctx.translate(w / 2 + dx * e, h / 2 + dy * e);
    ctx.rotate(rot * e);
    ctx.translate(-w / 2, -h / 2);
    // the white fibres of torn paper
    b.line(jag, '#fffdf4', px(b, 5), { seed: 21, jit: 3 });
    ctx.restore();
  }
};

/** Bands of the covered page rubbed away, an eraser at the edge of each one. */
const erase = (b: Brush, t: number, kind: CoverKind) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const bands = 7, bh = h / bands;
  for (let i = 0; i < bands; i++) {
    const k = easeInOut(seg(t, i * 0.06, i * 0.06 + 0.55));
    if (k >= 1) continue;
    const y = i * bh;
    const right = i % 2 === 0;
    // what is still covered
    const x0 = right ? 0 : w * k, x1 = right ? w * (1 - k) : w;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y, x1 - x0, bh + 1);
    ctx.clip();
    drawSheet(b, kind);
    ctx.restore();
    if (k > 0) eraser(b, right ? x1 : x0, y + bh / 2, bh, right ? -1 : 1);
  }
};

/** The covered page lifted away upwards, a soft shadow under its edge. */
const lift = (b: Brush, t: number, kind: CoverKind) => {
  const { ctx } = b;
  const { w, h } = b.env;
  const e = easeIn(t);
  ctx.save();
  ctx.translate(0, -h * 1.12 * e);
  ctx.rotate(-0.05 * e);
  const g = ctx.createLinearGradient(0, h, 0, h + 26);
  g.addColorStop(0, 'rgba(40,30,50,0.32)');
  g.addColorStop(1, 'rgba(40,30,50,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-20, h, w + 40, 26);
  ctx.beginPath();
  ctx.rect(-20, 0, w + 40, h);
  ctx.clip();
  drawSheet(b, kind);
  ctx.restore();
};

const fadeOut = (b: Brush, t: number, kind: CoverKind) => drawSheet(b, kind, 1 - t);

export const REVEALS: Record<RevealKind, (b: Brush, t: number, kind: CoverKind) => void> = { tear, erase, lift, fade: fadeOut };

/** Draws one frame of the curtain: covering (`t` 0→1), covered, or revealing (`t` 0→1). */
export function drawCurtain(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  s: { mode: 'cover' | 'still' | 'reveal'; cover: CoverKind; reveal?: RevealKind; t: number; seed: number; calm?: boolean },
  boil: number,
) {
  ctx.clearRect(0, 0, w, h);
  const b = new Brush(ctx, screenEnv(w, h, s.seed), boil);
  if (s.mode === 'still') return drawSheet(b, s.cover);
  if (s.mode === 'cover') return s.calm ? drawSheet(b, s.cover, s.t) : COVERS[s.cover](b, s.t);
  REVEALS[s.calm ? 'fade' : s.reveal ?? 'fade'](b, s.t, s.cover);
}
