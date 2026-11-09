import type { Redraw } from './crayon.ts';
import { limb, pandaHead, ring, tailBand } from './pandaKit.ts';

/**
 * Pandiva, the star (« la star »): Pandoudou redrawn with every pencil in the box at once. It stands up on its short dark
 * hind legs like a red panda,
 * the hip cocked, a paw on its hip, the other fluffing its cheek, chin up and eyes shut with
 * pleasure; its tail arches over its head like a spotlight, each ring the colour of another pencil.
 */
export default {
  id: '129', slug: 'pandiva', seed: 1291, size: [1000, 1000], tilt: 0,
  draw(c) {
    const FUR = '#f08fb0', DEEP = '#c41f58', CREAM = '#fff4ee', PINK = '#e03a64', LEG = '#8a2e56';
    const RINGS = ['#e8352e', '#f28a1e', '#f6cf1e', '#3fae4a', '#2f7fd6', '#8a4fd0'];

    c.part('queue', { pivot: [700, 780], motion: 'swing', amp: 2, period: 3, behind: true }, () => {
      const { sp, ws, out } = tailBand([[700, 790], [850, 720], [900, 540], [840, 350], [700, 230], [520, 190], [380, 230], [300, 320], [290, 400], [330, 420], [350, 390]], (t) => 104 + Math.sin(t * Math.PI) * 40 - (t > 0.86 ? (t - 0.86) * 500 : 0), 66);
      c.shape(out, FUR, { angle: 40, over: 0.4 }, { w: 0.1 });
      // each ring another pencil's colour, in rainbow order
      RINGS.forEach((col, r) => c.tint(ring(sp, ws, r, RINGS.length, 0.1, 0.94), col, { angle: 70, wash: 1, press: 1.2 }));
      c.stroke([...out, out[0], out[1]], { w: 5 });
    });
    // the far leg behind, short and dark like a red panda's, the far arm up fluffing its cheek
    limb(c, [[650, 830], [676, 900], [686, 932]], [92, 70, 60], LEG);
    c.shape(c.potato(668, 942, 50, 22, 8, 0.05), LEG, { angle: 10 });
    limb(c, [[600, 500], [672, 446], [628, 404]], [70, 58, 50], LEG);
    // the body standing up like a red panda's: a pear, narrow at the waist, the hip pushed out to the right
    c.shape([[450, 480], [520, 452], [600, 470], [640, 540], [636, 620], [680, 690], [712, 780], [690, 856], [610, 890], [520, 882],
      [470, 836], [462, 756], [486, 680], [474, 600], [448, 540]], FUR, { angle: 80, over: 0.5 });
    c.tint(c.potato(530, 600, 50, 96, 10, 0.08), CREAM, { angle: 80, wash: 0.8 });
    // the near leg, short and dark, the foot pointing forward
    limb(c, [[540, 850], [530, 908], [522, 934]], [96, 74, 62], LEG);
    c.shape(c.potato(500, 944, 56, 22, 8, 0.05), LEG, { angle: 10 });
    // the near arm on its hip: the elbow well out in front, the paw back on the hip
    limb(c, [[500, 520], [404, 610], [470, 690]], [74, 60, 52], FUR);
    limb(c, [[440, 650], [470, 690]], [56, 52], LEG);
    c.shape(c.potato(486, 700, 32, 26, 8, 0.05), LEG, { over: 0 });
    pandaHead(c, { fur: FUR, deep: DEEP, cream: CREAM, pink: PINK }, 470, 400, 0.68, 20, 'diva');
    // the far paw resting against its cheek fluff, the wrist bent
    c.shape(c.potato(596, 398, 30, 24, 8, 0.05), LEG, { over: 0 });
  },
} satisfies Redraw;
