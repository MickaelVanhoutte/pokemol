import type { Draft } from './kid.ts';

/** Sifflasse's evolution: a tall cobra, hood spread wide with a scary face drawn on it. */
export default {
  id: '043', slug: 'cobrasse', seed: 21, layered: true, size: [1100, 1150], tilt: 2, pivot: [550, 580],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot, band } = k;
    const PURPLE = '#7a3fb4', YEL = '#f2cf3a', RED = '#e04040', GREEN = '#7fcf55';
    // coils on the ground
    shape(band([[640, 1000], [800, 990], [920, 930], [990, 860]], 34, 16), PURPLE, { gap: 12 });
    shape(potato(520, 960, 320, 110, 10, 0.05), PURPLE, { gap: 15, miss: 0.05, angle: -20 });
    shape(potato(520, 840, 250, 95, 9, 0.05), PURPLE, { gap: 14, miss: 0.05, angle: -20 });
    for (const x of [300, 430, 570, 700]) stroke([[x, 890 + j(10)], [x + 15, 1050 + j(10)]], 7);
    // neck up to the hood
    shape(band([[560, 820], [600, 690], [570, 560]], 70, 60), PURPLE, { gap: 14, miss: 0.04 });
    // the hood, spread wide but turned left: narrower on its far side, the face pattern shifted left
    shape(shake([[340, 420], [380, 250], [520, 180], [690, 230], [780, 420], [720, 610], [560, 680], [410, 620]], 8), PURPLE, { gap: 15, miss: 0.05 });
    shape(potato(430, 430, 40, 42, 7, 0.08), YEL, { gap: 9, w: 10, miss: 0 }, 5);
    shape(potato(580, 430, 58, 46, 7, 0.08), YEL, { gap: 9, w: 10, miss: 0 }, 5);
    shape(shake([[440, 530], [505, 570], [570, 530], [505, 600]], 5), RED, { gap: 8, w: 9, miss: 0 }, 5);
    // the head on top, turned left: a snout, slit eyes (the far one smaller), tongue
    shape(shake([[400, 220], [440, 150], [540, 130], [620, 170], [630, 240], [560, 290], [440, 295], [390, 260]], 5), PURPLE, { gap: 13, miss: 0.03 });
    shape(potato(455, 195, 18, 18, 6, 0.08), YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
    stroke([[455, 182], [456, 208]], 5);
    shape(potato(540, 192, 26, 20, 6, 0.08), YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
    stroke([[540, 176], [542, 210]], 6);
    stroke([[430, 165], [470, 182]], 6);
    stroke([[515, 182], [575, 162]], 7);
    shape(shake([[410, 270], [340, 300], [300, 280], [325, 310], [295, 335], [345, 312], [415, 285]], 3), RED, { gap: 6, w: 7, miss: 0 }, 4);
    dot(408, 240, 4); dot(425, 242, 4);
    for (const [x, y] of [[200, 300], [880, 260], [900, 620]]) shape([[x, y - 30], [x + 14, y], [x + 9, y + 14], [x - 9, y + 14], [x - 14, y]], GREEN, { gap: 7, w: 8, miss: 0 }, 4.5);
  },
} satisfies Draft;
