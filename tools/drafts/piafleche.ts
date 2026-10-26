import type { Draft } from './kid.ts';

/** Piafou's evolution: a bigger bird, wings up, a crest of three feathers, long tail. Faces right. */
export default {
  id: '026', slug: 'piafleche', seed: 21, layered: true, size: [1100, 1050], tilt: 2, pivot: [550, 520],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const BROWN = '#7a3f1d', YEL = '#f2d132', ORANGE = '#f07a28', RED = '#e04040';
    // long tail feathers
    for (const [x, y] of [[110, 540], [90, 660], [130, 780]]) shape(shake([[430, 610], [x, y - 30], [x - 20, y + 10], [x + 30, y + 40], [430, 680]], 8), BROWN, { gap: 13 });
    for (const [x, y] of [[110, 540], [90, 660], [130, 780]]) shape(shake([[x + 10, y - 20], [x - 20, y + 10], [x + 30, y + 40], [x + 70, y + 20]], 5), YEL, { gap: 9, w: 9, miss: 0 }, 5);
    // far wing raised behind
    shape(shake([[520, 520], [430, 300], [330, 130], [300, 170], [340, 260], [300, 300], [360, 380], [330, 430], [430, 560]], 8), BROWN, { gap: 13 });
    // stick legs with three toes
    for (const [x0, x1] of [[530, 500], [620, 640]]) {
      stroke([[x0, 790], [x1, 950]], 7);
      for (const dx of [-45, 0, 45]) stroke([[x1, 950], [x1 + dx + j(10), 990 + j(10)]], 6);
    }
    // body and yellow belly
    shape(potato(560, 630, 200, 175, 9, 0.06), BROWN, { gap: 14, miss: 0.08 });
    shape(potato(640, 700, 125, 120, 8, 0.08), YEL, { gap: 13, miss: 0.05 });
    // near wing, raised, with feather lines
    shape(shake([[460, 600], [400, 400], [420, 210], [470, 250], [520, 200], [550, 290], [610, 280], [620, 420], [640, 560]], 8), BROWN, { gap: 13 });
    for (const [a, b] of [[[470, 280], [500, 500]], [[540, 320], [560, 520]]]) stroke([a as [number, number], b as [number, number]], 4);
    // crest of three feathers, then the head
    for (const [x, y, c] of [[640, 150, RED], [720, 120, YEL], [800, 150, RED]] as [number, number, string][]) shape(shake([[700, 330], [x - 20, y + 30], [x, y], [x + 25, y + 20], [760, 330]], 6), c, { gap: 10, w: 10, miss: 0 }, 5.5);
    shape(potato(760, 420, 125, 115, 8, 0.06), BROWN, { gap: 14, miss: 0.05 });
    shape(potato(805, 455, 75, 70, 7, 0.08), YEL, { gap: 11, miss: 0.05 });
    // beak and a fierce eye
    shape(shake([[860, 410], [1000, 450], [865, 490]], 5), ORANGE, { gap: 9, w: 10, miss: 0 }, 6);
    stroke([[880, 450], [960, 452]], 4);
    dot(800, 418, 11, 14);
    stroke([[750, 372], [835, 400]], 8);
  },
} satisfies Draft;
