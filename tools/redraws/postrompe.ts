import type { Crayon, P, Redraw } from './crayon.ts';

/** Points along a smooth curve through `pts`, `n` of them. */
function sample(pts: P[], n: number): P[] {
  const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out: P[] = [];
  for (let k = 0; k < n; k++) {
    const u = (k / (n - 1)) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), t = u - i;
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)], t2 = t * t, t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

/** A soft grey-lilac skin, pink inside its ears, the red heart seal of its letter as the one accent. */
const BODY = '#b6b0de', DEEP = '#928cc6', BELLY = '#e6e2f6';
const PINK = '#f6a6c4', PINK2 = '#ec80a8', NAIL = '#fff4e0', MOUTH = '#b02a4c', TONGUE = '#ff8fb0', EYE = '#241c38';
const CHEEK = '#f27aa0', LETTER = '#fffaf0', SEAL = '#e8503a', CLOUD = '#ffffff';

/** A big ear (wing) from its root edge `r0`–`r1` out through `edge`; pink inside, drawn whole. */
function ear(c: Crayon, r0: P, edge: P[], r1: P, col: string, inner = PINK) {
  const out = [r0, ...edge, r1];
  c.shape(out, col, { angle: 30, over: 0.3 });
  const xs = out.map((p) => p[0]), ys = out.map((p) => p[1]);
  const root: P = [(r0[0] + r1[0]) / 2, (r0[1] + r1[1]) / 2];
  const mid: P = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  // the pink inside: the edge pulled in toward its middle, and toward its root
  const inPts = edge.map(([x, y]): P => [x + (mid[0] - x) * 0.22 + (root[0] - x) * 0.12, y + (mid[1] - y) * 0.22 + (root[1] - y) * 0.12]);
  c.tint([[(r0[0] + root[0]) / 2, (r0[1] + root[1]) / 2], ...inPts, [(r1[0] + root[0]) / 2, (r1[1] + root[1]) / 2]], inner, { angle: 40, wash: 0.9 });
}

/** A short chubby leg from `top` to its round foot at `foot`, three cream toenails at the front. */
function leg(c: Crayon, top: P, foot: P, w: number, col: string) {
  const dx = foot[0] - top[0], dy = foot[1] - top[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l], v: P = [-u[1], u[0]];
  const at = (t: number, k: number): P => [top[0] + dx * t + v[0] * k * w, top[1] + dy * t + v[1] * k * w];
  // a chubby baby leg: wide at the top, a little narrower at the ankle, a round foot
  c.shape([at(-0.1, -0.55), at(0.4, -0.5), at(0.85, -0.46), at(1.02, -0.4), at(1.08, 0), at(1.02, 0.42), at(0.85, 0.5), at(0.4, 0.52), at(-0.1, 0.58)], col, { angle: 80, over: 0.2 });
  for (const k of [-0.36, -0.12, 0.12]) {
    const [x, y] = at(0.98, -k);
    c.shape(c.potato(x, y, w * 0.11, w * 0.09, 7, 0.05), NAIL, { over: 0 }, { w: 3 });
  }
}

/** The trunk along `spine` (root to tip), `w0` to `w1` wide, a few wrinkles, the round tip open. */
function trunk(c: Crayon, spine: P[], w0: number, w1: number, col: string) {
  const sp = sample(spine, 24);
  c.shape(c.band(sp, w0, w1), col, { angle: 60, over: 0.25 });
  for (const i of [6, 9, 12]) {
    const [x, y] = sp[i], [qx, qy] = sp[i + 1], dx = qx - x, dy = qy - y, l = Math.hypot(dx, dy) || 1, w = (w0 + ((w1 - w0) * i) / 23) * 0.32;
    c.stroke([[x - (dy / l) * w, y + (dx / l) * w], [x + (dy / l) * w * 0.2, y - (dx / l) * w * 0.2]], { w: 3.5 });
  }
  const [tx, ty] = sp[23], [px, py] = sp[21], a = Math.atan2(ty - py, tx - px);
  c.shape(c.potato(tx, ty, w1 * 0.42, w1 * 0.28, 8, 0.04).map(([x, y]): P => {
    const dx = x - tx, dy = y - ty, r = a + Math.PI / 2;
    return [tx + dx * Math.cos(r) - dy * Math.sin(r), ty + dx * Math.sin(r) + dy * Math.cos(r)];
  }), PINK2, { over: 0, wash: 1 }, { w: 3.5 });
  return sp;
}

/** A letter held in the trunk's curl: a cream envelope, its flap, a red heart seal (the one accent). */
function letter(c: Crayon, cx: number, cy: number, w: number, h: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const R = ([x, y]: P): P => [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
  const box: P[] = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  c.shape(box.map(R), LETTER, { angle: deg + 10, over: 0, press: 0.6 }, { w: 4 }, false);
  c.stroke(([[-w / 2, -h / 2], [0, h * 0.1], [w / 2, -h / 2]] as P[]).map(R), { w: 3.5 }, false);
  const [sx, sy] = R([0, h * 0.1]);
  c.shape([[sx, sy + 12], [sx - 14, sy - 2], [sx - 8, sy - 10], [sx, sy - 5], [sx + 8, sy - 10], [sx + 14, sy - 2]], SEAL, { over: 0, wash: 1 }, { w: 3 });
}

/** A small flat cloud (scenery), its bumps on top. */
function cloud(c: Crayon, x: number, y: number, s: number) {
  c.shape([[x - 110 * s, y], [x - 100 * s, y - 34 * s], [x - 60 * s, y - 50 * s], [x - 30 * s, y - 84 * s], [x + 20 * s, y - 90 * s], [x + 56 * s, y - 60 * s], [x + 96 * s, y - 52 * s], [x + 116 * s, y - 16 * s], [x + 106 * s, y + 6 * s]], CLOUD, { over: 0, wash: 0.4, press: 0.5 }, { w: 3.5, col: '#9ab4d4' });
}

/**
 * The happy face on a head centred on (hx, hy), size `s`: big shiny eyes (the far one smaller, beyond the trunk's root),
 * arched brows, a wide open smile under the trunk, a rosy cheek.
 */
function face(c: Crayon, hx: number, hy: number, s: number, skin: string) {
  const H = ([x, y]: P): P => [hx + x * s, hy + y * s];
  const e1 = H([-100, -24]), e2 = H([36, -30]);
  c.eye(e1[0], e1[1], 25 * s, 34 * s, EYE);
  c.eye(e2[0], e2[1], 35 * s, 45 * s, EYE);
  c.stroke([H([-124, -82]), H([-100, -94]), H([-76, -86])], { w: 6 });
  c.stroke([H([0, -100]), H([36, -116]), H([74, -102])], { w: 6 });
  c.cheek(...H([100, 36]), 30 * s, 17 * s, CHEEK);
  // the mouth wide open under the trunk's root, on the near side
  c.shape([H([-36, 62]), H([10, 76]), H([58, 62]), H([52, 100]), H([20, 124]), H([-14, 116]), H([-34, 90])], MOUTH, { over: 0 }, { w: 4.5 });
  c.shape([H([-10, 106]), H([18, 96]), H([44, 102]), H([24, 120]), H([0, 118])], TONGUE, { over: 0 }, { w: 0.1 });
  c.part('paupieres', { pivot: H([-30, -28]), motion: 'blink', extra: true }, () => {
    c.lid(e1[0], e1[1], 25 * s, 34 * s, skin);
    c.lid(e2[0], e2[1], 35 * s, 45 * s, skin);
  });
}

/** A round head centred on (hx, hy), size `s`, the forehead domed, the cheeks full. */
function head(c: Crayon, hx: number, hy: number, s: number) {
  const H = ([x, y]: P): P => [hx + x * s, hy + y * s];
  c.shape(([[-168, 0], [-150, -86], [-84, -150], [10, -166], [104, -138], [162, -70], [176, 20], [146, 100], [70, 146], [-30, 150], [-110, 120], [-158, 66]] as P[]).map(H), BODY, { angle: 76, over: 0.4 });
  c.tint(([[-160, 40], [-110, 110], [-30, 140], [40, 130], [-20, 100], [-100, 70]] as P[]).map(H), BELLY, { angle: 60, wash: 0.5 });
}

/**
 * A baby elephant that flies by flapping its huge ears (« joyeux et maladroit »), turned to the left: it brings the mail
 * to the villages, often the wrong way, its trunk curled up happily, its little legs kicking in the air.
 */
export default {
  id: '026', slug: 'postrompe', seed: 2671, size: [1000, 1000], tilt: -8,
  draw(c) {
    const { shape, stroke, potato } = c;

    // mid-flight, a little nose down: both ears raised in a V like wings, the trunk curled up in front holding a
    // letter, the front legs reaching forward and the hind legs kicking back
    c.part('nuage', { pivot: [300, 900], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => cloud(c, 300, 900, 0.8));
    c.part('oreille-loin', { pivot: [440, 370], motion: 'flap', amp: -8, period: 1.3, behind: true }, () => {
      ear(c, [400, 380], [[360, 320], [330, 240], [356, 170], [430, 136], [510, 160], [550, 230], [546, 310]], [500, 390], DEEP, PINK2);
    });
    c.part('queue', { pivot: [820, 600], motion: 'swing', amp: 6, period: 1.8, behind: true }, () => {
      shape(c.band(sample([[810, 610], [866, 596], [906, 556], [900, 516]], 10), 24, 14), DEEP, { angle: 40, over: 0 });
      shape(potato(898, 506, 20, 24, 8, 0.1), PINK2, { over: 0 });
    });
    leg(c, [540, 680], [450, 764], 70, DEEP);
    leg(c, [740, 660], [856, 690], 68, DEEP);
    shape([[470, 570], [560, 510], [680, 500], [790, 540], [830, 620], [800, 700], [700, 745], [580, 745], [490, 700]], BODY, { angle: 80, over: 0.4 });
    c.tint([[490, 670], [570, 730], [690, 736], [780, 700], [690, 690], [570, 680]], BELLY, { angle: 10, wash: 0.8 });
    leg(c, [600, 710], [500, 818], 82, BODY);
    leg(c, [770, 690], [890, 756], 82, BODY);
    head(c, 390, 510, 1);
    // the letter it brings, gripped in the curl of its trunk
    letter(c, 214, 460, 116, 78, -14);
    trunk(c, [[330, 560], [300, 630], [240, 680], [170, 670], [128, 610], [138, 540], [190, 496]], 96, 50, BODY);
    face(c, 390, 510, 1, BODY);
    // the near ear, a huge round fan raised like a wing, its trailing edge softly waved
    c.part('oreille', { pivot: [548, 460], motion: 'flap', amp: 10, period: 1.3 }, () => {
      ear(c, [516, 390], [[540, 310], [590, 220], [680, 150], [800, 116], [906, 136], [956, 210], [936, 280], [956, 336], [906, 386], [826, 400], [826, 436], [746, 456], [650, 480]], [576, 520], BODY);
    });
    for (const pts of [[[920, 130], [950, 160], [962, 200]], [[936, 104], [960, 126]]] as P[][]) stroke(pts, { w: 4.5 });
  },
} satisfies Redraw;
