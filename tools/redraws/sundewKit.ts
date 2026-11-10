import type { Crayon, P } from './crayon.ts';
import { sample, tailBand } from './pandaKit.ts';

/**
 * The sundew family (Perlotte, Glurosée, Englutrape): a carnivorous little plant that walks. Its leaves are paddles
 * fringed with red hairs, each hair holding a glistening drop of sticky, poisonous dew (lilac: the Poison type).
 */
export const GREEN = '#6cbf4a', DEEP = '#3f8a34', PALE = '#c8e89e', RED = '#d8443c', PADDLE = '#dd5a44', DEW = '#c79cf2', DEWDARK = '#8a5cc8', ROOT = '#b98a52', ROOTDARK = '#8a643a';

/** One sticky hair from `root` to `tip`, with its drop of dew. */
export function hair(c: Crayon, root: P, tip: P, r: number) {
  c.stroke([root, [(root[0] * 0.4 + tip[0] * 0.6), (root[1] * 0.4 + tip[1] * 0.6) + 2], tip], { w: 4.5, col: '#b8322c' });
  // a glistening round drop: a dark rim, the lilac dew, a white glint
  c.dot(tip[0], tip[1], r + 3, r + 3, DEWDARK);
  c.dot(tip[0], tip[1], r - 1, r - 1, DEW);
  c.dot(tip[0] - r * 0.32, tip[1] - r * 0.34, r * 0.34, r * 0.3, '#ffffff');
}

/**
 * A sundew leaf along `ctrl` (from its root to the centre of its paddle): a thin green stalk ending in a round red
 * paddle, its rim fringed with `n` sticky hairs fanning out round the far side. `w` is the paddle's width.
 */
export function leaf(c: Crayon, ctrl: P[], w: number, n: number, o: { stalk?: number; col?: string; squash?: number } = {}) {
  const t = tailBand(ctrl, () => w * (o.stalk ?? 0.2), 24);
  c.shape(t.out, o.col ?? GREEN, { angle: 70, over: 0.2 });
  const e = t.sp[t.N - 1], d = t.sp[t.N - 5], a0 = Math.atan2(e[1] - d[1], e[0] - d[0]);
  const r = w / 2, sq = o.squash ?? 0.86;
  // the paddle, a little oval across the stalk
  const pad: P[] = Array.from({ length: 10 }, (_, i): P => {
    const a = (i / 10) * Math.PI * 2, x = Math.cos(a) * r * sq, y = Math.sin(a) * r;
    return [e[0] + x * Math.cos(a0) - y * Math.sin(a0), e[1] + x * Math.sin(a0) + y * Math.cos(a0)];
  });
  // the hairs, round the far side of the paddle
  for (let i = 0; i < n; i++) {
    const a = a0 + (-0.5 + i / Math.max(1, n - 1)) * Math.PI * 1.45;
    const p: P = [e[0] + Math.cos(a) * r * 0.9, e[1] + Math.sin(a) * r * 0.9];
    hair(c, p, [e[0] + Math.cos(a) * r * 1.55, e[1] + Math.sin(a) * r * 1.55], w * 0.1);
  }
  c.shape(pad, PADDLE, { angle: 40, over: 0.3 });
  c.tint(c.potato(e[0] - Math.cos(a0) * r * 0.1, e[1] - Math.sin(a0) * r * 0.1, r * 0.5, r * 0.45, 8, 0.05), '#f08a6a', { angle: 70, wash: 0.5, press: 0.7 });
  return { ...t, tip: e, angle: a0 };
}

/** A root foot from `top` down to `toe`: a tapering root that splits into two little toes. */
export function root(c: Crayon, top: P, toe: P, w: number, col = ROOT) {
  const mid: P = [(top[0] + toe[0]) / 2 + 6, (top[1] + toe[1]) / 2];
  const t = tailBand([top, mid, toe], (k) => w * (1 - 0.5 * k), 16);
  c.shape(t.out, col, { angle: 80, over: 0.2 });
  c.stroke([toe, [toe[0] - w * 0.6, toe[1] + w * 0.1]], { w: 5 });
  c.stroke([toe, [toe[0] + w * 0.5, toe[1] + w * 0.15]], { w: 5 });
}

export { sample };

/**
 * A long forked sundew arm (the final's): a tapering green band along `ctrl`, red along its inner face, sticky hairs on
 * its outer edge every `every` points; ends round. Returns its band so a fork can grow from it.
 */
export function hairyArm(c: Crayon, ctrl: P[], w: number, every = 4, col = GREEN) {
  const t = tailBand(ctrl, (k) => w * (1 - 0.62 * k), 36);
  c.shape(t.out, col, { angle: 70, over: 0.25 });
  c.tint(t.R.slice(6).concat(t.sp.slice(6).reverse()), PADDLE, { angle: 30, wash: 0.6, press: 0.8 });
  for (let i = 6; i < t.N - 1; i += every) {
    const p = t.L[i], s = t.sp[i], dx = p[0] - s[0], dy = p[1] - s[1], l = Math.hypot(dx, dy) || 1;
    const len = 18 + t.ws[i] * 0.55;
    hair(c, p, [p[0] + (dx / l) * len, p[1] + (dy / l) * len], 9 + t.ws[i] * 0.07);
  }
  return t;
}

/** A short leaf of the skirt it walks on, from `root` to `tip`, `w` wide: green, its tip blushing red. */
export function skirtLeaf(c: Crayon, rootP: P, tip: P, w: number, col = GREEN) {
  const t = tailBand([rootP, [(rootP[0] + tip[0]) / 2, (rootP[1] + tip[1]) / 2 + 6], tip], (k) => w * (0.5 + 0.5 * Math.sin(k * Math.PI * 0.85)), 16);
  c.shape(t.out, col, { angle: 30, over: 0.2 });
  c.stroke(t.sp.slice(2, 13), { w: 3.5, col: '#3f8a34' });
}

/** A bud of a body: rounded below, drawn up to a soft point on top at `tip`, green with a red blush toward the point. */
export function bud(c: Crayon, cx: number, cy: number, rx: number, ry: number, tip: P, col = GREEN, sepals = 2) {
  const pts: P[] = [];
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI * 0.5 + (i / 20) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  // pull the top of the ellipse up to the tip
  const out = pts.map(([x, y]): P => {
    const k = Math.max(0, (cy - y) / ry);
    return [x + (tip[0] - x) * Math.pow(k, 3) * 0.75, y - Math.pow(k, 2.2) * (cy - ry - tip[1])];
  });
  c.shape(out, col, { angle: 70, over: 0.4 });
  // the sepals wrapped round the bud: seams curving from low on its sides up to the tip, the far one in shade
  const seam = (k: number): P[] => Array.from({ length: 7 }, (_, i): P => {
    const t = i / 6, y = cy - ry * 0.5 - t * (cy - ry * 0.5 - tip[1] - 10), x0 = cx + k * rx * 0.8;
    return [x0 + (tip[0] - x0) * Math.pow(t, 1.6), y];
  });
  if (sepals > 0) {
    const far = seam(0.55);
    c.stroke(far, { w: 4.5 });
  }
  if (sepals > 1) c.stroke(seam(-0.6), { w: 4.5 });
  c.stroke([[tip[0], tip[1] + 6], [tip[0] + 10, tip[1] - 30], [tip[0] + 40, tip[1] - 44], [tip[0] + 46, tip[1] - 22], [tip[0] + 28, tip[1] - 18]], { w: 7, col: '#3f8a34' });
  return out;
}
