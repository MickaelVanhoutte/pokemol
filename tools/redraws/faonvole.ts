import type { Crayon, P, Redraw } from './crayon.ts';

/** A kite diamond with its two crossed sticks. */
export function kite(c: Crayon, x: number, y: number, w: number, h: number, col: string, tilt = 0) {
  const a = (tilt * Math.PI) / 180, r = (px: number, py: number): P => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
  const top = r(0, -h * 0.42), bot = r(0, h * 0.58), lft = r(-w / 2, 0), rgt = r(w / 2, 0);
  c.shape([top, rgt, bot, lft], col, { over: 0, press: 1.05 }, { w: 3.5 }, false);
  c.stroke([top, bot], { w: 3 }, false);
  c.stroke([lft, rgt], { w: 3 }, false);
}

/** A little bow on a kite string. */
export function bow(c: Crayon, x: number, y: number, s: number, col: string) {
  c.shape([[x, y], [x - 26 * s, y - 18 * s], [x - 24 * s, y + 18 * s]], col, { over: 0 }, { w: 3 }, false);
  c.shape([[x, y], [x + 26 * s, y - 18 * s], [x + 24 * s, y + 18 * s]], col, { over: 0 }, { w: 3 }, false);
}

/**
 * A fawn that flies like a kite, turned to the left: spots shaped like kite diamonds, little antler nubs that
 * crackle, and a kite string for a tail, bows tied along it, floating up behind.
 */
export default {
  id: '078', slug: 'faonvole', seed: 7801, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const FUR = '#c98b4f', CREAM = '#f5e3bf', DEEP = '#8a5a30', YEL = '#f7dc35';
    const COLS = ['#e2423a', '#4f8fe0', '#f7dc35'];
    // the kite string floating up behind, bows along it
    c.part('queue', { pivot: [730, 470], motion: 'swing', amp: 8, period: 1.6, behind: true }, () => {
      const string: P[] = [[730, 470], [820, 400], [860, 300], [920, 230], [960, 120]];
      stroke(string, { w: 5 });
      bow(c, 820, 400, 1.4, COLS[0]);
      bow(c, 868, 292, 1.3, COLS[1]);
      bow(c, 935, 190, 1.2, COLS[2]);
    });
    // the far legs, behind
    shape(band([[440, 600], [420, 740], [430, 860]], 40, 32), DEEP, { angle: 90 });
    shape(band([[680, 590], [710, 730], [700, 850]], 40, 32), DEEP, { angle: 90 });
    // the body, a cream tummy, little kite diamonds for spots
    shape(potato(570, 500, 210, 120, 12, 0.04), FUR, { angle: 15, over: 0.5 });
    c.tint([[420, 560], [700, 560], [690, 610], [440, 612]], CREAM, { gap: 3.4, angle: 15 });
    kite(c, 510, 455, 70, 92, COLS[0], -10);
    kite(c, 650, 470, 62, 82, COLS[1], 8);
    kite(c, 585, 545, 50, 64, COLS[2], -4);
    // a little tuft of a tail where the string is tied
    shape([[740, 440], [790, 420], [780, 470], [745, 485]], CREAM, { over: 0 }, { w: 3.5 }, false);
    // the near legs, thin, little dark hooves
    shape(band([[500, 600], [480, 750], [490, 880]], 46, 38), FUR, { angle: 90 });
    shape(band([[640, 600], [660, 750], [650, 875]], 46, 38), FUR, { angle: 90 });
    for (const [x, y] of [[492, 890], [650, 885]] as const) shape(potato(x, y, 28, 18, 7, 0.06), DEEP, { over: 0 });
    // the neck and the head turned left
    shape([[360, 470], [330, 360], [400, 320], [460, 420], [470, 500]], FUR, { angle: 60 });
    // the far ear, the antler nubs crackling, the near ear
    shape([[390, 240], [470, 170], [500, 200], [440, 270]], FUR, { angle: 120 }, {}, false);
    for (const [x, y] of [[300, 200], [360, 185]] as const) {
      shape(band([[x, y + 30], [x + 4, y - 10]], 22, 18), CREAM, { over: 0 });
      shape([[x - 4, y - 8], [x + 18, y - 38], [x + 8, y - 36], [x + 26, y - 70], [x - 6, y - 28], [x + 4, y - 30]], YEL, { over: 0 }, { w: 3 }, false);
    }
    shape(potato(290, 300, 135, 105, 11, 0.05), FUR, { angle: 75, over: 0.45 });
    shape(band([[175, 330], [130, 345]], 66, 52), FUR, { angle: 10 });
    c.tint(potato(170, 350, 40, 30, 8, 0.08), CREAM, { gap: 3.2 });
    shape([[350, 230], [450, 200], [480, 230], [400, 290]], FUR, { angle: 120 }, {}, false);
    c.tint([[370, 245], [445, 220], [420, 265]], '#f29ab0', { gap: 3 });
    // big bright eyes, a black nose, a smile
    c.paper(potato(235, 290, 26, 32, 8, 0.05));
    c.paper(potato(330, 282, 30, 36, 8, 0.05));
    dot(230, 298, 15, 20);
    dot(322, 291, 17, 22);
    dot(224, 286, 5, 6, '#ffffff');
    dot(315, 278, 6, 7, '#ffffff');
    dot(115, 340, 14, 11);
    stroke([[150, 385], [185, 398], [215, 386]], { w: 4.5 });
    // a few white specks on its back, like a real fawn
    for (const [x, y] of [[450, 410], [700, 430], [730, 500]] as const) c.paper(potato(x, y, 11, 9, 7, 0.1), { w: 3 });
  },
} satisfies Redraw;
