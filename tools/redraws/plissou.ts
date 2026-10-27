import type { Crayon, P, Redraw } from './crayon.ts';
import { star } from './lumignon.ts';

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

/** A star charm hanging from a ribbon at the tip of the tail. */
export function charm(c: Crayon, x: number, y: number, s: number, col: string, ribbon: string) {
  c.shape(c.band([[x, y], [x + 18 * s, y - 30 * s], [x + 10 * s, y - 60 * s]], 14 * s, 10 * s), ribbon, { over: 0 }, { w: 3 });
  c.shape(star(x + 12 * s, y - 92 * s, 40 * s, 0.25), col, { over: 0, press: 1.1 }, { w: 3.5 }, false);
  c.dot(x + 4 * s, y - 100 * s, 4 * s, 4 * s, '#ffffff');
}

/** A unicorn's spiral horn from `base` to `tip`, striped like a candy stick. */
export function horn(c: Crayon, base: P, tip: P, w: number, col: string, stripe: string) {
  c.shape(c.band([base, tip], w, 6), col, { angle: 60, over: 0 }, { w: 3.5 });
  const n = 4;
  for (let k = 1; k <= n; k++) {
    const t = k / (n + 1), ww = (w * (1 - t) + 6 * t) / 2;
    const cx = base[0] + (tip[0] - base[0]) * t, cy = base[1] + (tip[1] - base[1]) * t;
    const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
    c.stroke([[cx - uy * ww - ux * ww * 0.5, cy + ux * ww - uy * ww * 0.5], [cx + uy * ww + ux * ww * 0.5, cy - ux * ww + uy * ww * 0.5]], { w: 4, col: stripe });
  }
}

/** A little paper flower: five round petals and a heart. */
export function flower(c: Crayon, x: number, y: number, r: number, petal: string, heart: string) {
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    c.shape(c.potato(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.48, r * 0.48, 7, 0.06), petal, { over: 0 }, { w: 2.5 });
  }
  c.shape(c.potato(x, y, r * 0.36, r * 0.36, 7, 0.05), heart, { over: 0 }, { w: 2.5 });
}

/**
 * A baby fairy dragon folded out of pastel tissue paper, turned to the left: a big round pink head with a cream
 * muzzle, a little striped unicorn horn, a paper flower by its ear, a soft scalloped mane, big starry eyes, a short
 * accordion body of pink and lilac folds and a star charm at the end of its tail, like a magic wand.
 */
export default {
  id: '084', slug: 'plissou', seed: 8401, size: [1000, 880], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const PINK = '#f28dc0', LILAC = '#b99be8', CREAM = '#fff0d2', SKY = '#8fcdf2', STAR = '#f7dc35', DEEP = '#d0619d';
    // the short accordion body, tail first, and the star charm at the tip of its tail
    accordion(c, [[880, 380], [810, 470], [690, 520], [470, 480]], 7, 110, 170, [PINK, LILAC]);
    charm(c, 890, 380, 1, STAR, SKY);
    // little paws under it
    shape(band([[620, 560], [630, 640]], 44, 40), LILAC, { angle: 90, over: 0 });
    shape(potato(640, 650, 34, 20, 7, 0.06), CREAM, { over: 0 });
    shape(band([[460, 560], [450, 650]], 48, 44), LILAC, { angle: 90, over: 0 });
    shape(potato(440, 660, 38, 22, 7, 0.06), CREAM, { over: 0 });
    // a soft scalloped mane round the back of its head, and the far horn, behind
    const mane: P[] = [];
    for (let k = 0; k <= 10; k++) { const a = -1.9 + k * 0.33, r = k % 2 ? 205 : 230; mane.push([360 + Math.cos(a) * r, 400 + Math.sin(a) * r]); }
    shape([...mane, [360, 400]], LILAC, { angle: 60, over: 0 });
    // the big round head, a cream muzzle, rosy cheeks
    shape(potato(340, 400, 200, 175, 12, 0.04), PINK, { angle: 75, over: 0.5 });
    shape([[150, 430], [200, 390], [320, 420], [360, 500], [300, 560], [190, 560], [140, 500]], CREAM, { angle: 80, over: 0.2 }, { w: 4 });
    c.tint(potato(395, 470, 34, 22, 8, 0.1), DEEP, { gap: 3 });
    dot(175, 440, 8, 6);
    dot(225, 432, 8, 6);
    stroke([[180, 515], [230, 532], [280, 518]], { w: 4.5 });
    // short ribbon whiskers
    shape(band([[160, 465], [100, 445], [60, 480], [50, 530]], 22, 12), SKY, { over: 0 }, { w: 3 });
    shape(band([[170, 525], [110, 555], [95, 600], [110, 640]], 22, 12), SKY, { over: 0 }, { w: 3 });
    // a little unicorn horn on its brow, a paper flower by its ear
    horn(c, [300, 250], [270, 130], 46, '#fff6e6', PINK);
    flower(c, 430, 255, 46, SKY, STAR);
    // big starry eyes with lashes, looking left
    c.paper(potato(250, 330, 34, 38, 8, 0.05));
    c.paper(potato(360, 320, 38, 42, 8, 0.05));
    dot(240, 338, 18, 23, '#5a3f8a');
    dot(350, 329, 20, 25, '#5a3f8a');
    shape(star(233, 326, 9, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    shape(star(342, 316, 10, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    for (const [x0, y0, x1, y1] of [[215, 300, 200, 282], [232, 293, 226, 274], [325, 288, 312, 268], [345, 281, 341, 260]] as const) stroke([[x0, y0], [x1, y1]], { w: 3.5 });
    // folds drawn on the head too: it's paper
    stroke([[450, 300], [470, 420], [455, 520]], { w: 3, col: DEEP });
    // a few sparkles round it
    for (const [x, y, r] of [[120, 300, 20], [560, 250, 16], [960, 560, 18]] as const) shape(star(x, y, r, 0.4), STAR, { over: 0 }, { w: 2.5 }, false);
  },
} satisfies Redraw;
