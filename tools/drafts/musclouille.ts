import type { Draft } from './kid.ts';

/** Boxouille's evolution: big and broad, a gold-buckled belt, flexing both arms. */
export default {
  id: '037', slug: 'musclouille', seed: 21, layered: true, size: [1100, 1080], tilt: 2, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot, raw } = k;
    const GREY = '#7f8fb8', RED = '#e23b3b', DARK = '#3d3a4a', GOLD = '#f2c12e';
    // legs
    for (const x of [420, 640]) {
      shape(shake([[x - 75, 790], [x + 75, 790], [x + 80, 950], [x - 80, 955]], 8), GREY, { gap: 13, miss: 0.05 });
      shape(potato(x, 975, 100, 42, 7, 0.1), GREY, { gap: 12, miss: 0 });
    }
    // broad body, belt with a gold buckle, muscles
    shape(shake([[330, 460], [730, 460], [800, 600], [720, 800], [600, 860], [460, 860], [340, 800], [260, 600]], 10), GREY, { gap: 14, miss: 0.06 });
    shape(shake([[320, 760], [740, 760], [735, 815], [325, 815]], 5), DARK, { gap: 9, w: 12, miss: 0 }, 5.5);
    shape(shake([[490, 748], [575, 748], [575, 828], [490, 828]], 4), GOLD, { gap: 8, w: 9, miss: 0 }, 5);
    stroke([[400, 560], [470, 610], [530, 570]], 5);
    stroke([[540, 570], [600, 610], [670, 560]], 5);
    stroke([[440, 660], [530, 690], [620, 660]], 4.5);
    // both arms up, flexing, fists by the head
    shape(shake([[330, 500], [190, 520], [130, 430], [150, 330], [210, 330], [220, 420], [340, 440]], 8), GREY, { gap: 12, miss: 0 });
    shape(potato(180, 300, 70, 62, 7, 0.08), GREY, { gap: 11, miss: 0 });
    stroke([[160, 470], [200, 420]], 4.5);
    shape(shake([[730, 500], [870, 520], [930, 430], [910, 330], [850, 330], [840, 420], [720, 440]], 8), GREY, { gap: 12, miss: 0 });
    shape(potato(880, 300, 70, 62, 7, 0.08), GREY, { gap: 11, miss: 0 });
    stroke([[900, 470], [860, 420]], 4.5);
    // head, headband, determined grin
    shape(potato(530, 350, 135, 120, 8, 0.05), GREY, { gap: 14, miss: 0.04 });
    shape(shake([[400, 290], [662, 280], [666, 326], [397, 334]], 5), RED, { gap: 9, w: 11, miss: 0 }, 5.5);
    stroke([[445, 355], [505, 378]], 9);
    stroke([[560, 378], [620, 352]], 9);
    dot(478, 392, 9, 12);
    dot(588, 392, 9, 12);
    raw(`<path d='M470 440 L600 436 L585 462 L486 466 Z' fill='#fff' stroke='#2e2a35' stroke-width='6' stroke-linejoin='round'/><path d='M505 440 L505 464 M540 438 L540 464 M570 438 L568 462' stroke='#2e2a35' stroke-width='4'/>`);
  },
} satisfies Draft;
