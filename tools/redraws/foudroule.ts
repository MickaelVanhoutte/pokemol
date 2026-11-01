import type { Crayon, P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { HAM, arc, foot, frame, hamHead } from './joufflux.ts';

/**
 * A jagged band of lightning along `path` (its zig-zag made here), `w` thick: bright blue with a dark blue line and a
 * pale core. `teeth` zig-zags, `h` deep.
 */
function bolt(c: Crayon, path: P[], teeth: number, h: number, w0: number, w1 = w0) {
  const zig: P[] = [];
  const n = teeth * 2;
  // resample the path evenly
  const len: number[] = [0];
  for (let i = 1; i < path.length; i++) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const L = len[len.length - 1];
  const at = (d: number): [P, P] => {
    let i = 1;
    while (i < len.length - 1 && len[i] < d) i++;
    const f = (d - len[i - 1]) / (len[i] - len[i - 1] || 1), a = path[i - 1], b = path[i];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [[a[0] + dx * f, a[1] + dy * f], [-dy / l, dx / l]];
  };
  for (let k = 0; k <= n; k++) {
    // a long stroke out and a short step back, like a real bolt, not an even saw
    const f = k === 0 || k === n ? k / n : (k + (k % 2 ? 0.45 : -0.1)) / n;
    const [p, nn] = at(L * f), o = k === 0 || k === n ? 0 : (k % 2 ? 1 : -0.6) * h;
    zig.push([p[0] + nn[0] * o, p[1] + nn[1] * o]);
  }
  c.shape(c.band(zig, w0, w1), HAM.SPARK, { over: 0, press: 1.15, angle: 30 }, { w: 5, col: HAM.BOLT }, false);
  c.tint(c.band(zig, w0 * 0.4, w1 * 0.4), HAM.CORE, { wash: 1 });
}

/** A leg from `top` on the body to `end`, `w` wide at the top, tapering to a pink foot; open on the body side. */
function leg(c: Crayon, top: P, end: P, col: string, w: number, sole: number, fs: number) {
  const [tx, ty] = top, [fx, fy] = end;
  const dx = fx - tx, dy = fy - ty, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const at = (q: number, m: number): P => [tx + dx * q + nx * m, ty + dy * q + ny * m];
  openLimb(c, [at(-0.05, -w * 0.2), at(0.12, w * 0.5), at(0.5, w * 0.34), at(0.88, w * 0.24), at(1, w * 0.2), at(1, -w * 0.2), at(0.88, -w * 0.22), at(0.5, -w * 0.3), at(0.12, -w * 0.46)], col, 1, 8);
  foot(c, fx, fy, sole, fs);
}

/**
 * Joufflux grown into a ball of lightning (« casse-cou bolide »), turned to the left: it springs forward and up, curled
 * tight in a C, chin tucked, its near forepaw punching ahead. The baby's wooden wheel is reborn as its own: a ring of
 * lightning shoots out of its stuffed near cheek, crosses in front of its belly, goes round behind its back and streams
 * away as one comet tail. Three jagged spikes of static fur stand along its back. A wedge of a head, narrowed eyes that
 * keep their shine, a cheeky open grin with one buck tooth.
 */
export default {
  id: '027', slug: 'foudroule', seed: 2701, size: [1100, 1100], tilt: 0,
  draw(c) {
    const { shape, potato } = c;
    // the body's frame: curled tight, its front tipped up and to the left, the way it leaps
    const { T, t } = frame(570, 600, 1, 24);
    // the head's place, chin tucked, and its near cheek dynamo (as hamHead places it), where the ring starts
    const [hx, hy] = T([-196, -70]), hs = 0.8, hr = 6, k = 1.4;
    const pouch = frame(hx, hy, hs, hr).T([(k - 1) * 20, 112 + (k - 1) * 24]);
    // the ring round its curled body: in front of the belly at the bottom, behind the back at the top
    const [ox, oy] = T([10, -30]), D = Math.PI / 180;
    const ring = (a0: number, a1: number, n = 24) => arc(ox, oy, 262, 262, a0 * D, a1 * D, n);
    const tailRoot = ring(20, 20, 1)[0];
    // the back of the ring, behind it: from the bottom right, up over its back and round to the front
    c.part('anneau-dos', { pivot: pouch, motion: 'swing', amp: 1, period: 3, behind: true }, () => {
      bolt(c, ring(30, -196, 30), 5, 38, 50);
    });
    // three jagged spikes of static fur along its back, leaning back, their roots in the fur
    for (const [x, y, a, h] of [[-60, -164, -14, 120], [50, -176, 8, 140], [150, -138, 34, 116]] as const) {
      const S = frame(...T([x, y]), h / 120, a + 20).t;
      shape(S([[-38, 20], [-14, -60], [-30, -56], [8, -124], [2, -62], [22, -66], [40, 20]]), HAM.DEEP, { angle: 70, over: 0.2 }, {}, false);
    }
    // the far forepaw tucked under the chin, the stub tail
    shape(potato(...T([-150, 150]), 34, 26, 8, 0.06), HAM.DEEP, { angle: 30 });
    shape(potato(...T([224, 40]), 30, 22, 8, 0.06), HAM.DEEP, { angle: 30, over: 0 });
    // the body curled in a tight C, the cream belly curled in at the front
    shape(t([[-206, -20], [-150, -126], [-40, -176], [90, -174], [196, -112], [236, -10], [206, 90], [120, 150], [0, 166], [-110, 146], [-188, 80]]), HAM.FUR, { angle: 30, over: 0.45 });
    c.tint(t([[-190, 56], [-120, 134], [0, 158], [100, 146], [10, 116], [-110, 72]]), HAM.BELLY, { wash: 0.85 });
    // the near hind leg folded tight on the flank, its foot tucked forward under the belly
    shape(potato(...T([90, 50]), 96, 84, 12, 0.03), HAM.FUR, { angle: 60, over: 0.3 }, { w: 0.1 });
    c.stroke(t([[10, -24], [70, -42], [160, -24], [192, 40], [166, 116], [100, 138]]), { w: 5 });
    foot(c, ...T([-10, 160]), 20, 1);
    hamHead(c, hx, hy, hs, hr, { pouch: k, adult: true });
    // the near forepaw punching forward, ahead of the chin
    leg(c, T([-120, 96]), T([-430, 70]), HAM.FUR, 84, -10, 1.05);
    // the front of the ring: out of the near cheek, down and across in front of its belly, then one comet tail
    c.part('anneau', { pivot: pouch, motion: 'swing', amp: 1, period: 3 }, () => {
      const root: P = [pouch[0] - 40, pouch[1] + 30];
      bolt(c, [root, ...ring(160, 30, 20)], 4, 38, 44, 52);
      bolt(c, [tailRoot, [tailRoot[0] + 90, tailRoot[1] + 40], [tailRoot[0] + 180, tailRoot[1] + 60], [tailRoot[0] + 250, tailRoot[1] + 64]], 2, 36, 50, 10);
    });
  },
} satisfies Redraw;
