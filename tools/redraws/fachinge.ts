import type { Redraw } from './crayon.ts';

/** A grumpy little monkey, a round ball of cream fur turned to the left: a pig nose, pointy ears, a frown, a curly tail. */
export default {
  id: '067', slug: 'fachinge', seed: 6701, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const FUR = '#e6c992', BROWN = '#b07a46', PINK = '#f29ab0';
    // the curly tail, the far arm and far foot, behind
    c.part('queue', { pivot: [680, 680], motion: 'swing', amp: 10, period: 1.6, behind: true }, () => {
      shape(band([[680, 680], [800, 640], [840, 540], [790, 500], [760, 550]], 36, 24), FUR, { angle: 40 });
    });
    shape(band([[340, 560], [240, 520], [190, 450]], 44, 38), FUR, { angle: 40 });
    shape(potato(180, 440, 34, 30, 8, 0.08), BROWN, { over: 0 });
    shape(potato(420, 860, 60, 32, 8, 0.06), BROWN, { over: 0 });
    // the round furry body, its edge all fluff
    const body: [number, number][] = [];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2, r = i % 2 ? 300 : 330;
      body.push([500 + Math.cos(a) * r, 560 + Math.sin(a) * r * 0.92]);
    }
    shape(body, FUR, { angle: 75, over: 0.4 }, {}, false);
    // the near foot and near arm, fist ready
    shape(potato(600, 870, 70, 34, 8, 0.06), BROWN, { over: 0 });
    c.part('poing', { pivot: [700, 560], motion: 'swing', amp: 8, period: 1.2 }, () => {
      shape(band([[700, 560], [790, 520], [840, 450]], 48, 42), FUR, { angle: 120 });
      shape(potato(850, 430, 40, 36, 8, 0.08), BROWN, { over: 0 });
    });
    // pointy ears
    shape([[300, 360], [230, 260], [340, 300]], BROWN, { over: 0 }, {}, false);
    shape([[600, 300], [680, 220], [650, 340]], BROWN, { over: 0 }, {}, false);
    // the face shifted left: a frowning brow, a pig nose, a grumpy mouth
    shape(spikes([[260, 420], [370, 400], [470, 410]], 3, -16), BROWN, { over: 0 }, {}, false);
    c.paper(potato(310, 460, 22, 24, 8, 0.05));
    c.paper(potato(420, 455, 30, 30, 8, 0.05));
    dot(310, 466, 10, 12);
    dot(418, 462, 13, 14);
    shape(potato(330, 540, 54, 40, 9, 0.06), PINK, { over: 0 }, { w: 4 });
    dot(312, 540, 7, 9);
    dot(348, 538, 7, 9);
    stroke([[290, 610], [335, 595], [385, 612]], { w: 5 });
  },
} satisfies Redraw;
