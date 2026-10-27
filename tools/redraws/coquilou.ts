import type { Redraw } from './crayon.ts';

/** A little steel-blue clam, tilted to the left, ribbed shell slightly open: two round eyes peek out of the dark inside. */
export default {
  id: '058', slug: 'coquilou', seed: 5801, size: [1000, 900], tilt: -6,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const SHELL = '#8fa3c8', DEEP = '#55617e', INSIDE = '#2e2a3a', ICE = '#cfeef7';
    // the bottom half of the shell
    shape([[160, 520], [300, 600], [500, 640], [720, 620], [860, 540], [800, 700], [600, 790], [380, 790], [220, 700]], SHELL, { angle: 80, over: 0.5 });
    // the dark inside, the eyes looking out to the left
    shape([[200, 500], [330, 430], [520, 410], [720, 440], [840, 520], [700, 560], [500, 580], [320, 560]], INSIDE, { angle: 0, over: 0, press: 1.2 });
    c.paper(potato(380, 495, 34, 34, 9, 0.04));
    c.paper(potato(500, 490, 44, 44, 9, 0.04));
    dot(372, 500, 14, 16);
    dot(490, 496, 19, 21);
    // the top half, ribbed, with icy highlights
    shape([[150, 500], [220, 330], [360, 210], [520, 180], [690, 220], [820, 340], [870, 510], [720, 440], [520, 410], [320, 440]], SHELL, { angle: 80, over: 0.5 });
    for (const [x0, y0, x1, y1] of [[520, 190, 510, 400], [380, 230, 340, 430], [660, 230, 700, 430], [250, 330, 230, 470], [780, 330, 810, 470]] as const) stroke([[x0, y0], [x1, y1]], { w: 4, col: DEEP });
    c.tint([[300, 260], [420, 220], [440, 300], [320, 330]], ICE, { gap: 3.2 });
    // a small pearl at the hinge
    shape(potato(870, 540, 26, 24, 8, 0.05), ICE, { over: 0 }, { w: 3.5 });
  },
} satisfies Redraw;
