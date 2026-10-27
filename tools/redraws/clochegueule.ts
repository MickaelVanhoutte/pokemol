import type { Redraw } from './crayon.ts';

/** Clochiflor grown: a slim yellow pitcher hanging from its hooked stem, turned to the left, two big leaves, a jagged mouth shut tight. */
export default {
  id: '063', slug: 'clochegueule', seed: 6302, size: [1000, 1000], tilt: 4,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const YELLOW = '#f2cc32', GREEN = '#5cb52e', PINK = '#ef8fae', SPOT = '#c9a020';
    // the hooked stem on top and the far leaf, behind
    shape(band([[540, 240], [570, 150], [630, 95], [700, 105], [725, 165], [695, 200]], 36, 22), GREEN, { angle: 60 });
    shape([[390, 520], [270, 460], [140, 470], [200, 535], [300, 580], [390, 585]], GREEN, { angle: 20 }, {}, false);
    stroke([[380, 545], [190, 495]], { w: 3 });
    // the slim pitcher, round on top, pointed at the bottom
    shape([[360, 300], [420, 230], [520, 210], [610, 250], [655, 360], [645, 500], [605, 630], [545, 730], [490, 790], [450, 735], [390, 630], [340, 500], [325, 390]], YELLOW, { angle: 80, over: 0.55 });
    for (const [x, y, r] of [[590, 410, 22], [600, 560, 18], [530, 670, 15]] as const) shape(potato(x, y, r, r * 0.85, 8, 0.1), SPOT, { over: 0 }, { w: 3.5 });
    // a jagged mouth shut tight, near the left edge
    shape(spikes([[330, 440], [420, 452], [535, 438]], 3, 12), PINK, { over: 0 }, {}, false);
    stroke([[330, 444], [535, 440]], { w: 5.5 });
    // eyes above the mouth, a frown
    c.paper(potato(372, 360, 16, 22, 8, 0.05));
    c.paper(potato(460, 352, 22, 26, 8, 0.05));
    dot(370, 366, 7, 11);
    dot(456, 358, 10, 13);
    stroke([[345, 330], [392, 342]], { w: 5 });
    stroke([[432, 330], [492, 318]], { w: 5.5 });
    // the near leaf, held out like an arm
    shape([[610, 520], [720, 465], [870, 455], [830, 525], [890, 560], [760, 610], [620, 605]], GREEN, { angle: 160 }, {}, false);
    stroke([[625, 560], [860, 505]], { w: 3 });
  },
} satisfies Redraw;
