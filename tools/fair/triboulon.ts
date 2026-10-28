import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Triboulon's fair copy, Electric/Steel, the same drawing grown up: its three balls a fifth bigger and
 * their magnets about half as big again (thicker, reaching much further out); the top ball's screw grown into a tall
 * antenna crowned with a fourth magnet, lightning between its tips; the bottom balls joined by a riveted steel bar;
 * its eyes glowing yellow under heavy steel lids, lightning arcing between the magnets and down to the bar, and the
 * gold star on the top ball.
 */
export default {
  id: '046', slug: 'triboulon', seed: 46046, size: [1470, 1400], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, potato, shake, band } = c;
    const STEEL = '#8f9cb8', RED = '#e04848', SILVER = '#c3cad8', YEL = '#f6d22c', GLOW = '#ffe14a', IRON = '#5f6a80';
    const ball = (cx: number, cy: number, s: number, magnets: number[]) => {
      // much bigger magnets: thicker, reaching much further out
      for (const dir of magnets) {
        const x = cx + dir * 138 * s;
        shape(band([[x, cy - 100 * s], [x + dir * 114 * s, cy - 90 * s], [x + dir * 170 * s, cy], [x + dir * 114 * s, cy + 90 * s], [x, cy + 100 * s]], 90 * s), RED, { angle: 60 });
        c.shine([[x + dir * 105 * s, cy - 70 * s], [x + dir * 140 * s, cy - 25 * s]], 7);
        for (const y of [cy - 100 * s, cy + 100 * s]) shape(shake([[x - dir * 6 * s, y - 42 * s], [x + dir * 48 * s, y - 42 * s], [x + dir * 48 * s, y + 42 * s], [x - dir * 6 * s, y + 42 * s]], 2), SILVER, { over: 0 }, { w: 4.5 }, false);
      }
      // a taller screw, its thread
      shape(shake([[cx - 22 * s, cy - 128 * s], [cx + 22 * s, cy - 128 * s], [cx + 24 * s, cy - 222 * s], [cx - 24 * s, cy - 222 * s]], 2), STEEL, { over: 0 }, { w: 4.5 }, false);
      for (const t of [0.35, 0.65]) stroke([[cx - 22 * s, cy - (128 + 94 * t) * s + 6], [cx + 22 * s, cy - (128 + 94 * t) * s - 6]], { w: 4, col: IRON });
      shape(potato(cx, cy - 226 * s, 42 * s, 15 * s, 8, 0.05), SILVER, { over: 0 }, { w: 4.5 });
      shape(potato(cx, cy, 140 * s, 135 * s, 11, 0.03), STEEL, { angle: 70 });
      // its eye looks to the left, glowing yellow, under a heavy steel lid
      c.tint(potato(cx - 50 * s, cy - 2 * s, 74 * s, 82 * s, 9, 0.03), GLOW, { angle: 30, wash: 0.4, press: 0.9 });
      shape(potato(cx - 50 * s, cy - 2 * s, 52 * s, 60 * s, 9, 0.03), '#ffffff', { over: 0, wash: 0 }, { w: 6 });
      dot(cx - 58 * s, cy + 4 * s, 22 * s, 27 * s);
      dot(cx - 50 * s, cy - 8 * s, 6 * s, 6 * s, '#ffffff');
      shape([[cx - 110 * s, cy - 14 * s], [cx - 98 * s, cy - 58 * s], [cx - 50 * s, cy - 76 * s], [cx + 6 * s, cy - 64 * s], [cx + 6 * s, cy - 44 * s], [cx - 50 * s, cy - 44 * s]], IRON, { angle: 10, over: 0 }, { w: 5 });
      c.shine([[cx + 60 * s, cy - 90 * s], [cx + 95 * s, cy - 55 * s]], 7);
    };
    /** A zig-zag of lightning from `a` to `b`. */
    const bolt = (a: P, b: P, n: number, kick: number) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const path: P[] = Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n, k = i === 0 || i === n ? 0 : (i % 2 ? 1 : -1) * kick;
        return [a[0] + dx * t + nx * k, a[1] + dy * t + ny * k];
      });
      shape(band(path, 30, 18), YEL, { angle: 60, over: 0 }, { w: 4.5 }, false);
    };
    // the bottom balls joined by a riveted steel bar
    shape(band([[441, 1040], [1029, 1040]], 76), STEEL, { angle: 80, over: 0 }, { w: 6 });
    for (const x of [600, 680, 790, 870]) dot(x, 1040, 9, 9, IRON);
    c.shine([[600, 1016], [870, 1016]], 6);
    // the two bottom balls: the pencil drawing's triangle a fifth bigger
    ball(441, 1040, 1.14, [-1]);
    ball(1029, 1040, 1.14, [1]);
    // the top ball's screw grown into a tall antenna, crowned with a fourth magnet
    shape([[713, 540], [757, 540], [753, 240], [717, 240]], STEEL, { angle: 90, over: 0 }, { w: 5 }, false);
    for (const y of [470, 400, 330]) stroke([[713, y + 8], [757, y - 8]], { w: 5, col: IRON });
    shape(band([[630, 95], [626, 175], [660, 238], [735, 258], [810, 238], [844, 175], [840, 95]], 74), RED, { angle: 60 });
    c.shine([[650, 140], [672, 210]], 7);
    for (const x of [630, 840]) shape(shake([[x - 37, 60], [x + 37, 60], [x + 37, 112], [x - 37, 112]], 2), SILVER, { over: 0 }, { w: 4.5 }, false);
    // the top ball, in front of them all
    ball(735, 680, 1.26, [-1, 1]);
    c.star(810, 765, 52, -8);
    // lightning arcing between the magnets, down to the bar and between the tips of the crown
    c.part('etincelles', { pivot: [735, 800], motion: 'flicker', period: 1.4 }, () => {
      bolt([402, 830], [168, 900], 5, 30);
      bolt([1068, 830], [1302, 900], 5, 30);
      bolt([735, 848], [735, 1006], 5, 28);
      bolt([670, 82], [800, 82], 4, 22);
    });
  },
} satisfies Fair;
