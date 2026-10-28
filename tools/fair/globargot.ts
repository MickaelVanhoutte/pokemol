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
 * Globargot's fair copy, Ice/Steel, the same drawing grown up: its snow globe half again as big, great ice
 * crystals grown out of the frost on its glass in a crown, a deeper snow drift and a bigger house inside, twice as
 * many snowflakes (crystals now), a steel collar riveted round the glass where it meets its wider red base, a longer
 * body to carry it, longer eye stalks, determined eyes under heavy brows and a bold grin, and the gold star on the
 * front of its base.
 */
export default {
  id: '087', slug: 'globargot', seed: 87087, size: [1150, 1250], tilt: -2,
  draw(c0) {
    const c = mapped(c0, ([x, y]) => [x, y + 340]);
    const { shape, stroke, dot, band, potato } = c;
    const BODY = '#a9c8ec', DEEP = '#7ea2d0', BASE = '#c8434a', GLASS = '#cfe6f7', ROOF = '#e2423a', WALL = '#f7e3b4', LIT = '#f7dc35', PINK = '#f29ac8';
    const STEEL = '#b9c3d3', IRON = '#5f6a80', ICE = '#e4f3fd';
    /** The globe and its inside, grown from the pencil drawing's (centred on 615, 380) to its new size. */
    const CX = 670, CY = 250, K = 1.6;
    const G = (x: number, y: number): P => [CX + (x - 615) * K, CY + (y - 380) * K];
    const g = (pts: P[]): P[] => pts.map(([x, y]) => G(x, y));
    /** A snowflake crystal: three crossed strokes. */
    const flake = (x: number, y: number, r: number, rot: number) => {
      for (let i = 0; i < 3; i++) {
        const a = ((rot + i * 60) * Math.PI) / 180, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
        stroke([[x - dx, y - dy], [x + dx, y + dy]], { w: 6, col: DEEP });
      }
      dot(x, y, 5, 5, '#ffffff');
    };
    /** An ice crystal growing out of the glass at `deg` round the globe: a pointed prism, L long, w wide, turned by `lean`. */
    const crystal = (deg: number, L: number, w: number, lean = 0) => {
      const a = (deg * Math.PI) / 180, b = ((deg + lean) * Math.PI) / 180;
      const base: P = [CX + Math.cos(a) * 300, CY + Math.sin(a) * 292], ux = Math.cos(b), uy = Math.sin(b), nx = -uy * (w / 2), ny = ux * (w / 2);
      const pt = (t: number, s: number): P => [base[0] + ux * L * t + nx * s, base[1] + uy * L * t + ny * s];
      shape([pt(0, -1), pt(0.78, -1), pt(1, 0), pt(0.78, 1), pt(0, 1)], ICE, { angle: deg + 90, over: 0 }, { w: 7 }, false);
      c.tint([pt(0, 0.1), pt(0.78, 0.1), pt(1, 0), pt(0.78, 1), pt(0, 1)], GLASS, { angle: deg + 90, press: 1.3 });
      stroke([pt(0.05, 0.1), pt(0.78, 0.1), pt(1, 0)], { w: 4, col: DEEP }, false);
      c.shine([pt(0.15, -0.55), pt(0.62, -0.55)], 7);
    };
    // the far eye stalk, longer, behind
    c.part('oeil-loin', { pivot: [252, 520], motion: 'swing', amp: -4, period: 2.8, behind: true }, () => {
      shape(band([[252, 520], [262, 350], [284, 196]], 32, 24), BODY, { angle: 90, over: 0 });
      shape(potato(288, 172, 40, 42, 8, 0.05), BODY, { over: 0 });
      c.paper(potato(285, 170, 25, 23, 8, 0.05));
      dot(277, 176, 12, 13);
      dot(272, 170, 4, 4, '#ffffff');
      stroke([[254, 148], [318, 160]], { w: 11 });
    });
    // great ice crystals grown out of the frost on the glass, a crown round its top
    crystal(-90, 250, 92);
    crystal(-112, 180, 72, -10);
    crystal(-68, 190, 74, 10);
    crystal(-135, 130, 58, -8);
    crystal(-45, 150, 62, 8);
    crystal(-24, 100, 48, 6);
    // the long soft body along the ground, longer to carry the bigger globe, its tail trailing right
    const body: P[] = [[130, 650], [178, 528], [292, 472], [415, 625], [600, 712], [860, 730], [1100, 780], [1040, 856], [600, 870], [320, 866], [160, 822], [104, 742]];
    shape(body, BODY, { angle: 10, over: 0.45 });
    c.tint([[170, 812], [1040, 826], [1020, 856], [600, 868], [320, 864], [180, 832]], DEEP, { gap: 3.6, angle: 10 });
    // the red base of the globe on its back, much wider, the gold star on its front
    shape([[350, 728], [410, 565], [930, 565], [990, 728], [860, 768], [480, 770]], BASE, { angle: 0, over: 0.4 }, { w: 7 }, false);
    stroke([[372, 726], [968, 726]], { w: 5, col: '#8f2a30' });
    c.star(670, 672, 56, 6);
    // the glass globe, half again as big: a deeper drift of snow, a bigger house with its lit window
    c.paper(potato(CX, CY, 338, 330, 18, 0.01), { w: 8 });
    c.tint(g([[420, 330], [470, 230], [540, 190], [500, 260], [470, 360], [490, 470], [440, 450]]), GLASS, { gap: 3.4, angle: 70 });
    c.tint(g([[790, 330], [810, 430], [760, 520], [700, 560], [750, 470], [780, 390]]), GLASS, { gap: 3.4, angle: 110 });
    c.paper(g([[430, 495], [515, 438], [620, 428], [725, 442], [810, 495], [790, 560], [620, 580], [450, 560]]), { w: 6 });
    c.tint(g([[470, 540], [620, 556], [770, 540], [760, 556], [620, 572], [480, 556]]), GLASS, { gap: 3.4, angle: 10 });
    shape(g([[560, 465], [560, 380], [680, 380], [680, 465]]), WALL, { over: 0 }, { w: 6 }, false);
    shape(g([[536, 392], [620, 314], [704, 392]]), ROOF, { over: 0 }, { w: 6 }, false);
    shape(g([[586, 398], [624, 398], [624, 432], [586, 432]]), LIT, { over: 0 }, { w: 5 }, false);
    shape(g([[640, 422], [666, 422], [666, 465], [640, 465]]), '#8a5326', { over: 0 }, { w: 5 }, false);
    // a thick cap of snow on its roof, and snow piled at its walls
    c.paper(g([[528, 392], [620, 310], [712, 392], [700, 400], [672, 372], [646, 384], [620, 354], [590, 382], [562, 370], [540, 400]]), { w: 5 });
    c.paper(g([[545, 470], [565, 448], [592, 466], [610, 470]]), { w: 4 });
    // the snow falling inside, in two flurries: in battle they twinkle in turn
    c.part('neige', { pivot: [CX, CY - 80], motion: 'flicker', period: 1.8 }, () => {
      for (const [x, y, a] of [[470, 300, 10], [555, 225, 30], [700, 225, 0], [770, 330, 20], [480, 405, 40]] as const) flake(...G(x, y), 34, a);
    });
    c.part('neige2', { pivot: [CX, CY - 80], motion: 'flicker', period: 1.8, phase: 0.5 }, () => {
      for (const [x, y, a] of [[628, 205, 15], [440, 350, 0], [775, 410, 35], [690, 290, 50], [540, 320, 25]] as const) flake(...G(x, y), 28, a);
    });
    // a shine on the glass
    c.shine([[395, 140], [460, 60], [560, 6]], 12);
    c.shine([[960, 380], [978, 300]], 8);
    // the steel collar riveted round the glass where it meets the base
    shape([[384, 612], [410, 548], [930, 548], [956, 612]], STEEL, { angle: 0, over: 0 }, { w: 7 }, false);
    stroke([[400, 590], [940, 590]], { w: 4, col: IRON });
    for (let x = 450; x <= 900; x += 64) dot(x, 568, 8, 8, IRON);
    c.shine([[440, 560], [560, 560]], 6);
    // the head, turned left, a bold grin and a rosy cheek
    shape(potato(220, 615, 114, 94, 10, 0.05), BODY, { angle: 80, over: 0.3 });
    shape([[146, 645], [230, 645], [214, 683], [172, 687]], '#5a2430', { over: 0 }, { w: 5 });
    shape([[172, 670], [208, 668], [198, 685], [178, 687]], '#e2667a', { over: 0 }, { w: 3.5 });
    c.tint(potato(264, 645, 24, 16, 8, 0.1), PINK, { gap: 3 });
    // the near eye stalk, longer: determined eyes under a heavy brow
    c.part('oeil', { pivot: [220, 565], motion: 'swing', amp: 5, period: 2.4 }, () => {
      shape(band([[220, 565], [180, 380], [150, 214]], 38, 28), BODY, { angle: 90, over: 0 });
      shape(potato(145, 186, 50, 52, 8, 0.05), BODY, { over: 0 });
      c.paper(potato(140, 188, 32, 30, 8, 0.05));
      dot(133, 194, 16, 17);
      dot(127, 186, 5, 5, '#ffffff');
      stroke([[96, 150], [184, 174]], { w: 13 });
    });
  },
} satisfies Fair;
