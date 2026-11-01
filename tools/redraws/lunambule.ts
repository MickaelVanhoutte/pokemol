import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';
import { GALA, frame, moonEye, moonTail, twinkle } from './lunou.ts';

/** One side's spread limbs: shoulder, elbow, wrist of the arm; hip, knee, ankle of the leg. */
interface Spread { shoulder: P; elbow: P; wrist: P; hip: P; knee: P; ankle: P }

/**
 * The gliding membrane, grown out of Lunou's skin fold: rooted along the side of the torso from `root0` (behind the
 * shoulder) to `root1` (before the hip), stretched out to the wrist and the ankle. Its trailing edge curves in softly
 * between them (`bulge`) in three soft lobes, a flying squirrel's sail, never a bat's fingers. Lavender fur at the body
 * deepening to the night sky at the edge, a few stars at (t along it, k out from the body).
 */
function membrane(c: Crayon, root0: P, root1: P, wrist: P, ankle: P, bulge: number, stars: [number, number, number][], dim = false) {
  const N = 24, ts = Array.from({ length: N + 1 }, (_, i) => i / N);
  const em: P = [(wrist[0] + ankle[0]) / 2, (wrist[1] + ankle[1]) / 2], rm: P = [(root0[0] + root1[0]) / 2, (root0[1] + root1[1]) / 2];
  const il = Math.hypot(rm[0] - em[0], rm[1] - em[1]), inw: P = [(rm[0] - em[0]) / il, (rm[1] - em[1]) / il];
  const R = (t: number): P => [root0[0] + (root1[0] - root0[0]) * t, root0[1] + (root1[1] - root0[1]) * t];
  const E = (t: number): P => {
    const pull = Math.sin(Math.PI * t) * (bulge + bulge * 0.45 * (1 - Math.abs(Math.sin(3 * Math.PI * t))));
    return [wrist[0] + (ankle[0] - wrist[0]) * t + inw[0] * pull, wrist[1] + (ankle[1] - wrist[1]) * t + inw[1] * pull];
  };
  const at = (t: number, k: number): P => { const r = R(t), e = E(t); return [r[0] + (e[0] - r[0]) * k, r[1] + (e[1] - r[1]) * k]; };
  const edge = ts.map(E);
  const layers: [number, string, number][] = dim
    ? [[0, GALA.DEEP, 0.9], [0.4, '#1e1a56', 1]]
    : [[0, GALA.FUR, 0.9], [0.22, '#8e82d0', 0.9], [0.4, GALA.NIGHT2, 1], [0.6, GALA.NIGHT, 1]];
  for (const [k0, col, wash] of layers) {
    c.shape([...ts.map((t) => at(t, k0)), ...edge.slice().reverse()], col, { angle: 25, over: k0 > 0.5 ? 0.5 : 0.2, press: 1.15, wash }, { w: 0.1 });
  }
  c.stroke(edge, { w: 4.5 });
  for (const [t, k, r] of stars) twinkle(c, ...at(t, k), r, r * 7);
}

/** A bent arm and leg: a tapering limb through the elbow or knee, a small open hand or a long open foot at its end. */
function limbs(c: Crayon, g: Spread, col: string, s = 1) {
  const { shoulder, elbow, wrist, hip, knee, ankle } = g;
  openLimb(c, c.band([shoulder, elbow, wrist], 64 * s, 30 * s), col, 0, 3);
  openLimb(c, c.band([hip, knee, ankle], 90 * s, 32 * s), col, 0, 3);
  /** A small open hand at `p` along `dir` (degrees): a little palm, three thin fingers spread. */
  const hand = (p: P, dir: number, len: number, w: number) => {
    c.shape(c.potato(p[0], p[1], w, w * 0.8, 8, 0.05), col, { angle: dir });
    for (const d of [-32, 0, 32]) {
      const a = ((dir + d) * Math.PI) / 180, tip: P = [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len];
      c.shape(c.band([p, tip], w * 0.55, w * 0.42), col, { angle: dir }, { w: 3 });
    }
  };
  const ang = (a: P, b: P) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  hand(wrist, ang(elbow, wrist), 40 * s, 17 * s);
  hand(ankle, ang(knee, ankle), 50 * s, 20 * s);
}

/**
 * Lunou grown up, dreamy and serene (« rêveur serein »), turned to the left: a long, slim galago gliding level between
 * the trees at night, arms and legs spread out wide. The little fold of its flank has grown into a gliding membrane from
 * wrist to ankle, lavender fur at the body deepening to a piece of the night sky at the edge, a few stars in it. Its head
 * is tipped right back to gaze, content, at the glowing round tip of its own long tail, which arcs over its whole back
 * like a little moon. Ears swept back by the wind, calm moon eyes, a small smile.
 */
export default {
  id: '028', slug: 'lunambule', seed: 2811, size: [1200, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot } = c;
    const { FUR, DEEP, BELLY, RIM, NOSE, CHEEK } = GALA;
    const far: Spread = { shoulder: [520, 450], elbow: [530, 400], wrist: [560, 350], hip: [740, 476], knee: [790, 446], ankle: [850, 410] };
    const near: Spread = { shoulder: [470, 540], elbow: [330, 690], wrist: [170, 740], hip: [730, 580], knee: [860, 730], ankle: [990, 840] };

    // the tail, arcing up over its whole back, its round tip glowing like a little moon above its face
    c.part('queue', { pivot: [770, 530], motion: 'swing', amp: 2, period: 3.4, behind: true }, () =>
      moonTail(c, [[770, 530], [900, 450], [930, 300], [840, 170], [660, 100], [460, 100], [300, 150], [210, 210]], 48, 64, 62));
    // the far side: only its hand and foot and a sliver of sky peeking over the back
    c.part('voile-loin', { pivot: [640, 450], motion: 'fold', amp: 2, period: 3.6, behind: true }, () => {
      membrane(c, [540, 470], [730, 490], far.wrist, far.ankle, 18, [], true);
      limbs(c, far, DEEP, 0.7);
    });

    // a slim but shaped torso: a deep chest, a narrower waist, a round hip
    shape(lineOfAction([[380, 470], [470, 500], [590, 540], [690, 552], [780, 548]], [140, 168, 136, 150, 110], [10, 26, 6, 18, 0]), FUR, { angle: 20, over: 0.4 });
    c.tint(lineOfAction([[430, 548], [520, 572], [620, 584]], [40, 50, 30]), BELLY, { angle: 20, wash: 0.8 });
    // the near membrane, grown from the side of the torso, big and in front (it folds slowly in battle)
    c.part('voile', { pivot: [600, 570], motion: 'fold', amp: 2, period: 3.6 }, () =>
      membrane(c, [490, 552], [730, 578], near.wrist, near.ankle, 40, [[0.28, 0.78, 20], [0.52, 0.86, 26], [0.74, 0.72, 15]]));
    limbs(c, near, FUR);

    // its own head, tipped right back to gaze up at its moon: ears swept back by the wind, a galago's short muzzle
    const { T, t } = frame(330, 440, 0.82, 30);
    const ear = (x: number, y: number, deg: number, w: number, h: number, col: string) => {
      const a = ((deg + 30) * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]], [bx, by] = T([x, y]), k = 0.82;
      const at = (f: number, q: number): P => [bx + (u[0] * f * h + v[0] * q * w) * k, by + (u[1] * f * h + v[1] * q * w) * k];
      shape([at(0, -0.36), at(0.4, -0.5), at(0.8, -0.4), at(1, -0.1), at(0.96, 0.18), at(0.7, 0.4), at(0.3, 0.46), at(0, 0.34)], col, { angle: deg + 80, over: 0.2 });
      c.tint([at(0.2, -0.26), at(0.55, -0.32), at(0.86, -0.14), at(0.8, 0.14), at(0.45, 0.28), at(0.2, 0.2)], RIM, { wash: 0.85 });
    };
    c.part('oreilles', { pivot: T([60, -110]), motion: 'swing', amp: 2, period: 3.2, behind: true }, () => {
      ear(-20, -120, 4, 110, 200, DEEP);
      ear(90, -110, 26, 140, 240, FUR);
    });
    shape(t([[-150, -10], [-126, -100], [-40, -150], [70, -146], [150, -90], [172, 0], [146, 84], [60, 128], [-50, 120], [-120, 76]]), FUR, { angle: 76, over: 0.4 });
    // a slightly deeper lavender ring round each eye (the night blue is kept for the membrane)
    c.tint(c.potato(...T([-70, -34]), 66, 68, 10, 0.04), DEEP, { wash: 0.7 });
    c.tint(c.potato(...T([60, -40]), 82, 84, 10, 0.04), DEEP, { wash: 0.7 });
    // a pale stripe up between the eyes, a pale chin
    c.tint(t([[-6, -146], [14, -112], [-16, -40], [-80, 30], [-120, 20], [-40, -50], [-24, -130]]), BELLY, { angle: 60, wash: 0.9 });
    c.tint(t([[-40, 90], [20, 104], [70, 120], [0, 126], [-70, 112]]), BELLY, { angle: 0, wash: 0.8 });
    const muzzle: P[] = [[-110, 14], [-160, 24], [-196, 50], [-190, 84], [-146, 100], [-100, 90]];
    shape(t(muzzle), BELLY, { angle: 20, over: 0 }, { w: 0.1 });
    stroke(t(muzzle.slice(1, 6)), { w: 4.5 });
    dot(...T([-192, 54]), 13, 10, NOSE);
    // content and dreamy, one signal: big moon eyes gazing up at its tail tip, lower lids lifted by a smile, no brows, a
    // small smile under the nose
    moonEye(c, ...T([-70, -34]), 46 * 0.82, [-0.4, -0.9], 0.58, 0.28, FUR);
    moonEye(c, ...T([60, -40]), 62 * 0.82, [-0.4, -0.9], 0.58, 0.28, FUR);
    c.cheek(...T([120, 70]), 24, 14, CHEEK);
    stroke(t([[-184, 96], [-164, 112], [-136, 112], [-118, 96]]), { w: 5.5 });
    c.part('paupieres', { pivot: T([0, -36]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-70, -34]), 46 * 0.82, 48 * 0.82, FUR);
      c.lid(...T([60, -40]), 62 * 0.82, 64 * 0.82, FUR);
    });
  },
} satisfies Redraw;
