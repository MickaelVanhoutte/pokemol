import type { P, Redraw } from './crayon.ts';
import { bow, kite } from './faonvole.ts';

/**
 * Faonvole grown into a proud stag turned to the left: antlers built like kite frames, coloured kite sails
 * between the tines, a storm-cloud mane on its chest, a key hanging from a string round its neck, and a long
 * ribbon tail of lightning-bolt bows streaming behind.
 */
export default {
  id: '079', slug: 'cerfoudre', seed: 7901, size: [1150, 1180], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const FUR = '#a8683a', CREAM = '#f3dcb0', DEEP = '#6e4322', CLOUD = '#8f8aa8', YEL = '#f7dc35', STICK = '#7a5a3a';
    const COLS = ['#e2423a', '#4f8fe0', '#f7dc35', '#5bbf6a'];
    const zag = (x: number, y: number, s: number): P[] => [[x, y], [x + 18 * s, y - 34 * s], [x + 6 * s, y - 32 * s], [x + 30 * s, y - 72 * s], [x - 8 * s, y - 24 * s], [x + 6 * s, y - 26 * s]];
    // the long ribbon tail streaming up behind, lightning bows along it
    c.part('queue', { pivot: [860, 560], motion: 'swing', amp: 5, period: 1.8, behind: true }, () => {
      const tail: P[] = [[860, 560], [960, 500], [1010, 400], [1060, 300], [1080, 180], [1120, 80]];
      shape(band(tail, 26, 16), COLS[1], { angle: 60, over: 0 });
      for (const [x, y, k] of [[955, 505, 0], [1012, 395, 2], [1058, 292, 3], [1082, 178, 0]] as const) shape(zag(x - 16, y + 46, 1.6), COLS[k], { over: 0 }, { w: 4 }, false);
      bow(c, 1118, 84, 1.6, COLS[2]);
    });
    // the far legs, long, behind
    shape(band([[480, 700], [450, 860], [470, 1050]], 56, 44), DEEP, { angle: 90 });
    shape(band([[780, 690], [830, 860], [820, 1040]], 56, 44), DEEP, { angle: 90 });
    // the far antler, behind the head: kite frame and sails
    stroke([[400, 250], [460, 120], [540, 30]], { w: 10, col: STICK });
    stroke([[455, 135], [600, 130]], { w: 9, col: STICK });
    kite(c, 545, 110, 110, 140, COLS[1], 20);
    // the body, deep chest, tummy lighter
    shape([[420, 470], [600, 430], [800, 440], [900, 520], [880, 660], [780, 720], [560, 730], [430, 690], [380, 590]], FUR, { angle: 15, over: 0.55, press: 1.05 });
    c.tint([[480, 650], [800, 650], [770, 710], [520, 715]], CREAM, { gap: 3.4, angle: 15 });
    kite(c, 690, 530, 60, 78, COLS[0], 10);
    kite(c, 800, 560, 46, 60, COLS[2], -8);
    // the near legs, long and strong, dark hooves
    shape(band([[530, 700], [510, 870], [520, 1060]], 64, 50), FUR, { angle: 90 });
    shape(band([[750, 700], [780, 870], [770, 1055]], 64, 50), FUR, { angle: 90 });
    for (const [x, y] of [[522, 1070], [772, 1065]] as const) shape(potato(x, y, 36, 22, 7, 0.06), DEEP, { over: 0 });
    // the neck rising
    shape([[340, 560], [300, 380], [380, 300], [470, 330], [500, 470], [470, 560]], FUR, { angle: 60, over: 0.4 });
    // the storm-cloud mane on its chest, sparks in it
    for (const [x, y, r] of [[380, 560, 70], [450, 600, 66], [330, 480, 60], [420, 500, 56]] as const) shape(potato(x, y, r, r * 0.8, 9, 0.12), CLOUD, { angle: 30, over: 0.3 }, { w: 4 });
    shape(zag(360, 620, 0.9), YEL, { over: 0 }, { w: 3 }, false);
    // the key on its string
    c.part('cle', { pivot: [330, 470], motion: 'swing', amp: 8, period: 1.4 }, () => {
      stroke([[330, 470], [340, 560], [360, 640], [365, 690]], { w: 3.5 });
      shape(potato(368, 708, 22, 22, 8, 0.05), YEL, { over: 0 }, { w: 3.5 });
      c.paper(potato(368, 708, 8, 8, 7, 0.05), { w: 2.5 });
      shape(band([[368, 728], [368, 790]], 14, 14), YEL, { over: 0 }, { w: 3 });
      shape([[368, 760], [392, 760], [392, 778], [368, 778]], YEL, { over: 0 }, { w: 3 }, false);
    });
    // the head turned left, a long muzzle
    shape([[200, 330], [260, 240], [380, 220], [450, 270], [440, 360], [350, 400], [240, 420], [160, 410], [120, 370]], FUR, { angle: 75, over: 0.45 });
    c.tint(potato(150, 395, 40, 28, 8, 0.08), CREAM, { gap: 3.2 });
    dot(118, 375, 15, 12);
    // the far ear and the near ear
    shape([[420, 250], [520, 220], [540, 255], [450, 290]], FUR, { angle: 120 }, {}, false);
    // the near antler, big: tines like a kite frame with sails between them
    stroke([[330, 230], [300, 120], [250, 30]], { w: 11, col: STICK });
    stroke([[305, 130], [170, 110], [80, 50]], { w: 10, col: STICK });
    stroke([[312, 175], [390, 80], [420, 10]], { w: 10, col: STICK });
    kite(c, 175, 90, 120, 150, COLS[3], -30);
    kite(c, 345, 85, 110, 140, COLS[2], 12);
    shape([[440, 260], [540, 250], [560, 280], [460, 300]], FUR, { angle: 120 }, {}, false);
    c.tint([[460, 268], [530, 262], [470, 288]], '#f29ab0', { gap: 3 });
    // a fierce eye, the brow down, a firm mouth
    c.paper(potato(300, 300, 28, 22, 8, 0.05));
    dot(292, 304, 14, 14);
    dot(286, 296, 5, 5, '#ffffff');
    stroke([[255, 268], [305, 274], [355, 258]], { w: 7 });
    stroke([[150, 418], [195, 420], [235, 408]], { w: 4.5 });
  },
} satisfies Redraw;
