import type { Crayon, P, Redraw } from './crayon.ts';

/** Stations evenly spaced along a polyline, with their normal. */
function stations(path: P[], n: number): { p: P; nx: number; ny: number }[] {
  const seg = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i][0], q[1] - path[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const at = (d: number): P => {
    let i = 0;
    while (i < seg.length - 1 && d > seg[i]) d -= seg[i++];
    const t = Math.min(1, d / (seg[i] || 1)), a = path[i], b = path[i + 1];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  return Array.from({ length: n + 1 }, (_, k) => {
    const d = (total * k) / n, p = at(d), q = at(Math.min(total, d + 4)), o = at(Math.max(0, d - 4));
    const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1;
    return { p, nx: -dy / l, ny: dx / l };
  });
}

/**
 * A folded-paper body like a paper dragon's: panels along `path` (tail first, so the panels nearer the head
 * cover the ones behind), light and dark in turn, every other fold sticking out a bit.
 */
export function accordion(c: Crayon, path: P[], n: number, w0: number, w1: number, cols: string[], deco?: (k: number, centre: P, w: number) => void) {
  const st = stations(path, n);
  const width = (k: number) => (w0 + ((w1 - w0) * k) / n) * (k % 2 ? 1.12 : 1);
  const after: (() => void)[] = [];
  for (let k = 0; k < n; k++) {
    const a = st[k], b = st[k + 1], wa = width(k) / 2, wb = width(k + 1) / 2;
    const quad: P[] = [[a.p[0] + a.nx * wa, a.p[1] + a.ny * wa], [b.p[0] + b.nx * wb, b.p[1] + b.ny * wb], [b.p[0] - b.nx * wb, b.p[1] - b.ny * wb], [a.p[0] - a.nx * wa, a.p[1] - a.ny * wa]];
    c.shape(quad, cols[k % cols.length], { angle: (Math.atan2(a.ny, a.nx) * 180) / Math.PI, over: 0.2 }, { w: 3.5 }, false);
    if (deco) after.push(() => deco(k, [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2], wa + wb));
  }
  // decorations (pompoms, scales) on top of every fold
  for (const f of after) f();
}

/** A tassel: a gold knot and a fringe of threads hanging from (x, y). */
export function tassel(c: Crayon, x: number, y: number, s: number, col: string, thread: string) {
  const fringe: P[] = [[x - 26 * s, y + 10 * s], [x - 40 * s, y + 90 * s], [x - 20 * s, y + 80 * s], [x - 10 * s, y + 100 * s], [x + 4 * s, y + 82 * s], [x + 20 * s, y + 102 * s], [x + 30 * s, y + 80 * s], [x + 42 * s, y + 92 * s], [x + 26 * s, y + 10 * s]];
  c.shape(fringe, thread, { angle: 90, over: 0 }, { w: 3 }, false);
  c.shape(c.potato(x, y, 26 * s, 22 * s, 8, 0.05), col, { over: 0 }, { w: 3.5 });
}

/**
 * A baby paper dragon turned to the left, like the ones children fold for a parade: a big round red head with a
 * gold muzzle, two little rolled-paper horns and a pink pompom, a short accordion body of a few folds and a gold
 * tassel for a tail.
 */
export default {
  id: '084', slug: 'plissou', seed: 8401, size: [1000, 880], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const RED = '#e2423a', LIGHT = '#f58a72', GOLD = '#f2c43a', PINK = '#f29ac8';
    // the tassel tail, then the short accordion body, tail first
    accordion(c, [[880, 380], [810, 470], [690, 520], [470, 480]], 7, 110, 170, [RED, LIGHT]);
    tassel(c, 898, 350, 1, GOLD, '#f7a12b');
    // little paws under it
    shape(band([[620, 560], [630, 640]], 44, 40), LIGHT, { angle: 90, over: 0 });
    shape(potato(640, 650, 34, 20, 7, 0.06), GOLD, { over: 0 });
    shape(band([[460, 560], [450, 650]], 48, 44), LIGHT, { angle: 90, over: 0 });
    shape(potato(440, 660, 38, 22, 7, 0.06), GOLD, { over: 0 });
    // a ruffled gold mane round the back of its head, and the far horn, behind
    shape(c.spikes([[420, 560], [530, 470], [550, 340], [480, 230]], 3, 40).concat([[400, 300]]), GOLD, { angle: 60, over: 0 }, {}, false);
    shape(band([[420, 230], [470, 160], [450, 110]], 34, 22), GOLD, { angle: 90, over: 0 });
    // the big round head, a gold muzzle
    shape(potato(340, 400, 200, 175, 12, 0.04), RED, { angle: 75, over: 0.5 });
    shape([[150, 430], [200, 390], [320, 420], [360, 500], [300, 560], [190, 560], [140, 500]], GOLD, { angle: 80, over: 0.2 }, { w: 4 });
    dot(175, 440, 9, 7);
    dot(225, 432, 9, 7);
    stroke([[180, 515], [230, 532], [280, 518]], { w: 4.5 });
    // short ribbon whiskers
    shape(band([[160, 465], [100, 445], [60, 480], [50, 530]], 22, 12), PINK, { over: 0 }, { w: 3 });
    shape(band([[170, 525], [110, 555], [95, 600], [110, 640]], 22, 12), PINK, { over: 0 }, { w: 3 });
    // the near horn, a pink pompom on top
    shape(band([[330, 240], [310, 160], [345, 110]], 38, 24), GOLD, { angle: 90, over: 0 });
    shape(potato(390, 220, 44, 40, 10, 0.12), PINK, { angle: 60, over: 0.2 }, { w: 3.5 });
    // big round eyes with gold lids, looking left
    c.paper(potato(250, 330, 34, 38, 8, 0.05));
    c.paper(potato(360, 320, 38, 42, 8, 0.05));
    dot(240, 338, 18, 23);
    dot(350, 329, 20, 25);
    dot(233, 325, 6, 7, '#ffffff');
    dot(342, 315, 6.5, 7.5, '#ffffff');
    stroke([[212, 292], [255, 284], [290, 296]], { w: 5, col: '#c48a1a' });
    stroke([[318, 280], [362, 270], [402, 285]], { w: 5, col: '#c48a1a' });
    // folds drawn on the head too: it's paper
    stroke([[450, 300], [470, 420], [455, 520]], { w: 3, col: '#a8302a' });
  },
} satisfies Redraw;
