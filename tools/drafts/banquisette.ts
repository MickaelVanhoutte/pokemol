import type { Draft, P } from './kid.ts';

/** Givrinou's evolution: a long graceful seal gliding over a wave, a long horn, a flowing white mane. */
export default {
  id: '042', slug: 'banquisette', seed: 21, layered: true, size: [1250, 1000], tilt: -6, pivot: [620, 520],
  draw(k) {
    const { potato, shake, shape, stroke, dot, bumps } = k;
    const ICE = '#9cc6f0', WHITE = '#eef4fb', BLUE = '#5f9ae6', HORN = '#f2d77a', WAVE = '#4f8de0';
    // the wave it glides on
    shape([...bumps([[60, 860], [380, 780], [700, 820], [1000, 760], [1200, 820]], 1, -50), [1200, 960], [60, 960]] as P[], WAVE, { gap: 14, miss: 0.02, angle: -10 });
    for (const x of [200, 520, 840]) stroke([[x, 870], [x + 60, 850], [x + 120, 875]], 4.5);
    // long tail flippers
    shape(shake([[930, 620], [1120, 520], [1170, 600], [1060, 650], [1170, 720], [1110, 770], [930, 720]], 8), BLUE, { gap: 12 });
    // the long body
    shape(shake([[260, 520], [450, 430], [700, 460], [940, 600], [920, 740], [700, 790], [430, 790], [250, 690]], 12), ICE, { gap: 16, miss: 0.06, angle: -30 });
    // flowing white mane down its back
    shape([...bumps([[330, 380], [500, 420], [650, 470], [800, 540]], 2, -40), [760, 600], [600, 520], [430, 470]] as P[], WHITE, { gap: 13, miss: 0.2 });
    // front flipper
    shape(shake([[420, 700], [330, 850], [430, 860], [500, 730]], 6), BLUE, { gap: 11, miss: 0 });
    // head, long horn, calm face
    shape(shake([[290, 350], [340, 160], [370, 360]], 5), HORN, { gap: 9, w: 10, miss: 0 }, 6);
    shape(potato(300, 470, 140, 115, 8, 0.05), ICE, { gap: 14, miss: 0.05 });
    stroke([[230, 440], [270, 452]], 6);
    stroke([[320, 455], [360, 442]], 6);
    dot(250, 465, 9, 11);
    dot(340, 470, 9, 11);
    shape(potato(210, 515, 24, 17, 6, 0.1), '#3a3440', { gap: 7, w: 8, miss: 0 }, 4);
    stroke([[250, 540], [300, 555], [345, 535]], 5.5);
    // sparkles of frost
    for (const [x, y] of [[150, 250], [520, 250], [900, 380], [1080, 300]]) {
      stroke([[x - 30, y], [x + 30, y]], 4);
      stroke([[x, y - 30], [x, y + 30]], 4);
    }
  },
} satisfies Draft;
