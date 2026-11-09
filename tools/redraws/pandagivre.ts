import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';
import { limb, pandaHead, ring, sample, tailBand } from './pandaKit.ts';

const ICE = '#7fbce8', TAIL = '#e2f2fc';

/** A stretch of the fluffy frosted tail along `ctrl`, `w(t)` wide: narrow ice stripes, and frost along its top edge. */
function frostTail(c: Crayon, ctrl: P[], w: (t: number) => number, rings: number, frost: boolean) {
  const N = 50, { sp, ws, out, L, R } = tailBand(ctrl, w, N);
  c.shape(out, TAIL, { angle: 30, over: 0.4 }, { w: 0.1 });
  for (let r = 0; r < rings; r++) c.tint(ring(sp, ws, r, rings, 0.1, 0.9, 0.3), ICE, { angle: 80, wash: 1, press: 1.1 });
  if (frost) {
    const up = L.reduce((a, p) => a + p[1], 0) < R.reduce((a, p) => a + p[1], 0);
    const top = (up ? L : R).slice(3, N - 3).map(([x, y], i): P => { const [sx, sy] = sp[i + 3]; return [x + (sx - x) * 0.14, y + (sy - y) * 0.14]; });
    c.tint(lineOfAction(sample(top, 30), Array.from({ length: 30 }, (_, k) => 16 + Math.sin(k * 1.4) * 5)), '#ffffff', { wash: 1 });
  }
  c.stroke([...out, out[0], out[1]], { w: 5 });
}

/**
 * Pandagivre, the chilly grump (« le frileux grognon »): Pandoudou redrawn with a white Magic Pencil. It always feels the
 * cold. It sits huddled, grumbling, and wears its huge fluffy frosted tail as a stole: the tail rises behind it from its
 * rump, goes over its shoulders and comes back down in front of its chest. The more it grumbles, the more everything
 * freezes.
 */
export default {
  id: '126', slug: 'pandagivre', seed: 1261, size: [1000, 1000], tilt: 0,
  draw(c) {
    const FUR = '#5ea4da', DEEP = '#7ab0dc', CREAM = '#f7fbff', PINK = '#f29ab0', NOSE = '#e0302a', LEG = '#2f5f8c', PAW = '#a8d2f0';

    // the far front paw
    c.shape(c.potato(500, 886, 46, 22, 8, 0.05), LEG, { angle: 10 });
    // the body sitting: sloping shoulders, a round belly, the round haunch at the back
    c.shape([[400, 480], [470, 440], [560, 450], [640, 510], [700, 600], [736, 710], [730, 820], [660, 880], [540, 894], [440, 878],
      [392, 800], [372, 700], [372, 590]], FUR, { angle: 75, over: 0.45 });
    c.tint(c.potato(470, 740, 70, 110, 10, 0.06), CREAM, { angle: 80, wash: 0.7 });
    // the tail rises from behind its rump, up its back and over its shoulders, going on behind its head
    // (no moving part: in battle a part is laid over the whole body, and this tail goes behind the head)
    frostTail(c, [[700, 860], [790, 760], [800, 620], [740, 500], [640, 420], [540, 400]], (t) => 104 + Math.abs(Math.sin(t * 34)) * 8, 4, true);
    // the near haunch over the tail's root, its short dark foot in front
    openLimb(c, [[560, 730], [680, 710], [744, 800], [706, 876], [600, 886], [550, 826]], FUR, 1, 5);
    c.shape(c.potato(590, 896, 62, 24, 8, 0.05), LEG, { angle: 10 });
    // …and comes back down in front: across its throat, under its chin, the end hanging down its chest
    frostTail(c, [[540, 440], [470, 490], [380, 500], [320, 540], [312, 620], [336, 700]], (t) => 104 - t * 24 + Math.abs(Math.sin(t * 30)) * 8, 3, false);
    // its forelegs hug the stole to its chest: dark forearms bent up, pale paws clutching it
    limb(c, [[470, 600], [450, 700], [376, 650]], [80, 62, 52], FUR);
    limb(c, [[450, 696], [376, 650]], [60, 52], LEG);
    c.shape(c.potato(360, 640, 34, 28, 8, 0.05), PAW, { over: 0 });
    for (const x of [348, 366]) c.stroke([[x, 628], [x - 4, 640]], { w: 3 });
    c.shape(c.potato(404, 610, 28, 22, 8, 0.05), PAW, { over: 0 });
    pandaHead(c, { fur: FUR, deep: DEEP, cream: CREAM, pink: PINK, nose: NOSE, bright: true, eyes: 0.82 }, 440, 330, 0.76, -6, 'grumpy');
  },
} satisfies Redraw;
