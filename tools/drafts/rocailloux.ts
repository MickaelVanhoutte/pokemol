import type { Draft, P } from './kid.ts';

/** Cailloutou's evolution: a bigger lumpy rock with four arms, two up and two down. */
export default {
  id: '039', slug: 'rocailloux', seed: 21, layered: true, size: [1150, 1100], tilt: 3, pivot: [575, 560],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const GREY = '#8d867c', DARK = '#655f57';
    const arm = (pts: P[], fist: P) => {
      shape(shake(pts, 6), GREY, { gap: 12, miss: 0 });
      shape(potato(fist[0], fist[1], 70, 64, 7, 0.08), GREY, { gap: 11, miss: 0 });
    };
    // lower arms on the ground, upper arms raised
    arm([[340, 760], [230, 820], [180, 900], [240, 920], [280, 850], [360, 820]], [220, 930]);
    arm([[810, 760], [920, 820], [970, 900], [910, 920], [870, 850], [790, 820]], [930, 930]);
    arm([[330, 520], [210, 450], [170, 340], [220, 320], [250, 410], [350, 470]], [190, 300]);
    arm([[820, 520], [940, 450], [980, 340], [930, 320], [900, 410], [800, 470]], [960, 300]);
    // the rock: big, lumpy, with bumps on top
    for (const [x, y, r] of [[420, 350, 70], [570, 310, 85], [720, 350, 70]]) shape(potato(x, y, r, r * 0.8, 7, 0.15), GREY, { gap: 12, miss: 0.05 });
    shape(potato(575, 620, 290, 260, 12, 0.08), GREY, { gap: 16, miss: 0.06 });
    for (const [x, y, r] of [[400, 760, 34], [740, 740, 30], [700, 500, 22], [430, 520, 20], [600, 820, 26]]) shape(potato(x, y, r, r * 0.8, 6, 0.15), DARK, { gap: 8, w: 9, miss: 0 }, 4.5);
    stroke([[330, 600], [370, 640], [345, 690], [380, 720]], 5);
    stroke([[800, 560], [770, 610], [810, 640], [790, 680]], 5);
    // grumpy face
    stroke([[455, 560], [550, 605]], 12);
    stroke([[600, 605], [695, 560]], 12);
    dot(510, 632, 13, 15);
    dot(640, 632, 13, 15);
    stroke([[505, 720], [575, 695], [650, 722]], 7.5);
    for (const x of [280, 480, 700, 880]) stroke([[x, 1010], [x + 45 + j(10), 1000]], 4);
  },
} satisfies Draft;
