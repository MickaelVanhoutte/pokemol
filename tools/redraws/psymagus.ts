import type { Redraw } from './crayon.ts';

/** Cuillipsy grown: a great wizard turned to the left, a long moustache, a spoon in each hand, a fierce stare. */
export default {
  id: '053', slug: 'psymagus', seed: 5301, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const YELLOW = '#eeb534', BROWN = '#8a4f26', SILVER = '#b8c2d0', RED = '#e2423a';
    // the far arm, behind: only its hand and spoon show past the left edge
    c.part('cuillere-loin', { pivot: [400, 520], motion: 'swing', amp: -6, period: 2.4, behind: true, phase: 0.5 }, () => {
      shape(band([[400, 520], [280, 520], [200, 470]], 54, 46), YELLOW, { angle: 20 });
      shape(potato(190, 460, 34, 32, 8, 0.08), YELLOW, { over: 0 });
      shape(band([[180, 440], [150, 350], [140, 290]], 18, 16), SILVER, { angle: 90, over: 0 });
      shape(potato(135, 260, 38, 50, 9, 0.05), SILVER, { angle: 60, over: 0 });
    });
    // the far leg and far ear
    shape(band([[440, 760], [420, 860], [395, 935]], 70, 64), YELLOW, { angle: 90 });
    shape([[330, 250], [250, 50], [410, 210]], YELLOW, { angle: 70 }, {}, false);
    // a tall body, broad shoulder pads, the brown chest
    shape([[350, 440], [520, 400], [670, 450], [690, 640], [630, 790], [430, 800], [360, 650]], YELLOW, { angle: 85, over: 0.55 });
    shape([[380, 460], [520, 430], [640, 470], [630, 620], [520, 670], [400, 620]], BROWN, { angle: 80, press: 1.1, over: 0.4 });
    // the near leg
    shape(band([[580, 770], [600, 870], [610, 940]], 76, 70), YELLOW, { angle: 90 });
    shape(potato(630, 945, 64, 26, 8, 0.06), YELLOW, { over: 0 });
    // the near arm and its spoon held high
    c.part('cuillere', { pivot: [650, 500], motion: 'swing', amp: 6, period: 2.4, phase: 0 }, () => {
      shape(band([[650, 500], [760, 440], [800, 340]], 58, 50), YELLOW, { angle: 120 });
      shape(potato(805, 325, 36, 34, 8, 0.08), YELLOW, { over: 0 });
      shape(band([[815, 300], [835, 210], [870, 150]], 18, 16), SILVER, { angle: 90, over: 0 });
      shape(potato(885, 120, 40, 52, 9, 0.05), SILVER, { angle: 60, over: 0 });
    });
    // the near ear
    shape([[480, 200], [630, 20], [580, 250]], YELLOW, { angle: 110 }, {}, false);
    // the head: a big brow, fierce eyes, a long drooping moustache
    shape([[250, 300], [320, 190], [460, 160], [580, 210], [610, 310], [560, 400], [430, 430], [310, 410], [220, 360], [210, 325]], YELLOW, { angle: 80, over: 0.5 });
    shape(spikes([[300, 200], [400, 170], [500, 175]], 2, 26), YELLOW, { over: 0 }, {}, false);
    shape(potato(430, 235, 16, 16, 7, 0.1), RED, { over: 0 }, { w: 3 });
    c.paper(potato(320, 310, 22, 16, 8, 0.05));
    c.paper(potato(455, 305, 32, 20, 8, 0.05));
    dot(318, 312, 9, 10);
    dot(450, 308, 12, 12);
    stroke([[285, 290], [345, 300]], { w: 6 });
    stroke([[405, 292], [500, 280]], { w: 6.5 });
    dot(222, 340, 9, 7);
    // a long moustache drooping from the snout, in thin pencil strokes
    for (const [dx, len] of [[0, 1], [14, 0.9], [60, 1], [74, 0.85]] as const) {
      stroke([[245 + dx, 372], [215 + dx, 430], [200 + dx, 430 + 140 * len], [215 + dx, 440 + 180 * len]], { w: 4.5 });
    }
  },
} satisfies Redraw;
