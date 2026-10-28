import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';
import { bow, kite } from '../redraws/faonvole.ts';

/** The same pen moved by (dx, dy) on the sheet, so the drawing keeps its own coordinates with room above it. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]) => [x + dx, y + dy] as P);
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

/**
 * Cerfoudre's fair copy, Electric/Fairy, the same drawing grown up: its kite antlers twice as tall and
 * branching more, eight bigger kites on them instead of three (fairy-pink ones among them), a white and a pink twinkle
 * at the top; its storm-cloud ruff grown into a big thundercloud mane over its neck and chest, bolts crackling in it;
 * its head held higher, a fiercer eye under a heavier brow; a longer, fuller ribbon tail of lightning bows ending in a
 * big pink bow; three kites on its flank, the key bigger, and the gold star on its flank. It faces left, like its
 * drawing.
 */
export default {
  id: '079', slug: 'cerfoudre', seed: 7979, size: [1340, 1600], tilt: -2,
  draw(pen) {
    const c = moved(pen, 100, 455);
    // the head, held higher
    const h = moved(c, -10, -80);
    const { shape, stroke, band, potato } = c;
    const FUR = '#a8683a', CREAM = '#f3dcb0', DEEP = '#6e4322', CLOUD = '#8f8aa8', STORM = '#6c6790', YEL = '#f7dc35', STICK = '#7a5a3a', PINK = '#f080b0';
    const [RED, BLUE, GOLD, GREEN] = ['#e2423a', '#4f8fe0', '#f7dc35', '#5bbf6a'];
    const zag = (x: number, y: number, s: number): P[] => [[x, y], [x + 18 * s, y - 34 * s], [x + 6 * s, y - 32 * s], [x + 30 * s, y - 72 * s], [x - 8 * s, y - 24 * s], [x + 6 * s, y - 26 * s]];
    /** A fairy twinkle: a white (or pink) four-pointed sparkle. */
    const twinkle = (k: Crayon, x: number, y: number, r: number, col: string) =>
      k.shape([[x, y - r], [x + r * 0.22, y - r * 0.22], [x + r, y], [x + r * 0.22, y + r * 0.22], [x, y + r], [x - r * 0.22, y + r * 0.22], [x - r, y], [x - r * 0.22, y - r * 0.22]], col, { over: 0, wash: 1 }, { w: 4.5 }, false);
    /** An antler tine: a stick of wood, thick at its root. */
    const branch = (path: P[], w: number) => h.shape(band(path, w, w * 0.5), STICK, { angle: 70, over: 0 }, { w: 5 });
    // the longer, fuller ribbon tail streaming up behind: a pink ribbon twisting round the blue one, lightning bows
    c.part('queue', { pivot: [860, 560], motion: 'swing', amp: 4, period: 1.8, behind: true }, () => {
      const tail: P[] = [[860, 560], [975, 495], [1035, 385], [1080, 270], [1100, 145], [1150, 25], [1160, -100], [1120, -205]];
      shape(band(tail.map(([x, y], i) => [x + (i % 2 ? 26 : -22), y] as P), 22, 14), PINK, { angle: 60, over: 0 });
      shape(band(tail, 52, 26), BLUE, { angle: 60, over: 0 });
      for (const [x, y, col] of [[975, 495, RED], [1035, 385, GOLD], [1080, 270, GREEN], [1100, 145, RED], [1150, 25, GOLD], [1160, -100, GREEN]] as const) shape(zag(x - 24, y + 66, 2.3), col, { over: 0, press: 1.1 }, { w: 4.5 }, false);
      bow(c, 1120, -205, 3, PINK);
    });
    // the far legs, long, behind
    shape(band([[480, 700], [450, 860], [470, 1050]], 60, 46), DEEP, { angle: 90 });
    shape(band([[780, 690], [830, 860], [820, 1040]], 60, 46), DEEP, { angle: 90 });
    // the far antler, behind the head: twice as tall, three kites
    branch([[400, 250], [462, 120], [535, -20], [585, -150]], 38);
    branch([[458, 140], [625, 128]], 26);
    branch([[522, 0], [690, -45]], 26);
    kite(h, 665, 112, 125, 156, PINK, 40);
    kite(h, 730, -60, 140, 175, GREEN, 32);
    kite(h, 600, -195, 150, 188, BLUE, 18);
    // the body, deep chest, tummy lighter, three kites on its flank and the star
    shape([[420, 470], [600, 430], [800, 440], [900, 520], [880, 660], [780, 720], [560, 730], [430, 690], [380, 590]], FUR, { angle: 15, over: 0.55, press: 1.05 });
    c.tint([[480, 650], [800, 650], [770, 710], [520, 715]], CREAM, { gap: 3.4, angle: 15 });
    kite(c, 700, 520, 72, 92, RED, 10);
    kite(c, 820, 555, 56, 72, GOLD, -8);
    kite(c, 760, 640, 46, 58, PINK, 4);
    c.star(590, 565, 48, -6);
    // the near legs, long and strong, dark hooves
    shape(band([[530, 700], [510, 870], [520, 1060]], 70, 54), FUR, { angle: 90 });
    shape(band([[750, 700], [780, 870], [770, 1055]], 70, 54), FUR, { angle: 90 });
    for (const [x, y] of [[522, 1072], [772, 1067]] as const) shape(potato(x, y, 42, 25, 7, 0.06), DEEP, { over: 0 });
    // the neck rising higher
    shape([[340, 560], [285, 330], [360, 215], [465, 250], [505, 460], [470, 560]], FUR, { angle: 60, over: 0.4 });
    // the storm-cloud ruff grown into a big thundercloud mane over its neck and chest, bolts crackling in it
    for (const [x, y, r] of [[520, 470, 66], [430, 300, 62], [345, 345, 70], [445, 420, 80], [330, 460, 86], [490, 560, 84], [380, 580, 96], [270, 560, 76], [470, 660, 76], [330, 690, 80]] as const)
      shape(potato(x, y, r, r * 0.82, 9, 0.12), CLOUD, { angle: 30, over: 0.3 }, { w: 5.5 });
    for (const [x, y, r] of [[380, 610, 60], [470, 690, 44], [300, 720, 46]] as const) c.tint(potato(x, y + 18, r, r * 0.5, 8, 0.1), STORM, { gap: 3.4 });
    shape(zag(300, 760, 1.9), YEL, { over: 0, press: 1.15 }, { w: 5 }, false);
    shape(zag(470, 700, 1.6), YEL, { over: 0, press: 1.15 }, { w: 5 }, false);
    shape(zag(370, 470, 1.4), YEL, { over: 0, press: 1.15 }, { w: 5 }, false);
    // the key on its string, bigger
    c.part('cle', { pivot: [330, 520], motion: 'swing', amp: 8, period: 1.4 }, () => {
      stroke([[330, 520], [325, 640], [345, 720], [352, 772]], { w: 5 });
      shape(potato(355, 795, 32, 32, 8, 0.05), YEL, { over: 0 }, { w: 4.5 });
      c.paper(potato(355, 795, 12, 12, 7, 0.05), { w: 3 });
      shape(band([[355, 824], [355, 910]], 20, 20), YEL, { over: 0 }, { w: 4.5 });
      shape([[355, 868], [390, 868], [390, 895], [355, 895]], YEL, { over: 0 }, { w: 4.5 }, false);
    });
    // the head turned left, a long muzzle
    h.shape([[200, 330], [260, 240], [380, 220], [450, 270], [440, 360], [350, 400], [240, 420], [160, 410], [120, 370]], FUR, { angle: 75, over: 0.45 });
    h.tint(potato(150, 395, 40, 28, 8, 0.08), CREAM, { gap: 3.2 });
    h.dot(118, 375, 16, 13);
    // the far ear
    h.shape([[420, 250], [525, 215], [545, 252], [450, 290]], FUR, { angle: 120 }, {}, false);
    // the near antler, twice as tall, branching more: a kite at the tip of every tine
    branch([[305, 125], [170, 92], [62, 25]], 30);
    branch([[288, 30], [175, -50], [105, -140]], 28);
    branch([[318, 180], [398, 75], [440, -15]], 30);
    branch([[278, -60], [350, -150], [390, -230]], 26);
    branch([[330, 238], [300, 100], [272, -40], [252, -190]], 44);
    kite(h, 48, 5, 160, 200, GREEN, -34);
    kite(h, 95, -175, 150, 188, GOLD, -24);
    kite(h, 452, -45, 150, 186, RED, 14);
    kite(h, 400, -268, 140, 175, PINK, 16);
    kite(h, 245, -235, 156, 196, BLUE, -4);
    twinkle(h, 245, -330, 34, '#ffffff');
    twinkle(h, 20, -250, 30, PINK);
    // the near ear, pink inside
    h.shape([[440, 260], [550, 248], [572, 280], [460, 300]], FUR, { angle: 120 }, {}, false);
    h.tint([[460, 268], [540, 260], [470, 288]], '#f29ab0', { gap: 3 });
    // a fiercer eye under a heavier brow, a firm mouth
    h.paper(potato(300, 302, 28, 20, 8, 0.05));
    h.dot(292, 305, 14, 13);
    h.dot(286, 299, 5, 5, '#ffffff');
    h.stroke([[248, 268], [305, 282], [362, 254]], { w: 12 });
    h.stroke([[150, 418], [195, 422], [238, 406]], { w: 5.5 });
    c.shine([[600, 455], [740, 448]], 7);
  },
} satisfies Fair;
