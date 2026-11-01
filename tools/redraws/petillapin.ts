import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';

/**
 * A round baby fire rabbit standing up on its hind legs, turned to the left, too impatient to wait: it stamps its near
 * hind foot, and every stamp shakes sparks off the tips of its long ears, which smoulder like charcoal embers (they
 * catch fire on Brûlièvre). A head as big as its body, big shiny eyes under brows pulled down, a puffed-cheek pout, one
 * front paw balled into a little fist. Orange fur, a cream chest and muzzle, yellow sparks.
 */
const ORANGE = '#f08a3a', DEEP = '#cc6428', CREAM = '#f8e8c4', YELLOW = '#f6c63c', CHAR = '#4a3c42', PINK = '#f28aa8';

/** A little four-point spark at (x, y), `r` big. */
function spark(c: Crayon, x: number, y: number, r: number, rot = 0) {
  const pts: P[] = Array.from({ length: 8 }, (_, i) => {
    const a = ((rot + i * 45) * Math.PI) / 180, k = i % 2 ? 0.34 : 1;
    return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k];
  });
  c.shape(pts, YELLOW, { angle: rot + 60, over: 0, wash: 0.8 }, { w: 3.5 }, false);
}

/** A long rabbit ear from `base`, leaning `deg` (0 = up), a rounded tip of smouldering charcoal with a ragged edge. */
function ear(c: Crayon, base: P, deg: number, len: number, w: number, col: string, bend = 0) {
  const spine: P[] = [base], widths: number[] = [];
  const prof = [0.6, 0.88, 1, 1.04, 1, 0.94, 0.84, 0.7, 0.5];
  for (let i = 1; i < prof.length; i++) {
    const a = ((deg + (bend * i) / (prof.length - 1)) * Math.PI) / 180, [px, py] = spine[i - 1];
    spine.push([px + Math.sin(a) * (len / 8), py - Math.cos(a) * (len / 8)]);
  }
  for (const k of prof) widths.push(k * w);
  // a round cap past the last point, so the tip is a rounded ember, not a point
  const n = spine.length, [ex, ey] = spine[n - 1], [qx, qy] = spine[n - 2], l = Math.hypot(ex - qx, ey - qy);
  const u: P = [(ex - qx) / l, (ey - qy) / l], v: P = [-u[1], u[0]], rr = (widths[n - 1] / 2);
  const cap: P[] = [-60, -30, 0, 30, 60].map((d): P => {
    const a = (d * Math.PI) / 180;
    return [ex + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * rr * 1.1, ey + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * rr * 1.1];
  });
  const out = lineOfAction(spine, widths);
  const full = [...out.slice(0, n), ...cap, ...out.slice(n)];
  c.shape(full, col, { angle: deg + 90, over: 0.3 });
  // the smouldering tip: charcoal from a ragged edge, a soft red glow under it
  const k = 6, L = full.slice(k, n), C = cap, R = full.slice(n + C.length, n + C.length + (n - k));
  // (no red band under it: that read as a sharpened pencil)
  const edge = c.spikes([R[R.length - 1], L[0]], 3, -14);
  c.shape([...L, ...C, ...R, ...edge.slice(1, -1)], CHAR, { angle: deg + 60, over: 0.2 }, { w: 4 }, false);
  // one glowing crack in the charcoal
  const [mx, my] = spine[n - 1];
  c.stroke([[mx - v[0] * rr * 0.4 - u[0] * 20, my - v[1] * rr * 0.4 - u[1] * 20], [mx + v[0] * rr * 0.1, my + v[1] * rr * 0.1], [mx + v[0] * rr * 0.3 + u[0] * 14, my + v[1] * rr * 0.3 + u[1] * 14]], { w: 4, col: '#f2803a' });
}

/** A long rabbit hind foot from heel to toe, `w` thick: a narrow heel, wide round toes, plain fur. */
function hindFoot(c: Crayon, heel: P, toe: P, col: string, w: number) {
  const dx = toe[0] - heel[0], dy = toe[1] - heel[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l];
  const nn: P = [-u[1], u[0]], sg = nn[1] >= 0 ? 1 : -1;
  const at = (k: number, m: number): P => [heel[0] + u[0] * l * k + nn[0] * m * w * sg, heel[1] + u[1] * l * k + nn[1] * m * w * sg];
  c.shape([at(-0.04, 0.1), at(0.04, -0.36), at(0.5, -0.42), at(0.84, -0.6), at(1.06, -0.24), at(1.06, 0.3), at(0.86, 0.56), at(0.5, 0.5), at(0.06, 0.5)], col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI, over: 0.2 });
}

/** Points round an ellipse, starting at the top and going clockwise. */
const ring = (cx: number, cy: number, rx: number, ry: number, n = 14): P[] =>
  Array.from({ length: n }, (_, i): P => [cx + Math.sin((i / n) * Math.PI * 2) * rx, cy - Math.cos((i / n) * Math.PI * 2) * ry]);

export default {
  id: '121', slug: 'petillapin', seed: 12101, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato, band } = c;
    // the cotton tail, behind
    shape(potato(736, 700, 42, 40, 9, 0.08), CREAM, { angle: 30 });
    // far limbs, darker and half hidden: the far hind foot flat on the ground, the far front paw tucked up
    hindFoot(c, [660, 902], [436, 910], DEEP, 46);
    shape(potato(452, 668, 28, 26, 8, 0.06), DEEP, { angle: 30 });
    // the upright bean of a body, leaning a little forward, a cream chest
    shape([[496, 890], [470, 780], [476, 660], [508, 560], [590, 514], [672, 556], [716, 680], [718, 820], [684, 898], [580, 914]], ORANGE, { angle: 80, over: 0.45 });
    c.tint(potato(522, 740, 50, 120, 10, 0.08), CREAM, { angle: 84, wash: 0.7 });
    // the near hind leg, bent: a short round foot lifted forward from the lower front of the thigh, toes tipped down,
    // hanging clear below it (it stamps in battle); then the round thigh on the flank covers its heel
    c.part('pied', { pivot: [570, 856], motion: 'nod', amp: 5, period: 1.6, behind: true }, () => {
      hindFoot(c, [580, 846], [436, 864], ORANGE, 62);
    });
    openLimb(c, ring(654, 800, 108, 100), ORANGE, 2, 12);
    // two small impact marks where it lands
    c.part('impact', { pivot: [390, 936], motion: 'nod', amp: 2, period: 1.6, decor: true, behind: true }, () => {
      stroke([[410, 930], [380, 914]], { w: 4.5 });
      stroke([[404, 956], [370, 960]], { w: 4.5 });
    });
    // the big round head, three-quarter left, overlapping the top of the body
    const [hx, hy, s] = [440, 452, 0.95];
    const T = ([x, y]: P): P => [hx + x * s, hy + y * s];
    const t = (pts: P[]) => pts.map(T);
    // the ears, charcoal-tipped: the near one up, the far one bent a little (they sway slowly in battle)
    c.part('oreilles', { pivot: T([0, -140]), motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      ear(c, T([-60, -128]), -18, 270 * s, 80 * s, DEEP, -28);
      ear(c, T([40, -138]), 10, 290 * s, 92 * s, ORANGE, 8);
    });
    // sparks shed from the ember tips at each stamp
    c.part('etincelles', { pivot: [470, 120], motion: 'nod', amp: 3, period: 1.6, decor: true }, () => {
      spark(c, 612, 110, 22, 10);
      spark(c, 640, 190, 16, 30);
      spark(c, 254, 190, 18, 20);
    });
    shape(t([[-186, 10], [-176, -70], [-120, -138], [-20, -162], [90, -148], [162, -90], [184, 0], [162, 88], [84, 140], [-24, 154], [-124, 124], [-176, 70]]), ORANGE, { angle: 78, over: 0.45 });
    // the muzzle under the eyes, a little left of centre
    c.tint(potato(...T([-56, 76]), 82 * s, 52 * s, 10, 0.06), CREAM, { angle: 60, wash: 0.75 });
    // impatient, one signal: brows pulled down toward the nose, the near cheek puffed out in a pout
    c.eye(...T([-92, -16]), 30 * s, 39 * s);
    c.eye(...T([36, -22]), 42 * s, 54 * s);
    stroke(t([[-130, -78], [-78, -64]]), { w: 6 });
    stroke(t([[-2, -82], [68, -98]]), { w: 6.5 });
    c.cheek(...T([104, 58]), 44 * s, 32 * s, PINK);
    dot(...T([-56, 40]), 13 * s, 10 * s, '#e07a96');
    stroke(t([[-56, 50], [-56, 64]]), { w: 4 });
    stroke(t([[-74, 80], [-54, 72], [-30, 76]]), { w: 4.5 });
    c.part('paupieres', { pivot: T([-28, -20]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-92, -16]), 30 * s, 39 * s, ORANGE);
      c.lid(...T([36, -22]), 42 * s, 54 * s, ORANGE);
    });
    // the near front paw balled into a little fist, held up and forward
    openLimb(c, band([[556, 640], [500, 646], [452, 630]], 60, 44), ORANGE, 1, 5);
    shape(potato(430, 622, 36, 32, 8, 0.06), ORANGE, { angle: 30 });
    stroke([[414, 610], [420, 632]], { w: 3.5 });
  },
} satisfies Redraw;
