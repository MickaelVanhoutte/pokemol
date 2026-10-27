import type { P, Redraw } from './crayon.ts';

/** A five-pointed star. */
export function star(x: number, y: number, r: number, turn = 0): P[] {
  return Array.from({ length: 10 }, (_, i) => {
    const a = turn - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr] as P;
  });
}

/**
 * A bedroom night-light, turned to the left: a chubby glowing body, a pink lampshade for a hat, a pull cord for a
 * tail with a little star bead at the end, a crescent moon on its tummy, big gentle eyes to keep bad dreams away.
 */
export default {
  id: '082', slug: 'lumignon', seed: 8201, size: [900, 960], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const GLOW = '#fbe58a', WARM = '#f7c650', SHADE = '#f4a3c4', DEEP = '#d97aa6', YEL = '#f7dc35', MOON = '#f2c43a';
    // the pull cord tail behind, a little star bead at its end
    c.part('cordon', { pivot: [620, 640], motion: 'swing', amp: 8, period: 2, behind: true }, () => {
      stroke([[620, 640], [720, 660], [790, 610], [800, 520]], { w: 4 });
      shape(star(800, 500, 34, 0.2), YEL, { over: 0 }, { w: 3.5 }, false);
    });
    // the far foot, behind
    shape(potato(380, 845, 60, 30, 8, 0.06), WARM, { over: 0 });
    // the chubby glowing body, warmer at the bottom
    shape([[260, 430], [400, 380], [560, 400], [650, 520], [670, 680], [610, 820], [450, 860], [300, 830], [220, 700], [220, 540]], GLOW, { angle: 80, over: 0.3, press: 0.95 });
    c.tint([[240, 700], [640, 690], [600, 810], [450, 850], [300, 820]], WARM, { gap: 3.6, angle: 80 });
    // a crescent moon on its tummy
    shape([[440, 640], [480, 600], [530, 600], [495, 620], [480, 660], [500, 710], [535, 728], [480, 724], [445, 690]], MOON, { over: 0, press: 1.1 }, { w: 3.5 });
    // the near foot and little arms
    shape(potato(540, 860, 66, 32, 8, 0.06), WARM, { over: 0 });
    shape(band([[250, 620], [180, 660], [160, 610]], 40, 34), GLOW, { angle: 60, over: 0 });
    shape(band([[640, 620], [720, 640], [740, 590]], 40, 34), GLOW, { angle: 120, over: 0 });
    // the pink lampshade hat, tilted back, a ruffle at its rim
    shape([[250, 420], [330, 200], [560, 180], [680, 400], [560, 440], [400, 445]], SHADE, { angle: 100, over: 0.4 });
    stroke([[260, 418], [300, 432], [340, 420], [380, 436], [420, 424], [460, 440], [500, 426], [540, 440], [580, 424], [620, 432], [670, 404]], { w: 4, col: DEEP });
    stroke([[330, 205], [345, 300]], { w: 3, col: DEEP });
    stroke([[450, 190], [455, 290]], { w: 3, col: DEEP });
    stroke([[560, 185], [590, 290]], { w: 3, col: DEEP });
    // big gentle eyes, a sleepy smile, rosy cheeks
    c.paper(potato(310, 530, 30, 36, 8, 0.05));
    c.paper(potato(420, 522, 34, 40, 8, 0.05));
    dot(303, 540, 17, 22);
    dot(412, 532, 19, 24);
    dot(296, 527, 6, 7, '#ffffff');
    dot(404, 518, 6.5, 7.5, '#ffffff');
    stroke([[310, 610], [345, 628], [380, 615]], { w: 4.5 });
    c.tint(potato(260, 600, 28, 18, 8, 0.1), '#f6a7c8', { gap: 3 });
    c.tint(potato(470, 595, 26, 17, 8, 0.1), '#f6a7c8', { gap: 3 });
    // a soft glow round it: little rays
    c.part('rayons', { pivot: [450, 620], motion: 'flicker', period: 2.2 }, () => {
      for (const [x0, y0, x1, y1] of [[180, 470, 130, 440], [170, 760, 115, 790], [700, 760, 755, 790], [720, 470, 770, 445]] as const) stroke([[x0, y0], [x1, y1]], { w: 5, col: WARM });
    });
  },
} satisfies Redraw;
