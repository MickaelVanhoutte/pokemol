import type { P, Redraw } from './crayon.ts';

/**
 * Antennou grown into a tall silver lemur standing upright, turned to the left, one arm raised to the stormy sky: its
 * antenna tail is taller, with more rings and a big silver ball at the tip that catches lightning, and its crackling fur
 * has grown into a fluffy collar round its face. It keeps Antennou's silver-grey fur, pale face and huge amber eyes.
 */
export default {
  id: '046', slug: 'lemurage', seed: 4631, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const FUR = '#a8b0be', DEEP = '#7e8698', FACE = '#eef0f4', RING = '#4e5464', SILVER = '#dfe4ec', AMBER = '#f2a93a', SPARK = '#ffe34a';
    // the tall antenna tail behind (it sways in battle)
    c.part('antenne', { pivot: [640, 760], motion: 'swing', amp: 4, period: 2.2, behind: true }, () => {
      const tail: P[] = [[640, 760], [740, 640], [790, 440], [790, 240], [770, 90]];
      shape(band(tail, 64, 40), FUR, { angle: 80 });
      for (const [a, b] of [[[730, 650], [756, 610]], [[786, 500], [790, 450]], [[792, 360], [792, 310]], [[788, 220], [784, 180]], [[778, 130], [774, 110]]] as [P, P][]) shape(band([a, b], 66, 58), RING, { angle: 80, over: 0 }, { w: 4 });
      shape(potato(768, 60, 52, 52, 10, 0.03), SILVER, { press: 1.1 });
      dot(752, 44, 10, 12, '#ffffff');
    });
    // only in battle: a lightning bolt crackling down to the tip
    c.part('eclair', { pivot: [850, 90], motion: 'flicker', extra: true }, () => {
      shape([[880, 30], [840, 70], [866, 76], [820, 126], [890, 70], [864, 64]], SPARK, { over: 0 }, { w: 3.5 }, false);
    });
    // the far leg and far arm raised
    shape(band([[580, 760], [600, 880]], 70, 60), DEEP, { angle: 90 });
    shape(potato(606, 896, 64, 30, 8, 0.06), DEEP, { angle: 10 });
    shape(band([[580, 470], [650, 360], [660, 260]], 56, 44), DEEP, { angle: 70 });
    // the tall body, a pale chest, the near leg
    shape([[420, 860], [400, 700], [420, 540], [480, 450], [580, 450], [640, 540], [650, 700], [620, 860]], FUR, { angle: 80, over: 0.3 });
    c.tint(potato(510, 600, 70, 130, 10, 0.06), FACE, { angle: 80, wash: 0.6 });
    shape(band([[460, 780], [440, 880]], 76, 66), FUR, { angle: 90 });
    shape(potato(428, 896, 70, 32, 8, 0.06), FUR, { angle: 10 });
    // the fluffy crackling collar, the head, round ears
    shape(spikes([[260, 420], [280, 300], [380, 220], [500, 220], [600, 300], [620, 430], [560, 520], [420, 540], [300, 500]], 2, 30), FUR, { angle: 60 }, {}, false);
    shape(potato(330, 220, 50, 48, 9, 0.05), DEEP, { angle: 60 });
    shape(potato(560, 210, 58, 56, 9, 0.05), FUR, { angle: 60 });
    c.tint(potato(560, 214, 30, 28, 8, 0.05), '#f2b4c4', { wash: 0.6 });
    shape(potato(430, 370, 150, 130, 12, 0.03), FUR, { angle: 78, over: 0.3 });
    c.tint(potato(400, 400, 120, 96, 12, 0.04), FACE, { angle: 60, wash: 0.8 });
    // huge amber eyes, confident
    c.eye(350, 370, 40, 42, AMBER);
    c.eye(466, 364, 50, 52, AMBER);
    c.cheek(532, 446, 26, 15);
    dot(306, 440, 14, 10);
    stroke([[296, 466], [322, 480], [350, 468]], { w: 4.5 });
    // the near arm stretched out towards the foe (it points in battle)
    c.part('bras', { pivot: [440, 520], motion: 'swing', amp: 6, period: 1.6 }, () => {
      shape(band([[450, 520], [340, 560], [240, 540]], 60, 46), FUR, { angle: 20 });
      shape(potato(216, 532, 36, 30, 8, 0.05), FUR, { angle: 40 });
    });
    c.part('paupieres', { pivot: [408, 366], motion: 'blink', extra: true }, () => {
      c.lid(350, 370, 40, 42, FACE);
      c.lid(466, 364, 50, 52, FACE);
    });
  },
} satisfies Redraw;
