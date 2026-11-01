import type { P, Redraw } from './crayon.ts';
import { jaggedLeaf, lineOfAction, openLimb, paw } from './anatomy.ts';

/**
 * Minousse grown into a sulky teen (« boudeur tapi »), turned to the left: crouched low and ready to pounce, its tail
 * lashing, glaring from under a low brow with a pout. A smaller head than Minousse on a longer body, longer legs, and
 * its first three tiger stripes on the haunch (Bouquétigre to come). On its back a pink bud clasped by two jagged leaves,
 * one petal peeking out of its slit: the flower that will open like a jaw.
 */
export default {
  id: '020', slug: 'minoufleur', seed: 2083, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const LIME = '#9ad63a', DEEP = '#7cb82a', LEAF = '#4fa83a', VEIN = '#3a8a2c', PALE = '#f0f7d6', PINK = '#f29ab0';
    const BUD = '#f06aa8', PETAL = '#ff8cc4', STRIPE = '#3f7f2a';

    /** A point `px` across and `py` up from `base`, along the direction `deg` (0 = up, clockwise). */
    const along = (base: P, deg: number, s: number) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      return ([px, py]: P): P => [base[0] + (v[0] * px + u[0] * py) * s, base[1] + (v[1] * px + u[1] * py) * s];
    };
    /** The bud on its back: rooted at `base` in the fur, leaning `deg`, two jagged leaves clasping it, a petal peeking. */
    const bud = (base: P, deg: number, s: number) => {
      const at = along(base, deg, s), t = (pts: P[]) => pts.map(at);
      jaggedLeaf(c, t([[10, -10], [70, 40], [90, 120], [60, 190]]), 30 * s, DEEP, VEIN);
      shape(t([[-56, 10], [-70, 90], [-50, 170], [0, 230], [40, 200], [66, 120], [56, 10]]), BUD, { angle: deg + 80, over: 0.3 });
      // the slit where it starts to open, a paler petal peeking out at the tip
      stroke(t([[-24, 60], [-30, 140], [-8, 206]]), { w: 4, col: '#c4507e' });
      shape(t([[-8, 198], [-34, 208], [-54, 230], [-24, 236], [6, 216]]), PETAL, { angle: deg + 40, over: 0 });
      jaggedLeaf(c, t([[-6, -14], [-64, 24], [-84, 84], [-70, 136]]), 28 * s, LEAF, VEIN);
    };
    /** Three tiger stripes coming down from the back line, the first ones. */
    const stripes = (pts: [P, P][]) => {
      for (const [a, b] of pts) {
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
        shape([[a[0] + n[0] * 12, a[1] + n[1] * 12], [(a[0] + b[0]) / 2 + n[0] * 4 - 8, (a[1] + b[1]) / 2 + n[1] * 4], b, [(a[0] + b[0]) / 2 - n[0] * 6 - 8, (a[1] + b[1]) / 2 - n[1] * 6], [a[0] - n[0] * 12, a[1] - n[1] * 12]], STRIPE, { over: 0 }, { w: 2 });
      }
    };
    /** The teen head, centred on (hx, hy), `s` its size, turned `rot` degrees: pointed ears, a sulky pout. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      shape(h([[-140, -60], [-156, -168], [-138, -182], [-66, -104]]), DEEP, { angle: 70 });
      shape(h([[-6, -106], [36, -206], [60, -212], [112, -96]]), LIME, { angle: 70 });
      c.tint(h([[18, -110], [44, -178], [56, -180], [88, -106]]), PINK, { wash: 0.55 });
      shape(h([[-150, -30], [-128, -92], [-60, -116], [50, -116], [130, -100], [162, -40], [160, 40], [128, 96], [40, 116], [-60, 112], [-128, 92], [-160, 34]]), LIME, { angle: 78 + rot, over: 0.45 });
      c.tint(potato(...H([-82, 64]), 72 * s, 40 * s, 9, 0.08), PALE, { angle: 60, wash: 0.7 });
      // sulky: half-lidded eyes under brows pulled down to the middle, a pout with one fang, a puffed pink cheek
      const [e1, e2] = [H([-78, -10]), H([20, -16])];
      c.eye(e1[0], e1[1], 24 * s, 30 * s, '#3a3050', { lid: 0.42, skin: LIME, tilt: 14 + rot });
      c.eye(e2[0], e2[1], 30 * s, 37 * s, '#3a3050', { lid: 0.42, skin: LIME, tilt: -10 + rot });
      stroke(h([[-112, -48], [-58, -34]]), { w: 7 });
      stroke(h([[-8, -40], [60, -58]]), { w: 7 });
      c.cheek(...H([92, 52]), 30 * s, 18 * s);
      dot(...H([-86, 40]), 12 * s, 9 * s, '#e07a96');
      stroke(h([[-124, 92], [-104, 72], [-80, 80], [-56, 72], [-38, 92]]), { w: 5 }, false);
      shape(h([[-66, 76], [-54, 74], [-60, 96]]), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
      stroke(h([[-150, 56], [-226, 44]]), { w: 3 });
      stroke(h([[-148, 74], [-222, 82]]), { w: 3 });
      c.part('paupieres', { pivot: H([-30, -14]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 24 * s, 30 * s, LIME);
        c.lid(e2[0], e2[1], 30 * s, 37 * s, LIME);
      });
    };

    // the pounce crouch: chest and chin to the ground, the rump raised, the tail lashing
    c.part('queue', { pivot: [800, 560], motion: 'swing', amp: 12, period: 1.2, behind: true }, () => {
      shape(band([[790, 570], [870, 510], [886, 410], [840, 330], [870, 240], [930, 210]], 58, 32), LIME, { angle: 40, over: 0.3 });
    });
    shape(band([[440, 740], [400, 850], [330, 884]], 54, 46), DEEP, { angle: 30 });
    paw(c, 330, 888, DEEP, 44);
    shape(potato(800, 896, 44, 20, 8, 0.06), DEEP, { angle: 10 });
    shape(lineOfAction([[330, 720], [450, 700], [590, 650], [720, 590], [810, 570]], [190, 200, 180, 210, 170], [0, 10, 0, 30, 0]), LIME, { angle: 20, over: 0.4 });
    c.tint(potato(560, 770, 180, 28, 10, 0.05), PALE, { angle: 20, wash: 0.65 });
    bud([580, 624], 4, 0.95);
    // the near hind leg loaded for the pounce: the shin down and back to the heel on the ground, the long foot forward,
    // the round haunch over them
    shape(band([[820, 770], [866, 830], [884, 876]], 64, 50), LIME, { angle: 70 });
    shape(band([[890, 884], [790, 892], [690, 896]], 46, 40), LIME, { angle: 10 });
    for (const x of [704, 730]) stroke([[x, 884], [x + 2, 914]], { w: 3.5 });
    openLimb(c, [[700, 610], [674, 690], [692, 770], [750, 812], [822, 806], [866, 756], [872, 686], [846, 616]], LIME, 1, 7);
    // its first three stripes: dark wedges from the spine down the flank
    stripes([[[704, 506], [680, 640]], [[754, 502], [732, 650]], [[802, 500], [786, 632]]]);
    openLimb(c, [[430, 700], [410, 830], [330, 850], [272, 862], [262, 892], [300, 906], [500, 906], [530, 860], [524, 760], [520, 700]], LIME, 1, 9);
    for (const x of [282, 306]) stroke([[x, 880], [x + 2, 904]], { w: 3.5 });
    head(256, 700, 0.86, -6);
  },
} satisfies Redraw;
