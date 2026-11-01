import type { P, Redraw } from './crayon.ts';

/**
 * A big brown bear (« gros dormeur grognon »), turned to the left and seen a little from above, sprawled flat on its
 * belly heavy as a hill, fast asleep: front paws flat on either side of its head, its short hind legs splayed out, its chin on the ground,
 * snoring with its mouth a little open and one ear flicked. Even asleep it frowns: wake it and it grumbles.
 */
export default {
  id: '008', slug: 'grognours', seed: 811, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato, band } = c;
    const FUR = '#a8683a', DEEP = '#8a5230', LIGHT = '#c08452', CREAM = '#f4dfb6', HONEY = '#f2b632', NOSE = '#3a2a2a';
    const MOUTH = '#8a2e44', PINK = '#f29ab0', SHADOW = '#ddd2c6', BUBBLE = '#d8f2ff';

    /** A paw lying flat at (x, y), its blunt honey claws pointing along `deg` (0 = left), `s` its size. */
    const flatPaw = (x: number, y: number, deg: number, s: number, col: string) => {
      const r = (deg * Math.PI) / 180, u: P = [-Math.cos(r), -Math.sin(r)], v: P = [-u[1], u[0]];
      const at = (f: number, k: number): P => [x + (u[0] * f + v[0] * k) * s, y + (u[1] * f + v[1] * k) * s];
      for (const k of [-30, -10, 10, 30]) shape([at(40, k - 8), at(68, k - 5), at(72, k + 3), at(40, k + 8)], HONEY, { over: 0 }, { w: 3.5 });
      shape(potato(x, y, 58 * s, 42 * s, 9, 0.05), col, { angle: 20, over: 0.2 });
      for (const k of [-14, 14]) stroke([at(46, k), at(28, k)], { w: 4 });
    };
    /** A hind foot stretched out behind, its cream sole turned up, at (x, y). */
    const sole = (x: number, y: number, s: number, col: string) => {
      shape(potato(x, y, 50 * s, 62 * s, 9, 0.05), col, { angle: 80 });
      c.tint(potato(x - 2 * s, y + 6 * s, 28 * s, 34 * s, 8, 0.05), CREAM, { wash: 0.8 });
      for (const [dx, dy] of [[-28, -46], [-6, -56], [18, -50]] as P[]) c.tint(potato(x + dx * s, y + dy * s, 10 * s, 9 * s, 6, 0.05), CREAM, { wash: 0.8 });
    };

    // the ground under it (scenery)
    c.part('ombre', { pivot: [560, 760], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      c.tint(potato(580, 780, 500, 130, 14, 0.03), SHADOW, { wash: 0.9 });
    });
    // the far legs, short and thick: the hind foot's sole turned up behind, the front paw flat beyond its head
    shape(band([[900, 430], [980, 380], [1010, 366]], 116, 100), DEEP, { angle: 20 });
    sole(1030, 356, 0.88, DEEP);
    shape(band([[440, 500], [340, 470], [250, 462]], 104, 90), DEEP, { angle: 10 });
    flatPaw(220, 460, 4, 0.9, DEEP);
    // the body lying flat but heavy: one broad rounded back from the shoulders to the rump, its fur tousled from sleep
    // (shaggy tufts all along the top), a paler back
    const back = c.spikes([[420, 460], [520, 362], [640, 316], [760, 300], [870, 318], [950, 372], [995, 470]], 1, 26);
    shape([[360, 600], ...back, [985, 600], [900, 700], [740, 770], [560, 790], [420, 780], [360, 700]], FUR, { angle: 30, over: 0.5, press: 1.1 });
    c.tint([[540, 400], [640, 346], [760, 330], [870, 346], [930, 390], [820, 410], [660, 420]], LIGHT, { wash: 0.7 });
    for (const [x, y, k] of [[620, 450, 1], [760, 420, -1], [850, 520, 1], [700, 560, -1]] as const) stroke([[x, y], [x + 18 * k, y - 22], [x + 6 * k, y - 40]], { w: 3.5, col: DEEP }, false);
    // the near legs, short and thick: the hind leg splayed back by the rump, the front leg beside its chin
    shape(band([[860, 680], [960, 730], [1000, 746]], 126, 110), FUR, { angle: 20 });
    sole(1030, 756, 0.95, FUR);
    shape(band([[600, 740], [520, 810], [470, 846]], 126, 110), FUR, { angle: 10 });
    // the far ear, then the near ear flicked back (it twitches in its sleep)
    shape(potato(300, 470, 44, 42, 9, 0.05), DEEP, { angle: 70, over: 0 });
    c.part('oreille', { pivot: [450, 520], motion: 'swing', amp: 6, period: 2.8, behind: true }, () => {
      shape(potato(480, 486, 52, 44, 9, 0.05), FUR, { angle: 70, over: 0 });
      c.tint(potato(482, 490, 26, 22, 8, 0.05), CREAM, { wash: 0.8 });
    });
    // the round head, its forehead flowing straight down into the muzzle, the chin on the ground
    shape([[230, 560], ...c.spikes([[280, 500], [380, 470], [470, 500]], 1, 26), [520, 580], [510, 670], [450, 740], [340, 780], [220, 790], [140, 770], [110, 720], [130, 670], [180, 620]], FUR, { angle: 60, over: 0.45 });
    // the muzzle: a smooth cream oval, the nose at its tip
    c.tint(potato(200, 720, 104, 64, 12, 0.03), CREAM, { wash: 0.95, angle: 20 });
    stroke([[300, 690], [290, 740], [250, 778]], { w: 4.5 });
    shape(potato(132, 704, 30, 22, 8, 0.05), NOSE, { over: 0, press: 1.2 }, { w: 3.5 });
    c.shine([[122, 696], [136, 692]], 4);
    // snoring: the mouth a little open on the ground, under the nose
    shape(potato(176, 766, 24, 13, 8, 0.05), MOUTH, { over: 0, press: 1.2 }, { w: 4 });
    // asleep, eyes shut, but frowning: brows pulled down to the snout
    stroke([[330, 606], [352, 622], [382, 622], [400, 606]], { w: 6 });
    stroke([[232, 616], [248, 630], [272, 628]], { w: 5.5 });
    stroke([[318, 566], [396, 586]], { w: 8 });
    stroke([[224, 580], [274, 594]], { w: 7 });
    c.cheek(420, 676, 32, 18, PINK);
    // the near front paw flat on the ground beside its chin
    flatPaw(450, 862, -6, 1.05, FUR);
    // the snore: a bubble at its nose and two « z » drifting up (scenery)
    c.part('bulle', { pivot: [100, 680], motion: 'throw', to: [-6, -4], shrink: 0.6, period: 3, decor: true }, () => {
      shape(potato(90, 666, 26, 24, 10, 0.02), BUBBLE, { over: 0, wash: 0.25, press: 0.6 }, { w: 2.5, col: '#7a94bc' });
      c.shine([[78, 658], [86, 650]], 4);
    });
    c.part('zzz', { pivot: [320, 300], motion: 'swing', amp: 4, period: 3, decor: true }, () => {
      for (const [x, y, k] of [[260, 330, 1], [340, 240, 0.75]] as const) stroke([[x, y], [x + 50 * k, y], [x, y + 50 * k], [x + 50 * k, y + 50 * k]], { w: 6 * k + 1, col: DEEP }, false);
    });
  },
} satisfies Redraw;
