import type { Draft } from './kid.ts';

/** A kangaroo mum standing tall, her baby peeking out of the pouch, a long strong tail. */
export default {
  id: '049', slug: 'poupochette', seed: 21, layered: true, size: [1150, 1150], tilt: 2, pivot: [575, 575],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const BROWN = '#b07a46', CREAM = '#f1dcae', INNER = '#e8a9a0';
    // long thick tail behind
    shape(shake([[640, 830], [820, 900], [990, 960], [1060, 1010], [980, 1040], [800, 990], [620, 930]], 10), BROWN, { gap: 13 });
    // big feet
    for (const x of [430, 650]) {
      shape(potato(x, 1040, 130, 46, 8, 0.08), BROWN, { gap: 12, miss: 0 });
      for (const dx of [-90, -60]) stroke([[x + dx, 1060], [x + dx - 25 + j(8), 1075]], 6);
    }
    // body and the pouch
    shape(shake([[420, 430], [640, 430], [740, 620], [760, 850], [690, 1010], [420, 1010], [330, 850], [340, 620]], 12), BROWN, { gap: 15, miss: 0.05 });
    shape(potato(545, 820, 170, 175, 9, 0.05), CREAM, { gap: 13, miss: 0.06 });
    // the baby in the pouch: little head, ears, big eyes
    shape(shake([[480, 650], [470, 590], [505, 640]], 4), BROWN, { gap: 9, w: 9, miss: 0 }, 5);
    shape(shake([[600, 650], [620, 590], [585, 640]], 4), BROWN, { gap: 9, w: 9, miss: 0 }, 5);
    shape(potato(545, 710, 85, 70, 8, 0.05), BROWN, { gap: 11, miss: 0.03 });
    dot(515, 705, 10, 12); dot(578, 705, 10, 12);
    stroke([[525, 745], [545, 755], [565, 745]], 4.5);
    stroke([[400, 770], [545, 790], [690, 770]], 6);
    // arms, holding the baby close
    shape(shake([[380, 560], [320, 650], [380, 740], [440, 760], [420, 700], [400, 640]], 8), BROWN, { gap: 12, miss: 0 });
    shape(shake([[700, 560], [770, 650], [720, 740], [660, 760], [680, 700], [700, 640]], 8), BROWN, { gap: 12, miss: 0 });
    // tall ears and the mum's head, a gentle face
    shape(shake([[460, 260], [420, 90], [490, 120], [510, 250]], 6), BROWN, { gap: 12 });
    shape(shake([[590, 250], [630, 90], [680, 130], [640, 260]], 6), BROWN, { gap: 12 });
    stroke([[460, 230], [450, 140]], 7);
    stroke([[625, 230], [645, 150]], 7);
    shape(potato(550, 340, 135, 115, 8, 0.05), BROWN, { gap: 14, miss: 0.04 });
    shape(potato(550, 385, 70, 50, 7, 0.08), CREAM, { gap: 10, miss: 0.05 }, 5);
    dot(500, 320, 11, 14); dot(605, 320, 11, 14);
    dot(550, 370, 9, 7);
    stroke([[515, 405], [550, 420], [585, 405]], 5);
    shape(potato(470, 380, 22, 15, 6, 0.1), INNER, { gap: 6, w: 7, miss: 0 }, 3.5);
    shape(potato(630, 380, 22, 15, 6, 0.1), INNER, { gap: 6, w: 7, miss: 0 }, 3.5);
  },
} satisfies Draft;
