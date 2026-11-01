import type { P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';
import { goatLeg } from './brouticot.ts';

/**
 * The kid grown into a stubborn young goat (« brouteur têtu »), turned to the left: its seedling has split into two vine
 * horns that twist back and curl forward, a leaf here and there, and it charges head down to butt whatever is in its way
 * (and then eat it), front legs braced, grinning. Its chin has grown a first tuft of leaves.
 */
export default {
  id: '063', slug: 'tetebique', seed: 6302, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const FUR = '#7dbd48', DEEP = '#5f9e36', FAR = '#4f8a2e', CREAM = '#f7eccb', VINE = '#3f9a30', TWIST = '#2c7424';
    const LEAF = '#58b83c', VEIN = '#2f7a26', PINK = '#f29ab0', NOSE = '#d9738e';

    /** A vine horn along `path` (root first), `w0` wide at the root: a twisting band, darker twists, leaves on it. */
    const horn = (path: P[], w0: number, col: string, leaves: [number, number][]) => {
      const out = lineOfAction(path, path.map((_, i) => w0 * (1 - (i / (path.length - 1)) * 0.8)));
      shape(out, col, { angle: 30, over: 0.2 });
      for (let i = 1; i < path.length - 1; i++) {
        const [a, b] = [path[i], path[i + 1]];
        stroke([[a[0] + (b[0] - a[0]) * 0.2 - 10, a[1] + (b[1] - a[1]) * 0.2 - 10], [a[0] + (b[0] - a[0]) * 0.5 + 10, a[1] + (b[1] - a[1]) * 0.5 + 10]], { w: 4, col: TWIST });
      }
      for (const [i, deg] of leaves) {
        const [x, y] = path[i], a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
        const at = (f: number, k: number): P => [x + u[0] * f + v[0] * k, y + u[1] * f + v[1] * k];
        shape([at(0, 0), at(30, 22), at(70, 18), at(96, 0), at(70, -18), at(30, -22)], LEAF, { angle: deg, over: 0 }, { w: 4 });
        stroke([at(4, 0), at(80, 0)], { w: 3, col: VEIN });
      }
    };
    /** The young goat's head centred on (hx, hy), `s` its size, turned `rot` degrees: a stubborn grin. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the far vine horn, behind
      horn(h([[-40, -96], [-50, -180], [-10, -250], [80, -286], [170, -260], [200, -196], [170, -156], [134, -170], [140, -206]]), 54 * s, TWIST, [[3, 10]]);
      shape(h([[-70, -80], [-150, -116], [-224, -112], [-196, -84], [-110, -56]]), FAR, { angle: 20, over: 0 });
      c.part('oreille', { pivot: H([104, -54]), motion: 'swing', amp: 4, period: 2.6 }, () => {
        shape(h([[90, -76], [176, -82], [262, -46], [280, -18], [236, -6], [160, -14], [96, -24]]), FUR, { angle: 20, over: 0.2 });
        c.tint(h([[124, -60], [196, -60], [250, -32], [190, -28], [130, -38]]), PINK, { wash: 0.6 });
      });
      const outline = h([[-258, 36], [-252, 2], [-208, -24], [-136, -64], [-52, -104], [32, -112], [104, -84], [140, -22], [128, 44], [86, 90], [10, 108], [-80, 100], [-160, 86], [-232, 74]]);
      shape(outline, FUR, { angle: 78, over: 0.45 }, { w: 0.1 });
      shape(h([[-258, 36], [-252, 2], [-208, -24], [-140, -46], [-72, -100], [-34, -108], [-48, -40], [-70, 30], [-60, 98], [-80, 100], [-160, 86], [-232, 74]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      // the first tuft of leaves on its chin
      c.part('barbiche', { pivot: H([-150, 92]), motion: 'swing', amp: 5, period: 2.2 }, () => {
        shape(h([[-130, 88], [-150, 150], [-176, 200], [-190, 150], [-176, 96]]), LEAF, { angle: 100, over: 0 }, { w: 4 });
        shape(h([[-170, 86], [-206, 136], [-236, 170], [-232, 120], [-206, 84]]), VINE, { angle: 100, over: 0 }, { w: 4 });
      });
      // the near vine horn, twisting back and curling forward over the brow
      c.part('cornes', { pivot: H([20, -100]), motion: 'swing', amp: 2, period: 2.8 }, () => {
        horn(h([[20, -100], [30, -190], [90, -260], [196, -282], [280, -236], [296, -150], [256, -104], [210, -120], [212, -168], [244, -176]]), 70 * s, VINE, [[2, 30], [4, 110]]);
      });
      // stubborn: eyes narrowed under brows pulled down to the nose, a grin with one tooth
      const [e1, e2] = [H([-140, -26]), H([-30, -34])];
      c.eye(e1[0], e1[1], 20 * s, 26 * s, '#241c38', { lid: 0.38, skin: CREAM, tilt: 18 + rot });
      c.eye(e2[0], e2[1], 27 * s, 34 * s, '#241c38', { lid: 0.38, skin: FUR, tilt: -14 + rot });
      stroke(h([[-176, -66], [-118, -50]]), { w: 7 });
      stroke(h([[-66, -60], [12, -82]]), { w: 7.5 });
      c.cheek(...H([52, 50]), 28 * s, 17 * s, PINK);
      shape(potato(...H([-244, 18]), 15 * s, 11 * s, 8, 0.05), NOSE, { over: 0 }, { w: 3 });
      stroke(h([[-246, 54], [-210, 70], [-160, 70], [-128, 48]]), { w: 5 });
      shape(h([[-200, 68], [-176, 70], [-178, 88], [-198, 86]]), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
      c.part('paupieres', { pivot: H([-80, -30]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 20 * s, 26 * s, CREAM);
        c.lid(e2[0], e2[1], 27 * s, 34 * s, FUR);
      });
    };
    // charging: head low, the vine horns forward, front legs braced, the hind legs pushing
    c.part('ombre', { pivot: [560, 910], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      c.tint(potato(560, 914, 340, 26, 12, 0.03), '#e2dccc', { wash: 0.9 });
    });
    c.part('queue', { pivot: [770, 570], motion: 'swing', amp: 8, period: 1.2, behind: true }, () => {
      shape([[760, 580], [806, 500], [844, 490], [828, 540], [790, 600]], DEEP, { angle: 60, over: 0 });
    });
    // the far legs, darker: the front one braced forward, the hind one pushing
    goatLeg(c, [[490, 660], [470, 740], [436, 806], [412, 856], [398, 876]], [64, 46, 36, 30, 26], FAR, CREAM, 2);
    goatLeg(c, [[700, 660], [680, 740], [752, 790], [796, 856], [808, 876]], [80, 56, 38, 30, 26], FAR, CREAM, 2);
    // the body, shorter: the chest low and forward, the rump up
    shape(lineOfAction([[420, 640], [530, 604], [650, 590], [750, 610]], [210, 196, 190, 176], [20, 0, 0, 10]), FUR, { angle: 20, over: 0.4 });
    c.tint(c.band([[480, 700], [580, 690], [670, 684]], 40, 30), CREAM, { angle: 10, wash: 0.8 });
    // the near hind leg pushing: the round haunch, the stifle forward, the hock back, the cannon, the hoof
    openLimb(c, potato(724, 630, 74, 86, 10, 0.04), FUR, 2, 8);
    goatLeg(c, [[736, 660], [716, 746], [800, 796], [850, 860], [862, 878]], [96, 64, 44, 34, 30], FUR, CREAM, 2);
    // the near front leg braced forward: the elbow, the knee, the fetlock, the hoof dug in
    goatLeg(c, [[440, 640], [416, 732], [376, 800], [344, 858], [328, 878]], [84, 58, 42, 34, 30], FUR, CREAM, 2);
    head(310, 600, 0.8, -22);
  },
} satisfies Redraw;
