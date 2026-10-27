import type { Draft } from './kid.ts';

/** Dragondine's evolution: a big chubby friendly dragon, small wings, antennae, a striped belly. */
export default {
  id: '045', slug: 'dragopataud', seed: 21, layered: true, size: [1150, 1150], tilt: 2, pivot: [575, 575],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const ORANGE = '#f3943a', CREAM = '#f6dfa0', WING = '#6fc6b4';
    // the far wing, small, behind on the left
    shape(shake([[420, 470], [290, 360], [270, 440], [305, 455], [280, 510], [410, 545]], 8), WING, { gap: 12 });
    // thick tail on the ground, on the right
    shape(shake([[720, 880], [900, 950], [1030, 900], [1060, 960], [900, 1020], [700, 960]], 10), ORANGE, { gap: 13 });
    // the far leg and far arm, behind
    shape(potato(430, 920, 85, 105, 8, 0.06), ORANGE, { gap: 13, miss: 0.04 });
    shape(potato(420, 1040, 98, 42, 7, 0.1), ORANGE, { gap: 12, miss: 0 });
    shape(shake([[400, 600], [310, 650], [290, 710], [340, 715], [410, 670]], 6), ORANGE, { gap: 12, miss: 0 });
    // a big round body, its striped belly shifted left
    shape(potato(590, 690, 240, 280, 11, 0.04), ORANGE, { gap: 15, miss: 0.05 });
    shape(potato(520, 740, 130, 195, 9, 0.05), CREAM, { gap: 13, miss: 0.06, angle: -80 });
    for (let i = -3; i <= 3; i++) stroke([[420 + j(10), 740 + i * 52], [615 + j(10), 735 + i * 52]], 4.5);
    // the near wing, big, on the right
    shape(shake([[760, 470], [950, 300], [985, 420], [930, 445], [975, 520], [780, 560]], 8), WING, { gap: 12 });
    // the near leg and near arm
    shape(potato(690, 925, 95, 112, 8, 0.06), ORANGE, { gap: 13, miss: 0.04 });
    shape(potato(700, 1045, 110, 46, 7, 0.1), ORANGE, { gap: 12, miss: 0 });
    for (const dx of [-55, 0, 55]) stroke([[700 + dx, 1085], [700 + dx + j(8), 1112]], 6);
    shape(shake([[700, 600], [640, 660], [620, 720], [670, 725], [730, 670]], 6), ORANGE, { gap: 12, miss: 0 });
    // antennae and the head turned left, with a big kind smile
    stroke([[470, 250], [420, 140], [370, 110]], 6);
    stroke([[590, 250], [640, 140], [690, 110]], 6);
    shape(shake([[400, 330], [450, 240], [560, 210], [680, 250], [710, 350], [650, 440], [520, 460], [420, 430], [370, 380]], 6), ORANGE, { gap: 14, miss: 0.04 });
    dot(455, 318, 9, 14);
    dot(570, 315, 12, 15);
    dot(398, 362, 5); dot(420, 364, 5);
    stroke([[410, 395], [480, 425], [560, 395]], 7);
    k.raw(`<path d='M440 409 L450 428 L460 413 Z M515 413 L525 428 L535 409 Z' fill='#fff' stroke='#2e2a35' stroke-width='4' stroke-linejoin='round'/>`);
  },
} satisfies Draft;
