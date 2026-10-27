import type { Redraw } from './crayon.ts';

/** A little puff of gas: a bumpy cloud. */
const cloud = (x: number, y: number, r: number): [number, number][] =>
  Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2, q = r * (0.8 + 0.25 * Math.abs(Math.sin(a * 2.5)));
    return [x + Math.cos(a) * q, y + Math.sin(a) * q * 0.8] as [number, number];
  });

/** Fumeron grown: two smog balls stuck together, both glaring to the left, a cloud of gas all around them. */
export default {
  id: '057', slug: 'fumerax', seed: 5701, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const PURPLE = '#6a4a96', SPOT = '#b39cd2', GAS = '#93a57a';
    // puffs of gas all around
    c.part('gaz', { pivot: [560, 520], motion: 'flicker', period: 2.6, behind: true }, () => {
      for (const [x, y, r] of [[1000, 200, 60], [1020, 520, 50], [120, 880, 60], [780, 880, 66], [160, 360, 48]] as const) shape(cloud(x, y, r), GAS, { angle: 30, over: 0, press: 0.8 });
    });
    // the smaller ball behind, up on the right
    shape(potato(760, 330, 200, 190, 14, 0.05), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
    for (const [x, y, r] of [[860, 260, 28], [880, 420, 24], [720, 180, 22]] as const) shape(potato(x, y, r, r * 0.8, 9, 0.12), SPOT, { over: 0 }, { w: 4 });
    c.paper(potato(650, 320, 18, 24, 8, 0.05));
    c.paper(potato(740, 315, 26, 30, 8, 0.05));
    dot(648, 326, 8, 11);
    dot(735, 322, 11, 14);
    stroke([[630, 290], [670, 300]], { w: 5 });
    stroke([[710, 292], [770, 280]], { w: 5.5 });
    stroke([[640, 395], [690, 410], [740, 398]], { w: 5 });
    // the joining tube
    shape([[560, 420], [650, 400], [670, 470], [590, 500]], PURPLE, { over: 0.3 });
    // the big ball in front, its craters and a little chimney
    shape(potato(450, 620, 300, 290, 16, 0.04), PURPLE, { angle: 75, over: 0.6, press: 1.1 });
    for (const [x, y, r] of [[620, 500, 40], [660, 700, 36], [520, 850, 44], [380, 410, 26]] as const) shape(potato(x, y, r, r * 0.8, 9, 0.12), SPOT, { over: 0 }, { w: 4 });
    shape([[470, 330], [530, 330], [525, 280], [475, 282]], PURPLE, { over: 0 }, { w: 4 });
    // its face, shifted left, frowning, a grin with two fangs
    c.paper(potato(240, 580, 26, 34, 8, 0.05));
    c.paper(potato(365, 575, 40, 44, 8, 0.05));
    dot(236, 588, 11, 16);
    dot(358, 584, 16, 20);
    stroke([[205, 540], [272, 560]], { w: 6 });
    stroke([[320, 555], [415, 528]], { w: 6.5 });
    stroke([[200, 690], [260, 715], [340, 710], [405, 680]], { w: 6 });
    c.paper([[240, 710], [252, 738], [266, 713]], {}, false);
    c.paper([[340, 708], [352, 736], [366, 704]], {}, false);
  },
} satisfies Redraw;
