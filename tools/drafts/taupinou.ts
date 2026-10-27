import type { Draft } from './kid.ts';

/** A mole popping out of its molehill: big pink nose, little paws on the dirt. */
export default {
  id: '031', slug: 'taupinou', seed: 21, layered: true, size: [1050, 1000], tilt: -2, pivot: [520, 520],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const BROWN = '#8a5a34', EARTH = '#6b4a2b', PINK = '#f07f9a', PAW = '#f0b6a0';
    // the mole, rising out of the hole, leaning to the left
    shape(shake([[400, 680], [370, 450], [400, 290], [470, 220], [560, 230], [630, 330], [650, 500], [640, 680]], 8), BROWN, { gap: 14, miss: 0.06 });
    // its face turned left: sleepy eyes, a big nose poking out, whiskers
    stroke([[380, 360], [410, 370]], 6);
    stroke([[470, 372], [515, 360]], 7);
    shape(potato(395, 430, 60, 44, 7, 0.06), PINK, { gap: 9, w: 10, miss: 0 }, 6);
    dot(380, 425, 6); dot(410, 425, 7);
    for (const [a, b] of [[[340, 440], [240, 420]], [[340, 460], [245, 480]], [[460, 445], [560, 425]], [[460, 465], [560, 485]]]) stroke([a as [number, number], b as [number, number]], 3.5);
    stroke([[370, 515], [405, 532], [445, 512]], 5);
    // the molehill in front, with clods, a stone and some grass
    shape(shake([[140, 930], [240, 740], [390, 660], [640, 650], [790, 720], [900, 930]], 14), EARTH, { gap: 15, miss: 0.04, angle: -20 });
    for (const [x, y, r] of [[300, 820, 28], [720, 800, 24], [520, 860, 30], [640, 900, 20], [400, 900, 22]]) shape(potato(x, y, r, r * 0.75, 6, 0.15), BROWN, { gap: 8, w: 8, miss: 0 }, 4.5);
    shape(potato(820, 880, 40, 30, 6, 0.12), '#9a948c', { gap: 8, w: 9, miss: 0 }, 5);
    for (const x of [180, 230, 860]) stroke([[x, 930], [x - 10 + j(10), 880], [x + 10, 930], [x + 22, 885]], 4.5);
    // paws resting on the edge, with claws
    for (const x of [360, 580]) {
      shape(potato(x, 662, 58, 36, 7, 0.08), PAW, { gap: 9, w: 10, miss: 0 }, 5.5);
      for (const dx of [-30, -8, 14, 36]) stroke([[x + dx, 690], [x + dx - 4, 712]], 4);
    }
  },
} satisfies Draft;
