import type { Draft } from './kid.ts';

/** A little sea dragon: a long blue body in an S, white fins on its head, a pearl on its brow. */
export default {
  id: '034', slug: 'dragounet', seed: 21, layered: true, size: [1100, 1100], tilt: 0, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot, band } = k;
    const BLUE = '#4f7fe0', WHITE = '#f3f6ff', PEARL = '#bfe6ff';
    // tail fin, then the long body from the tail up to the neck
    shape(shake([[900, 930], [1010, 860], [1000, 960], [930, 990]], 6), WHITE, { gap: 10 });
    const body: [number, number][] = [[900, 940], [740, 960], [560, 900], [420, 790], [430, 650], [570, 570], [680, 470], [640, 350], [540, 290]];
    shape(band(body, 22, 62), BLUE, { gap: 14, miss: 0.04, angle: -40 });
    // a white belly line and scales along the body
    for (let i = 1; i < body.length - 1; i++) {
      const [x, y] = body[i];
      stroke([[x - 18, y + 8], [x + 18, y - 8]], 4.5);
    }
    // fins on the head, the head, a pearl and a nub
    shape(shake([[400, 220], [270, 150], [280, 250], [390, 280]], 6), WHITE, { gap: 10, miss: 0 });
    shape(shake([[610, 200], [740, 120], [735, 230], [620, 260]], 6), WHITE, { gap: 10, miss: 0 });
    shape(potato(505, 250, 130, 105, 8, 0.05), BLUE, { gap: 13, miss: 0.03 });
    shape(potato(505, 180, 22, 20, 6, 0.08), PEARL, { gap: 7, w: 8, miss: 0 }, 4.5);
    // a fierce little face
    dot(455, 250, 12, 15);
    dot(560, 248, 12, 15);
    stroke([[425, 215], [480, 232]], 7);
    stroke([[530, 232], [590, 212]], 7);
    stroke([[460, 300], [505, 315], [552, 298]], 5.5);
    dot(490, 280, 4); dot(518, 280, 4);
    // bubbles
    for (const [x, y, r] of [[200, 520, 26], [250, 440, 16], [860, 300, 22], [900, 230, 13]]) stroke(potato(x, y, r, r, 7, 0.05).concat([potato(x, y, r, r, 7, 0.05)[0]]), 4);
  },
} satisfies Draft;
