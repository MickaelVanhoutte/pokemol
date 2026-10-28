import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Ronflon's fair copy, Normal/Fairy, the same drawing grown up: rounder and bigger, its cream fur grown
 * into a fluffy cloud (a cloud mane all round its head, a cloud tummy), much longer ears with pink insides, a bigger
 * apple with a leaf, a frown and a little fang in its sleep, pink cheeks and pink Zzz (the fairy touch), and the
 * gold star on its side. It faces left, like its drawing.
 */
export default {
  id: '008', slug: 'ronflon', seed: 8008, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#2f74d0', CREAM = '#f7e6c0', APPLE = '#ee4b3c', PINK = '#f48cc0', LEAF = '#5cb33c';
    /** A fluffy cloud round (cx, cy): the outline of `n` round puffs set on an ellipse, their cusps kept sharp. */
    const cloud = (cx: number, cy: number, rx: number, ry: number, n: number, r: number): P[] => {
      const a0 = c.rnd() * 6;
      const puffs = Array.from({ length: n }, (_, i) => {
        const a = a0 + (i / n) * Math.PI * 2;
        return { x: Math.cos(a) * rx, y: Math.sin(a) * ry, r: r * (0.88 + c.rnd() * 0.24) };
      });
      return Array.from({ length: 220 }, (_, i): P => {
        const a = (i / 220) * Math.PI * 2, ux = Math.cos(a), uy = Math.sin(a);
        let t = 0;
        for (const p of puffs) {
          const d = ux * p.x + uy * p.y, disc = p.r * p.r - (p.x * p.x + p.y * p.y - d * d);
          if (disc >= 0) t = Math.max(t, d + Math.sqrt(disc));
        }
        return [cx + ux * t, cy + uy * t];
      });
    };
    // the far foot and arm, behind
    shape(potato(715, 868, 95, 76, 10, 0.06), BLUE, { angle: 120 });
    shape(band([[820, 490], [885, 590], [895, 680]], 86, 74), BLUE, { angle: 120 });
    // the big round body, bigger
    shape(potato(530, 600, 352, 308, 14, 0.04), BLUE, { angle: 80, over: 0.6, press: 1.1 });
    // its cream fur grown into a fluffy cloud: a mane all round its head, a cloud tummy
    shape(cloud(455, 330, 228, 118, 12, 76), CREAM, { angle: 60, over: 0 }, {}, false);
    shape(cloud(450, 652, 148, 156, 9, 74), CREAM, { angle: 80, over: 0 }, {}, false);
    c.star(735, 650, 46, 8);
    // the near foot with its pad
    shape(potato(290, 868, 112, 86, 10, 0.06), BLUE, { angle: 60 });
    shape(potato(278, 880, 60, 46, 8, 0.08), CREAM, { over: 0 }, { w: 4 });
    // the near arm holding a bigger apple, with a leaf; in battle it brings it up to its mouth, still asleep
    c.part('pomme', { pivot: [235, 520], motion: 'reach', amp: -58, period: 4.4 }, () => {
      shape(band([[230, 515], [258, 610], [385, 642]], 86, 76), BLUE, { angle: 60 });
      shape(potato(445, 628, 64, 60, 10, 0.05), APPLE, { angle: 80, press: 1.1, over: 0 });
      stroke([[445, 570], [455, 532]], { w: 5.5 });
      shape([[455, 548], [500, 512], [530, 530], [490, 556]], LEAF, { over: 0 }, { w: 4 });
      c.shine([[408, 610], [418, 590]], 7);
    });
    // the head turned left, bigger, much longer pointed ears pink inside
    shape([[285, 262], [292, 55], [400, 222]], BLUE, { angle: 70 }, {}, false);
    shape([[312, 232], [308, 125], [366, 220]], PINK, { over: 0 }, { w: 4 }, false);
    shape([[530, 228], [680, 40], [658, 252]], BLUE, { angle: 110 }, {}, false);
    shape([[568, 222], [655, 108], [638, 236]], PINK, { over: 0 }, { w: 4 }, false);
    shape(potato(450, 318, 212, 138, 12, 0.04), BLUE, { angle: 80, over: 0.5 });
    shape(potato(388, 362, 140, 82, 10, 0.05), CREAM, { over: 0 });
    c.tint(potato(478, 380, 30, 20, 7, 0.08), PINK, { press: 0.8 });
    // fast asleep, frowning: closed eyes under heavy brows, a little fang in its smile
    stroke([[292, 330], [322, 342], [352, 330]], { w: 7 });
    stroke([[418, 324], [455, 337], [494, 324]], { w: 7 });
    stroke([[290, 300], [350, 314]], { w: 10 });
    stroke([[418, 312], [492, 290]], { w: 10 });
    stroke([[334, 400], [378, 412], [424, 396]], { w: 6 });
    c.paper([[388, 410], [398, 432], [408, 408]], { w: 3.5 }, false);
    dot(368, 368, 9, 6);
    c.shine([[580, 300], [592, 340]], 7);
    // only in battle: pink Zzz over its sleepy head (drawn last, the card stays the same)
    c.part('zzz', { pivot: [700, 150], motion: 'flicker', period: 3, extra: true }, () => {
      for (const [x, y, s] of [[775, 150, 1.1], [860, 85, 0.85], [925, 30, 0.6]] as const) {
        stroke([[x, y], [x + 50 * s, y], [x, y + 50 * s], [x + 50 * s, y + 50 * s]], { w: 7 * s + 2, col: '#d8509a' }, false);
      }
    });
  },
} satisfies Fair;
