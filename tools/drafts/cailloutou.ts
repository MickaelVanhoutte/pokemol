import type { Draft } from './kid.ts';

/** A boulder with arms and fists, cracks and frowning brows, floating over a few pebbles. */
export default {
  id: '030', slug: 'cailloutou', seed: 21, layered: true, size: [1100, 1000], tilt: 3, pivot: [550, 520],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const GREY = '#9a948c', DARK = '#6e6a64';
    // arms out to the sides, fists up
    shape(shake([[320, 560], [190, 520], [140, 450], [190, 420], [230, 470], [330, 500]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(150, 415, 75, 68, 7, 0.08), GREY, { gap: 11, miss: 0 });
    stroke([[120, 395], [175, 400]], 4);
    shape(shake([[700, 560], [830, 520], [880, 450], [830, 420], [790, 470], [690, 500]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(870, 415, 75, 68, 7, 0.08), GREY, { gap: 11, miss: 0 });
    stroke([[845, 400], [900, 395]], 4);
    // pebbles and dust under it
    for (const [x, y, r] of [[330, 880, 40], [520, 910, 30], [700, 885, 45]]) shape(potato(x, y, r, r * 0.7, 6, 0.15), DARK, { gap: 9, w: 9, miss: 0 }, 5);
    for (const x of [260, 450, 620, 780]) stroke([[x, 950], [x + 40 + j(10), 940]], 4);
    // the boulder, its spots and cracks
    shape(potato(510, 580, 250, 215, 11, 0.1), GREY, { gap: 16, miss: 0.06 });
    for (const [x, y, r] of [[360, 690, 32], [640, 700, 26], [600, 470, 20], [700, 600, 18]]) shape(potato(x, y, r, r * 0.8, 6, 0.15), DARK, { gap: 8, w: 9, miss: 0 }, 4.5);
    stroke([[300, 560], [340, 590], [320, 630], [355, 660]], 4.5);
    stroke([[690, 480], [660, 520], [700, 545]], 4.5);
    // grumpy face
    stroke([[400, 500], [490, 545]], 11);
    stroke([[540, 545], [630, 500]], 11);
    dot(455, 570, 12, 14);
    dot(580, 570, 12, 14);
    stroke([[455, 660], [515, 640], [575, 662]], 7);
  },
} satisfies Draft;
