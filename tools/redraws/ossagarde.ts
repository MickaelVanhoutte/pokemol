import type { P, Redraw } from './crayon.ts';

/**
 * Osselot grown: a tall, lean bone guard in a fighting stance, turned to the left: a horned skull helmet
 * with a crack, red eyes in the dark holes, claws out, a big bone club raised high, burning with violet wisps.
 */
export default {
  id: '066', slug: 'ossagarde', seed: 6602, size: [1050, 1100], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BROWN = '#8a5a30', CREAM = '#f1dcae', BONE = '#f6f1e4', WISP = '#9a6ad6', DARK = '#3a3346', RED = '#e8302c', HORN = '#ddd2bb';
    const wisp = (x: number, y: number, s: number): P[] =>
      [[x, y + 40 * s], [x - 26 * s, y], [x - 6 * s, y - 20 * s], [x - 2 * s, y - 60 * s], [x + 22 * s, y - 14 * s], [x + 24 * s, y + 20 * s]];
    // a ghostly shadow under it
    c.tint(potato(520, 1050, 330, 45, 10, 0.1), WISP, { gap: 4, wash: 0.2 });
    // violet fire round the top of the club, the club itself, behind the head
    c.part('massue', { pivot: [700, 560], motion: 'swing', amp: 5, period: 2 }, () => {
      for (const [x, y, s] of [[920, 110, 1.3], [1000, 130, 1], [890, 190, 0.9]] as const) shape(wisp(x, y, s), WISP, { over: 0, press: 0.9 }, { w: 3 });
      shape(band([[820, 430], [950, 110]], 46, 40), BONE, { angle: 60, over: 0 });
      for (const [x, y, r] of [[925, 100, 44], [975, 115, 40], [815, 450, 32], [845, 455, 30]] as const) shape(potato(x, y, r, r * 0.9, 8, 0.05), BONE, { over: 0 }, { w: 3.5 });
    });
    // the tail, the far leg and the far arm reaching out with its claws, behind
    shape(band([[640, 850], [790, 900], [900, 860], [960, 780]], 74, 30), BROWN, { angle: 30 });
    shape(band([[470, 830], [410, 950], [385, 1030]], 92, 80), BROWN, { angle: 90 });
    shape(potato(360, 1045, 72, 30, 8, 0.06), BROWN, { over: 0 });
    shape(band([[410, 590], [300, 630], [205, 610]], 62, 52), BROWN, { angle: 30 });
    for (const dy of [-26, 0, 26]) c.paper([[195, 600 + dy - 9], [150, 596 + dy * 1.3], [195, 600 + dy + 9]], { w: 3 }, false);
    // the lean body, its ridged belly plate
    shape([[360, 560], [480, 500], [620, 510], [700, 600], [700, 760], [640, 880], [500, 910], [400, 860], [350, 730]], BROWN, { angle: 80, over: 0.5 });
    shape([[415, 620], [540, 600], [595, 700], [565, 840], [465, 862], [415, 760]], CREAM, { over: 0 });
    for (const y of [680, 740, 800]) stroke([[425, y], [575, y - 8]], { w: 3 });
    // the near leg, wide apart; the near arm raising the club
    shape(band([[610, 850], [655, 960], [665, 1035]], 98, 88), BROWN, { angle: 90 });
    shape(potato(695, 1050, 82, 32, 8, 0.06), BROWN, { over: 0 });
    c.part('massue', { pivot: [700, 560], motion: 'swing', amp: 5, period: 2 }, () => {
      shape(band([[640, 600], [770, 480], [830, 370]], 66, 56), BROWN, { angle: 120 });
      shape(potato(835, 365, 42, 40, 8, 0.08), BROWN, { over: 0 });
    });
    // the head under its skull helmet, two horns swept back, a crack
    shape(potato(430, 430, 150, 125, 12, 0.05), BROWN, { angle: 80, over: 0.4 });
    shape(band([[470, 250], [530, 180], [610, 140], [690, 145]], 64, 8), HORN, { angle: 20, over: 0 });
    shape(band([[560, 300], [630, 250], [710, 235], [775, 260]], 58, 8), HORN, { angle: 20, over: 0 });
    shape([[225, 420], [245, 305], [340, 235], [480, 225], [590, 275], [625, 385], [575, 445], [495, 405], [385, 410], [300, 450]], BONE, { angle: 70, over: 0.3 }, {}, false);
    stroke([[520, 235], [500, 275], [528, 300], [505, 340]], { w: 3.5 });
    dot(250, 385, 7, 9, DARK);
    dot(272, 380, 6, 8, DARK);
    // red eyes in the dark holes, a shut frown with one fang
    shape(potato(330, 350, 30, 30, 8, 0.08), DARK, { over: 0, press: 1.2 }, { w: 3 });
    shape(potato(445, 340, 38, 36, 8, 0.08), DARK, { over: 0, press: 1.2 }, { w: 3 });
    dot(334, 356, 8, 7, RED);
    dot(450, 346, 10, 8, RED);
    stroke([[285, 312], [355, 332]], { w: 6.5 });
    stroke([[410, 322], [490, 300]], { w: 7 });
    stroke([[275, 500], [330, 486], [395, 498]], { w: 5 });
    c.paper([[318, 489], [328, 514], [340, 490]], { w: 3.5 }, false);
    // wisps drifting round it
    c.part('feux', { pivot: [520, 600], motion: 'flicker', period: 2.4 }, () => {
      for (const [x, y, s] of [[180, 450, 0.8], [960, 600, 0.9], [130, 800, 0.7]] as const) shape(wisp(x, y, s), WISP, { over: 0, press: 0.8 }, { w: 3 });
    });
  },
} satisfies Redraw;
