import type { Redraw } from './crayon.ts';

/** A purple butterfly flying straight at you: huge red eyes, white paper wings, blue legs dangling. */
export default {
  id: '007', slug: 'papivole', seed: 107, size: [1000, 1000], tilt: 3,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint } = c;
    const PURPLE = '#7a3dc2', RED = '#ef4c45', BLUE = '#3c6fd8', PINK = '#f29ac8', YELLOW = '#f6d23a';
    // white paper wings, a little notch in each, a few dots of rainbow powder
    paper([[420, 300], [250, 170], [95, 150], [70, 260], [120, 300], [80, 360], [140, 450], [300, 470], [425, 440]]);
    paper([[420, 480], [250, 520], [150, 600], [160, 760], [260, 800], [340, 760], [430, 620]]);
    paper([[580, 300], [750, 165], [905, 140], [935, 250], [885, 300], [925, 370], [860, 455], [700, 475], [575, 440]]);
    paper([[580, 480], [750, 515], [850, 600], [845, 755], [740, 800], [660, 760], [570, 620]]);
    for (const [x, y, col] of [[200, 300, PINK], [290, 380, YELLOW], [240, 650, PINK], [800, 290, YELLOW], [720, 380, PINK], [760, 650, YELLOW]] as const) {
      tint(c.potato(x, y, 32, 26, 8, 0.1), col, { gap: 3.4 });
    }
    // dangling blue legs
    shape(band([[455, 640], [440, 780], [425, 900]], 58, 50), BLUE, { angle: 92 });
    shape(band([[545, 640], [560, 780], [578, 900]], 58, 50), BLUE, { angle: 88 });
    // the body: a tall purple block, the head on top
    shape([[400, 425], [600, 425], [612, 560], [585, 680], [415, 680], [392, 560]], PURPLE, { angle: 95, over: 0.6 });
    shape([[395, 230], [520, 215], [608, 230], [612, 430], [500, 438], [392, 432]], PURPLE, { angle: 95, press: 1.1, over: 0.7 });
    // antennae
    stroke([[440, 225], [415, 140], [370, 95], [345, 120]]);
    stroke([[565, 225], [590, 135], [640, 95], [665, 122]]);
    // big red eyes, a little blue mouth
    shape(c.potato(450, 320, 48, 78, 10, 0.05), RED, { angle: 90, press: 1.1, over: 0 });
    shape(c.potato(555, 318, 48, 78, 10, 0.05), RED, { angle: 90, press: 1.1, over: 0 });
    dot(462, 300, 9, 14);
    dot(566, 298, 9, 14);
    shape(c.potato(500, 480, 34, 24, 8, 0.1), BLUE, { angle: 0, over: 0 });
    stroke([[480, 515], [500, 530], [522, 515]]);
  },
} satisfies Redraw;
