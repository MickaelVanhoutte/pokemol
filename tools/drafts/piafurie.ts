import type { Draft } from './kid.ts';

/** Piaflèche's evolution: a great bird, wings spread wide, a long streaming crest. Faces right. */
export default {
  id: '036', slug: 'piafurie', seed: 21, layered: true, size: [1200, 1050], tilt: 2, pivot: [600, 520],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const BROWN = '#6e3518', YEL = '#f2d132', ORANGE = '#f07a28', RED = '#e04040';
    // long fanned tail
    for (const [x, y] of [[120, 500], [80, 640], [110, 780], [180, 880]]) {
      shape(shake([[470, 620], [x, y - 35], [x - 25, y + 5], [x + 20, y + 40], [470, 700]], 8), BROWN, { gap: 13 });
      shape(shake([[x + 5, y - 25], [x - 25, y + 5], [x + 20, y + 40], [x + 70, y + 15]], 5), RED, { gap: 9, w: 9, miss: 0 }, 5);
    }
    // the far wing, spread up and back
    shape(shake([[540, 520], [420, 330], [260, 120], [340, 140], [330, 210], [420, 210], [420, 290], [500, 300], [600, 520]], 8), BROWN, { gap: 13 });
    // talons
    for (const [x0, x1] of [[560, 540], [660, 680]]) {
      stroke([[x0, 800], [x1, 940]], 8);
      for (const dx of [-50, 0, 50]) stroke([[x1, 940], [x1 + dx + j(10), 985 + j(10)]], 7);
    }
    // body and belly
    shape(potato(600, 640, 220, 180, 9, 0.05), BROWN, { gap: 14, miss: 0.06 });
    shape(potato(690, 700, 130, 125, 8, 0.07), YEL, { gap: 13, miss: 0.05 });
    // near wing spread wide up to the right
    shape(shake([[600, 600], [700, 420], [860, 160], [940, 100], [920, 190], [990, 200], [930, 290], [990, 320], [880, 380], [900, 440], [760, 520], [700, 640]], 8), BROWN, { gap: 13 });
    for (const [a, b] of [[[880, 200], [720, 520]], [[930, 300], [740, 560]]]) stroke([a as [number, number], b as [number, number]], 4.5);
    // streaming crest, behind the head
    for (const [x, y, c] of [[560, 180, RED], [520, 250, YEL], [540, 320, RED]] as [number, number, string][]) shape(shake([[800, 330], [x + 40, y - 20], [x, y], [x + 50, y + 25], [800, 370]], 6), c, { gap: 10, w: 11, miss: 0 }, 5.5);
    // head, beak, fierce eye
    shape(potato(830, 400, 130, 115, 8, 0.05), BROWN, { gap: 14, miss: 0.04 });
    shape(potato(880, 435, 80, 72, 7, 0.08), YEL, { gap: 11, miss: 0.04 });
    shape(shake([[935, 390], [1110, 440], [940, 480]], 5), ORANGE, { gap: 9, w: 10, miss: 0 }, 6.5);
    stroke([[955, 438], [1060, 442]], 4);
    dot(870, 398, 11, 14);
    stroke([[820, 352], [910, 385]], 9);
  },
} satisfies Draft;
