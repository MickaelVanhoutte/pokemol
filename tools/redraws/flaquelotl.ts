import type { P, Redraw } from './crayon.ts';
import { flankLeg, lineOfAction } from './anatomy.ts';
import { AXO, drop, frame, frond, pearl } from './gouttelotl.ts';

/**
 * Dragounet grown into a carefree teen dreamer, turned to the left: it leaps out of a puddle and floats a moment in the
 * rain, eyes shut in bliss, smiling, its gill-frills grown long and swept back like little wings, a pale web starting to
 * join them at their base (Dragopataud's wings to come). A longer body in one arc, a smaller head, its front legs
 * reaching for the landing and its hind legs kicking back, a finned tail streaming, the rain pearl on its brow.
 */
export default {
  id: '044', slug: 'flaquelotl', seed: 4402, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band } = c;
    const { PINK, DEEP, BELLY, FRILL, FRILL2, FIN } = AXO;

    /** The teen head round (hx, hy), `s` its size, tipped `rot` degrees: eyes shut in bliss, a wide smile. */
    const head = (hx: number, hy: number, s: number, rot: number, gills: [P, P, number][], far: [P, P, number][]) => {
      const { T, t } = frame(hx, hy, s, rot);
      for (const [a, b, bend] of far) frond(c, T(a), T(b), 56 * s, FRILL2, FRILL, bend, 2);
      shape(t([[-190, 16], [-180, -46], [-140, -96], [-60, -118], [50, -116], [140, -86], [184, -26], [186, 44], [150, 96], [60, 116], [-60, 110], [-150, 84]]), PINK, { angle: 96, over: 0.4 });
      c.tint(t([[-184, 36], [-136, 86], [-40, 108], [40, 100], [-20, 74], [-120, 56]]), BELLY, { angle: 60, wash: 0.7 });
      pearl(c, ...T([-40, -102]), 24 * s);
      // bliss, one emotion: eyes shut in happy arcs, the long axolotl smile
      stroke(t([[-140, -34], [-118, -54], [-96, -36]]), { w: 6 });
      stroke(t([[-40, -40], [-8, -66], [24, -40]]), { w: 7 });
      stroke(t([[-184, 28], [-130, 62], [-60, 72], [10, 56], [34, 30]]), { w: 5.5 });
      c.cheek(...T([62, 24]), 30 * s, 17 * s, '#f0668e');
      dot(...T([-172, -14]), 5, 4);
      c.part('branchies', { pivot: T([150, 0]), motion: 'swing', amp: 2.5, period: 2.8 }, () => {
        // the frills widened into a membrane sweeping back, a web joining them most of their length: the wings to come
        const [r0, r1, r2] = gills.map(([a]) => a), mid = (p: P, f: number): P => [r1[0] + (p[0] - r1[0]) * f, r1[1] + (p[1] - r1[1]) * f];
        shape(t([r0, mid(gills[0][1], 0.86), mid([(gills[0][1][0] + gills[1][1][0]) / 2, (gills[0][1][1] + gills[1][1][1]) / 2], 0.62), mid(gills[1][1], 0.86), mid([(gills[1][1][0] + gills[2][1][0]) / 2, (gills[1][1][1] + gills[2][1][1]) / 2], 0.62), mid(gills[2][1], 0.86), r2]), '#ee8db4', { angle: 40, over: 0.3 }, { w: 3.5 });
        for (const [a, b, bend] of gills) frond(c, T(a), T(b), 48 * s, FRILL2, FRILL, bend, 2);
      });
    };
    /** The finned tail along `spine`: a pale fin round the tapering tail. */
    const fin = (spine: P[], w: number) => shape(band(spine, w, 12), FIN, { angle: 30, over: 0 });

      // the leap: one S from the raised head over the arched back down to the tail flicking up, high over its puddle
      c.part('flaque', { pivot: [520, 900], motion: 'swing', amp: 1, period: 3, decor: true, behind: true }, () => {
        shape(c.potato(560, 924, 230, 38, 12, 0.04), AXO.RAIN, { angle: 0, over: 0, wash: 0.5 }, { w: 4 });
        stroke([[440, 922], [520, 912], [600, 918]], { w: 4, col: '#ffffff' });
        drop(c, 460, 856, 14);
        drop(c, 660, 846, 12);
      });
      const spine: P[] = [[340, 470], [430, 432], [530, 420], [620, 446], [700, 500], [770, 570], [850, 620], [940, 630], [1020, 590]];
      c.part('queue', { pivot: [770, 570], motion: 'swing', amp: 3, period: 2.8, behind: true }, () => fin(spine.slice(4), 220));
      // the far legs, darker, half hidden: the front one reaching forward, the hind one pushing back
      flankLeg(c, [470, 500], [300, 560], DEEP, 70);
      flankLeg(c, [690, 540], [880, 710], DEEP, 76);
      shape(lineOfAction(spine, [150, 200, 210, 190, 146, 104, 66, 36, 14], [0, 20, 26, 16, 0, 0, 0, 0, 0]), PINK, { angle: 20, over: 0.4 });
      c.tint(lineOfAction(spine.slice(0, 5).map(([x, y], i): P => [x - 6, y + [56, 74, 78, 70, 50][i]]), [40, 54, 54, 44, 26]), BELLY, { angle: 20, wash: 0.55 });
      // the near legs from the flank: the front one stretched forward for the landing, the hind one kicking back
      flankLeg(c, [430, 500], [236, 590], PINK, 96);
      flankLeg(c, [630, 510], [790, 730], PINK, 104);
      head(270, 360, 0.86, 14,
        [[[130, -64], [360, -230], -40], [[166, -14], [480, -80], -44], [[160, 52], [440, 110], -40]],
        [[[30, -104], [110, -320], -30], [[90, -100], [250, -290], -32]]);
  },
} satisfies Redraw;
