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
 * Punaisaure's fair copy, Bug/Fighting, the same drawing grown up: its push-pin horn grown into a lance
 * twice as long and thick on a big gold head, a second, bigger pair of wings behind the first (four great wings),
 * its shell bigger with bigger gold pin heads, much bigger hooked jaws, heavier legs, its fighting leg thicker with
 * steel spurs and a big claw, heavier brows, and the gold star on its steel collar.
 */
export default {
  id: '090', slug: 'punaisaure', seed: 90090, size: [1400, 1380], tilt: -2,
  draw(c0) {
    const c = mapped(c0, ([x, y]) => [x + 40, y + 400]);
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const RED = '#d8322f', METAL = '#aeb3c6', NAVY = '#33375f', GOLD = '#f2c230', SKY = '#cfe3f7', LIGHT = '#f1e6ee';
    const PIV: P = [590, 390];
    /** A see-through wing from its root, pointing at `deg` (0 = right), L long, W wide at its round tip, with veins. */
    const wing = (deg: number, L: number, W: number) => {
      const a = (deg * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
      const blade = (s: number): P[] => Array.from({ length: 18 }, (_, i) => {
        const t = (i / 18) * Math.PI * 2, u = (L / 2) * (1 - Math.cos(t)) * s + L * (1 - s) * 0.08, v = (W / 2) * Math.sin(t) * (0.3 + 0.7 * Math.sqrt(u / L)) * s;
        return [PIV[0] + ux * u - uy * v, PIV[1] + uy * u + ux * v] as P;
      });
      paper(blade(1));
      tint(blade(0.86), SKY, { gap: 3.6, angle: deg + 60, press: 1.4 });
      for (const [f, side] of [[0.92, 0], [0.8, 0.3], [0.8, -0.3], [0.6, 0.38], [0.6, -0.38]] as P[]) {
        const u = L * f, v = W * side;
        stroke([[PIV[0] + ux * 40, PIV[1] + uy * 40], [PIV[0] + ux * u - uy * v, PIV[1] + uy * u + ux * v]], { w: 3.5 });
      }
    };
    /** The shell grown by 1.15 round its middle. */
    const S = ([x, y]: P): P => [620 + (x - 620) * 1.15, 560 + (y - 560) * 1.15];
    // the second, bigger pair of wings, behind the first: in battle they beat
    c.part('ailes-loin', { pivot: PIV, motion: 'flap', amp: 10, period: 0.45, behind: true, phase: 0.5 }, () => {
      wing(-66, 700, 300);
      wing(-20, 760, 270);
    });
    // the first pair, bigger too
    c.part('ailes', { pivot: PIV, motion: 'flap', amp: 13, period: 0.45, behind: true }, () => {
      wing(-44, 600, 260);
      wing(4, 640, 220);
    });
    // the far legs, behind, heavier
    shape(band([[560, 700], [615, 830], [605, 925]], 56, 40), NAVY, { angle: 90, over: 0 });
    shape(band([[730, 690], [805, 805], [835, 905]], 56, 40), NAVY, { angle: 90, over: 0 });
    shape(band([[400, 640], [375, 775], [335, 905]], 56, 40), NAVY, { angle: 90, over: 0 });
    // the shell, bigger: two armoured halves, seven big gold pin heads
    shape([[430, 340], [560, 280], [720, 290], [850, 370], [910, 500], [890, 640], [800, 740], [640, 790], [500, 760], [430, 640], [410, 480]].map((p) => S(p as P)), RED, { angle: 70, over: 0.7, press: 1.15 });
    stroke([[500, 305], [640, 450], [760, 620], [830, 728]].map((p) => S(p as P)), { w: 9 });
    paper(potato(...S([640, 345]), 56, 22, 8, 0.06));
    for (const [x, y, r] of [[560, 610, 44], [665, 705, 38], [560, 475, 34], [758, 742, 28], [725, 390, 36], [840, 450, 34], [865, 595, 34]] as const) {
      const [X, Y] = S([x, y]);
      shape(potato(X, Y, r, r * 0.92, 8, 0.05), GOLD, { over: 0, press: 1.1 });
      dot(X - r * 0.3, Y - r * 0.3, r * 0.22, r * 0.18, '#ffffff');
    }
    // the steel collar, riveted, the gold star on it
    shape([[330, 380], [400, 330], [485, 330], [525, 425], [508, 545], [440, 595], [362, 575], [318, 485]], METAL, { angle: 100, over: 0.5 });
    for (const [x, y] of [[372, 392], [462, 360], [490, 500], [400, 548]] as const) dot(x, y, 8, 8);
    c.star(425, 462, 50, 8);
    c.shine([[345, 430], [340, 490]], 6);
    // the head in front, its pin grown into a lance twice as long and thick, on a big gold head
    shape(potato(238, 475, 116, 102, 10, 0.05), NAVY, { angle: 60, over: 0.5 });
    const lance = (t: number): P => [268 - 250 * t, 402 - 760 * t];
    shape(band([lance(0), lance(0.33), lance(0.66), lance(1)], 150, 6), METAL, { angle: 75, over: 0.3 }, {}, false);
    stroke([[252, 350], [226, 270], [150, 40], [80, -170]], { w: 6, col: '#7d8399' });
    c.shine([[280, 340], [240, 220], [170, 10]], 10);
    shape(potato(270, 388, 98, 40, 9, 0.05), GOLD, { over: 0, press: 1.1 });
    c.shine([[214, 374], [262, 366]], 7);
    // two hooked jaws, much bigger
    shape(band([[152, 528], [64, 538], [30, 640]], 52, 6), METAL, { over: 0 });
    shape(band([[194, 566], [146, 636], [168, 720]], 52, 6), METAL, { over: 0 });
    // the near legs, jointed, heavier
    shape(band([[650, 760], [705, 860], [695, 950]], 64, 46), NAVY, { angle: 90, over: 0 });
    shape(band([[510, 730], [482, 845], [450, 950]], 64, 46), NAVY, { angle: 90, over: 0 });
    // the front leg raised to fight, thicker, steel spurs and a big claw: in battle it jabs
    c.part('patte', { pivot: [390, 610], motion: 'swing', amp: 9, period: 1.5 }, () => {
      for (const [a, b] of [[[345, 628], [342, 548]], [[298, 650], [272, 572]], [[250, 655], [210, 592]]] as [P, P][]) shape([[a[0] - 24, a[1] + 8], b, [a[0] + 22, a[1] - 4]], METAL, { over: 0 }, { w: 5 }, false);
      shape(band([[392, 610], [305, 695], [205, 655]], 70, 52), NAVY, { angle: 30, over: 0 });
      shape([[226, 622], [64, 552], [150, 646], [44, 722], [226, 690]], METAL, { over: 0 }, { w: 6 }, false);
      c.shine([[110, 588], [180, 618]], 7);
    });
    // fierce yellow eyes, the far one smaller, under heavy brows
    shape(potato(186, 464, 20, 24, 8, 0.04), GOLD, { over: 0, press: 1.2 });
    shape(potato(266, 457, 28, 32, 8, 0.04), GOLD, { over: 0, press: 1.2 });
    dot(181, 470, 9, 12);
    dot(259, 464, 12, 15);
    stroke([[150, 420], [214, 446]], { w: 12, col: LIGHT });
    stroke([[230, 440], [312, 402]], { w: 12, col: LIGHT });
  },
} satisfies Fair;
