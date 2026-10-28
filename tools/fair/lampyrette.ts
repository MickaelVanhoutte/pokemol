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
 * Lampyrette's fair copy, Bug/Electric as before (the owner's choice: a new talent instead of a new type), the same drawing grown up: a big flame bursting up out of its
 * light-bulb belly (and burning inside it on the filament), both pairs of wings half again as big with more veins,
 * the lightning tips of its antennae grown into big bolts, sharp eyes under heavy brows and a bold grin, and the gold
 * star on its body.
 */
export default {
  id: '092', slug: 'lampyrette', seed: 92092, size: [1320, 1240], tilt: -6,
  draw(c0) {
    const c = mapped(c0, ([x, y]) => [x + 20, y + 220]);
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const PLUM = '#5d3f92', PLUM2 = '#7556b0', LAMP = '#ffe45a', FIL = '#f29a2a', SKY = '#d6eafc', YEL = '#ffd23a', FLAME = '#f0602a', HOT = '#fff6c4';
    const buzz = { motion: 'flap', amp: 14, period: 0.2 } as const;
    /** A wing grown from its pivot: scaled by k and turned by `deg` (clockwise). */
    const grown = (pivot: P, k: number, deg: number) => (pts: P[]): P[] => {
      const a = (deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
      return pts.map(([x, y]) => {
        const dx = x - pivot[0], dy = y - pivot[1];
        return [pivot[0] + (dx * co - dy * si) * k, pivot[1] + (dx * si + dy * co) * k];
      });
    };
    /** A flame standing on (x, y), w wide, h tall, leaning `deg` (clockwise from straight up). */
    const flame = (x: number, y: number, w: number, h: number, deg = 0): P[] => {
      const a = (deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
      return ([[-0.5, 0], [-0.58, -0.32], [-0.34, -0.5], [-0.42, -0.78], [-0.12, -0.6], [-0.02, -1], [0.18, -0.6], [0.46, -0.82], [0.38, -0.42], [0.58, -0.24], [0.46, 0.06], [0, 0.12]] as P[])
        .map(([u, v]) => { const px = u * w, py = v * h; return [x + px * co - py * si, y + px * si + py * co]; });
    };
    /** A big lightning bolt standing on (x, y), leaning `deg`. */
    const bolt = (x: number, y: number, deg: number) => {
      const a = (deg * Math.PI) / 180, co = Math.cos(a), si = Math.sin(a);
      shape(([[-20, 8], [-56, -96], [-14, -84], [-44, -200], [50, -58], [8, -70], [28, 8]] as P[])
        .map(([u, v]) => [x + u * co - v * si, y + u * si + v * co] as P), YEL, { over: 0, press: 1.1 }, { w: 6 }, false);
    };
    // the far wings, behind, much bigger
    c.part('ailes-loin', { pivot: [520, 400], ...buzz, behind: true, phase: 0.5 }, () => {
      const g = grown([520, 400], 1.6, -15);
      paper(g([[520, 400], [560, 250], [650, 150], [750, 130], [770, 200], [700, 310], [570, 420]]));
      tint(g([[545, 395], [580, 260], [660, 170], [745, 155], [750, 200], [690, 300], [575, 405]]), SKY, { gap: 3.6, press: 1.3 });
      for (const t of g([[700, 160], [745, 200], [650, 200]])) stroke([g([[540, 395]])[0], t], { w: 3.5 });
    });
    // the light-bulb belly, big and glowing, a flame burning on its filament inside
    shape(potato(680, 680, 214, 182, 12, 0.035), LAMP, { angle: 50, over: 0.3, press: 0.95 });
    tint(potato(690, 690, 150, 128, 10, 0.05), YEL, { gap: 3.6, angle: 50 });
    shape(flame(680, 790, 130, 190), FLAME, { angle: 80, over: 0 });
    tint(flame(680, 782, 88, 130), FIL, { angle: 80 });
    tint(flame(680, 776, 46, 72), HOT, { angle: 80 });
    stroke([[590, 800], [622, 770], [652, 815], [690, 770], [728, 815], [758, 772], [790, 805]], { w: 6, col: '#c25a12' });
    c.shine([[600, 560], [560, 600]], 10);
    // its screw base: plum rings joining the body
    shape([[465, 500], [570, 448], [642, 520], [580, 610], [488, 592]], PLUM, { angle: 100, over: 0.4 });
    for (const t of [0.3, 0.55, 0.8]) stroke([[465 + (570 - 465) * t + 10, 500 + (448 - 500) * t], [488 + (580 - 488) * t, 592 + (610 - 592) * t]], { w: 5 });
    // the body and the head, the gold star on its body
    shape(potato(455, 455, 102, 96, 10, 0.05), PLUM, { angle: 80, over: 0.5 });
    c.star(470, 498, 42, -10);
    // the legs, tucked up under it
    shape(band([[420, 540], [370, 595], [395, 650]], 26, 18), PLUM, { angle: 60, over: 0 });
    shape(band([[485, 550], [460, 615], [495, 665]], 26, 18), PLUM, { angle: 60, over: 0 });
    // lightning-bolt antennae, their tips grown into big bolts
    c.part('antennes', { pivot: [310, 285], motion: 'swing', amp: 7, period: 1.3, behind: true }, () => {
      stroke([[300, 290], [262, 215], [300, 195], [250, 110]], { w: 7 }, false);
      stroke([[345, 285], [352, 210], [390, 196], [380, 115]], { w: 7 }, false);
      bolt(250, 120, -18);
      bolt(382, 122, 12);
    });
    shape(potato(325, 365, 110, 100, 10, 0.04), PLUM2, { angle: 70, over: 0.5 });
    // sharp round eyes under heavy brows, the far one smaller, a bold grin
    paper(potato(272, 354, 28, 32, 8, 0.04));
    paper(potato(360, 347, 36, 40, 8, 0.04));
    dot(267, 362, 14, 18);
    dot(354, 355, 18, 22);
    dot(262, 351, 5, 6, '#ffffff');
    dot(347, 342, 6, 7, '#ffffff');
    stroke([[236, 318], [298, 336]], { w: 12 });
    stroke([[322, 330], [404, 300]], { w: 12 });
    tint(potato(400, 410, 22, 13, 7, 0.1), '#f29ac8', { gap: 3 });
    shape([[272, 414], [352, 420], [338, 452], [296, 452]], '#3a1f4e', { over: 0 }, { w: 5 });
    c.paper([[316, 418], [326, 440], [336, 419]], { w: 3.5 }, false);
    // the big flame bursting up out of its lamp: in battle it sways
    c.part('flamme', { pivot: [805, 540], motion: 'swing', amp: 5, period: 1.1 }, () => {
      shape(flame(805, 545, 220, 560, 44), FLAME, { angle: 60, over: 0.2 });
      tint(flame(812, 536, 150, 400, 44), FIL, { angle: 60 });
      tint(flame(818, 528, 80, 230, 44), HOT, { angle: 60 });
    });
    // the near wings, much bigger, more veins: in battle they buzz
    c.part('ailes', { pivot: [470, 385], ...buzz }, () => {
      const up = grown([470, 385], 1.55, -10), low = grown([470, 385], 1.5, -34);
      paper(up([[470, 385], [515, 220], [610, 100], [730, 60], [785, 115], [720, 245], [595, 375], [500, 420]]));
      tint(up([[495, 380], [535, 230], [620, 125], [725, 85], [760, 120], [705, 235], [590, 360], [510, 400]]), SKY, { gap: 3.6, press: 1.3 });
      paper(low([[505, 425], [640, 380], [790, 360], [845, 420], [770, 478], [630, 475]]));
      tint(low([[530, 425], [645, 395], [780, 380], [820, 420], [760, 460], [635, 460]]), SKY, { gap: 3.6, press: 1.3 });
      for (const t of up([[650, 110], [730, 130], [760, 190], [600, 160], [700, 230]])) stroke([up([[500, 400]])[0], t], { w: 3.5 });
      for (const t of low([[800, 400], [790, 450], [700, 390], [830, 425]])) stroke([low([[510, 420]])[0], t], { w: 3.5 });
    });
  },
} satisfies Fair;
