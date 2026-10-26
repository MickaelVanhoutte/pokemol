import type { Draft, P } from './kid.ts';

/** Musclouille's evolution: four arms with four red gloves, a champion's belt, shouting. */
export default {
  id: '038', slug: 'quadripoing', seed: 21, layered: true, size: [1200, 1100], tilt: -2, pivot: [600, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot, raw } = k;
    const GREY = '#6f80ad', RED = '#e23b3b', DARK = '#3d3a4a', GOLD = '#f2c12e';
    const arm = (pts: P[], glove: P) => {
      shape(shake(pts, 8), GREY, { gap: 12, miss: 0 });
      shape(potato(glove[0], glove[1], 82, 74, 8, 0.06), RED, { gap: 11, miss: 0 });
    };
    // the two lower arms behind the body, punching out low
    arm([[400, 640], [260, 690], [180, 700], [190, 750], [270, 750], [410, 710]], [170, 730]);
    arm([[800, 640], [940, 690], [1020, 700], [1010, 750], [930, 750], [790, 710]], [1030, 730]);
    // legs
    for (const x of [470, 730]) {
      shape(shake([[x - 85, 820], [x + 85, 820], [x + 90, 980], [x - 90, 985]], 8), GREY, { gap: 13, miss: 0.05 });
      shape(potato(x, 1010, 110, 45, 7, 0.1), GREY, { gap: 12, miss: 0 });
    }
    // huge body, belt, muscles
    shape(shake([[360, 470], [840, 470], [920, 620], [840, 830], [700, 890], [500, 890], [360, 830], [280, 620]], 10), GREY, { gap: 14, miss: 0.06 });
    shape(shake([[350, 790], [850, 790], [845, 850], [355, 850]], 5), DARK, { gap: 9, w: 12, miss: 0 }, 5.5);
    shape(shake([[545, 776], [655, 776], [655, 864], [545, 864]], 4), GOLD, { gap: 8, w: 9, miss: 0 }, 5);
    stroke([[440, 570], [520, 620], [590, 580]], 5);
    stroke([[610, 580], [680, 620], [760, 570]], 5);
    stroke([[480, 680], [600, 715], [720, 680]], 4.5);
    // the two upper arms raised high
    arm([[380, 500], [260, 440], [200, 330], [250, 300], [300, 400], [400, 440]], [220, 270]);
    arm([[820, 500], [940, 440], [1000, 330], [950, 300], [900, 400], [800, 440]], [980, 270]);
    // head with a red headband and a big shout
    shape(potato(600, 360, 140, 125, 8, 0.05), GREY, { gap: 14, miss: 0.04 });
    shape(shake([[466, 300], [732, 290], [736, 338], [463, 346]], 5), RED, { gap: 9, w: 11, miss: 0 }, 5.5);
    stroke([[515, 368], [578, 392]], 10);
    stroke([[625, 392], [690, 366]], 10);
    dot(548, 405, 9, 12);
    dot(655, 405, 9, 12);
    raw(`<path d='${k.smooth([[540, 440], [665, 438], [645, 500], [560, 502]], true)}' fill='#5a2430' stroke='#2e2a35' stroke-width='6'/>`);
  },
} satisfies Draft;
