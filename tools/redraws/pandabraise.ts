import type { Crayon, P, Redraw } from './crayon.ts';
import { flame, lineOfAction, openLimb } from './anatomy.ts';

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

/** The family's ringed tail turned into a torch: rings whose far edge licks up in flames, a big flame at its tip. */
function torchTail(c: Crayon, ctrl: P[], w: (t: number) => number, fur: string, ring: string, heart: string, rings: number, angle = 40) {
  const N = 48, sp = sample(ctrl, N), ws = sp.map((_, i) => w(i / (N - 1)));
  const out = lineOfAction(sp, ws), L = out.slice(0, N), R = out.slice(N).reverse();
  c.shape(out, fur, { angle, over: 0.4 }, { w: 0.1 });
  for (let r = 0; r < rings; r++) {
    const a = 0.14 + (r / rings) * 0.74, b = a + 0.3 / rings;
    const i0 = Math.round(a * (N - 1)), i1 = Math.round(b * (N - 1));
    const [d0, d1] = [sp[Math.min(N - 1, i1 + 1)], sp[i1]], l = Math.hypot(d0[0] - d1[0], d0[1] - d1[1]) || 1, u: P = [(d0[0] - d1[0]) / l, (d0[1] - d1[1]) / l];
    const licks: P[] = [0.2, 0.5, 0.8].flatMap((t, k): P[] => {
      const [x, y] = [L[i1][0] + (R[i1][0] - L[i1][0]) * t, L[i1][1] + (R[i1][1] - L[i1][1]) * t], hh = [44, 60, 40][k];
      const [x2, y2] = [L[i1][0] + (R[i1][0] - L[i1][0]) * (t + 0.15), L[i1][1] + (R[i1][1] - L[i1][1]) * (t + 0.15)];
      return [[x + u[0] * hh, y + u[1] * hh], [x2, y2]];
    });
    c.tint([...L.slice(i0, i1 + 1), ...licks, ...R.slice(i0, i1 + 1).reverse()], ring, { angle: angle + 30, wash: 0.95 });
  }
  c.stroke([...out, out[0], out[1]], { w: 5 });
  // the tip burns: a big flame growing out of the last ring, its root sunk in the fur
  const [rx, ry] = sp[N - 9], [px, py] = sp[N - 16], [tx, ty] = sp[N - 1];
  flame(c, rx, ry, (Math.atan2(tx - px, py - ty) * 180) / Math.PI, ws[N - 9] * 2.8, ws[N - 9] * 1.5, ring, heart);
}

/** A limb through its joints (shoulder or hip first), `ws` wide at each, its line left open where it joins the body. */
function limb(c: Crayon, pts: P[], ws: number[], col: string) {
  const out = lineOfAction(pts, ws);
  openLimb(c, out, col, 1, out.length - 1);
}

/**
 * Toufeu, the ember panda (« panda-braise »): Touffou coloured in by a red Magic Pencil, and it has a temper now. Its
 * fur blazes orange-red with ember-tipped tufts, and its ringed tail burns like a torch of flame rings.
 */
export default {
  id: '018', slug: 'pandabraise', seed: 1819, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const FIRE = '#ec5a26', DEEP = '#a4301c', EMBER = '#f8c43a', CREAM = '#fbe9cc', LEG = '#4a1e1c', FAR = '#36161a';
    const RED = '#e33a22', PINK = '#f2849a';

    /** An ember-tipped tuft from (x, y) pointing along `deg` (0 = up). */
    const tuft = (x: number, y: number, deg: number, h: number, w: number) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
      const at = (px: number, py: number): P => [x + u[0] * py * h + v[0] * px * w, y + u[1] * py * h + v[1] * px * w];
      shape([at(-0.5, 0), at(-0.3, 0.5), at(0.1, 1), at(0.25, 0.45), at(0.5, 0)], FIRE, { angle: deg + 90, over: 0 }, { w: 4 }, false);
      c.tint([at(-0.18, 0.6), at(0.1, 1), at(0.2, 0.6)], EMBER, { wash: 1 });
    };
    /** The head centred on (hx, hy), `s` its size, turned `rot` degrees: a fierce grin. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // ears with ember tips
      shape(h([[-70, -96], [-150, -186], [-196, -170], [-198, -84], [-160, -40]]), CREAM, { angle: 70 });
      shape(h([[-96, -102], [-152, -160], [-176, -148], [-176, -90]]), DEEP, { over: 0 }, { w: 0.1 });
      c.tint(h([[-150, -186], [-196, -170], [-186, -150], [-160, -160]]), EMBER, { wash: 1 });
      shape(h([[40, -104], [80, -206], [130, -232], [184, -196], [186, -104], [150, -64]]), CREAM, { angle: 70 });
      shape(h([[72, -114], [100, -186], [134, -206], [164, -180], [160, -112]]), DEEP, { over: 0 }, { w: 0.1 });
      c.tint(h([[100, -214], [130, -232], [170, -206], [130, -206]]), EMBER, { wash: 1 });
      // cheek tufts flaring back like flames
      for (const [x, y, d, l] of [[170, 30, 70, 110], [176, 80, 100, 100], [150, 112, 130, 80]] as const) tuft(...H([x, y]), d + rot, l * s, 60 * s);
      const outline = h([[-186, 30], [-180, -10], [-146, -64], [-84, -110], [0, -124], [84, -114], [148, -74], [182, -16], [190, 40], [170, 96], [120, 126], [40, 136], [-50, 132], [-122, 110], [-176, 78]]);
      shape(outline, FIRE, { angle: 78, over: 0.45 }, { w: 0.1 });
      shape(h([[-188, 30], [-182, 0], [-150, -6], [-106, 24], [-62, 56], [-16, 66], [36, 56], [96, 40], [150, 30], [184, 40], [170, 96], [120, 126], [40, 136], [-50, 132], [-122, 110], [-176, 78]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      c.tint(h([[-112, 14], [-80, 12], [-74, 50], [-86, 92], [-98, 52]]), DEEP, { angle: 80, wash: 0.8 });
      c.tint(h([[14, 20], [50, 16], [52, 60], [40, 104], [28, 60]]), DEEP, { angle: 80, wash: 0.8 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      shape(potato(...H([-96, -84]), 24 * s, 13 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      shape(potato(...H([34, -92]), 32 * s, 16 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      // fierce: narrowed eyes keeping their shine, brows slanted down to the nose, a wide grin with two fangs
      const [e1, e2] = [H([-92, -20]), H([30, -24])];
      c.eye(e1[0], e1[1], 24 * s, 30 * s, '#241c38', { lid: 0.36, skin: FIRE, tilt: 18 + rot });
      c.eye(e2[0], e2[1], 31 * s, 37 * s, '#241c38', { lid: 0.36, skin: FIRE, tilt: -18 + rot });
      stroke(h([[-128, -70], [-70, -46]]), { w: 7.5 });
      stroke(h([[-6, -50], [70, -76]]), { w: 7.5 });
      // the muzzle: a small round bump left of the face's middle, the nose on top of it, the mouth under the nose
      shape(potato(...H([-50, 64]), 56 * s, 40 * s, 10, 0.03), CREAM, { over: 0 }, { w: 0.1 });
      stroke(h([[-106, 60], [-94, 92], [-52, 106], [-10, 94], [4, 62]]), { w: 4 });
      dot(...H([-52, 32]), 16 * s, 11 * s);
      stroke(h([[-52, 40], [-52, 54]]), { w: 4 });
      shape(h([[-104, 60], [-78, 68], [-52, 62], [-26, 68], [2, 60], [-8, 90], [-52, 104], [-94, 90]]), '#8a2230', { over: 0, wash: 1 }, { w: 4.5 });
      shape(h([[-84, 68], [-70, 68], [-78, 88]]), '#ffffff', { over: 0, wash: 1 }, { w: 2.5 }, false);
      shape(h([[-34, 68], [-20, 68], [-26, 88]]), '#ffffff', { over: 0, wash: 1 }, { w: 2.5 }, false);
      c.cheek(...H([110, 76]), 22 * s, 13 * s, PINK);
      c.part('paupieres', { pivot: H([-30, -22]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 24 * s, 30 * s, FIRE);
        c.lid(e2[0], e2[1], 31 * s, 37 * s, FIRE);
      });
    };
    /** A clawed paw at (x, y) along `deg` (0 = down): a dark mitt and three pale claws. */
    const claws = (x: number, y: number, deg: number, s: number, col: string) => {
      const a = (deg * Math.PI) / 180, u: P = [-Math.sin(a), Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      const at = (px: number, py: number): P => [x + (v[0] * px + u[0] * py) * s, y + (v[1] * px + u[1] * py) * s];
      for (const k of [-22, 0, 22]) shape([at(k - 7, 20), at(k - 2, 62), at(k + 4, 70), at(k + 8, 20)], '#f6ecd8', { over: 0 }, { w: 3 });
      shape(potato(...at(0, 10), 38 * s, 30 * s, 8, 0.05), col, { over: 0 });
    };

    // the lunge: reared up on a slant from its loaded hind legs, one paw swiping out with its claws, the torch behind
    c.part('queue', { pivot: [780, 800], motion: 'swing', amp: 3, period: 2.4, behind: true }, () => {
      torchTail(c, [[770, 810], [890, 850], [990, 800], [1030, 700], [1010, 600]], (t) => 84 + Math.sin(t * Math.PI * 0.9) * 46 - (t > 0.8 ? (t - 0.8) * 260 : 0), FIRE, EMBER, RED, 3, 20);
    });
    // far legs, darker: the hind one bent behind, the front paw drawn back to the chest
    limb(c, [[760, 760], [720, 850], [800, 900], [790, 930]], [110, 70, 54, 50], FAR);
    shape(potato(760, 934, 54, 20, 8, 0.06), FAR, { angle: 10 });
    limb(c, [[520, 560], [520, 640], [460, 640]], [80, 60, 50], FAR);
    claws(440, 640, 70, 0.8, FAR);
    {
      // the body on a slant: a deep chest high in front, a slim waist, a heavy haunch low behind
      const N = 30, sp = sample([[460, 500], [560, 600], [660, 690], [740, 770], [790, 820]], N);
      const bump = (t: number, at: number, w: number) => Math.exp(-(((t - at) / w) ** 2));
      shape(lineOfAction(sp, sp.map((_, i) => 150 + bump(i / (N - 1), 0.1, 0.2) * 50 + bump(i / (N - 1), 0.8, 0.18) * 70),
        sp.map((_, i) => bump(i / (N - 1), 0.15, 0.15) * 40)), FIRE, { angle: 50, over: 0.5 });
      c.tint(lineOfAction(sp.slice(2, 18).map(([x, y]): P => [x - 50, y + 56]), sp.slice(2, 18).map((_, i) => 50 + Math.sin((i / 15) * Math.PI) * 30)), CREAM, { angle: 50, wash: 0.8 });
    }
    for (const [x, y, d] of [[640, 580, 40], [760, 700, 60]] as const) tuft(x, y, d, 90, 56);
    // the near hind leg loaded: a round haunch, the knee forward, the shin back to the heel, the foot planted
    openLimb(c, [[660, 720], [760, 710], [830, 770], [830, 850], [770, 890], [690, 870], [650, 800]], FIRE, 1, 6);
    limb(c, [[730, 850], [640, 890], [700, 924]], [96, 66, 58], FIRE);
    shape(potato(670, 934, 70, 24, 8, 0.06), LEG, { angle: 10 });
    // the near front leg swiping out: elbow down, forearm forward, claws spread
    limb(c, [[480, 560], [420, 640], [320, 640], [240, 600]], [110, 74, 62, 56], LEG);
    claws(220, 590, 60, 1.1, LEG);
    head(380, 400, 0.78, 10);
  },
} satisfies Redraw;
