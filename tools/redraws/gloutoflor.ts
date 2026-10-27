import type { Redraw } from './crayon.ts';

/** Clochegueule grown: a huge pitcher with a leaf lid and a curly vine, turned to the left, fangs and a fierce glare. */
export default {
  id: '064', slug: 'gloutoflor', seed: 6401, size: [1000, 1050], tilt: 3,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const YELLOW = '#efc22c', GREEN = '#4fa82a', PINK = '#e8709a', BROWN = '#8a5a2c';
    // the far leaf and the curly vine behind
    shape([[300, 600], [150, 560], [110, 660], [230, 700], [310, 680]], GREEN, { angle: 20 }, {}, false);
    shape(band([[700, 260], [800, 180], [880, 220], [870, 300], [810, 300]], 34, 22), GREEN, { angle: 60 });
    // the big pitcher body
    shape([[280, 420], [380, 280], [560, 250], [720, 320], [770, 520], [720, 760], [560, 900], [400, 870], [290, 700], [250, 540]], YELLOW, { angle: 80, over: 0.6, press: 1.05 });
    for (const [x, y] of [[640, 460], [690, 620], [560, 800], [450, 760]] as const) shape(potato(x, y, 30, 24, 8, 0.1), BROWN, { over: 0 }, { w: 3.5 });
    // the leaf lid on top
    shape(spikes([[320, 300], [480, 220], [640, 230], [760, 300]], 3, 22).concat([[620, 320], [450, 330]]), GREEN, { angle: 30, press: 1.1 }, {}, false);
    // the mouth, near the left edge: shut, with two fangs
    shape([[270, 520], [480, 540], [460, 600], [300, 590]], PINK, { over: 0, press: 1.1 }, {}, false);
    stroke([[270, 525], [485, 540]], { w: 6 });
    c.paper([[320, 528], [335, 568], [350, 530]], {}, false);
    c.paper([[420, 535], [436, 576], [452, 537]], {}, false);
    // a fierce glare
    c.paper(potato(320, 430, 22, 26, 8, 0.05));
    c.paper(potato(430, 425, 30, 32, 8, 0.05));
    dot(318, 436, 10, 13);
    dot(426, 432, 13, 15);
    stroke([[290, 395], [345, 412]], { w: 6 });
    stroke([[395, 408], [470, 390]], { w: 6.5 });
    // the near leaf
    shape([[720, 620], [880, 580], [950, 660], [850, 730], [730, 700]], GREEN, { angle: 160 }, {}, false);
    stroke([[740, 660], [920, 640]], { w: 3 });
  },
} satisfies Redraw;
