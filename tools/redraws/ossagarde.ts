import type { Redraw } from './crayon.ts';

/** Osselot grown: a fierce bone guard turned to the left, a spiky skull helmet, a big bone club burning with violet wisps. */
export default {
  id: '066', slug: 'ossagarde', seed: 6601, size: [1000, 1050], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BROWN = '#9a6a3a', CREAM = '#f1dcae', BONE = '#f6f1e4', WISP = '#9a6ad6';
    // the tail and far leg, the far arm raised behind
    shape(band([[620, 820], [760, 850], [840, 790]], 56, 32), BROWN, { angle: 30 });
    shape(band([[430, 830], [410, 930], [395, 980]], 74, 68), BROWN, { angle: 90 });
    shape(band([[400, 620], [300, 560], [250, 480]], 52, 46), BROWN, { angle: 60 });
    // the body and belly
    shape(potato(510, 720, 170, 190, 12, 0.05), BROWN, { angle: 80, over: 0.5 });
    shape(potato(460, 740, 90, 120, 10, 0.05), CREAM, { over: 0 });
    // the near leg; the near arm swinging a big bone with violet wisps
    shape(band([[580, 850], [600, 940], [610, 985]], 76, 70), BROWN, { angle: 90 });
    shape(band([[640, 640], [740, 580], [780, 500]], 54, 48), BROWN, { angle: 120 });
    shape(band([[740, 560], [880, 240]], 32, 28), BONE, { angle: 70, over: 0 });
    for (const [x, y] of [[730, 580], [760, 560], [890, 225], [860, 210]] as const) shape(potato(x, y, 28, 26, 8, 0.05), BONE, { over: 0 }, { w: 3.5 });
    for (const [x, y] of [[900, 160], [940, 220], [700, 620]] as const) shape([[x, y + 30], [x - 20, y - 10], [x, y - 40], [x + 22, y - 6]], WISP, { over: 0, press: 0.9 }, { w: 3 });
    // the head under a spiky skull helmet, turned left
    shape(potato(430, 440, 160, 140, 12, 0.05), BROWN, { angle: 80, over: 0.4 });
    shape([[255, 420], [280, 290], [400, 220], [560, 240], [620, 360], [580, 440], [490, 400], [380, 400], [310, 440]], BONE, { angle: 70, over: 0.3 }, {}, false);
    shape([[420, 230], [450, 120], [480, 230]], BONE, { over: 0 }, {}, false);
    shape([[500, 240], [580, 150], [570, 270]], BONE, { over: 0 }, {}, false);
    // fierce eyes in the dark holes, a shut frown
    shape(potato(325, 360, 28, 30, 8, 0.08), '#3a3346', { over: 0, press: 1.2 }, { w: 3 });
    shape(potato(440, 350, 36, 36, 8, 0.08), '#3a3346', { over: 0, press: 1.2 }, { w: 3 });
    dot(330, 366, 7, 6, '#e8302c');
    dot(446, 356, 8, 7, '#e8302c');
    stroke([[290, 330], [350, 345]], { w: 6 });
    stroke([[410, 335], [480, 318]], { w: 6.5 });
    stroke([[285, 490], [330, 478], [385, 488]], { w: 5 });
    dot(270, 450, 8, 6);
  },
} satisfies Redraw;
