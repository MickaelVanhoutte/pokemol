import type { Draft } from './kid.ts';

/** A little boxer turned three-quarters to the left: grey-blue, a red headband, big red gloves, one punching. */
export default {
  id: '029', slug: 'boxouille', seed: 22, layered: true, size: [1100, 1080], tilt: -4, pivot: [520, 560], offset: [40, 0],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot, raw } = k;
    const GREY = '#8c9bc0', RED = '#e23b3b', DARK = '#3d3a4a';
    // headband ribbons flying out behind the head, on the right
    shape(shake([[620, 320], [760, 280], [770, 330], [630, 360]], 6), RED, { gap: 9, w: 10, miss: 0 }, 5);
    shape(shake([[620, 345], [740, 410], [710, 440], [615, 375]], 6), RED, { gap: 9, w: 10, miss: 0 }, 5);
    // the far leg, behind
    shape(shake([[360, 800], [470, 800], [470, 945], [360, 950]], 8), GREY, { gap: 13, miss: 0.05 });
    shape(potato(395, 965, 85, 38, 7, 0.1), GREY, { gap: 12, miss: 0 });
    // the far arm punching to the left, its shoulder hidden behind the body
    shape(shake([[420, 540], [280, 520], [220, 545], [235, 595], [300, 600], [420, 610]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(180, 565, 100, 88, 8, 0.06), RED, { gap: 11, miss: 0 });
    for (const i of [0, 1, 2]) stroke([[300 + i * 6, 470 - i * 4 + j(6)], [380 + i * 10, 450 - i * 4]], 4.5);
    // body, belt, muscles (turned left)
    shape(shake([[370, 480], [630, 480], [700, 620], [680, 820], [570, 870], [450, 870], [360, 820], [330, 620]], 10), GREY, { gap: 14, miss: 0.06 });
    shape(shake([[350, 760], [690, 760], [686, 812], [354, 812]], 5), DARK, { gap: 9, w: 12, miss: 0 }, 5.5);
    stroke([[390, 580], [440, 620], [480, 590]], 4.5);
    stroke([[490, 590], [530, 620], [575, 580]], 4.5);
    // the near leg, in front
    shape(shake([[540, 800], [660, 800], [665, 950], [535, 955]], 8), GREY, { gap: 13, miss: 0.05 });
    shape(potato(590, 972, 92, 42, 7, 0.1), GREY, { gap: 12, miss: 0 });
    // head, headband, shouting face shifted left
    shape(potato(470, 370, 140, 125, 8, 0.05), GREY, { gap: 14, miss: 0.04 });
    shape(shake([[335, 318], [600, 306], [605, 352], [332, 362]], 5), RED, { gap: 9, w: 11, miss: 0 }, 5.5);
    stroke([[350, 382], [395, 398]], 7);
    stroke([[450, 400], [510, 380]], 8);
    dot(376, 412, 7, 11);
    dot(478, 414, 9, 12);
    raw(`<path d='${k.smooth([[360, 452], [450, 450], [438, 488], [374, 490]], true)}' fill='#5a2430' stroke='#2e2a35' stroke-width='6'/>`);
    // the near arm, guarding, its glove up in front of the chin
    shape(shake([[640, 600], [660, 530], [600, 470], [560, 500], [590, 540], [590, 590]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(565, 470, 88, 80, 8, 0.06), RED, { gap: 11, miss: 0 });
  },
} satisfies Draft;
