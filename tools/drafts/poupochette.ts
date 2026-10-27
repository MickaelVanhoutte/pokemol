import type { Draft } from './kid.ts';

/** A kangaroo mum standing tall, her baby peeking out of the pouch, a long strong tail. */
export default {
  id: '049', slug: 'poupochette', seed: 21, layered: true, size: [1150, 1150], tilt: 2, pivot: [575, 575],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const BROWN = '#b07a46', CREAM = '#f1dcae', INNER = '#e8a9a0';
    // long thick tail behind, on the right
    shape(shake([[660, 830], [840, 900], [1010, 960], [1080, 1010], [1000, 1040], [820, 990], [640, 930]], 10), BROWN, { gap: 13 });
    // the far foot and far ear, behind
    shape(potato(400, 1038, 115, 42, 8, 0.08), BROWN, { gap: 12, miss: 0 });
    shape(shake([[430, 260], [380, 100], [440, 120], [480, 250]], 6), BROWN, { gap: 12 });
    stroke([[435, 230], [410, 145]], 6);
    // body and the pouch, turned left
    shape(shake([[400, 430], [620, 430], [730, 620], [750, 850], [680, 1010], [410, 1010], [320, 850], [330, 620]], 12), BROWN, { gap: 15, miss: 0.05 });
    shape(potato(500, 820, 160, 170, 9, 0.05), CREAM, { gap: 13, miss: 0.06 });
    // the baby in the pouch, looking left too
    shape(shake([[430, 650], [415, 590], [455, 640]], 4), BROWN, { gap: 9, w: 9, miss: 0 }, 5);
    shape(shake([[545, 650], [570, 590], [535, 640]], 4), BROWN, { gap: 9, w: 9, miss: 0 }, 5);
    shape(potato(490, 710, 80, 68, 8, 0.05), BROWN, { gap: 11, miss: 0.03 });
    dot(450, 705, 8, 11); dot(505, 705, 10, 12);
    stroke([[440, 745], [462, 755], [485, 745]], 4.5);
    stroke([[350, 770], [500, 790], [650, 770]], 6);
    // the near foot
    shape(potato(640, 1042, 135, 48, 8, 0.08), BROWN, { gap: 12, miss: 0 });
    for (const dx of [-90, -60]) stroke([[640 + dx, 1062], [640 + dx - 25 + j(8), 1077]], 6);
    // arms holding the baby close: the far one peeks out on the left, the near one in front
    shape(shake([[360, 600], [320, 670], [370, 730], [410, 720], [390, 660]], 8), BROWN, { gap: 12, miss: 0 });
    shape(shake([[690, 560], [740, 650], [680, 745], [610, 760], [630, 700], [670, 640]], 8), BROWN, { gap: 12, miss: 0 });
    // the near ear, the mum's head turned left with a snout, a gentle face
    shape(shake([[560, 250], [610, 80], [670, 120], [620, 260]], 6), BROWN, { gap: 12 });
    stroke([[600, 230], [625, 140]], 7);
    shape(shake([[390, 350], [430, 270], [540, 240], [640, 280], [660, 370], [600, 440], [480, 455], [400, 430], [360, 395]], 6), BROWN, { gap: 14, miss: 0.04 });
    shape(potato(420, 395, 62, 44, 7, 0.08), CREAM, { gap: 10, miss: 0.05 }, 5);
    dot(445, 330, 9, 13); dot(545, 325, 11, 14);
    dot(380, 380, 9, 7);
    stroke([[390, 418], [425, 432], [460, 418]], 5);
    shape(potato(595, 385, 24, 16, 6, 0.1), INNER, { gap: 6, w: 7, miss: 0 }, 3.5);
  },
} satisfies Draft;
