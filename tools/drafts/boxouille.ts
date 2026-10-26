import type { Draft } from './kid.ts';

/** A little boxer: grey-blue, a red headband, big red gloves, one punching. */
export default {
  id: '029', slug: 'boxouille', seed: 21, layered: true, size: [1100, 1080], tilt: -4, pivot: [520, 560], offset: [40, 0],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot, raw } = k;
    const GREY = '#8c9bc0', RED = '#e23b3b', DARK = '#3d3a4a';
    // headband ribbons flying behind
    shape(shake([[380, 330], [250, 280], [240, 330], [370, 360]], 6), RED, { gap: 9, w: 10, miss: 0 }, 5);
    shape(shake([[380, 350], [270, 410], [300, 440], [385, 370]], 6), RED, { gap: 9, w: 10, miss: 0 }, 5);
    // thick legs and feet
    for (const x of [430, 610]) {
      shape(shake([[x - 60, 800], [x + 60, 800], [x + 65, 950], [x - 65, 955]], 8), GREY, { gap: 13, miss: 0.05 });
      shape(potato(x + 10, 970, 85, 40, 7, 0.1), GREY, { gap: 12, miss: 0 });
    }
    // body, belt, muscles
    shape(shake([[380, 480], [640, 480], [700, 620], [670, 820], [560, 870], [450, 870], [350, 820], [320, 620]], 10), GREY, { gap: 14, miss: 0.06 });
    shape(shake([[338, 760], [684, 760], [680, 812], [342, 812]], 5), DARK, { gap: 9, w: 12, miss: 0 }, 5.5);
    stroke([[420, 580], [470, 620], [510, 590]], 4.5);
    stroke([[520, 590], [560, 620], [610, 580]], 4.5);
    // punching arm and its glove, speed lines behind
    shape(shake([[370, 540], [250, 520], [200, 545], [215, 595], [290, 600], [380, 610]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(170, 565, 100, 88, 8, 0.06), RED, { gap: 11, miss: 0 });
    for (const i of [0, 1, 2]) stroke([[310 + i * 6, 470 - i * 4 + j(6)], [390 + i * 10, 450 - i * 4]], 4.5);
    // guarding arm and glove up by the face
    shape(shake([[640, 560], [740, 520], [770, 440], [725, 420], [690, 480], [620, 520]], 6), GREY, { gap: 12, miss: 0 });
    shape(potato(745, 375, 92, 86, 8, 0.06), RED, { gap: 11, miss: 0 });
    // head, headband, shouting face
    shape(potato(510, 370, 140, 125, 8, 0.05), GREY, { gap: 14, miss: 0.04 });
    shape(shake([[375, 318], [645, 306], [650, 352], [372, 362]], 5), RED, { gap: 9, w: 11, miss: 0 }, 5.5);
    stroke([[425, 380], [480, 400]], 8);
    stroke([[545, 400], [600, 378]], 8);
    dot(458, 412, 9, 12);
    dot(565, 412, 9, 12);
    raw(`<path d='${k.smooth([[460, 450], [560, 448], [545, 488], [478, 490]], true)}' fill='#5a2430' stroke='#2e2a35' stroke-width='6'/>`);
  },
} satisfies Draft;
