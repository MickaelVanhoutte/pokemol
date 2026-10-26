import type { Draft } from './kid.ts';

/** Taupinou's evolution: three moles popping out of one big molehill, each its own size. */
export default {
  id: '041', slug: 'taupitrio', seed: 21, layered: true, size: [1200, 1000], tilt: -2, pivot: [600, 520],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const BROWN = '#8a5a34', EARTH = '#6b4a2b', PINK = '#f07f9a', PAW = '#f0b6a0';
    const mole = (x: number, y: number, s: number) => {
      shape(potato(x, y, 110 * s, 220 * s, 9, 0.05), BROWN, { gap: 14, miss: 0.06 });
      stroke([[x - 70 * s, y - 85 * s], [x - 32 * s, y - 75 * s]], 7);
      stroke([[x + 32 * s, y - 75 * s], [x + 70 * s, y - 85 * s]], 7);
      shape(potato(x, y - 25 * s, 52 * s, 40 * s, 7, 0.06), PINK, { gap: 8, w: 10, miss: 0 }, 6);
      dot(x - 14 * s, y - 30 * s, 6); dot(x + 14 * s, y - 30 * s, 6);
      for (const d of [-1, 1]) {
        stroke([[x + d * 55 * s, y - 15 * s], [x + d * 140 * s, y - 35 * s]], 3.5);
        stroke([[x + d * 55 * s, y + 5 * s], [x + d * 140 * s, y + 20 * s]], 3.5);
      }
      stroke([[x - 35 * s, y + 55 * s], [x, y + 72 * s], [x + 35 * s, y + 55 * s]], 5);
    };
    // the middle one is the tallest; the right one looks the other way
    mole(330, 520, 0.85);
    mole(860, 540, 0.8);
    mole(600, 430, 1.05);
    // one big molehill in front
    shape(shake([[60, 940], [170, 760], [330, 680], [600, 650], [880, 680], [1040, 770], [1140, 940]], 14), EARTH, { gap: 15, miss: 0.04, angle: -20 });
    for (const [x, y, r] of [[250, 840, 28], [480, 870, 30], [720, 860, 26], [930, 840, 24], [600, 910, 20], [380, 920, 22]]) shape(potato(x, y, r, r * 0.75, 6, 0.15), BROWN, { gap: 8, w: 8, miss: 0 }, 4.5);
    for (const x of [120, 170, 1080]) stroke([[x, 940], [x - 10 + j(10), 890], [x + 10, 940], [x + 22, 895]], 4.5);
    for (const x of [270, 400, 530, 670, 800, 920]) {
      shape(potato(x, 668, 48, 30, 7, 0.08), PAW, { gap: 9, w: 10, miss: 0 }, 5);
      for (const dx of [-24, -6, 12, 30]) stroke([[x + dx, 692], [x + dx - 4, 712]], 3.5);
    }
  },
} satisfies Draft;
