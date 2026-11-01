import type { P, Redraw } from './crayon.ts';

/**
 * Chapardou grown into a tall, slender panther, turned to the left and sitting up proudly on its heap of stolen
 * coloured pencils: the master thief. It keeps Chapardou's violet-grey fur, bandit's mask, amber eyes (half closed,
 * very pleased with itself), tufted ears with a gold ring, cream muzzle and chest, and ringed tail, which curls down
 * over its treasure.
 */
export default {
  id: '055', slug: 'pantharuse', seed: 5547, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const FUR = '#7d6c9e', DEEP = '#61537f', MASK = '#3f3560', CREAM = '#f3e6c6', AMBER = '#f2b43a', GOLD = '#f2c43a', PINK = '#f29ab0';
    const WOOD = '#f0d0a0';
    /** A coloured pencil lying from a to b (a is the point). */
    const pencil = (a: P, b: P, col: string) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l], n: P = [-u[1] * 22, u[0] * 22];
      const t: P = [a[0] + u[0] * 60, a[1] + u[1] * 60];
      shape([[t[0] + n[0], t[1] + n[1]], [b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]], [t[0] - n[0], t[1] - n[1]]], col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI, over: 0 }, { w: 4 }, false);
      shape([[t[0] + n[0], t[1] + n[1]], [t[0] - n[0], t[1] - n[1]], a], WOOD, { over: 0 }, { w: 4 }, false);
      dot(a[0] + u[0] * 14, a[1] + u[1] * 14, 9, 7, col);
    };
    // the heap of stolen pencils it sits on
    pencil([200, 900], [520, 860], '#4a7fd6');
    pencil([840, 880], [520, 900], '#5cae5a');
    pencil([260, 830], [560, 940], '#f2c43a');
    pencil([780, 820], [470, 930], '#e2423a');
    pencil([330, 950], [700, 950], '#f08a3a');
    // the far front leg and the far ear
    shape(band([[530, 600], [532, 760], [530, 860]], 54, 48), DEEP, { angle: 90 });
    shape(potato(522, 868, 42, 22, 8, 0.06), DEEP, { angle: 10 });
    shape([[372, 230], [330, 120], [430, 200]], FUR, { angle: 70 }, {}, false);
    // the body sitting tall, a cream chest, the haunch
    shape([[430, 870], [410, 720], [430, 570], [462, 450], [490, 380], [580, 370], [620, 450], [680, 600], [710, 740], [700, 870]], FUR, { angle: 80, over: 0.5 });
    c.tint(potato(500, 600, 60, 110, 10, 0.08), CREAM, { angle: 80, wash: 0.55 });
    shape(potato(650, 780, 96, 104, 11, 0.05), FUR, { angle: 70, over: 0.3 });
    // the near front leg, long and straight down to the heap
    shape(band([[460, 600], [452, 760], [446, 862]], 58, 50), FUR, { angle: 90 });
    shape(potato(436, 872, 46, 24, 8, 0.06), FUR, { angle: 10 });
    stroke([[418, 876], [420, 894]], { w: 3.5 });
    stroke([[444, 878], [446, 896]], { w: 3.5 });
    // the ringed tail curling down over its treasure (it swishes in battle)
    c.part('queue', { pivot: [690, 820], motion: 'swing', amp: 6, period: 2.2 }, () => {
      const tail: P[] = [[690, 820], [790, 830], [850, 890], [800, 950], [700, 960]];
      shape(band(tail, 60, 40), FUR, { angle: 30, over: 0.3 });
      for (const [a, b] of [[[770, 826], [804, 838]], [[850, 890], [840, 920]], [[760, 958], [726, 960]]] as [P, P][]) {
        shape(band([a, b], 64, 50), MASK, { angle: 30, over: 0 }, { w: 4 });
      }
    });
    // a smaller head held high, the near ear with its tuft and gold ring
    shape([[480, 230], [530, 100], [570, 250]], FUR, { angle: 70 }, {}, false);
    shape([[500, 230], [528, 150], [550, 236]], PINK, { angle: 70, over: 0 }, { w: 3.5 }, false);
    stroke([[530, 100], [544, 66]], { w: 4 });
    stroke([[530, 100], [518, 68]], { w: 4 });
    const head: P[] = [[330, 330], [344, 270], [390, 226], [460, 210], [530, 226], [576, 276], [584, 340], [560, 392], [500, 420], [420, 424], [360, 400]];
    shape(head, FUR, { angle: 78, over: 0.45 });
    stroke([[566, 380], [596, 394], [574, 408], [596, 424], [556, 424]], { w: 4 }, false);
    c.tint(potato(380, 380, 60, 34, 9, 0.08), CREAM, { angle: 60, wash: 0.6 });
    shape(potato(572, 254, 20, 20, 9, 0.02), GOLD, { over: 0, press: 1.2 }, { w: 3.5 });
    c.paper(potato(572, 254, 9, 9, 8, 0.02), { w: 2.5 });
    // the bandit's mask, amber eyes half closed: very pleased with itself
    shape([[334, 290], [390, 266], [470, 262], [550, 270], [584, 300], [574, 338], [500, 340], [450, 350], [410, 340], [360, 344], [336, 326]], MASK, { angle: 20, over: 0.3 });
    c.eye(392, 304, 22, 26, AMBER, { lid: 0.42, skin: MASK });
    c.eye(476, 300, 30, 36, AMBER, { lid: 0.42, skin: MASK });
    c.cheek(522, 372, 26, 15);
    // a pink nose and a little cat mouth just under it, one fang showing
    dot(352, 360, 11, 8, '#e07a96');
    stroke([[352, 368], [352, 382]], { w: 3.5 });
    stroke([[332, 390], [352, 382], [374, 392]], { w: 4 });
    shape([[364, 389], [374, 391], [368, 404]], '#ffffff', { over: 0, wash: 1 }, { w: 2.5 }, false);
    stroke([[300, 364], [236, 352]], { w: 3 });
    stroke([[300, 380], [232, 388]], { w: 3 });
    // only in battle: its eyes blink
    c.part('paupieres', { pivot: [434, 302], motion: 'blink', extra: true }, () => {
      c.lid(392, 304, 22, 26, MASK);
      c.lid(476, 300, 30, 36, MASK);
    });
  },
} satisfies Redraw;
