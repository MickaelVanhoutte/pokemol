import type { Crayon, P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/** The family's colours: golden-orange fur, a cream belly, pink paws, pale-blue lightning. */
export const HAM = {
  FUR: '#f2a03a', DEEP: '#d27e26', BELLY: '#fcebc8', PAW: '#f6b0b4', SPARK: '#3eb4ff', GLOW: '#c4ecff', CORE: '#effaff', BOLT: '#1f6fd0',
  EAR: '#f4a6b0', NOSE: '#e86a8a', EYE: '#241c38', MOUTH: '#d8566a',
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
  c.shape([at(0, 0), at(0.46, 0.2), at(0.42, 0.04), at(1, 0.16), at(0.5, -0.14), at(0.54, 0.02)], col, { over: 0, press: 1.2 }, { w: 3.5, col: HAM.BOLT }, false);
}

/** A thin crackle of lightning from `a` to `b`: a zig-zag line in the spark's blue. */
export function crackle(c: Crayon, a: P, b: P, n = 4, amp = 18, w = 5) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const pts: P[] = Array.from({ length: n + 1 }, (_, i): P => {
    const k = i / n, o = i === 0 || i === n ? 0 : (i % 2 ? 1 : -1) * amp;
    return [a[0] + dx * k + nx * o, a[1] + dy * k + ny * o];
  });
  c.stroke(pts, { w: w + 4, col: HAM.BOLT }, false);
  c.stroke(pts, { w, col: HAM.SPARK }, false);
}

/**
 * The hamster's head centred on (hx, hy), `s` its size, turned `rot` degrees, three-quarters to the left: round ears,
 * a short snout with a pink nose, a cream muzzle, the far pouch bulging under the snout and the near one, `pouch` big,
 * glowing like a little dynamo with a bolt in it. The baby is all joy (big shiny eyes, raised brows, an open panting
 * smile); the adult is a daredevil (narrowed eyes, brows down to the nose, a cheeky grin with one buck tooth).
 */
export function hamHead(c: Crayon, hx: number, hy: number, s: number, rot: number, o: { pouch?: number; adult?: boolean; swept?: boolean } = {}) {
  const { shape, stroke, dot, potato } = c;
  const { T, t } = frame(hx, hy, s, rot);
  const k = o.pouch ?? 1, adult = !!o.adult;
  // round ears on top, pink inside (the far one darker, half behind); swept back when it runs
  const [ea, eb] = o.swept ? [[-4, -142], [132, -110]] as P[] : [[-62, -136], [86, -132]] as P[];
  shape(potato(...T(ea), 34 * s, 38 * s, 9, 0.05), HAM.DEEP, { angle: 80, over: 0 });
  shape(potato(...T(eb), 48 * s, 52 * s, 9, 0.05), HAM.FUR, { angle: 80, over: 0 });
  c.tint(potato(...T([eb[0] - 2, eb[1] + 6]), 26 * s, 30 * s, 8, 0.05), HAM.EAR, { wash: 0.8 });
  // the far pouch bulging out under the snout, glowing
  const far = T([-136, 104]);
  shape(potato(far[0], far[1], 54 * s * k, 48 * s * k, 9, 0.04), HAM.FUR, { angle: 70, over: 0 });
  c.tint(potato(far[0] - 4 * s, far[1] + 6 * s, 36 * s * k, 30 * s * k, 8, 0.05), HAM.GLOW, { wash: 0.95 });
  // the head: round on the baby, a wedge with a longer snout on the adult
  shape(t(adult
    ? [[-214, 30], [-196, -14], [-134, -88], [-40, -130], [70, -134], [150, -92], [184, -10], [172, 64], [120, 120], [20, 140], [-80, 124], [-176, 84]]
    : [[-194, 24], [-186, -34], [-142, -104], [-50, -148], [60, -146], [146, -100], [184, -20], [176, 60], [124, 124], [20, 152], [-80, 142], [-160, 96]]), HAM.FUR, { angle: 75 + rot, over: 0.45 });
  c.tint(t([[-200, 22], [-178, 80], [-122, 108], [-90, 90], [-90, 30], [-132, 0]]), HAM.BELLY, { wash: 0.8 });
  // the near pouch, on the cheek just behind the mouth, stuffed so it bulges past the jaw: a little dynamo glowing
  // pale blue, brightest near the face, a bolt stored inside; its line only on the outer edge, so it swells from the cheek
  const p = T([0 + (k - 1) * 20, 112 + (k - 1) * 24]), R = 66 * s * k;
  shape(arc(p[0], p[1], R, R * 0.9, 0, Math.PI * 2, 14), HAM.FUR, { angle: 70, over: 0 }, { w: 0.1 });
  stroke(arc(p[0], p[1], R, R * 0.9, -Math.PI * 0.3 + (rot * Math.PI) / 180, Math.PI * 1.02 + (rot * Math.PI) / 180, 12), { w: 5 });
  c.tint(potato(p[0], p[1], R * 0.8, R * 0.72, 10, 0.03), HAM.GLOW, { wash: 1 });
  c.tint(potato(p[0] - R * 0.18, p[1] - R * 0.1, R * 0.46, R * 0.4, 9, 0.03), HAM.CORE, { wash: 1 });
  spark(c, p[0] - R * 0.46, p[1] + R * 0.04, -12 + rot, R * 0.9);
  // the face
  const e1 = T(adult ? [-126, -26] : [-122, -26]), e2 = T(adult ? [-26, -42] : [-14, -36]);
  const [r1x, r1y, r2x, r2y] = adult ? [22, 28, 30, 38] : [27, 35, 38, 49];
  dot(e1[0], e1[1] + 4 * s, r1x * 0.8 * s, r1y * 0.7 * s, HAM.EYE);
  if (adult) {
    c.eye(e1[0], e1[1], r1x * s, r1y * s, HAM.EYE, { lid: 0.22, skin: HAM.FUR, tilt: 14 + rot });
    c.eye(e2[0], e2[1], r2x * s, r2y * s, HAM.EYE, { lid: 0.24, skin: HAM.FUR, tilt: -16 + rot });
    stroke(t([[-170, -84], [-100, -62]]), { w: 9 });
    stroke(t([[-62, -70], [30, -102]]), { w: 9 });
    // a cheeky open grin under the nose, its corner up toward the near cheek, dark inside, one buck tooth
    shape(t([[-200, 36], [-178, 64], [-140, 72], [-106, 54], [-90, 26], [-120, 42], [-162, 46]]), '#4a2232', { over: 0, press: 1.3 }, { w: 5 });
    c.paper(t([[-184, 40], [-160, 44], [-162, 70], [-182, 66]]), { w: 3.5 }, false);
  } else {
    c.eye(e1[0], e1[1], r1x * s, r1y * s, HAM.EYE);
    c.eye(e2[0], e2[1], r2x * s, r2y * s, HAM.EYE);
    stroke(t([[-150, -86], [-124, -98], [-98, -90]]), { w: 5.5 });
    stroke(t([[-48, -104], [-12, -116], [24, -104]]), { w: 5.5 });
    // a happy panting mouth, open, under the nose
    shape(t([[-184, 40], [-170, 66], [-146, 72], [-126, 50]]), HAM.MOUTH, { over: 0, press: 1.1 }, { w: 4.5 });
  }
  dot(...T(adult ? [-210, 16] : [-192, 12]), 15 * s, 11 * s, HAM.NOSE);
  c.part('paupieres', { pivot: T([-60, -34]), motion: 'blink', extra: true }, () => {
    c.lid(e1[0], e1[1], r1x * s, r1y * s, HAM.FUR);
    c.lid(e2[0], e2[1], r2x * s, r2y * s, HAM.FUR);
  });
  return { pouch: p, R, far };
}

/** A little pink foot at (x, y), the sole along `deg`. */
export function foot(c: Crayon, x: number, y: number, deg: number, s: number) {
  const { t } = frame(x, y, s, deg);
  c.shape(t([[-40, -14], [-10, -22], [30, -14], [40, 4], [10, 14], [-36, 10]]), HAM.PAW, { over: 0 }, { w: 4 });
}

/**
 * A short hamster leg from `top` on the flank to `foot`, `w` wide at the top: a teardrop that tapers to a pink foot,
 * filled with no line on the body side (it grows out of the flank).
 */
function leg(c: Crayon, top: P, end: P, col: string, w: number, sole: number, fs = 0.9) {
  const [tx, ty] = top, [fx, fy] = end;
  const dx = fx - tx, dy = fy - ty, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const at = (k: number, m: number): P => [tx + dx * k + nx * m, ty + dy * k + ny * m];
  openLimb(c, [at(-0.1, -w * 0.2), at(0.12, w * 0.5), at(0.5, w * 0.36), at(0.86, w * 0.22), at(1, w * 0.18), at(1, -w * 0.18), at(0.86, -w * 0.2), at(0.5, -w * 0.3), at(0.12, -w * 0.48)], col, 1, 8);
  foot(c, fx, fy + 4, sole, fs);
}

/** Points along an ellipse (cx, cy, rx, ry) turned `rot` degrees, from angle a0 to a1 (radians, 0 = right, down positive). */
export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 24, rot = 0): P[] {
  const r = (rot * Math.PI) / 180;
  return Array.from({ length: n + 1 }, (_, i): P => {
    const a = a0 + ((a1 - a0) * i) / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
  });
}

const WOOD = '#c99a62', WOODDEEP = '#a87a46';

/**
 * A round baby hamster (« infatigable »), turned to the left, racing up the inside of its wheel and never stopping: full
 * stride, the near forepaw reaching up the rim, the near hind leg stretched back, ears swept back. Its stuffed cheek
 * pouches glow like little dynamos storing the sparks of the run, and one spark already leaps where its foot strikes the
 * rim (the wheel becomes its own ring of lightning on Foudroule). A head as big as its body, big shiny eyes, an open
 * panting smile.
 */
export default {
  id: '004', slug: 'joufflux', seed: 405, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // its wheel, side on: a short stand, the hub and four spokes on the far side, one thin rim
    const [cx, cy, R] = [540, 480, 440];
    c.part('roue', { pivot: [cx, cy], motion: 'swing', amp: 0, period: 3, decor: true, behind: true }, () => {
      stroke([[cx, cy], [cx - 70, 960]], { w: 9, col: WOODDEEP });
      stroke([[cx, cy], [cx + 70, 960]], { w: 9, col: WOODDEEP });
      stroke([[cx - 130, 962], [cx + 130, 962]], { w: 9, col: WOODDEEP });
      for (let i = 0; i < 4; i++) {
        const a = -0.6 + (i * Math.PI) / 2;
        stroke([[cx, cy], [cx + Math.cos(a) * (R - 10), cy + Math.sin(a) * (R - 10)]], { w: 5, col: WOODDEEP });
      }
      c.dot(cx, cy, 22, 22, WOODDEEP);
      shape([...arc(cx, cy, R + 9, R + 9, 0, Math.PI * 2, 40), ...arc(cx, cy, R - 9, R - 9, 0, Math.PI * 2, 40).reverse()], WOOD, { angle: 20, over: 0 }, { w: 3 });
    });
    // the body, leaning 35° up the curve at seven o'clock
    const lean = 35, s = 0.75, ang = (lean * Math.PI) / 180;
    const rimAt: P = [cx - Math.sin(ang) * R, cy + Math.cos(ang) * R], inward: P = [Math.sin(ang), -Math.cos(ang)];
    const { T, t } = frame(rimAt[0] + inward[0] * 200, rimAt[1] + inward[1] * 200, s, lean);
    // far legs, darker, half hidden: the hind one under it, the front one pushing on the rim
    leg(c, T([40, 90]), T([10, 196]), HAM.DEEP, 70 * s, lean, 0.7);
    leg(c, T([-120, 60]), T([-150, 186]), HAM.DEEP, 60 * s, lean, 0.65);
    shape(potato(...T([222, -26]), 26, 18, 8, 0.06), HAM.DEEP, { angle: 30, over: 0 });
    shape(t([[-160, -70], [-60, -130], [80, -124], [190, -70], [230, 10], [190, 100], [80, 140], [-40, 140], [-140, 100], [-190, 20]]), HAM.FUR, { angle: 70 + lean, over: 0.45 });
    c.tint(t([[-180, 30], [-130, 110], [-20, 140], [60, 134], [-20, 80], [-120, 40]]), HAM.BELLY, { wash: 0.75 });
    // the near hind leg stretched right back, pushing off the rim
    openLimb(c, t([[150, -30], [90, 0], [90, 80], [170, 130], [260, 150], [300, 158], [296, 116], [240, 80], [210, 10]]), HAM.FUR, 2, 8);
    const kick = T([310, 150]);
    foot(c, kick[0], kick[1], lean + 20, 0.8);
    // the near forepaw reaching far up the rim
    leg(c, T([-100, 80]), T([-250, 205]), HAM.FUR, 84 * s, lean - 10, 0.75);
    const h = T([-230, -40]);
    hamHead(c, h[0], h[1], 0.82, 18, { pouch: 1.1, swept: true });
    // one spark where the hind foot strikes the rim
    c.part('etincelle', { pivot: kick, motion: 'nod', amp: 2, period: 2, decor: true }, () => {
      spark(c, kick[0] + 20, kick[1] + 10, 20, 56);
    });
  },
} satisfies Redraw;
