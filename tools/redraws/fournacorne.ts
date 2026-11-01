import type { Crayon, P, Redraw } from './crayon.ts';
import { COAT, CREAM, DEEP, EMBER, HOOF_FAR, NAVY, PINK, RED, YEL, hoof, limb } from './cornebraise.ts';

/**
 * Cornebraise grown into a proud, fierce fire bull, turned to the left and caught mid-leap as it charges: one diagonal from
 * its lowered horns up to its tail. A big shoulder hump over a deep chest, a lean waist, a hard round rump; the front
 * legs tucked under the chest, the hind legs flung back from the push. The calf's ember nubs have grown into two great
 * incandescent horns that stream fire back, and fire pours back out of the hump. A narrowed fierce eye under a hard
 * brow, a snort of smoke, and the family's blush. Deep red-brown, cream muzzle and belly, ember hooves and fire.
 */
const HEAD = '#84301f', BACK = '#6e2418', HOT = '#fff2b8';

/** A tongue of fire from `root`, streaming at `deg` (0 = up, 90 = right), `h` long, `w` wide, curling by `bend`. */
function blaze(c: Crayon, root: P, deg: number, h: number, w: number, bend = 0.12) {
  const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  const side = (sg: number, k: number) => Array.from({ length: 13 }, (_, i): P => {
    const t = i / 12, hw = (w / 2) * k * Math.min(1, 0.35 + t * 3) * Math.pow(1 - t, 0.6) * (1 + 0.38 * Math.sin(t * 13 + (sg > 0 ? 0 : 2)));
    const cx = root[0] + u[0] * h * t * (k < 1 ? 0.8 : 1) - v[0] * bend * h * t * t, cy = root[1] + u[1] * h * t * (k < 1 ? 0.8 : 1) - v[1] * bend * h * t * t;
    return [cx + v[0] * hw * sg, cy + v[1] * hw * sg];
  });
  const outline = (k: number): P[] => [...side(1, k), ...side(-1, k).reverse().slice(1)];
  c.shape(outline(1), YEL, { angle: deg + 90, over: 0 });
  c.tint(outline(0.78), '#ef6a28', { wash: 0.9 });
  c.tint(outline(0.5), RED, { wash: 0.85, press: 1.15 });
}

/** A great horn from its root along `path` (root first, sunk under the head), `w` wide: ember, then white-hot at the tip. */
function horn(c: Crayon, path: P[], w: number) {
  c.shape(c.band(path, w, 8), EMBER, { angle: 60, over: 0, press: 1.2 }, { w: 6 });
  const mid: P = [(path[0][0] + path[1][0]) / 2, (path[0][1] + path[1][1]) / 2];
  c.tint(c.band([path[0], mid], w * 0.95, w * 0.8), '#a3281a', { wash: 0.7 });
  c.tint(c.band(path.slice(2), w * 0.45, 5), YEL, { wash: 0.95 });
  c.tint(c.band(path.slice(-2), w * 0.2, 3), HOT, { wash: 1 });
  c.shine(path.slice(1, 4).map(([x, y]): P => [x - 6, y - 8]), 6);
}

export default {
  id: '081', slug: 'fournacorne', seed: 8101, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot } = c;
    // the bull is drawn level, then turned up by `rot` around (560, 600) into the leap
    const rot = -14, rr = (rot * Math.PI) / 180, K = 0.82;
    const R = ([x, y]: P): P => [570 + ((x - 560) * Math.cos(rr) - (y - 600) * Math.sin(rr)) * K, 520 + ((x - 560) * Math.sin(rr) + (y - 600) * Math.cos(rr)) * K];
    const r = (pts: P[]) => pts.map(R);

    // its shadow on the ground, far below the leap
    c.part('ombre', { pivot: [500, 920], motion: 'nod', amp: 1, period: 2.6, decor: true, behind: true }, () => {
      c.tint(c.potato(500, 920, 300, 24, 10, 0.05), '#cfc4b4', { wash: 0.6 });
    });
    // the tail streaming back in the line of the leap, a tongue of fire at its tip
    c.part('queue', { pivot: R([880, 500]), motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      const path = r([[870, 500], [930, 470], [980, 450]]);
      shape(c.band(path, 32, 14), COAT, { angle: 10, over: 0.2 });
      blaze(c, path[2], 76 + rot, 130, 66, 0.1);
    });
    // the far legs, darker: the front one folded under the chest, the hind one stretched back
    limb(c, r([[520, 680], [450, 770], [530, 806]]), [96, 50, 40], DEEP);
    hoof(c, R([530, 806]), -100 + rot, 50, HOOF_FAR);
    limb(c, r([[770, 600], [810, 690], [880, 730], [940, 744]]), [130, 64, 42, 38], DEEP);
    hoof(c, R([940, 744]), -100 + rot, 50, HOOF_FAR);
    // the body: a hump over a deep, round chest, a lean waist, a hard round rump
    shape(r([[300, 660], [292, 580], [326, 500], [390, 434], [460, 402], [534, 418], [620, 466], [720, 478], [800, 468], [862, 494], [896, 552], [884, 616], [840, 650], [770, 652], [690, 632], [610, 652], [530, 704], [440, 742], [360, 732], [314, 704]]),
      COAT, { angle: 15 + rot, over: 0.4 });
    c.tint(r([[370, 452], [460, 414], [540, 432], [600, 470], [500, 484], [420, 488]]), BACK, { wash: 0.7 });
    c.tint(c.band(r([[380, 724], [480, 704], [580, 664], [660, 640]]), 34, 12), CREAM, { angle: 10 + rot, wash: 0.85 });
    // the hump's fire: short tongues standing up off the crest of the hump, rooted in it (they sway slowly in battle)
    c.part('flammes-bosse', { pivot: R([520, 420]), motion: 'swing', amp: 2, period: 3 }, () => {
      blaze(c, R([590, 450]), 26, 150, 80, -0.1);
      blaze(c, R([470, 418]), 6, 190, 96, -0.12);
      blaze(c, R([530, 426]), 16, 180, 92, -0.1);
    });
    // the near hind leg flung back from the push: the big thigh, the stifle, the hock bending back, the cannon
    limb(c, r([[790, 580], [840, 680], [910, 724], [975, 736]]), [180, 76, 46, 40], COAT);
    hoof(c, R([975, 736]), -100 + rot, 54);
    // the near front leg reaching forward and down, leading the leap: forearm, knee, cannon, the hoof stretched out
    limb(c, r([[430, 660], [340, 740], [280, 790], [238, 830]]), [124, 62, 54, 44], COAT);
    hoof(c, R([238, 830]), 40 + rot, 56);

    // the head, low and leading, nearly in profile (one eye), on a thick neck
    const HK = K * 1.05, [hx, hy] = R([270, 560]), tilt = -22 + rot, ht = (tilt * Math.PI) / 180;
    const T = ([px, py]: P): P => [hx + (px * Math.cos(ht) - py * Math.sin(ht)) * HK, hy + (px * Math.sin(ht) + py * Math.cos(ht)) * HK];
    const t = (pts: P[]) => pts.map(T);
    // the thick neck and dewlap, from the chest up to the jaw and the poll
    shape([R([300, 470]), R([400, 440]), R([380, 600]), R([370, 740]), R([300, 730]), T([60, 110]), T([120, 40]), T([110, -60])], COAT, { angle: 70 + rot, over: 0.3 }, { w: 0.1 });
    stroke([R([370, 740]), R([300, 730]), T([60, 110])], { w: 5 });
    // the far horn, behind the head: out of the far side of the poll, curving out then forward at the foe
    horn(c, t([[-30, -70], [-40, -140], [-80, -196], [-150, -222], [-220, -206]]), 70);
    // the far ear
    shape(t([[80, -60], [150, -96], [164, -70], [112, -40]]), DEEP, { angle: 10 });
    // the head: a broad flat brow, a short broad square muzzle, a heavy jaw, darker than the body
    shape(t([[-160, 50], [-164, -10], [-140, -54], [-70, -84], [10, -96], [86, -82], [128, -36], [130, 34], [96, 86], [20, 110], [-70, 118], [-140, 104]]), HEAD, { angle: 70, over: 0.5 });
    c.shape(t([[-182, 92], [-186, 14], [-160, -16], [-110, -16], [-84, 24], [-86, 100], [-120, 130], [-170, 124]]), CREAM, { angle: 20, over: 0.2 }, { w: 0.1 });
    stroke(t([[-160, -16], [-186, 14], [-182, 92], [-170, 124], [-120, 130]]), { w: 5 });
    // the near ear, sticking out under the horn
    shape(t([[104, -30], [196, -50], [210, -16], [160, 6], [110, 6]]), HEAD, { angle: 10, over: 0.2 });
    c.tint(t([[126, -22], [186, -32], [190, -14], [134, -4]]), PINK, { wash: 0.55 });
    // the near horn: thick at its root on the side of the poll, curving out then forward at the foe, white-hot tip
    horn(c, t([[60, -50], [124, -96], [130, -170], [80, -232], [0, -262], [-90, -250]]), 96);
    // small flames licking at the horn tips only (they sway slowly in battle)
    c.part('pointes', { pivot: T([-60, -250]), motion: 'swing', amp: 2, period: 2.6 }, () => {
      blaze(c, T([-84, -252]), -46 + tilt + 30, 90, 46, 0.1);
      blaze(c, T([-212, -208]), -46 + tilt + 20, 70, 36, 0.1);
    });
    // proud and fierce: the eye open, the pupil low on its foe, the family's hard stubborn brow pulled down to the nose;
    // a wide nostril, a firm mouth; the lovable touch: the family's blush
    c.eye(...T([-36, -24]), 28, 32, NAVY, { lid: 0.08, skin: HEAD, tilt: tilt + 24 });
    stroke(t([[-92, -62], [-40, -64], [16, -92]]), { w: 11 });
    c.cheek(...T([44, 36]), 26, 15, PINK);
    dot(...T([-172, 34]), 13, 17, '#5a2e2a');
    stroke(t([[-176, 106], [-146, 114], [-112, 112]]), { w: 5 });
    c.part('paupieres', { pivot: T([-36, -24]), motion: 'blink', extra: true }, () => c.lid(...T([-36, -24]), 28, 32, HEAD));
  },
} satisfies Redraw;
