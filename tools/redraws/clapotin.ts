import type { Redraw } from './crayon.ts';

/** A blue turtle standing up, big round head, a brown checked shell on its back it drums on. */
export default {
  id: '003', slug: 'clapotin', seed: 303, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#4a86e0', LIGHT = '#9cc8f2', BROWN = '#a8672e', CREAM = '#f6deaa';
    // a curly tail behind
    shape(band([[620, 760], [720, 800], [760, 740], [720, 700]], 48, 30), BLUE, { angle: 40 });
    // the shell on its back, checked
    shape([[560, 420], [700, 430], [760, 560], [740, 720], [640, 790], [560, 760]], BROWN, { angle: 80, press: 1.05, over: 0.6 });
    for (const y of [520, 610, 700]) stroke([[575, y], [748, y - 10]], { w: 4 });
    for (const x of [620, 690]) stroke([[x, 440], [x - 5, 780]], { w: 4 });
    // legs and feet
    shape(band([[440, 760], [430, 860], [420, 910]], 80, 76), BLUE, { angle: 90 });
    shape(band([[560, 760], [575, 860], [585, 910]], 80, 76), BLUE, { angle: 90 });
    // the body and its pale belly
    shape([[380, 480], [520, 450], [610, 520], [620, 700], [560, 800], [420, 800], [360, 700], [350, 570]], BLUE, { angle: 85, over: 0.5 });
    shape([[400, 520], [510, 505], [560, 600], [545, 740], [440, 760], [395, 660]], CREAM, { angle: 0, over: 0 });
    for (const y of [580, 650, 720]) stroke([[405, y], [548, y - 5]], { w: 3 });
    // arms: one drumming on the shell, one waving
    shape(band([[580, 520], [660, 560], [700, 600]], 54, 48), BLUE, { angle: 30 });
    shape(band([[380, 520], [300, 470], [260, 380]], 54, 48), BLUE, { angle: 70 });
    // the big head
    shape(potato(450, 330, 170, 150, 12, 0.05), BLUE, { angle: 80, over: 0.5 });
    shape(potato(370, 320, 40, 52, 9, 0.05), '#ffffff', { over: 0, press: 0.4 }, { w: 4 });
    shape(potato(500, 315, 40, 52, 9, 0.05), '#ffffff', { over: 0, press: 0.4 }, { w: 4 });
    dot(380, 330, 18, 25);
    dot(490, 325, 18, 25);
    stroke([[360, 410], [430, 440], [520, 405]]);
    shape(potato(300, 380, 24, 16, 7, 0.1), LIGHT, { over: 0 }, { w: 0.1 });
  },
} satisfies Redraw;
