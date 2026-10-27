import type { Redraw } from './crayon.ts';

/** A huge blue sleepyhead sitting down, a big cream tummy, tiny ears, fast asleep with a snack. */
export default {
  id: '008', slug: 'ronflon', seed: 808, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#2f74d0', CREAM = '#f7e6c0', APPLE = '#ee4b3c';
    // feet sticking out, pads
    shape(potato(300, 860, 95, 75, 10, 0.06), BLUE, { angle: 60 });
    shape(potato(700, 860, 95, 75, 10, 0.06), BLUE, { angle: 120 });
    shape(potato(290, 870, 50, 40, 8, 0.08), CREAM, { over: 0 }, { w: 4 });
    shape(potato(710, 870, 50, 40, 8, 0.08), CREAM, { over: 0 }, { w: 4 });
    // the big round body, the cream tummy
    shape(potato(500, 600, 330, 290, 14, 0.04), BLUE, { angle: 80, over: 0.6, press: 1.1 });
    shape(potato(500, 650, 220, 210, 12, 0.05), CREAM, { angle: 80, over: 0 });
    // stubby arms, one holding an apple on the tummy
    shape(band([[200, 520], [130, 600], [120, 680]], 80, 70), BLUE, { angle: 60 });
    shape(band([[790, 520], [760, 600], [640, 640]], 80, 70), BLUE, { angle: 120 });
    shape(potato(600, 640, 50, 46, 9, 0.05), APPLE, { angle: 80, press: 1.1, over: 0 });
    stroke([[600, 595], [610, 565]], { w: 4.5 });
    // the head, little pointed ears, asleep
    shape([[330, 250], [360, 140], [420, 230]], BLUE, { angle: 70 }, {}, false);
    shape([[580, 230], [640, 140], [670, 250]], BLUE, { angle: 110 }, {}, false);
    shape(potato(500, 320, 200, 130, 12, 0.04), BLUE, { angle: 80, over: 0.5 });
    shape(potato(500, 360, 140, 80, 10, 0.05), CREAM, { over: 0 });
    stroke([[400, 320], [440, 330], [470, 320]]);
    stroke([[530, 320], [560, 330], [600, 320]]);
    stroke([[460, 390], [500, 400], [540, 390]]);
    dot(500, 360, 9, 6);
  },
} satisfies Redraw;
