import type { Crayon, P, Redraw } from './crayon.ts';

/** The family's colours: sandy-grey fur, a pale muzzle, a charcoal crest and spine stripe, an angry red flush. */
export const WOMBAT = {
  FUR: '#b3a68c', DEEP: '#857a64', LIGHT: '#cfc4aa', CREAM: '#f2ead6', CREST: '#3e3a42', NOSE: '#2c2830', STRIPE: '#6e6452',
  FLUSH: '#ec5a4a', CLAW: '#f6ecd8', EYE: '#241c38',
};

/**
 * The wombat's head centred on (hx, hy), `s` its size, turned `rot` degrees: wide and flat on top, a big square nose at
 * its front, small pointed ears set wide. `mood` 'hmph' shuts its eyes tight, 'glare' half-lids them.
 */
export function wombatHead(c: Crayon, hx: number, hy: number, s: number, rot: number, mood: 'hmph' | 'glare', fur: string) {
  const { DEEP, CREAM, CREST, NOSE, FLUSH, EYE } = WOMBAT;
  const r = (rot * Math.PI) / 180;
  const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  const h = (pts: P[]) => pts.map(H);
  // the angry tuft on top of its head (it bristles)
  c.part('touffe', { pivot: H([-10, -140]), motion: 'swing', amp: 4, period: 1.8, behind: true }, () => {
    c.shape(h([[-70, -120], [-60, -210], [-20, -150], [0, -236], [30, -150], [80, -200], [70, -110]]), CREST, { angle: 80 + rot, over: 0 }, {}, false);
  });
  // small pointed ears, set wide
  c.shape(h([[-150, -110], [-170, -190], [-100, -150]]), DEEP, { angle: 80, over: 0 });
  c.shape(h([[60, -136], [110, -214], [150, -120]]), fur, { angle: 80, over: 0 });
  c.tint(h([[86, -142], [110, -186], [130, -136]]), FLUSH, { wash: 0.8 });
  // the head: wide, flat on top, a heavy jaw
  c.shape(h([[-236, -10], [-220, -100], [-150, -140], [-20, -156], [110, -146], [190, -90], [214, 10], [180, 110], [80, 160], [-60, 166], [-170, 140], [-226, 80]]), fur, { angle: 80 + rot, over: 0.45 });
  c.tint(h([[-226, 60], [-170, 132], [-60, 150], [-40, 96], [-120, 70]]), CREAM, { wash: 0.9, angle: 20 });
  // the big square nose
  c.shape(h([[-262, -46], [-222, -60], [-150, -56], [-130, -20], [-140, 24], [-190, 40], [-250, 34], [-270, 0]]), NOSE, { over: 0, press: 1.2 }, { w: 3.5 });
  c.shine(h([[-238, -40], [-186, -42]]), 5);
  c.cheek(...H([70, 70]), 50 * s, 30 * s, FLUSH);
  if (mood === 'hmph') {
    // eyes shut tight, brows down, a pout
    c.stroke(h([[-120, -40], [-96, -26], [-70, -34]]), { w: 6 });
    c.stroke(h([[-10, -44], [24, -28], [60, -38]]), { w: 6.5 });
    c.stroke(h([[-140, -84], [-74, -62]]), { w: 9 });
    c.stroke(h([[-24, -80], [70, -96]]), { w: 10 });
    c.stroke(h([[-196, 104], [-162, 86], [-126, 88], [-106, 106]]), { w: 6 });
  } else {
    const e1 = H([-104, -30]), e2 = H([20, -34]);
    c.eye(e1[0], e1[1], 24 * s, 30 * s, EYE, { lid: 0.42, skin: fur, tilt: 18 + rot });
    c.eye(e2[0], e2[1], 32 * s, 38 * s, EYE, { lid: 0.42, skin: fur, tilt: -18 + rot });
    c.stroke(h([[-140, -86], [-76, -60]]), { w: 9 });
    c.stroke(h([[-26, -66], [60, -94]]), { w: 10 });
    c.stroke(h([[-196, 108], [-164, 90], [-128, 92], [-106, 110]]), { w: 6 });
    c.part('paupieres', { pivot: H([-40, -32]), motion: 'blink', extra: true }, () => {
      c.lid(e1[0], e1[1], 24 * s, 30 * s, fur);
      c.lid(e2[0], e2[1], 32 * s, 38 * s, fur);
    });
  }
  return H;
}

/**
 * A baby wombat (« petite boule bougonne »), turned to the left: a round little ball of brown-grey fur sitting on its
 * bottom, a big flat-topped head with a wide square nose and small pointed ears. Cross about everything: arms crossed,
 * nose in the air, eyes shut tight, a pout and red cheeks (« hmph »). A tuft of darker fur bristles on its head.
 */
export default {
  id: '067', slug: 'bougombat', seed: 6701, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const { FUR, DEEP, CREAM } = WOMBAT;

    // sitting on its round bottom, arms crossed, nose in the air: « hmph »
    c.part('ombre', { pivot: [520, 900], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      c.tint(potato(540, 904, 320, 46, 12, 0.03), '#ddd2c6', { wash: 0.9 });
    });
    shape(potato(330, 880, 70, 34, 8, 0.05), DEEP, { angle: 10 });
    shape([[340, 700], [370, 560], [460, 470], [600, 460], [710, 540], [760, 680], [740, 820], [640, 900], [480, 910], [370, 860]], FUR, { angle: 70, over: 0.45 });
    c.tint(potato(470, 730, 110, 140, 10, 0.06), CREAM, { wash: 0.6 });
    // near hind leg, the foot sticking out in front, sole up
    shape(band([[640, 800], [560, 860], [440, 890]], 140, 80), FUR, { angle: 20, over: 0.3 }, { w: 0.1 });
    stroke([[700, 820], [620, 900], [500, 924]], { w: 5 });
    shape(potato(420, 880, 56, 46, 9, 0.05), FUR, { angle: 80 });
    c.tint(potato(414, 886, 30, 24, 8, 0.05), CREAM, { wash: 0.8 });
    // arms crossed in front of the chest: the far forearm across, its elbow out at the left; the near arm down the flank
    // to its elbow, then its forearm over the other one, the paw resting at the far elbow
    shape(band([[400, 592], [520, 584], [640, 590]], 74, 64), DEEP, { angle: 20 });
    shape(potato(396, 594, 40, 38, 8, 0.05), DEEP, { angle: 20 });
    shape(band([[640, 520], [690, 590], [680, 652]], 92, 80), FUR, { angle: 80, over: 0.3 }, { w: 0.1 });
    stroke([[690, 520], [736, 590], [722, 664]], { w: 5 });
    shape(band([[700, 650], [580, 652], [470, 636]], 84, 72), FUR, { angle: 20, over: 0.3 });
    shape(potato(452, 630, 42, 36, 8, 0.05), FUR, { angle: 20 });
    for (const y of [618, 640]) stroke([[420, y], [438, y + 4]], { w: 3.5 });
    wombatHead(c, 470, 370, 0.98, -14, 'hmph', FUR);
  },
} satisfies Redraw;
