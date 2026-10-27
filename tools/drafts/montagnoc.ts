import type { Draft } from './kid.ts';

/** Rocailloux grown: a walking mountain turned three-quarters to the left, a shell of rock plates, its head poking out in front. */
export default {
  id: '040', slug: 'montagnoc', seed: 22, layered: true, size: [1200, 1100], tilt: -3, pivot: [600, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot } = k;
    const ROCK = '#8a7f72', BODY = '#b08a62', DARK = '#5e564d';
    // the far leg and far arm, behind the shell on the left
    shape(potato(430, 950, 90, 62, 7, 0.08), BODY, { gap: 12, miss: 0 });
    shape(shake([[300, 620], [200, 600], [160, 680], [220, 740], [310, 720]], 8), BODY, { gap: 12, miss: 0 });
    for (const dy of [-30, 0, 30]) stroke([[170, 690 + dy], [130, 690 + dy * 1.3]], 6);
    // the shell: a big round boulder covered in plates
    shape(potato(640, 600, 370, 330, 12, 0.05), ROCK, { gap: 17, miss: 0.05 });
    for (const [x, y, rx, ry] of [[560, 420, 100, 75], [780, 420, 110, 85], [520, 620, 85, 95], [700, 600, 120, 95], [880, 610, 95, 105], [580, 800, 105, 72], [790, 800, 110, 75]]) {
      shape(potato(x, y, rx, ry, 7, 0.12), ROCK, { gap: 14, miss: 0.1 }, 5.5);
    }
    for (const [x, y] of [[660, 700], [750, 500], [540, 520], [860, 720]]) shape(potato(x, y, 20, 16, 6, 0.15), DARK, { gap: 7, w: 8, miss: 0 }, 4);
    // the near leg and near arm, in front on the right
    shape(potato(820, 960, 105, 72, 7, 0.08), BODY, { gap: 12, miss: 0 });
    shape(shake([[960, 620], [1070, 600], [1110, 680], [1050, 740], [950, 720]], 8), BODY, { gap: 12, miss: 0 });
    for (const dy of [-30, 0, 30]) stroke([[1100, 690 + dy], [1140, 690 + dy * 1.3]], 6);
    // the head poking out at the front left, a snout, two fangs
    k.part('tete', { pivot: [500, 420], motion: 'peek', to: [25, 15], shrink: 0.5, fade: true, inside: true, period: 4.4 }, () => {
      shape(shake([[260, 330], [330, 250], [460, 240], [540, 300], [550, 400], [480, 460], [330, 460], [250, 420], [215, 380]], 6), BODY, { gap: 13, miss: 0.04 });
      stroke([[290, 315], [335, 335]], 9);
      stroke([[395, 340], [460, 315]], 10);
      dot(310, 360, 8, 12);
      dot(425, 362, 11, 13);
      dot(232, 380, 7, 6);
      stroke([[255, 415], [320, 400], [390, 420]], 7);
      k.raw(`<path d='M280 412 L288 430 L298 409 Z M340 407 L350 428 L360 413 Z' fill='#fff' stroke='#2e2a35' stroke-width='4' stroke-linejoin='round'/>`);
    });
  },
} satisfies Draft;
