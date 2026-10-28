import type { Fair } from '../redraws/crayon.ts';

/**
 * Poupochette's fair copy, Normal/Fighting, the same drawing grown up: the baby grown and out of the pouch
 * up to its waist, both of them with fists up and brows set, the mum's arms raised from holding the baby to a guard,
 * a thicker tail, bigger ears, claws on her feet, and the gold star on her chest.
 */
export default {
  id: '049', slug: 'poupochette', seed: 49049, size: [1150, 1150], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, potato, shake, band } = c;
    const BROWN = '#b07a46', CREAM = '#f1dcae', INNER = '#e8a9a0', DARK = '#7a4e26';
    const claws = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i++) shape([[x + 8, y - 8 + i * 18], [x - 42, y + i * 24], [x + 8, y + 8 + i * 18]], '#ffffff', { over: 0 }, { w: 3.5 }, false);
    };
    /** A fist: a round paw, its knuckle lines. */
    const fist = (x: number, y: number, r: number) => {
      shape(potato(x, y, r, r * 0.9, 9, 0.04), BROWN, { angle: 30, over: 0 });
      for (let i = -1; i <= 1; i++) stroke([[x - r * 0.75, y + i * r * 0.32], [x - r * 0.25, y + i * r * 0.34]], { w: 4, col: DARK });
    };
    // the long thick tail behind, on the right
    c.part('queue', { pivot: [650, 880], motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      shape(shake([[660, 815], [850, 885], [1030, 950], [1112, 1010], [1010, 1052], [820, 1000], [640, 945]], 5), BROWN, { angle: 20 });
    });
    // the far foot and the far ear, bigger, behind
    claws(290, 1030, 2);
    shape(potato(400, 1038, 118, 44, 9, 0.05), BROWN, { angle: 0 });
    shape(shake([[430, 262], [372, 82], [442, 100], [485, 250]], 4), BROWN, { angle: 70 });
    c.tint([[432, 236], [395, 125], [425, 132], [455, 236]], INNER, { angle: 70 });
    // her body and the pouch, turned left, the star on her chest
    shape(shake([[400, 430], [620, 430], [730, 620], [750, 850], [680, 1010], [410, 1010], [320, 850], [330, 620]], 6), BROWN, { angle: 65 });
    shape(potato(500, 820, 160, 170, 10, 0.04), CREAM, { angle: 70, over: 0 });
    c.star(655, 488, 40, -6);
    // the baby, grown and out of the pouch to its waist, fists up
    c.part('bebe', { pivot: [492, 790], motion: 'nod', amp: 5, period: 1.3 }, () => {
      shape(shake([[425, 790], [418, 715], [452, 670], [530, 668], [568, 712], [562, 790]], 3), BROWN, { angle: 65 });
      shape(potato(488, 745, 42, 40, 8, 0.05), CREAM, { over: 0 }, { w: 4 });
      shape(shake([[430, 585], [398, 480], [458, 562]], 3), BROWN, { angle: 70 }, {}, false);
      shape(shake([[540, 582], [582, 482], [528, 566]], 3), BROWN, { angle: 70 }, {}, false);
      shape(potato(490, 625, 88, 76, 10, 0.04), BROWN, { angle: 40 });
      shape(potato(436, 650, 36, 26, 8, 0.06), CREAM, { over: 0 }, { w: 4 });
      dot(452, 612, 7, 9); dot(512, 610, 9, 10);
      stroke([[428, 588], [470, 600]], { w: 8 });
      stroke([[495, 598], [540, 584]], { w: 8 });
      dot(410, 648, 7, 5);
      stroke([[420, 670], [440, 676], [462, 668]], { w: 4 });
      shape(band([[455, 720], [415, 712], [392, 690]], 34, 30), BROWN, { angle: 30, over: 0 });
      fist(380, 680, 34);
      shape(band([[540, 722], [575, 712], [590, 690]], 32, 28), BROWN, { angle: 30, over: 0 });
      fist(590, 680, 32);
    });
    stroke([[350, 790], [500, 805], [650, 785]], { w: 6 });
    // the near foot, claws out
    claws(512, 1032, 3);
    shape(potato(640, 1042, 138, 48, 9, 0.05), BROWN, { angle: 0 });
    // her arms raised to a guard: the far one peeks out on the left, the near one in front, fists up
    shape(band([[390, 650], [332, 700], [318, 610]], 64, 54), BROWN, { angle: 30 });
    fist(318, 586, 50);
    shape(band([[700, 560], [752, 680], [670, 625]], 72, 62), BROWN, { angle: 30 });
    fist(660, 598, 56);
    // the near ear, bigger, then her head turned left with a snout, brows set
    shape(shake([[560, 252], [612, 66], [680, 112], [622, 262]], 4), BROWN, { angle: 70 });
    c.tint([[588, 236], [618, 112], [650, 130], [612, 240]], INNER, { angle: 70 });
    shape(shake([[390, 350], [430, 270], [540, 240], [640, 280], [660, 370], [600, 440], [480, 455], [400, 430], [360, 395]], 4), BROWN, { angle: 60 });
    shape(potato(420, 395, 62, 44, 8, 0.05), CREAM, { over: 0 }, { w: 5 });
    dot(445, 332, 9, 12); dot(545, 327, 11, 13);
    dot(442, 326, 3, 3.5, '#ffffff'); dot(541, 321, 3.5, 4, '#ffffff');
    stroke([[410, 296], [470, 316]], { w: 10 });
    stroke([[512, 310], [582, 288]], { w: 11 });
    dot(380, 380, 9, 7);
    stroke([[388, 418], [425, 434], [468, 414]], { w: 5 });
    shape(potato(598, 388, 24, 16, 7, 0.08), INNER, { over: 0 }, { w: 3.5 });
    c.shine([[480, 262], [530, 252]], 6);
  },
} satisfies Fair;
