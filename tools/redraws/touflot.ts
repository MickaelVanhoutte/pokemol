import type { Redraw } from './crayon.ts';

/** Touffou turned water: sleek light blue, yellow fin ears and frill, a dark blue fin down its back, a fish tail, tongue out. */
export default {
  id: '017', slug: 'touflot', seed: 1717, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, spikes, potato } = c;
    const AQUA = '#8cc8ee', BLUE = '#2f5fc8', YELLOW = '#f6d23a', PINK = '#f17a96';
    // the fish tail swishing behind
    shape(band([[360, 700], [230, 760], [130, 730], [90, 660]], 90, 50), AQUA, { angle: 30 });
    shape([[100, 680], [20, 600], [60, 690], [10, 760], [110, 720]], AQUA, { angle: 60 }, {}, false);
    // sitting body and legs
    shape([[400, 480], [600, 420], [700, 560], [720, 760], [640, 880], [430, 880], [340, 760], [340, 600]], AQUA, { angle: 80, over: 0.6 });
    shape(band([[600, 700], [620, 820], [640, 900]], 60, 56), AQUA, { angle: 90 });
    shape(band([[690, 700], [700, 820], [710, 900]], 60, 56), AQUA, { angle: 90 });
    // the dark blue spiky fin down its back
    shape(spikes([[560, 440], [470, 500], [400, 570], [350, 660]], 2, -55).concat([[380, 680], [440, 590], [520, 520], [590, 470]]), BLUE, { angle: 60, press: 1.1 }, {}, false);
    // the white frill around the neck
    c.paper(potato(640, 430, 120, 70, 12, 0.12));
    // the head, yellow fin ears and a fin crest
    shape([[600, 300], [460, 170], [480, 280]], YELLOW, { angle: 30, press: 1.1 }, {}, false);
    shape([[760, 290], [900, 160], [880, 290]], YELLOW, { angle: 150, press: 1.1 }, {}, false);
    shape([[660, 230], [690, 120], [720, 230]], BLUE, { over: 0, press: 1.1 }, {}, false);
    shape(potato(690, 330, 125, 105, 12, 0.05), AQUA, { angle: 80, over: 0.5 });
    // happy closed eyes, tongue out
    stroke([[620, 310], [645, 290], [670, 312]], { w: 6 });
    stroke([[720, 305], [745, 285], [770, 308]], { w: 6 });
    stroke([[640, 380], [695, 400], [745, 378]]);
    shape([[675, 395], [715, 395], [712, 440], [680, 440]], PINK, { over: 0 }, { w: 4 });
    dot(695, 352, 9, 6);
  },
} satisfies Redraw;
