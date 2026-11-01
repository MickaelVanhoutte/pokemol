import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';

/** The family's colours: silver-lavender fur, a pale belly, moon-yellow eyes and tail tip, a night sky, a night-brown branch. */
export const GALA = {
  FUR: '#aaa4dc', DEEP: '#7e76bc', BELLY: '#eeedfa', RIM: '#d8c8ec', MOON: '#f6d443', MOON2: '#e8a92a', PUPIL: '#1f1a34',
  NOSE: '#4e3e6e', BARK: '#8a6a58', BARK2: '#6e5244', LEAF: '#5fae6a', CHEEK: '#f08ab0',
  NIGHT: '#2a2672', NIGHT2: '#463a9c', STAR: '#fff1a0', GLOW: '#fff6c4',
};

/** Maps local (x, y) around (cx, cy), scaled by `s` and turned `deg` degrees, to the page. */
export function frame(cx: number, cy: number, s: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const T = ([x, y]: P): P => [cx + (x * Math.cos(r) - y * Math.sin(r)) * s, cy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  return { T, t: (pts: P[]) => pts.map(T) };
}

/**
 * A moon eye at (x, y), `r` its size: a moon-yellow disc, a round dark pupil looking along `look`, two shines. `low`
 * (0–1) raises a lower lid of `skin` from below, its edge an arc bowed up: a content, smiling eye that keeps its shine.
 */
export function moonEye(c: Crayon, x: number, y: number, r: number, look: P = [0, 0], pupil = 0.62, low = 0, skin = GALA.FUR) {
  c.shape(c.potato(x, y, r, r * 1.04, 11, 0.02), GALA.MOON, { angle: 80, over: 0, press: 1.1 }, { w: 4.5 });
  c.tint(c.potato(x + r * 0.1, y + r * 0.35, r * 0.75, r * 0.5, 9, 0.04), GALA.MOON2, { wash: 0.5 });
  const [px, py] = [x + look[0] * r * 0.25, y + look[1] * r * 0.25];
  c.shape(c.potato(px, py, r * pupil, r * pupil * 1.05, 10, 0.02), GALA.PUPIL, { angle: 90, over: 0, press: 1.3 }, { w: 3 });
  c.dot(px - r * 0.24, py - r * 0.26, r * 0.2, r * 0.18, '#ffffff');
  c.dot(px + r * 0.2, py + r * 0.22, r * 0.08, r * 0.07, '#ffffff');
  if (low > 0) {
    const top = y + r - 2 * r * low;
    const arc: P[] = [[x - r * 1.08, top + r * 0.3], [x - r * 0.55, top + r * 0.02], [x, top - r * 0.06], [x + r * 0.55, top + r * 0.02], [x + r * 1.08, top + r * 0.3]];
    c.shape([...arc, [x + r * 1.14, y + r * 1.2], [x - r * 1.14, y + r * 1.2]], skin, { over: 0, spill: 0, wash: 1 }, { w: 0.1 });
    c.stroke(arc.slice(1, 4), { w: 4.5 });
  }
}

/** A little four-point twinkle star at (x, y), `r` big: the night sky's pattern. */
export function twinkle(c: Crayon, x: number, y: number, r: number, rot = 0) {
  const pts: P[] = Array.from({ length: 8 }, (_, i) => {
    const a = ((rot + i * 45) * Math.PI) / 180, k = i % 2 ? 0.3 : 1;
    return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k];
  });
  c.shape(pts, GALA.STAR, { angle: rot + 60, over: 0, wash: 0.9, press: 1.2 }, { w: 3 }, false);
}

/**
 * The tail's tip: a soft round brush of moon-gold fur at (x, y), `r` big, shaded underneath, glowing softly round it like
 * a little moon (« veilleuse »).
 */
export function moonBrush(c: Crayon, x: number, y: number, r: number) {
  c.tint(c.potato(x, y, r * 1.45, r * 1.45, 12, 0.03), GALA.GLOW, { wash: 0.55 });
  c.shape(c.potato(x, y, r, r * 0.96, 12, 0.05), '#f8dc62', { angle: 60, over: 0.2 }, { w: 4.5 });
  c.tint(c.potato(x + r * 0.18, y + r * 0.3, r * 0.7, r * 0.5, 9, 0.05), GALA.MOON2, { wash: 0.55 });
  c.dot(x - r * 0.35, y - r * 0.4, r * 0.16, r * 0.12, '#fffbe0');
}

/** A long tail along `spine`, `w0` wide at its root to `w1` near its end, ending in its moon brush, `r` big. */
export function moonTail(c: Crayon, spine: P[], w0: number, w1: number, r: number) {
  const n = spine.length;
  c.shape(lineOfAction(spine, spine.map((_, i) => w0 + ((w1 - w0) * i) / (n - 1))), GALA.DEEP, { angle: 60, over: 0.2 });
  moonBrush(c, ...spine[n - 1], r);
}

/**
 * A thin drape of skin along the flank from the elbow `a` to the knee `b`, hanging `sag` along `dir` (a unit vector away
 * from the body): lavender skin, a narrow night-blue crescent inside its hem, a star or two. It grows into Lunambule's
 * starry gliding membrane.
 */
export function skinFold(c: Crayon, a: P, b: P, sag: number, dir: P, stars: [number, number][]) {
  const at = (f: number, k: number): P => [a[0] + (b[0] - a[0]) * f + dir[0] * k * sag, a[1] + (b[1] - a[1]) * f + dir[1] * k * sag];
  const fs = [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 1];
  const hem = fs.map((f) => at(f, Math.sin(f * Math.PI)));
  const inner = fs.slice().reverse().map((f) => at(f, Math.sin(f * Math.PI) * 0.45 - 0.08));
  c.shape([...hem, ...inner], GALA.FUR, { angle: 30, over: 0.2 }, { w: 0.1 });
  c.shape([...fs.slice(1, -1).map((f) => at(f, Math.sin(f * Math.PI) * 0.88)), ...fs.slice(1, -1).reverse().map((f) => at(f, Math.sin(f * Math.PI) * 0.5))], GALA.NIGHT, { angle: 30, over: 0.3, press: 1.2 }, { w: 0.1 });
  c.stroke(hem, { w: 4.5 });
  for (const [f, k] of stars) twinkle(c, ...at(f, Math.sin(f * Math.PI) * k), 10, 10);
}

/**
 * A baby galago, a scaredy-cat of the night (« peureux »), turned to the left: a little silver-lavender bushbaby crouched
 * on a bough in the dark, shoulders hunched, knees high, its long hind feet curled round the bark, hugging the round
 * glowing tip of its own long tail to its chest like a night-light. Huge moon-yellow eyes wide open, big ears folded half
 * back, brows tilted with worry, a tiny wobbly mouth. A thin drape of skin from elbow to knee, a night-blue crescent and a
 * star or two inside it: one day it will glide (Lunambule).
 */
export default {
  id: '006', slug: 'lunou', seed: 608, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato, band } = c;
    const { FUR, DEEP, BELLY, RIM, NOSE, CHEEK } = GALA;

    // the round bough it crouches on (scenery)
    c.part('branche', { pivot: [500, 930], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape(lineOfAction([[80, 952], [140, 944], [500, 926], [860, 934], [930, 938]], [70, 112, 120, 104, 60]), GALA.BARK, { angle: 10, over: 0.3 });
      c.tint(lineOfAction([[140, 976], [500, 960], [860, 966]], [30, 40, 30]), GALA.BARK2, { angle: 10, wash: 0.8 });
      stroke([[220, 934], [420, 922]], { w: 3, col: GALA.BARK2 });
      stroke([[600, 930], [780, 934]], { w: 3, col: GALA.BARK2 });
    });
    /** A long galago foot from `heel` to `toe` along the top of the bough, its toes curled down over the front. */
    const foot = (heel: P, toe: P, col: string) => {
      shape(band([heel, toe], 40, 34), col, { angle: 10 });
      for (const dx of [-22, 0, 22]) {
        const p: P = [toe[0] + dx, toe[1] + 4];
        shape(band([p, [p[0] - 10, p[1] + 26], [p[0] - 4, p[1] + 44]], 18, 14), col, { angle: 80 }, { w: 3.5 });
      }
    };
    // the round body, hunched: the shoulders drawn up round the head
    shape([[440, 890], [418, 760], [430, 640], [500, 580], [620, 556], [710, 620], [740, 760], [716, 880], [580, 912]], FUR, { angle: 80, over: 0.4 });
    c.tint(potato(486, 760, 52, 110, 10, 0.08), BELLY, { angle: 80, wash: 0.75 });
    // the near hind leg in a crouch: the thigh on the flank, the knee high and forward, the shin back down to the heel
    openLimb(c, [[720, 884], [748, 790], [706, 716], [620, 730], [556, 776], [560, 820], [604, 860], [650, 890]], FUR, 1, 7);
    // the near arm: the shoulder on the flank, the elbow back, the forearm forward round the tail
    openLimb(c, band([[606, 606], [684, 694], [560, 726], [420, 690]], 66, 40), FUR, 0, 4);
    // the thin drape of skin from the elbow down to the knee
    skinFold(c, [688, 708], [566, 796], 84, [0.6, 0.8], [[0.36, 0.66], [0.64, 0.64]]);
    // the tail: one band from the rump round the front along the bough, then up over the forearm into the hands
    moonTail(c, [[700, 880], [640, 944], [520, 960], [390, 936], [306, 856], [300, 750], [350, 660]], 56, 76, 70);
    // the long feet over it, their toes curled round the bough (the far one darker)
    foot([520, 890], [440, 900], DEEP);
    foot([690, 896], [584, 906], FUR);
    // the two little hands holding it
    shape(potato(296, 650, 24, 20, 8, 0.06), DEEP, { angle: 20 });
    shape(potato(406, 682, 30, 26, 8, 0.06), FUR, { angle: 20 });
    stroke([[390, 668], [384, 688]], { w: 3.5 });

    // the big head, ears up, looking out at the dark
    const { T, t } = frame(500, 444, 1, -4);
    const ear = (x: number, y: number, deg: number, w: number, h: number, col: string) => {
      const a = ((deg - 4) * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]], [bx, by] = T([x, y]);
      const at = (f: number, k: number): P => [bx + u[0] * f * h + v[0] * k * w, by + u[1] * f * h + v[1] * k * w];
      shape([at(0, -0.3), at(0.35, -0.5), at(0.75, -0.48), at(0.98, -0.2), at(1, 0.12), at(0.82, 0.42), at(0.45, 0.52), at(0, 0.3)], col, { angle: deg + 86, over: 0.2 });
      c.tint([at(0.2, -0.24), at(0.5, -0.34), at(0.85, -0.22), at(0.88, 0.14), at(0.5, 0.3), at(0.2, 0.2)], RIM, { wash: 0.85 });
    };
    c.part('oreilles', { pivot: T([20, -130]), motion: 'swing', amp: 2, period: 2.4, behind: true }, () => {
      ear(-30, -130, 6, 130, 160, DEEP);
      ear(80, -116, 58, 170, 200, FUR);
    });
    shape(t([[-170, 0], [-150, -90], [-70, -150], [40, -156], [130, -110], [170, -20], [160, 70], [100, 130], [0, 150], [-90, 130], [-150, 80]]), FUR, { angle: 76, over: 0.4 });
    // dark rings round the eyes, a pale stripe down between them, a pale chin
    c.tint(c.potato(...T([-88, -14]), 74, 78, 10, 0.04), DEEP, { wash: 0.95 });
    c.tint(c.potato(...T([48, -20]), 94, 96, 10, 0.04), DEEP, { wash: 0.95 });
    c.tint(t([[-10, -150], [16, -120], [-4, -60], [-60, 20], [-110, 70], [-150, 60], [-90, 0], [-30, -70], [-30, -140]]), BELLY, { angle: 60, wash: 0.9 });
    c.tint(t([[-60, 90], [0, 110], [60, 130], [0, 148], [-90, 130]]), BELLY, { angle: 0, wash: 0.8 });
    // a short round muzzle
    shape(t([[-120, 44], [-156, 50], [-174, 72], [-164, 98], [-128, 106], [-100, 92]]), BELLY, { angle: 30, over: 0 }, { w: 0.1 });
    stroke(t([[-146, 48], [-170, 62], [-174, 82], [-160, 100], [-128, 106]]), { w: 4.5 });
    dot(...T([-166, 64]), 12, 9, NOSE);
    // scared, one signal: huge eyes wide open with small pupils glancing aside, brows tilted up in the middle,
    // a tiny wobbly mouth
    moonEye(c, ...T([-88, -18]), 56, [-0.7, 0.1], 0.46);
    moonEye(c, ...T([46, -24]), 72, [-0.7, 0.1], 0.46);
    c.cheek(...T([100, 74]), 28, 16, CHEEK);
    stroke(t([[-140, -84], [-104, -98], [-62, -124]]), { w: 6 });
    stroke(t([[-6, -134], [42, -118], [94, -104]]), { w: 6 });
    stroke(t([[-160, 118], [-150, 110], [-140, 118], [-130, 110], [-120, 116]]), { w: 4.5 });
    c.part('paupieres', { pivot: T([-20, -20]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-88, -18]), 56, 58, FUR);
      c.lid(...T([46, -24]), 72, 74, FUR);
    });
  },
} satisfies Redraw;
