import type { Redraw } from './crayon.ts';

/** A skinny flower sprout with a yellow bell for a head, turned to the left: two leaf arms, root feet, a small smile. */
export default {
  id: '062', slug: 'clochiflor', seed: 6201, size: [900, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const GREEN = '#6cc23a', YELLOW = '#f6d23a', BROWN = '#a8743e', PINK = '#f29ab0';
    // the far leaf, behind
    shape([[420, 560], [300, 500], [250, 560], [330, 600]], GREEN, { angle: 20 }, {}, false);
    // root feet and the thin stem
    shape([[430, 900], [370, 940], [440, 930], [470, 950], [500, 925], [560, 935], [500, 895]], BROWN, { over: 0 }, {}, false);
    shape(band([[460, 900], [470, 700], [450, 520], [420, 420]], 34, 30), GREEN, { angle: 85 });
    // the near leaf
    shape([[470, 640], [600, 560], [680, 600], [600, 660]], GREEN, { angle: 160 }, {}, false);
    stroke([[480, 640], [640, 600]], { w: 3 });
    // the yellow bell head, its rim, turned left
    shape([[260, 300], [300, 200], [420, 150], [540, 190], [580, 300], [560, 400], [480, 450], [340, 450], [250, 410], [220, 350]], YELLOW, { angle: 80, over: 0.5 });
    shape(potato(300, 390, 70, 40, 10, 0.08), PINK, { over: 0 }, { w: 4 });
    // eyes shifted left, a little smile on the rim
    dot(310, 290, 10, 14);
    dot(410, 285, 13, 16);
    stroke([[265, 390], [300, 405], [340, 392]], { w: 4.5 });
  },
} satisfies Redraw;
