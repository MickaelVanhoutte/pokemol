/**
 * Small coloured-pencil drawings the move animations throw around: flames, drops, bubbles, rocks,
 * leaves, notes… Each is drawn once per colour and flipbook version on a 128px canvas
 * (`brush.ts` caches them), centred on (64, 64).
 */
import { GRAPHITE, Pencil, type Pt, type Rand } from '../../paper/pencilCanvas';
import { mix, PAPER, SPARK } from './core';

export type DoodleKind =
  | 'flame' | 'drop' | 'bubble' | 'rock' | 'leaf' | 'seed' | 'shard' | 'note' | 'star' | 'heart'
  | 'spark' | 'puff' | 'fist' | 'feather' | 'zzz' | 'blob' | 'ink' | 'moon' | 'sun' | 'orb'
  | 'magnet' | 'clod' | 'petal' | 'snow' | 'foot' | 'plus' | 'book' | 'superbook' | 'bookOpen' | 'superbookOpen' | 'pencil' | 'doll' | 'scrap' | 'bone' | 'acorn'
  | 'plane' | 'balloon';

const C = 64;
const circle = (cx: number, cy: number, rx: number, ry: number, r: Rand, n = 22, wob = 0.06): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const q = 1 + (r() - 0.5) * wob;
    return [cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q] as Pt;
  });

/** Crayon colouring: a flat wash, hatching on top, a contour gone over twice. */
function paint(p: Pencil, pts: Pt[], color: string, o: { line?: string; wash?: number; gap?: number; lw?: number } = {}) {
  const { ctx } = p;
  ctx.save();
  ctx.globalAlpha = o.wash ?? 0.75;
  ctx.fillStyle = mix(color, PAPER, 0.35);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  p.hatch(pts, color, { alpha: 0.95, gap: o.gap ?? 5, width: 3.2 });
  p.outline(pts, { color: o.line ?? mix(color, GRAPHITE, 0.65), alpha: 0.95, width: o.lw ?? 4 });
}

const line = (p: Pencil, pts: Pt[], color: string, width: number) => p.outline(pts, { color, width, alpha: 0.95, close: false });

function flamePts(r: Rand, s = 1, dy = 0): Pt[] {
  const pts: Pt[] = [];
  const by = C + 20 * s + dy, rad = 30 * s;
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI;
    pts.push([C + Math.cos(a) * rad, by + Math.sin(a) * rad * 0.9]);
  }
  const lean = (r() - 0.5) * 16 * s;
  for (let i = 1; i <= 8; i++) {
    const t = i / 8;
    pts.push([C - rad * (1 - t) ** 1.4 + lean * t * t + Math.sin(t * 7) * 3 * s, by - (by - (C - 52 * s + dy)) * t]);
  }
  for (let i = 1; i < 8; i++) {
    const t = 1 - i / 8;
    pts.push([C + rad * (1 - t) ** 1.4 + lean * t * t - Math.sin(t * 6) * 3 * s, by - (by - (C - 52 * s + dy)) * t]);
  }
  return pts;
}

export const DOODLES: Record<DoodleKind, (ctx: CanvasRenderingContext2D, color: string, r: Rand) => void> = {
  flame(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, flamePts(r), color);
    paint(p, flamePts(r, 0.5, 14), SPARK, { line: mix(color, GRAPHITE, 0.3), lw: 2.5 });
  },
  drop(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI;
      pts.push([C + Math.cos(a) * 30, C + 22 + Math.sin(a) * 30]);
    }
    pts.push([C - 18, C - 10], [C, C - 50], [C + 18, C - 10]);
    paint(p, pts, color);
    line(p, [[C + 14, C + 6], [C + 18, C + 26], [C + 8, C + 40]], '#ffffff', 5);
  },
  bubble(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts = circle(C, C, 46, 46, r);
    paint(p, pts, mix(color, PAPER, 0.55), { wash: 0.35, gap: 9, line: color, lw: 4.5 });
    p.outline(Array.from({ length: 8 }, (_, i) => [C - 30 * Math.cos(1.9 + i * 0.16), C - 30 * Math.sin(1.9 + i * 0.16)] as Pt), { color: '#ffffff', width: 6, close: false, alpha: 1 });
    paint(p, circle(C + 22, C - 24, 5, 5, r, 8), '#ffffff', { line: '#ffffff', lw: 2 });
  },
  rock(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C + 4, 48, 40, r, 9, 0.35), color);
    line(p, [[C - 14, C - 16], [C - 2, C + 2], [C + 10, C - 2], [C + 18, C + 14]], mix(color, GRAPHITE, 0.7), 3);
  },
  leaf(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([12 + t * 104, C - Math.sin(t * Math.PI) * 30]); }
    for (let i = 9; i > 0; i--) { const t = i / 10; pts.push([12 + t * 104, C + Math.sin(t * Math.PI) * 26]); }
    paint(p, pts, color);
    line(p, [[16, C], [112, C - 2]], mix(color, GRAPHITE, 0.6), 3);
    for (const x of [40, 64, 88]) line(p, [[x, C], [x + 12, C - 16]], mix(color, GRAPHITE, 0.5), 2.2);
  },
  seed(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C, 26, 40, r, 16), color);
    line(p, [[C - 8, C - 24], [C - 12, C - 4]], '#ffffff', 5);
  },
  shard(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, [[C, 6], [C + 24, C - 6], [C + 6, 122], [C - 22, C + 4]], color);
    line(p, [[C, 10], [C + 2, C + 40]], '#ffffff', 4);
  },
  note(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C - 14, C + 30, 20, 14, r, 16), color);
    line(p, [[C + 4, C + 26], [C + 6, 16]], mix(color, GRAPHITE, 0.6), 7);
    line(p, [[C + 6, 16], [C + 30, 30], [C + 34, 54]], mix(color, GRAPHITE, 0.6), 6);
  },
  star(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, q = i % 2 ? 22 : 54;
      pts.push([C + Math.cos(a) * q, C + 6 + Math.sin(a) * q]);
    }
    paint(p, pts, color);
  },
  heart(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts = Array.from({ length: 30 }, (_, i) => {
      const t = (i / 30) * Math.PI * 2;
      return [C + 2.9 * 16 * Math.sin(t) ** 3, C - 2.9 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) + 4] as Pt;
    });
    paint(p, pts, color);
  },
  spark(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, q = i % 2 ? 12 : 58;
      pts.push([C + Math.cos(a) * q, C + Math.sin(a) * q]);
    }
    paint(p, pts, color, { line: mix(color, GRAPHITE, 0.4) });
  },
  puff(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts = Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2, q = 42 + Math.abs(Math.sin(a * 2.5)) * 12;
      return [C + Math.cos(a) * q, C + 4 + Math.sin(a) * q * 0.82] as Pt;
    });
    paint(p, pts, color, { wash: 0.85, gap: 7 });
  },
  fist(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C + 6, 44, 38, r, 16, 0.08), color);
    paint(p, circle(C - 34, C + 18, 14, 22, r, 12), color);
    const dark = mix(color, GRAPHITE, 0.7);
    for (const x of [-18, 2, 22]) line(p, [[C + x, C - 28], [C + x + 2, C + 6]], dark, 3);
    line(p, [[C - 26, C + 8], [C + 30, C + 10]], dark, 3);
  },
  feather(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([20 + t * 88, C + 10 - Math.sin(t * Math.PI) * 26 - t * 18]); }
    for (let i = 9; i > 0; i--) { const t = i / 10; pts.push([20 + t * 88, C + 10 + Math.sin(t * Math.PI) * 18 - t * 18]); }
    paint(p, pts, color, { gap: 4 });
    line(p, [[8, C + 18], [110, C - 10]], mix(color, GRAPHITE, 0.6), 3);
  },
  zzz(ctx, color, r) {
    const p = new Pencil(ctx, r);
    line(p, [[30, 34], [96, 34], [30, 96], [98, 96]], color, 11);
    line(p, [[30, 34], [96, 34], [30, 96], [98, 96]], mix(color, GRAPHITE, 0.6), 3);
  },
  blob(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C, 46, 38, r, 12, 0.4), color);
    paint(p, circle(C - 16, C - 14, 9, 6, r, 8), '#ffffff', { line: '#ffffff', lw: 1.5 });
  },
  ink(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI;
      pts.push([C + Math.cos(a) * 32, C + 18 + Math.sin(a) * 32]);
    }
    pts.push([C - 22, C - 8], [C + 4, C - 54], [C + 24, C - 8]);
    paint(p, pts, color, { wash: 0.95, gap: 3 });
  },
  moon(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i <= 16; i++) { const a = -1.9 + (i / 16) * 3.8; pts.push([C + Math.cos(a) * 50, C + Math.sin(a) * 50]); }
    for (let i = 16; i >= 0; i--) { const a = -1.6 + (i / 16) * 3.2; pts.push([C + 22 + Math.cos(a) * 40, C + Math.sin(a) * 44]); }
    paint(p, pts, color);
  },
  sun(ctx, color, r) {
    const p = new Pencil(ctx, r);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      line(p, [[C + Math.cos(a) * 38, C + Math.sin(a) * 38], [C + Math.cos(a) * 60, C + Math.sin(a) * 60]], mix(color, GRAPHITE, 0.3), 6);
    }
    paint(p, circle(C, C, 32, 32, r), color);
  },
  orb(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C, 46, 46, r), color);
    paint(p, circle(C, C, 24, 24, r), mix(color, '#ffffff', 0.7), { line: mix(color, '#ffffff', 0.4), lw: 2 });
  },
  magnet(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; pts.push([C + Math.cos(a) * 44, C + Math.sin(a) * 44]); }
    pts.push([C + 44, C + 44], [C + 22, C + 44], [C + 22, C]);
    for (let i = 12; i >= 0; i--) { const a = Math.PI + (i / 12) * Math.PI; pts.push([C + Math.cos(a) * 22, C + Math.sin(a) * 22]); }
    pts.push([C - 22, C + 44], [C - 44, C + 44]);
    paint(p, pts, color);
    paint(p, [[C - 44, C + 26], [C - 22, C + 26], [C - 22, C + 46], [C - 44, C + 46]], '#d8dde4');
    paint(p, [[C + 22, C + 26], [C + 44, C + 26], [C + 44, C + 46], [C + 22, C + 46]], '#d8dde4');
  },
  clod(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C, 40, 32, r, 10, 0.45), color);
    for (let i = 0; i < 4; i++) paint(p, circle(C - 30 + r() * 60, C + 30 + r() * 20, 6, 5, r, 7, 0.3), color);
  },
  petal(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const pts: Pt[] = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([C + Math.sin(t * Math.PI) * 30, 14 + t * 100]); }
    for (let i = 9; i > 0; i--) { const t = i / 10; pts.push([C - Math.sin(t * Math.PI) * 30, 14 + t * 100]); }
    paint(p, pts, color);
  },
  snow(ctx, color, r) {
    const p = new Pencil(ctx, r);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      const dx = Math.cos(a) * 52, dy = Math.sin(a) * 52;
      line(p, [[C - dx, C - dy], [C + dx, C + dy]], color, 8);
      line(p, [[C - dx, C - dy], [C + dx, C + dy]], mix(color, GRAPHITE, 0.5), 2.5);
    }
  },
  foot(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C + 12, 34, 44, r, 16, 0.1), color);
    for (let i = 0; i < 4; i++) paint(p, circle(C - 27 + i * 18, C - 40 + Math.abs(i - 1.5) * 6, 9, 11, r, 9), color);
  },
  plus(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, [[C - 14, 14], [C + 14, 14], [C + 14, C - 14], [114, C - 14], [114, C + 14], [C + 14, C + 14], [C + 14, 114], [C - 14, 114], [C - 14, C + 14], [14, C + 14], [14, C - 14], [C - 14, C - 14]], color);
  },
  book(ctx, color, r) {
    sketchbook(new Pencil(ctx, r), r, color);
  },
  superbook(ctx, color, r) {
    sketchbook(new Pencil(ctx, r), r, color, '#e0453a');
  },
  bookOpen(ctx, color, r) {
    sketchbookOpen(new Pencil(ctx, r), r, color);
  },
  superbookOpen(ctx, color, r) {
    sketchbookOpen(new Pencil(ctx, r), r, color, '#e0453a');
  },
  pencil(ctx, color, r) {
    // a crayon held to draw, its point down to the left: the coloured body, the wood, the lead, a pink eraser
    const p = new Pencil(ctx, r);
    paint(p, [[52, 66], [100, 18], [116, 34], [68, 82]], color);
    line(p, [[60, 74], [108, 26]], mix(color, GRAPHITE, 0.4), 3);
    paint(p, [[100, 18], [110, 8], [126, 24], [116, 34]], '#f29ab0');
    paint(p, [[52, 66], [68, 82], [28, 106]], '#f2d3a0');
    paint(p, [[36, 94], [44, 102], [28, 106]], GRAPHITE, { line: GRAPHITE, lw: 2 });
  },
  doll(ctx, color, r) {
    const p = new Pencil(ctx, r);
    const paper = mix(color, PAPER, 0.85);
    // a paper doll cut out of the sketchbook: arms and legs out, a drawn-on smile
    paint(p, [[C - 6, 52], [18, 66], [14, 78], [C - 10, 68]], paper, { line: GRAPHITE, gap: 8 });
    paint(p, [[C + 6, 52], [110, 66], [114, 78], [C + 10, 68]], paper, { line: GRAPHITE, gap: 8 });
    paint(p, [[C - 14, 92], [C - 26, 124], [C - 12, 126], [C - 2, 96]], paper, { line: GRAPHITE, gap: 8 });
    paint(p, [[C + 14, 92], [C + 26, 124], [C + 12, 126], [C + 2, 96]], paper, { line: GRAPHITE, gap: 8 });
    paint(p, [[C - 22, 46], [C + 22, 46], [C + 18, 100], [C - 18, 100]], paper, { line: GRAPHITE, gap: 8 });
    paint(p, circle(C, 28, 20, 20, r), paper, { line: GRAPHITE, gap: 8 });
    for (const x of [-7, 7]) paint(p, circle(C + x, 25, 2.5, 3, r, 8), GRAPHITE, { line: GRAPHITE, lw: 1 });
    line(p, [[C - 8, 34], [C, 39], [C + 8, 34]], GRAPHITE, 2.5);
    line(p, [[C - 16, 60], [C + 16, 60]], color, 3);
  },
  bone(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, [[34, 56], [94, 56], [94, 72], [34, 72]], color, { line: GRAPHITE });
    for (const [x, y] of [[28, 50], [28, 78], [100, 50], [100, 78]]) paint(p, circle(x, y, 14, 14, r, 10), color, { line: GRAPHITE });
  },
  acorn(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, circle(C, C + 12, 30, 38, r, 16), color);
    const cap: Pt[] = [[C - 38, C - 8], [C - 30, C - 34], [C, C - 44], [C + 30, C - 34], [C + 38, C - 8], [C, C - 14]];
    paint(p, cap, mix(color, GRAPHITE, 0.5), { gap: 4 });
    for (const x of [-20, 0, 20]) line(p, [[C + x - 10, C - 36], [C + x + 10, C - 12]], mix(color, GRAPHITE, 0.75), 2.2);
    line(p, [[C, C - 44], [C + 4, C - 58]], mix(color, GRAPHITE, 0.75), 5);
    line(p, [[C - 14, C + 2], [C - 18, C + 24]], '#ffffff', 5);
  },
  scrap(ctx, color, r) {
    const p = new Pencil(ctx, r);
    paint(p, [[30 + r() * 10, 20], [100, 34 + r() * 10], [92 + r() * 10, 100], [24, 90 + r() * 10]], mix(color, PAPER, 0.8), { line: GRAPHITE, gap: 9 });
  },
  plane(ctx, color, r) {
    const p = new Pencil(ctx, r);
    // a folded paper plane flying to the right: the far wing, the near wing, the fold down the middle
    paint(p, [[118, C - 2], [14, C - 34], [44, C + 2]], mix(color, GRAPHITE, 0.12), { line: GRAPHITE, gap: 8 });
    paint(p, [[118, C - 2], [10, C + 14], [44, C + 2], [34, C + 30]], color, { line: GRAPHITE, gap: 8 });
    line(p, [[118, C - 2], [44, C + 2]], GRAPHITE, 2.5);
  },
  balloon(ctx, color, r) {
    const p = new Pencil(ctx, r);
    // a water balloon, a little lopsided, its knot at the bottom
    paint(p, circle(C, C - 6, 44, 48, r, 20, 0.1), color);
    paint(p, [[C - 8, C + 40], [C + 8, C + 40], [C + 4, C + 54], [C - 4, C + 54]], mix(color, GRAPHITE, 0.35), { lw: 3 });
    line(p, [[C - 20, C - 34], [C - 30, C - 14], [C - 28, C + 4]], '#ffffff', 6);
  },
};

/** A Crayon-ball: a little sketchbook, closed, its spiral along the top, a star drawn on its cover (and a band). */
function sketchbook(p: Pencil, r: Rand, cover: string, band?: string) {
  // the pages peeking out under the cover
  paint(p, [[C - 34, C - 28], [C + 44, C - 32], [C + 48, C + 46], [C - 30, C + 50]], '#ffffff', { line: GRAPHITE, gap: 9 });
  paint(p, [[C - 44, C - 36], [C + 38, C - 40], [C + 42, C + 38], [C - 40, C + 42]], cover);
  // a little star drawn on the cover
  const star: Pt[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, q = i % 2 ? 8 : 18;
    star.push([C - 4 + Math.cos(a) * q, C + 4 + Math.sin(a) * q]);
  }
  paint(p, star, '#ffffff', { line: mix(cover, GRAPHITE, 0.6), lw: 2.5 });
  if (band) line(p, [[C + 22, C - 39], [C + 26, C + 40]], band, 7);
  // the spiral binding along the top
  for (let i = 0; i < 7; i++) line(p, circle(C - 34 + i * 12, C - 38, 4.5, 8, r, 10), GRAPHITE, 3);
}

/** The sketchbook open: two blank pages on its cover, the spiral down the middle (and its band). */
function sketchbookOpen(p: Pencil, r: Rand, cover: string, band?: string) {
  paint(p, [[C - 62, C - 30], [C + 62, C - 34], [C + 64, C + 34], [C - 64, C + 38]], cover);
  if (band) line(p, [[C + 50, C - 33], [C + 52, C + 35]], band, 6);
  paint(p, [[C - 57, C - 25], [C - 3, C - 29], [C - 3, C + 29], [C - 58, C + 33]], '#ffffff', { line: GRAPHITE, gap: 12 });
  paint(p, [[C + 3, C - 29], [C + 57, C - 29], [C + 59, C + 31], [C + 3, C + 29]], '#ffffff', { line: GRAPHITE, gap: 12 });
  for (let i = 0; i < 5; i++) line(p, circle(C, C - 22 + i * 11, 6, 3.5, r, 10), GRAPHITE, 3);
}
