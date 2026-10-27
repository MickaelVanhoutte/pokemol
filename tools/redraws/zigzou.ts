import type { Redraw } from './crayon.ts';

/** A yellow electric mouse: pointy ears with black tips, red cheeks, arms out, a zig-zag tail. */
export default {
  id: '004', slug: 'zigzou', seed: 404, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const YELLOW = '#f7dc35', BLACK = '#35303a', RED = '#ee4b3c', BROWN = '#a8672e';
    // the zig-zag tail, brown at the bottom
    shape([[620, 700], [700, 660], [670, 600], [800, 540], [760, 480], [930, 380], [850, 520], [890, 550], [760, 640], [790, 680], [660, 760]], YELLOW, { angle: 30, press: 1.05 }, {}, false);
    shape([[615, 700], [665, 676], [690, 730], [660, 758]], BROWN, { over: 0 }, { w: 3.5 }, false);
    // pointy ears, black tips
    shape([[330, 320], [230, 80], [400, 260]], YELLOW, { angle: 70 }, {}, false);
    shape([[245, 110], [230, 80], [285, 140], [265, 160]], BLACK, { over: 0 }, { w: 3.5 }, false);
    shape([[560, 260], [740, 70], [640, 320]], YELLOW, { angle: 110 }, {}, false);
    shape([[700, 105], [740, 70], [715, 140], [690, 135]], BLACK, { over: 0 }, { w: 3.5 }, false);
    // feet, body
    shape(potato(400, 905, 90, 40, 8, 0.06), YELLOW, { angle: 10 });
    shape(potato(600, 905, 90, 40, 8, 0.06), YELLOW, { angle: 10 });
    shape([[360, 510], [500, 480], [640, 520], [690, 680], [640, 860], [500, 900], [370, 860], [320, 690]], YELLOW, { angle: 85, over: 0.55 });
    stroke([[440, 620], [560, 610]], { w: 3.5 });
    stroke([[450, 680], [560, 672]], { w: 3.5 });
    // arms out wide
    shape(band([[370, 590], [260, 560], [170, 590]], 58, 50), YELLOW, { angle: 10 });
    shape(band([[640, 590], [740, 540], [820, 480]], 58, 50), YELLOW, { angle: 140 });
    // head, cheeks, grin
    shape(potato(490, 380, 190, 150, 12, 0.05), YELLOW, { angle: 80, over: 0.5 });
    shape(potato(350, 440, 38, 30, 8, 0.1), RED, { over: 0, press: 1.1 }, { w: 3.5 });
    shape(potato(630, 430, 38, 30, 8, 0.1), RED, { over: 0, press: 1.1 }, { w: 3.5 });
    dot(420, 360, 17, 23);
    dot(560, 355, 17, 23);
    dot(490, 410, 8, 6);
    stroke([[430, 450], [470, 475], [490, 450], [512, 475], [555, 448]]);
  },
} satisfies Redraw;
