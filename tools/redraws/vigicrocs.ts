import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * Taupinou grown into the band's chief (« chef vigilant »), turned to the left: tall and lean, it stands guard in front
 * of its band, one long arm flung out to keep them behind it, its big spade claws spread. The tuft has grown into a
 * crest swept back down its nape, the eye patches into sharp dark marks, the little claws into three long digging
 * blades: it vanishes underground in a flash and bursts up under whoever comes near.
 */
export default {
  id: '041', slug: 'vigicrocs', seed: 4127, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const SAND = '#dca55a', DEEP = '#bb8440', CREAM = '#f8e6c0', PATCH = '#5a3a26', DARK = '#4a2e1e', PINK = '#f29ab0';
    const CLAW = '#5e4a50', ROCK = '#b4a494';

    /** A big digging hand at (x, y), its claws pointing along `deg` (0 = down): three long curved blades. */
    const spade = (x: number, y: number, deg: number, s: number, col: string) => {
      const a = (deg * Math.PI) / 180, u: P = [-Math.sin(a), Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      const at = (px: number, py: number): P => [x + (v[0] * px + u[0] * py) * s, y + (v[1] * px + u[1] * py) * s];
      // the hand, three stubby fingers, a long claw growing out of each fingertip
      shape(potato(...at(0, 0), 46 * s, 34 * s, 9, 0.05), col, { over: 0 });
      for (const k of [-30, 0, 30]) shape(potato(...at(k, 30), 16 * s, 16 * s, 7, 0.05), col, { over: 0 });
      for (const k of [-30, 0, 30]) {
        shape([at(k - 12, 40), at(k - 14, 80), at(k - 6, 118), at(k + 12, 142), at(k + 10, 104), at(k + 12, 64), at(k + 12, 40)], CLAW, { angle: deg + 90, over: 0, press: 1.2 }, { w: 4.5 });
        c.shine([at(k - 4, 56), at(k - 3, 96)], 5);
      }
    };
    /** The chief's head centred on (hx, hy), `s` its size, turned `rot` degrees: a long snout, a crest, a stern glare. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the crest, swept back from the crown down the nape
      shape(h([[-40, -104], [40, -150], [160, -170], [300, -150], [240, -124], [300, -96], [220, -80], [270, -40], [170, -30], [120, 10]]), DEEP, { angle: 20, over: 0.2 });
      c.tint(h([[230, -158], [300, -150], [240, -124], [300, -96], [220, -80], [270, -40], [200, -36]]), DARK, { wash: 0.7 });
      shape(h([[-230, 30], [-210, 0], [-140, -40], [-60, -96], [40, -110], [120, -76], [150, 0], [120, 70], [40, 100], [-80, 80], [-170, 60]]), SAND, { angle: 70, over: 0.4 });
      c.tint(h([[-228, 32], [-170, 58], [-80, 78], [0, 92], [-60, 50], [-150, 30]]), CREAM, { angle: 60, wash: 0.75 });
      // the near ear, low on the side
      shape(potato(...H([96, -6]), 22 * s, 30 * s, 8, 0.05), DARK, { over: 0 });
      // sharp dark marks round the eyes, swept back
      const [e1, e2] = [H([-110, -24]), H([-14, -30])];
      shape(h([[-150, -40], [-80, -60], [-76, -4], [-110, 40]]), PATCH, { angle: 80, over: 0, wash: 0.85 }, { w: 0.1 });
      shape(h([[-52, -58], [36, -64], [80, -40], [30, 10], [-10, 40], [-46, 4]]), PATCH, { angle: 80, over: 0, wash: 0.85 }, { w: 0.1 });
      // stern: eyes open, staring ahead, brows slanting down to the snout, the mouth shut
      // vigilant: eyes wide open, the pupils glancing sideways at something, the brows low and straight
      c.paper(potato(e1[0], e1[1], 26 * s, 30 * s, 10, 0.03), { w: 4 });
      c.paper(potato(e2[0], e2[1], 32 * s, 36 * s, 10, 0.03), { w: 4 });
      c.eye(e1[0] - 10 * s, e1[1] + 2 * s, 15 * s, 20 * s, '#241c38');
      c.eye(e2[0] - 12 * s, e2[1] + 2 * s, 19 * s, 24 * s, '#241c38');
      stroke(h([[-146, -60], [-86, -54]]), { w: 8 });
      stroke(h([[-52, -66], [26, -70]]), { w: 8 });
      dot(...H([-228, 16]), 14 * s, 11 * s, DARK);
      stroke(h([[-216, 52], [-160, 62], [-110, 56]]), { w: 5 });
      c.cheek(...H([60, 50]), 20 * s, 12 * s, PINK);
      c.part('paupieres', { pivot: H([-60, -26]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 26 * s, 30 * s, PATCH);
        c.lid(e2[0], e2[1], 32 * s, 36 * s, PATCH);
      });
    };

    // the chief on watch, one foot up on a rock: the far leg planted, the near knee raised, an arm resting on it with
    // its big claws hanging, the head high, the tail behind for balance
    c.part('rocher', { pivot: [330, 860], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape([[170, 920], [190, 820], [250, 770], [360, 750], [440, 780], [470, 860], [460, 924]], ROCK, { angle: 30, over: 0.3 });
      stroke([[260, 790], [340, 776]], { w: 5, col: '#e8e0d4' });
    });
    c.part('queue', { pivot: [640, 760], motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      shape(band([[620, 760], [720, 850], [830, 860], [900, 780], [910, 680]], 64, 22), DEEP, { angle: 40 });
      c.tint(band([[906, 730], [910, 680]], 28, 16), DARK, { wash: 0.9 });
    });
    // the far leg planted
    shape(band([[600, 720], [640, 820], [620, 900]], 70, 40), DEEP, { angle: 80 });
    shape([[560, 896], [660, 894], [668, 924], [550, 922]], DEEP, { angle: 0 });
    // the far arm hanging behind, its claws by the hip
    shape(band([[540, 430], [580, 520], [580, 580]], 46, 36), DEEP, { angle: 70 });
    spade(584, 590, -6, 0.75, DEEP);
    // the body: broad at the shoulders, narrowing to the hips, leaning forward
    shape([[440, 320], [360, 380], [350, 480], [400, 600], [490, 720], [600, 770], [670, 720], [650, 600], [620, 470], [580, 360], [520, 310]], SAND, { angle: 80, over: 0.4 });
    c.tint([[396, 410], [388, 500], [420, 600], [480, 690], [520, 650], [470, 520], [440, 420]], CREAM, { angle: 80, wash: 0.8 });
    // the near leg up on the rock: the thigh forward to the raised knee, the shin down to the foot on the rock
    // (the thigh grows from the hip at the back of the flank and runs forward to the knee)
    openLimb(c, [[670, 600], [600, 580], [500, 570], [420, 576], [380, 610], [376, 660], [384, 744], [310, 752], [300, 778], [446, 778], [440, 700], [444, 650], [520, 660], [620, 720], [680, 700]], SAND, 1, 14);
    // the near arm resting on the knee, its big claws hanging in front of it
    shape(band([[466, 420], [474, 480], [410, 556]], 64, 48), SAND, { angle: 60 });
    spade(392, 572, 30, 1.2, SAND);
    head(420, 250, 0.9, -8);
  },
} satisfies Redraw;
