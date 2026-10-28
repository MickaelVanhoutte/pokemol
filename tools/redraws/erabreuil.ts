import type { P, Redraw } from './crayon.ts';

/**
 * Érabou grown up and come into its autumn: a big squirrel standing tall, turned to the left, an acorn cap for a
 * helmet, a ruff of cream fur, a huge tail of red, orange and gold maple leaves, an acorn raised to throw.
 */
export default {
  id: '094', slug: 'erabreuil', seed: 9402, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const FUR = '#b5602e', DEEP = '#7c3f1e', CREAM = '#f4e2b4', CAP = '#7a4a24', NUT = '#d9a35c';
    const RED = '#d8452f', ORANGE = '#f08a2c', GOLD = '#f2c230';
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
      for (const k of [10, 6, 14]) stroke([l[0], [l[k][0] * 0.75 + l[0][0] * 0.25, l[k][1] * 0.75 + l[0][1] * 0.25]], { w: 3 });
    };
    // the huge tail of autumn leaves, arching up behind: in battle it sways
    c.part('queue', { pivot: [640, 740], motion: 'swing', amp: 4, period: 2.6, behind: true }, () => {
      shape(band([[630, 750], [740, 640], [790, 470], [760, 330]], 120, 90), FUR, { angle: 60, over: 0.4 });
      leaf(800, 640, 210, 110, RED);
      leaf(850, 430, 230, 70, ORANGE);
      leaf(770, 240, 240, 25, GOLD);
      leaf(620, 150, 200, -20, RED);
    });
    // the far leg and far arm, behind
    shape(band([[620, 760], [650, 860], [640, 920]], 70, 60), DEEP, { angle: 90, over: 0 });
    shape(band([[640, 520], [710, 610], [720, 690]], 54, 44), DEEP, { angle: 100, over: 0 });
    // the body standing tall, a ruff of cream fur
    shape([[400, 440], [540, 405], [650, 470], [692, 620], [662, 780], [560, 842], [430, 832], [372, 700], [362, 545]], FUR, { angle: 82, over: 0.6 });
    shape(potato(495, 690, 92, 120, 10, 0.05), CREAM, { over: 0 });
    shape(spikes([[350, 470], [430, 590], [560, 600], [620, 470]], 3, 46).concat([[560, 430], [420, 440]]), CREAM, { over: 0 }, {}, false);
    // the near leg, strong, its foot planted
    shape(potato(575, 795, 98, 82, 10, 0.05), FUR, { angle: 60, over: 0.4 });
    shape(band([[548, 870], [448, 905]], 60, 52), FUR, { angle: 0, over: 0 });
    // ears with leaf tufts, the head
    shape([[290, 240], [255, 70], [345, 200]], FUR, { angle: 70 }, {}, false);
    shape([[420, 210], [485, 40], [510, 225]], FUR, { angle: 110 }, {}, false);
    leaf(485, 52, 70, 10, RED);
    shape(potato(375, 340, 152, 132, 12, 0.05), FUR, { angle: 80, over: 0.5 });
    // its acorn-cap helmet
    shape([[240, 285], [270, 205], [370, 165], [480, 180], [535, 245], [520, 285], [380, 268]], CAP, { angle: 10, over: 0.3 });
    for (let k = 0; k < 5; k++) {
      stroke([[270 + k * 55, 270 - k * 4], [320 + k * 50, 190]], { w: 3 });
      stroke([[300 + k * 50, 190], [250 + k * 55, 268 - k * 2]], { w: 3 });
    }
    stroke([[380, 168], [392, 120]], { w: 7 });
    // puffy cheeks, fierce eyes (the far one smaller), teeth bared in a grin
    shape(potato(300, 405, 66, 48, 9, 0.05), CREAM, { over: 0 });
    c.paper(potato(305, 325, 24, 26, 8, 0.04));
    c.paper(potato(405, 318, 30, 32, 8, 0.04));
    dot(300, 331, 13, 16);
    dot(398, 324, 16, 19);
    dot(295, 322, 4, 5, '#ffffff');
    dot(392, 315, 5, 6, '#ffffff');
    stroke([[268, 290], [330, 306]], { w: 7 });
    stroke([[370, 298], [440, 280]], { w: 7 });
    dot(250, 380, 14, 11);
    stroke([[255, 395], [290, 432], [345, 430]], { w: 4.5 });
    c.paper([[270, 416], [300, 428], [298, 452], [272, 446]], { w: 3 }, false);
    // the near arm raising an acorn: in battle it throws it at the foe, and has another one in its paw
    const toss = { period: 3.6, phase: 0 };
    c.part('bras', { pivot: [430, 525], motion: 'nod', amp: -18, ...toss }, () => {
      shape(band([[432, 525], [330, 560], [250, 500]], 62, 52), FUR, { angle: 30, over: 0.3 });
      shape(potato(262, 488, 30, 26, 8, 0.06), FUR, { over: 0 });
    });
    c.part('noisette', { pivot: [215, 455], motion: 'throw', to: [-330, -20], shrink: 0.85, ...toss }, () => {
      shape(potato(215, 470, 54, 64, 9, 0.04), NUT, { angle: 90, over: 0.3 });
      shape([[158, 455], [165, 412], [215, 392], [268, 412], [274, 455], [215, 445]], CAP, { angle: 0, over: 0 });
      stroke([[176, 420], [250, 450]], { w: 3 });
      stroke([[255, 420], [180, 448]], { w: 3 });
      stroke([[215, 392], [222, 362]], { w: 5 });
    });
    // only in battle: leaves come off its tail and drift
    c.part('feuilles', { pivot: [500, 500], motion: 'flicker', period: 2.6, extra: true }, () => {
      leaf(140, 230, 70, -30, ORANGE);
      leaf(900, 820, 64, 40, RED);
      leaf(260, 860, 58, 15, GOLD);
    });
  },
} satisfies Redraw;
