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

/** Scallops along a path, bulging to its left: a soft fin edge. */
function scallops(path: P[], n: number, h: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [a, b] = [path[i], path[i + 1]];
    const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
    for (let k = 0; k < n; k++) for (let q = 0; q < 4; q++) {
      const t = (k + q / 4) / n, bump = Math.sin((q / 4) * Math.PI) * h;
      out.push([a[0] + (b[0] - a[0]) * t + (nx / l) * bump, a[1] + (b[1] - a[1]) * t + (ny / l) * bump]);
    }
  }
  out.push(path[path.length - 1]);
  return out;
}

/** A limb through its joints (shoulder or hip first), `ws` wide at each, its line left open where it joins the body. */
function limb(c: Crayon, pts: P[], ws: number[], col: string) {
  const out = lineOfAction(pts, ws);
  openLimb(c, out, col, 1, out.length - 1);
}

/** The family's ringed tail grown into a broad finned rudder: a pale fin edge all round, `rings` dark rings. */
function rudder(c: Crayon, ctrl: P[], w: (t: number) => number, fur: string, ring: string, fin: string, rings: number, angle = 30) {
  const N = 48, sp = sample(ctrl, N), ws = sp.map((_, i) => w(i / (N - 1)));
  const out = lineOfAction(sp, ws);
  const edge = lineOfAction(sp, ws.map((x, i) => x + (i < 6 ? 0 : 80)));
  const L = edge.slice(0, N), R = edge.slice(N);
  const every = (pts: P[]) => pts.filter((_, i) => i % 7 === 0 || i === pts.length - 1);
  c.shape([...scallops(every(L.slice(4)), 1, 26), ...scallops(every(R.slice(0, N - 4)), 1, 26)], fin, { angle: angle + 60, over: 0 }, { w: 3.5 });
  for (let k = 8; k < N - 4; k += 7) c.stroke([L[k], sp[k]], { w: 2.5, col: '#5aa8b8' });
  c.shape(out, fur, { angle, over: 0.4 }, { w: 0.1 });
  for (let r = 0; r < rings; r++) {
    const a = 0.18 + (r / rings) * 0.78, b = a + 0.34 / rings;
    const i0 = Math.round(a * (N - 1)), i1 = Math.round(b * (N - 1));
    c.tint(lineOfAction(sp.slice(i0, i1 + 1), ws.slice(i0, i1 + 1).map((x) => x * 0.99)), ring, { angle: angle + 30, wash: 0.9 });
  }
  c.stroke([...out, out[0], out[1]], { w: 5 });
}

/**
 * Touflot, the river panda (« panda des rivières »): Touffou soaked in a blue Magic Pencil, calm and gentle. Its fur
 * has gone wavy and teal, its paws webbed, and its ringed tail has flattened into a broad finned rudder it steers the
 * river with.
 */
export default {
  id: '017', slug: 'panderive', seed: 1717, size: [1150, 900], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const TEAL = '#2e9cb6', DEEP = '#1c6688', CREAM = '#eef8f2', LEG = '#1f5f80', FAR = '#174a66', FIN = '#86dcd4';
    const PINK = '#f49a9a', RIPPLE = '#5cb8cc';

    /** The head centred on (hx, hy), `s` its size, turned `rot` degrees: calm, gentle. */
    const head = (hx: number, hy: number, s: number, rot: number, shut: boolean) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      shape(h([[-70, -96], [-150, -176], [-196, -158], [-198, -84], [-160, -40]]), CREAM, { angle: 70 });
      shape(h([[-96, -102], [-152, -150], [-176, -138], [-176, -90]]), DEEP, { over: 0 }, { w: 0.1 });
      shape(h([[40, -104], [74, -192], [130, -218], [184, -184], [186, -104], [150, -64]]), CREAM, { angle: 70 });
      shape(h([[72, -114], [96, -176], [134, -194], [164, -170], [160, -112]]), DEEP, { over: 0 }, { w: 0.1 });
      // a wavy head: the cheek fur curls back like a wave
      const outline = h([[-186, 30], [-180, -10], [-146, -64], [-84, -110], [0, -124], [84, -114], [148, -74], [182, -16], [206, 20], [250, 30], [226, 56], [190, 64], [214, 96], [160, 104], [120, 126], [40, 136], [-50, 132], [-122, 110], [-176, 78]]);
      shape(outline, TEAL, { angle: 78, over: 0.45 }, { w: 0.1 });
      shape(h([[-188, 30], [-182, 0], [-150, -6], [-106, 24], [-62, 56], [-16, 66], [36, 56], [96, 40], [150, 30], [180, 40], [190, 64], [214, 96], [160, 104], [120, 126], [40, 136], [-50, 132], [-122, 110], [-176, 78]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      c.tint(h([[-112, 14], [-80, 12], [-74, 50], [-86, 92], [-98, 52]]), DEEP, { angle: 80, wash: 0.8 });
      c.tint(h([[14, 20], [50, 16], [52, 60], [40, 104], [28, 60]]), DEEP, { angle: 80, wash: 0.8 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      stroke(h([[150, 6], [196, 22], [214, 44]]), { w: 4 });
      shape(potato(...H([-96, -84]), 24 * s, 13 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      shape(potato(...H([34, -92]), 32 * s, 16 * s, 8, 0.05), CREAM, { over: 0 }, { w: 0.1 });
      const [e1, e2] = [H([-92, -20]), H([30, -24])];
      if (shut) {
        // content: closed arcs, a small closed smile
        stroke(h([[-120, -20], [-92, -36], [-64, -18]]), { w: 6.5 });
        stroke(h([[-6, -22], [30, -42], [66, -20]]), { w: 6.5 });
      } else {
        // calm and kind: round eyes, a sliver of lid, no brow
        c.eye(e1[0], e1[1], 25 * s, 31 * s, '#241c38');
        c.eye(e2[0], e2[1], 32 * s, 38 * s, '#241c38');
      }
      c.cheek(...H([118, 70]), 26 * s, 15 * s, PINK);
      // the muzzle: a small round bump left of the face's middle, the nose on top of it, the mouth under the nose
      shape(potato(...H([-50, 64]), 56 * s, 40 * s, 10, 0.03), CREAM, { over: 0 }, { w: 0.1 });
      stroke(h([[-106, 60], [-94, 92], [-52, 106], [-10, 94], [4, 62]]), { w: 4 });
      dot(...H([-52, 32]), 16 * s, 11 * s);
      stroke(h([[-52, 40], [-52, 58]]), { w: 4 });
      stroke(h([[-90, 66], [-72, 82], [-52, 74], [-32, 82], [-14, 66]]), { w: 5 });
      if (!shut) c.part('paupieres', { pivot: H([-30, -22]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 25 * s, 31 * s, TEAL);
        c.lid(e2[0], e2[1], 32 * s, 38 * s, TEAL);
      });
    };
    /** A small paw at (x, y) pointing along `deg` (0 = down): three short toes with a fin web stretched between them. */
    const webbed = (x: number, y: number, deg: number, s: number, col: string) => {
      const a = (deg * Math.PI) / 180, u: P = [-Math.sin(a), Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      const at = (px: number, py: number): P => [x + (v[0] * px + u[0] * py) * s, y + (v[1] * px + u[1] * py) * s];
      shape([at(-26, 6), at(-36, 40), at(-18, 36), at(0, 48), at(18, 36), at(36, 40), at(26, 6)], FIN, { angle: deg + 90, over: 0 }, { w: 3 });
      shape(potato(...at(0, 10), 30 * s, 24 * s, 8, 0.05), col, { angle: deg + 90, over: 0 });
      for (const k of [-12, 12]) stroke([at(k, 22), at(k * 1.2, 32)], { w: 3 });
    };

    // gliding upstream in one long S, head held high and calm, legs tucked, the finned rudder rising behind
    c.part('eau', { pivot: [370, 650], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      stroke([[40, 620], [100, 606], [150, 580]], { w: 4.5, col: RIPPLE });
      stroke([[60, 676], [140, 664], [220, 676]], { w: 4.5, col: RIPPLE });
      stroke([[330, 716], [520, 700], [700, 716]], { w: 4.5, col: RIPPLE });
      stroke([[760, 676], [880, 664], [1000, 676]], { w: 4.5, col: RIPPLE });
    });
    c.part('queue', { pivot: [820, 520], motion: 'swing', amp: 3, period: 3, behind: true }, () => {
      rudder(c, [[810, 540], [880, 470], [920, 380], [920, 280], [880, 190]], (t) => 100 + t * 130 - (t > 0.88 ? (t - 0.88) * 1300 : 0), TEAL, DEEP, FIN, 4, 70);
    });
    // far legs, darker: the front one folded under the chest, the hind one trailing
    limb(c, [[470, 620], [470, 690], [420, 712]], [70, 50, 40], FAR);
    webbed(404, 716, 70, 0.8, FAR);
    limb(c, [[740, 600], [800, 660], [880, 650]], [110, 60, 44], FAR);
    webbed(900, 650, -80, 0.8, FAR);
    {
      // the body: a deep chest, a slim waist, a round haunch, the back rolling in soft waves
      const N = 40, sp = sample([[290, 470], [390, 540], [520, 590], [650, 596], [760, 566], [840, 500]], N);
      const bump = (t: number, at: number, w: number) => Math.exp(-(((t - at) / w) ** 2));
      const out = lineOfAction(sp, sp.map((_, i) => 130 + bump(i / (N - 1), 0.2, 0.2) * 40 + bump(i / (N - 1), 0.78, 0.14) * 30),
        sp.map((_, i) => bump(i / (N - 1), 0.24, 0.12) * 50 + bump(i / (N - 1), 0.76, 0.1) * 34));
      const top = out.slice(0, N).map(([x, y], i): P => {
        const t = (i - 8) / (N - 14), k = t > 0 && t < 1 ? Math.max(0, Math.sin(t * Math.PI * 3)) : 0;
        return [x - k * 10, y - k * 16];
      });
      shape([...top, ...out.slice(N)], TEAL, { angle: 15, over: 0.4 });
      // its marking: two rolling waves down its flank, in the deep blue of its rings
      for (const [dy, a0, a1] of [[-24, 10, 34], [22, 14, 28]] as const) {
        const wave = sp.slice(a0, a1).map(([x, y], i): P => [x, y + dy + Math.sin(i * 1.1) * 12]);
        c.tint(c.band(wave, 20, 20), DEEP, { angle: 30, wash: 0.9 });
      }
      c.tint(lineOfAction(sp.slice(6, 22).map(([x, y]): P => [x, y + 84]), sp.slice(6, 22).map((_, i) => 40 + Math.sin((i / 15) * Math.PI) * 40)), CREAM, { angle: 10, wash: 0.85 });
    }
    // the near hind leg: the round haunch, the knee, the shin trailing back to a foot that steers
    openLimb(c, potato(712, 618, 84, 66, 10, 0.04), TEAL, 2, 8);
    limb(c, [[740, 650], [800, 690], [860, 690]], [70, 52, 44], TEAL);
    webbed(880, 690, -80, 1, LEG);
    // the near front leg in a slow stroke: elbow back, forearm forward, the paw under its chin
    limb(c, [[400, 600], [410, 680], [330, 706], [280, 696]], [90, 60, 50, 44], TEAL);
    webbed(262, 694, 75, 1, LEG);
    head(250, 380, 0.8, -6, false);
  },
} satisfies Redraw;
