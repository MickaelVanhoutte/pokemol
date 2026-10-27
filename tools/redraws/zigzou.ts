import type { Redraw } from './crayon.ts';

/** A yellow electric mouse, three-quarters to the left: pointy ears with black tips, red cheeks, a zig-zag tail. */
export default {
  id: '004', slug: 'zigzou', seed: 405, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const YELLOW = '#f7dc35', BLACK = '#35303a', RED = '#ee4b3c', BROWN = '#a8672e';
    // the zig-zag tail behind, brown at the bottom
    shape([[640, 700], [720, 660], [690, 600], [820, 540], [780, 480], [950, 380], [870, 520], [910, 550], [780, 640], [810, 680], [680, 760]], YELLOW, { angle: 30, press: 1.05 }, {}, false);
    shape([[635, 700], [685, 676], [710, 730], [680, 758]], BROWN, { over: 0 }, { w: 3.5 }, false);
    // far ear and far arm, behind
    shape([[300, 310], [200, 110], [370, 250]], YELLOW, { angle: 70 }, {}, false);
    shape([[214, 140], [200, 110], [250, 160], [234, 178]], BLACK, { over: 0 }, { w: 3.5 }, false);
    shape(band([[620, 580], [700, 520], [750, 450]], 54, 48), YELLOW, { angle: 140 });
    // far foot, body, near foot
    shape(potato(600, 905, 85, 38, 8, 0.06), YELLOW, { angle: 10 });
    shape([[350, 510], [490, 480], [620, 520], [670, 680], [620, 860], [480, 900], [360, 860], [310, 690]], YELLOW, { angle: 85, over: 0.55 });
    stroke([[380, 620], [500, 610]], { w: 3.5 });
    stroke([[390, 680], [500, 672]], { w: 3.5 });
    shape(potato(400, 910, 95, 42, 8, 0.06), YELLOW, { angle: 10 });
    // the near ear
    shape([[480, 250], [640, 50], [560, 300]], YELLOW, { angle: 110 }, {}, false);
    shape([[600, 85], [640, 50], [618, 120], [592, 116]], BLACK, { over: 0 }, { w: 3.5 }, false);
    // the head turned left, the near arm reaching out
    shape(potato(430, 380, 185, 150, 12, 0.05), YELLOW, { angle: 80, over: 0.5 });
    shape(band([[360, 600], [260, 600], [170, 560]], 58, 50), YELLOW, { angle: 10 });
    shape(potato(530, 440, 40, 32, 8, 0.1), RED, { over: 0, press: 1.1 }, { w: 3.5 });
    dot(320, 360, 13, 21);
    dot(450, 355, 18, 24);
    dot(260, 405, 8, 6);
    stroke([[275, 455], [320, 478], [345, 452], [370, 478], [415, 450]]);
  },
} satisfies Redraw;
