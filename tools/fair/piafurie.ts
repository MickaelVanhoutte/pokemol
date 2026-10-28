import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Piafurie's fair copy, Flying/Steel, the same drawing grown up: a much longer streaming crest of five
 * feathers, bigger wings with more feathers, each tipped with steel, a wider tail fan of six feathers whose red
 * tips are edged with steel, a longer hooked beak, steel talons, a fiercer eye under a heavy brow, and the gold
 * star on its yellow belly. It faces right, like its drawing.
 */
export default {
  id: '036', slug: 'piafurie', seed: 36036, size: [1200, 1050], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const BROWN = '#6e3518', YEL = '#f2d132', ORANGE = '#f07a28', RED = '#e04040', STEEL = '#b9c3d3';
    /** A long feather from `a` to its pointed end `b`, `w` wide (half): the whole of it, or only from `from` of its length on. */
    const quill = (a: P, b: P, w: number, from = 0): P[] => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
      const width = (t: number) => w * (0.55 + 0.45 * Math.min(1, t / 0.55)) * (t > 0.6 ? Math.sqrt((1 - t) / 0.4) : 1);
      const ts = [from, ...[0.15, 0.35, 0.55, 0.7, 0.8, 0.9].filter((t) => t > from + 0.03)];
      const side = (t: number, k: number): P => [a[0] + ux * l * t - uy * width(t) * k, a[1] + uy * l * t + ux * width(t) * k];
      return [...ts.map((t) => side(t, 1)), b, ...[...ts].reverse().map((t) => side(t, -1))];
    };
    /** A tail feather from the rump to its pointed end, the end red, edged with steel. */
    const tailFeather = (root: P, tip: P, w: number) => {
      const dx = tip[0] - root[0], dy = tip[1] - root[1], l = Math.hypot(dx, dy);
      const far: P = [root[0] + (dx / l) * (l + 22), root[1] + (dy / l) * (l + 22)];
      shape(quill(root, tip, w), BROWN, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 70 });
      shape(quill(root, far, w * 1.12, 0.66), STEEL, { over: 0 }, { w: 4.5 });
      shape(quill(root, tip, w, 0.7), RED, { over: 0 }, { w: 4 });
      stroke([[root[0] + dx * 0.25, root[1] + dy * 0.25], [root[0] + dx * 0.68, root[1] + dy * 0.68]], { w: 3.5 });
    };
    /** A wing: from its root along its leading edge, then feather points and the dips between them, back to the root. */
    const wing = (outline: P[], tips: number[]) => {
      shape(outline, BROWN, { angle: 60 }, {}, false);
      // steel on each feather point: the point and a bit of its two sides
      for (const i of tips) {
        const p = outline[i], a = outline[i - 1], b = outline[i + 1];
        const toward = (q: P, f: number): P => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
        shape([toward(a, 0.42), p, toward(b, 0.42)], STEEL, { over: 0 }, { w: 4.5 }, false);
      }
    };
    // the far wing, spread up and back
    c.part('aile-loin', { pivot: [560, 530], motion: 'flap', amp: 12, period: 0.8, behind: true }, () => {
      const o: P[] = [[600, 520], [470, 360], [330, 190], [190, 45], [210, 150], [95, 160], [180, 250], [80, 290], [205, 340], [140, 420], [330, 420], [480, 560]];
      wing(o, [3, 5, 7, 9]);
      for (const [a, b] of [[[190, 200], [470, 470]], [[170, 300], [430, 500]]] as [P, P][]) stroke([a, b], { w: 4 });
    });
    // the near wing, spread wide up to the right behind its head
    c.part('aile', { pivot: [650, 610], motion: 'flap', amp: -12, period: 0.8, behind: true }, () => {
      const o: P[] = [[600, 600], [700, 410], [870, 150], [990, 35], [965, 145], [1065, 150], [985, 255], [1085, 290], [975, 350], [1055, 420], [905, 430], [930, 505], [760, 540], [700, 640]];
      wing(o, [3, 5, 7, 9, 11]);
      for (const [a, b] of [[[900, 200], [730, 520]], [[960, 310], [760, 560]]] as [P, P][]) stroke([a, b], { w: 4 });
    });
    // the streaming crest, much longer, behind the head; in battle it streams in the wind
    c.part('huppe', { pivot: [800, 350], motion: 'swing', amp: 4, period: 1.6, behind: true }, () => {
      for (const [x, y, col] of [[650, 25, RED], [565, 35, YEL], [500, 90, RED], [450, 160, YEL], [420, 240, RED]] as [number, number, string][]) {
        shape(quill([800, 350], [x, y], 44), col, { angle: (Math.atan2(y - 350, x - 800) * 180) / Math.PI + 70, over: 0 });
      }
    });
    // the wide tail fan: six feathers, red tips edged with steel
    for (const [x, y] of [[130, 420], [55, 545], [35, 680], [65, 810], [135, 920], [240, 995]] as P[]) tailFeather([470, 660], [x, y], 58);
    // steel talons
    for (const [x0, x1] of [[560, 540], [660, 680]]) {
      stroke([[x0, 800], [x1, 935]], { w: 11 });
      for (const dx of [-55, 0, 55]) shape([[x1 - 9, 930], [x1 + dx, 992], [x1 + 9, 934]], STEEL, { over: 0 }, { w: 4 }, false);
    }
    // body and yellow belly, the star
    shape(potato(600, 640, 222, 182, 9, 0.05), BROWN, { angle: 70 });
    shape(potato(690, 700, 132, 126, 9, 0.07), YEL, { angle: 80, over: 0 });
    c.star(700, 735, 46, 8);
    // the neck, then the head, yellow face, a longer hooked beak, a fierce eye under a heavy brow
    shape(c.band([[700, 580], [760, 480], [815, 420]], 150, 130), BROWN, { angle: 70 });
    shape(potato(830, 400, 134, 118, 9, 0.05), BROWN, { angle: 70 });
    shape(potato(880, 435, 84, 74, 8, 0.07), YEL, { angle: 80, over: 0 });
    shape([[932, 384], [1060, 398], [1150, 445], [1135, 482], [1100, 462], [940, 484]], ORANGE, { angle: 20, over: 0 });
    stroke([[955, 440], [1100, 452]], { w: 4.5 });
    c.paper(potato(872, 400, 22, 24, 8, 0.05), { w: 5 });
    dot(878, 402, 11, 14);
    dot(874, 395, 3.5, 4, '#ffffff');
    stroke([[812, 352], [918, 385]], { w: 13 });
    c.shine([[760, 330], [790, 310]], 6);
  },
} satisfies Fair;
