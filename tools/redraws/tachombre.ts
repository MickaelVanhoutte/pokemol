import type { Redraw } from './crayon.ts';

/**
 * Tachou grown into a great splash of ink, rearing up to the left: a spiky splattered crown, a gold pen nib
 * on its brow, glowing yellow eyes, a jagged grin, long dripping arms with splash claws.
 */
export default {
  id: '097', slug: 'tachombre', seed: 9701, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const INK = '#1f2a6e', SHEEN = '#5a4fcf', GOLD = '#f2c230', YEL = '#f6d23a';
    // splashes round it
    for (const [x, y, r] of [[150, 260, 22], [120, 340, 12], [880, 200, 18], [910, 280, 10], [860, 620, 16], [160, 760, 14]] as const) {
      shape(potato(x, y, r, r * 0.9, 7, 0.12), INK, { over: 0, press: 1.2 }, { w: 3.5 });
    }
    // the far arm, behind: in battle it sways
    c.part('bras-loin', { pivot: [660, 480], motion: 'swing', amp: 7, period: 2.3, behind: true }, () => {
      shape(band([[650, 480], [770, 430], [850, 340]], 74, 44), INK, { angle: 40, press: 1.2 });
      shape([[830, 360], [850, 260], [870, 330], [920, 275], [890, 360], [940, 380], [870, 390]], INK, { angle: 40, press: 1.2, over: 0 }, {}, false);
    });
    // the splash: spikes on top, drips underneath
    shape([[300, 390], [255, 265], [340, 305], [362, 160], [432, 262], [500, 98], [560, 252], [642, 168], [662, 302], [745, 238], [722, 390], [742, 525],
      [702, 645], [692, 765], [662, 865], [632, 785], [592, 825], [562, 935], [532, 825], [482, 795], [442, 885], [415, 795], [362, 765], [322, 645],
      [292, 525]], INK, { angle: 70, over: 0.8, press: 1.25 }, {}, false);
    tint(potato(540, 580, 120, 165, 10, 0.08), SHEEN, { gap: 3.6 });
    paper(potato(640, 360, 26, 14, 7, 0.06));
    // a gold pen nib on its brow
    shape([[452, 335], [438, 262], [482, 158], [526, 262], [512, 335]], GOLD, { angle: 90, over: 0, press: 1.1 }, {}, false);
    stroke([[482, 190], [482, 300]], { w: 4 });
    dot(482, 300, 9, 9);
    // glowing yellow eyes, angry, the far one narrower
    shape([[352, 400], [420, 410], [418, 450], [384, 462], [356, 440]], YEL, { over: 0, press: 1.2 }, {}, false);
    shape([[470, 408], [588, 392], [584, 446], [534, 472], [482, 456]], YEL, { over: 0, press: 1.2 }, {}, false);
    dot(392, 432, 10, 14);
    dot(530, 428, 13, 17);
    stroke([[340, 386], [428, 404]], { w: 6, col: '#f1e6ee' });
    stroke([[462, 400], [600, 378]], { w: 6, col: '#f1e6ee' });
    // a jagged grin
    paper(potato(460, 548, 118, 46, 12, 0.04));
    for (const x of [380, 425, 470, 515]) stroke([[x, 512], [x + 18, 548], [x + 36, 512]], { w: 3.4 }, false);
    for (const x of [395, 440, 485]) stroke([[x, 590], [x + 18, 556], [x + 36, 590]], { w: 3.4 }, false);
    // the near arm thrown forward, splash claws: in battle it sways
    c.part('bras', { pivot: [340, 540], motion: 'swing', amp: 9, period: 1.7 }, () => {
      shape(band([[345, 540], [235, 580], [148, 545], [100, 470]], 74, 46), INK, { angle: 20, press: 1.2 });
      shape([[125, 485], [60, 430], [100, 470], [40, 470], [92, 498], [55, 540], [128, 510]], INK, { angle: 20, press: 1.2, over: 0 }, {}, false);
    });
    // only in battle: drops fall from it
    c.part('gouttes', { pivot: [560, 900], motion: 'flicker', period: 2.4, extra: true }, () => {
      for (const [x, y] of [[562, 975], [442, 950], [662, 930]] as const) shape([[x, y - 26], [x + 16, y + 2], [x, y + 14], [x - 16, y + 2]], INK, { over: 0, press: 1.2 }, { w: 3.5 });
    });
  },
} satisfies Redraw;
