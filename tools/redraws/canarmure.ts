import type { Redraw } from './crayon.ts';

/** A brown duck knight turned to the left: a steel helmet and breastplate, a pencil held up like a sword. */
export default {
  id: '061', slug: 'canarmure', seed: 6101, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BROWN = '#a8743e', CREAM = '#f3e3c0', STEEL = '#a9b4c6', DEEP = '#6a7386', ORANGE = '#f28a2a', PENCIL = '#f2c43a';
    // the far wing, behind (it flaps in battle); orange feet
    c.part('aile-loin', { pivot: [390, 560], motion: 'flap', amp: 18, period: 0.45, behind: true }, () => shape([[380, 520], [260, 560], [230, 640], [330, 640], [410, 600]], BROWN, { angle: 30 }));
    shape([[430, 850], [420, 920], [360, 935], [450, 940], [470, 860]], ORANGE, { over: 0 }, {}, false);
    shape([[560, 850], [570, 925], [510, 940], [610, 940], [600, 860]], ORANGE, { over: 0 }, {}, false);
    // tail feathers, the round body, its steel breastplate
    shape([[640, 640], [790, 600], [760, 660], [820, 700], [660, 720]], BROWN, { angle: 20 }, {}, false);
    shape(potato(500, 680, 190, 200, 12, 0.05), BROWN, { angle: 80, over: 0.5 });
    shape([[350, 560], [520, 520], [620, 580], [610, 760], [480, 820], [360, 760]], STEEL, { angle: 70, over: 0.4 });
    for (const y of [620, 690, 750]) stroke([[370, y], [600, y - 10]], { w: 3.5, col: DEEP });
    // the near wing holding the pencil-sword up (it brandishes it in battle)
    c.part('epee', { pivot: [590, 580], motion: 'swing', amp: 6, period: 2.8 }, () => {
      shape([[600, 600], [700, 520], [740, 440], [680, 430], [620, 520], [570, 560]], BROWN, { angle: 110 });
      shape(band([[700, 470], [760, 260], [790, 120]], 30, 26), PENCIL, { angle: 80, over: 0 });
      shape([[778, 125], [800, 60], [812, 130]], '#f3d6a8', { over: 0 }, { w: 3 }, false);
      shape([[665, 470], [745, 485], [740, 505], [660, 492]], DEEP, { over: 0 }, { w: 3 }, false);
    });
    // the head turned left, a steel helmet, the orange beak
    shape(potato(430, 380, 130, 120, 12, 0.05), CREAM, { angle: 80, over: 0.3 });
    shape([[300, 360], [330, 260], [430, 220], [540, 260], [560, 360], [480, 330], [400, 320], [340, 340]], STEEL, { angle: 70, over: 0.5 }, {}, false);
    shape([[430, 225], [450, 160], [470, 228]], '#e2423a', { over: 0 }, { w: 3 }, false);
    shape([[300, 400], [190, 410], [200, 440], [300, 440]], ORANGE, { angle: 0, over: 0 }, {}, false);
    c.paper(potato(345, 380, 18, 22, 8, 0.05));
    c.paper(potato(430, 378, 24, 28, 8, 0.05));
    dot(342, 384, 8, 12);
    dot(425, 383, 11, 14);
    stroke([[322, 358], [365, 366]], { w: 5 });
    stroke([[405, 362], [460, 352]], { w: 5.5 });
  },
} satisfies Redraw;
