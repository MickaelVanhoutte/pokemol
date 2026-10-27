import type { Redraw } from './crayon.ts';

/** A little orange salamander standing up: a big round head, a cream tummy, a small flame at the tip of its tail. */
export default {
  id: '002', slug: 'braisou', seed: 204, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const ORANGE = '#f59a3c', CREAM = '#fbe2a6', RED = '#ee4a2c', YELLOW = '#f8d23c';
    // the tail curling up behind, a flame at its tip
    shape(band([[560, 780], [690, 800], [790, 740], [830, 640]], 70, 44), ORANGE, { angle: 40 });
    shape([[790, 650], [770, 550], [805, 480], [820, 400], [855, 470], [895, 420], [900, 520], [885, 630]], RED, { angle: 95, press: 1.1 }, {}, false);
    shape([[810, 625], [808, 550], [840, 500], [855, 560], [872, 520], [866, 615]], YELLOW, { angle: 95, over: 0 }, { w: 3.5 }, false);
    // short legs, three little toes
    shape(band([[430, 790], [420, 880], [410, 920]], 84, 80), ORANGE, { angle: 90 });
    shape(band([[560, 790], [575, 880], [585, 920]], 84, 80), ORANGE, { angle: 90 });
    for (const x of [380, 410, 440, 560, 590, 620]) stroke([[x, 905], [x, 935]], { w: 3.5 });
    // a round tummy
    shape([[380, 530], [500, 500], [620, 540], [650, 690], [600, 820], [480, 840], [380, 800], [350, 680]], ORANGE, { angle: 85, over: 0.5 });
    shape(potato(495, 680, 95, 125, 10, 0.05), CREAM, { angle: 80, over: 0 });
    // little arms, claws
    shape(band([[390, 590], [320, 640], [290, 700]], 54, 46), ORANGE, { angle: 40 });
    shape(spikes([[300, 690], [260, 720], [300, 740]], 1, 14), ORANGE, { over: 0 }, {}, false);
    shape(band([[610, 580], [680, 520], [720, 450]], 54, 46), ORANGE, { angle: 120 });
    shape(spikes([[700, 470], [730, 420], [750, 465]], 1, 14), ORANGE, { over: 0 }, {}, false);
    // the big round head, a short snout
    shape([[300, 330], [380, 200], [520, 170], [640, 230], [680, 360], [640, 480], [520, 540], [380, 530], [290, 450]], ORANGE, { angle: 80, over: 0.5 });
    // big eyes, a smile, nostrils
    c.paper(potato(410, 340, 42, 52, 9, 0.04));
    c.paper(potato(560, 330, 42, 52, 9, 0.04));
    shape(potato(420, 350, 26, 36, 9, 0.04), '#3f74d8', { angle: 90, over: 0, press: 1.2 }, { w: 3 });
    shape(potato(550, 340, 26, 36, 9, 0.04), '#3f74d8', { angle: 90, over: 0, press: 1.2 }, { w: 3 });
    dot(412, 338, 9, 11, '#ffffff');
    dot(542, 328, 9, 11, '#ffffff');
    dot(470, 420, 6, 5);
    dot(505, 418, 6, 5);
    stroke([[400, 450], [480, 480], [570, 448]]);
  },
} satisfies Redraw;
