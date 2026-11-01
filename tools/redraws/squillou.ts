import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * A tiny mantis shrimp, turned to the left, always ready to punch (« petite teigne »): a big round head, two big frowning
 * eyes on short stalks, a little curled body of teal segments, a tail fan. Its weapon is its body: two coral clubs folded
 * under its chin, the fastest punch in the pond, held up like fists.
 */
export default {
  id: '029', slug: 'squillou', seed: 2931, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const TEAL = '#2fb39a', TEAL2 = '#35bda3', DEEP = '#21927e', BAND = '#17705f', BELLY = '#e2f6dc', CORAL = '#ff7a52', CORAL2 = '#e05a3a', PINK = '#f29ab0';

    /** A club: the folded raptorial arm from `root` by `elbow` to the knob at `fist`, `r` its size, the thin claw folded
     * back along the forearm. */
    const club = (root: P, elbow: P, fist: P, r: number, arm: string, knob: string, near = true) => {
      const dx = fist[0] - elbow[0], dy = fist[1] - elbow[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l], n: P = [-u[1], u[0]];
      const at = (f: number, k: number): P => [fist[0] + u[0] * f * r + n[0] * k * r, fist[1] + u[1] * f * r + n[1] * k * r];
      const pts = c.band([root, elbow, at(-0.6, 0)], r * 0.7, r * 0.6);
      if (near) openLimb(c, pts, arm, 1, pts.length - 1);
      else shape(pts, arm, { angle: 40 });
      // the claw: its heel swollen into a round club, its thin point folded back under the forearm
      shape([at(-0.9, 0.55), at(-0.2, 0.95), at(0.6, 1), at(1.15, 0.55), at(1.3, -0.15), at(1.05, -0.8), at(0.4, -1.05), at(-0.5, -1.04), at(-1.4, -0.94), at(-2.15, -0.76), at(-1.4, -0.66), at(-0.6, -0.6), at(-0.9, -0.3)], knob, { angle: 40, over: 0.35 });
      c.shine([at(0.1, 0.6), at(0.6, 0.5)], 7);
    };
    /** A small tail fan at `at`, opening along `deg` (0 = up), three rounded paddles. */
    const fan = (at: P, deg: number, s: number) => {
      for (const [d, l, w, col] of [[-42, 1, 0.42, DEEP], [42, 1, 0.42, DEEP], [0, 1.15, 0.4, TEAL]] as const) {
        const a = ((deg + d) * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], n: P = [-u[1], u[0]];
        const p = (f: number, k: number): P => [at[0] + u[0] * f * s * l + n[0] * k * s * w, at[1] + u[1] * f * s * l + n[1] * k * s * w];
        shape([p(0, -0.3), p(0.5, -0.9), p(0.9, -0.7), p(1.02, 0), p(0.9, 0.7), p(0.5, 0.9), p(0, 0.3)], col, { angle: deg + d + 90, over: 0.2 });
        stroke([p(0.1, 0), p(0.8, 0)], { w: 3.5, col: BAND });
      }
    };
    /** The head at (hx, hy), `s` its size: a round shell, eyes on short stalks on top, a frown, a pout. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the far stalk and eye first, smaller
      shape(c.band(h([[-80, -110], [-96, -230]]), 40 * s, 34 * s), DEEP, { angle: 90 });
      stroke(h([[-106, -176], [-74, -172]]), { w: 6, col: BAND });
      // two little feelers forward
      c.part('antennes', { pivot: H([-170, -40]), motion: 'swing', amp: 5, period: 1.6, behind: true }, () => {
        stroke(h([[-150, -60], [-230, -150], [-300, -170]]), { w: 5, col: BAND });
        stroke(h([[-160, -40], [-250, -100], [-320, -96]]), { w: 5, col: BAND });
      });
      shape(h([[-196, 10], [-180, -70], [-110, -128], [0, -146], [110, -120], [176, -40], [180, 50], [130, 120], [20, 150], [-100, 138], [-174, 90]]), TEAL, { angle: 78 + rot, over: 0.45 });
      c.tint(h([[-196, 20], [-150, 100], [-60, 136], [20, 130], [-40, 80], [-130, 40]]), BELLY, { angle: 60, wash: 0.7 });
      // a shell ridge over the brow, the start of a helmet
      stroke(h([[-120, -110], [0, -132], [110, -104]]), { w: 4, col: BAND });
      // the near stalk, a darker band round its middle
      shape(c.band(h([[40, -120], [46, -248]]), 48 * s, 42 * s), TEAL, { angle: 90 });
      stroke(h([[20, -190], [68, -188]]), { w: 7, col: BAND });
      const e1 = H([-100, -262]), e2 = H([50, -290]);
      c.eye(e1[0], e1[1], 44 * s, 50 * s, '#241c38', { lid: 0.3, skin: TEAL, tilt: 16 + rot });
      c.eye(e2[0], e2[1], 52 * s, 58 * s, '#241c38', { lid: 0.3, skin: TEAL, tilt: -16 + rot });
      // a cross little face: brows down to the middle, a pout, a puffed cheek
      stroke(h([[-150, -326], [-60, -292]]), { w: 8 });
      stroke(h([[6, -310], [106, -356]]), { w: 8 });
      c.cheek(...H([96, 50]), 34 * s, 20 * s, PINK);
      stroke(h([[-150, 70], [-118, 54], [-82, 66]]), { w: 6 });
      c.part('paupieres', { pivot: H([-20, -276]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 44 * s, 50 * s, TEAL);
        c.lid(e2[0], e2[1], 52 * s, 58 * s, TEAL);
      });
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

    // popping out of its burrow in a sand mound: the dark hole's rim wraps round its body, only the head, the eyes on
    // stalks, two tiny cocked fists and the tip of its tail fan show, ready to punch anyone who comes near
    const SAND = '#ecd9a6', SHADE = '#d8c088', HOLE = '#4e3f34';
    const hole = (k: number): P[] => Array.from({ length: 13 }, (_, i): P => [500 + Math.cos(Math.PI * (i / 12)) * 330 * k, 760 + Math.sin(Math.PI * (i / 12)) * 70 * k]);
    c.part('terrier', { pivot: [500, 800], motion: 'swing', amp: 0, period: 3, decor: true, behind: true }, () => {
      shape([[40, 930], [110, 800], [260, 690], [420, 650], [580, 650], [740, 690], [890, 800], [960, 930]], SAND, { angle: 10, over: 0.2 });
      shape(potato(500, 760, 332, 72, 14, 0.02), HOLE, { angle: 0, over: 0 }, { w: 5 });
    });
    // the tip of its tail fan, curled up out of the back of the hole
    c.part('queue', { pivot: [640, 640], motion: 'swing', amp: 4, period: 2.2, behind: true }, () => fan([630, 650], 48, 105));
    body([[500, 650], [500, 730], [500, 790]], [250, 240, 230]);
    head(500, 470, 1.08, -4);
    // its little arms come up out of the hole, fists cocked on the rim
    club([380, 790], [290, 780], [260, 690], 50, DEEP, CORAL2, false);
    // the front of the mound, its rim wrapping round the body
    c.part('terrier-bord', { pivot: [500, 860], motion: 'swing', amp: 0, period: 3, decor: true }, () => {
      const front: P[] = [...hole(1).reverse(), [890, 820], [960, 930], [40, 930], [110, 820]];
      shape(front, SAND, { angle: 10, over: 0.2 });
      c.tint([[80, 910], [200, 850], [320, 910]], SHADE, { wash: 0.6 });
      c.tint([[680, 910], [800, 850], [920, 910]], SHADE, { wash: 0.6 });
      stroke(hole(0.86).slice(2, 11), { w: 4, col: SHADE });
    });
    c.part('poing', { pivot: [640, 780], motion: 'swing', amp: 4, period: 1.8 }, () => club([600, 820], [720, 790], [740, 690], 58, TEAL, CORAL));
  },
} satisfies Redraw;
