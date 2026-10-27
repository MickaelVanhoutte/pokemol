import type { Redraw } from './crayon.ts';

/** A little orange salamander, three-quarters to the left: round head and snout, a cream tummy, a small flame on its tail. */
export default {
  id: '002', slug: 'braisou', seed: 205, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const ORANGE = '#f59a3c', CREAM = '#fbe2a6', RED = '#ee4a2c', YELLOW = '#f8d23c';
    // the tail curling up behind, a flame at its tip
    c.part('queue', { pivot: [585, 760], motion: 'swing', amp: 6, period: 2, behind: true }, () => {
      shape(band([[580, 760], [710, 780], [800, 710], [830, 610]], 70, 44), ORANGE, { angle: 40 });
      shape([[790, 620], [770, 520], [805, 450], [820, 370], [855, 440], [895, 390], [900, 490], [885, 600]], RED, { angle: 95, press: 1.1 }, {}, false);
      shape([[810, 595], [808, 520], [840, 470], [855, 530], [872, 490], [866, 585]], YELLOW, { angle: 95, over: 0 }, { w: 3.5 }, false);
    });
    // the far leg and arm, behind
    shape(band([[580, 780], [610, 870], [625, 915]], 76, 70), ORANGE, { angle: 90 });
    shape(band([[590, 570], [650, 520], [680, 455]], 50, 44), ORANGE, { angle: 120 });
    shape(spikes([[662, 470], [690, 415], [715, 460]], 1, 14), ORANGE, { over: 0 }, {}, false);
    // the body and its tummy, turned to the left
    shape([[380, 540], [510, 505], [620, 550], [645, 700], [600, 820], [470, 845], [380, 790], [350, 660]], ORANGE, { angle: 85, over: 0.5 });
    shape(potato(455, 690, 78, 118, 10, 0.05), CREAM, { angle: 80, over: 0 });
    // the near leg and arm, in front
    shape(band([[440, 790], [420, 880], [400, 925]], 84, 80), ORANGE, { angle: 90 });
    for (const x of [360, 392, 424]) stroke([[x, 910], [x - 4, 940]], { w: 3.5 });
    shape(band([[400, 600], [320, 640], [270, 700]], 56, 48), ORANGE, { angle: 40 });
    shape(spikes([[280, 690], [235, 725], [282, 742]], 1, 14), ORANGE, { over: 0 }, {}, false);
    // the head: round, a snout poking out on the left
    shape([[300, 330], [360, 240], [470, 200], [580, 230], [630, 330], [610, 440], [520, 510], [390, 520], [300, 480], [235, 430], [240, 370]], ORANGE, { angle: 80, over: 0.5 });
    // the far eye, small at the edge, the near eye big
    c.paper(potato(345, 330, 30, 44, 9, 0.04));
    shape(potato(340, 340, 18, 30, 8, 0.04), '#3f74d8', { angle: 90, over: 0, press: 1.2 }, { w: 3 });
    c.paper(potato(475, 330, 46, 56, 9, 0.04));
    shape(potato(462, 342, 28, 38, 9, 0.04), '#3f74d8', { angle: 90, over: 0, press: 1.2 }, { w: 3 });
    dot(334, 330, 6, 9, '#ffffff');
    dot(455, 330, 9, 12, '#ffffff');
    dot(255, 395, 6, 5);
    stroke([[262, 440], [330, 470], [430, 455]]);
  },
} satisfies Redraw;
