import type { Redraw } from './crayon.ts';
import { DEEP, GREEN, PALE, bud, hair, leaf, skirtLeaf } from './sundewKit.ts';

/**
 * A baby sundew, the little glutton: a round bud wrapped in its sepals, sitting in a little rosette of leaves. Two long
 * sundew leaves grow from the rosette, a round red paddle on each, fringed with sticky hairs holding lilac drops of dew.
 * Leaning over, eyes shut with delight, it has curled one leaf up to its mouth and licks a drop off it like a lollipop.
 * Its flaw: a drop stuck on its own cheek.
 */
export default {
  id: '130', slug: 'perlotte', seed: 13003, size: [1000, 1000], tilt: -12,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the far leaf, from the back of the rosette, up and out behind (it sways in battle)
    c.part('feuille', { pivot: [660, 800], motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      leaf(c, [[660, 800], [760, 640], [800, 470], [760, 380]], 140, 5, { stalk: 0.28 });
    });
    // the rosette behind
    skirtLeaf(c, [600, 800], [790, 830], 96, DEEP);
    skirtLeaf(c, [460, 800], [280, 820], 86, DEEP);
    // the bud of a body, leaning toward its lollipop
    bud(c, 530, 640, 200, 190, [440, 360]);
    c.tint(potato(470, 720, 110, 70, 10, 0.06), PALE, { angle: 60, wash: 0.7 });
    // the rosette in front
    skirtLeaf(c, [460, 820], [330, 900], 104);
    skirtLeaf(c, [590, 820], [700, 900], 100);
    // eyes shut with delight, two happy arcs, a blush
    stroke([[392, 590], [420, 566], [452, 584]], { w: 7 });
    stroke([[516, 572], [552, 544], [590, 568]], { w: 7 });
    c.cheek(616, 660, 42, 28);
    hair(c, [660, 618], [660, 618], 18);
    // the mouth open on the lollipop
    shape([[430, 676], [462, 664], [494, 674], [486, 702], [454, 710], [434, 696]], '#7a3040', { angle: 90, over: 0 }, { w: 4 });
    // the near leaf, curled up from the front of the rosette, its paddle at the mouth
    c.part('sucette', { pivot: [390, 790], motion: 'nod', amp: 3, period: 2.2 }, () => {
      leaf(c, [[400, 860], [320, 820], [286, 740], [316, 660]], 132, 5, { stalk: 0.32 });
    });
    // the tongue curling up onto the paddle
    shape([[444, 690], [404, 676], [372, 652], [368, 664], [398, 690], [440, 702]], '#f28aa8', { angle: 0, over: 0 }, { w: 3.5 });
    c.part('paupieres', { pivot: [490, 570], motion: 'nod', amp: 1, period: 3, extra: true }, () => {
      c.dot(470, 560, 1, 1, GREEN);
    });
  },
} satisfies Redraw;
