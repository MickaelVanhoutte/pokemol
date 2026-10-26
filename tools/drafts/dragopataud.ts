import type { Draft } from './kid.ts';

/** Dragondine's evolution: a big chubby friendly dragon, small wings, antennae, a striped belly. */
export default {
  id: '045', slug: 'dragopataud', seed: 21, layered: true, size: [1150, 1150], tilt: 2, pivot: [575, 575],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const ORANGE = '#f3943a', CREAM = '#f6dfa0', WING = '#6fc6b4';
    // small wings behind the shoulders
    shape(shake([[400, 470], [220, 320], [190, 430], [240, 450], [200, 520], [380, 560]], 8), WING, { gap: 12 });
    shape(shake([[750, 470], [930, 320], [960, 430], [910, 450], [950, 520], [770, 560]], 8), WING, { gap: 12 });
    // thick tail on the ground
    shape(shake([[700, 880], [880, 950], [1010, 900], [1040, 960], [880, 1020], [680, 960]], 10), ORANGE, { gap: 13 });
    // legs and feet
    for (const x of [450, 690]) {
      shape(potato(x, 920, 90, 110, 8, 0.06), ORANGE, { gap: 13, miss: 0.04 });
      shape(potato(x, 1040, 105, 45, 7, 0.1), ORANGE, { gap: 12, miss: 0 });
      for (const dx of [-55, 0, 55]) stroke([[x + dx, 1080], [x + dx + j(8), 1110]], 6);
    }
    // a big round body and its striped belly
    shape(potato(570, 690, 240, 280, 11, 0.04), ORANGE, { gap: 15, miss: 0.05 });
    shape(potato(570, 740, 145, 200, 9, 0.05), CREAM, { gap: 13, miss: 0.06, angle: -80 });
    for (let i = -3; i <= 3; i++) stroke([[460 + j(10), 740 + i * 52], [680 + j(10), 735 + i * 52]], 4.5);
    // little arms
    shape(shake([[360, 600], [270, 650], [250, 710], [300, 715], [370, 670]], 6), ORANGE, { gap: 12, miss: 0 });
    shape(shake([[780, 600], [870, 650], [890, 710], [840, 715], [770, 670]], 6), ORANGE, { gap: 12, miss: 0 });
    // antennae and the head, with a big kind smile
    stroke([[510, 250], [470, 140], [420, 110]], 6);
    stroke([[630, 250], [670, 140], [720, 110]], 6);
    shape(potato(570, 330, 150, 125, 8, 0.05), ORANGE, { gap: 14, miss: 0.04 });
    dot(515, 315, 12, 15);
    dot(625, 315, 12, 15);
    dot(560, 360, 5); dot(585, 360, 5);
    stroke([[490, 390], [570, 425], [650, 390]], 7);
    k.raw(`<path d='M520 404 L530 424 L540 408 Z M600 408 L610 424 L620 404 Z' fill='#fff' stroke='#2e2a35' stroke-width='4' stroke-linejoin='round'/>`);
  },
} satisfies Draft;
