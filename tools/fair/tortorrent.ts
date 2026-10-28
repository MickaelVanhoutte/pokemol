import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Tortorrent's fair copy, Water/Steel, the same drawing grown up: its two spouts become one huge steel
 * cannon rising from its shell and a cannon on its forearm, the spikes round its shell bigger and tipped with steel,
 * bigger wavy fins for ears, heavier legs and longer claws, its roar wider, and the gold star on its shell.
 */
export default {
  id: '023', slug: 'tortorrent', seed: 23023, size: [1350, 1420], tilt: -6,
  draw(c) {
    const { shape, stroke, dot, potato, shake, spikes } = c;
    const BLUE = '#2f55c8', PALE = '#8fc0f0', BROWN = '#8e5628', YEL = '#e8c04e', STEEL = '#b9c3d3', IRON = '#5f6a80', WATER = '#6fb0f0';
    /** A steel cannon from `a` to its muzzle `b`, its bore dark, rings round it. */
    const cannon = (a: P, b: P, w: number) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      shape([[a[0] + nx * w, a[1] + ny * w], [b[0] + nx * w * 1.1, b[1] + ny * w * 1.1], [b[0] - nx * w * 1.1, b[1] - ny * w * 1.1], [a[0] - nx * w, a[1] - ny * w]], STEEL, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 }, {}, false);
      for (const t of [0.35, 0.7]) stroke([[a[0] + dx * t + nx * w * 1.05, a[1] + dy * t + ny * w * 1.05], [a[0] + dx * t - nx * w * 1.05, a[1] + dy * t - ny * w * 1.05]], { w: 10, col: IRON });
      shape(potato(b[0], b[1], w * 1.15, w * 0.5, 9, 0.03), IRON, { over: 0 });
      shape(potato(b[0], b[1], w * 0.65, w * 0.28, 8, 0.03), '#1e2430', { over: 0 }, { w: 3 });
    };
    // water gushing from the big cannon in a thick arc (only in battle)
    c.part('jet', { pivot: [790, 170], motion: 'flicker', period: 1.6, extra: true }, () => {
      shape([[760, 150], [700, 40], [600, 10], [640, 70], [560, 90], [660, 120], [720, 190]], WATER, { angle: 70, over: 0 }, { col: BLUE });
      shape([[830, 160], [900, 40], [1010, 20], [960, 80], [1040, 110], [920, 130], [860, 200]], WATER, { angle: 110, over: 0 }, { col: BLUE });
    });
    // the huge cannon rising from its shell, behind the head
    c.part('canon', { pivot: [790, 470], motion: 'nod', amp: 3, period: 3 }, () => cannon([800, 470], [790, 170], 80));
    // short thick tail
    shape(potato(930, 1030, 95, 58, 8, 0.1), PALE, { angle: 0 });
    // the shell: huge, brown, bigger spikes tipped with steel all round its edge
    const edge: P[] = [];
    for (let i = 0; i <= 8; i++) { const t = -1.3 + i * 0.33; edge.push([770 + Math.cos(t) * 222, 720 + Math.sin(t) * 332]); }
    const spiky = spikes(edge, 1, -85);
    shape([...spiky, [600, 1000], [560, 720], [600, 420]], STEEL, { angle: 60 }, {}, false);
    shape(potato(770, 720, 222, 332, 10, 0.05), BROWN, { angle: 70 });
    for (let i = -2; i <= 2; i++) stroke([[770 + i * 70, 420], [770 + i * 75, 1030]], { w: 4, col: '#5c3414' });
    for (let i = -4; i <= 4; i++) stroke([[600, 720 + i * 68], [985, 720 + i * 66]], { w: 4, col: '#5c3414' });
    c.shine([[900, 560], [925, 640]], 8);
    c.star(880, 800, 52, 10);
    // legs: thick, wide apart, stomping, longer claws
    for (const [x, s] of [[400, 1.15], [690, 1.05]] as [number, number][]) {
      shape(shake([[x - 75 * s, 1000], [x + 75 * s, 990], [x + 90 * s, 1110], [x - 90 * s, 1120]], 6), BLUE, { angle: 85 });
      for (let i = -1; i <= 1; i++) shape([[x + i * 50 * s - 12, 1190], [x + i * 78 * s, 1275], [x + i * 50 * s + 14, 1192]], '#ffffff', { over: 0 }, { w: 4 }, false);
      shape(potato(x, 1150, 115 * s, 58 * s, 9, 0.06), BLUE, { angle: 0 });
    }
    // body: a big round potato, its belly plate with its grid and the star
    shape(shake([[330, 520], [560, 430], [720, 520], [760, 760], [720, 990], [520, 1060], [340, 1010], [250, 820], [255, 640]], 10), BLUE, { angle: 70 });
    shape(potato(470, 790, 175, 210, 9, 0.05), YEL, { angle: 80, over: 0 });
    for (let i = -3; i <= 3; i++) stroke([[350, 790 + i * 55], [600, 790 + i * 52]], { w: 4.5, col: '#a07a24' });
    stroke([[470, 590], [480, 990]], { w: 4.5, col: '#a07a24' });
    // the arm flexed up behind
    shape(shake([[660, 560], [760, 470], [800, 380], [860, 400], [830, 500], [720, 620]], 5), BLUE, { angle: 40 });
    for (const [a, b] of [[[810, 385], [795, 320]], [[835, 385], [860, 325]], [[855, 405], [915, 375]]] as [P, P][]) shape([[a[0] - 8, a[1]], b, [a[0] + 8, a[1] + 4]], '#ffffff', { over: 0 }, { w: 4 }, false);
    // the fist thrust forward, a steel cannon on its forearm
    c.part('poing', { pivot: [300, 640], motion: 'peek', to: [10, 0], period: 1.6 }, () => {
      shape(shake([[300, 600], [190, 640], [110, 700], [80, 780], [150, 800], [220, 740], [320, 700]], 5), BLUE, { angle: 30 });
      cannon([230, 660], [110, 640], 34);
      shape(potato(95, 800, 74, 64, 8, 0.06), BLUE, { angle: 0 });
      for (const [a, b] of [[[60, 770], [0, 730]], [[50, 805], [-15, 815]], [[70, 845], [25, 900]]] as [P, P][]) shape([[a[0], a[1] - 9], b, [a[0] + 6, a[1] + 9]], '#ffffff', { over: 0 }, { w: 4 }, false);
    });
    // bigger wavy fins for ears, then the head
    shape(spikes([[300, 300], [250, 230], [270, 150]], 2, 34).concat([[330, 210], [370, 270]]), PALE, { angle: 60 }, {}, false);
    shape(spikes([[490, 250], [560, 170], [640, 160]], 2, -34).concat([[600, 240], [540, 290]]), PALE, { angle: 120 }, {}, false);
    shape(potato(420, 360, 155, 132, 10, 0.05), BLUE, { angle: 35 });
    // the angry roaring face, its mouth wider
    stroke([[305, 298], [385, 335]], { w: 12 });
    stroke([[455, 330], [535, 286]], { w: 12 });
    dot(352, 345, 13, 16);
    dot(488, 338, 12, 15);
    const mouth: P[] = [[300, 398], [380, 382], [460, 390], [530, 408], [490, 480], [390, 495], [320, 455]];
    shape(mouth, '#5a2430', { over: 0 }, { w: 6 });
    shape([[350, 460], [400, 445], [455, 452], [465, 478], [395, 488]], '#e2667a', { over: 0 }, { w: 4 });
    for (const [x, y] of [[335, 400], [410, 390], [480, 398]] as P[]) c.paper([[x, y], [x + 14, y + 34], [x + 28, y - 2]], { w: 4.5 }, false);
    c.shine([[330, 280], [355, 265]], 6);
  },
} satisfies Fair;
