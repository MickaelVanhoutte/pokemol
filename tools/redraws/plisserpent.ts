import type { P, Redraw } from './crayon.ts';
import { star } from './lumignon.ts';
import { DRAGON, accordion, charm, flower, horn } from './plissou.ts';

/**
 * Plissou grown long: a fairy paper dragon turned to the left, its accordion body curving in an S, pearl, gold and
 * rose folds with paper flowers and little stars along its back, two pairs of little legs, a longer head held
 * high with a striped unicorn horn, a flower by its ear, a scalloped mane and long ribbon whiskers floating round it.
 */
export default {
  id: '085', slug: 'plisserpent', seed: 8501, size: [1200, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const { BODY, MANE, ACCENT, CREAM, STAR, DEEP, LEG_FAR, HORN, STRIPE } = DRAGON;
    // the far legs, behind the body
    shape(band([[880, 640], [900, 760]], 46, 40), LEG_FAR, { angle: 90, over: 0 });
    shape(band([[560, 600], [560, 720]], 46, 40), LEG_FAR, { angle: 90, over: 0 });
    // the long S of folds, tail first, little stars along its back, a star charm at its tail
    const body: P[] = [[1120, 300], [1090, 470], [960, 610], [770, 650], [610, 590], [510, 470], [440, 380]];
    accordion(c, body, 12, 110, 170, [BODY, MANE, ACCENT], (k, [x, y], w) => {
      if (k % 3 === 1) flower(c, x + 6, y - w / 2 - 6, 34, [BODY, ACCENT, MANE][((k / 3) | 0) % 3] === BODY ? ACCENT : BODY, STAR);
      if (k % 3 === 2) shape(star(x + 4, y - w / 2 - 10, 20, k * 0.3), STAR, { over: 0 }, { w: 2.5 }, false);
    });
    charm(c, 1120, 300, 1.15, STAR, BODY);
    // the near legs, cream paws
    for (const [x0, y0, x1, y1] of [[930, 650, 950, 780], [620, 610, 610, 740]] as const) {
      shape(band([[x0, y0], [x1, y1]], 52, 46), MANE, { angle: 90, over: 0 });
      shape(potato(x1 - 6, y1 + 12, 40, 22, 7, 0.06), CREAM, { over: 0 });
    }
    // the scalloped mane and the far horn, behind the head
    const mane: P[] = [];
    for (let k = 0; k <= 10; k++) { const a = -1.8 + k * 0.32, r = k % 2 ? 215 : 245; mane.push([330 + Math.cos(a) * r, 330 + Math.sin(a) * r]); }
    shape([...mane, [330, 330]], MANE, { angle: 60, over: 0 });
    // long ribbon whiskers floating behind and round
    shape(band([[150, 360], [80, 330], [40, 380], [60, 450], [30, 520]], 24, 12), ACCENT, { over: 0 }, { w: 3 });
    // the head held high: longer snout, cream muzzle, rosy cheek
    shape([[110, 340], [160, 260], [280, 200], [420, 200], [490, 280], [480, 400], [400, 450], [260, 460], [140, 430], [90, 390]], BODY, { angle: 75, over: 0.5 });
    shape([[80, 360], [140, 320], [280, 350], [310, 420], [250, 470], [130, 460], [80, 420]], CREAM, { angle: 80, over: 0.2 }, { w: 4 });
    c.tint(potato(390, 400, 34, 22, 8, 0.1), DEEP, { gap: 3 });
    dot(108, 365, 8, 6);
    dot(150, 352, 8, 6);
    stroke([[120, 430], [180, 445], [240, 428]], { w: 4.5 });
    shape(band([[120, 420], [60, 450], [40, 520], [80, 580], [60, 640]], 24, 12), BODY, { over: 0 }, { w: 3 });
    // a longer unicorn horn on its brow, a paper flower by its ear
    horn(c, [270, 215], [235, 60], 56, HORN, STRIPE);
    flower(c, 420, 205, 52, ACCENT, STAR);
    // starry eyes with lashes
    c.paper(potato(240, 285, 30, 30, 8, 0.05));
    c.paper(potato(345, 275, 34, 34, 8, 0.05));
    dot(232, 292, 15, 18, '#5a3f8a');
    dot(337, 283, 17, 20, '#5a3f8a');
    shape(star(226, 283, 8, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    shape(star(330, 273, 9, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    for (const [x0, y0, x1, y1] of [[212, 262, 198, 246], [228, 256, 222, 238], [318, 248, 306, 230], [338, 242, 334, 222]] as const) stroke([[x0, y0], [x1, y1]], { w: 3.5 });
    stroke([[430, 240], [450, 330], [430, 420]], { w: 3, col: DEEP });
    // sparkles round it
    for (const [x, y, r] of [[80, 220, 20], [560, 140, 18], [1150, 560, 18], [300, 760, 16]] as const) shape(star(x, y, r, 0.4), STAR, { over: 0 }, { w: 2.5 }, false);
  },
} satisfies Redraw;
