import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Gommichon's fair copy, Normal/Fighting, the same drawing grown up: a bigger, sturdier eraser puppy, both its
 * fists up now and twice as big, wrapped in white tape, its floppy ears longer and swept back, a wider paper
 * sleeve, crumbs flying round it, determined brows and a wide grin, and the gold star drawn on its sleeve.
 */
export default {
  id: '110', slug: 'gommichon', seed: 110110, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const PINK = '#f7b2c4', DEEP = '#e8879f', SLEEVE = '#5b8fe8', CHEEK = '#f27f9c';
    const fist = (x: number, y: number, r: number) => {
      shape(potato(x, y, r, r * 0.92, 10, 0.06), PINK, { angle: 60, over: 0.3 });
      shape([[x - r * 0.25, y - r * 0.85], [x + r * 0.55, y - r * 0.75], [x + r * 0.6, y + r * 0.75], [x - r * 0.2, y + r * 0.85]], '#ffffff', { over: 0, wash: 1 }, { w: 3.5 }, false);
      stroke([[x - r * 0.22, y - r * 0.3], [x + r * 0.57, y - r * 0.25]], { w: 3 });
      stroke([[x - r * 0.22, y + r * 0.25], [x + r * 0.58, y + r * 0.28]], { w: 3 });
    };
    // the far ear swept back, the far fist up in guard, a little tail
    shape([[220, 280], [110, 300], [60, 400], [100, 450], [200, 380]], DEEP, { angle: 70 });
    c.part('garde', { pivot: [470, 640], motion: 'nod', amp: 6, period: 1.2, behind: true }, () => {
      shape(band([[470, 640], [300, 660], [150, 620]], 62, 56), DEEP, { angle: 20 });
      fist(110, 590, 66);
    });
    c.part('queue', { pivot: [840, 560], motion: 'swing', amp: 18, period: 1, behind: true }, () => {
      shape(potato(885, 535, 48, 40, 8, 0.08), PINK, { angle: 40 });
    });
    // stubby legs, the far ones behind
    shape(potato(500, 855, 58, 50, 8, 0.06), DEEP, { angle: 90 });
    shape(potato(810, 835, 56, 48, 8, 0.06), DEEP, { angle: 90 });
    // the body, a bigger soft eraser block
    const body: P[] = [[420, 460], [600, 435], [790, 440], [870, 515], [878, 710], [835, 815], [645, 845], [465, 845], [400, 750]];
    shape(body, PINK, { angle: 80, over: 0.45 });
    // a wider paper sleeve, the gold star drawn on it
    shape([[545, 438], [715, 436], [728, 838], [560, 846]], SLEEVE, { angle: 0, over: 0.3 }, {}, false);
    c.star(636, 640, 54, -6);
    // the near legs
    shape(potato(585, 870, 62, 52, 8, 0.06), PINK, { angle: 90 });
    shape(potato(775, 870, 62, 52, 8, 0.06), PINK, { angle: 90 });
    // the head, its top rubbed flat
    const head: P[] = [[160, 335], [245, 240], [445, 230], [540, 295], [555, 505], [495, 600], [245, 615], [155, 535]];
    shape(head, PINK, { angle: 78, over: 0.45 });
    stroke([[195, 298], [232, 262]], { w: 3.5 });
    stroke([[210, 318], [256, 278]], { w: 3.5 });
    // the near floppy ear, longer, swept back
    shape([[440, 245], [560, 240], [660, 330], [670, 470], [590, 470], [520, 350]], DEEP, { angle: 70 });
    // big round eyes under determined brows, cheeks, a nose and a wide grin
    for (const [x, y, rx, ry] of [[255, 412, 34, 42], [405, 402, 46, 54]] as const) {
      shape(potato(x, y, rx, ry, 10, 0.03), '#3a3050', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - rx * 0.3, y - ry * 0.35, rx * 0.34, ry * 0.28, '#ffffff');
      dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
    }
    stroke([[218, 352], [292, 368]], { w: 8 });
    stroke([[362, 344], [452, 336]], { w: 8 });
    shape(potato(205, 498, 30, 18, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(485, 492, 38, 22, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(325, 480, 20, 14, 7, 0.06), '#c45a78', { over: 0 }, { w: 3.5 });
    shape([[278, 515], [380, 512], [362, 550], [300, 552]], '#c0405a', { over: 0 }, { w: 4.5 });
    shape([[296, 518], [362, 516], [356, 528], [300, 530]], '#ffffff', { over: 0, wash: 1 }, { w: 0.1 });
    // the near fist, twice as big: in battle it jabs
    c.part('poing', { pivot: [480, 700], motion: 'reach', amp: -20, period: 1.2 }, () => {
      shape(band([[490, 700], [400, 712], [330, 700]], 70, 62), PINK, { angle: 20 });
      fist(285, 690, 72);
    });
    // eraser crumbs flying round it
    for (const [x, y] of [[180, 880], [240, 910], [900, 880], [940, 850], [860, 925], [120, 700], [950, 640]] as const) {
      shape([[x - 18, y], [x - 7, y - 11], [x + 16, y - 7], [x + 18, y + 7], [x - 4, y + 11]], PINK, { over: 0 }, { w: 3 });
    }
    c.shine([[200, 300], [230, 270]], 6);
  },
} satisfies Fair;
