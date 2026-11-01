import type { Crayon, P, Redraw } from './crayon.ts';

/** The family's colours: jade skin, a pale belly, a psychic violet (eye rims, the casque's glow), a soft blush. */
export const CAM = {
  JADE: '#3fb08e', DEEP: '#2a8a6e', TEAL: '#3a9fb0', BELLY: '#e6f4d2', VIOLET: '#9466d6', GLOW: '#cbb0f6', BLUSH: '#e690c0',
  EYE: '#241c38', TONGUE: '#a8487a', BARK: '#9a6a44', BARK2: '#7a5034', LEAF: '#6cbf4a',
};

/** Maps local (x, y) around (cx, cy), scaled by `s` and turned `deg` degrees, to the page. */
export function frame(cx: number, cy: number, s: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const T = ([x, y]: P): P => [cx + (x * Math.cos(r) - y * Math.sin(r)) * s, cy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  return { T, t: (pts: P[]) => pts.map(T) };
}

/** A spiral from the outside in round (cx, cy): `R` its outer radius, `turns` turns, starting at angle `a0` (degrees,
 * 0 = right, 90 = down), turning clockwise when `dir` is 1. */
export function spiral(cx: number, cy: number, R: number, turns: number, a0: number, dir = 1, n = 28): P[] {
  return Array.from({ length: n }, (_, i): P => {
    const t = i / (n - 1), a = ((a0 + dir * t * turns * 360) * Math.PI) / 180, r = R * (1 - 0.82 * t);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

/**
 * A chameleon's turret eye at (x, y), `r` big: a round dome of skin with a ridge ring, a violet rim, and the eye pushed
 * toward `look` (x, y from -1 to 1). Its iris is a hypnotic spiral, `hyp` strong: 0 faint (thin violet line on lilac), 1
 * clear, 2 bold (thick dark spiral on violet). `lid` narrows it.
 */
export function turret(c: Crayon, x: number, y: number, r: number, look: P, skin: string, hyp = 1, lid = 0) {
  c.shape(c.potato(x, y, r, r * 0.96, 12, 0.03), skin, { angle: 60, over: 0 });
  const ex = x + look[0] * r * 0.24, ey = y + look[1] * r * 0.24, ir = r * 0.6;
  c.stroke([[x - r * 0.78, y + r * 0.2], [x - r * 0.5, y + r * 0.66], [x, y + r * 0.8], [x + r * 0.5, y + r * 0.64]], { w: 3.5, col: CAM.DEEP });
  c.shape(c.potato(ex, ey, ir * 1.12, ir * 1.12, 12, 0.02), CAM.VIOLET, { over: 0, press: 1.1, wash: 0.9 }, { w: 4 });
  c.shape(c.potato(ex, ey, ir * 0.92, ir * 0.92, 12, 0.02), CAM.GLOW, { over: 0, wash: 0.95 }, { w: 0.1 });
  c.stroke(spiral(ex, ey, ir * 0.82, 2.3, -90, -1, 34), { w: [3, 5, 7][hyp] * (r / 60), col: hyp ? CAM.EYE : CAM.VIOLET });
  c.dot(ex, ey, ir * 0.13, ir * 0.13, CAM.EYE);
  c.dot(ex - ir * 0.42, ey - ir * 0.44, ir * 0.16, ir * 0.13, '#ffffff');
  if (lid) {
    const top = ey - ir * 1.15, cut = ey - ir + 2 * ir * lid;
    c.tint([[ex - ir * 1.2, top], [ex + ir * 1.2, top], [ex + ir * 1.2, cut], [ex - ir * 1.2, cut]], skin, { wash: 1, over: 0 });
    c.stroke([[ex - ir * 1.1, cut], [ex, cut + ir * 0.08], [ex + ir * 1.1, cut]], { w: 5 });
  }
}

/** A chameleon's tongue along `path` from the mouth: a thin, clean deep violet-rose line, `w` wide, its tip glowing
 * violet. */
export function tongue(c: Crayon, path: P[], w: number) {
  c.shape(c.band(path, w, w * 0.75), CAM.TONGUE, { angle: 30, over: 0, press: 1.1 }, { w: 3.5 });
  const [x, y] = path[path.length - 1];
  c.tint(c.potato(x, y, w * 2.2, w * 2.2, 10, 0.03), CAM.GLOW, { wash: 0.7 });
  c.shape(c.potato(x, y, w * 0.95, w * 0.95, 8, 0.03), CAM.VIOLET, { over: 0, press: 1.2 }, { w: 3 });
}

/** A chameleon's grip at (x, y) on a branch: two plump bundles of toes, one forward and one back, clasping it. */
export function grip(c: Crayon, x: number, y: number, s: number, col: string, deg = 0) {
  const { t } = frame(x, y, s, deg);
  c.shape(c.band(t([[0, -6], [-26, 14], [-34, 30]]), 26, 18), col, { over: 0 }, { w: 4 });
  c.shape(c.band(t([[0, -6], [24, 14], [30, 30]]), 26, 18), col, { over: 0 }, { w: 4 });
}

/**
 * A chameleon's head in profile, turned to the left, centred on (hx, hy), `s` its size, turned `rot` degrees: a blunt
 * snout, a casque rising `h` high at the back of the head, a long mouth line that curls up at its end (a smile), a pale
 * throat. Returns where its eye goes and the transform.
 */
export function camHead(c: Crayon, hx: number, hy: number, s: number, rot: number, h: number, skin: string, o: { casque?: string; smile?: number } = {}) {
  const { T, t } = frame(hx, hy, s, rot);
  const k = o.smile ?? 1;
  const outline = t([[-160, 20], [-146, -26], [-100, -66], [-30, -90], [30, -94 - h * 0.5], [80, -96 - h], [126, -70 - h * 0.6], [152, -14], [146, 56], [90, 100], [0, 112], [-84, 92], [-144, 60]]);
  c.shape(outline, skin, { angle: 70 + rot, over: 0.4 });
  if (o.casque) c.tint(t([[20, -92 - h * 0.5], [80, -90 - h], [120, -66 - h * 0.6], [140, -20], [60, -60], [10, -80]]), o.casque, { wash: 0.85 });
  c.tint(t([[-150, 52], [-90, 86], [0, 106], [86, 96], [40, 76], [-60, 70]]), CAM.BELLY, { wash: 0.85 });
  c.stroke(t([[-158, 34], [-96, 48], [-20, 58], [30, 54 - 10 * k], [44, 40 - 10 * k]]), { w: 5 });
  c.dot(...T([-138, 4]), 6 * s, 5 * s);
  return { eye: T([-30, -12]), mouth: T([-156, 38]), T, t };
}

/**
 * A tiny round chameleon (« petit curieux »), turned to the left, curled up on a twig, its tail rolled in a spiral: shy,
 * its turret eye peeking down with a faint spiral in it, a soft blush on its cheek, the tip of its tongue curled in a tiny spiral under its chin.
 */
export default {
  id: '051', slug: 'curiolor', seed: 5101, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band } = c;
    const { JADE, DEEP } = CAM;

    c.part('brindille', { pivot: [500, 760], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape(band([[70, 790], [320, 768], [600, 748], [930, 724]], 34, 24), CAM.BARK, { angle: 4, over: 0.2 });
      shape([[880, 726], [900, 660], [950, 640], [940, 700]], CAM.LEAF, { angle: 60, over: 0 });
    });
    // the tail rolled in a spiral under the twig
    c.part('queue', { pivot: [660, 720], motion: 'swing', amp: 3, period: 3, behind: true }, () => {
      shape(band([[650, 700], [720, 740], ...spiral(700, 850, 90, 1.7, -60, 1)], 56, 12), JADE, { angle: 60, over: 0.2 });
    });
    // the far legs gripping behind
    shape(band([[460, 660], [430, 740]], 34, 28), DEEP, { angle: 80 });
    grip(c, 430, 754, 0.8, DEEP);
    // the round little body, a pale belly
    shape([[400, 640], [430, 540], [520, 480], [620, 480], [700, 540], [720, 640], [680, 720], [560, 744], [460, 730]], JADE, { angle: 70, over: 0.4 });
    c.tint([[410, 660], [470, 724], [570, 740], [670, 716], [580, 700], [470, 690]], CAM.BELLY, { wash: 0.85 });
    stroke([[470, 500], [500, 486], [530, 474]], { w: 4, col: DEEP });
    // the near legs
    shape(band([[520, 680], [500, 730]], 40, 32), JADE, { angle: 80 });
    grip(c, 500, 748, 0.95, JADE);
    shape(band([[650, 670], [660, 726]], 40, 32), JADE, { angle: 80 });
    grip(c, 662, 740, 0.95, JADE);
    // the big head, a little casque, a blush on its cheek
    const { eye, mouth, T } = camHead(c, 340, 540, 1.1, -6, 14, JADE, { smile: 0.8 });
    c.cheek(...T([60, 50]), 40, 22, CAM.BLUSH);
    // shy: the eye peeking down and away
    turret(c, eye[0], eye[1], 74, [-0.45, 0.45], JADE, 0);
    // the tip of its tongue curled into a tiny spiral just under its chin
    c.part('langue', { pivot: mouth, motion: 'nod', amp: 2, period: 2.6 }, () => {
      tongue(c, [mouth, T([-150, 70]), ...spiral(...T([-118, 96]), 26, 1.3, 180, -1, 14)], 9);
    });
  },
} satisfies Redraw;
