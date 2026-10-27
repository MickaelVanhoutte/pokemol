import type { Redraw } from './crayon.ts';

/** A sleepy yellow fox-child sitting cross-legged, turned to the left: brown chest plate, eyes always shut, a curly tail. */
export default {
  id: '051', slug: 'dormipsy', seed: 5101, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const YELLOW = '#f2c84b', BROWN = '#9a5a2c', DEEP = '#c9962a';
    // the curly tail behind, on the right
    c.part('queue', { pivot: [625, 780], motion: 'swing', amp: 6, period: 2.6, behind: true }, () => {
      shape(band([[620, 780], [760, 800], [850, 720], [840, 620], [780, 600]], 70, 40), YELLOW, { angle: 40 });
    });
    // the far ear and the far arm, behind
    shape([[330, 300], [250, 110], [400, 250]], YELLOW, { angle: 70 }, {}, false);
    shape(band([[360, 600], [300, 680], [330, 740]], 56, 48), YELLOW, { angle: 60 });
    // sitting: crossed legs, the body with its brown chest plate
    shape(potato(500, 820, 230, 90, 12, 0.05), YELLOW, { angle: 20, over: 0.5 });
    shape([[380, 520], [520, 490], [640, 540], [660, 700], [600, 800], [420, 800], [360, 700]], YELLOW, { angle: 85, over: 0.5 });
    shape([[400, 540], [520, 520], [600, 560], [590, 680], [500, 720], [410, 680]], BROWN, { angle: 80, press: 1.05, over: 0.3 });
    // the near arm resting on its knee
    shape(band([[620, 580], [680, 680], [600, 760]], 56, 50), YELLOW, { angle: 100 });
    shape(potato(585, 770, 34, 30, 8, 0.08), YELLOW, { over: 0 });
    // the near ear
    shape([[470, 240], [600, 70], [560, 290]], YELLOW, { angle: 110 }, {}, false);
    shape([[505, 235], [580, 130], [555, 255]], DEEP, { over: 0 }, { w: 3.5 }, false);
    // the head turned left, a fox snout, eyes shut, little whiskers
    shape([[260, 360], [320, 260], [450, 225], [570, 270], [600, 370], [550, 460], [420, 490], [320, 470], [230, 420], [220, 385]], YELLOW, { angle: 80, over: 0.5 });
    stroke([[300, 345], [330, 360], [360, 348]], { w: 5 });
    stroke([[420, 345], [460, 362], [500, 348]], { w: 5.5 });
    dot(232, 395, 9, 7);
    stroke([[250, 430], [300, 440], [350, 432]], { w: 4.5 });
    stroke([[230, 445], [170, 470]], { w: 3.5 });
    stroke([[240, 460], [185, 500]], { w: 3.5 });
  },
} satisfies Redraw;
