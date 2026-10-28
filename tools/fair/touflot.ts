import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Touflot's fair copy, Water/Fairy, the same drawing grown up: its fish tail longer, ending in a huge
 * forked fin frilled in pink; its fin ears grown huge and frilled in the same pink; a mane of pink frills round its
 * head behind a fuller white ruff; a much taller crest of five points; the spiky fin down its back grown tall; its
 * eyes open and sharp under brows, a fang beside its tongue, little claws, and the gold star on its side. It faces
 * right, like its drawing.
 */
export default {
  id: '017', slug: 'touflot', seed: 17017, size: [1420, 1220], tilt: -2,
  draw(c0) {
    const c = moved(c0, 275, 180);
    const { shape, stroke, dot, band, spikes, potato } = c;
    const AQUA = '#8cc8ee', BLUE = '#2f5fc8', YELLOW = '#f6d23a', PINK = '#f17a96', FRILL = '#f4a3c1', ROSE = '#e97fa6', GOLDEN = '#d6a21e';
    /** A wavy frill round (x, y): `n` scallops between radius 1 and `k`. */
    const frill = (x: number, y: number, rx: number, ry: number, n: number, k: number, a0 = 0): P[] =>
      Array.from({ length: n }, (_, i) => {
        const a = a0 + (i / n) * Math.PI * 2, r = i % 2 ? k : 1;
        return [x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r];
      });
    /**
     * A fin ear frilled in pink like its tail: from `inner` (by the crest) up to `tip`, its trailing edge back down
     * to `outer`; the pink frill runs `out` px beyond it (`side` 1 when the ear points left, -1 when right).
     */
    const ear = (inner: P, tip: P, outer: P, side: number, out: number) => {
      const dx = outer[0] - tip[0], dy = outer[1] - tip[1], l = Math.hypot(dx, dy), nx = (-dy / l) * side, ny = (dx / l) * side;
      const far: P = [tip[0] + (tip[0] - inner[0]) * 0.16, tip[1] + (tip[1] - inner[1]) * 0.16];
      const edge: P[] = [[far[0] + nx * out * 0.4, far[1] + ny * out * 0.4], [tip[0] + dx * 0.5 + nx * out, tip[1] + dy * 0.5 + ny * out], [outer[0] + nx * out * 0.6, outer[1] + ny * out * 0.6]];
      shape([inner, [inner[0] + (far[0] - inner[0]) * 0.5 - nx * 20, inner[1] + (far[1] - inner[1]) * 0.5 - ny * 20], ...spikes(edge, 3, 30 * side), outer], FRILL, { angle: 60 + 40 * side, over: 0 });
      for (const t of [0.25, 0.55, 0.85]) stroke([[(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2], [edge[1][0] + (t - 0.5) * (edge[2][0] - edge[0][0]), edge[1][1] + (t - 0.5) * (edge[2][1] - edge[0][1])]], { w: 4, col: ROSE });
      shape([inner, tip, ...spikes([tip, outer], 3, 22 * side).slice(1)], YELLOW, { angle: 30 * side, press: 1.1 }, {}, false);
      for (const t of [0.35, 0.7]) stroke([[(inner[0] * 2 + outer[0]) / 3, (inner[1] * 2 + outer[1]) / 3], [tip[0] + dx * t * 0.8, tip[1] + dy * t * 0.8]], { w: 4, col: GOLDEN });
    };

    // the fish tail swishing behind, longer, a huge forked fin frilled in pink at its end
    c.part('queue', { pivot: [360, 705], motion: 'swing', amp: 6, period: 1.7, behind: true }, () => {
      // the fin grown far taller than wide, from its root
      const fin = (pts: P[]) => pts.map(([x, y]): P => [60 + (x - 60) * 1.3, 700 + (y - 700) * 2.15]);
      const top: P[] = [[-55, 525], [32, 684]], bottom: P[] = [[32, 684], [-85, 805]];
      shape(fin([[70, 650], [-5, 570], ...spikes([[-95, 495], [5, 686]], 3, 22), ...spikes([[5, 686], [-130, 835]], 3, 22), [-30, 805], [80, 745]]), FRILL, { angle: 60, over: 0 });
      shape(fin([[75, 648], [10, 590], ...spikes(top, 2, 14), ...spikes(bottom, 2, 14).slice(1), [-20, 785], [85, 738]]), AQUA, { angle: 60 }, {}, false);
      for (const t of [[-40, 555], [-10, 640], [-30, 730], [-62, 780]] as P[]) stroke(fin([[70, 698], t]), { w: 4, col: BLUE });
      shape(band([[360, 700], [230, 772], [125, 752], [62, 692]], 118, 70), AQUA, { angle: 30 });
    });
    // sitting body and legs, little claws
    shape([[400, 480], [600, 420], [700, 560], [720, 760], [640, 880], [430, 880], [340, 760], [340, 600]], AQUA, { angle: 80, over: 0.6 });
    for (const [x0, x1] of [[600, 640], [690, 710]]) {
      for (const k of [-1, 1]) shape([[x1 + k * 12 - 9, 912], [x1 + k * 12 + 22, 950], [x1 + k * 12 + 10, 906]], '#ffffff', { over: 0 }, { w: 4 }, false);
      shape(band([[x0, 700], [(x0 + x1) / 2 + 10, 820], [x1, 910]], 62, 58), AQUA, { angle: 90 });
    }
    c.star(495, 765, 46, -8);
    // the dark blue fin down its back grown tall
    shape(spikes([[575, 428], [470, 495], [395, 572], [345, 668], [330, 750]], 2, 95).concat([[368, 752], [380, 676], [440, 594], [520, 524], [598, 466]]), BLUE, { angle: 60, press: 1.1 }, {}, false);
    // a mane of pink frills round its head, and the white ruff round its neck, fuller
    shape(frill(680, 380, 245, 190, 22, 0.84, 0.15), FRILL, { angle: 70, over: 0.2 });
    c.paper(frill(640, 452, 185, 110, 18, 0.8, 0.1));
    // the fin ears grown huge, frilled in pink like its tail; a much taller crest
    ear([600, 300], [330, -40], [470, 302], 1, 70);
    ear([760, 295], [1040, -45], [900, 305], -1, 70);
    shape([[620, 258], [602, 150], [642, 205], [648, 50], [672, 172], [690, -140], [708, 172], [732, 50], [738, 205], [778, 150], [760, 258]], BLUE, { over: 0, press: 1.1 }, {}, false);
    shape(potato(690, 330, 125, 105, 12, 0.05), AQUA, { angle: 80, over: 0.5 });
    // eyes open now, sharp under brows; its tongue still out, a fang beside it
    c.paper([[612, 290], [674, 304], [668, 328], [640, 336], [616, 320]], { w: 5 });
    c.paper([[714, 304], [778, 288], [774, 318], [748, 332], [720, 326]], { w: 5 });
    dot(645, 316, 13, 15, BLUE);
    dot(748, 314, 13, 15, BLUE);
    dot(647, 318, 6, 8);
    dot(750, 316, 6, 8);
    dot(640, 310, 4, 4, '#ffffff');
    dot(743, 308, 4, 4, '#ffffff');
    stroke([[604, 274], [680, 298]], { w: 11 });
    stroke([[710, 298], [790, 270]], { w: 11 });
    dot(695, 356, 9, 6);
    stroke([[636, 382], [695, 402], [750, 378]], { w: 6 });
    shape([[675, 397], [715, 397], [712, 442], [680, 442]], PINK, { over: 0 }, { w: 4 });
    c.paper([[720, 394], [729, 418], [740, 390]], { w: 4 }, false);
    c.shine([[600, 260], [622, 245]], 6);
  },
} satisfies Fair;

/** The crayon drawing everything (dx, dy) further, to make room for what grew; the shapes keep the pencil drawing's coordinates. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]): P => [x + dx, y + dy]);
  return {
    ...c,
    shape: (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(m(pts), col, o, l, round),
    paper: (pts: P[], l?: Line, round?: boolean) => c.paper(m(pts), l, round),
    tint: (pts: P[], col: string, o?: Colour) => c.tint(m(pts), col, o),
    stroke: (pts: P[], l?: Line, round?: boolean) => c.stroke(m(pts), l, round),
    dot: (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x + dx, y + dy, rx, ry, col),
    shine: (pts: P[], w?: number) => c.shine(m(pts), w),
    star: (x: number, y: number, r: number, rot?: number) => c.star(x + dx, y + dy, r, rot),
    part: (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + dx, def.pivot[1] + dy] }, draw),
  };
}
