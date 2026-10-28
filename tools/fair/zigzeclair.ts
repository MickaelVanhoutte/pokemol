import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Zigzéclair's fair copy, Electric/Fighting, the same drawing grown up: its fur bristling with
 * electricity into a big spiky mane round the back of its head down to its shoulders, and a cream ruff under its
 * chin grown from its belly fur; ears much longer, their tips rolled into spirals twice as long; its tail forked
 * into two huge lightning bolts shaped like her own; a bigger glowing cheek; its brown paws grown into big fists;
 * heavier brows, sharper eyes and two fangs; and the gold star on its belly. It faces left, like its drawing.
 */
export default {
  id: '027', slug: 'zigzeclair', seed: 27027, size: [1420, 1420], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const ORANGE = '#f39a2b', CREAM = '#f8e2a4', YEL = '#f7dc35', BROWN = '#8a5326', BLACK = '#35303a', GLOW = '#fff4a8', DEEP = '#e9781c';
    // the drawing sits 300 px lower than its pencil one, so the longer ears and the bolts fit
    const Y = 300;
    const m = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + Y]);
    const pot = (x: number, y: number, rx: number, ry: number, n = 8, mess = 0.06) => potato(x, y + Y, rx, ry, n, mess);
    const spark = (x: number, y: number, s: number): P[] =>
      m([[x, y], [x + 16 * s, y - 42 * s], [x + 4 * s, y - 40 * s], [x + 26 * s, y - 86 * s], [x - 8 * s, y - 30 * s], [x + 6 * s, y - 32 * s]]);
    /** A big lightning bolt shaped like the one at the tip of its pencil drawing's tail, from `base` out to `tip`. */
    const bolt = (base: P, tip: P, fat = 1) => {
      const own: P[] = [[905, 420], [960, 300], [925, 292], [1010, 160], [1075, 70], [1040, 210], [1080, 222], [985, 400]];
      const b0: P = [945, 410], t0: P = [1075, 70];
      const a = Math.atan2(tip[1] - base[1], tip[0] - base[0]) - Math.atan2(t0[1] - b0[1], t0[0] - b0[0]);
      const k = Math.hypot(tip[0] - base[0], tip[1] - base[1]) / Math.hypot(t0[0] - b0[0], t0[1] - b0[1]);
      // along the bolt it grows by k, across it by k * fat
      const ul = Math.hypot(t0[0] - b0[0], t0[1] - b0[1]), ux = (t0[0] - b0[0]) / ul, uy = (t0[1] - b0[1]) / ul;
      const pts = own.map(([x, y]): P => {
        const along = (x - b0[0]) * ux + (y - b0[1]) * uy, across = -(x - b0[0]) * uy + (y - b0[1]) * ux;
        const lx = along * k, ly = across * k * fat, r0 = Math.atan2(uy, ux) + a;
        return [base[0] + lx * Math.cos(r0) - ly * Math.sin(r0), base[1] + lx * Math.sin(r0) + ly * Math.cos(r0)];
      });
      shape(m(pts), YEL, { angle: (Math.atan2(tip[1] - base[1], tip[0] - base[0]) * 180) / Math.PI + 60, press: 1.1 }, {}, false);
      c.shine(m([[pts[0][0] * 0.7 + pts[3][0] * 0.3 + 12, pts[0][1] * 0.7 + pts[3][1] * 0.3], [pts[0][0] * 0.35 + pts[3][0] * 0.65 + 12, pts[0][1] * 0.35 + pts[3][1] * 0.65]]), 7);
    };
    /** Spiky fur along an arc of the ellipse round (cx, cy), from angle `a0` back to `a1` (degrees), spikes outwards. */
    const fur = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number, h: number, col: string) => {
      const path: P[] = Array.from({ length: 7 }, (_, i) => {
        const a = ((a0 + ((a1 - a0) * i) / 6) * Math.PI) / 180;
        return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
      });
      shape(m([...spikes(path, n, h), [cx, cy]]), col, { angle: 70, over: 0 }, {}, false);
    };
    /** An ear's tip rolled into a long spiral: a thick band winding round (x, y). */
    const curl = (x: number, y: number, r: number, from: number, dir: number) => {
      const path: P[] = Array.from({ length: 13 }, (_, i) => {
        const a = from + dir * i * 0.62, rr = r * (1 - i * 0.058);
        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
      });
      shape(band(m(path), 52, 16), ORANGE, { angle: 30, over: 0 });
    };
    /** A big brown fist at (x, y), its knuckles away from the wrist. */
    const fist = (x: number, y: number, wrist: P) => {
      const dx = x - wrist[0], dy = y - wrist[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
      shape(pot(x, y, 82, 72, 9, 0.05), BROWN, { over: 0, angle: 70 });
      for (let i = -1; i <= 1; i++) stroke(m([[x + ux * 30 - uy * i * 32, y + uy * 30 + ux * i * 32], [x + ux * 70 - uy * i * 28, y + uy * 70 + ux * i * 28]]), { w: 5 });
      c.shine(m([[x - ux * 30 + uy * 40, y - uy * 30 - ux * 40], [x + uy * 50, y - ux * 50]]), 6);
    };
    // the long black tail behind, raised in an arc, forking into two huge lightning bolts
    c.part('queue', { pivot: [640, 830 + Y], motion: 'swing', amp: 5, period: 1.4, behind: true }, () => {
      shape(band(m([[640, 830], [790, 830], [905, 760], [975, 640], [985, 520], [1010, 440]]), 44, 30), BLACK, { angle: 60 });
      bolt([1045, 470], [1410, 230], 1.1);
      bolt([980, 440], [990, -280], 1.1);
    });
    // the far arm raised behind, a big fist
    shape(band(m([[370, 640], [280, 560], [235, 470]]), 72, 64), ORANGE, { angle: 60 });
    fist(215, 405, [250, 500]);
    // far foot, the chubby body and its cream belly, the star, near foot
    shape(pot(420, 1000, 108, 46), ORANGE, { angle: 10 });
    shape(m([[340, 560], [500, 520], [650, 560], [730, 720], [710, 890], [610, 985], [440, 995], [330, 905], [295, 740]]), ORANGE, { angle: 85, over: 0.55 });
    shape(pot(470, 790, 122, 152, 12, 0.05), CREAM, { over: 0 });
    c.star(500, 850 + Y, 46, -6);
    shape(pot(650, 1010, 120, 50), ORANGE, { angle: 10 });
    // its fur bristling with electricity: a big spiky mane round the back of its head and down its shoulders,
    // orange with yellow tips, and a cream ruff under its chin
    fur(470, 440, 262, 245, 85, -155, 2, 175, YEL);
    fur(470, 440, 250, 232, 85, -155, 2, 95, DEEP);
    fur(440, 525, 225, 112, 170, 10, 2, 85, CREAM);
    // the far ear, much longer, its tip rolled into a long spiral
    shape(m([[300, 330], [222, 150], [168, -40], [226, -62], [322, 135], [400, 290]]), ORANGE, { angle: 70 }, {}, false);
    shape(m([[302, 300], [242, 150], [205, 30], [292, 180], [350, 290]]), BROWN, { over: 0 }, { w: 3.5 }, false);
    curl(100, -32, 102, -0.25, -1);
    // the near arm up, a big fist; in battle it pumps it
    c.part('poing', { pivot: [650, 650 + Y], motion: 'swing', amp: 7, period: 1.1 }, () => {
      shape(band(m([[650, 650], [765, 570], [810, 480]]), 74, 66), ORANGE, { angle: 120 });
      fist(840, 420, [808, 505]);
    });
    // a few big sparks crackling round its fists and cheek
    c.part('etincelles', { pivot: [500, 400 + Y], motion: 'flicker', period: 1.8 }, () => {
      for (const [x, y, s] of [[950, 360, 1.2], [120, 330, 1.1], [690, 600, 1]] as const) shape(spark(x, y, s), YEL, { over: 0 }, { w: 4 }, false);
    });
    // the near ear, much longer, brown inside, its tip rolled into a long spiral
    shape(m([[470, 300], [610, 110], [722, -55], [768, 0], [640, 250], [580, 340]]), ORANGE, { angle: 110 }, {}, false);
    shape(m([[525, 280], [630, 130], [722, 0], [618, 240], [570, 310]]), BROWN, { over: 0 }, { w: 3.5 }, false);
    curl(838, -6, 100, 3.45, 1);
    // the head turned left, a big glowing cheek, fierce eyes under heavy brows, a grin with two fangs
    shape(pot(440, 420, 198, 162, 12, 0.05), ORANGE, { angle: 80, over: 0.5 });
    c.tint(pot(585, 495, 118, 96, 10, 0.06), GLOW, { over: 0, press: 1.2 });
    shape(pot(585, 495, 84, 68, 9, 0.06), YEL, { over: 0, press: 1.2 }, { w: 4.5 });
    c.shine(m([[548, 470], [575, 455]]), 7);
    c.paper(m([[318, 385], [372, 398], [368, 425], [325, 420]]), { w: 5 });
    c.paper(m([[440, 395], [500, 380], [500, 418], [452, 422]]), { w: 5 });
    dot(345, 406 + Y, 11, 13);
    dot(470, 402 + Y, 13, 15);
    dot(340, 398 + Y, 3.5, 4, '#ffffff');
    dot(464, 394 + Y, 4, 5, '#ffffff');
    stroke(m([[292, 348], [378, 384]]), { w: 14 });
    stroke(m([[428, 380], [520, 340]]), { w: 14 });
    dot(265, 440 + Y, 9, 7);
    shape(m([[285, 480], [345, 512], [410, 502], [445, 470], [430, 515], [380, 545], [320, 530]]), '#5a2430', { over: 0 }, { w: 5 });
    c.paper(m([[318, 497], [330, 528], [344, 504]]), { w: 3.5 }, false);
    c.paper(m([[388, 505], [400, 534], [410, 500]]), { w: 3.5 }, false);
  },
} satisfies Fair;
