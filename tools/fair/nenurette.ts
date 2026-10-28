import type { Crayon, Fair, P } from '../redraws/crayon.ts';

type Rest<F> = F extends (a: never, ...r: infer R) => unknown ? R : never;
/** The kit with every point mapped by `f` (the drawing moved, or grown by k): grown parts get room on the sheet. */
const mapped = (c: Crayon, f: (p: P) => P, k = 1): Crayon => ({
  ...c,
  shape: (pts: P[], ...r: Rest<Crayon['shape']>) => c.shape(pts.map(f), ...r),
  paper: (pts: P[], ...r: Rest<Crayon['paper']>) => c.paper(pts.map(f), ...r),
  tint: (pts: P[], ...r: Rest<Crayon['tint']>) => c.tint(pts.map(f), ...r),
  stroke: (pts: P[], ...r: Rest<Crayon['stroke']>) => c.stroke(pts.map(f), ...r),
  shine: (pts: P[], w?: number) => c.shine(pts.map(f), w),
  dot: (x: number, y: number, rx: number, ry = rx, col?: string) => { const [X, Y] = f([x, y]); c.dot(X, Y, rx * k, ry * k, col); },
  star: (x: number, y: number, r: number, rot?: number) => { const [X, Y] = f([x, y]); c.star(X, Y, r * k, rot); },
  part: (name: string, def: Parameters<Crayon['part']>[1], draw: () => void) => c.part(name, { ...def, pivot: f(def.pivot) }, draw),
});

/**
 * Nénurette's fair copy, Water/Fairy, the same drawing grown up: the lily on its head opened into a big
 * crown of three rings of petals, a frill of lily petals grown round its neck, its body bigger, its pad bigger with
 * two more water lilies blooming on it, two of its spots fairy pink, bold eyes under heavy brows and an open grin,
 * and the gold star on its side. In battle fairy sparkles glint on it.
 */
export default {
  id: '095', slug: 'nenurette', seed: 95095, size: [1060, 1100], tilt: 2,
  draw(c0) {
    const DY = 90;
    // the pad and the water where they were; the frog grown by 1.15 where it sits
    const c = mapped(c0, ([x, y]) => [x, y + DY]);
    const g = mapped(c0, ([x, y]) => [500 + (x - 500) * 1.15, 820 + (y - 820) * 1.15 + DY], 1.15);
    const { band, potato } = c;
    const FROG = '#6cc89a', PAD = '#3f9e4d', SPOT = '#5aa8e8', PINK = '#f49ac1', ROSE = '#f8b8d6', BLUSH = '#fde3ef', BELLY = '#eef3c4', WATER = '#5aa0e0', YEL = '#f6d23a';
    /** A pointed petal from (cx, cy) out along `deg` (0 = right), l long, w wide. */
    const petal = (k: Crayon, cx: number, cy: number, deg: number, l: number, w: number, col: string) => {
      const r = (deg * Math.PI) / 180, tx = cx + Math.cos(r) * l, ty = cy + Math.sin(r) * l, nx = -Math.sin(r) * w, ny = Math.cos(r) * w;
      k.shape([[cx + nx * 0.6, cy + ny * 0.6], [(cx + tx) / 2 + nx, (cy + ty) / 2 + ny], [tx, ty], [(cx + tx) / 2 - nx, (cy + ty) / 2 - ny], [cx - nx * 0.6, cy - ny * 0.6]], col, { angle: deg + 90, over: 0 });
    };
    /** A water lily sitting on the pad at (x, y), s its size. */
    const lily = (x: number, y: number, s: number) => {
      for (const [a, l] of [[-165, 66], [-135, 80], [-105, 88], [-75, 88], [-45, 80], [-15, 66]] as const) petal(c, x, y, a, l * s, 24 * s, PINK);
      for (const [a, l] of [[-140, 52], [-90, 60], [-40, 52]] as const) petal(c, x, y + 4, a, l * s, 18 * s, ROSE);
      c.shape(potato(x, y - 12 * s, 22 * s, 14 * s, 7, 0.08), YEL, { over: 0 });
    };
    /** A four-pointed sparkle. */
    const sparkle = (x: number, y: number, r: number) => {
      const pts: P[] = [];
      for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 - Math.PI / 2, k = i % 2 ? 0.28 : 1; pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]); }
      c.shape(pts, '#fff4fa', { over: 0 }, { w: 5 }, false);
      c.tint(potato(x, y, r * 0.22, r * 0.22, 6, 0.05), PINK, {});
    };
    // ripples round the pad, wider
    c.stroke([[60, 870], [120, 920], [220, 955]], { w: 5, col: WATER });
    c.stroke([[930, 920], [990, 880], [1010, 830]], { w: 5, col: WATER });
    c.stroke([[290, 985], [430, 995], [560, 990]], { w: 5, col: WATER });
    c.stroke([[700, 975], [800, 965]], { w: 5, col: WATER });
    // the lily pad, bigger, its notch at the front, two more water lilies blooming on it
    c.shape([[80, 835], [180, 760], [410, 726], [650, 730], [850, 768], [948, 835], [900, 915], [720, 955], [650, 868], [606, 960], [390, 966], [170, 940]], PAD, { angle: 10, over: 0.4 }, {}, false);
    for (const [x, y] of [[200, 800], [370, 752], [790, 785], [880, 880], [400, 945]] as const) c.stroke([[520, 855], [x, y]], { w: 4 });
    lily(862, 830, 1.3);
    lily(170, 862, 1.1);
    // the lily on its head, behind its eyes, opened into a big crown of three rings of petals: in battle it sways
    g.part('fleur', { pivot: [418, 410], motion: 'swing', amp: 5, period: 2.4, behind: true }, () => {
      g.shape(band([[418, 420], [420, 300]], 24, 20), PAD, { over: 0 });
      for (let i = 0; i < 9; i++) petal(g, 420, 290, -172 + i * 20.5, 190 - Math.abs(i - 4) * 12, 40, PINK);
      for (let i = 0; i < 7; i++) petal(g, 420, 292, -160 + i * 23.3, 138 - Math.abs(i - 3) * 9, 34, ROSE);
      for (let i = 0; i < 5; i++) petal(g, 420, 294, -140 + i * 25, 88 - Math.abs(i - 2) * 6, 26, BLUSH);
      g.shape(potato(420, 280, 46, 28, 8, 0.08), YEL, { over: 0 });
      g.shine([[360, 150], [380, 118]], 7);
    });
    // a frill of lily petals grown round its neck, behind its head and body
    for (const [a, l, col] of [[150, 150, ROSE], [172, 180, PINK], [194, 175, ROSE], [216, 140, PINK]] as const) petal(g, 330, 560, a, l, 44, col);
    for (const [a, l, col] of [[-44, 150, ROSE], [-20, 185, PINK], [4, 180, ROSE], [28, 145, PINK]] as const) petal(g, 640, 500, a, l, 44, col);
    // the frog, bigger: a round body, no neck, two of its spots fairy pink, the gold star on its side
    g.shape([[290, 560], [330, 445], [440, 400], [560, 412], [660, 480], [712, 600], [702, 720], [620, 790], [450, 800], [330, 760], [280, 660]], FROG, { angle: 75, over: 0.5 });
    for (const [x, y, r, col] of [[545, 478, 26, SPOT], [652, 515, 18, PINK], [478, 448, 16, SPOT], [665, 600, 16, SPOT], [500, 560, 14, PINK]] as const) g.tint(potato(x, y, r, r * 0.8, 8, 0.1), col, { gap: 3.4, wash: 0.5 });
    g.star(590, 575, 42, 8);
    g.shape([[300, 640], [380, 612], [452, 650], [462, 760], [362, 780], [300, 720]], BELLY, { angle: 0, over: 0 });
    // the near back leg folded, its webbed foot on the pad
    g.shape(potato(632, 695, 110, 82, 10, 0.05), FROG, { angle: 60, over: 0.4 });
    g.shape([[580, 775], [480, 785], [440, 812], [485, 818], [455, 842], [530, 838], [600, 815]], FROG, { angle: 0, over: 0 }, {}, false);
    // the near front leg, a webbed hand
    g.shape(band([[365, 700], [338, 780], [326, 812]], 44, 36), FROG, { angle: 90, over: 0 });
    g.shape([[350, 805], [286, 798], [256, 822], [296, 828], [278, 850], [338, 840], [360, 820]], FROG, { over: 0 }, {}, false);
    // bulging eyes on top, the far one smaller, bold under heavy brows
    g.shape(potato(362, 432, 52, 48, 9, 0.04), FROG, { angle: 70, over: 0 });
    g.shape(potato(475, 408, 64, 60, 9, 0.04), FROG, { angle: 70, over: 0 });
    g.paper(potato(360, 434, 32, 30, 8, 0.04));
    g.paper(potato(473, 410, 42, 40, 8, 0.04));
    g.dot(354, 440, 16, 17);
    g.dot(465, 416, 21, 23);
    g.dot(348, 432, 5, 5, '#ffffff');
    g.dot(457, 405, 7, 7, '#ffffff');
    g.stroke([[318, 388], [398, 410]], { w: 11 });
    g.stroke([[428, 382], [522, 350]], { w: 12 });
    // a wide open grin, pink cheeks
    g.shape([[276, 588], [330, 606], [400, 610], [470, 596], [440, 624], [380, 640], [320, 634], [290, 612]], '#3a2a3e', { over: 0 }, { w: 6 });
    g.shape([[336, 628], [392, 622], [420, 628], [380, 638]], '#f07f9a', { over: 0 }, { w: 3.5 });
    g.tint(potato(474, 644, 26, 15, 7, 0.1), PINK, { gap: 3 });
    // only in battle: its tongue shoots out now and then
    g.part('langue', { pivot: [295, 605], motion: 'peek', to: [48, 0], shrink: 0.2, fade: true, period: 3.2, extra: true }, () => {
      g.shape(band([[300, 608], [215, 618], [140, 600]], 32, 24), '#f07f9a', { angle: 0, over: 0, press: 1.1 });
      g.shape(potato(128, 598, 32, 26, 8, 0.05), '#f07f9a', { over: 0, press: 1.1 });
    });
    // only in battle: fairy sparkles glint on the lilies of its pad
    c.part('eclat', { pivot: [520, 760], motion: 'flicker', period: 2, extra: true }, () => {
      sparkle(890, 760, 40);
      sparkle(150, 800, 34);
    });
  },
} satisfies Fair;
