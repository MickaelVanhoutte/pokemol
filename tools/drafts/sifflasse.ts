import type { Draft } from './kid.ts';

/** A coiled purple snake, head up, yellow rings, a forked tongue and drops of venom. */
export default {
  id: '033', slug: 'sifflasse', seed: 21, layered: true, size: [1100, 1050], tilt: 2, pivot: [550, 560],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot, band } = k;
    const PURPLE = '#8b4fc4', YEL = '#f2cf3a', RED = '#e04040', GREEN = '#7fcf55';
    // bottom coil and the tail with its yellow rattle
    k.part('crecelle', { pivot: [630, 895], motion: 'swing', amp: 6, period: 0.35, behind: true }, () => {
      shape(band([[620, 900], [760, 890], [860, 840], [920, 760]], 34, 18), PURPLE, { gap: 12 });
      for (const [x, y] of [[925, 740], [945, 705], [960, 672]]) shape(potato(x, y, 22, 18, 6, 0.1), YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
    });
    shape(potato(500, 870, 300, 105, 10, 0.05), PURPLE, { gap: 15, miss: 0.05, angle: -20 });
    shape(potato(500, 745, 230, 92, 9, 0.05), PURPLE, { gap: 14, miss: 0.05, angle: -20 });
    for (const x of [300, 420, 560, 690]) stroke([[x, 790 + j(10)], [x + 15, 960 + j(10)]], 7);
    // the neck rising up, with a yellow belly
    shape(band([[560, 720], [600, 600], [560, 470], [470, 380]], 62, 50), PURPLE, { gap: 14, miss: 0.04 });
    for (const [x, y] of [[560, 690], [575, 620], [565, 550], [530, 480]]) stroke([[x - 40, y], [x + 30, y + 10]], 5);
    // head turned left (a long snout), slit eyes, the far one smaller, tongue
    shape(shake([[290, 330], [330, 260], [430, 220], [540, 250], [560, 330], [490, 400], [370, 410], [290, 380]], 5), PURPLE, { gap: 14, miss: 0.03 });
    shape(potato(352, 300, 20, 20, 6, 0.08), YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
    stroke([[352, 286], [353, 314]], 5);
    shape(potato(440, 296, 30, 24, 6, 0.08), YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
    stroke([[440, 278], [442, 314]], 6);
    stroke([[300, 365], [420, 380]], 5);
    k.part('langue', { pivot: [300, 370], motion: 'peek', to: [40, 0], shrink: 0.4, fade: true, period: 1.8 }, () => {
      stroke([[300, 365], [220, 372], [180, 345]], 5);
      shape(shake([[300, 368], [215, 372], [175, 345], [205, 382], [175, 410], [220, 385], [300, 378]], 3), RED, { gap: 6, w: 7, miss: 0 }, 4);
    });
    // venom drops
    for (const [x, y] of [[180, 470], [700, 330], [760, 470]]) shape([[x, y - 30], [x + 14, y], [x + 9, y + 14], [x - 9, y + 14], [x - 14, y]], GREEN, { gap: 7, w: 8, miss: 0 }, 4.5);
    dot(305, 345, 4); dot(322, 347, 4);
  },
} satisfies Draft;
