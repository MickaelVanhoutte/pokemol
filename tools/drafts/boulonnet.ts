import type { Draft } from './kid.ts';

/** A steel ball with one big eye, two red horseshoe magnets and screws, crackling. */
export default {
  id: '035', slug: 'boulonnet', seed: 21, layered: true, size: [1100, 1050], tilt: -2, pivot: [550, 520],
  draw(k) {
    const { potato, shake, shape, stroke, dot, band } = k;
    const STEEL = '#8f9cb8', RED = '#e04848', SILVER = '#c3cad8', YEL = '#f6d22c';
    // the two magnets on its sides, silver tips
    for (const dir of [-1, 1]) {
      const x = 520 + dir * 200;
      shape(band([[x, 400], [x + dir * 120, 420], [x + dir * 160, 520], [x + dir * 120, 620], [x, 640]], 44), RED, { gap: 12, miss: 0 });
      for (const y of [400, 640]) shape(shake([[x - dir * 10, y - 44], [x + dir * 50, y - 44], [x + dir * 50, y + 44], [x - dir * 10, y + 44]], 4), SILVER, { gap: 8, w: 9, miss: 0 }, 5);
    }
    // screws on top and below
    shape(shake([[495, 340], [545, 340], [548, 250], [492, 250]], 4), STEEL, { gap: 8, w: 9, miss: 0 }, 5);
    shape(potato(520, 245, 45, 18, 6, 0.08), SILVER, { gap: 7, w: 8, miss: 0 }, 5);
    shape(shake([[495, 700], [545, 700], [548, 790], [492, 790]], 4), STEEL, { gap: 8, w: 9, miss: 0 }, 5);
    shape(potato(520, 795, 45, 18, 6, 0.08), SILVER, { gap: 7, w: 8, miss: 0 }, 5);
    // the ball and its big eye
    shape(potato(520, 520, 195, 185, 10, 0.04), STEEL, { gap: 15, miss: 0.05 });
    stroke([[420, 420], [450, 390]], 6);
    shape(potato(520, 515, 85, 80, 9, 0.03), '#ffffff', { gap: 9, w: 6, miss: 0.6 }, 6.5);
    dot(530, 525, 34, 36);
    dot(546, 508, 9);
    // sparks
    for (const [x, y] of [[180, 260], [860, 260], [200, 760], [840, 780]]) shape(shake([[x, y], [x + 30, y - 40], [x + 22, y - 12], [x + 50, y - 30], [x + 18, y + 20], [x + 26, y - 6]], 3), YEL, { gap: 6, w: 7, miss: 0 }, 4);
  },
} satisfies Draft;
