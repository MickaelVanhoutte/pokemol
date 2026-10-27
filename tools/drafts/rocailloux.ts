import type { Draft, P } from './kid.ts';

/** Cailloutou grown: a big lumpy rock turned three-quarters to the left, four stony arms, a grumpy face. */
export default {
  id: '039', slug: 'rocailloux', seed: 22, layered: true, size: [1150, 1100], tilt: 3, pivot: [575, 560],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const GREY = '#8d867c', DARK = '#655f57';
    const arm = (pts: P[], fist: P, size = 1) => {
      shape(shake(pts, 6), GREY, { gap: 12, miss: 0 });
      shape(potato(fist[0], fist[1], 70 * size, 64 * size, 7, 0.08), GREY, { gap: 11, miss: 0 });
    };
    // the far arms, behind the rock on the left
    arm([[380, 760], [270, 820], [220, 900], [280, 920], [320, 850], [400, 820]], [260, 930], 0.9);
    arm([[370, 520], [250, 450], [210, 340], [260, 320], [290, 410], [390, 470]], [230, 300], 0.9);
    // the rock: big, lumpy, with bumps on top
    for (const [x, y, r] of [[460, 350, 65], [600, 310, 85], [750, 350, 75]]) shape(potato(x, y, r, r * 0.8, 7, 0.15), GREY, { gap: 12, miss: 0.05 });
    shape(potato(590, 620, 290, 260, 12, 0.08), GREY, { gap: 16, miss: 0.06 });
    for (const [x, y, r] of [[600, 780, 34], [770, 740, 30], [740, 500, 22], [690, 820, 26]]) shape(potato(x, y, r, r * 0.8, 6, 0.15), DARK, { gap: 8, w: 9, miss: 0 }, 4.5);
    stroke([[820, 560], [790, 610], [830, 640], [810, 680]], 5);
    // the near arms, in front on the right
    k.part('bras-bas', { pivot: [820, 790], motion: 'swing', amp: -6, period: 1.3, phase: 0.5 }, () => {
      arm([[830, 760], [940, 820], [990, 900], [930, 920], [890, 850], [810, 820]], [950, 930]);
    });
    k.part('bras-haut', { pivot: [830, 495], motion: 'swing', amp: 7, period: 1.3, phase: 0 }, () => {
      arm([[840, 520], [960, 450], [1000, 340], [950, 320], [920, 410], [820, 470]], [980, 300]);
    });
    // the grumpy face, turned left
    stroke([[390, 565], [460, 600]], 11);
    stroke([[515, 605], [610, 560]], 12);
    dot(425, 632, 10, 14);
    dot(555, 632, 13, 15);
    stroke([[410, 720], [480, 695], [555, 722]], 7.5);
    for (const x of [280, 480, 700, 880]) stroke([[x, 1010], [x + 45 + j(10), 1000]], 4);
  },
} satisfies Draft;
