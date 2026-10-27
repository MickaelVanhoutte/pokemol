import type { Draft, P } from './kid.ts';

/** Musclouille's evolution, turned three-quarters to the left: four arms with four red gloves, a champion's belt, shouting. */
export default {
  id: '038', slug: 'quadripoing', seed: 22, layered: true, size: [1200, 1100], tilt: -2, pivot: [600, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot, raw } = k;
    const GREY = '#6f80ad', RED = '#e23b3b', DARK = '#3d3a4a', GOLD = '#f2c12e';
    const arm = (pts: P[], glove: P, size = 1) => {
      shape(shake(pts, 8), GREY, { gap: 12, miss: 0 });
      shape(potato(glove[0], glove[1], 82 * size, 74 * size, 8, 0.06), RED, { gap: 11, miss: 0 });
    };
    // the far arms and far leg, behind the body on the left
    arm([[420, 640], [290, 690], [210, 700], [220, 750], [300, 750], [430, 710]], [200, 730], 0.9);
    arm([[420, 500], [300, 440], [240, 330], [290, 300], [340, 400], [430, 440]], [260, 270], 0.9);
    shape(shake([[380, 820], [540, 820], [545, 980], [375, 985]], 8), GREY, { gap: 13, miss: 0.05 });
    shape(potato(450, 1005, 105, 42, 7, 0.1), GREY, { gap: 12, miss: 0 });
    // huge body, belt, muscles, turned left
    shape(shake([[340, 470], [820, 470], [900, 620], [830, 830], [690, 890], [490, 890], [350, 830], [270, 620]], 10), GREY, { gap: 14, miss: 0.06 });
    shape(shake([[340, 790], [845, 790], [840, 850], [345, 850]], 5), DARK, { gap: 9, w: 12, miss: 0 }, 5.5);
    shape(shake([[470, 776], [580, 776], [580, 864], [470, 864]], 4), GOLD, { gap: 8, w: 9, miss: 0 }, 5);
    stroke([[400, 570], [470, 620], [535, 580]], 5);
    stroke([[555, 580], [620, 620], [695, 570]], 5);
    stroke([[430, 680], [540, 715], [660, 680]], 4.5);
    // the near leg and near arms, in front on the right
    shape(shake([[650, 820], [820, 820], [825, 980], [645, 985]], 8), GREY, { gap: 13, miss: 0.05 });
    shape(potato(735, 1010, 112, 46, 7, 0.1), GREY, { gap: 12, miss: 0 });
    arm([[800, 640], [940, 690], [1020, 700], [1010, 750], [930, 750], [790, 710]], [1030, 730]);
    arm([[800, 500], [930, 440], [990, 330], [940, 300], [890, 400], [790, 440]], [970, 270]);
    // head turned left, red headband, a big shout
    shape(potato(540, 360, 140, 125, 8, 0.05), GREY, { gap: 14, miss: 0.04 });
    shape(shake([[405, 300], [672, 290], [676, 338], [402, 346]], 5), RED, { gap: 9, w: 11, miss: 0 }, 5.5);
    stroke([[420, 370], [465, 390]], 9);
    stroke([[520, 392], [585, 366]], 10);
    dot(445, 405, 7, 11);
    dot(550, 405, 9, 12);
    raw(`<path d='${k.smooth([[430, 440], [545, 438], [528, 500], [446, 502]], true)}' fill='#5a2430' stroke='#2e2a35' stroke-width='6'/>`);
  },
} satisfies Draft;
