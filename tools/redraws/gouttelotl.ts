import type { Crayon, P, Redraw } from './crayon.ts';
import { flankLeg, openLimb } from './anatomy.ts';

/** The family's colours: axolotl pink, a pale belly, raspberry gill-frills, the turquoise rain pearl. */
export const AXO = {
  PINK: '#f6a0bf', DEEP: '#e07fa2', BELLY: '#fde8e4', FRILL: '#e04a86', FRILL2: '#f27aa8', FIN: '#fbc6d8',
  PEARL: '#5fd0dc', RAIN: '#a6e2f2', MOUTH: '#a8325e', TONGUE: '#ff8fb0', EYE: '#241c38',
};

/** Maps local (x, y) around (cx, cy), scaled by `s` and turned `deg` degrees, to the page. */
export function frame(cx: number, cy: number, s: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const T = ([x, y]: P): P => [cx + (x * Math.cos(r) - y * Math.sin(r)) * s, cy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  return { T, t: (pts: P[]) => pts.map(T) };
}

/**
 * One gill-frill (the axolotl's feathery external gill): a thick stalk from `root` to `tip`, bowed by `bend` (px,
 * sideways: the fringe grows on the bowed-out side), and along that side a soft feathery fringe `w` wide, fine teeth
 * and a few filaments. `col` the fringe, `stalk` the stalk.
 */
export function frond(c: Crayon, root: P, tip: P, w: number, col: string, stalk: string, bend = 0, teeth = 4) {
  const [rx, ry] = root, dx = tip[0] - rx, dy = tip[1] - ry, l = Math.hypot(dx, dy) || 1;
  const sgn = bend < 0 ? -1 : 1, nx = (-dy / l) * sgn, ny = (dx / l) * sgn, n = 8;
  const spine: P[] = Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n, b = Math.sin(Math.PI * f) * Math.abs(bend);
    return [rx + dx * f + nx * b, ry + dy * f + ny * b];
  });
  const k = (f: number) => w * Math.sin(Math.PI * Math.min(1, 0.12 + f * 0.92)) * (0.55 + 0.45 * f);
  const edge = spine.map(([x, y], i): P => [x + nx * k(i / n), y + ny * k(i / n)]);
  const inner = spine.map(([x, y], i): P => [x - nx * w * 0.08 * (1 - i / n), y - ny * w * 0.08 * (1 - i / n)]);
  const fringe = c.spikes(edge, teeth, 14 * (sgn > 0 ? 1 : -1));
  c.shape([...fringe, ...inner.reverse()], col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 60, over: 0.2 }, { w: 4 }, false);
  for (let i = 2; i < n; i += 2) {
    const [x, y] = spine[i], f = i / n;
    c.stroke([[x, y], [x + nx * k(f) * 0.8 + dx * 0.06, y + ny * k(f) * 0.8 + dy * 0.06]], { w: 2.5, col: stalk });
  }
  c.shape(c.band(spine, w * 0.3, 6), stalk, { angle: (Math.atan2(dy, dx) * 180) / Math.PI, over: 0 }, { w: 3.5 });
}

/** A raindrop at (x, y), `r` its round bottom, its point up. */
export function drop(c: Crayon, x: number, y: number, r: number) {
  c.shape([[x, y - 2.3 * r], [x + 0.5 * r, y - 1.2 * r], [x + r, y - 0.1 * r], [x + 0.75 * r, y + 0.7 * r], [x, y + r], [x - 0.75 * r, y + 0.7 * r], [x - r, y - 0.1 * r], [x - 0.5 * r, y - 1.2 * r]], AXO.RAIN, { angle: 80, over: 0 }, { w: 4 });
  c.dot(x - r * 0.35, y - r * 0.1, r * 0.18, r * 0.3, '#ffffff');
}

/** The rain pearl grown on its brow. */
export function pearl(c: Crayon, x: number, y: number, r: number) {
  c.shape(c.potato(x, y, r, r, 9, 0.03), AXO.PEARL, { angle: 60, over: 0, press: 1.1 }, { w: 4 });
  c.dot(x - r * 0.35, y - r * 0.35, r * 0.24, r * 0.3, '#ffffff');
}

/**
 * A baby axolotl dragon, turned to the left, a dreamer who smiles all the time (« rêveur »): sitting up on its round
 * bottom, its wide head tipped back to the sky, it opens its big smile to catch a raindrop and holds a paw out to feel
 * the rain. Three short raspberry gill-frills on each side of its head (the family's thread: they grow into wings), a
 * finned tail curled round, the turquoise rain pearl on its brow. Axolotl pink, a pale belly.
 */
export default {
  id: '034', slug: 'gouttelotl', seed: 3481, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const { PINK, DEEP, BELLY, FRILL, FRILL2, FIN, MOUTH, TONGUE } = AXO;

    // the rain it is catching
    c.part('pluie', { pivot: [170, 150], motion: 'nod', amp: 3, period: 2.4, decor: true }, () => {
      drop(c, 170, 150, 22);
    });
    // the finned tail curled round behind (it sways in battle): a pale fin round a pink stalk
    c.part('queue', { pivot: [690, 830], motion: 'swing', amp: 3, period: 2.8, behind: true }, () => {
      const spine: P[] = [[670, 840], [790, 870], [890, 820], [924, 720], [876, 652]];
      shape(band(spine, 170, 12), FIN, { angle: 30, over: 0 });
      shape(band(spine, 96, 8), PINK, { angle: 30, over: 0.3 });
    });
    // the far foot, the round body sitting up, a pale belly, the near hind leg folded on its flank
    shape(potato(452, 886, 56, 26, 8, 0.05), DEEP, { angle: 10 });
    shape([[350, 650], [390, 570], [490, 540], [610, 580], [690, 680], [708, 790], [664, 868], [540, 896], [420, 876], [356, 800]], PINK, { angle: 70, over: 0.4 });
    c.tint([[360, 660], [410, 590], [470, 620], [486, 740], [470, 866], [400, 840], [364, 760]], BELLY, { angle: 80, wash: 0.8 });
    flankLeg(c, [640, 750], [566, 876], PINK, 116);

    // the wide head, tipped back to the sky
    const s = 1.16, { T, t } = frame(400, 400, s, 16);
    // the far frills peeking over the top of its head
    for (const [r, tip] of [[[30, -100], [4, -248]], [[80, -96], [119, -241]], [[120, -86], [216, -201]]] as [P, P][]) frond(c, T(r), T(tip), 40 * s, FRILL2, FRILL, -20, 1);
    shape(t([[-196, 20], [-190, -46], [-150, -100], [-70, -128], [40, -126], [140, -98], [192, -36], [196, 42], [160, 100], [60, 128], [-60, 124], [-150, 94]]), PINK, { angle: 96, over: 0.4 });
    c.tint(t([[-190, 40], [-140, 96], [-40, 120], [40, 110], [-20, 80], [-120, 60]]), BELLY, { angle: 60, wash: 0.7 });
    pearl(c, ...T([-44, -110]), 24 * s);
    // dreamy joy, one emotion: the big smile wide open to the rain, glossy eyes turned up to the clouds
    shape(t([[-188, 30], [-130, 50], [-60, 56], [10, 44], [30, 26], [20, 66], [-30, 104], [-110, 104], [-170, 72]]), MOUTH, { over: 0 }, { w: 4.5 });
    shape(t([[-150, 80], [-100, 72], [-40, 80], [-60, 100], [-120, 100]]), TONGUE, { over: 0 }, { w: 0.1 });
    c.eye(...T([-116, -36]), 22 * s, 27 * s, AXO.EYE);
    c.eye(...T([-10, -40]), 30 * s, 36 * s, AXO.EYE);
    c.cheek(...T([60, 30]), 30 * s, 17 * s, '#f0668e');
    dot(...T([-176, -14]), 5, 4);
    // the near frills: three short feathery stalks at the back of its cheek (they sway in battle)
    c.part('branchies', { pivot: T([150, 0]), motion: 'swing', amp: 3, period: 2.6 }, () => {
      // three equal fronds, fanned evenly
      for (const [r, tip, bend] of [[[130, -60], [239, -190], -22], [[160, -6], [326, -41], -22], [[150, 56], [300, 136], 22]] as [P, P, number][]) frond(c, T(r), T(tip), 46 * s, FRILL2, FRILL, bend, 1);
    });
    // the near paw held out, palm up, to feel the rain
    openLimb(c, [[476, 640], [400, 650], [330, 628], [300, 600], [316, 580], [366, 592], [436, 590], [486, 600]], PINK, 1, 6);
    shape(potato(298, 590, 34, 24, 8, 0.06), PINK, { angle: 20 });
    for (const d of [-12, 10]) stroke([[298 + d, 572], [294 + d * 1.3, 556]], { w: 3.5 });
    c.part('paupieres', { pivot: T([-60, -38]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-116, -36]), 22 * s, 27 * s, PINK);
      c.lid(...T([-10, -40]), 30 * s, 36 * s, PINK);
    });
  },
} satisfies Redraw;
