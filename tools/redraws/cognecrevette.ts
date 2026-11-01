import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * Boxouille grown into a scrappy brawler (« bagarreur »), turned to the left: a mantis shrimp standing up on its tail fan
 * like a boxer, its two coral clubs grown into heavy fists with a hard rim (the hammers to come), a notch chipped out of
 * its shell from an old fight. Its eyes on stalks are narrowed, and it grins with one fang: come on, then.
 */
export default {
  id: '037', slug: 'cognecrevette', seed: 3743, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const TEAL = '#2fb39a', TEAL2 = '#35bda3', DEEP = '#21927e', BAND = '#17705f', BELLY = '#e2f6dc', CORAL = '#ff7a52', CORAL2 = '#e05a3a', RIM = '#b8402c', PINK = '#f29ab0';

    /** A club: the folded raptorial arm from `root` by `elbow` to the knob at `fist`, `r` its size, a hard rim across the
     * knob, the thin claw folded back along the forearm. */
    const club = (root: P, elbow: P, fist: P, r: number, arm: string, knob: string, near = true) => {
      const dx = fist[0] - elbow[0], dy = fist[1] - elbow[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l], n: P = [-u[1], u[0]];
      const at = (f: number, k: number): P => [fist[0] + u[0] * f * r + n[0] * k * r, fist[1] + u[1] * f * r + n[1] * k * r];
      const pts = c.band([root, elbow, at(-0.6, 0)], r * 0.62, r * 0.55);
      if (near) openLimb(c, pts, arm, 1, pts.length - 1);
      else shape(pts, arm, { angle: 40 });
      // the claw: its heel swollen into a round club, its thin point folded back under the forearm
      shape([at(-0.9, 0.55), at(-0.2, 0.95), at(0.6, 1), at(1.15, 0.55), at(1.3, -0.15), at(1.05, -0.8), at(0.4, -1.05), at(-0.5, -1.04), at(-1.4, -0.94), at(-2.15, -0.76), at(-1.4, -0.66), at(-0.6, -0.6), at(-0.9, -0.3)], knob, { angle: 40, over: 0.35 });
      // the hard rim at its striking end
      shape([at(0.85, -0.86), at(1.15, -0.6), at(1.3, 0.1), at(1.1, 0.72), at(0.82, 0.95), at(0.98, 0.4), at(1.02, -0.3)], RIM, { angle: 40, over: 0 });
      c.shine([at(-0.3, 0.6), at(0.3, 0.62)], 7);
    };
    /** The tail fan at `at`, opening along `deg` (0 = up), three rounded paddles. */
    const fan = (at: P, deg: number, s: number) => {
      for (const [d, l, w, col] of [[-58, 1, 0.42, DEEP], [58, 1, 0.42, DEEP], [0, 1.15, 0.4, TEAL]] as const) {
        const a = ((deg + d) * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], nn: P = [-u[1], u[0]];
        const p = (f: number, k: number): P => [at[0] + u[0] * f * s * l + nn[0] * k * s * w, at[1] + u[1] * f * s * l + nn[1] * k * s * w];
        shape([p(0, -0.3), p(0.5, -0.9), p(0.9, -0.7), p(1.02, 0), p(0.9, 0.7), p(0.5, 0.9), p(0, 0.3)], col, { angle: deg + d + 90, over: 0.2 });
        stroke([p(0.1, 0), p(0.8, 0)], { w: 3.5, col: BAND });
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
        c.tint([R([-0.5 * w, 0.18 * h]), R([0.52 * w, 0.18 * h]), R([0.4 * w, 0.5 * h]), R([-0.42 * w, 0.48 * h])], BELLY, { wash: 0.6 });
      }
    };
    /** The head at (hx, hy), `s` its size: a shell helmet with a chipped notch, eyes on stalks, a cocky one-fang grin. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      shape(c.band(h([[-70, -100], [-96, -190]]), 46 * s, 40 * s), DEEP, { angle: 90 });
      c.part('antennes', { pivot: H([-170, -30]), motion: 'swing', amp: 5, period: 1.6, behind: true }, () => {
        stroke(h([[-160, -50], [-250, -150], [-330, -160]]), { w: 5, col: BAND });
        stroke(h([[-170, -30], [-270, -80], [-350, -60]]), { w: 5, col: BAND });
      });
      // the helmet: pointed over the snout, flaring back over the neck, a notch chipped out of its back edge
      shape(h([[-200, 20], [-210, -40], [-150, -100], [-40, -130], [90, -120], [180, -70], [214, -10], [190, 4], [176, 14], [196, 40], [160, 90], [40, 120], [-90, 110], [-170, 70]]), TEAL, { angle: 78 + rot, over: 0.45 });
      c.tint(h([[-200, 26], [-150, 90], [-60, 110], [10, 100], [-60, 60], [-140, 34]]), BELLY, { angle: 60, wash: 0.7 });
      // a hard rim growing over its brow: the start of a helmet
      shape(h([[-206, -50], [-150, -100], [-40, -136], [120, -126], [214, -64], [160, -44], [-30, -84], [-150, -50], [-196, -20]]), BAND, { angle: 10, over: 0 }, { w: 5 });
      stroke(h([[-160, -86], [-40, -116], [120, -106]]), { w: 4, col: '#4fd0b4' });
      shape(c.band(h([[30, -110], [38, -210]]), 56 * s, 50 * s), TEAL, { angle: 90 });
      const e1 = H([-100, -218]), e2 = H([40, -236]);
      shape(potato(e1[0], e1[1], 52 * s, 56 * s, 10, 0.03), DEEP, { angle: 80, over: 0 });
      shape(potato(e2[0], e2[1], 60 * s, 64 * s, 10, 0.03), TEAL, { angle: 80, over: 0 });
      c.eye(e1[0], e1[1], 38 * s, 42 * s, '#241c38', { lid: 0.4, skin: TEAL, tilt: 18 + rot });
      c.eye(e2[0], e2[1], 46 * s, 50 * s, '#241c38', { lid: 0.4, skin: TEAL, tilt: -14 + rot });
      // cocky: narrowed eyes under brows slanting to the snout, a lopsided grin with one fang
      stroke(h([[-146, -270], [-66, -244]]), { w: 8 });
      stroke(h([[0, -258], [96, -298]]), { w: 8 });
      c.cheek(...H([110, 40]), 30 * s, 18 * s, PINK);
      stroke(h([[-196, 50], [-150, 66], [-90, 60], [-56, 36]]), { w: 6 });
      shape(h([[-150, 64], [-132, 64], [-142, 88]]), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
      c.part('paupieres', { pivot: H([-30, -226]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 38 * s, 42 * s, TEAL);
        c.lid(e2[0], e2[1], 46 * s, 50 * s, TEAL);
      });
    };

    // reared up tall on its curled tail in a boxer's guard, chest out: the far club high by its brow, partly behind its
    // head, the near one in front of its chest at chin height
    c.part('queue', { pivot: [580, 890], motion: 'swing', amp: 3, period: 2.2, behind: true }, () => fan([600, 890], -96, 150));
    club([520, 480], [430, 470], [300, 300], 56, DEEP, CORAL2, false);
    // little swimmerets along its belly
    for (const [x, y] of [[520, 610], [550, 700], [566, 790]] as P[]) shape(c.band([[x + 30, y - 10], [x - 30, y + 20], [x - 50, y + 50]], 30, 14), DEEP, { angle: 60, over: 0 }, { w: 3.5 });
    body([[540, 480], [590, 580], [624, 680], [636, 780], [616, 870]], [260, 240, 210, 170, 130]);
    head(450, 330, 0.82, -6);
    c.part('poing', { pivot: [560, 560], motion: 'swing', amp: 4, period: 1.6 }, () => club([570, 560], [480, 640], [330, 500], 72, TEAL, CORAL));
  },
} satisfies Redraw;
