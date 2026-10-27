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
    shape(shake([[440, 230], [320, 150], [325, 250], [430, 285]], 6), WHITE, { gap: 10, miss: 0 });
    shape(shake([[630, 210], [840, 90], [830, 240], [645, 275]], 6), WHITE, { gap: 10, miss: 0 });
    // head turned left (a snout), a little horn, calm proud face
    shape(shake([[380, 250], [420, 170], [530, 140], [640, 185], [660, 270], [600, 330], [470, 340], [390, 310], [355, 280]], 5), BLUE, { gap: 13, miss: 0.03 });
    shape(shake([[505, 145], [525, 60], [545, 148]], 4), ORB, { gap: 7, w: 8, miss: 0 }, 4.5);
    dot(435, 240, 9, 13);
    dot(530, 236, 12, 15);
    stroke([[415, 210], [455, 220]], 5);
    stroke([[505, 216], [565, 202]], 6);
    stroke([[385, 290], [430, 303], [475, 289]], 5.5);
    for (const [x, y] of [[180, 520], [960, 360], [1000, 280], [200, 700]]) {
      stroke([[x - 26, y], [x + 26, y]], 4);
      stroke([[x, y - 26], [x, y + 26]], 4);
    }
  },
} satisfies Draft;
