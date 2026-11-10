import type { P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb, paw } from './anatomy.ts';
import { CHEST, DEEP, FUR, INDIGO, PINK, aardHead, bigClaw, plate } from './fouissou.ts';

/**
 * The grown aardvark dragon, the lord of the burrows: standing tall on its hind legs and its heavy tail, chest out, one
 * great arm raised with three curved shovel claws. Its ears have grown into long pointed dragon ears with an indigo
 * frill down their back edge, and tall indigo plates run from its neck to the spade at the tip of its tail. Head high,
 * snout tipped down, it looks down at its foe, calm and proud.
 */
const MEMB = '#6a7ad8', IVORY = '#efe2c8';

/** A leg through `pts` (top to foot), `ws` wide at each: filled, its line left open at the body. */
function leg(c: Parameters<typeof openLimb>[0], pts: P[], ws: number[], col: string) {
  const L: P[] = [], R: P[] = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)], l = Math.hypot(bx - ax, by - ay) || 1, h = ws[i] / 2;
    L.push([x + ((by - ay) / l) * h, y - ((bx - ax) / l) * h]);
    R.push([x - ((by - ay) / l) * h, y + ((bx - ax) / l) * h]);
  });
  openLimb(c, [...L, ...R.reverse()], col, 1, 2 * pts.length - 1);
}

/** One long pointed dragon ear from `root` to `tip`, swept back, an indigo frill growing from its back edge. */
function dragonEar(c: Parameters<typeof openLimb>[0], root: P, tip: P, w: number, col: string) {
  const dx = tip[0] - root[0], dy = tip[1] - root[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l], n: P = [-u[1], u[0]];
  const at = (k: number, m: number): P => [root[0] + u[0] * l * k + n[0] * m, root[1] + u[1] * l * k + n[1] * m];
  // the frill: three scallops between ribs along the back edge, the ear in front
  c.shape([at(0.05, w * 0.4), at(0.3, w * 1.3), at(0.42, w * 0.9), at(0.6, w * 1.2), at(0.7, w * 0.7), at(0.86, w * 0.8), at(1, 0), at(0.6, 0), at(0.1, 0)], MEMB, { angle: 40, over: 0.2 });
  c.shape([at(0, -w * 0.5), at(0.4, -w * 0.45), at(0.8, -w * 0.18), at(1, 0), at(0.7, w * 0.3), at(0.3, w * 0.5), at(0, w * 0.5)], col, { angle: 60, over: 0.3 });
  c.tint([at(0.1, -w * 0.2), at(0.5, -w * 0.18), at(0.8, -w * 0.05), at(0.5, w * 0.12), at(0.12, w * 0.2)], PINK, { angle: 60, wash: 0.55 });
}

export default {
  id: '143', slug: 'terradrac', seed: 14302, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke } = c;
    // the line of action: a high deep chest, the back sloping down to the hips, the heavy tail sweeping up to a spade
    const spine: P[] = [[440, 520], [540, 500], [650, 520], [750, 560], [840, 600], [910, 570], [950, 480], [950, 400]];
    const widths = [250, 250, 220, 200, 150, 110, 80, 56];
    const down = [60, 40, 20, 30, 0, 0, 0, 0];
    // the far legs, darker: the front one planted under the chest, the hind one braced
    leg(c, [[520, 600], [500, 760], [490, 890]], [110, 70, 64], DEEP);
    for (const d of [190, 215, 240]) bigClaw(c, [470, 900], d, 54, 22, IVORY);
    leg(c, [[780, 600], [830, 740], [790, 890]], [130, 76, 64], DEEP);
    // the spade at the tip of the tail
    c.part('pique', { pivot: [950, 400], motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      shape([[925, 420], [905, 320], [955, 250], [995, 320], [975, 420]], INDIGO, { angle: 30 }, { w: 4.5 });
    });
    // fewer, taller plates, peaking over the shoulders
    for (const [i, h] of [[0.3, 96], [1, 140], [1.8, 124], [2.8, 96], [4, 70], [5.2, 52]] as const) {
      const k = Math.floor(i), f = i - k, [x0, y0] = spine[k], [x1, y1] = spine[k + 1];
      const x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f, l = Math.hypot(x1 - x0, y1 - y0);
      const nx = (y1 - y0) / l, ny = -(x1 - x0) / l, half = widths[k] / 2 - 16;
      plate(c, [x + nx * half, y + ny * half], (Math.atan2(nx, -ny) * 180) / Math.PI + 12, h);
    }
    // the body and tail in one line, a pale belly
    shape(lineOfAction(spine, widths, down), FUR, { angle: 15, over: 0.45 });
    c.tint(lineOfAction(spine.slice(0, 4).map(([x, y], i): P => [x, y + [110, 104, 90, 80][i]]), [80, 70, 56, 44]), CHEST, { angle: 10, wash: 0.8 });
    // the near hind leg: a big thigh, the hock, the foot planted
    leg(c, [[740, 580], [680, 730], [740, 820], [720, 900]], [230, 120, 74, 66], FUR);
    paw(c, 710, 912, FUR, 70);
    for (const d of [190, 210, 230]) bigClaw(c, [680, 926], d, 44, 20, IVORY);
    // the arched neck rising from the chest, narrowing to the head
    shape(c.band([[480, 520], [430, 420], [400, 330]], 210, 110), FUR, { angle: 70, over: 0.3 }, { w: 0.1 });
    stroke([[358, 350], [374, 440], [400, 500]], { w: 5 });
    // a deep round chest in front of the near front leg
    shape(c.potato(400, 560, 110, 120, 12, 0.04), FUR, { angle: 70, over: 0.3 });
    c.tint(c.potato(380, 580, 70, 90, 10, 0.05), CHEST, { angle: 70, wash: 0.7 });
    // the near front leg raised mid-step: shoulder, elbow, a bent wrist, the great claws curled
    c.part('patte', { pivot: [450, 610], motion: 'nod', amp: 3, period: 2.4 }, () => {
      leg(c, [[460, 600], [370, 700], [340, 790]], [160, 90, 72], FUR);
      shape(c.potato(334, 806, 52, 40, 8, 0.06), FUR, { angle: 30 }, { w: 4.5 });
      for (const d of [170, 200, 230]) bigClaw(c, [316, 830], d, 84, 32, IVORY);
    });
    // its long pointed dragon ears swept back, the indigo frill growing from their back edge (they sway in battle)
    c.part('oreilles', { pivot: [420, 260], motion: 'swing', amp: 2, period: 3, behind: true }, () => {
      dragonEar(c, [450, 250], [660, 70], 60, DEEP);
      dragonEar(c, [400, 240], [520, 20], 58, FUR);
    });
    // the head held high, the snout tipped down: it looks down at its foe
    const T = aardHead(c, 400, 290, 1.05, -28, 1);
    c.dot(...T([-284, 40]), 6, 5);
    // proud: eyes wide open, a bright shine, level firm brows, mouth closed
    c.eye(...T([-60, -16]), 26, 34, '#241c38');
    c.eye(...T([24, -26]), 32, 42, '#241c38');
    {
      // level brows, drawn on the page so the head's tilt doesn't slant them
      const [ax, ay] = T([-60, -16]), [bx, by] = T([24, -26]);
      stroke([[ax - 34, ay - 52], [ax + 26, ay - 50]], { w: 7.5 });
      stroke([[bx - 30, by - 62], [bx + 40, by - 64]], { w: 7.5 });
    }
    stroke([T([-160, 56]), T([-110, 66]), T([-86, 58])], { w: 5 });
    c.part('paupieres', { pivot: T([-18, -20]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-60, -16]), 26, 34, FUR);
      c.lid(...T([24, -26]), 32, 42, FUR);
    });
  },
} satisfies Redraw;
