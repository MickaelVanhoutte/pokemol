import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * Musclouille grown into a calm old fighter (« vieux cogneur calme »), turned to the left: a big heavy mantis shrimp with
 * nothing left to prove. Its clubs have grown into two great coral hammers that crack stone; it rests on them like an
 * old boxer on his fists. A broad armoured helmet, a heavy brow over its eyes on stalks, its feelers grown long and
 * drooping like an old master's moustache, half-lidded eyes and a crooked little smile.
 */
export default {
  id: '038', slug: 'marteaumante', seed: 3857, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const TEAL = '#2aa892', TEAL2 = '#31b39b', DEEP = '#1f8a77', BAND = '#156a5a', BELLY = '#ddf2d6', CORAL = '#ff7a52', CORAL2 = '#e05a3a', RIM = '#b03c2a', PINK = '#f29ab0';
    const STONE = '#b4aca0';

    /** A hammer: the arm from `root` by `elbow` to the hammer head at `fist`, `r` its size, its striking face darker,
     * the claw folded back along the forearm. */
    const hammer = (root: P, elbow: P, fist: P, r: number, arm: string, knob: string, near = true) => {
      const dx = fist[0] - elbow[0], dy = fist[1] - elbow[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l], n: P = [-u[1], u[0]];
      const at = (f: number, k: number): P => [fist[0] + u[0] * f * r + n[0] * k * r, fist[1] + u[1] * f * r + n[1] * k * r];
      const pts = c.band([root, elbow, at(-0.6, 0)], r * 0.72, r * 0.62);
      if (near) openLimb(c, pts, arm, 1, pts.length - 1);
      else shape(pts, arm, { angle: 40 });
      // the claw's point folded flat along the forearm, then the joint, then its heel swollen into a rounded hammer: teal,
      // orange only on the striking knob at its front
      shape([at(-0.4, -0.7), at(-1.2, -0.86), at(-2.3, -0.7), at(-1.3, -0.5), at(-0.4, -0.4)], near ? DEEP : BAND, { angle: 30, over: 0 }, { w: 3.5 });
      shape([at(-0.95, -0.5), at(-0.6, -0.9), at(0.4, -1), at(0.9, -0.85), at(0.9, 0.85), at(0.4, 1), at(-0.6, 0.9), at(-0.95, 0.5)], arm, { angle: 40, over: 0.3 });
      stroke([at(-0.72, -0.62), at(-0.82, 0), at(-0.72, 0.62)], { w: 5, col: BAND });
      shape([at(0.3, -0.98), at(0.9, -0.92), at(1.32, -0.5), at(1.45, 0), at(1.32, 0.5), at(0.9, 0.92), at(0.3, 0.98), at(0.5, 0)], knob, { angle: 40, over: 0.35 });
      shape([at(1.1, -0.74), at(1.32, -0.5), at(1.45, 0), at(1.32, 0.5), at(1.1, 0.74), at(1.22, 0)], RIM, { angle: 40, over: 0 });
      stroke([at(1.26, -0.3), at(1.36, -0.2), at(1.3, -0.04)], { w: 4 }, false);
      c.shine([at(0.5, 0.72), at(1.0, 0.6)], 8);
    };
    /** The tail fan at `at`, opening along `deg` (0 = up), three broad paddles with spiked rims. */
    const fan = (at: P, deg: number, s: number) => {
      for (const [d, l, w, col] of [[-42, 1, 0.44, DEEP], [42, 1, 0.44, DEEP], [0, 1.1, 0.42, TEAL]] as const) {
        const a = ((deg + d) * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], nn: P = [-u[1], u[0]];
        const p = (f: number, k: number): P => [at[0] + u[0] * f * s * l + nn[0] * k * s * w, at[1] + u[1] * f * s * l + nn[1] * k * s * w];
        shape([p(0, -0.3), p(0.55, -0.95), p(0.92, -0.6), p(1.02, 0), p(0.92, 0.6), p(0.55, 0.95), p(0, 0.3)], col, { angle: deg + d + 90, over: 0.2 }, {}, false);
        stroke([p(0.1, 0), p(0.85, 0)], { w: 4, col: BAND });
      }
    };
    /** The tail along `spine`: armour plates overlapping like roof tiles, each with a pointed lower corner, a pale
     * underside. */
    const body = (spine: P[], widths: number[]) => {
      for (let i = spine.length - 1; i >= 0; i--) {
        const [x, y] = spine[i], [ax, ay] = spine[Math.max(0, i - 1)], [bx, by] = spine[Math.min(spine.length - 1, i + 1)];
        const a = Math.atan2(by - ay, bx - ax), h = widths[i], w = Math.max(Math.hypot(bx - ax, by - ay) / (i && i < spine.length - 1 ? 2 : 1), h * 0.5) * 1.25;
        const R = ([px, py]: P): P => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
        const pts = ([[-0.5 * w, -0.46 * h], [-0.1 * w, -0.53 * h], [0.4 * w, -0.48 * h], [0.56 * w, -0.2 * h], [0.55 * w, 0.3 * h], [0.42 * w, 0.62 * h], [0.2 * w, 0.5 * h], [-0.45 * w, 0.5 * h], [-0.55 * w, 0]] as P[]).map(R);
        shape(pts, i % 2 ? TEAL : TEAL2, { angle: (a * 180) / Math.PI + 80, over: 0.3 });
        c.tint([R([-0.5 * w, 0.24 * h]), R([0.52 * w, 0.24 * h]), R([0.4 * w, 0.5 * h]), R([-0.42 * w, 0.48 * h])], BELLY, { wash: 0.4 });
      }
    };
    /** The head at (hx, hy), `s` its size: a broad helmet, a heavy brow, stalked eyes half-lidded, a drooping moustache. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      shape(c.band(h([[-90, -100], [-110, -150]]), 48 * s, 44 * s), DEEP, { angle: 90 });
      // the helmet: wide and flat on top, a heavy brow ridge jutting over the face, flaring back over the neck
      shape(h([[-236, 0], [-250, -60], [-200, -118], [-60, -150], [110, -140], [230, -90], [270, 10], [220, 60], [140, 100], [20, 120], [-110, 110], [-200, 60]]), TEAL, { angle: 78 + rot, over: 0.45 });
      c.tint(h([[-226, 0], [-170, 80], [-80, 106], [0, 96], [-80, 50], [-170, 20]]), BELLY, { angle: 60, wash: 0.7 });
      stroke(h([[-170, -96], [0, -118], [180, -90]]), { w: 4.5, col: BAND });
      shape(c.band(h([[20, -110], [24, -170]]), 58 * s, 52 * s), TEAL, { angle: 90 });
      const e1 = H([-120, -180]), e2 = H([20, -194]);
      shape(potato(e1[0], e1[1], 50 * s, 50 * s, 10, 0.03), DEEP, { angle: 80, over: 0 });
      shape(potato(e2[0], e2[1], 58 * s, 58 * s, 10, 0.03), TEAL, { angle: 80, over: 0 });
      // wise and calm: the far eye squinted shut under its heavy brow, the near one half open, looking straight at you
      c.tint(potato(e1[0], e1[1], 36 * s, 36 * s, 10, 0.03), DEEP, { wash: 1 });
      stroke([[e1[0] - 32 * s, e1[1] + 4 * s], [e1[0], e1[1] + 14 * s], [e1[0] + 32 * s, e1[1] + 2 * s]], { w: 6 });
      c.eye(e2[0], e2[1], 44 * s, 46 * s, '#241c38', { lid: 0.38, skin: TEAL, tilt: -6 + rot });
      // a heavy shell brow over each eye
      shape(h([[-180, -210], [-120, -232], [-64, -218], [-60, -196], [-120, -204], [-176, -190]]), DEEP, { angle: 10, over: 0 });
      shape(h([[-36, -236], [24, -258], [86, -244], [90, -222], [24, -232], [-32, -216]]), DEEP, { angle: 10, over: 0 });
      c.cheek(...H([150, 40]), 32 * s, 18 * s, PINK);
      // a crooked little smile, one corner up
      stroke(h([[-210, 50], [-160, 62], [-110, 50], [-90, 30]]), { w: 6 });
      // its feelers grown long, drooping like an old master's moustache (they sway in battle)
      c.part('moustache', { pivot: H([-210, 0]), motion: 'swing', amp: 3, period: 2.6 }, () => {
        shape(c.band(h([[-216, -6], [-300, 30], [-340, 120], [-330, 210]]), 22 * s, 8 * s), BAND, { angle: 80, over: 0 }, { w: 3.5 });
        shape(c.band(h([[-200, 10], [-250, 60], [-260, 150], [-240, 230]]), 22 * s, 8 * s), BAND, { angle: 80, over: 0 }, { w: 3.5 });
      });
      c.part('paupieres', { pivot: H([-50, -186]), motion: 'blink', extra: true }, () => {
        c.lid(e2[0], e2[1], 44 * s, 46 * s, TEAL);
      });
    };

    // resting low on its two hammers like an old boxer on his fists, the near one on a stone it cracked, the tail
    // arched behind on its fan
    hammer([620, 600], [640, 720], [590, 830], 96, DEEP, CORAL2, false);
    c.part('queue', { pivot: [850, 790], motion: 'swing', amp: 2, period: 2.8, behind: true }, () => fan([850, 790], 165, 160));
    body([[530, 520], [630, 490], [730, 520], [810, 600], [846, 706]], [380, 360, 316, 258, 200]);
    c.part('pierre', { pivot: [230, 920], motion: 'swing', amp: 0, period: 3, decor: true, behind: true }, () => {
      shape([[80, 960], [90, 900], [150, 856], [240, 846], [330, 870], [380, 920], [376, 962]], STONE, { angle: 20, over: 0.2 });
      stroke([[236, 848], [218, 890], [244, 918], [226, 962]], { w: 5 }, false);
    });
    head(300, 410, 0.84, -4);
    c.part('poing', { pivot: [470, 620], motion: 'swing', amp: 2, period: 2.4 }, () => hammer([480, 620], [420, 720], [240, 790], 116, TEAL, CORAL));
  },
} satisfies Redraw;
