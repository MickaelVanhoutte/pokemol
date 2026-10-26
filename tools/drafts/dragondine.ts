import type { Draft } from './kid.ts';

/** Dragounet's evolution: a long elegant sea dragon in loops, big white fins, crystal orbs. */
export default {
  id: '044', slug: 'dragondine', seed: 21, layered: true, size: [1150, 1150], tilt: 0, pivot: [575, 575],
  draw(k) {
    const { potato, shake, shape, stroke, dot, band } = k;
    const BLUE = '#3f6fd6', WHITE = '#f3f6ff', ORB = '#9fe0ff';
    // tail fin and the orbs on the tail
    shape(shake([[960, 1000], [1080, 930], [1070, 1050], [990, 1070]], 6), WHITE, { gap: 10 });
    const body: [number, number][] = [[960, 1010], [800, 1050], [600, 1000], [470, 900], [520, 770], [700, 720], [800, 600], [720, 470], [560, 450], [430, 520], [330, 450], [360, 330], [470, 270]];
    shape(band(body, 20, 58), BLUE, { gap: 14, miss: 0.04, angle: -40 });
    for (let i = 1; i < body.length - 1; i += 1) {
      const [x, y] = body[i];
      stroke([[x - 16, y + 8], [x + 16, y - 8]], 4.5);
    }
    shape(potato(900, 985, 30, 30, 7, 0.05), ORB, { gap: 8, w: 9, miss: 0 }, 5);
    shape(potato(390, 470, 34, 34, 7, 0.05), ORB, { gap: 8, w: 9, miss: 0 }, 5);
    // big fins on the head
    shape(shake([[420, 230], [230, 120], [240, 250], [400, 290]], 6), WHITE, { gap: 10, miss: 0 });
    shape(shake([[640, 210], [830, 100], [820, 240], [650, 270]], 6), WHITE, { gap: 10, miss: 0 });
    // head, a little horn, calm proud face
    shape(potato(530, 235, 135, 108, 8, 0.05), BLUE, { gap: 13, miss: 0.03 });
    shape(shake([[515, 140], [530, 60], [548, 142]], 4), ORB, { gap: 7, w: 8, miss: 0 }, 4.5);
    dot(480, 235, 12, 15);
    dot(585, 233, 12, 15);
    stroke([[450, 202], [505, 214]], 6);
    stroke([[560, 214], [615, 200]], 6);
    stroke([[490, 285], [530, 298], [575, 284]], 5.5);
    for (const [x, y] of [[180, 520], [960, 360], [1000, 280], [200, 700]]) {
      stroke([[x - 26, y], [x + 26, y]], 4);
      stroke([[x, y - 26], [x, y + 26]], 4);
    }
  },
} satisfies Draft;
