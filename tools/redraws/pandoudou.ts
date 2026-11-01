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

/** The family's bushy ringed tail along `ctrl` (root to tip), `w(t)` wide, `rings` dark rings. */
function ringedTail(c: Crayon, ctrl: P[], w: (t: number) => number, fur: string, ring: string, rings: number, angle = 40) {
  const N = 48, sp = sample(ctrl, N), ws = sp.map((_, i) => w(i / (N - 1)));
  const out = lineOfAction(sp, ws);
  c.shape(out, fur, { angle, over: 0.4 }, { w: 0.1 });
  for (let r = 0; r < rings; r++) {
    const a = 0.16 + (r / rings) * 0.8, b = a + 0.34 / rings;
    const i0 = Math.round(a * (N - 1)), i1 = Math.round(b * (N - 1));
    c.tint(lineOfAction(sp.slice(i0, i1 + 1), ws.slice(i0, i1 + 1).map((x) => x * 0.99)), ring, { angle: angle + 30, wash: 0.9 });
  }
  c.stroke([...out, out[0], out[1]], { w: 5 });
}

/**
 * Touffou, the curious cuddly red panda (« câlin curieux »), turned to the left: a round fluffy baby with a big head,
 * the white face marks of its kind and a bushy ringed tail. Its soft fur takes the colour and the power of a Magic
 * Pencil.
 */
export default {
  id: '016', slug: 'pandoudou', seed: 1616, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const RUST = '#cc5a2c', DEEP = '#93381c', CREAM = '#f8ecd2', LEG = '#4a2c2c', FARLEG = '#3a2224', PINK = '#f29ab0';

    /** The baby head centred on (hx, hy), `s` its size, turned `rot` degrees: curious, wide eyes, brows up. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // ears: white rims, rust inside
      shape(h([[-70, -96], [-150, -176], [-196, -158], [-198, -84], [-160, -40]]), CREAM, { angle: 70 });
      shape(h([[-96, -102], [-152, -150], [-176, -138], [-176, -90]]), DEEP, { over: 0 }, { w: 0.1 });
      shape(h([[40, -104], [74, -192], [130, -218], [184, -184], [186, -104], [150, -64]]), CREAM, { angle: 70 });
      shape(h([[72, -114], [96, -176], [134, -194], [164, -170], [160, -112]]), DEEP, { over: 0 }, { w: 0.1 });
      const outline = h([[-186, 30], [-180, -10], [-146, -64], [-84, -110], [0, -124], [84, -114], [148, -74], [180, -12], [186, 40], [208, 70], [170, 90], [124, 120], [40, 134], [-50, 130], [-122, 108], [-174, 76]]);
      shape(outline, RUST, { angle: 78, over: 0.45 }, { w: 0.1 });
      // the white mask: muzzle and cheeks, brow spots
      shape(h([[-188, 30], [-182, 0], [-150, -6], [-106, 24], [-62, 56], [-16, 66], [36, 56], [96, 38], [156, 30], [196, 46], [208, 70], [170, 90], [124, 120], [40, 134], [-50, 130], [-122, 108], [-174, 76]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      // the tear marks from each eye down to the jaw
      c.tint(h([[-112, 14], [-80, 12], [-74, 50], [-86, 92], [-98, 52]]), DEEP, { angle: 80, wash: 0.8 });
      c.tint(h([[14, 20], [50, 16], [52, 60], [40, 104], [28, 60]]), DEEP, { angle: 80, wash: 0.8 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      shape(potato(...H([-96, -84]), 24 * s, 13 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      shape(potato(...H([34, -92]), 32 * s, 16 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      // curious: wide eyes looking up, brows raised high, a small « o »
      const [e1, e2] = [H([-92, -22]), H([30, -26])];
      c.eye(e1[0], e1[1], 27 * s, 34 * s, '#241c38');
      c.eye(e2[0], e2[1], 35 * s, 42 * s, '#241c38');
      stroke(h([[-124, -112], [-94, -124], [-66, -114]]), { w: 5 });
      stroke(h([[-2, -128], [36, -140], [74, -126]]), { w: 5 });
      c.cheek(...H([118, 66]), 26 * s, 15 * s, PINK);
      // the muzzle: a small round bump left of the face's middle, the nose on top of it, the mouth under the nose
      shape(potato(...H([-50, 64]), 56 * s, 40 * s, 10, 0.03), CREAM, { over: 0 }, { w: 0.1 });
      stroke(h([[-106, 60], [-94, 92], [-52, 106], [-10, 94], [4, 62]]), { w: 4 });
      dot(...H([-52, 32]), 16 * s, 11 * s);
      stroke(h([[-52, 40], [-52, 54]]), { w: 4 });
      shape(potato(...H([-52, 76]), 11 * s, 13 * s, 8, 0.05), '#a8384a', { over: 0, wash: 1 }, { w: 3.5 });
      c.part('paupieres', { pivot: H([-30, -24]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 27 * s, 34 * s, RUST);
        c.lid(e2[0], e2[1], 35 * s, 42 * s, RUST);
      });
    };
    const tailW = (t: number) => 76 + Math.sin(Math.min(1, t * 1.1) * Math.PI * 0.9) * 84 - (t > 0.88 ? (t - 0.88) * 800 : 0);

    // sitting up, head tilted, one paw raised; its tail curled up behind into a big question mark
    c.part('queue', { pivot: [660, 840], motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      ringedTail(c, [[650, 850], [780, 856], [880, 770], [910, 640], [890, 510], [830, 420], [760, 400], [720, 440]], tailW, RUST, DEEP, 6, 30);
    });
    shape(band([[480, 650], [490, 790], [482, 880]], 54, 48), FARLEG, { angle: 90 });
    shape(potato(470, 892, 44, 22, 8, 0.06), FARLEG, { angle: 10 });
    shape([[400, 880], [372, 760], [390, 620], [452, 540], [588, 540], [664, 620], [694, 760], [682, 880]], RUST, { angle: 80, over: 0.5 });
    c.tint(potato(470, 690, 78, 120, 10, 0.08), CREAM, { angle: 80, wash: 0.7 });
    openLimb(c, [[612, 690], [570, 770], [576, 860], [626, 902], [710, 896], [736, 820], [716, 730]], RUST, 1, 6);
    shape(potato(640, 904, 70, 26, 8, 0.06), LEG, { angle: 10 });
    // the near paw lifted, wrist bent, about to pat what it found
    openLimb(c, [[430, 590], [380, 620], [340, 640], [318, 620], [300, 640], [330, 676], [390, 690], [440, 700]], LEG, 1, 7);
    shape(potato(306, 640, 32, 26, 8, 0.06), LEG, { angle: 30 });
    for (const x of [290, 310]) stroke([[x, 654], [x - 2, 668]], { w: 3.5 });
    head(456, 420, 0.98, -10);
  },
} satisfies Redraw;
