import type { Draft } from './kid.ts';

/** Zigzou's evolution, turned three-quarters to the left: bigger and orange, long ears with dark tips, a huge lightning-bolt tail. */
export default {
  id: '027', slug: 'zigzeclair', seed: 22, layered: true, size: [1100, 1100], tilt: -3, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot } = k;
    const ORANGE = '#f5a62a', CREAM = '#f8e2a4', YEL = '#f6d22c', BLACK = '#3a3440', RED = '#e8483c';
    // the lightning tail behind, on the right
    shape(shake([[620, 760], [780, 620], [720, 580], [900, 430], [840, 400], [1040, 210], [930, 440], [990, 470], [810, 620], [870, 650], [670, 820]], 6), YEL, { gap: 12, miss: 0.02 });
    // the far ear, far arm and far foot, behind
    shape(shake([[360, 330], [220, 80], [290, 90], [420, 300]], 6), ORANGE, { gap: 12 });
    shape(shake([[225, 86], [290, 92], [272, 165], [240, 155]], 4), BLACK, { gap: 8, w: 9, miss: 0 }, 5);
    shape(shake([[400, 600], [300, 520], [255, 440], [305, 420], [360, 500], [430, 560]], 6), ORANGE, { gap: 12, miss: 0 });
    shape(potato(410, 975, 80, 42, 7, 0.1), ORANGE, { gap: 12, miss: 0 });
    // body and belly, turned left
    shape(shake([[360, 500], [560, 480], [670, 620], [690, 820], [610, 950], [400, 960], [300, 830], [300, 640]], 12), ORANGE, { gap: 15, miss: 0.08 });
    shape(potato(450, 770, 100, 130, 8, 0.08), CREAM, { gap: 13, miss: 0.05 });
    // the near foot, near arm up, sparks
    shape(potato(620, 978, 90, 46, 7, 0.1), ORANGE, { gap: 12, miss: 0 });
    shape(shake([[620, 580], [720, 500], [765, 425], [810, 450], [745, 545], [640, 640]], 6), ORANGE, { gap: 12, miss: 0 });
    for (const [x, y] of [[230, 380], [270, 330], [820, 380], [880, 420]]) stroke([[x, y], [x + 20, y - 25], [x + 5, y - 30], [x + 28, y - 60]], 5);
    // the near ear, the head turned left
    shape(shake([[520, 300], [690, 60], [750, 95], [600, 330]], 6), ORANGE, { gap: 12 });
    shape(shake([[688, 66], [748, 98], [720, 170], [670, 150]], 4), BLACK, { gap: 8, w: 9, miss: 0 }, 5);
    shape(potato(450, 370, 165, 140, 9, 0.05), ORANGE, { gap: 14, miss: 0.04 });
    shape(potato(540, 425, 36, 28, 6, 0.1), RED, { gap: 8, w: 9, miss: 0 }, 4.5);
    dot(355, 355, 10, 16);
    dot(470, 352, 13, 17);
    dot(305, 400, 7, 6);
    stroke([[320, 440], [370, 470], [425, 440]], 6.5);
  },
} satisfies Draft;
