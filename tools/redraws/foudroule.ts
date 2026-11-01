import type { Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { HAM, frame, hamHead, spark } from './joufflux.ts';

/**
 * Zigzou grown into a ball of lightning (« boule de foudre »), turned to the left: it leaps flat out, forepaws reaching,
 * hind legs flung back, sparks streaming behind. Its static fur bristles into a spiky tuft on its crown, and its round
 * cheek pouches, grown huge, crackle with the sparks it has stuffed in them.
 */
export default {
  id: '027', slug: 'foudroule', seed: 2701, size: [1100, 1100], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    /** A little pink paw at (x, y), the sole along `deg`. */
    const foot = (x: number, y: number, deg: number, s: number) => {
      const { t } = frame(x, y, s, deg);
      shape(t([[-44, -14], [-10, -24], [34, -14], [44, 4], [10, 14], [-40, 10]]), HAM.PAW, { over: 0 }, { w: 4 });
    };

    // a flying dash: stretched out long and lean, forepaws reaching, hind legs flung back, sparks streaming behind
    c.part('trainee', { pivot: [960, 760], motion: 'flicker', period: 1.4, decor: true }, () => {
      for (const [x, y, l] of [[900, 640, 120], [820, 920, 130]] as const) stroke([[x, y], [x + l * 0.95, y + l * 0.32]], { w: 5 });
      spark(c, 960, 960, 30, 80);
      spark(c, 1010, 700, 20, 70);
    });
    const { T, t } = frame(600, 660, 1, 22);
    // the far legs: the front reaching ahead, the hind flung back
    shape(band(t([[-200, 60], [-300, 110], [-390, 110]]), 66, 46), HAM.DEEP, { angle: 20 });
    foot(...T([-410, 110]), -14, 1.1);
    shape(band(t([[220, 20], [320, 10], [420, -30]]), 80, 46), HAM.DEEP, { angle: 20 });
    foot(...T([440, -36]), -30, 1.1);
    // the stub tail
    shape(potato(...T([300, -70]), 34, 24, 8, 0.06), HAM.DEEP, { angle: 30, over: 0 });
    // the lean body, deep at the chest, a cream belly
    shape(t([[-290, 0], [-230, -110], [-80, -140], [80, -124], [220, -94], [300, -40], [320, 30], [250, 90], [100, 64], [-60, 96], [-200, 112], [-280, 70]]), HAM.FUR, { angle: 20, over: 0.45 });
    c.tint(t([[-280, 60], [-200, 108], [-60, 92], [90, 62], [-40, 60], [-180, 60]]), HAM.BELLY, { wash: 0.75 });
    // the near hind leg flung back from the flank: a strong thigh, the foot kicking off
    openLimb(c, t([[250, -50], [150, -30], [120, 50], [190, 110], [330, 120], [450, 90], [440, 50], [330, 40], [290, -10]]), HAM.FUR, 2, 8);
    foot(...T([462, 76]), -14, 1);
    // the near foreleg reaching forward
    shape(band(t([[-170, 30], [-290, 140], [-400, 176]]), 74, 46), HAM.FUR, { angle: 30 });
    foot(...T([-420, 178]), 6, 0.95);
    const h = T([-300, -150]);
    hamHead(c, h[0], h[1], 0.9, 8, { pouch: 1.9, mood: 'fierce', snout: 12, tuft: true });
    c.part('eclairs', { pivot: [540, 360], motion: 'flicker', period: 1.2 }, () => {
      spark(c, 560, 300, -40, 90);
      spark(c, 520, 420, -6, 90);
    });
  },
} satisfies Redraw;
