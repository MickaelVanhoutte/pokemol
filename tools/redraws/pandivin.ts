import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { limb, pandaHead, ring, tailBand } from './pandaKit.ts';

/**
 * Pandivin, the seer (« le petit malin »): Pandoudou redrawn with a pink Magic Pencil. A red panda, long and low like its
 * family, that prances: head held high, eyes closed in calm with a knowing little smile, the near front paw folded up under
 * it, its bushy tail rising behind like a plume. Its rings have come loose and float round its tail,
 * turning while it thinks.
 */
export default {
  id: '127', slug: 'pandivin', seed: 1271, size: [1100, 900], tilt: 0,
  draw(c) {
    const LILAC = '#a26fdc', PALE = '#dcc6f6', TEAR = '#8a5cc8', CREAM = '#f8f0e2', HOOP = '#f2559a', PINK = '#f29ab0', LEG = '#5a3488';

    /** Half a loose hoop at (x, y), `rx` wide, tilted `deg`: its back half or its front half. */
    const hoop = (x: number, y: number, rx: number, deg: number, back: boolean, flat = 0.3) => {
      const a = (deg * Math.PI) / 180;
      const pts: P[] = Array.from({ length: 15 }, (_, k) => {
        const t = (back ? Math.PI : 0) + (k / 14) * Math.PI, px = Math.cos(t) * rx, py = Math.sin(t) * rx * flat;
        return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
      });
      c.stroke(pts, { w: 19 });
      c.stroke(pts, { w: 11, col: HOOP });
    };

    // the bushy tail rising behind like a plume, two loose hoops crossing it, pale bands where its rings were
    c.part('queue', { pivot: [800, 470], motion: 'swing', amp: 2, period: 3.6, behind: true }, () => {
      const { sp, ws, out } = tailBand([[790, 480], [890, 430], [960, 330], [960, 220], [900, 150]], (t) => 104 + Math.sin(t * Math.PI) * 60, 56);
      /** A full hoop crossing the tail at sample `i`, tilted across it. */
      const across = (i: number, back: boolean) => {
        const [ax, ay] = sp[i - 1], [bx, by] = sp[i + 1];
        hoop(...sp[i], ws[i] / 2 + 32, (Math.atan2(by - ay, bx - ax) * 180) / Math.PI + 90 + 14, back);
      };
      for (const i of [18, 36]) across(i, true);
      c.shape(out, LILAC, { angle: 40, over: 0.4 }, { w: 0.1 });
      for (let r = 0; r < 4; r++) c.tint(ring(sp, ws, r, 4, 0.16, 0.92), PALE, { angle: 70, wash: 0.9 });
      c.stroke([...out, out[0], out[1]], { w: 5 });
      for (const i of [18, 36]) across(i, false);
    });
    // far legs, short and dark like a red panda's: the front one planted, the hind one a step behind
    limb(c, [[490, 600], [500, 690], [474, 780]], [70, 58, 50], LEG);
    c.shape(c.potato(466, 790, 40, 20, 8, 0.05), LEG, { angle: 10 });
    limb(c, [[780, 580], [770, 660], [856, 734], [826, 780]], [84, 62, 50, 44], LEG);
    c.shape(c.potato(824, 790, 40, 20, 8, 0.05), LEG, { angle: 10 });
    // the body: long and low like its family's, the chest held high, the back flowing up into the tail
    c.shape([[384, 330], [420, 390], [450, 424], [510, 440], [600, 452], [700, 446], [790, 456], [834, 510], [826, 576], [770, 616], [670, 626],
      [570, 616], [480, 636], [400, 616], [350, 556], [326, 470], [306, 400]], LILAC, { angle: 30, over: 0.45 });
    c.tint(c.potato(390, 560, 42, 54, 10, 0.08), CREAM, { angle: 70, wash: 0.75 });
    // the near hind leg: a round haunch, the knee, the hock, a short dark foot
    openLimb(c, [[680, 490], [790, 480], [830, 550], [790, 620], [710, 630], [670, 570]], LILAC, 1, 5);
    limb(c, [[740, 600], [700, 676], [800, 730], [764, 780]], [96, 70, 54, 46], LILAC);
    limb(c, [[796, 726], [764, 780]], [52, 46], LEG);
    c.shape(c.potato(758, 790, 44, 20, 8, 0.05), LEG, { angle: 10 });
    // the near front leg lifted in a prance: the elbow forward, the dark forearm folded down, the paw curled under
    limb(c, [[440, 580], [350, 600], [340, 660]], [86, 66, 54], LILAC);
    limb(c, [[342, 640], [348, 690]], [56, 50], LEG);
    c.shape(c.potato(366, 700, 30, 22, 8, 0.05), LEG, { over: 0 });
    pandaHead(c, { fur: LILAC, deep: TEAR, cream: CREAM, pink: PINK }, 304, 286, 0.76, 20, 'serene');
  },
} satisfies Redraw;
