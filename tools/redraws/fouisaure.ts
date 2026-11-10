import type { P, Redraw } from './crayon.ts';
import { flankLeg, lineOfAction, openLimb, paw } from './anatomy.ts';
import { CHEST, DEEP, EARTH, FUR, INDIGO, PINK, aardHead, bigClaw, plate } from './fouissou.ts';

/**
 * The teen aardvark, the stubborn digger: one long line from its snout in the dirt, over its high arched back, to its
 * heavy tail held out straight behind. It digs with its near front paw, three big claws scooping, and flings clods back
 * over its shoulder. Long ears swept back, bigger indigo plates down its back and along the tail: the dragon is waking.
 * Brows pulled down, it will not stop until it is through.
 */
export default {
  id: '142', slug: 'fouisaure', seed: 14201, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke } = c;
    // the line of action: the neck low at the front, the back arched high over the hips, the tail held out behind
    const spine: P[] = [[330, 600], [420, 560], [520, 520], [620, 520], [710, 550], [790, 590], [860, 610], [920, 600], [970, 570]];
    const widths = [120, 190, 210, 200, 170, 120, 84, 60, 40];
    const down = [0, 26, 20, 10, 24, 0, 0, 0, 0];
    // clods of earth flung back from the scraping paw, low between its legs, the way a digger throws them
    c.part('mottes', { pivot: [420, 860], motion: 'nod', amp: 3, period: 1.4, decor: true, behind: true }, () => {
      for (const [x, y, r] of [[380, 850, 22], [470, 830, 20], [560, 846, 18], [640, 880, 15]] as [number, number, number][]) c.shape(c.potato(x, y, r, r * 0.8, 8, 0.15), EARTH, { angle: 30 });
      stroke([[360, 880], [480, 860], [600, 880]], { w: 4 });
    });
    // the far legs, darker: the front one braced, the hind one under the hips
    flankLeg(c, [430, 600], [330, 860], DEEP, 90);
    flankLeg(c, [720, 600], [760, 880], DEEP, 110);
    // the body and tail in one line, a pale belly
    shape(lineOfAction(spine, widths, down), FUR, { angle: 15, over: 0.4 });
    c.tint(lineOfAction(spine.slice(1, 5).map(([x, y], i): P => [x, y + [66, 74, 70, 56][i]]), [50, 56, 52, 40]), CHEST, { angle: 10, wash: 0.8 });
    // the plates down the back and the tail, bigger toward the shoulders
    for (const [i, h] of [[1.5, 56], [2.3, 66], [3.1, 64], [4, 54], [5, 44], [6, 36], [7, 28]] as const) {
      const k = Math.floor(i), f = i - k, [x0, y0] = spine[k], [x1, y1] = spine[k + 1];
      const x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f, l = Math.hypot(x1 - x0, y1 - y0);
      const nx = (y1 - y0) / l, ny = -(x1 - x0) / l, half = widths[k] / 2 - 10;
      plate(c, [x + nx * half, y + ny * half], (Math.atan2(nx, -ny) * 180) / Math.PI + 25, h);
    }
    // the near hind leg, a big crouched thigh, braced
    const hind: P[] = [[700, 580], [640, 720], [720, 800], [700, 880]], ws = [180, 110, 64, 56];
    const L: P[] = [], R: P[] = [];
    hind.forEach(([x, y], i) => {
      const [ax, ay] = hind[Math.max(0, i - 1)], [bx, by] = hind[Math.min(hind.length - 1, i + 1)], l = Math.hypot(bx - ax, by - ay) || 1, h = ws[i] / 2;
      L.push([x + ((by - ay) / l) * h, y - ((bx - ax) / l) * h]);
      R.push([x - ((by - ay) / l) * h, y + ((bx - ax) / l) * h]);
    });
    openLimb(c, [...L, ...R.reverse()], FUR, 1, 7);
    paw(c, 692, 890, FUR, 54);
    // the ears swept back flat along the neck (they twitch in battle)
    c.part('oreilles', { pivot: [390, 470], motion: 'swing', amp: 2, period: 2.2, behind: true }, () => {
      shape([[420, 480], [520, 400], [640, 360], [600, 430], [460, 520]], DEEP, { angle: 30, over: 0.2 });
      shape([[380, 470], [470, 380], [590, 320], [560, 400], [420, 500]], FUR, { angle: 30, over: 0.2 });
      c.tint([[400, 470], [480, 395], [570, 350], [545, 400], [430, 485]], PINK, { angle: 30, wash: 0.7 });
      stroke([[470, 380], [590, 320], [560, 400]], { w: 9, col: INDIGO });
    });
    // the head low, the snout down in the dirt
    const T = aardHead(c, 340, 540, 0.95, -28, 1.05);
    stroke([T([-200, 30]), T([-240, 6])], { w: 3.5 });
    stroke([T([-200, 40]), T([-244, 36])], { w: 3.5 });
    // stubborn: eyes fixed on the hole, brows pulled down hard
    c.eye(...T([-56, -20]), 26, 32, '#241c38');
    c.eye(...T([24, -30]), 32, 40, '#241c38');
    stroke([T([-92, -50]), T([-34, -62])], { w: 7.5 });
    stroke([T([-6, -74]), T([64, -84])], { w: 7.5 });
    // the near front paw digging: the shoulder down to a big paw, three long claws scooping
    c.part('pelle', { pivot: [440, 620], motion: 'reach', amp: 5, period: 1.2 }, () => {
      openLimb(c, c.band([[470, 620], [400, 740], [320, 780]], 104, 66), FUR, 1, 5);
      shape(c.potato(306, 800, 40, 32, 8, 0.06), FUR, { angle: 20 }, { w: 4.5 });
      for (const d of [200, 225, 250]) bigClaw(c, [290, 850], d, 76, 30);
    });
    // the heap it has dug: an uneven mound of loose earth, the dark hole dug into its side, facing the paw
    c.part('trou', { pivot: [200, 900], motion: 'nod', amp: 1, period: 3, decor: true, behind: true }, () => {
      shape([[30, 930], [50, 880], [90, 860], [120, 830], [160, 846], [200, 820], [240, 850], [290, 870], [330, 930]], EARTH, { angle: 30, over: 0.6 });
      shape([[230, 930], [234, 890], [260, 872], [292, 884], [306, 930]], '#2e1e14', { angle: 0, over: 0 }, { w: 4 });
      c.dot(110, 900, 10, 8, '#5a3c24');
      c.dot(180, 880, 8, 6, '#5a3c24');
    });
    c.part('paupieres', { pivot: T([-16, -24]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-56, -20]), 26, 32, FUR);
      c.lid(...T([24, -30]), 32, 40, FUR);
    });
  },
} satisfies Redraw;
