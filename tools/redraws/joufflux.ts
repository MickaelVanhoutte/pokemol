import type { Crayon, P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/** The family's colours: golden-orange fur, a cream belly and cheeks, pink paws, electric-blue sparks. */
export const HAM = {
  FUR: '#f2a03a', DEEP: '#d27e26', BELLY: '#fcebc8', PAW: '#f6b0b4', SPARK: '#3eb4ff', GLOW: '#c4ecff', BOLT: '#1f6fd0',
  EAR: '#f4a6b0', NOSE: '#e86a8a', EYE: '#241c38',
};

/** Maps local (x, y) around (cx, cy), scaled by `s` and turned `deg` degrees, to the page. */
export function frame(cx: number, cy: number, s: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const T = ([x, y]: P): P => [cx + (x * Math.cos(r) - y * Math.sin(r)) * s, cy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  return { T, t: (pts: P[]) => pts.map(T) };
}

/** A zig-zag spark from (x, y) pointing along `deg` (0 = right, 90 = down), `len` long. */
export function spark(c: Crayon, x: number, y: number, deg: number, len: number, col = HAM.SPARK) {
  const a = (deg * Math.PI) / 180, u: P = [Math.cos(a), Math.sin(a)], v: P = [-u[1], u[0]];
  const at = (f: number, k: number): P => [x + (u[0] * f + v[0] * k) * len, y + (u[1] * f + v[1] * k) * len];
  c.shape([at(0, 0), at(0.46, 0.2), at(0.42, 0.04), at(1, 0.16), at(0.5, -0.14), at(0.54, 0.02)], col, { over: 0, press: 1.2 }, { w: 3.5 }, false);
}

/**
 * The hamster's head centred on (hx, hy), `s` its size, turned `rot` degrees, turned to the left: round ears on top, a
 * short snout, the far cheek pouch bulging out under the snout and the near one, `pouch` big, stuffed with sparks.
 */
export function hamHead(c: Crayon, hx: number, hy: number, s: number, rot: number, o: { pouch?: number; mood?: 'joy' | 'fierce'; snout?: number; tuft?: boolean } = {}) {
  const { shape, stroke, dot, potato } = c;
  const { T, t } = frame(hx, hy, s, rot);
  const k = o.pouch ?? 1, n = o.snout ?? 0, fierce = o.mood === 'fierce';
  // a short spiky tuft of static fur on its crown, swept back
  if (o.tuft) shape(t([[-60, -110], [20, -226], [4, -158], [100, -286], [64, -156], [166, -206], [100, -110]]), HAM.DEEP, { angle: 60, over: 0.2 }, {}, false);
  // round ears on top, pink inside
  shape(potato(...T([-70, -136]), 36 * s, 40 * s, 9, 0.05), HAM.DEEP, { angle: 80, over: 0 });
  shape(potato(...T([80, -134]), 50 * s, 54 * s, 9, 0.05), HAM.FUR, { angle: 80, over: 0 });
  c.tint(potato(...T([76, -128]), 28 * s, 32 * s, 8, 0.05), HAM.EAR, { wash: 0.8 });
  // the far pouch, bulging out under the snout
  shape(potato(...T([-140 - n * 0.4, 74]), 62 * s * k, 56 * s * k, 9, 0.04), HAM.FUR, { angle: 70, over: 0 });
  c.tint(potato(...T([-146 - n * 0.4, 84]), 40 * s * k, 34 * s * k, 8, 0.05), HAM.GLOW, { wash: 0.8 });
  // the head, its near cheek swelling out round the pouch stuffed with sparks
  const bx = 70 + 130 * k, by = 60 + 90 * k;
  shape(t([[-196 - n, 14], [-186 - n * 0.9, -30 + n * 0.3], [-136 - n * 0.4, -104 + n * 0.3], [-40, -146 + n * 0.2], [60, -142], [140, -100], [184, -30], [bx, 40], [bx - 10, by - 40], [bx - 70, by], [10, by + 10], [-70, 134], [-150 - n * 0.5, 92]]), HAM.FUR, { angle: 75 + rot, over: 0.45 });
  c.tint(t([[-196 - n, 16], [-170 - n, 70], [-110 - n * 0.5, 100], [-80, 40], [-120 - n * 0.5, -10]]), HAM.BELLY, { wash: 0.75 });
  const p = T([60 + 40 * k, 50 + 40 * k]);
  c.tint(potato(p[0], p[1], 80 * s * k, 64 * s * k, 10, 0.05), HAM.BELLY, { wash: 0.85 });
  c.tint(potato(p[0] + 6 * s, p[1] + 4 * s, 56 * s * k, 44 * s * k, 9, 0.05), HAM.GLOW, { wash: 0.9 });
  // the crease where the pouch swells from the face
  stroke(t([[-30, 14], [-40, 70], [-10, 120]]), { w: 4.5 });
  spark(c, p[0] - 44 * s * k, p[1] - 6 * s * k, 4 + rot, 96 * s * k);
  // the face: wide happy eyes, or narrowed with brows down to the snout and a grin with one fang
  const e1 = T([-112 - n * 0.3, -34]), e2 = T([-6, -42]);
  const [r1x, r1y, r2x, r2y] = fierce ? [24, 30, 30, 36] : [26, 34, 33, 41];
  // a dark underlay so the far eye stays dark under the pencil
  dot(e1[0], e1[1] + 4 * s, r1x * 0.8 * s, r1y * 0.7 * s, HAM.EYE);
  if (fierce) {
    c.eye(e1[0], e1[1], r1x * s, r1y * s, HAM.EYE, { lid: 0.2, skin: HAM.FUR, tilt: 6 + rot });
    c.eye(e2[0], e2[1], r2x * s, r2y * s, HAM.EYE, { lid: 0.26, skin: HAM.FUR, tilt: -14 + rot });
    stroke(t([[-150 - n * 0.3, -84], [-88 - n * 0.3, -64]]), { w: 7 });
    stroke(t([[-36, -68], [40, -94]]), { w: 7 });
    stroke(t([[-182 - n, 26], [-156 - n, 56], [-114 - n * 0.6, 62], [-80 - n * 0.4, 34]]), { w: 5 });
    c.paper(t([[-150 - n, 54], [-136 - n, 82], [-124 - n, 58]]), { w: 3.5 }, false);
  } else {
    c.eye(e1[0], e1[1], r1x * s, r1y * s, HAM.EYE);
    c.eye(e2[0], e2[1], r2x * s, r2y * s, HAM.EYE);
    stroke(t([[-140, -90], [-114, -100], [-88, -92]]), { w: 5.5 });
    stroke(t([[-36, -102], [-4, -112], [28, -100]]), { w: 5.5 });
    stroke(t([[-188, 22], [-182, 44], [-164, 50], [-150, 40]]), { w: 4.5 });
  }
  dot(...T([-192 - n, 8]), 14 * s, 10 * s, HAM.NOSE);
  c.part('paupieres', { pivot: T([-60, -38]), motion: 'blink', extra: true }, () => {
    c.lid(e1[0], e1[1], r1x * s, r1y * s, HAM.FUR);
    c.lid(e2[0], e2[1], r2x * s, r2y * s, HAM.FUR);
  });
}

/** A little hamster (« infatigable »), turned to the left, running nonstop in its wheel, its cheeks stuffed with sparks. */
export default {
  id: '004', slug: 'joufflux', seed: 405, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const WOOD = '#c99a62', WOODDEEP = '#a87a46';
    /** A little pink foot at (x, y), the sole along `deg`. */
    const foot = (x: number, y: number, deg: number, s: number) => {
      const { t } = frame(x, y, s, deg);
      shape(t([[-40, -14], [-10, -22], [30, -14], [40, 4], [10, 14], [-36, 10]]), HAM.PAW, { over: 0 }, { w: 4 });
    };
    /** The running body: bean leaning forward, legs mid-stride; the head at (hx, hy). */
    const runner = (bx: number, by: number, s: number, lean: number) => {
      const { T, t } = frame(bx, by, s, lean);
      // the far legs: the front reaching forward, the hind tucked under
      shape(band(t([[-150, 40], [-230, 110], [-270, 120]]), 40 * s, 30 * s), HAM.DEEP, { angle: 30 });
      foot(...T([-290, 124]), lean - 10, 0.8 * s);
      shape(band(t([[30, 90], [-30, 170], [-70, 200]]), 50 * s, 34 * s), HAM.DEEP, { angle: 60 });
      foot(...T([-90, 206]), lean, 0.9 * s);
      // the stub tail
      shape(potato(...T([230, -20]), 30 * s, 22 * s, 8, 0.06), HAM.DEEP, { angle: 30, over: 0 });
      // the bean body, a cream belly
      shape(t([[-170, -60], [-60, -130], [80, -126], [200, -70], [240, 20], [200, 110], [90, 150], [-40, 150], [-150, 100], [-200, 20]]), HAM.FUR, { angle: 70 + lean, over: 0.45 });
      c.tint(t([[-180, 30], [-130, 110], [-20, 146], [60, 140], [-20, 80], [-120, 40]]), HAM.BELLY, { wash: 0.75 });
      // the near hind leg kicking back: the thigh on the flank, the foot pushing off behind
      openLimb(c, t([[150, -30], [90, 0], [80, 80], [130, 140], [200, 190], [250, 200], [240, 160], [210, 100], [210, 10]]), HAM.FUR, 2, 8);
      foot(...T([250, 194]), lean + 60, s);
      // the near arm swung back under the chin
      shape(band(t([[-110, 40], [-90, 110], [-60, 150]]), 40 * s, 32 * s), HAM.FUR, { angle: 40 });
      shape(potato(...T([-56, 158]), 20 * s, 16 * s, 7, 0.06), HAM.PAW, { over: 0 }, { w: 3.5 });
      return T([-150, -150]);
    };

    // inside its wheel: the whole ring behind it, running at the bottom, two sparks flying off the rim
    // its wheel behind it: a thin rim open at the top where it pokes out, two spokes to the hub hidden behind it
    c.part('roue', { pivot: [500, 480], motion: 'swing', amp: 0, period: 3, decor: true }, () => {
      for (const a of [0.35, 2.6]) stroke([[500, 480], [500 + Math.cos(a) * 416, 480 + Math.sin(a) * 416]], { w: 6, col: WOODDEEP });
      const ring = (r: number) => Array.from({ length: 21 }, (_, i): P => {
        const a = -0.55 + ((3.75 + 0.55) * i) / 20;
        return [500 + Math.cos(a) * r, 480 + Math.sin(a) * r];
      });
      shape([...ring(434), ...ring(414).reverse()], WOOD, { angle: 20, over: 0.3 }, { w: 3.5 });
    });
    const h = runner(540, 650, 1.2, -14);
    hamHead(c, h[0] + 10, h[1] - 10, 1.16, -8, { pouch: 1.2 });
    c.part('etincelles', { pivot: [880, 770], motion: 'flicker', period: 1.6, decor: true }, () => {
      spark(c, 860, 840, -30, 80);
      spark(c, 900, 700, -60, 64);
    });
  },
} satisfies Redraw;
