import type { Draft } from './kid.ts';

/** Boulonnet's evolution: three magnet balls stuck together in a triangle, crackling. */
export default {
  id: '046', slug: 'triboulon', seed: 21, layered: true, size: [1150, 1100], tilt: 2, pivot: [575, 550],
  draw(k) {
    const { potato, shake, shape, dot, band } = k;
    const STEEL = '#8f9cb8', RED = '#e04848', SILVER = '#c3cad8', YEL = '#f6d22c';
    const ball = (cx: number, cy: number, s: number, magnets: number[]) => {
      for (const dir of magnets) {
        const x = cx + dir * 140 * s;
        shape(band([[x, cy - 90 * s], [x + dir * 85 * s, cy - 75 * s], [x + dir * 115 * s, cy], [x + dir * 85 * s, cy + 75 * s], [x, cy + 90 * s]], 32 * s), RED, { gap: 11, miss: 0 });
        for (const y of [cy - 90 * s, cy + 90 * s]) shape(shake([[x - dir * 6 * s, y - 32 * s], [x + dir * 36 * s, y - 32 * s], [x + dir * 36 * s, y + 32 * s], [x - dir * 6 * s, y + 32 * s]], 3), SILVER, { gap: 7, w: 8, miss: 0 }, 4.5);
      }
      shape(shake([[cx - 18 * s, cy - 130 * s], [cx + 18 * s, cy - 130 * s], [cx + 20 * s, cy - 195 * s], [cx - 20 * s, cy - 195 * s]], 3), STEEL, { gap: 7, w: 8, miss: 0 }, 4.5);
      shape(potato(cx, cy - 198 * s, 34 * s, 13 * s, 6, 0.08), SILVER, { gap: 6, w: 7, miss: 0 }, 4.5);
      shape(potato(cx, cy, 140 * s, 135 * s, 10, 0.04), STEEL, { gap: 14, miss: 0.05 });
      shape(potato(cx, cy - 5 * s, 62 * s, 58 * s, 9, 0.03), '#ffffff', { gap: 9, w: 6, miss: 0.6 }, 6);
      dot(cx + 6 * s, cy + 2 * s, 25 * s, 27 * s);
      dot(cx + 18 * s, cy - 12 * s, 7 * s);
    };
    // the two bottom balls, then the top one in front of them
    ball(330, 720, 0.95, [-1]);
    ball(820, 720, 0.95, [1]);
    ball(575, 420, 1.05, [-1, 1]);
    for (const [x, y] of [[150, 300], [960, 280], [575, 980], [180, 1000], [980, 990]]) shape(shake([[x, y], [x + 30, y - 40], [x + 22, y - 12], [x + 50, y - 30], [x + 18, y + 20], [x + 26, y - 6]], 3), YEL, { gap: 6, w: 7, miss: 0 }, 4);
  },
} satisfies Draft;
