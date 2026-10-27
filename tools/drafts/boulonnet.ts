import type { Draft } from './kid.ts';

/** A steel ball with one big eye, two red horseshoe magnets and screws, crackling. */
export default {
  id: '035', slug: 'boulonnet', seed: 21, layered: true, size: [1100, 1050], tilt: -2, pivot: [550, 520],
  draw(k) {
    const { potato, shake, shape, stroke, dot, band } = k;
    const STEEL = '#8f9cb8', RED = '#e04848', SILVER = '#c3cad8', YEL = '#f6d22c';
    // the two magnets on its sides, silver tips
    // turned left: the far magnet (left) smaller and closer in, the near one bigger
    for (const [dir, s] of [[-1, 0.75], [1, 1.1]] as [number, number][]) {
      const x = 520 + dir * 180 * s, cy = 520;
      shape(band([[x, cy - 120 * s], [x + dir * 120 * s, cy - 100 * s], [x + dir * 160 * s, cy], [x + dir * 120 * s, cy + 100 * s], [x, cy + 120 * s]], 44 * s), RED, { gap: 12, miss: 0 });
      for (const y of [cy - 120 * s, cy + 120 * s]) shape(shake([[x - dir * 10, y - 44 * s], [x + dir * 50 * s, y - 44 * s], [x + dir * 50 * s, y + 44 * s], [x - dir * 10, y + 44 * s]], 4), SILVER, { gap: 8, w: 9, miss: 0 }, 5);
    }
    // screws on top and below
    shape(shake([[495, 340], [545, 340], [548, 250], [492, 250]], 4), STEEL, { gap: 8, w: 9, miss: 0 }, 5);
    shape(potato(520, 245, 45, 18, 6, 0.08), SILVER, { gap: 7, w: 8, miss: 0 }, 5);
    shape(shake([[495, 700], [545, 700], [548, 790], [492, 790]], 4), STEEL, { gap: 8, w: 9, miss: 0 }, 5);
    shape(potato(520, 795, 45, 18, 6, 0.08), SILVER, { gap: 7, w: 8, miss: 0 }, 5);
    // the ball and its big eye
    shape(potato(520, 520, 195, 185, 10, 0.04), STEEL, { gap: 15, miss: 0.05 });
    stroke([[420, 420], [450, 390]], 6);
    shape(potato(450, 515, 70, 80, 9, 0.03), '#ffffff', { gap: 9, w: 6, miss: 0.6 }, 6.5);
    dot(440, 525, 30, 36);
    dot(452, 508, 8);
    // sparks
    for (const [x, y] of [[180, 260], [860, 260], [200, 760], [840, 780]]) shape(shake([[x, y], [x + 30, y - 40], [x + 22, y - 12], [x + 50, y - 30], [x + 18, y + 20], [x + 26, y - 6]], 3), YEL, { gap: 6, w: 7, miss: 0 }, 4);
  },
} satisfies Draft;
