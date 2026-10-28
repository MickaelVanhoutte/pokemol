import type { P, Redraw } from './crayon.ts';

/**
 * A little jellyfish made of tissue paper, turned to the left: a pink dome of overlapping tissue squares with a
 * wavy rim, a shy smile, and ribbons of crepe paper for tentacles, their tips green with poison.
 */
export default {
  id: '101', slug: 'medusoie', seed: 10103, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, paper, stroke, dot, tint, band, potato } = c;
    const PINK = '#f2a0c8', LILAC = '#b48be0', TEAL = '#5cc6c0', POISON = '#7bc043', SEA = '#bfe3f7';
    /** A crepe-paper ribbon hanging down in waves from (x, y). */
    const ribbon = (x: number, y: number, len: number, sway: number, w: number, col: string) => {
      const path: P[] = Array.from({ length: 6 }, (_, k) => [x + Math.sin(k * 1.3) * sway, y + (k * len) / 5]);
      shape(band(path, w, w * 0.45), col, { angle: 90, over: 0.2 });
      const end = path[path.length - 1];
      shape(potato(end[0], end[1] + 6, 15, 18, 7, 0.06), POISON, { over: 0 });
    };
    // the ribbons at the back, behind the dome
    c.part('tentacules-loin', { pivot: [560, 540], motion: 'swing', amp: 9, period: 2.6, behind: true, phase: 0.5 }, () => {
      ribbon(610, 530, 330, 28, 34, TEAL);
      ribbon(690, 500, 290, -24, 30, LILAC);
    });
    // the dome, its rim in waves
    const dome: P[] = [[255, 545], [262, 410], [340, 300], [470, 255], [610, 275], [715, 370], [742, 515], [705, 562], [650, 540], [600, 578], [540, 552], [480, 588],
      [420, 556], [360, 588], [300, 558]];
    shape(dome, PINK, { angle: 60, over: 0.4 });
    // squares of tissue paper laid over each other
    tint([[540, 300], [660, 330], [640, 450], [520, 420]], LILAC, { gap: 3.2, wash: 0.5 });
    tint([[300, 430], [400, 400], [420, 500], [310, 520]], '#f7c2dc', { gap: 3.2, wash: 0.5 });
    tint([[600, 430], [710, 420], [720, 520], [610, 535]], TEAL, { gap: 3.2, wash: 0.4 });
    stroke([[540, 300], [660, 330], [640, 450], [520, 420], [540, 300]], { w: 2.5, col: '#9a6fc6' }, false);
    // the rim, a frill of lighter paper
    stroke([[290, 540], [345, 565], [400, 540], [455, 568], [515, 538], [575, 562], [632, 528], [690, 545]], { w: 4 });
    // a shy face, turned to the left: the far eye smaller
    paper(potato(345, 425, 24, 30, 8, 0.04));
    paper(potato(440, 418, 32, 38, 8, 0.04));
    dot(340, 432, 12, 17);
    dot(434, 426, 16, 21);
    dot(335, 422, 4, 5, '#ffffff');
    dot(428, 414, 5, 6, '#ffffff');
    tint(potato(485, 470, 24, 14, 7, 0.1), '#e8578f', { gap: 3 });
    tint(potato(312, 478, 16, 11, 7, 0.1), '#e8578f', { gap: 3 });
    stroke([[358, 485], [392, 502], [425, 488]], { w: 5 });
    // the ribbons in front: in battle they sway
    c.part('tentacules', { pivot: [440, 570], motion: 'swing', amp: 8, period: 2.2 }, () => {
      ribbon(330, 575, 300, 26, 36, LILAC);
      ribbon(450, 585, 360, -30, 40, TEAL);
      ribbon(560, 570, 310, 24, 34, PINK);
    });
    // only in battle: bubbles rise round it
    c.part('bulles', { pivot: [500, 500], motion: 'flicker', period: 2, extra: true }, () => {
      for (const [x, y, r] of [[170, 300, 26], [140, 420, 16], [830, 230, 22], [860, 340, 14], [800, 720, 18]] as const) {
        paper(potato(x, y, r, r, 8, 0.03), { w: 3 });
        tint(potato(x, y, r * 0.8, r * 0.8, 8, 0.03), SEA, { gap: 3 });
      }
    });
  },
} satisfies Redraw;
