import type { Draft, P } from './kid.ts';

/** A seal pup on an ice floe: frosty white-blue, a little horn, flippers, snowflakes. Faces left. */
export default {
  id: '032', slug: 'givrinou', seed: 21, layered: true, size: [1100, 1000], tilt: -3, pivot: [550, 600],
  draw(k) {
    const { potato, shake, shape, stroke, dot } = k;
    const ICE = '#a9cdf2', BLUE = '#6fa8ea', HORN = '#f2d77a', FLOE = '#c8ecf6';
    // the ice floe under it
    shape(shake([[110, 860], [930, 850], [890, 950], [150, 955]], 8), FLOE, { gap: 14, angle: -10 });
    // tail flippers behind
    shape(shake([[780, 700], [960, 610], [990, 690], [900, 750], [990, 820], [945, 860], [780, 800]], 8), BLUE, { gap: 12 });
    // long body lying down
    shape(shake([[250, 560], [420, 470], [650, 520], [830, 640], [810, 800], [600, 850], [330, 840], [210, 720]], 12), ICE, { gap: 16, miss: 0.08, angle: -30 });
    // front flipper
    shape(shake([[400, 760], [320, 880], [400, 900], [480, 790]], 6), BLUE, { gap: 11, miss: 0 });
    // head with a horn and a happy face
    shape(shake([[285, 420], [315, 300], [345, 425]], 5), HORN, { gap: 9, w: 10, miss: 0 }, 5.5);
    shape(potato(300, 525, 145, 120, 8, 0.05), ICE, { gap: 14, miss: 0.05 });
    dot(255, 500, 11, 13);
    dot(345, 505, 11, 13);
    shape(potato(215, 560, 26, 18, 6, 0.1), '#3a3440', { gap: 7, w: 8, miss: 0 }, 4);
    stroke([[250, 590], [300, 610], [350, 585]], 5.5);
    for (const [a, b] of [[[200, 575], [110, 560]], [[205, 590], [115, 610]]]) stroke([a as [number, number], b as [number, number]], 3.5);
    // snowflakes
    for (const [x, y, s] of [[120, 300, 1], [600, 240, 0.8], [880, 380, 1], [520, 380, 0.6]] as [number, number, number][]) {
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3, d: P = [Math.cos(a) * 34 * s, Math.sin(a) * 34 * s];
        stroke([[x - d[0], y - d[1]], [x + d[0], y + d[1]]], 4.5);
      }
    }
  },
} satisfies Draft;
