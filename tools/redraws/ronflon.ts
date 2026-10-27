import type { Redraw } from './crayon.ts';

/** A huge blue sleepyhead sitting three-quarters to the left, a big cream tummy, tiny ears, asleep with an apple. */
export default {
  id: '008', slug: 'ronflon', seed: 809, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#2f74d0', CREAM = '#f7e6c0', APPLE = '#ee4b3c';
    // the far foot and arm, behind
    shape(potato(700, 855, 85, 70, 10, 0.06), BLUE, { angle: 120 });
    shape(band([[800, 500], [860, 590], [870, 670]], 76, 66), BLUE, { angle: 120 });
    // the big round body, the cream tummy shifted left
    shape(potato(530, 600, 330, 290, 14, 0.04), BLUE, { angle: 80, over: 0.6, press: 1.1 });
    shape(potato(450, 650, 200, 205, 12, 0.05), CREAM, { angle: 80, over: 0 });
    // the near foot with its pad
    shape(potato(300, 860, 100, 80, 10, 0.06), BLUE, { angle: 60 });
    shape(potato(285, 870, 54, 42, 8, 0.08), CREAM, { over: 0 }, { w: 4 });
    // the near arm holding an apple on the tummy
    shape(band([[230, 520], [260, 610], [390, 640]], 80, 70), BLUE, { angle: 60 });
    shape(potato(430, 630, 50, 46, 9, 0.05), APPLE, { angle: 80, press: 1.1, over: 0 });
    stroke([[430, 585], [440, 555]], { w: 4.5 });
    // the head turned left, little pointed ears, fast asleep
    shape([[300, 250], [320, 150], [390, 230]], BLUE, { angle: 70 }, {}, false);
    shape([[540, 225], [620, 130], [640, 245]], BLUE, { angle: 110 }, {}, false);
    shape(potato(450, 320, 200, 130, 12, 0.04), BLUE, { angle: 80, over: 0.5 });
    shape(potato(390, 360, 135, 78, 10, 0.05), CREAM, { over: 0 });
    stroke([[295, 320], [325, 330], [350, 320]]);
    stroke([[420, 315], [455, 326], [495, 315]]);
    stroke([[340, 395], [380, 405], [420, 392]]);
    dot(372, 360, 9, 6);
    // only in battle: Zzz floating over its sleepy head (drawn last, the card stays the same)
    c.part('zzz', { pivot: [700, 150], motion: 'flicker', period: 3, extra: true }, () => {
      for (const [x, y, s] of [[640, 190, 1], [740, 110, 0.8], [820, 50, 0.6]] as const) {
        stroke([[x, y], [x + 50 * s, y], [x, y + 50 * s], [x + 50 * s, y + 50 * s]], { w: 6 * s + 2, col: '#3e6fd0' }, false);
      }
    });
  },
} satisfies Redraw;
