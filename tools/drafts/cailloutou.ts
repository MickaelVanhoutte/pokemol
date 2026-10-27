import type { Draft } from './kid.ts';

/** A grumpy little boulder turned three-quarters to the left, two stony arms with fists up. */
export default {
  id: '030', slug: 'cailloutou', seed: 22, layered: true, size: [1100, 1000], tilt: 3, pivot: [550, 520],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const GREY = '#9a948c', DARK = '#6e6a64';
    // the far arm, behind the boulder on the left
    shape(shake([[360, 560], [230, 520], [180, 450], [230, 420], [270, 470], [370, 500]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(190, 415, 66, 60, 7, 0.08), GREY, { gap: 11, miss: 0 });
    // pebbles and dust under it
    for (const [x, y, r] of [[330, 880, 40], [520, 910, 30], [700, 885, 45]]) shape(potato(x, y, r, r * 0.7, 6, 0.15), DARK, { gap: 9, w: 9, miss: 0 }, 5);
    for (const x of [260, 450, 620, 780]) stroke([[x, 950], [x + 40 + j(10), 940]], 4);
    // the boulder, its spots and cracks
    shape(potato(520, 580, 250, 215, 11, 0.1), GREY, { gap: 16, miss: 0.06 });
    for (const [x, y, r] of [[560, 700, 30], [700, 690, 26], [650, 470, 20], [720, 590, 18]]) shape(potato(x, y, r, r * 0.8, 6, 0.15), DARK, { gap: 8, w: 9, miss: 0 }, 4.5);
    stroke([[690, 480], [660, 520], [700, 545]], 4.5);
    // the near arm, in front on the right
    shape(shake([[690, 600], [820, 560], [880, 480], [830, 450], [790, 500], [680, 540]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(870, 440, 78, 70, 7, 0.08), GREY, { gap: 11, miss: 0 });
    stroke([[845, 425], [900, 420]], 4);
    // the grumpy face, turned left
    stroke([[330, 510], [395, 545]], 10);
    stroke([[440, 545], [530, 500]], 11);
    dot(365, 572, 9, 13);
    dot(475, 572, 12, 14);
    stroke([[350, 660], [405, 640], [465, 662]], 7);
  },
} satisfies Draft;
