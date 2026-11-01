import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';

/** The family's colours: silver-lavender fur, a pale belly, moon-yellow eyes and tail tip, a night-brown branch. */
export const GALA = {
  FUR: '#aaa4dc', DEEP: '#7e76bc', BELLY: '#eeedfa', RIM: '#d8c8ec', MOON: '#f6d443', MOON2: '#e8a92a', PUPIL: '#1f1a34',
  NOSE: '#4e3e6e', BARK: '#8a6a58', BARK2: '#6e5244', LEAF: '#5fae6a', CHEEK: '#f08ab0',
};

/** Maps local (x, y) around (cx, cy), scaled by `s` and turned `deg` degrees, to the page. */
export function frame(cx: number, cy: number, s: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const T = ([x, y]: P): P => [cx + (x * Math.cos(r) - y * Math.sin(r)) * s, cy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  return { T, t: (pts: P[]) => pts.map(T) };
}

/** A moon eye at (x, y), `r` its size: a moon-yellow disc, a big round dark pupil looking along (lx, ly), two shines. */
export function moonEye(c: Crayon, x: number, y: number, r: number, look: P = [0, 0], pupil = 0.62) {
  c.shape(c.potato(x, y, r, r * 1.04, 11, 0.02), GALA.MOON, { angle: 80, over: 0, press: 1.1 }, { w: 4.5 });
  c.tint(c.potato(x + r * 0.1, y + r * 0.35, r * 0.75, r * 0.5, 9, 0.04), GALA.MOON2, { wash: 0.5 });
  const [px, py] = [x + look[0] * r * 0.22, y + look[1] * r * 0.22];
  c.shape(c.potato(px, py, r * pupil, r * pupil * 1.05, 10, 0.02), GALA.PUPIL, { angle: 90, over: 0, press: 1.3 }, { w: 3 });
  c.dot(px - r * 0.24, py - r * 0.26, r * 0.2, r * 0.18, '#ffffff');
  c.dot(px + r * 0.2, py + r * 0.22, r * 0.08, r * 0.07, '#ffffff');
}

/**
 * The galago's head round (hx, hy), `s` its size, turned `rot` degrees: two big round ears, huge moon eyes looking along
 * `look`, a small muzzle; `face` its expression. `ears` scales the ears.
 */
export function galagoHead(c: Crayon, hx: number, hy: number, s: number, rot: number, face: 'curious' | 'joy', look: P, ears = 1, tall = 1, glow = false) {
  const { shape, stroke, dot } = c;
  const { FUR, DEEP, BELLY, RIM, NOSE, CHEEK } = GALA;
  const { T, t } = frame(hx, hy, s, rot);
  /** A big thin ear from its base at (x, y), tipped `deg` degrees from upright, `w` wide and `h` tall. */
  const ear = (x: number, y: number, deg: number, w: number, h: number, col: string) => {
    const a = ((deg + rot) * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]], [bx, by] = T([x, y]);
    const at = (f: number, k: number): P => [bx + (u[0] * f * h * tall + v[0] * k * w * (1 - (tall - 1) * f * 0.8)) * s, by + (u[1] * f * h * tall + v[1] * k * w * (1 - (tall - 1) * f * 0.8)) * s];
    shape([at(0, -0.3), at(0.35, -0.5), at(0.75, -0.48), at(0.98, -0.2), at(1, 0.12), at(0.82, 0.42), at(0.45, 0.52), at(0, 0.3)], col, { angle: deg + rot + 90, over: 0.2 });
    c.tint([at(0.2, -0.24), at(0.5, -0.34), at(0.85, -0.22), at(0.88, 0.14), at(0.5, 0.3), at(0.2, 0.2)], RIM, { wash: 0.85 });
  };
  ear(-50, -120, -30, 130 * ears, 170 * ears, DEEP);
  shape(t([[-170, 0], [-150, -90], [-70, -150], [40, -156], [130, -110], [170, -20], [160, 70], [100, 130], [0, 150], [-90, 130], [-150, 80]]), FUR, { angle: 76 + rot, over: 0.4 });
  // the bushbaby's face: dark rings round the eyes, a pale stripe down between them to the muzzle
  // (on the grown one, a pale moonlight glow instead)
  const ring = glow ? '#fff4b8' : DEEP;
  c.tint(c.potato(...T([-88, -14]), 72 * s, 76 * s, 10, 0.04), ring, { wash: 0.9 });
  c.tint(c.potato(...T([48, -20]), 92 * s, 94 * s, 10, 0.04), ring, { wash: 0.9 });
  c.tint(t([[-10, -150], [16, -120], [-4, -60], [-60, 20], [-110, 70], [-150, 60], [-90, 0], [-30, -70], [-30, -140]]), BELLY, { angle: 60, wash: 0.9 });
  c.tint(t([[-60, 90], [0, 110], [60, 130], [0, 148], [-90, 130]]), BELLY, { angle: 0, wash: 0.8 });
  ear(70, -120, 26, 170 * ears, 210 * ears, FUR);
  // a little pointed muzzle
  shape(t([[-120, 40], [-170, 50], [-196, 74], [-180, 100], [-130, 110], [-96, 92]]), BELLY, { angle: 30, over: 0 }, { w: 0.1 });
  stroke(t([[-150, 46], [-190, 64], [-196, 84], [-176, 102], [-130, 110]]), { w: 4.5 });
  dot(...T([-190, 68]), 12 * s, 9 * s, NOSE);
  moonEye(c, ...T([-88, -18]), 54 * s, look);
  moonEye(c, ...T([46, -24]), 70 * s, look);
  c.cheek(...T([96, 70]), 28 * s, 16 * s, CHEEK);
  if (face === 'curious') {
    // curious: brows lifted high, a tiny round « o »
    stroke(t([[-130, -94], [-96, -106], [-64, -98]]), { w: 5 });
    stroke(t([[0, -112], [44, -126], [90, -112]]), { w: 5 });
    c.shape(c.potato(...T([-160, 94]), 11 * s, 12 * s, 8, 0.05), '#8a2a50', { over: 0 }, { w: 3.5 });
  } else {
    // delighted: a wide smile under the muzzle, its corner curling up
    stroke(t([[-188, 96], [-160, 108], [-124, 104], [-110, 90]]), { w: 5.5 });
  }
  c.part('paupieres', { pivot: T([-20, -20]), motion: 'blink', extra: true }, () => {
    c.lid(...T([-88, -18]), 54 * s, 56 * s, FUR);
    c.lid(...T([46, -24]), 70 * s, 72 * s, FUR);
  });
  return { T, t };
}

/** A fluffy tail tip from `base` along `dir` (degrees, 0 = up), `len` long and `w` wide: a soft moon-yellow tuft. */
export function tuft(c: Crayon, base: P, dir: number, len: number, w: number) {
  const a = (dir * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  const at = (f: number, k: number): P => [base[0] + u[0] * f * len + v[0] * k * w, base[1] + u[1] * f * len + v[1] * k * w];
  c.shape([at(0, -0.36), at(0.3, -0.52), at(0.62, -0.46), at(0.8, -0.28), at(0.78, -0.12), at(1, 0.02), at(0.82, 0.12), at(0.84, 0.3), at(0.62, 0.46), at(0.3, 0.52), at(0, 0.36), at(-0.1, 0)], GALA.MOON, { angle: dir + 90, over: 0 }, { w: 4.5 });
  c.tint([at(0.05, 0.1), at(0.35, 0.28), at(0.62, 0.3), at(0.45, 0.42), at(0.1, 0.34)], GALA.MOON2, { wash: 0.6 });
}

/** A long tail along `spine`, bushier toward its end, `w` wide there, its moon tuft continuing it. */
export function bushyTail(c: Crayon, spine: P[], w: number, k = 1.5) {
  const n = spine.length, [a, b] = [spine[n - 2], spine[n - 1]];
  c.shape(lineOfAction(spine, spine.map((_, i) => w * (0.5 + 0.5 * (i / (n - 1))))), GALA.DEEP, { angle: 60, over: 0.2 });
  const dir = (Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI;
  tuft(c, [a[0] + (b[0] - a[0]) * 0.4, a[1] + (b[1] - a[1]) * 0.4], dir, w * k, w * 1.15);
}

/** A branch (scenery) along `spine`, `w0` to `w1` wide, a leaf or two. */
export function branch(c: Crayon, spine: P[], w0: number, w1: number, leaves: P[] = []) {
  c.part('branche', { pivot: spine[0], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
    c.shape(c.band(spine, w0, w1), GALA.BARK, { angle: 10, over: 0.3 });
    c.stroke(spine.slice(1).map(([x, y]): P => [x + 6, y + 4]), { w: 3, col: GALA.BARK2 });
    for (const [x, y] of leaves) c.shape([[x, y], [x - 30, y - 40], [x - 6, y - 90], [x + 26, y - 44]], GALA.LEAF, { angle: 80, over: 0 }, { w: 3.5 });
  });
}

/**
 * A baby galago, curious about the night (« curieux de la nuit »), turned to the left: a little silver-lavender bushbaby
 * clinging upright to a branch, its huge moon-yellow eyes wide open on something it just saw, its big round ears turned
 * toward it, its long hind legs folded like springs, ready to leap. A long fluffy tail, its tip yellow as the moon.
 */
export default {
  id: '006', slug: 'lunou', seed: 608, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, potato } = c;
    const { FUR, DEEP, BELLY } = GALA;

    const tail = (spine: P[], w: number) => c.part('queue', { pivot: spine[0], motion: 'swing', amp: 3, period: 2.6, behind: true }, () => bushyTail(c, spine, w));

    // clinging upright to a tall branch, looking back over its shoulder, legs folded like springs
    branch(c, [[700, 990], [690, 700], [672, 400], [660, 40]], 96, 70, [[640, 220]]);
    tail([[650, 740], [670, 850], [640, 930], [560, 960], [480, 940]], 96);
    shape(potato(680, 470, 34, 26, 8, 0.06), DEEP, { angle: 30 });
    shape([[480, 520], [520, 440], [610, 420], [680, 470], [700, 590], [690, 720], [640, 780], [560, 770], [500, 700], [470, 600]], FUR, { angle: 80, over: 0.4 });
    c.tint([[486, 540], [520, 470], [560, 500], [560, 640], [540, 740], [490, 680]], BELLY, { angle: 80, wash: 0.8 });
    // the long hind leg folded like a spring: a big thigh on the flank, the knee up, the long foot gripping the bark
    openLimb(c, [[670, 600], [580, 610], [520, 660], [520, 730], [580, 770], [680, 770], [700, 690]], FUR, 1, 5);
    shape([[560, 740], [640, 790], [700, 820], [740, 810], [740, 850], [690, 860], [610, 830], [550, 780]], FUR, { angle: 20 });
    openLimb(c, [[580, 470], [620, 510], [660, 520], [700, 500], [710, 540], [660, 560], [600, 550], [560, 520]], FUR, 1, 5);
    shape(potato(706, 522, 30, 26, 8, 0.06), FUR, { angle: 30 });
    galagoHead(c, 440, 330, 0.95, -8, 'curious', [-0.5, -0.3], 1);
  },
} satisfies Redraw;
