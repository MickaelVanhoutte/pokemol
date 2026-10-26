import type { Draft } from './kid.ts';

/** Zigzou's evolution: bigger and orange, long ears with dark tips, a huge lightning-bolt tail. */
export default {
  id: '027', slug: 'zigzeclair', seed: 21, layered: true, size: [1100, 1100], tilt: -3, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot } = k;
    const ORANGE = '#f5a62a', CREAM = '#f8e2a4', YEL = '#f6d22c', BLACK = '#3a3440', RED = '#e8483c';
    // the lightning tail behind
    shape(shake([[600, 760], [760, 620], [700, 580], [880, 430], [820, 400], [1020, 210], [910, 440], [970, 470], [790, 620], [850, 650], [650, 820]], 6), YEL, { gap: 12, miss: 0.02 });
    // long ears with black tips
    shape(shake([[400, 330], [250, 60], [330, 80], [460, 300]], 6), ORANGE, { gap: 12 });
    shape(shake([[255, 66], [330, 82], [305, 160], [270, 150]], 4), BLACK, { gap: 8, w: 9, miss: 0 }, 5);
    shape(shake([[580, 300], [730, 60], [790, 95], [650, 330]], 6), ORANGE, { gap: 12 });
    shape(shake([[728, 66], [788, 98], [760, 170], [710, 150]], 4), BLACK, { gap: 8, w: 9, miss: 0 }, 5);
    // feet, body, belly
    shape(potato(420, 975, 85, 45, 7, 0.1), ORANGE, { gap: 12, miss: 0 });
    shape(potato(640, 975, 85, 45, 7, 0.1), ORANGE, { gap: 12, miss: 0 });
    shape(shake([[380, 500], [580, 480], [690, 620], [710, 820], [630, 950], [420, 960], [320, 830], [320, 640]], 12), ORANGE, { gap: 15, miss: 0.08 });
    shape(potato(515, 770, 115, 135, 8, 0.08), CREAM, { gap: 13, miss: 0.05 });
    // arms up, sparks between the hands
    shape(shake([[360, 600], [260, 520], [215, 440], [265, 420], [320, 500], [400, 560]], 6), ORANGE, { gap: 12, miss: 0 });
    shape(shake([[650, 580], [750, 500], [795, 425], [840, 450], [775, 545], [670, 640]], 6), ORANGE, { gap: 12, miss: 0 });
    for (const [x, y] of [[200, 380], [250, 330], [840, 380], [900, 420]]) stroke([[x, y], [x + 20, y - 25], [x + 5, y - 30], [x + 28, y - 60]], 5);
    // head: rosy cheeks, a cheeky grin
    shape(potato(510, 370, 165, 140, 9, 0.05), ORANGE, { gap: 14, miss: 0.04 });
    shape(potato(400, 425, 34, 28, 6, 0.1), RED, { gap: 8, w: 9, miss: 0 }, 4.5);
    shape(potato(620, 425, 34, 28, 6, 0.1), RED, { gap: 8, w: 9, miss: 0 }, 4.5);
    dot(450, 355, 13, 17);
    dot(575, 352, 13, 17);
    dot(512, 400, 6);
    stroke([[455, 440], [510, 475], [570, 440]], 6.5);
  },
} satisfies Draft;
