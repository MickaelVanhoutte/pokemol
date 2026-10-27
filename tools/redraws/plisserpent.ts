import type { P, Redraw } from './crayon.ts';
import { accordion, tassel } from './plissou.ts';

/**
 * Plissou grown long: a paper dragon turned to the left, its accordion body curving in an S, red and gold folds
 * with pompoms along its back, two pairs of little legs, a longer head held high with curling gold horns, a gold
 * mane and long ribbon whiskers floating round it.
 */
export default {
  id: '085', slug: 'plisserpent', seed: 8501, size: [1200, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const RED = '#e2423a', GOLD = '#f2c43a', PINK = '#f29ac8', BLUE = '#6fb6ee', DARK = '#a8302a';
    const POMS = [PINK, BLUE, '#f7dc35'];
    // the far legs, behind the body
    shape(band([[880, 640], [900, 760]], 46, 40), DARK, { angle: 90, over: 0 });
    shape(band([[560, 600], [560, 720]], 46, 40), DARK, { angle: 90, over: 0 });
    // the long S of folds, tail first, pompoms along its back
    const body: P[] = [[1120, 300], [1090, 470], [960, 610], [770, 650], [610, 590], [510, 470], [440, 380]];
    accordion(c, body, 12, 110, 170, [RED, GOLD], (k, [x, y], w) => {
      if (k % 3 === 1) shape(potato(x + 6, y - w / 2 - 6, 24, 22, 9, 0.14), POMS[((k / 3) | 0) % 3], { over: 0 }, { w: 3 });
    });
    tassel(c, 1130, 270, 1.15, GOLD, '#f7a12b');
    // the near legs, gold claws
    for (const [x0, y0, x1, y1] of [[930, 650, 950, 780], [620, 610, 610, 740]] as const) {
      shape(band([[x0, y0], [x1, y1]], 52, 46), RED, { angle: 90, over: 0 });
      shape(potato(x1 - 6, y1 + 12, 40, 22, 7, 0.06), GOLD, { over: 0 });
    }
    // the gold mane and the far horn, behind the head
    shape(spikes([[440, 470], [540, 380], [540, 240], [450, 150]], 3, 46).concat([[380, 260]]), GOLD, { angle: 60, over: 0 }, {}, false);
    shape(band([[400, 170], [460, 90], [430, 30], [480, 10]], 34, 18), GOLD, { angle: 90, over: 0 });
    // long ribbon whiskers floating behind and round
    shape(band([[150, 360], [80, 330], [40, 380], [60, 450], [30, 520]], 24, 12), PINK, { over: 0 }, { w: 3 });
    // the head held high: longer snout, gold muzzle
    shape([[110, 340], [160, 260], [280, 200], [420, 200], [490, 280], [480, 400], [400, 450], [260, 460], [140, 430], [90, 390]], RED, { angle: 75, over: 0.5 });
    shape([[80, 360], [140, 320], [280, 350], [310, 420], [250, 470], [130, 460], [80, 420]], GOLD, { angle: 80, over: 0.2 }, { w: 4 });
    dot(108, 365, 9, 7);
    dot(150, 352, 9, 7);
    stroke([[120, 430], [180, 445], [240, 428]], { w: 4.5 });
    shape(band([[120, 420], [60, 450], [40, 520], [80, 580], [60, 640]], 24, 12), BLUE, { over: 0 }, { w: 3 });
    // the near horn curling back
    shape(band([[320, 210], [320, 120], [380, 70], [430, 90]], 40, 20), GOLD, { angle: 90, over: 0 });
    // keen eyes with gold lids
    c.paper(potato(240, 285, 30, 30, 8, 0.05));
    c.paper(potato(345, 275, 34, 34, 8, 0.05));
    dot(232, 292, 15, 18);
    dot(337, 283, 17, 20);
    dot(226, 282, 5, 6, '#ffffff');
    dot(330, 272, 6, 7, '#ffffff');
    stroke([[200, 250], [245, 244], [282, 258]], { w: 6, col: '#c48a1a' });
    stroke([[305, 240], [350, 230], [392, 246]], { w: 6, col: '#c48a1a' });
    stroke([[430, 240], [450, 330], [430, 420]], { w: 3, col: DARK });
  },
} satisfies Redraw;
