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
    // the hood, spread wide, with a face pattern
    shape(potato(540, 420, 240, 250, 10, 0.05), PURPLE, { gap: 15, miss: 0.05 });
    shape(potato(450, 430, 55, 45, 7, 0.08), YEL, { gap: 9, w: 10, miss: 0 }, 5);
    shape(potato(630, 430, 55, 45, 7, 0.08), YEL, { gap: 9, w: 10, miss: 0 }, 5);
    shape(shake([[470, 530], [540, 570], [610, 530], [540, 600]], 5), RED, { gap: 8, w: 9, miss: 0 }, 5);
    // the head on top, slit eyes, tongue
    shape(potato(540, 210, 110, 85, 8, 0.05), PURPLE, { gap: 13, miss: 0.03 });
    for (const x of [500, 585]) {
      shape(potato(x, 195, 26, 20, 6, 0.08), YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
      stroke([[x, 180], [x + 2, 212]], 6);
    }
    stroke([[470, 165], [520, 185]], 7);
    stroke([[570, 185], [620, 165]], 7);
    shape(shake([[540, 285], [530, 360], [500, 395], [538, 375], [560, 400], [550, 360], [552, 285]], 3), RED, { gap: 6, w: 7, miss: 0 }, 4);
    dot(525, 245, 4); dot(555, 245, 4);
    for (const [x, y] of [[200, 300], [880, 260], [900, 620]]) shape([[x, y - 30], [x + 14, y], [x + 9, y + 14], [x - 9, y + 14], [x - 14, y]], GREEN, { gap: 7, w: 8, miss: 0 }, 4.5);
  },
} satisfies Draft;
