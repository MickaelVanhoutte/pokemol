import type { Draft, P } from './kid.ts';

/** Chantouille's evolution: taller and fluffy, a big curl of fur on top, singing into its microphone. */
export default {
  id: '047', slug: 'chantouffe', seed: 21, layered: true, size: [1100, 1100], tilt: 3, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot, bumps, raw } = k;
    const PINK = '#f6a8c8', WHITE = '#fdf3f7', MIC = '#7fcf55', DARK = '#4a4458';
    // the far ear and far foot, behind
    shape(shake([[360, 330], [220, 70], [300, 80], [420, 300]], 6), PINK, { gap: 12 });
    shape(potato(420, 985, 70, 38, 7, 0.1), PINK, { gap: 11, miss: 0 });
    // the far arm holding the microphone up, its shoulder hidden behind the body
    shape(shake([[330, 640], [220, 600], [200, 640], [310, 690]], 6), PINK, { gap: 11, miss: 0 });
    shape(shake([[190, 520], [215, 520], [222, 650], [188, 652]], 4), DARK, { gap: 7, w: 8, miss: 0 }, 5);
    shape(potato(202, 490, 38, 40, 7, 0.06), MIC, { gap: 8, w: 9, miss: 0 }, 5);
    // the tall fluffy body, its edge all fluff, turned left
    const body: P[] = [];
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 9) body.push([560 + Math.cos(a) * 270, 640 + Math.sin(a) * 330]);
    shape(bumps([...body, body[0]], 1, -30), PINK, { gap: 15, miss: 0.08 });
    shape(potato(480, 770, 140, 165, 9, 0.06), WHITE, { gap: 13, miss: 0.15 });
    shape(potato(650, 985, 80, 42, 7, 0.1), PINK, { gap: 11, miss: 0 });
    // the near ear
    shape(shake([[600, 300], [740, 50], [790, 90], [660, 330]], 6), PINK, { gap: 12 });
    // the big curl of fur on top
    shape(shake([[440, 330], [410, 230], [480, 170], [580, 190], [600, 260], [540, 290], [500, 250], [540, 230]], 6), WHITE, { gap: 11, miss: 0.1 });
    // big eyes shifted left (the far one smaller), singing toward the microphone
    shape(potato(375, 470, 46, 66, 8, 0.03), '#ffffff', { gap: 9, w: 6, miss: 0.6 }, 6);
    dot(378, 485, 18, 28);
    dot(384, 466, 6);
    shape(potato(540, 470, 62, 70, 8, 0.03), '#ffffff', { gap: 9, w: 6, miss: 0.6 }, 6);
    dot(545, 485, 26, 30);
    dot(553, 466, 8);
    raw(`<path d='${k.smooth([[340, 585], [405, 585], [397, 640], [348, 640]], true)}' fill='#5a2430' stroke='#2e2a35' stroke-width='6'/>`);
    // music notes
    k.part('notes', { pivot: [550, 550], motion: 'flicker', period: 2.2 }, () => {
      for (const [x, y] of [[150, 300], [960, 330], [130, 760], [960, 780]]) {
        dot(x, y, 22, 17, -20);
        stroke([[x + 18, y - 5], [x + 18, y - 75], [x + 55, y - 60]], 6);
      }
    });
  },
} satisfies Draft;
