import type { P, Redraw } from './crayon.ts';
import { DEEP, GREEN, PALE, bud, leaf, skirtLeaf } from './sundewKit.ts';
import { tailBand } from './pandaKit.ts';

/**
 * The teen sundew, the curious one: a taller bud leaning forward, walking on two long leaves like legs, one stepping
 * out. Its near leaf has grown long and stretches far ahead, its paddle starting to fork in two (the final's forked
 * arms), and a crumpled dry leaf is stuck to it: it caught something and can't wait to see what. A little flower bud
 * has appeared on its sprout. Brows high, eyes on its catch, a little « o » mouth.
 */
export default {
  id: '131', slug: 'glurosee', seed: 13103, size: [1000, 1000], tilt: -6,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the far leaf, raised behind in surprise (it sways in battle)
    c.part('brasLoin', { pivot: [650, 520], motion: 'swing', amp: 3, period: 3, behind: true }, () => {
      leaf(c, [[640, 520], [740, 430], [790, 320]], 130, 5, { stalk: 0.28, col: '#57a83e' });
    });
    // the far leg, planted
    skirtLeaf(c, [600, 760], [700, 930], 92, DEEP);
    // the tall bud, leaning forward, a little flower bud on its sprout
    const out = bud(c, 560, 560, 170, 230, [500, 220]);
    void out;
    c.shape(potato(552, 172, 20, 30, 8, 0.04), '#57a83e', { angle: 80, over: 0 }, { w: 4 });
    c.tint(potato(552, 150, 12, 10, 6, 0.04), '#f28aa8', { wash: 0.9 });
    c.tint(potato(500, 640, 80, 100, 10, 0.06), PALE, { angle: 60, wash: 0.7 });
    // the near leg, stepping forward
    skirtLeaf(c, [500, 770], [330, 900], 110);
    // curious: brows high and arched, wide eyes looking down along its arm at the catch, a little « o »
    c.eye(456, 470, 36, 46);
    c.eye(576, 460, 46, 58);
    stroke([[404, 380], [444, 344], [494, 360]], { w: 6.5 });
    stroke([[530, 372], [578, 336], [628, 360]], { w: 6 });
    c.dot(500, 560, 15, 18, '#7a3040');
    c.cheek(640, 550, 32, 20);
    // the near leaf stretched far out ahead from its side, splitting into two equal paddles (the final's fork), a dry
    // leaf stuck to the upper one
    c.part('bras', { pivot: [410, 660], motion: 'reach', amp: 4, period: 2.4 }, () => {
      const t = tailBand([[420, 670], [320, 700], [210, 712]], () => 36, 20);
      shape(t.out, GREEN, { angle: 20, over: 0.2 });
      const up = leaf(c, [[214, 708], [160, 660], [130, 600]], 104, 4, { stalk: 0.32 });
      leaf(c, [[214, 716], [160, 770], [140, 830]], 104, 4, { stalk: 0.32 });
      const [x, y] = up.tip;
      const dry: P[] = [[x - 60, y - 30], [x - 14, y - 64], [x + 34, y - 46], [x + 40, y - 6], [x + 10, y + 22], [x - 30, y + 12], [x - 56, y - 2]];
      shape(dry, '#c08a40', { angle: 20, over: 0.2 }, { w: 4 });
      stroke([[x - 54, y - 22], [x - 4, y - 24], [x + 36, y - 16]], { w: 3 });
      stroke([[x - 26, y - 24], [x - 16, y - 50]], { w: 2.5 });
    });
    c.part('paupieres', { pivot: [516, 466], motion: 'blink', extra: true }, () => {
      c.lid(456, 470, 36, 46, GREEN);
      c.lid(576, 460, 46, 58, GREEN);
    });
  },
} satisfies Redraw;
