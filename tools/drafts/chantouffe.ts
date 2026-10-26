import type { Draft, P } from './kid.ts';

/** Chantouille's evolution: taller and fluffy, a big curl of fur on top, singing into its microphone. */
export default {
  id: '047', slug: 'chantouffe', seed: 21, layered: true, size: [1100, 1100], tilt: 3, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot, bumps, raw } = k;
    const PINK = '#f6a8c8', WHITE = '#fdf3f7', MIC = '#7fcf55', DARK = '#4a4458';
    // long ears
    shape(shake([[400, 330], [250, 60], [330, 70], [460, 300]], 6), PINK, { gap: 12 });
    shape(shake([[640, 300], [780, 50], [830, 90], [700, 330]], 6), PINK, { gap: 12 });
    // feet and the tall fluffy body, its edge all fluff
    shape(potato(420, 985, 75, 40, 7, 0.1), PINK, { gap: 11, miss: 0 });
    shape(potato(640, 985, 75, 40, 7, 0.1), PINK, { gap: 11, miss: 0 });
    const body: P[] = [];
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 9) body.push([540 + Math.cos(a) * 270, 640 + Math.sin(a) * 330]);
    shape(bumps([...body, body[0]], 1, -30), PINK, { gap: 15, miss: 0.08 });
    shape(potato(540, 770, 150, 170, 9, 0.06), WHITE, { gap: 13, miss: 0.15 });
    // the big curl of fur on top
    shape(shake([[460, 330], [430, 230], [500, 170], [600, 190], [620, 260], [560, 290], [520, 250], [560, 230]], 6), WHITE, { gap: 11, miss: 0.1 });
    // huge eyes, singing mouth
    for (const x of [450, 630]) {
      shape(potato(x, 470, 62, 70, 8, 0.03), '#ffffff', { gap: 9, w: 6, miss: 0.6 }, 6);
      dot(x + 8, 485, 26, 30);
      dot(x + 16, 466, 8);
    }
    raw(`<path d='${k.smooth([[505, 585], [580, 585], [570, 640], [515, 640]], true)}' fill='#5a2430' stroke='#2e2a35' stroke-width='6'/>`);
    // the microphone in its hand
    shape(shake([[780, 640], [880, 560], [900, 600], [800, 690]], 6), PINK, { gap: 11, miss: 0 });
    shape(shake([[880, 520], [905, 520], [915, 660], [880, 662]], 4), DARK, { gap: 7, w: 8, miss: 0 }, 5);
    shape(potato(892, 490, 38, 40, 7, 0.06), MIC, { gap: 8, w: 9, miss: 0 }, 5);
    // music notes
    for (const [x, y] of [[180, 300], [960, 330], [220, 620], [960, 780]]) {
      dot(x, y, 22, 17, -20);
      stroke([[x + 18, y - 5], [x + 18, y - 75], [x + 55, y - 60]], 6);
    }
  },
} satisfies Draft;
