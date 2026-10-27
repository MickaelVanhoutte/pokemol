import type { Redraw } from './crayon.ts';

/** A little ball of purple mist: a fuzzy scribbled cloud around a round face, red eyes, a big grin. */
export default {
  id: '009', slug: 'brumouille', seed: 909, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato, paper } = c;
    const PURPLE = '#7d45cf', MIST = '#b48ae8', RED = '#f04a40';
    // the mist all around, scribbled with no line
    c.tint(potato(500, 500, 420, 400, 16, 0.12), MIST, { gap: 6, w: 4.5, angle: 30, spill: 0, miss: 0.3, wash: 0 });
    c.tint(potato(500, 500, 350, 330, 14, 0.12), MIST, { gap: 5, angle: 120, spill: 0, miss: 0.25, wash: 0.1 });
    // the round body
    shape(potato(500, 500, 250, 240, 14, 0.04), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
    // slanted red eyes, a wide toothy grin
    shape([[340, 410], [460, 450], [450, 500], [380, 510], [345, 470]], RED, { angle: 90, over: 0 }, {}, false);
    shape([[660, 410], [540, 450], [550, 500], [620, 510], [655, 470]], RED, { angle: 90, over: 0 }, {}, false);
    stroke([[320, 390], [470, 440]], { w: 5.5 });
    stroke([[680, 390], [530, 440]], { w: 5.5 });
    paper([[360, 570], [500, 590], [640, 570], [600, 650], [500, 680], [400, 650]]);
    for (const x of [420, 470, 525, 580]) stroke([[x, 580], [x + 3, 670 - Math.abs(x - 500) * 0.4]], { w: 3.4 });
    stroke([[375, 610], [625, 612]], { w: 3.4 });
  },
} satisfies Redraw;
