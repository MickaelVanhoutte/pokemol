import type { Redraw } from './crayon.ts';

/** A little ball of purple mist turning to the left: a fuzzy scribbled cloud, red eyes, a big sideways grin. */
export default {
  id: '009', slug: 'brumouille', seed: 910, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato, paper } = c;
    const PURPLE = '#7d45cf', MIST = '#b48ae8', RED = '#f04a40';
    // the mist all around, trailing off to the right
    c.part('brume', { pivot: [540, 500], motion: 'swing', amp: 6, period: 3, behind: true }, () => {
      c.tint(potato(540, 500, 430, 390, 16, 0.14), MIST, { gap: 6, w: 4.5, angle: 20, spill: 0, miss: 0.3, wash: 0 });
      c.tint(potato(560, 500, 340, 320, 14, 0.12), MIST, { gap: 5, angle: 120, spill: 0, miss: 0.25, wash: 0.1 });
    });
    // the round body
    shape(potato(490, 500, 250, 240, 14, 0.04), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
    // the face shifted left: the far eye narrow at the edge, the near eye big
    shape([[285, 410], [370, 440], [365, 495], [310, 500], [285, 465]], RED, { angle: 90, over: 0 }, {}, false);
    shape([[450, 425], [580, 455], [565, 510], [490, 518], [452, 480]], RED, { angle: 90, over: 0 }, {}, false);
    stroke([[270, 392], [378, 430]], { w: 5.5 });
    stroke([[440, 405], [595, 445]], { w: 5.5 });
    paper([[290, 570], [420, 595], [560, 575], [520, 650], [420, 680], [320, 640]]);
    for (const x of [340, 390, 445, 500]) stroke([[x, 582], [x + 3, 670 - Math.abs(x - 420) * 0.4]], { w: 3.4 });
    stroke([[300, 610], [545, 615]], { w: 3.4 });
  },
} satisfies Redraw;
