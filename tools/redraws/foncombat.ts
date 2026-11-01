import type { P, Redraw } from './crayon.ts';
import { lineOfAction } from './anatomy.ts';
import { WOMBAT } from './bougombat.ts';

/**
 * Bougombat grown into a bulldozer in a temper (« bulldozer en colère »), turned to the left: a stocky, low sandy-grey
 * wombat at full gallop, head down. A hard plate has grown into its brow, a crest of charcoal bristles stands up all
 * along the dark stripe of its spine, and its short tail-less rump is the round armoured plate of its kind. Dust flies
 * from its hind feet.
 */
export default {
  id: '068', slug: 'foncombat', seed: 6802, size: [1300, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const { FUR, DEEP, LIGHT, CREAM, CREST, NOSE, FLUSH, CLAW, EYE, STRIPE } = WOMBAT;
    const PLATE = '#8a8174', RIDGE = '#5e574e', DUST = '#e4dccc', DUSTLINE = '#b0a694';
    const lerp = (a: P, b: P, f: number): P => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

    /** A paw at the end of a leg, along the leg's last segment (from `a` to `b`), `w` wide, three pale claws at its tip. */
    const paw = (a: P, b: P, w: number, col: string) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, u: P = [dx / l, dy / l], n: P = [-u[1], u[0]];
      const at = (f: number, k: number): P => [b[0] + u[0] * f * w + n[0] * k * w, b[1] + u[1] * f * w + n[1] * k * w];
      shape([at(-0.3, -0.5), at(0.4, -0.55), at(0.8, -0.3), at(0.85, 0.3), at(0.4, 0.55), at(-0.3, 0.5)], col, { angle: 20, over: 0 });
      for (const k of [-0.32, 0, 0.32]) shape([at(0.74, k - 0.1), at(1.15, k), at(0.74, k + 0.1)], CLAW, { over: 0 }, { w: 3 });
    };
    /** A leg through its `joints` (hip or shoulder first), `w` wide at the top; the near ones keep their line open on the body. */
    const leg = (joints: P[], w: number, near: boolean) => {
      const ws = joints.map((_, i) => w * (1 - (0.55 * i) / (joints.length - 1)));
      const pts = lineOfAction(joints, ws);
      if (near) {
        shape(pts, FUR, { angle: 70, over: 0.3 }, { w: 0.1 });
        const n = pts.length / 2;
        stroke(pts.slice(1, n), { w: 5 });
        stroke(pts.slice(n, 2 * n - 1), { w: 5 });
      } else shape(pts, DEEP, { angle: 70 });
      paw(joints[joints.length - 2], joints[joints.length - 1], ws[ws.length - 1] * 0.95, near ? FUR : DEEP);
    };

    // mid-gallop: the near front paw planted under the chin, the far one swinging back; the near hind leg pushing off, the
    // far one coming forward under the belly
    const farFront: P[] = [[620, 690], [660, 790], [630, 846], [586, 836]];
    const farHind: P[] = [[900, 700], [850, 800], [800, 836], [760, 874]];
    const nearFront: P[] = [[560, 660], [520, 790], [470, 860], [404, 878]];
    const nearHind: P[] = [[960, 660], [1000, 770], [1080, 790], [1140, 876]];

    // the ground and the dust kicked up behind (scenery)
    c.part('poussiere', { pivot: [1150, 860], motion: 'swing', amp: 1, period: 2.4, decor: true, behind: true }, () => {
      c.tint(potato(720, 900, 480, 34, 12, 0.03), '#ddd6ca', { wash: 0.9 });
      for (const [x, y, r] of [[1230, 840, 46], [1290 - 30, 790, 32], [1180, 880, 30]] as const) shape(potato(x, y, r * 1.25, r, 9, 0.08), DUST, { angle: 10, over: 0, wash: 0.5 }, { w: 3.5, col: DUSTLINE });
      for (const [x, y, l] of [[1120, 380, 110], [1150, 450, 80]] as const) stroke([[x, y], [x + l, y - 4]], { w: 5, col: DUSTLINE });
    });
    leg(farFront, 124, false);
    leg(farHind, 136, false);

    // the crest: bundles of stiff charcoal bristles standing up along the spine, leaning back (it bristles)
    const back: P[] = [[470, 520], [540, 450], [630, 412], [730, 400], [830, 404], [920, 418], [1000, 450]];
    c.part('crete', { pivot: [740, 400], motion: 'swing', amp: 2, period: 2.6, behind: true }, () => {
      back.forEach(([x, y], i) => {
        const h = [54, 84, 100, 96, 84, 66, 46][i];
        for (const [dx, k, lean] of [[-14, 0.8, 18], [0, 1, 30], [14, 0.85, 40]] as const) {
          const tip: P = [x + dx + lean, y - h * k];
          shape([[x + dx - 12, y + 24], lerp([x + dx - 10, y], tip, 0.6), tip, lerp([x + dx + 12, y], tip, 0.55), [x + dx + 12, y + 24]], CREST, { angle: 70, over: 0 }, { w: 3.5 }, false);
        }
      });
    });
    // the body: stocky and low, a big shoulder, a short tail-less rump
    const body: P[] = [[400, 700], [420, 590], [480, 500], [580, 430], [700, 404], [840, 404], [960, 430], [1050, 490], [1090, 590], [1070, 690], [1000, 750], [880, 770], [740, 760], [600, 770], [470, 760]];
    shape(body, FUR, { angle: 30, over: 0.45, press: 1.1 });
    // the dark stripe down its spine
    c.tint([[500, 500], [590, 446], [700, 420], [840, 420], [960, 446], [1040, 500], [1000, 520], [900, 470], [760, 452], [620, 470], [520, 520]], STRIPE, { angle: 20, wash: 0.9 });
    c.tint([[460, 720], [600, 750], [760, 740], [880, 750], [760, 720], [600, 720]], LIGHT, { wash: 0.7 });
    // the hard rump plate: its whole back end, a round shield of horn edged with growth ridges
    c.tint([[1000, 470], [1050, 500], [1090, 590], [1070, 690], [1010, 740], [990, 640], [980, 540]], PLATE, { angle: 80, wash: 0.95, press: 1.1 });
    stroke([[990, 470], [970, 560], [980, 660], [1010, 740]], { w: 5 });
    for (const k of [0, 1]) stroke([[1010 + k * 30, 500 + k * 14], [1000 + k * 30, 600], [1016 + k * 26, 700 - k * 20]], { w: 3.5, col: RIDGE });
    // the big shoulder and the haunch, soft curves in the fur
    stroke([[620, 470], [580, 560], [560, 640]], { w: 4.5, col: DEEP });
    stroke([[930, 500], [900, 590], [920, 650]], { w: 4.5, col: DEEP });
    leg(nearFront, 160, true);
    leg(nearHind, 172, true);

    // the head, lowered to charge: broad and flat on top, the wide nose pad as the front of its snout, the brow plate grown
    // into the skull
    const [hx, hy, hs, hr] = [330, 640, 0.86, -10];
    const r = (hr * Math.PI) / 180;
    const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * hs, hy + (x * Math.sin(r) + y * Math.cos(r)) * hs];
    const h = (pts: P[]) => pts.map(H);
    // small rounded ears set wide on the flat top
    shape(potato(...H([-30, -160]), 30 * hs, 34 * hs, 9, 0.05), DEEP, { angle: 80, over: 0 });
    shape(potato(...H([110, -150]), 38 * hs, 42 * hs, 9, 0.05), FUR, { angle: 80, over: 0 });
    c.tint(potato(...H([112, -144]), 18 * hs, 22 * hs, 8, 0.05), FLUSH, { wash: 0.8 });
    // the skull: flat top, a heavy jaw, a short square snout
    shape(h([[-150, -120], [-60, -156], [80, -158], [170, -120], [210, -30], [200, 60], [150, 130], [40, 160], [-80, 150], [-170, 120], [-216, 76], [-220, -20], [-196, -80]]), FUR, { angle: 80 + hr, over: 0.45 });
    c.tint(h([[-210, 80], [-160, 128], [-60, 140], [-40, 100], [-130, 80]]), CREAM, { wash: 0.9, angle: 20 });
    // the brow plate: the forehead itself hardened, a darker horn tone with growth ridges, its lower edge the frown
    c.tint(h([[-196, -78], [-150, -120], [-60, -150], [60, -150], [100, -116], [40, -92], [-60, -80], [-150, -60]]), PLATE, { angle: 10 + hr, wash: 0.95, press: 1.1 });
    for (const k of [0.35, 0.65]) stroke(h([[-180 + 30 * k, -70 - 50 * k], [-60, -86 - 60 * k], [70 - 20 * k, -100 - 40 * k]]), { w: 3.5, col: RIDGE });
    // the wide square nose pad: the whole front of the snout, two nostrils
    shape(h([[-226, -44], [-178, -60], [-146, -40], [-140, 20], [-160, 56], [-226, 52], [-240, 4]]), NOSE, { angle: 90, over: 0, press: 1.15 }, { w: 3.5 });
    for (const y of [-14, 26]) stroke(h([[-222, y], [-204, y + 6]]), { w: 4, col: '#6a6470' });
    // fury, one emotion: eyes narrowed to slits of light under the brow, the brow slanting down to the nose, teeth gritted
    const e1 = H([-100, -36]), e2 = H([20, -44]);
    c.eye(e1[0], e1[1], 22 * hs, 26 * hs, EYE, { lid: 0.5, skin: PLATE, tilt: 32 + hr });
    c.eye(e2[0], e2[1], 30 * hs, 34 * hs, EYE, { lid: 0.5, skin: PLATE, tilt: -32 + hr });
    stroke(h([[-150, -78], [-110, -66], [-66, -48]]), { w: 9 });
    stroke(h([[-6, -56], [30, -76], [76, -88]]), { w: 10 });
    shape(h([[-196, 86], [-120, 80], [-100, 104], [-184, 114]]), '#ffffff', { over: 0, wash: 1 }, { w: 4.5 });
    stroke(h([[-190, 98], [-108, 94]]), { w: 3 });
    c.cheek(...H([90, 40]), 46 * hs, 28 * hs, FLUSH);
    c.part('paupieres', { pivot: H([-40, -40]), motion: 'blink', extra: true }, () => {
      c.lid(e1[0], e1[1], 22 * hs, 26 * hs, PLATE);
      c.lid(e2[0], e2[1], 30 * hs, 34 * hs, PLATE);
    });
  },
} satisfies Redraw;
