import type { P, Redraw } from './crayon.ts';
import { flankLeg, lineOfAction } from './anatomy.ts';
import { limb, pad, pandaHead, rounded, sample, tailBand } from './pandaKit.ts';

/**
 * Pandafougère, the shy fern panda (« le timide costaud »): Pandoudou redrawn with a green Magic Pencil. Its
 * question-mark tail has grown into a fern frond. Crouched low, it holds the frond over itself like an umbrella, the end
 * rolled into a crosier just beside its face, and peeks out from under it with a shy smile, blushing.
 */
export default {
  id: '125', slug: 'pandafougere', seed: 1251, size: [1000, 1000], tilt: 0,
  draw(c) {
    const MOSS = '#3f9a2e', DEEP = '#245e1c', CREAM = '#f6efd6', LEAF = '#6cc23a', VEIN = '#2f7a22', FAR = '#2f7a24', PINK = '#f27a98';
    const PAD = '#2c6a22';
    const ctrl: P[] = [[720, 740], [820, 630], [810, 480], [690, 400], [530, 390], [390, 420], [290, 480], [220, 510], [150, 570], [120, 660], [160, 740], [256, 746], [296, 668], [250, 604], [184, 616], [176, 680], [222, 700]];
    const N = 90;
    const { sp, ws, L, R } = tailBand(ctrl, (t) => (t < 0.1 ? 80 - t * 200 : t < 0.7 ? 70 : Math.max(26, 70 - (t - 0.7) * 160)), N);
    const LOBED = 66; // the lobes stop where the tip rolls up

    /** A pinna: a small leaf from `root` along the unit direction `d`, `len` long, `w` wide. */
    const pinna = (root: P, d: P, len: number, w: number) => {
      const spine = Array.from({ length: 8 }, (_, k): P => [root[0] + d[0] * len * (k / 7), root[1] + d[1] * len * (k / 7)]);
      c.shape(lineOfAction(spine, [0.5, 0.8, 1, 1, 0.95, 0.8, 0.55, 0.15].map((x) => x * w)), LEAF, { angle: 50, over: 0.15 }, { w: 3 });
      c.stroke(spine.slice(1, 6), { w: 2, col: VEIN });
    };
    /** The frond from sample `a` to `b`: leaflets overlapping along both sides like a ladder, angled toward the tip, on its stalk. */
    const frond = (a: number, b: number) => {
      for (let i = Math.max(8, a); i < Math.min(b, LOBED); i += 4) {
        const k = Math.sin(Math.min(1, (i - 4) / (LOBED - 4)) * Math.PI * 0.85 + 0.3);
        const [fx, fy] = [sp[i + 1][0] - sp[i][0], sp[i + 1][1] - sp[i][1]], fl = Math.hypot(fx, fy) || 1, f: P = [fx / fl, fy / fl];
        for (const [edge, side] of [[R, 1], [L, -1]] as const) {
          if (side > 0 && i < 16) continue;
          const [x, y] = edge[i], dx = x - sp[i][0], dy = y - sp[i][1], l = Math.hypot(dx, dy) || 1;
          const d: P = [(dx / l) * 0.75 + f[0] * 0.66, (dy / l) * 0.75 + f[1] * 0.66];
          pinna([x - (dx / l) * ws[i] * 0.4, y - (dy / l) * ws[i] * 0.4], d, (side > 0 ? 130 : 104) * k, 50 * k);
        }
      }
      const stalk = lineOfAction(sp.slice(a, b), ws.slice(a, b).map((w, j) => (a + j < 10 ? w : a + j < LOBED ? w * 0.4 : w)));
      c.shape(stalk, MOSS, { angle: 40, over: 0.4 }, { w: 0.1 });
      c.stroke(stalk.slice(0, b - a), { w: 4.5 });
      c.stroke(stalk.slice(b - a), { w: 4.5 });
      if (b === N) c.stroke([stalk[b - a - 1], stalk[b - a]], { w: 4.5 });
    };
    // the frond over its back and head, behind it
    c.part('queue', { pivot: [720, 730], motion: 'swing', amp: 1.2, period: 3.6, behind: true }, () => frond(0, N));
    // far legs, darker
    limb(c, [[440, 780], [380, 840], [320, 860]], [70, 54, 46], FAR);
    pad(c, 304, 862, 75, 0.9, PAD);
    c.shape(c.potato(700, 790, 72, 60, 10, 0.05), FAR, { angle: 60, over: 0.3 });
    limb(c, [[710, 820], [680, 866], [620, 876]], [64, 50, 44], FAR);
    pad(c, 604, 878, 80, 0.9, PAD);
    // the body: low and short, chest down, the back rising into the haunch
    const spine = sample([[410, 780], [500, 755], [600, 730], [690, 735]], 30);
    c.shape(rounded(spine, spine.map((_, i) => 150 + Math.sin((i / 29) * Math.PI) * 30), spine.map((_, i) => (i < 12 ? 20 : 0))), MOSS, { angle: 20, over: 0.45 });
    c.tint(lineOfAction(spine.slice(2, 14).map(([x, y]): P => [x, y + 50]), spine.slice(2, 14).map(() => 60)), CREAM, { angle: 20, wash: 0.8 });
    flankLeg(c, [640, 710], [590, 864], MOSS, 130);
    // the near front paw tucked under its chin
    limb(c, [[470, 760], [490, 830], [420, 866]], [96, 66, 56], MOSS);
    pad(c, 400, 868, 80, 1, PAD);
    pandaHead(c, { fur: MOSS, deep: DEEP, cream: CREAM, pink: PINK, bright: true }, 420, 700, 0.68, -8, 'shy');
  },
} satisfies Redraw;
