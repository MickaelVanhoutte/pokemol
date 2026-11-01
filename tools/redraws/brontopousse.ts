import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * A dreamy baby long-neck (Grass/Dragon), turned to the left: lying in the grass, a round hump of a body, its thick neck
 * rising from the shoulders and curving down in a gentle S to its big head, the jaw resting on its two stacked front paws.
 * Its big shiny eyes are rolled up at the little sprout growing on its head. The tail curls up behind, and three little
 * closed buds sit along its back: the grove it will carry one day (Sylvasaure).
 */
export default {
  id: '123', slug: 'brontopousse', seed: 12301, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const GREEN = '#7cc850', DEEP = '#5ea63c', BELLY = '#eef6d0', LEAF = '#4fa83a', VEIN = '#2f7a26';
    const BUD = '#b4e26a', COLLAR = '#3f8a2e', NAVY = '#2e2656';

    /** Maps (across, up) from `base` along `deg` (0 = up, clockwise), scaled by `s`. */
    const along = (base: P, deg: number, s: number) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      return ([px, py]: P): P => [base[0] + (v[0] * px + u[0] * py) * s, base[1] + (v[1] * px + u[1] * py) * s];
    };
    /** A small pointed leaf from `base` along `deg`, `len` long. */
    const leaf = (base: P, deg: number, len: number) => {
      const at = along(base, deg, len / 100);
      shape([at([0, -6]), at([-30, 30]), at([-24, 70]), at([0, 100]), at([24, 66]), at([28, 28])], LEAF, { angle: deg + 90, over: 0 });
      stroke([at([0, 4]), at([0, 80])], { w: 3, col: VEIN });
    };
    /** A closed leaf bud sunk in the back at `base`, leaning `deg`, `s` its size: a round bud in a darker collar. */
    const bud = (base: P, deg: number, s: number) => {
      const at = along(base, deg, s);
      shape([at([0, 0]), at([-26, 26]), at([-24, 58]), at([0, 84]), at([22, 60]), at([26, 26])], BUD, { angle: deg + 80, over: 0 });
      stroke([at([-4, 40]), at([2, 76])], { w: 3, col: VEIN });
      shape([at([-34, -6]), at([-36, 20]), at([-14, 34]), at([0, 18]), at([14, 34]), at([36, 20]), at([34, -6])], COLLAR, { angle: deg + 30, over: 0 }, { w: 3.5 }, false);
    };
    /** A round stubby paw seen from the front, its toes pointing to the left. */
    const paw = (x: number, y: number, w: number, col: string) => {
      shape(potato(x, y, w, w * 0.56, 8, 0.04), col, { angle: 10 });
      for (const d of [-0.62, -0.24]) stroke([[x + d * w, y + 4], [x + d * w + 2, y + w * 0.46]], { w: 3.5 });
    };

    // the tail curled up behind the hump (it sways in battle)
    c.part('queue', { pivot: [860, 760], motion: 'swing', amp: 4, period: 2.8, behind: true }, () => {
      shape(band([[840, 790], [920, 760], [956, 680], [934, 610], [884, 600], [870, 646]], 112, 30), GREEN, { angle: 40, over: 0.3 });
    });
    // the far hind foot and the far front leg, darker, its paw peeking behind the near one
    paw(830, 904, 44, DEEP);
    shape(band([[560, 880], [430, 890], [300, 890]], 64, 56), DEEP, { angle: 10 });
    paw(262, 894, 48, DEEP);
    // the body and the neck in one outline: the back runs in one curve from the back of the head, up the neck, over the
    // hump and down to the rump; under the neck, air
    const body: P[] = [[320, 664], [366, 628], [440, 600], [520, 562], [590, 512], [660, 482], [740, 470], [820, 500], [876, 580], [900, 690], [876, 800], [800, 880], [690, 908], [580, 906], [520, 884], [504, 830], [476, 776], [424, 752], [372, 748], [330, 728]];
    shape(body, GREEN, { angle: 25, over: 0.4 });
    c.tint(potato(680, 880, 170, 30, 10, 0.05), BELLY, { angle: 10, wash: 0.75 });
    // three closed buds of different sizes along the back, sunk in the skin
    bud([630, 488], -14, 0.9);
    bud([720, 480], 6, 1.1);
    bud([812, 518], 34, 0.75);
    // the near hind leg folded on the flank: the round haunch, the foot forward on the ground
    openLimb(c, [[720, 700], [690, 770], [700, 850], [714, 880], [800, 900], [860, 880], [872, 800], [846, 720], [790, 680]], GREEN, 1, 8);
    paw(714, 904, 52, GREEN);
    // the near front leg along the ground, its paw stacked over the far one
    const arm = band([[600, 870], [460, 866], [330, 852]], 70, 60);
    shape(arm, GREEN, { angle: 10 }, { w: 0.1 });
    stroke(arm.slice(1, 3), { w: 5 });
    stroke(arm.slice(3, 5), { w: 5 });
    paw(300, 850, 54, GREEN);

    // the big baby head, the jaw resting on its paws; the sprout on top (it sways in battle)
    const [hx, hy, s] = [212, 716, 0.86];
    const H = ([x, y]: P): P => [hx + x * s, hy + y * s];
    const h = (pts: P[]) => pts.map(H);
    c.part('pousse', { pivot: H([40, -118]), motion: 'swing', amp: 4, period: 2.6, behind: true }, () => {
      const top = H([0, -236]);
      shape(band([H([30, -100]), H([16, -176]), top], 18, 10), LEAF, { angle: 80 });
      leaf(top, -70, 104);
      leaf(top, 50, 94);
    });
    shape(h([[-196, 34], [-190, -20], [-144, -62], [-60, -102], [30, -124], [120, -100], [162, -30], [158, 46], [112, 104], [20, 128], [-90, 120], [-170, 86]]), GREEN, { angle: 78, over: 0.45 });
    c.tint(h([[-190, 50], [-150, 92], [-60, 118], [-40, 86], [-120, 66]]), BELLY, { angle: 60, wash: 0.75 });
    // dreamy: big open eyes, the pupils rolled up at the sprout, two shines; no brows; a tiny content smile under them
    const eye = (x: number, y: number, rx: number, ry: number) => {
      shape(potato(x, y, rx, ry, 10, 0.03), '#fffaf0', { over: 0, wash: 1 }, { w: 3.5 });
      dot(x + rx * 0.06, y - ry * 0.3, rx * 0.72, ry * 0.62, NAVY);
      dot(x - rx * 0.22, y - ry * 0.52, rx * 0.26, ry * 0.2, '#ffffff');
      dot(x + rx * 0.3, y - ry * 0.08, rx * 0.11, ry * 0.09, '#ffffff');
    };
    const e1 = H([-86, -22]), e2 = H([16, -28]);
    eye(e1[0], e1[1], 30 * s, 38 * s);
    eye(e2[0], e2[1], 40 * s, 50 * s);
    dot(...H([-180, 8]), 7 * s, 5 * s);
    stroke(h([[-80, 52], [-52, 66], [-22, 54]]), { w: 5 });
    c.cheek(...H([30, 50]), 28 * s, 17 * s);
    c.part('paupieres', { pivot: H([-30, -26]), motion: 'blink', extra: true }, () => {
      c.lid(e1[0], e1[1], 30 * s, 38 * s, GREEN);
      c.lid(e2[0], e2[1], 40 * s, 50 * s, GREEN);
    });
  },
} satisfies Redraw;
