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
 * Tachombre's fair copy, Ghost/Water, the same drawing grown up: two great splats of ink grown from its back
 * like wings, its crown of spikes much taller and wider, its gold pen nib twice as big, longer arms with big splash
 * claws, longer drips underneath ending in drops of water, heavier brows and more jagged teeth, and the gold star on
 * its body. Its loose ink spots have run into the splash.
 */
export default {
  id: '097', slug: 'tachombre', seed: 97097, size: [1500, 1340], tilt: -3,
  draw(c0) {
    const c = mapped(c0, ([x, y]) => [x + 230, y + 260]);
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const INK = '#1f2a6e', SHEEN = '#5a4fcf', GOLD = '#f2c230', YEL = '#f6d23a', WATER = '#5aa0e0', SKY = '#bfe0fb';
    /** A drop of water hanging from (x, y). */
    const drop = (x: number, y: number, r: number) => {
      shape([[x - r * 0.35, y - r * 0.4], [x - r * 0.95, y + r * 0.9], [x - r * 0.6, y + r * 1.6], [x, y + r * 1.85], [x + r * 0.6, y + r * 1.6], [x + r * 0.95, y + r * 0.9], [x + r * 0.35, y - r * 0.4]], WATER, { angle: 80, over: 0 });
      c.shine([[x - r * 0.45, y + r * 0.8], [x - r * 0.3, y + r * 1.35]], 6);
    };
    /** A splat of ink grown from its back like a wing: ink fingers fanning from `root`, each ending in a round drop, webbed between. */
    const splat = (root: P, fingers: [number, number][]) => {
      const at = (deg: number, l: number): P => [root[0] + Math.cos((deg * Math.PI) / 180) * l, root[1] + Math.sin((deg * Math.PI) / 180) * l];
      const web: P[] = [root];
      fingers.forEach(([a, l], i) => {
        if (i) web.push(at((a + fingers[i - 1][0]) / 2, Math.min(l, fingers[i - 1][1]) * 0.58));
        web.push(at(a, l * 0.84));
      });
      shape(web, SHEEN, { angle: fingers[1][0], press: 1.1, over: 0.3 });
      for (const [a, l] of fingers) {
        shape(band([at(a, 30), at(a, l * 0.5), at(a, l * 0.92)], 70, 30), INK, { angle: a + 90, press: 1.2, over: 0 });
        shape(potato(...at(a, l), 40, 38, 8, 0.06), INK, { press: 1.2, over: 0 });
        c.shine([at(a + 4, l * 0.3), at(a + 2, l * 0.6)], 5);
      }
    };
    // two great splats of ink grown from its back like wings: in battle they beat
    c.part('aile-loin', { pivot: [680, 430], motion: 'flap', amp: -9, period: 1.4, behind: true }, () => splat([680, 430], [[-84, 380], [-56, 450], [-28, 470], [0, 420]]));
    c.part('aile', { pivot: [340, 430], motion: 'flap', amp: 9, period: 1.4, behind: true }, () => splat([340, 430], [[264, 380], [236, 450], [208, 470], [182, 420]]));
    // the far arm, behind, longer, a big splash claw: in battle it sways
    c.part('bras-loin', { pivot: [660, 480], motion: 'swing', amp: 7, period: 2.3, behind: true }, () => {
      shape(band([[650, 480], [800, 430], [930, 300]], 90, 50), INK, { angle: 40, press: 1.2 });
      shape([[905, 330], [910, 170], [952, 280], [1030, 180], [988, 300], [1100, 290], [990, 350], [1070, 420], [950, 380]], INK, { angle: 40, press: 1.2, over: 0 }, {}, false);
    });
    // the splash, bigger: a crown of spikes much taller and wider on top, longer drips underneath
    shape([[292, 400], [196, 250], [310, 300], [282, 60], [392, 240], [416, -70], [470, 210], [505, -210], [548, 210], [604, -70], [632, 240], [728, 60],
      [700, 300], [820, 250], [740, 410], [752, 525], [706, 645], [700, 775], [672, 905], [636, 790], [596, 830], [566, 975], [530, 830], [482, 800],
      [440, 930], [412, 800], [362, 770], [322, 645], [292, 525]], INK, { angle: 70, over: 0.8, press: 1.25 }, {}, false);
    tint(potato(540, 600, 130, 180, 10, 0.08), SHEEN, { gap: 3.6 });
    paper(potato(660, 352, 28, 15, 7, 0.06));
    c.star(612, 712, 48, 10);
    // drops of water hanging from its drips
    drop(672, 900, 24);
    drop(566, 970, 28);
    drop(440, 925, 24);
    // its gold pen nib, twice as big, on its brow
    shape([[436, 350], [400, 210], [482, -10], [564, 210], [528, 350]], GOLD, { angle: 90, over: 0, press: 1.1 }, {}, false);
    stroke([[482, 50], [482, 290]], { w: 6 });
    dot(482, 296, 15, 15);
    c.shine([[436, 230], [470, 90]], 8);
    // glowing yellow eyes, angry under heavy brows, the far one narrower
    shape([[350, 404], [420, 414], [418, 452], [384, 464], [354, 442]], YEL, { over: 0, press: 1.2 }, {}, false);
    shape([[470, 412], [590, 396], [586, 450], [534, 476], [482, 460]], YEL, { over: 0, press: 1.2 }, {}, false);
    dot(392, 434, 10, 13);
    dot(530, 432, 13, 16);
    stroke([[334, 380], [430, 406]], { w: 12, col: '#f1e6ee' });
    stroke([[460, 404], [606, 370]], { w: 12, col: '#f1e6ee' });
    // a jagged grin, wider, more teeth
    paper(potato(462, 552, 132, 50, 12, 0.04));
    for (const x of [356, 398, 440, 482, 524]) stroke([[x, 514], [x + 20, 554], [x + 40, 514]], { w: 4 }, false);
    for (const x of [376, 418, 460, 502]) stroke([[x, 594], [x + 20, 558], [x + 40, 594]], { w: 4 }, false);
    // the near arm thrown forward, longer, a big splash claw: in battle it sways
    c.part('bras', { pivot: [340, 540], motion: 'swing', amp: 8, period: 1.7 }, () => {
      shape(band([[345, 540], [220, 600], [100, 572], [14, 470]], 90, 50), INK, { angle: 20, press: 1.2 });
      shape([[44, 496], [-60, 380], [6, 456], [-120, 440], [-14, 500], [-110, 570], [6, 532], [-30, 630], [60, 530]], INK, { angle: 20, press: 1.2, over: 0 }, {}, false);
    });
    // only in battle: drops of water fall from it
    c.part('gouttes', { pivot: [560, 960], motion: 'flicker', period: 2.4, extra: true }, () => {
      for (const [x, y] of [[612, 1035], [480, 1015], [700, 995]] as const) shape([[x, y - 28], [x + 17, y + 2], [x, y + 16], [x - 17, y + 2]], SKY, { over: 0 }, { w: 4 });
    });
  },
} satisfies Fair;
