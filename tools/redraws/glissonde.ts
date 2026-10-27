import type { Redraw } from './crayon.ts';

/** A gentle blue sea-ferry gliding to the left: a long neck, a little horn, a grey knobbly shell on its back, flippers. */
export default {
  id: '060', slug: 'glissonde', seed: 6001, size: [1100, 950], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#4c8be0', CREAM = '#f3e6c6', SHELL = '#9aa3b4', DEEP = '#6a7386';
    // the far flipper, behind
    shape([[420, 640], [300, 700], [250, 760], [330, 760], [440, 700]], BLUE, { angle: 20 });
    // the body and its cream belly
    shape([[380, 500], [560, 440], [800, 450], [960, 540], [980, 680], [880, 780], [620, 800], [420, 760], [350, 640]], BLUE, { angle: 15, over: 0.55 });
    c.tint([[420, 700], [700, 740], [880, 720], [860, 780], [600, 795], [430, 760]], CREAM, { gap: 3.4 });
    // the grey shell on its back, with knobs
    shape([[520, 470], [620, 330], [780, 300], [920, 380], [950, 520], [800, 560], [620, 560]], SHELL, { angle: 70, over: 0.5 });
    for (const [x, y] of [[640, 380], [740, 340], [840, 380], [900, 460], [700, 450], [800, 470]] as const) shape(potato(x, y, 30, 26, 8, 0.1), DEEP, { over: 0 }, { w: 3.5 });
    // the near flipper and a little tail
    shape([[600, 740], [560, 860], [640, 880], [700, 780]], BLUE, { angle: 80 });
    shape([[960, 640], [1060, 600], [1040, 680]], BLUE, { angle: 20 }, {}, false);
    // the long neck curving up and its head looking left
    shape(band([[460, 560], [400, 420], [370, 300], [380, 220]], 110, 90), BLUE, { angle: 80 });
    c.tint(band([[440, 580], [390, 440], [360, 320]], 50, 40), CREAM, { gap: 3.4 });
    shape([[240, 230], [300, 160], [420, 140], [490, 200], [480, 280], [400, 320], [290, 310], [230, 280]], BLUE, { angle: 80, over: 0.5 });
    shape([[400, 150], [420, 70], [450, 150]], SHELL, { over: 0 }, { w: 4 }, false);
    shape([[470, 180], [530, 150], [510, 220]], BLUE, { over: 0 }, {}, false);
    c.paper(potato(305, 220, 18, 22, 8, 0.05));
    c.paper(potato(385, 215, 26, 28, 8, 0.05));
    dot(303, 225, 8, 11);
    dot(382, 222, 11, 14);
    stroke([[250, 270], [300, 285], [350, 274]], { w: 4.5 });
  },
} satisfies Redraw;
