import type { Redraw } from './crayon.ts';

/** Clochiflor grown: a hanging yellow pitcher with two big leaves, turned to the left, a jagged mouth shut tight. */
export default {
  id: '063', slug: 'clochegueule', seed: 6301, size: [1000, 1000], tilt: 4,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const YELLOW = '#f2cc32', GREEN = '#5cb52e', PINK = '#ef8fae';
    // the stem hook on top and the far leaf
    shape(band([[560, 260], [600, 160], [680, 120], [720, 170]], 40, 30), GREEN, { angle: 60 });
    shape([[330, 520], [190, 470], [150, 560], [260, 600], [340, 590]], GREEN, { angle: 20 }, {}, false);
    // the pitcher body, turned left
    shape([[320, 380], [420, 260], [580, 250], [700, 340], [730, 520], [670, 700], [520, 800], [380, 760], [300, 600], [280, 470]], YELLOW, { angle: 80, over: 0.6 });
    for (const [x, y] of [[620, 420], [660, 560], [560, 700]] as const) shape(potato(x, y, 26, 22, 8, 0.1), '#c9a020', { over: 0 }, { w: 3.5 });
    // a jagged mouth shut tight, near the left edge
    shape(spikes([[300, 460], [380, 470], [460, 470], [540, 455]], 3, 14), PINK, { over: 0 }, {}, false);
    stroke([[300, 465], [540, 458]], { w: 5.5 });
    // eyes above the mouth
    c.paper(potato(345, 380, 18, 24, 8, 0.05));
    c.paper(potato(440, 375, 26, 30, 8, 0.05));
    dot(342, 386, 8, 12);
    dot(435, 382, 11, 14);
    stroke([[320, 352], [365, 362]], { w: 5 });
    stroke([[410, 355], [470, 345]], { w: 5.5 });
    // the near leaf
    shape([[680, 560], [840, 520], [900, 600], [800, 660], [690, 640]], GREEN, { angle: 160 }, {}, false);
    stroke([[700, 600], [870, 580]], { w: 3 });
  },
} satisfies Redraw;
