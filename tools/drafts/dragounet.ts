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
    shape(shake([[420, 220], [330, 170], [335, 245], [410, 270]], 6), WHITE, { gap: 10, miss: 0 });
    shape(shake([[600, 200], [750, 110], [745, 230], [615, 265]], 6), WHITE, { gap: 10, miss: 0 });
    // the head turned left, a little snout
    shape(shake([[370, 260], [410, 190], [510, 160], [610, 200], [630, 280], [570, 340], [450, 350], [380, 320], [345, 290]], 5), BLUE, { gap: 13, miss: 0.03 });
    shape(potato(495, 175, 20, 18, 6, 0.08), PEARL, { gap: 7, w: 8, miss: 0 }, 4.5);
    // a fierce little face, shifted left
    dot(420, 250, 9, 13);
    dot(515, 248, 12, 15);
    stroke([[400, 218], [440, 232]], 6);
    stroke([[490, 232], [550, 212]], 7);
    stroke([[380, 305], [425, 318], [470, 300]], 5.5);
    dot(362, 278, 4); dot(382, 280, 4);
    // bubbles
    for (const [x, y, r] of [[200, 520, 26], [250, 440, 16], [860, 300, 22], [900, 230, 13]]) stroke(potato(x, y, r, r, 7, 0.05).concat([potato(x, y, r, r, 7, 0.05)[0]]), 4);
  },
} satisfies Draft;
