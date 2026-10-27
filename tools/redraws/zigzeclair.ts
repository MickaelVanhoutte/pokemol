import type { P, Redraw } from './crayon.ts';

/**
 * Zigzou grown: a chubby orange mouse turned to the left, long ears curling at the tips, yellow cheeks,
 * a long black whip of a tail ending in a big lightning bolt, sparks crackling round its paws.
 */
export default {
  id: '027', slug: 'zigzeclair', seed: 2701, size: [1100, 1100], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const ORANGE = '#f39a2b', CREAM = '#f8e2a4', YEL = '#f7dc35', BROWN = '#8a5326', BLACK = '#35303a';
    const bolt = (x: number, y: number, s: number): P[] =>
      [[x, y], [x + 16 * s, y - 42 * s], [x + 4 * s, y - 40 * s], [x + 26 * s, y - 86 * s], [x - 8 * s, y - 30 * s], [x + 6 * s, y - 32 * s]];
    // the long black tail behind, raised in an arc, a big lightning bolt at its tip
    c.part('queue', { pivot: [640, 830], motion: 'swing', amp: 5, period: 1.4, behind: true }, () => {
      shape(band([[640, 830], [780, 820], [880, 740], [930, 620], [915, 500], [940, 400]], 36, 24), BLACK, { angle: 60 });
      shape([[905, 420], [960, 300], [925, 292], [1010, 160], [1075, 70], [1040, 210], [1080, 222], [985, 400]], YEL, { angle: 40, press: 1.1 }, {}, false);
    });
    // the far ear, curling out at the tip, and the far arm raised behind
    shape([[300, 330], [235, 180], [205, 85], [250, 70], [320, 150], [400, 290]], ORANGE, { angle: 70 }, {}, false);
    shape([[300, 300], [250, 170], [240, 110], [300, 190], [350, 290]], BROWN, { over: 0 }, { w: 3.5 }, false);
    shape(band([[215, 82], [165, 65], [130, 95], [150, 135], [190, 125]], 34, 14), ORANGE, { angle: 30, over: 0 });
    shape(band([[370, 640], [280, 560], [240, 460]], 62, 54), ORANGE, { angle: 60 });
    shape(potato(235, 440, 36, 32, 8, 0.08), BROWN, { over: 0 });
    // far foot, the chubby body and its cream belly, near foot
    shape(potato(420, 1000, 100, 42, 8, 0.06), ORANGE, { angle: 10 });
    shape([[340, 560], [500, 520], [650, 560], [730, 720], [710, 890], [610, 985], [440, 995], [330, 905], [295, 740]], ORANGE, { angle: 85, over: 0.55 });
    shape(potato(470, 790, 120, 150, 10, 0.05), CREAM, { over: 0 });
    shape(potato(650, 1010, 110, 46, 8, 0.06), ORANGE, { angle: 10 });
    // the near arm up, sparks round its paw
    shape(band([[650, 650], [760, 570], [810, 470]], 64, 56), ORANGE, { angle: 120 });
    shape(potato(820, 450, 38, 34, 8, 0.08), BROWN, { over: 0 });
    c.part('etincelles', { pivot: [500, 400], motion: 'flicker', period: 1.8 }, () => {
      for (const [x, y, s] of [[760, 420, 0.9], [860, 380, 0.8], [880, 500, 0.7], [190, 400, 0.8], [270, 380, 0.7]] as const) shape(bolt(x, y, s), YEL, { over: 0 }, { w: 3.5 }, false);
    });
    // the near ear, long, brown inside, curling out at the tip
    shape([[470, 300], [600, 140], [690, 55], [715, 110], [630, 260], [580, 340]], ORANGE, { angle: 110 }, {}, false);
    shape([[525, 280], [625, 150], [675, 105], [615, 245], [570, 310]], BROWN, { over: 0 }, { w: 3.5 }, false);
    shape(band([[700, 62], [750, 40], [790, 75], [770, 115], [735, 105]], 34, 14), ORANGE, { angle: 150, over: 0 });
    // the head turned left, a yellow cheek, a sure grin with one fang
    shape(potato(440, 420, 195, 160, 12, 0.05), ORANGE, { angle: 80, over: 0.5 });
    shape(potato(570, 485, 44, 36, 8, 0.1), YEL, { over: 0, press: 1.1 }, { w: 3.5 });
    c.paper(potato(345, 395, 20, 27, 8, 0.05));
    c.paper(potato(470, 390, 25, 30, 8, 0.05));
    dot(340, 402, 11, 17);
    dot(463, 397, 14, 19);
    dot(334, 390, 4, 5, '#ffffff');
    dot(456, 384, 5, 6, '#ffffff');
    stroke([[305, 352], [365, 370]], { w: 6 });
    stroke([[440, 360], [510, 342]], { w: 6.5 });
    dot(265, 440, 9, 7);
    stroke([[290, 488], [345, 515], [410, 500], [440, 478]], { w: 5 });
    c.paper([[345, 513], [356, 540], [368, 512]], { w: 3.5 }, false);
  },
} satisfies Redraw;
