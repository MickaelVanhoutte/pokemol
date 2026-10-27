import type { Redraw } from './crayon.ts';

/** Dormipsy grown: standing tall to the left, a red star on its brow, long whiskers, a bent spoon held up. */
export default {
  id: '052', slug: 'cuillipsy', seed: 5201, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const YELLOW = '#f0bd3c', BROWN = '#9a5a2c', RED = '#e2423a', SILVER = '#b8c2d0';
    // tail behind, the far leg and the far ear
    shape(band([[600, 760], [760, 760], [850, 660], [820, 560]], 66, 36), YELLOW, { angle: 40 });
    shape(band([[440, 740], [420, 850], [400, 930]], 66, 60), YELLOW, { angle: 90 });
    shape([[340, 270], [270, 80], [420, 230]], YELLOW, { angle: 70 }, {}, false);
    // the body with its brown chest plate
    shape([[380, 450], [520, 420], [640, 470], [660, 640], [610, 780], [430, 790], [370, 650]], YELLOW, { angle: 85, over: 0.5 });
    shape([[400, 470], [520, 450], [610, 490], [600, 620], [510, 660], [410, 620]], BROWN, { angle: 80, press: 1.05, over: 0.3 });
    // the near leg
    shape(band([[560, 760], [580, 860], [590, 935]], 72, 66), YELLOW, { angle: 90 });
    shape(potato(610, 940, 60, 26, 8, 0.06), YELLOW, { over: 0 });
    // the near arm raised, holding a bent spoon
    shape(band([[620, 520], [720, 470], [760, 380]], 56, 48), YELLOW, { angle: 120 });
    shape(potato(765, 365, 34, 32, 8, 0.08), YELLOW, { over: 0 });
    shape(band([[775, 345], [790, 260], [830, 210]], 18, 16), SILVER, { angle: 90, over: 0 });
    shape(potato(845, 180, 38, 50, 9, 0.05), SILVER, { angle: 60, over: 0 });
    // the near ear
    shape([[480, 220], [610, 50], [570, 270]], YELLOW, { angle: 110 }, {}, false);
    // the head turned left, a star on the brow, long whiskers, narrowed eyes
    shape([[250, 320], [310, 220], [450, 190], [570, 240], [600, 340], [550, 420], [420, 450], [310, 430], [220, 380], [210, 345]], YELLOW, { angle: 80, over: 0.5 });
    shape([[400, 230], [420, 260], [452, 262], [428, 282], [438, 314], [410, 296], [382, 314], [392, 282], [368, 262], [400, 262]], RED, { over: 0, press: 1.1 }, { w: 3.5 }, false);
    c.paper(potato(320, 330, 22, 16, 8, 0.05));
    c.paper(potato(450, 325, 32, 20, 8, 0.05));
    dot(318, 332, 9, 10);
    dot(445, 328, 12, 12);
    stroke([[290, 310], [345, 318]], { w: 5 });
    stroke([[410, 312], [490, 305]], { w: 5.5 });
    dot(222, 360, 9, 7);
    stroke([[240, 395], [290, 402], [330, 395]], { w: 4.5 });
    stroke([[260, 380], [170, 420], [130, 500]], { w: 4 });
    stroke([[300, 390], [230, 450], [210, 530]], { w: 4 });
  },
} satisfies Redraw;
