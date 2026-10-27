import type { Draft } from './kid.ts';

/** Boxouille grown: broad and strong, turned three-quarters to the left, both arms up flexing, a gold-buckled belt. */
export default {
  id: '037', slug: 'musclouille', seed: 22, layered: true, size: [1100, 1080], tilt: 2, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot, raw } = k;
    const GREY = '#7f8fb8', RED = '#e23b3b', DARK = '#3d3a4a', GOLD = '#f2c12e';
    // the far leg and far arm, behind the body on the left
    shape(shake([[340, 790], [480, 790], [485, 950], [335, 955]], 8), GREY, { gap: 13, miss: 0.05 });
    shape(potato(400, 972, 95, 40, 7, 0.1), GREY, { gap: 12, miss: 0 });
    shape(shake([[380, 500], [230, 520], [170, 430], [190, 330], [250, 330], [260, 420], [390, 440]], 8), GREY, { gap: 12, miss: 0 });
    shape(potato(220, 300, 64, 58, 7, 0.08), GREY, { gap: 11, miss: 0 });
    // broad body, belt with a gold buckle, muscles, all turned left
    shape(shake([[310, 460], [700, 460], [790, 600], [730, 800], [600, 860], [450, 860], [330, 800], [260, 600]], 10), GREY, { gap: 14, miss: 0.06 });
    shape(shake([[310, 760], [745, 760], [740, 815], [315, 815]], 5), DARK, { gap: 9, w: 12, miss: 0 }, 5.5);
    shape(shake([[430, 748], [515, 748], [515, 828], [430, 828]], 4), GOLD, { gap: 8, w: 9, miss: 0 }, 5);
    stroke([[350, 560], [410, 610], [460, 570]], 5);
    stroke([[470, 570], [520, 610], [585, 560]], 5);
    stroke([[380, 660], [460, 690], [545, 660]], 4.5);
    // the near leg and near arm, in front on the right
    shape(shake([[560, 790], [710, 790], [715, 950], [555, 955]], 8), GREY, { gap: 13, miss: 0.05 });
    shape(potato(640, 975, 102, 44, 7, 0.1), GREY, { gap: 12, miss: 0 });
    shape(shake([[700, 500], [860, 520], [930, 430], [910, 320], [845, 320], [835, 420], [690, 440]], 8), GREY, { gap: 12, miss: 0 });
    shape(potato(880, 290, 75, 66, 7, 0.08), GREY, { gap: 11, miss: 0 });
    stroke([[900, 470], [860, 420]], 4.5);
    // head turned left, headband, determined grin
    shape(potato(470, 350, 135, 120, 8, 0.05), GREY, { gap: 14, miss: 0.04 });
    shape(shake([[340, 290], [600, 280], [604, 326], [337, 334]], 5), RED, { gap: 9, w: 11, miss: 0 }, 5.5);
    stroke([[355, 358], [400, 375]], 8);
    stroke([[455, 378], [515, 352]], 9);
    dot(380, 392, 7, 11);
    dot(482, 392, 9, 12);
    raw(`<path d='M360 440 L480 436 L468 462 L374 466 Z' fill='#fff' stroke='#2e2a35' stroke-width='6' stroke-linejoin='round'/><path d='M392 440 L392 464 M424 438 L424 464 M452 438 L450 462' stroke='#2e2a35' stroke-width='4'/>`);
  },
} satisfies Draft;
