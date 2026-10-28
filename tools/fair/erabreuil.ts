import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Érabreuil's fair copy, Grass/Fire, the same drawing grown up: its tail thicker with five bigger maple
 * leaves instead of four, the outer ones blazing with flames at their tips, a leaf tuft on each ear, a bigger
 * spikier ruff, a bigger acorn to throw, heavier brows over its fierce eyes, claws on its foot, and the gold star
 * on its cream belly.
 */
export default {
  id: '094', slug: 'erabreuil', seed: 94094, size: [1200, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const FUR = '#b5602e', DEEP = '#7c3f1e', CREAM = '#f4e2b4', CAP = '#7a4a24', NUT = '#d9a35c';
    const RED = '#d8452f', ORANGE = '#f08a2c', GOLD = '#f2c230', FLAME = '#e8401f', HOT = '#fff3b0';
    /** A maple leaf: five pointed lobes, its stalk at the bottom; s its size, a its turn in degrees. */
    const maple = (x: number, y: number, s: number, a: number): P[] => {
      const r = (a * Math.PI) / 180;
      return ([[0, 0.35], [-0.15, 0.25], [-0.45, 0.32], [-0.38, 0.18], [-0.75, 0.05], [-0.55, -0.02], [-0.7, -0.3], [-0.42, -0.25], [-0.38, -0.5],
        [-0.18, -0.38], [0, -0.85], [0.18, -0.38], [0.38, -0.5], [0.42, -0.25], [0.7, -0.3], [0.55, -0.02], [0.75, 0.05], [0.38, 0.18], [0.45, 0.32],
        [0.15, 0.25]] as P[]).map(([u, v]) => [x + (u * Math.cos(r) - v * Math.sin(r)) * s, y + (u * Math.sin(r) + v * Math.cos(r)) * s]);
    };
    const leaf = (x: number, y: number, s: number, a: number, col: string) => {
      const l = maple(x, y, s, a);
      shape(l, col, { angle: a + 70, over: 0.4 }, {}, false);
      for (const k of [10, 6, 14]) stroke([l[0], [l[k][0] * 0.75 + l[0][0] * 0.25, l[k][1] * 0.75 + l[0][1] * 0.25]], { w: 4 });
    };
    /** A flame rising from the tip of the leaf (x, y, s, a), leaning a little the way the leaf points; k its size. */
    const blaze = (x: number, y: number, s: number, a: number, k: number) => {
      const r = (a * Math.PI) / 180, tx = x + 0.78 * s * Math.sin(r), ty = y - 0.78 * s * Math.cos(r), lean = (a * 0.25 * Math.PI) / 180;
      const at = (f: number): P[] => ([[-0.45, 0], [-0.55, -0.4], [-0.25, -0.55], [-0.3, -0.85], [0, -0.6], [0.05, -1.05], [0.25, -0.6], [0.5, -0.8], [0.42, -0.35], [0.55, -0.1], [0.3, 0.12], [-0.2, 0.12]] as P[])
        .map(([u, v]) => [u * k * f, (v * f - (1 - f) * 0.1) * k * 1.5] as P)
        .map(([u, v]) => [tx + u * Math.cos(lean) - v * Math.sin(lean), ty + u * Math.sin(lean) + v * Math.cos(lean)]);
      shape(at(1), FLAME, { angle: 80, over: 0 });
      c.tint(at(0.66), GOLD, { angle: 80 });
      c.tint(at(0.34), HOT, { angle: 80 });
    };
    const LEAVES: [number, number, number, number, string][] = [
      [815, 665, 240, 118, RED], [900, 470, 250, 82, GOLD], [860, 300, 245, 50, ORANGE], [760, 238, 240, 20, RED], [618, 178, 212, -22, GOLD],
    ];
    // the huge tail of autumn leaves, thicker, five bigger leaves arching up behind, the outer ones blazing at their
    // tips: in battle it sways
    c.part('queue', { pivot: [640, 740], motion: 'swing', amp: 4, period: 2.6, behind: true }, () => {
      shape(band([[630, 750], [745, 640], [800, 470], [770, 320]], 136, 100), FUR, { angle: 60, over: 0.4 });
      for (const l of LEAVES) leaf(...l);
      for (const [i, k] of [[0, 72], [1, 84], [2, 84]]) blaze(LEAVES[i][0], LEAVES[i][1], LEAVES[i][2], LEAVES[i][3], k);
    });
    // the far leg and far arm, behind
    shape(band([[620, 760], [650, 860], [640, 920]], 72, 62), DEEP, { angle: 90, over: 0 });
    shape(band([[640, 520], [710, 610], [720, 690]], 56, 46), DEEP, { angle: 100, over: 0 });
    // the body standing tall, a bigger spikier ruff of cream fur, the gold star on its belly
    shape([[400, 440], [540, 405], [650, 470], [692, 620], [662, 780], [560, 842], [430, 832], [372, 700], [362, 545]], FUR, { angle: 82, over: 0.6 });
    shape(potato(495, 695, 95, 122, 10, 0.05), CREAM, { over: 0 });
    c.star(500, 715, 46, -6);
    shape(spikes([[340, 462], [425, 600], [565, 612], [632, 462]], 4, 58).concat([[560, 430], [420, 440]]), CREAM, { over: 0 }, {}, false);
    // the near leg, strong, its foot planted, claws out
    shape(potato(575, 795, 100, 84, 10, 0.05), FUR, { angle: 60, over: 0.4 });
    for (let i = -1; i <= 1; i++) shape([[452, 892 + i * 18], [404, 900 + i * 26], [452, 908 + i * 18]], '#ffffff', { over: 0 }, { w: 4 }, false);
    shape(band([[548, 870], [448, 905]], 62, 54), FUR, { angle: 0, over: 0 });
    // ears, each with a leaf tuft now, the head
    shape([[290, 240], [255, 70], [345, 200]], FUR, { angle: 70 }, {}, false);
    shape([[420, 210], [485, 40], [510, 225]], FUR, { angle: 110 }, {}, false);
    leaf(255, 70, 76, -25, ORANGE);
    leaf(485, 48, 88, 12, RED);
    shape(potato(375, 340, 154, 134, 12, 0.05), FUR, { angle: 80, over: 0.5 });
    // its acorn-cap helmet
    shape([[240, 285], [270, 205], [370, 165], [480, 180], [535, 245], [520, 285], [380, 268]], CAP, { angle: 10, over: 0.3 });
    for (let k = 0; k < 5; k++) {
      stroke([[270 + k * 55, 270 - k * 4], [320 + k * 50, 190]], { w: 3.5 });
      stroke([[300 + k * 50, 190], [250 + k * 55, 268 - k * 2]], { w: 3.5 });
    }
    stroke([[380, 168], [392, 120]], { w: 8 });
    c.shine([[300, 222], [350, 196]], 6);
    // puffy cheeks, fierce eyes under heavy brows (the far one smaller), buck teeth bared in a snarl
    shape(potato(300, 405, 68, 50, 9, 0.05), CREAM, { over: 0 });
    c.paper(potato(305, 327, 24, 22, 8, 0.04));
    c.paper(potato(405, 320, 30, 27, 8, 0.04));
    dot(301, 332, 12, 13);
    dot(399, 326, 15, 16);
    dot(296, 325, 4, 4, '#ffffff');
    dot(393, 318, 5, 5, '#ffffff');
    stroke([[262, 286], [336, 312]], { w: 12 });
    stroke([[364, 304], [446, 274]], { w: 12 });
    dot(250, 380, 15, 12);
    shape([[252, 398], [352, 426], [330, 458], [276, 452]], '#5a2430', { over: 0 }, { w: 5 });
    c.paper([[268, 404], [298, 412], [296, 440], [270, 432]], { w: 3.5 }, false);
    c.paper([[302, 413], [330, 420], [326, 446], [300, 441]], { w: 3.5 }, false);
    // the near arm raising an acorn, bigger: in battle it throws it at the foe, and has another one in its paw
    const toss = { period: 3.6, phase: 0 };
    c.part('bras', { pivot: [430, 525], motion: 'nod', amp: -18, ...toss }, () => {
      shape(band([[432, 525], [330, 560], [250, 500]], 66, 56), FUR, { angle: 30, over: 0.3 });
      shape(potato(262, 488, 32, 28, 8, 0.06), FUR, { over: 0 });
    });
    c.part('noisette', { pivot: [212, 450], motion: 'throw', to: [-330, -20], shrink: 0.85, ...toss }, () => {
      shape(potato(212, 468, 68, 80, 9, 0.04), NUT, { angle: 90, over: 0.3 });
      shape([[140, 450], [150, 396], [212, 372], [276, 396], [284, 450], [212, 438]], CAP, { angle: 0, over: 0 });
      stroke([[164, 405], [256, 445]], { w: 3.5 });
      stroke([[262, 405], [168, 442]], { w: 3.5 });
      stroke([[212, 372], [220, 334]], { w: 6 });
      c.shine([[176, 480], [180, 520]], 7);
    });
  },
} satisfies Fair;
