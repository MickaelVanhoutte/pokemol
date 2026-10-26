import type { Draft, P } from './kid.ts';

/** Clapoflot's evolution: huge and heavy, a spiked shell with two spouts gushing water. */
export default {
  id: '023', slug: 'tortorrent', seed: 21, size: [1350, 1420], tilt: -6, pivot: [560, 720], offset: [110, 90],
  draw(k) {
    const { j, potato, shake, shape, colourOnly, stroke, dot, raw, bumps, spikes, sharpLine, smooth } = k;
    const BLUE = '#2f4fc2', PALE = '#8fc0f0', BROWN = '#8e5628', YEL = '#e0bb48', GREY = '#9a98a8';

    // water gushing from the two spouts in thick arcs, splashing at the end
    for (const [x, y, dir] of [[695, 250, -1], [888, 300, 1]] as [number, number, number][]) {
      const mid = (t: number): P => [x + dir * 280 * t, y - 260 * Math.sin(Math.PI * t * 0.8) + 120 * t * t];
      const left: P[] = [], right: P[] = [];
      for (let i = 0; i <= 8; i++) {
        const t = i / 8, [mx, my] = mid(t), [nx, ny] = mid(Math.min(1, t + 0.05)), w = 28 + 30 * t;
        const dx = nx - mx, dy = ny - my, l = Math.hypot(dx, dy) || 1;
        left.push([mx - (dy / l) * w, my + (dx / l) * w]); right.push([mx + (dy / l) * w, my - (dx / l) * w]);
      }
      const jet = [...left, ...bumps([left[8], right[8]], 2, dir * 30), ...right.reverse()] as P[];
      colourOnly(jet, '#6fa8ea', { angle: dir * 70, gap: 13, w: 14, miss: 0.05 });
      stroke(left.slice(0, 8), 5); stroke(right.slice(1), 5);
      for (const [ox, oy] of [[30, 30], [70, -10], [10, 70]] as P[]) {
        const [ex, ey] = mid(1);
        shape([[ex + dir * ox, ey + oy - 24], [ex + dir * ox + 12, ey + oy], [ex + dir * ox + 8, ey + oy + 12], [ex + dir * ox - 8, ey + oy + 12], [ex + dir * ox - 12, ey + oy]], '#6fa8ea', { gap: 8, w: 7, miss: 0 }, 5);
      }
    }
    // the spouts: two grey tubes sticking out of the shell
    shape(shake([[650, 400], [660, 250], [735, 245], [740, 400]], 8), GREY, { gap: 14, w: 11 });
    shape(shake([[830, 430], [850, 300], [925, 305], [915, 445]], 8), GREY, { gap: 14, w: 11 });
    stroke([[655, 262], [732, 258]], 5); stroke([[848, 312], [922, 318]], 5);

    // short thick tail
    shape(potato(930, 1030, 90, 55, 7, 0.18), PALE, { gap: 16 });

    // the shell: huge, brown, spikes all along its edge
    shape(potato(770, 720, 220, 330, 9, 0.08), BROWN, { gap: 15, w: 12, miss: 0.12 });
    for (let i = -2; i <= 2; i++) stroke([[770 + i * 70 + j(14), 420], [770 + i * 75 + j(18), 1030]], 4);
    for (let i = -4; i <= 4; i++) stroke([[600, 720 + i * 68 + j(14)], [985, 720 + i * 66 + j(18)]], 4);
    {
      const edge: P[] = [];
      for (let i = 0; i <= 8; i++) { const t = -1.3 + i * 0.33; edge.push([770 + Math.cos(t) * 222, 720 + Math.sin(t) * 332]); }
      sharpLine(spikes(edge, 1, -60), 6);
    }

    // legs: thick, wide apart, stomping, with ground lines
    for (const [x, s] of [[400, 1.1], [690, 1]] as [number, number][]) {
      shape(shake([[x - 70 * s, 1000], [x + 70 * s, 990], [x + 85 * s, 1110], [x - 85 * s, 1120]], 12), BLUE, { gap: 14 });
      shape(potato(x + j(10), 1150, 110 * s, 55 * s, 8, 0.12), BLUE, { gap: 14 });
      for (let i = -1; i <= 1; i++) stroke([[x + i * 50 * s, 1195], [x + i * 72 * s + j(14), 1265]], 6.5);
      for (const dx of [-170, 170]) stroke([[x + dx * s, 1210], [x + dx * 1.35 * s, 1170]], 5);
    }

    // body: a big round potato
    shape(shake([[330, 520], [560, 430], [720, 520], [760, 760], [720, 990], [520, 1060], [340, 1010], [250, 820], [255, 640]], 26), BLUE, { angle: -70 });
    // belly plate with its grid
    shape(potato(470, 790, 175, 210, 8, 0.1), YEL, { gap: 15, w: 12, miss: 0.15 });
    for (let i = -3; i <= 3; i++) stroke([[350, 790 + i * 55 + j(10)], [600, 790 + i * 52 + j(14)]], 4.5);
    stroke([[470, 590], [480, 990]], 4.5);

    // arms: huge, one fist forward with claws out, one flexed up
    shape(shake([[300, 600], [190, 640], [110, 700], [80, 780], [150, 800], [220, 740], [320, 700]], 10), BLUE, { gap: 14 });
    shape(potato(95, 800, 70, 60, 7, 0.14), BLUE, { gap: 14 });
    for (const [a, b] of [[[60, 770], [10, 735]], [[50, 805], [-5, 815]], [[70, 845], [30, 890]]] as [P, P][]) stroke([a, [b[0] + j(12), b[1] + j(12)]], 7);
    for (const i of [0, 1, 2]) stroke([[170 + i * 20, 860 + i * 18], [260 + i * 15, 880 + i * 18]], 5);
    shape(shake([[660, 560], [760, 470], [800, 380], [860, 400], [830, 500], [720, 620]], 10), BLUE, { gap: 14 });
    for (const [a, b] of [[[810, 385], [800, 330]], [[835, 385], [855, 335]], [[855, 405], [905, 380]]] as [P, P][]) stroke([a, [b[0] + j(12), b[1] + j(12)]], 6.5);

    // head: smaller than the body now, little wavy fins for ears
    shape(shake([[300, 300], [270, 250], [300, 200], [330, 235], [345, 210], [365, 260]], 8), PALE, { gap: 12, w: 10 });
    shape(shake([[480, 255], [510, 200], [545, 215], [560, 180], [580, 230], [540, 280]], 8), PALE, { gap: 12, w: 10 });
    shape(potato(420, 360, 150, 128, 8, 0.08), BLUE, { angle: -55 });
    // the angry roaring face
    stroke([[310, 300], [385, 335]], 10); stroke([[455, 330], [528, 290]], 10);
    dot(352, 345, 13, 16, 20); dot(488, 338, 12, 15, -20);
    {
      const mouth = shake([[310, 400], [380, 385], [460, 392], [520, 410], [480, 470], [390, 485], [330, 450]], 8);
      raw(`<path d='${smooth(mouth, true)}' fill='#5a2430'/>`, true);
      shape(shake([[350, 455], [400, 440], [450, 448], [460, 472], [395, 482]], 5), '#e2667a', { gap: 8, w: 8, miss: 0 }, 4);
      shape(mouth, '#5a2430', { gap: 8, w: 0.1, miss: 0 }, 7);
      raw(`<path d='M335 402 L348 432 L362 396 Z M410 392 L422 426 L436 394 Z M480 398 L490 426 L500 404 Z' fill='#fff' stroke='#2e2a35' stroke-width='4.5' stroke-linejoin='round'/>`);
    }
    // splashes
    for (const [x, y] of [[180, 300], [1030, 470], [990, 160], [560, 120], [130, 1000]] as P[]) {
      shape([[x, y - 28], [x + 14, y], [x + 9, y + 14], [x - 9, y + 14], [x - 14, y]], PALE, { gap: 8, w: 7, miss: 0 }, 5);
    }
  },
} satisfies Draft;
