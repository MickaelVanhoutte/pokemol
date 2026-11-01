import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';

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

/** A zig-zag line from `a` to `b`, `n` teeth of `h` along `d` (a unit direction). */
function zigLine(a: P, b: P, n: number, h: number, d: P): P[] {
  return Array.from({ length: n + 1 }, (_, k): P => {
    const t = k / n, o = k % 2 ? h : -h * 0.3;
    return [a[0] + (b[0] - a[0]) * t + d[0] * o, a[1] + (b[1] - a[1]) * t + d[1] * o];
  });
}

/** The family's bushy ringed tail, charged: each ring's edges crackle in zig-zags. */
function boltTail(c: Crayon, ctrl: P[], w: (t: number) => number, fur: string, ring: string, rings: number, angle = 30) {
  const N = 48, sp = sample(ctrl, N), ws = sp.map((_, i) => w(i / (N - 1)));
  const out = lineOfAction(sp, ws), L = out.slice(0, N), R = out.slice(N).reverse();
  c.shape(out, fur, { angle, over: 0.4 }, { w: 0.1 });
  const dir = (i: number): P => {
    const [a, b] = [sp[Math.max(0, i - 1)], sp[Math.min(N - 1, i + 1)]], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  for (let r = 0; r < rings; r++) {
    const a = 0.16 + (r / rings) * 0.78, b = a + 0.36 / rings;
    const i0 = Math.round(a * (N - 1)), i1 = Math.round(b * (N - 1)), d0 = dir(i0), d1 = dir(i1);
    c.tint([...L.slice(i0, i1 + 1), ...zigLine(L[i1], R[i1], 5, 16, d1).slice(1, -1), ...R.slice(i0, i1 + 1).reverse(), ...zigLine(R[i0], L[i0], 5, -16, d0).slice(1, -1)], ring, { angle: angle + 30, wash: 0.9 });
  }
  c.stroke([...out, out[0], out[1]], { w: 5 });
}

/** A limb through its joints (shoulder or hip first), `ws` wide at each, its line left open where it joins the body. */
function limb(c: Crayon, pts: P[], ws: number[], col: string) {
  const out = lineOfAction(pts, ws);
  openLimb(c, out, col, 1, out.length - 1);
}

/**
 * Toufoudre, the storm panda (« panda-orage »): Touffou zapped by a yellow Magic Pencil, and it can't keep still any
 * more. Its fur stands up golden with static and its ringed tail has struck into a bolt that crackles at every ring.
 */
export default {
  id: '019', slug: 'pandorage', seed: 119, size: [1100, 900], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const GOLD = '#f6c61e', DEEP = '#b4740e', CREAM = '#fff4d6', LEG = '#33304a', FAR = '#24223a', PINK = '#f28aa0';
    const SPARK = '#fff6a0';

    /** A spike of static fur from (x, y) along `deg` (0 = up): a little zig-zag flash. */
    const spike = (x: number, y: number, deg: number, h: number, w: number) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
      const at = (px: number, py: number): P => [x + u[0] * py * h + v[0] * px * w, y + u[1] * py * h + v[1] * px * w];
      shape([at(-0.5, 0), at(-0.1, 0.5), at(-0.4, 0.55), at(0.2, 1), at(0.15, 0.45), at(0.45, 0.42), at(0.5, 0)], GOLD, { angle: deg + 90, over: 0 }, { w: 4 }, false);
    };
    /** The head centred on (hx, hy), `s` its size, turned `rot` degrees: a wild grin. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      shape(h([[-70, -96], [-150, -176], [-196, -158], [-198, -84], [-160, -40]]), CREAM, { angle: 70 });
      shape(h([[-96, -102], [-152, -150], [-176, -138], [-176, -90]]), DEEP, { over: 0 }, { w: 0.1 });
      shape(h([[40, -104], [74, -192], [130, -218], [184, -184], [186, -104], [150, -64]]), CREAM, { angle: 70 });
      shape(h([[72, -114], [96, -176], [134, -194], [164, -170], [160, -112]]), DEEP, { over: 0 }, { w: 0.1 });
      // static: a flash of fur on the crown and on the cheek
      spike(...H([-20, -110]), -10 + rot, 90 * s, 70 * s);
      for (const [x, y, d] of [[176, 20, 80], [170, 80, 110]] as const) spike(...H([x, y]), d + rot, 100 * s, 70 * s);
      const outline = h([[-186, 30], [-180, -10], [-146, -64], [-84, -110], [0, -124], [84, -114], [148, -74], [182, -16], [190, 40], [170, 96], [120, 126], [40, 136], [-50, 132], [-122, 110], [-176, 78]]);
      shape(outline, GOLD, { angle: 78, over: 0.45 }, { w: 0.1 });
      shape(h([[-188, 30], [-182, 0], [-150, -6], [-106, 24], [-62, 56], [-16, 66], [36, 56], [96, 40], [150, 30], [184, 40], [170, 96], [120, 126], [40, 136], [-50, 132], [-122, 110], [-176, 78]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      c.tint(h([[-112, 14], [-80, 12], [-74, 50], [-86, 92], [-98, 52]]), DEEP, { angle: 80, wash: 0.8 });
      c.tint(h([[14, 20], [50, 16], [52, 60], [40, 104], [28, 60]]), DEEP, { angle: 80, wash: 0.8 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      shape(potato(...H([-96, -84]), 24 * s, 13 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      shape(potato(...H([34, -92]), 32 * s, 16 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      // wild joy: huge eyes, brows arched high, a wide open « D » grin
      const [e1, e2] = [H([-92, -22]), H([30, -26])];
      c.eye(e1[0], e1[1], 27 * s, 34 * s, '#241c38');
      c.eye(e2[0], e2[1], 36 * s, 44 * s, '#241c38');
      stroke(h([[-124, -84], [-94, -100], [-66, -88]]), { w: 5.5 });
      stroke(h([[-6, -96], [34, -112], [74, -96]]), { w: 5.5 });
      // the muzzle: a small round bump left of the face's middle, the nose on top of it, the mouth under the nose
      shape(potato(...H([-50, 64]), 56 * s, 40 * s, 10, 0.03), CREAM, { over: 0 }, { w: 0.1 });
      stroke(h([[-106, 60], [-94, 92], [-52, 106], [-10, 94], [4, 62]]), { w: 4 });
      dot(...H([-52, 32]), 16 * s, 11 * s);
      stroke(h([[-52, 40], [-52, 52]]), { w: 4 });
      shape(h([[-108, 56], [-52, 62], [4, 56], [-6, 92], [-52, 114], [-96, 92]]), '#8a2230', { over: 0, wash: 1 }, { w: 4.5 });
      shape(h([[-82, 100], [-52, 90], [-22, 100], [-36, 112], [-68, 112]]), '#f27a8a', { over: 0, wash: 1 }, { w: 0.1 });
      c.cheek(...H([110, 76]), 22 * s, 13 * s, PINK);
      c.part('paupieres', { pivot: H([-30, -24]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 27 * s, 34 * s, GOLD);
        c.lid(e2[0], e2[1], 36 * s, 44 * s, GOLD);
      });
    };
    /** A small paw at (x, y) along `deg` (0 = down). */
    const pad = (x: number, y: number, deg: number, s: number, col: string) => {
      const a = (deg * Math.PI) / 180, u: P = [-Math.sin(a), Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      const at = (px: number, py: number): P => [x + (v[0] * px + u[0] * py) * s, y + (v[1] * px + u[1] * py) * s];
      shape(potato(...at(0, 10), 34 * s, 28 * s, 8, 0.05), col, { over: 0 });
      for (const k of [-10, 10]) stroke([at(k, 20), at(k, 36)], { w: 3 });
    };
    /** A crackle: a little bolt of light. */
    const crackle = (x: number, y: number, s: number, deg: number) => {
      const a = (deg * Math.PI) / 180, at = (px: number, py: number): P => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s];
      shape([at(0, 0), at(30, 50), at(10, 52), at(40, 100), at(-6, 44), at(14, 42), at(-14, 0)], SPARK, { over: 0, wash: 1 }, { w: 3.5 }, false);
    };

    // a bounding leap: arched in the air, front paws reaching down to land, the bolt tail flung up behind
    c.part('queue', { pivot: [790, 470], motion: 'swing', amp: 3, period: 1.6, behind: true }, () => {
      boltTail(c, [[790, 480], [880, 420], [930, 320], [960, 210], [1010, 130]], (t) => 80 + Math.sin(Math.min(1, t * 1.1) * Math.PI * 0.9) * 80 - (t > 0.88 ? (t - 0.88) * 900 : 0), GOLD, DEEP, 5, 50);
    });
    // far legs, darker: the front one reaching, the hind one kicked back
    limb(c, [[480, 580], [450, 650], [380, 700], [330, 700]], [80, 60, 50, 44], FAR);
    pad(316, 700, 70, 0.85, FAR);
    limb(c, [[800, 540], [790, 620], [880, 640], [950, 620]], [100, 60, 50, 44], FAR);
    pad(968, 616, -100, 0.85, FAR);
    {
      // a deep chest, a slim waist, a round haunch; its back bristles with static, three zig-zag flashes of fur
      const N = 30, sp = sample([[340, 540], [460, 515], [600, 505], [730, 500], [820, 470]], N);
      const bump = (t: number, at: number, w: number) => Math.exp(-(((t - at) / w) ** 2));
      const out = lineOfAction(sp, sp.map((_, i) => 130 + bump(i / (N - 1), 0.15, 0.2) * 60 + bump(i / (N - 1), 0.8, 0.16) * 50),
        sp.map((_, i) => bump(i / (N - 1), 0.18, 0.14) * 36));
      const top = out.slice(0, N), spiky = [...top.slice(0, 8), ...c.spikes([top[10], top[17], top[24]], 1, -90), ...top.slice(26)];
      shape([...spiky, ...out.slice(N)], GOLD, { angle: 20, over: 0.4 }, {}, false);
      c.tint(lineOfAction(sp.slice(2, 16).map(([x, y]): P => [x, y + 64]), sp.slice(2, 16).map((_, i) => 40 + Math.sin((i / 13) * Math.PI) * 34)), CREAM, { angle: 20, wash: 0.85 });
    }
    // the near hind leg: a round haunch, the knee forward, the hock bent back, the foot kicked out
    openLimb(c, [[680, 500], [770, 480], [830, 530], [830, 610], [770, 640], [700, 610]], GOLD, 1, 5);
    limb(c, [[770, 600], [730, 680], [830, 720], [920, 710]], [96, 64, 52, 46], GOLD);
    pad(940, 706, -100, 0.95, LEG);
    // the near front leg reaching to land: elbow down, wrist bent, the paw forward
    limb(c, [[420, 580], [390, 670], [300, 730], [250, 730]], [100, 66, 54, 48], GOLD);
    pad(232, 730, 70, 1, LEG);
    head(250, 420, 0.8, 0);
    c.part('etincelles', { pivot: [910, 260], motion: 'flicker', period: 1.6 }, () => {
      crackle(960, 360, 0.8, 30);
      crackle(860, 160, 0.7, -20);
    });
  },
} satisfies Redraw;
