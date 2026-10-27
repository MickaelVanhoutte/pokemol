import type { Redraw } from './crayon.ts';

/** Chapardou grown: a sleek dark panther prowling to the left, a red gem on its brow, a long curling tail, slit eyes. */
export default {
  id: '055', slug: 'pantharuse', seed: 5501, size: [1100, 900], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const DARK = '#4a3f6e', LIGHT = '#8a80b0', RED = '#e2423a', GOLD = '#f2c43a';
    // the far legs, behind
    shape(band([[360, 560], [330, 700], [320, 830]], 58, 50), DARK, { angle: 90 });
    shape(band([[760, 560], [790, 700], [800, 830]], 58, 50), DARK, { angle: 90 });
    // the long tail curling up behind
    c.part('queue', { pivot: [850, 500], motion: 'swing', amp: 10, period: 1.8, behind: true }, () => {
      shape(band([[850, 500], [960, 460], [1020, 360], [990, 270], [930, 290]], 44, 26), DARK, { angle: 60 });
    });
    // the long sleek body, a lighter belly
    shape([[300, 420], [500, 390], [760, 400], [880, 460], [880, 580], [760, 640], [480, 640], [320, 600], [270, 510]], DARK, { angle: 15, over: 0.6, press: 1.05 });
    c.tint([[380, 560], [760, 560], [740, 620], [420, 625]], LIGHT, { gap: 3.4, angle: 15 });
    // the near legs
    shape(band([[440, 600], [420, 730], [400, 850]], 64, 56), DARK, { angle: 90 });
    shape(band([[680, 610], [700, 740], [710, 855]], 64, 56), DARK, { angle: 90 });
    for (const x of [370, 400, 680, 710]) stroke([[x, 852], [x - 6, 880]], { w: 3.5 });
    // ears
    shape([[230, 290], [200, 150], [300, 250]], DARK, { angle: 70 }, {}, false);
    shape([[330, 240], [400, 110], [420, 270]], DARK, { angle: 110 }, {}, false);
    // the head turned left, a red gem, slit eyes, whiskers
    shape([[150, 350], [210, 260], [330, 230], [440, 280], [460, 380], [400, 450], [280, 470], [170, 440], [120, 390]], DARK, { angle: 80, over: 0.5 });
    shape(potato(300, 280, 22, 20, 8, 0.05), RED, { over: 0, press: 1.2 }, { w: 3 });
    // almond eyes with slit pupils, the far one narrower
    shape([[188, 350], [215, 330], [248, 345], [218, 362]], GOLD, { over: 0 }, { w: 3 }, false);
    shape([[298, 345], [340, 322], [388, 340], [345, 366]], GOLD, { over: 0 }, { w: 3 }, false);
    stroke([[218, 334], [219, 360]], { w: 4 });
    stroke([[342, 326], [344, 362]], { w: 5 });
    dot(140, 395, 8, 6);
    stroke([[160, 425], [210, 432], [255, 420]], { w: 4.5 });
    stroke([[130, 410], [50, 395]], { w: 3.5 });
    stroke([[135, 430], [55, 450]], { w: 3.5 });
  },
} satisfies Redraw;
