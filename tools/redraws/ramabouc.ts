import type { P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';
import { goatLeg } from './brouticot.ts';

/**
 * The stubborn young goat grown into a great billy goat (« bouc glouton »), turned to the left: tall, a deep chest, its
 * vine horns grown into a crown of branching vines in leaf, red berries among them, and a long beard of leaves. It eats
 * everything, even fences: one front hoof up on the post it has been chewing, it looks down at you, still munching.
 */
export default {
  id: '064', slug: 'ramabouc', seed: 6403, size: [1100, 1100], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const FUR = '#6fb040', DEEP = '#57963a', FAR = '#4a822e', CREAM = '#f5e8c4', VINE = '#3a8c2c', TWIST = '#2a6a22';
    const LEAF = '#4fae38', LEAF2 = '#3c9430', VEIN = '#2a6a22', PINK = '#f29ab0', NOSE = '#c8627e', BERRY = '#e0453c';
    const WOOD = '#c09060', WOOD2 = '#9a6c40';

    /** A leaf from (x, y) pointing along `deg` (0 = up), `l` long. */
    const leaf = (x: number, y: number, deg: number, l: number, col = LEAF) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
      const at = (f: number, k: number): P => [x + (u[0] * f + v[0] * k) * l, y + (u[1] * f + v[1] * k) * l];
      shape([at(0, 0), at(0.3, 0.24), at(0.7, 0.2), at(1, 0), at(0.7, -0.2), at(0.3, -0.24)], col, { angle: deg, over: 0 }, { w: 4 });
      stroke([at(0.04, 0), at(0.82, 0)], { w: 3, col: VEIN });
    };
    /** A vine branch along `path`, `w0` wide at its root, twisting, tapering to a tendril. */
    const vine = (path: P[], w0: number, col: string) => {
      const out = lineOfAction(path, path.map((_, i) => w0 * (1 - (i / (path.length - 1)) * 0.8)));
      shape(out, col, { angle: 30, over: 0.2 });
      for (let i = 1; i < path.length - 2; i++) {
        const [a, b] = [path[i], path[i + 1]];
        stroke([[a[0] + (b[0] - a[0]) * 0.2 - 8, a[1] + (b[1] - a[1]) * 0.2 - 8], [a[0] + (b[0] - a[0]) * 0.5 + 8, a[1] + (b[1] - a[1]) * 0.5 + 8]], { w: 4, col: TWIST });
      }
    };
    const berries = (x: number, y: number) => {
      for (const [dx, dy] of [[0, 0], [24, 8], [10, 26]] as P[]) {
        shape(potato(x + dx, y + dy, 15, 15, 8, 0.04), BERRY, { over: 0, press: 1.1 }, { w: 3.5 });
        dot(x + dx - 5, y + dy - 5, 4, 4, '#ffffff');
      }
    };
    /** The billy goat's head centred on (hx, hy), `s` its size, turned `rot` degrees: proud, looking down at you. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the crown: the two vine horns grown huge, sweeping back, in leaf, berries among the leaves
      c.part('couronne', { pivot: H([0, -100]), motion: 'swing', amp: 1.5, period: 3.2, behind: true }, () => {
        const far: P[] = [[-40, -96], [-30, -200], [40, -300], [160, -360], [290, -370], [380, -330], [400, -280], [370, -260]];
        const near: P[] = [[20, -100], [70, -190], [160, -260], [290, -290], [410, -270], [480, -210], [490, -140], [450, -120], [436, -160]];
        vine(h(far), 70 * s, TWIST);
        for (const [i, deg] of [[2, -20], [3, 10], [4, 40], [5, 80]] as const) leaf(...H(far[i]), deg + rot, 100 * s, LEAF2);
        vine(h(near), 92 * s, VINE);
        for (const [i, deg] of [[2, 0], [3, 30], [4, 60], [5, 100], [6, 130]] as const) leaf(...H(near[i]), deg + rot, 110 * s);
        leaf(...H([110, -170]), -40 + rot, 90 * s, LEAF2);
        berries(...H([230, -330]));
        berries(...H([90, -300]));
      });
      shape(h([[-70, -80], [-150, -112], [-216, -104], [-190, -80], [-110, -54]]), FAR, { angle: 20, over: 0 });
      c.part('oreille', { pivot: H([104, -54]), motion: 'swing', amp: 4, period: 2.6 }, () => {
        shape(h([[90, -76], [176, -84], [254, -50], [272, -22], [228, -10], [160, -16], [96, -24]]), FUR, { angle: 20, over: 0.2 });
        c.tint(h([[124, -60], [196, -62], [244, -36], [190, -30], [130, -38]]), PINK, { wash: 0.6 });
      });
      // a long wedge of a head, a strong nose
      const outline = h([[-282, 40], [-276, 4], [-226, -26], [-140, -70], [-52, -106], [32, -112], [104, -84], [140, -22], [128, 44], [86, 90], [10, 106], [-80, 96], [-180, 84], [-252, 76]]);
      shape(outline, FUR, { angle: 78, over: 0.45 }, { w: 0.1 });
      shape(h([[-282, 40], [-276, 4], [-226, -26], [-150, -50], [-76, -100], [-36, -108], [-50, -40], [-74, 30], [-66, 94], [-80, 96], [-180, 84], [-252, 76]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      // the long beard of leaves under its chin
      c.part('barbe', { pivot: H([-170, 90]), motion: 'swing', amp: 3, period: 2.6 }, () => {
        // a long pointed goatee of leaves, hanging straight down
        for (const [x, y, deg, l, col] of [[-120, 84, 192, 150, LEAF2], [-196, 78, 172, 150, LEAF2], [-160, 88, 182, 230, LEAF], [-150, 150, 186, 150, LEAF]] as const) {
          leaf(...H([x, y]), deg + rot, l * s, col);
        }
      });
      // proud: eyes open, the pupils looking down along the nose, one level brow, the mouth closed, still chewing
      const [e1, e2] = [H([-150, -26]), H([-38, -34])];
      c.paper(potato(e1[0], e1[1], 21 * s, 26 * s, 10, 0.03), { w: 4 });
      c.paper(potato(e2[0], e2[1], 28 * s, 33 * s, 10, 0.03), { w: 4 });
      c.eye(e1[0] - 6 * s, e1[1] + 7 * s, 14 * s, 18 * s, '#241c38');
      c.eye(e2[0] - 8 * s, e2[1] + 8 * s, 19 * s, 23 * s, '#241c38');
      stroke(h([[-182, -66], [-150, -74], [-120, -66]]), { w: 6.5 });
      stroke(h([[-76, -80], [-36, -90], [6, -80]]), { w: 7 });
      c.cheek(...H([48, 48]), 26 * s, 15 * s, PINK);
      shape(potato(...H([-268, 20]), 16 * s, 11 * s, 8, 0.05), NOSE, { over: 0 }, { w: 3 });
      stroke(h([[-270, 58], [-230, 64], [-190, 58], [-166, 40]]), { w: 5 });
      c.part('paupieres', { pivot: H([-90, -30]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 21 * s, 26 * s, CREAM);
        c.lid(e2[0], e2[1], 28 * s, 33 * s, FUR);
      });
    };
    // the fence it has been eating: a rail, two pickets, a bite out of the near one's top (scenery)
    c.part('barriere', { pivot: [260, 900], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      c.tint(potato(560, 1022, 440, 24, 12, 0.03), '#e2dccc', { wash: 0.9 });
      shape([[70, 870], [360, 860], [362, 900], [72, 912]], WOOD2, { angle: 10, over: 0.2 }, {}, false);
      shape([[110, 1020], [112, 836], [146, 796], [180, 836], [178, 1020]], WOOD, { angle: 90, over: 0.2 }, {}, false);
      shape([[220, 1020], [222, 846], [236, 832], [244, 852], [262, 860], [282, 850], [290, 834], [300, 846], [298, 1020]], WOOD, { angle: 90, over: 0.2 }, {}, false);
      stroke([[146, 860], [148, 1000]], { w: 3.5, col: WOOD2 });
      stroke([[260, 890], [262, 1000]], { w: 3.5, col: WOOD2 });
    });
    c.part('queue', { pivot: [900, 600], motion: 'swing', amp: 6, period: 1.6, behind: true }, () => {
      shape([[890, 610], [940, 530], [980, 520], [960, 570], [920, 630]], DEEP, { angle: 60, over: 0 });
    });
    // the far legs, darker: the front one planted, the hind one braced
    goatLeg(c, [[510, 780], [500, 880], [496, 950], [494, 984], [486, 1000]], [86, 56, 44, 38, 34], FAR, CREAM, 1);
    goatLeg(c, [[820, 760], [790, 846], [850, 890], [838, 970], [830, 1000]], [104, 66, 46, 38, 34], FAR, CREAM, 2);
    // the body: a lean waist and the haunch behind a deep rounded chest; a short thick neck up to the head
    shape(lineOfAction([[520, 680], [640, 660], [760, 646], [880, 652]], [230, 210, 200, 220], [20, 0, -10, 10]), FUR, { angle: 20, over: 0.4 });
    shape(potato(476, 690, 150, 150, 14, 0.03), FUR, { angle: 70, over: 0.4 });
    c.tint(potato(430, 730, 70, 90, 10, 0.05), DEEP, { angle: 70, wash: 0.35 });
    shape(c.band([[510, 640], [450, 550], [390, 470]], 240, 190), FUR, { angle: 70, over: 0.3 }, { w: 0.1 });
    stroke([[340, 560], [334, 620]], { w: 5 });
    c.tint(c.band([[630, 778], [760, 762]], 36, 28), CREAM, { angle: 10, wash: 0.8 });
    // the near hind leg: the round haunch, the stifle, the hock back high, the cannon down, the hoof planted
    openLimb(c, potato(856, 690, 96, 110, 10, 0.04), FUR, 2, 8);
    goatLeg(c, [[866, 750], [826, 850], [902, 892], [886, 974], [878, 1000]], [124, 76, 50, 40, 36], FUR, CREAM, 2);
    // the near front leg up on the fence: the elbow, the knee bent forward, the cannon down, the hoof on the bitten picket
    goatLeg(c, [[480, 730], [420, 806], [336, 772], [294, 800], [276, 808]], [130, 82, 58, 46, 40], FUR, CREAM, 2, -10);
    head(380, 462, 0.86, -6);
  },
} satisfies Redraw;
