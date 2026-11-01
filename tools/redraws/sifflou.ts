import type { Crayon, P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/** The family's colours: a soft rose fur, a cream muzzle and chest, the mint of its song, a grey-blue rock. */
export const PIKA = {
  FUR: '#f5b0c6', DEEP: '#e086a8', CREAM: '#fff2ea', RIM: '#fde2ec', SONG: '#3fc2a6', MOUTH: '#b02a4c', TONGUE: '#f68aa6',
  EYE: '#241c38', NOSE: '#8a3a56', ROCK: '#b6bccc', ROCK2: '#969eb4', CHEEK: '#ef6f96',
};

/** Maps local (x, y) around (cx, cy), scaled by `s` and turned `deg` degrees, to the page. */
export function frame(cx: number, cy: number, s: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const T = ([x, y]: P): P => [cx + (x * Math.cos(r) - y * Math.sin(r)) * s, cy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  return { T, t: (pts: P[]) => pts.map(T) };
}

/** A soft scalloped edge of fluff along an oval round (cx, cy), from angle a0 to a1 (degrees, 0 = right, 90 = down),
 * `n` round bumps `depth` deep. */
export function scallop(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number, depth: number): P[] {
  const out: P[] = [], m = n * 6;
  for (let i = 0; i <= m; i++) {
    const t = i / m, a = ((a0 + (a1 - a0) * t) * Math.PI) / 180, k = 1 - depth + depth * Math.sqrt(Math.abs(Math.sin(t * n * Math.PI)));
    out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return out;
}

/** Curved sound marks (« ))) ») leaving a mouth at `at` toward `deg` (0 = up), `n` arcs. */
export function song(c: Crayon, at: P, deg: number, n: number, s = 1, col = PIKA.SONG) {
  const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  for (let i = 0; i < n; i++) {
    const d = (80 + i * 64) * s, h = (38 + i * 24) * s;
    const arc: P[] = [-1, -0.5, 0, 0.5, 1].map((f): P => [at[0] + u[0] * (d - f * f * 22 * s) + v[0] * f * h, at[1] + u[1] * (d - f * f * 22 * s) + v[1] * f * h]);
    c.stroke(arc, { w: 12 - i * 2, col });
  }
}

/**
 * The pika's head round (hx, hy), `s` its size, tipped back `rot` degrees: two round ears on top, fluff at the back of
 * its cheeks, a short cream muzzle at the front, `face` its expression. `ears` scales the ears. Returns its frame and
 * where its mouth is.
 */
export function pikaHead(c: Crayon, hx: number, hy: number, s: number, rot: number, face: 'whistle' | 'belt', ears = 1, fluff = false) {
  const { shape, stroke, dot, potato } = c;
  const { FUR, DEEP, CREAM, RIM, MOUTH, TONGUE, EYE, CHEEK, NOSE } = PIKA;
  const { T, t } = frame(hx, hy, s, rot);
  const ear = (x: number, y: number, r: number, col: string) => {
    const [ex, ey] = T([x, y]);
    shape(potato(ex, ey, r * s, r * 0.94 * s, 10, 0.03), col, { angle: 70 + rot, over: 0.2 });
    c.tint(potato(ex + 4 * s, ey + 6 * s, r * 0.58 * s, r * 0.52 * s, 9, 0.04), RIM, { wash: 0.9 });
  };
  // small round ears set low on the sides of the head, toward the back (a pika's, not a mouse's)
  ear(-20, -150, 40 * ears, DEEP);
  // fluff at the back of its cheeks (the ruff to come)
  if (fluff) shape([...t(scallop(10, 10, 222, 204, -100, 30, 3, 0.22)), T([0, 0])], FUR, { angle: 50 + rot, over: 0.2 }, { w: 4.5 });
  shape(t([[-166, -40], [-124, -128], [-30, -172], [80, -160], [160, -100], [192, -8], [178, 84], [120, 148], [20, 168], [-80, 154], [-150, 104]]), FUR, { angle: 76 + rot, over: 0.45 });
  ear(150, -96, 56 * ears, FUR);
  // the short muzzle, cream, poking out at the front
  const muzzle: P[] = [[-80, 0], [-150, -14], [-210, 6], [-232, 56], [-206, 120], [-140, 140], [-82, 110]];
  shape(t(muzzle), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
  stroke(t(muzzle.slice(1, 6)), { w: 5 });
  dot(...T([-220, 32]), 15 * s, 11 * s, NOSE);
  let mouth: P;
  if (face === 'whistle') {
    // cheerful, one emotion: big shiny eyes, happy arched brows, a little round whistle, a rosy cheek
    c.eye(...T([-112, -42]), 28 * s, 38 * s, EYE);
    c.eye(...T([8, -50]), 40 * s, 50 * s, EYE);
    stroke(t([[-146, -104], [-116, -118], [-86, -110]]), { w: 6 });
    stroke(t([[-34, -122], [8, -136], [50, -122]]), { w: 6 });
    c.cheek(...T([90, 40]), 30 * s, 18 * s, CHEEK);
    mouth = T([-182, 92]);
    shape(potato(mouth[0], mouth[1], 24 * s, 28 * s, 9, 0.04), MOUTH, { over: 0 }, { w: 4.5 });
    dot(mouth[0] + 2 * s, mouth[1] + 8 * s, 10 * s, 8 * s, TONGUE);
    c.part('paupieres', { pivot: T([-50, -46]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-112, -42]), 28 * s, 38 * s, FUR);
      c.lid(...T([8, -50]), 40 * s, 50 * s, FUR);
    });
  } else {
    // carried away by its own song: eyes shut in bliss, brows high, the mouth wide open in a big « O »
    for (const [x, y, w] of [[-108, -36, 30], [10, -44, 42]] as const) stroke(t([[x - w, y + 8], [x - w * 0.4, y - 10], [x + w * 0.4, y - 10], [x + w, y + 8]]), { w: 7 });
    stroke(t([[-146, -96], [-112, -118], [-80, -108]]), { w: 6 });
    stroke(t([[-32, -120], [10, -136], [52, -120]]), { w: 6 });
    c.cheek(...T([90, 36]), 30 * s, 18 * s, CHEEK);
    mouth = T([-170, 92]);
    shape(t([[-214, 74], [-192, 46], [-150, 44], [-118, 76], [-124, 126], [-160, 146], [-202, 126]]), MOUTH, { over: 0 }, { w: 5 });
    shape(t([[-196, 124], [-166, 108], [-132, 114], [-146, 138], [-174, 140]]), TONGUE, { over: 0 }, { w: 0.1 });
  }
  return { T, t, mouth };
}

/** The rock it sings from (scenery): a lumpy grey-blue boulder, a darker underside. */
export function rock(c: Crayon, pts: P[], shade: P[]) {
  c.part('rocher', { pivot: pts[0], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
    c.shape(pts, PIKA.ROCK, { angle: 20, over: 0.3 });
    c.tint(shade, PIKA.ROCK2, { wash: 0.6 });
  });
}

/**
 * A little pika that whistles all day (« joyeux siffleur »), turned to the left: a round ball of rose fur sitting up on
 * its rock, chest puffed out, head tipped back to the sky, its big eyes shining and its mouth round in a whistle. Small
 * round ears low on the sides of its head, no tail to be seen, a cream muzzle and a tuft of cream fur on its chest (the
 * start of the ruff it will grow).
 */
export default {
  id: '005', slug: 'sifflou', seed: 506, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, potato } = c;
    const { FUR, DEEP, CREAM } = PIKA;

    // sitting low on its rock, one round ball of fur, head tipped back whistling to the sky; no tail to be seen
    rock(c, [[130, 960], [150, 880], [250, 820], [420, 800], [620, 806], [780, 846], [870, 906], [880, 960]], [[160, 950], [400, 910], [700, 916], [870, 955]]);
    shape(potato(640, 826, 58, 22, 8, 0.05), DEEP, { angle: 10 });
    shape([[300, 690], [320, 590], [410, 520], [550, 500], [680, 540], [760, 640], [770, 740], [710, 816], [580, 840], [420, 836], [330, 790]], FUR, { angle: 76, over: 0.45 });
    c.tint([[310, 690], [340, 600], [420, 590], [460, 700], [440, 820], [360, 800], [320, 750]], CREAM, { angle: 80, wash: 0.85 });
    openLimb(c, [[700, 680], [620, 720], [570, 790], [500, 834], [560, 846], [700, 840], [750, 780], [748, 710]], FUR, 1, 7);
    shape(potato(492, 836, 58, 22, 8, 0.05), FUR, { angle: 10 });
    const { mouth } = pikaHead(c, 440, 430, 1, 32, 'whistle');
    // a tuft of cream fur on its chest, puffed out
    shape([[352, 596], [288, 614], [326, 640], [278, 668], [322, 684], [290, 716], [346, 718], [372, 660]], CREAM, { angle: 80, over: 0 }, { w: 0.1 }, false);
    c.stroke([[340, 598], [288, 614], [326, 640], [278, 668], [322, 684], [290, 716], [340, 720]], { w: 4.5 }, false);
    c.part('chant', { pivot: mouth, motion: 'nod', amp: 3, period: 2.4, decor: true }, () => song(c, mouth, -56, 2, 0.9));
  },
} satisfies Redraw;
