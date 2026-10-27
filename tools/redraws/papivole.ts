import type { Redraw } from './crayon.ts';

/** A purple butterfly flying three-quarters to the left: huge red eyes, white paper wings, blue legs dangling. */
export default {
  id: '007', slug: 'papivole', seed: 108, size: [1000, 1000], tilt: -4,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const PURPLE = '#7a3dc2', RED = '#ef4c45', BLUE = '#3c6fd8', PINK = '#f29ac8', YELLOW = '#f6d23a';
    // the far wings, smaller, behind on the left (they fold in battle)
    c.part('ailes-loin', { pivot: [405, 480], motion: 'fold', behind: true }, () => {
      paper([[400, 330], [300, 220], [190, 200], [180, 290], [215, 330], [190, 390], [260, 450], [400, 460]]);
      paper([[400, 500], [300, 540], [250, 640], [290, 730], [370, 720], [410, 620]]);
      tint(potato(270, 320, 26, 22, 8, 0.1), PINK, { gap: 3.4 });
      tint(potato(320, 620, 26, 22, 8, 0.1), YELLOW, { gap: 3.4 });
    });
    // the far leg
    shape(band([[440, 640], [410, 770], [380, 880]], 52, 46), BLUE, { angle: 80 });
    // the body: a tall purple block, the head on top, turned left
    shape([[390, 425], [580, 425], [595, 560], [565, 680], [410, 680], [385, 560]], PURPLE, { angle: 95, over: 0.6 });
    shape([[370, 235], [500, 215], [590, 235], [595, 430], [480, 438], [372, 432]], PURPLE, { angle: 95, press: 1.1, over: 0.7 });
    // the near wings, big, spreading to the right (they fold in battle)
    c.part('ailes', { pivot: [565, 480], motion: 'fold' }, () => {
      paper([[560, 320], [730, 160], [900, 120], [940, 240], [890, 300], [935, 380], [860, 470], [690, 490], [570, 450]]);
      paper([[570, 490], [740, 520], [860, 610], [850, 770], [740, 820], [650, 780], [560, 630]]);
      for (const [x, y, col] of [[760, 260, PINK], [840, 380, YELLOW], [700, 400, PINK], [760, 660, YELLOW], [690, 590, PINK]] as const) {
        tint(potato(x, y, 32, 26, 8, 0.1), col, { gap: 3.4 });
      }
    });
    // the near leg
    shape(band([[530, 650], [540, 790], [535, 900]], 58, 50), BLUE, { angle: 88 });
    // antennae
    stroke([[410, 225], [370, 140], [320, 100], [295, 125]]);
    stroke([[520, 222], [530, 130], [570, 85], [600, 105]]);
    // big red eyes, shifted left (the far one narrower), a little blue mouth
    shape(potato(410, 320, 36, 74, 10, 0.05), RED, { angle: 90, press: 1.1, over: 0 });
    shape(potato(510, 318, 50, 80, 10, 0.05), RED, { angle: 90, press: 1.1, over: 0 });
    dot(402, 298, 7, 13);
    dot(500, 296, 9, 14);
    shape(potato(430, 480, 30, 22, 8, 0.1), BLUE, { angle: 0, over: 0 });
    stroke([[410, 515], [430, 528], [452, 515]]);
  },
} satisfies Redraw;
