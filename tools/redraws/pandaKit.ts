/**
 * What the later Pandoudou forms share (Pandafougère, Pandagivre, Pandivin, Pandanuit, Pandiva): the family's red-panda
 * head with its white mask and tear marks, a sitting body, limbs, paws and the curve sampler for their tails. Each form
 * passes its own colours and its own expression; its tail, the twist of each form, is drawn by its own module.
 */
import type { Crayon, P } from './crayon.ts';
import { lineOfAction, openLimb, paw } from './anatomy.ts';

/** Points along a smooth curve through `pts`, `n` of them. */
export function sample(pts: P[], n: number): P[] {
  const at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out: P[] = [];
  for (let k = 0; k < n; k++) {
    const u = (k / (n - 1)) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), t = u - i;
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)], t2 = t * t, t3 = t2 * t;
    const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

/** A limb through its joints (shoulder or hip first), `ws` wide at each, its line left open where it joins the body. */
export function limb(c: Crayon, pts: P[], ws: number[], col: string) {
  openLimb(c, lineOfAction(pts, ws), col, 1, pts.length * 2 - 1);
}

/** A small paw at (x, y) pointing along `deg` (0 = down), two toe lines. */
export function pad(c: Crayon, x: number, y: number, deg: number, s: number, col: string) {
  const a = (deg * Math.PI) / 180, u: P = [-Math.sin(a), Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
  const at = (px: number, py: number): P => [x + (v[0] * px + u[0] * py) * s, y + (v[1] * px + u[1] * py) * s];
  c.shape(c.potato(...at(0, 10), 34 * s, 28 * s, 8, 0.05), col, { over: 0 });
  for (const k of [-10, 10]) c.stroke([at(k, 20), at(k, 34)], { w: 3 });
}

/**
 * A band along `spine`, `ws` wide, like `lineOfAction`, but its ends rounded off with half-circles instead of cut square
 * (a body's rump, a tail's tip): nothing ends in a straight cut.
 */
export function rounded(spine: P[], ws: number[], down: number[] = [], ends: { start?: boolean; end?: boolean } = { start: true, end: true }): P[] {
  const out = lineOfAction(spine, ws, down), n = spine.length, L = out.slice(0, n), R = out.slice(n);
  const cap = (p: P, from: P, toward: P): P[] => {
    const a: P = [from[0] - p[0], from[1] - p[1]], r = Math.hypot(...a) || 1, l = Math.hypot(toward[0], toward[1]) || 1;
    const t: P = [(toward[0] / l) * r, (toward[1] / l) * r];
    return Array.from({ length: 7 }, (_, k) => {
      const u = ((k + 1) / 8) * Math.PI;
      return [p[0] + a[0] * Math.cos(u) + t[0] * Math.sin(u), p[1] + a[1] * Math.cos(u) + t[1] * Math.sin(u)];
    });
  };
  const e = spine[n - 1], b = spine[0];
  const endCap = ends.end === false ? [] : cap(e, L[n - 1], [e[0] - spine[n - 2][0], e[1] - spine[n - 2][1]]);
  const startCap = ends.start === false ? [] : cap(b, R[n - 1], [b[0] - spine[1][0], b[1] - spine[1][1]]);
  return [...L, ...endCap, ...R, ...startCap];
}

/** A tail's outline along `ctrl` (root to tip), `w(t)` wide and rounded at both ends: its spine, widths and both edges. */
export function tailBand(ctrl: P[], w: (t: number) => number, N = 48) {
  const sp = sample(ctrl, N), ws = sp.map((_, i) => w(i / (N - 1)));
  const flat = lineOfAction(sp, ws);
  return { sp, ws, out: rounded(sp, ws), L: flat.slice(0, N), R: flat.slice(N).reverse(), N };
}

/** The tail's ring `r` of `rings` between t = a0 and t = a1 (`frac` of each step coloured), as a shape to tint. */
export function ring(sp: P[], ws: number[], r: number, rings: number, a0 = 0.16, a1 = 0.94, frac = 0.42): P[] {
  const N = sp.length, a = a0 + (r / rings) * (a1 - a0), b = a + (frac * (a1 - a0)) / rings;
  const i0 = Math.round(a * (N - 1)), i1 = Math.min(N - 1, Math.round(b * (N - 1)));
  return lineOfAction(sp.slice(i0, i1 + 1), ws.slice(i0, i1 + 1).map((x) => x * 0.99));
}

/** `bright`: a pale patch round each eye, for a dark or saturated fur where the eyes would sink in. */
export interface PandaColours { fur: string; deep: string; cream: string; pink: string; nose?: string; bright?: boolean; eyes?: number }
export type Mood = 'shy' | 'grumpy' | 'smug' | 'sleepy' | 'diva' | 'serene' | 'starry' | 'menace';

/**
 * The family's head centred on (hx, hy), `s` its size, turned `rot` degrees (positive lifts the snout), with the face of
 * `mood`. `under` is drawn after the head and before the face (a tail wrapped over the muzzle); `covered` leaves out the
 * mouth it hides. Returns the head's mapper.
 */
export function pandaHead(c: Crayon, col: PandaColours, hx: number, hy: number, s: number, rot: number, mood: Mood, under?: (H: (p: P) => P) => void, covered = false) {
  const { shape, stroke, dot, potato } = c;
  const r = (rot * Math.PI) / 180;
  const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  const h = (pts: P[]) => pts.map(H);
  // ears: pale rims, the deep colour inside
  shape(h([[-70, -96], [-150, -176], [-196, -158], [-198, -84], [-160, -40]]), col.cream, { angle: 70 });
  shape(h([[-96, -102], [-152, -150], [-176, -138], [-176, -90]]), col.deep, { over: 0 }, { w: 0.1 });
  shape(h([[40, -104], [74, -192], [130, -218], [184, -184], [186, -104], [150, -64]]), col.cream, { angle: 70 });
  shape(h([[72, -114], [96, -176], [134, -194], [164, -170], [160, -112]]), col.deep, { over: 0 }, { w: 0.1 });
  const outline = h([[-186, 30], [-180, -10], [-146, -64], [-84, -110], [0, -124], [84, -114], [148, -74], [180, -12], [186, 40], [208, 70], [170, 90], [124, 120], [40, 134], [-50, 130], [-122, 108], [-174, 76]]);
  shape(outline, col.fur, { angle: 78, over: 0.45 }, { w: 0.1 });
  // the pale mask: muzzle and cheeks, the brow spots; the tear marks from each eye down to the jaw
  shape(h([[-188, 30], [-182, 0], [-150, -6], [-106, 24], [-62, 56], [-16, 66], [36, 56], [96, 38], [156, 30], [196, 46], [208, 70], [170, 90], [124, 120], [40, 134], [-50, 130], [-122, 108], [-174, 76]]), col.cream, { angle: 60, over: 0 }, { w: 0.1 });
  c.tint(h([[-112, 14], [-80, 12], [-74, 50], [-86, 92], [-98, 52]]), col.deep, { angle: 80, wash: 1, press: 1.3 });
  c.tint(h([[14, 20], [50, 16], [52, 60], [40, 104], [28, 60]]), col.deep, { angle: 80, wash: 1, press: 1.3 });
  stroke([...outline, outline[0], outline[1]], { w: 5 });
  shape(potato(...H([-96, -84]), 24 * s, 13 * s, 8, 0.05), col.cream, { over: 0 }, { w: 0.1 });
  shape(potato(...H([34, -92]), 32 * s, 16 * s, 8, 0.05), col.cream, { over: 0 }, { w: 0.1 });
  if (col.bright) for (const [x, y, rx, ry] of [[-92, -46, 50, 72], [30, -50, 60, 72]] as const) shape(potato(...H([x, y]), rx * s, ry * s, 10, 0.04), col.cream, { over: 0, wash: 0.9 }, { w: 0.1 });
  if (mood !== 'grumpy' && mood !== 'menace') c.cheek(...H([118, 66]), (mood === 'shy' ? 34 : 24) * s, (mood === 'shy' ? 20 : 14) * s, col.pink);
  // the muzzle: a small round bump left of the face's middle
  shape(potato(...H([-50, 64]), 56 * s, 40 * s, 10, 0.03), col.cream, { over: 0 }, { w: 0.1 });
  stroke(h([[-106, 60], [-94, 92], [-52, 106], [-10, 94], [4, 62]]), { w: 4 });
  under?.(H);
  const [e1, e2] = [H([-92, -22]), H([30, -26])];
  const k = col.eyes ?? 1, E1: [number, number] = [27 * s * k, 34 * s * k], E2: [number, number] = [35 * s * k, 42 * s * k];
  let lids = true;
  if (mood === 'shy') {
    // shy: big eyes glancing up, soft raised brows, a small closed smile and a big blush (worried brows read sad)
    c.eye(e1[0], e1[1], ...E1, '#241c38');
    c.eye(e2[0], e2[1], ...E2, '#241c38');
    stroke(h([[-122, -92], [-94, -102], [-64, -96]]), { w: 4.5 });
    stroke(h([[0, -104], [34, -114], [70, -104]]), { w: 4.5 });
    stroke(h([[-70, 72], [-52, 82], [-34, 72]]), { w: 4.5 });
    for (const x of [100, 120, 140]) stroke(h([[x, 56], [x - 8, 76]]), { w: 3, col: '#d0607a' });
  } else if (mood === 'grumpy') {
    // grumpy: half-lidded, brows down in the middle
    const lidSkin = col.bright ? col.cream : col.fur;
    c.eye(e1[0], e1[1], ...E1, '#241c38', { lid: 0.5, skin: lidSkin, tilt: 14 });
    c.eye(e2[0], e2[1], ...E2, '#241c38', { lid: 0.5, skin: lidSkin, tilt: -14 });
    stroke(h([[-130, -78], [-96, -70], [-62, -54]]), { w: 6 });
    stroke(h([[-4, -58], [32, -74], [72, -84]]), { w: 6 });
    if (!covered) stroke(h([[-84, 88], [-52, 78], [-20, 88]]), { w: 4.5 });
  } else if (mood === 'smug') {
    // smug: half-closed, brows flat, a closed smile with one corner up
    c.eye(e1[0], e1[1], ...E1, '#241c38', { lid: 0.55, skin: col.fur });
    c.eye(e2[0], e2[1], ...E2, '#241c38', { lid: 0.55, skin: col.fur });
    stroke(h([[-124, -78], [-92, -80], [-62, -76]]), { w: 5 });
    stroke(h([[-4, -86], [32, -88], [70, -84]]), { w: 5 });
    stroke(h([[-80, 72], [-56, 80], [-30, 76], [-12, 60]]), { w: 5 });
  } else if (mood === 'sleepy') {
    // sleepy: heavy lids, soft brows, a wide yawn with one tiny fang
    c.eye(e1[0], e1[1], ...E1, '#241c38', { lid: 0.62, skin: col.fur });
    c.eye(e2[0], e2[1], ...E2, '#241c38', { lid: 0.62, skin: col.fur });
    stroke(h([[-122, -80], [-94, -88], [-64, -82]]), { w: 4.5 });
    stroke(h([[0, -90], [34, -98], [70, -90]]), { w: 4.5 });
    shape(h([[-82, 50], [-52, 44], [-22, 50], [-18, 92], [-52, 116], [-86, 92]]), '#8a2230', { over: 0, wash: 1 }, { w: 4.5 });
    shape(h([[-74, 98], [-52, 88], [-30, 98], [-40, 110], [-64, 110]]), '#f27a8a', { over: 0, wash: 1 }, { w: 0.1 });
    shape(h([[-76, 52], [-66, 52], [-71, 66]]), '#ffffff', { over: 0, wash: 1 }, { w: 2.5 }, false);
  } else if (mood === 'serene') {
    // serene: eyes closed in calm downward arcs, soft level brows, a small knowing smile
    lids = false;
    for (const [x, y, w] of [[-92, -22, 27], [30, -26, 35]] as const) stroke(h([[x - w, y - 4], [x - w * 0.4, y + w * 0.32], [x + w * 0.4, y + w * 0.32], [x + w, y - 4]]), { w: 6 });
    stroke(h([[-122, -74], [-94, -80], [-64, -76]]), { w: 4.5 });
    stroke(h([[0, -86], [34, -92], [70, -86]]), { w: 4.5 });
    stroke(h([[-80, 72], [-56, 82], [-32, 80], [-14, 66]]), { w: 5 });
  } else if (mood === 'menace') {
    // menace: eyes narrowed and slanted toward the nose, a gold glint kept in each, brows down, a sly smirk with one fang
    c.eye(e1[0], e1[1], ...E1, '#241c38', { lid: 0.45, skin: col.fur, tilt: 18 });
    c.eye(e2[0], e2[1], ...E2, '#241c38', { lid: 0.45, skin: col.fur, tilt: -18 });
    for (const [e, k] of [[e1, E1[0]], [e2, E2[0]]] as const) dot(e[0] + k * 0.15, e[1] + k * 0.35, k * 0.28, k * 0.2, '#ffd23a');
    shape(h([[-134, -70], [-94, -58], [-58, -40], [-62, -30], [-98, -46], [-132, -58]]), '#241c38', { over: 0, wash: 1 }, { w: 3 }, false);
    shape(h([[-6, -44], [34, -64], [78, -78], [78, -66], [36, -52], [-2, -32]]), '#241c38', { over: 0, wash: 1 }, { w: 3 }, false);
    stroke(h([[-90, 80], [-66, 82], [-36, 72], [-12, 50]]), { w: 5 });
    shape(h([[-34, 72], [-20, 66], [-24, 90]]), '#ffffff', { over: 0, wash: 1 }, { w: 2.5 }, false);
  } else if (mood === 'starry') {
    // starry: big eyes looking up in wonder, a gold glint in each, raised soft brows, a small happy smile
    c.eye(e1[0], e1[1], ...E1, '#241c38');
    c.eye(e2[0], e2[1], ...E2, '#241c38');
    for (const [e, k] of [[e1, E1[0]], [e2, E2[0]]] as const) {
      const [x, y] = [e[0] + k * 0.25, e[1] + k * 0.3], r = k * 0.32;
      shape([[x, y - r], [x + r * 0.3, y - r * 0.3], [x + r, y], [x + r * 0.3, y + r * 0.3], [x, y + r], [x - r * 0.3, y + r * 0.3], [x - r, y], [x - r * 0.3, y - r * 0.3]], '#ffd23a', { over: 0, wash: 1 }, { w: 1.5 }, false);
    }
    stroke(h([[-124, -100], [-94, -112], [-64, -104]]), { w: 4.5 });
    stroke(h([[-2, -114], [34, -126], [70, -114]]), { w: 4.5 });
    stroke(h([[-84, 68], [-62, 84], [-40, 84], [-20, 68]]), { w: 5 });
  } else {
    // diva: eyes shut with pleasure under long lashes, chin up, a pleased closed smile
    lids = false;
    for (const [x, y, w] of [[-92, -22, 28], [30, -26, 36]] as const) {
      stroke(h([[x - w, y], [x, y + w * 0.45], [x + w, y]]), { w: 6 });
      for (const k of [-0.8, 0, 0.8]) stroke(h([[x + k * w * 0.9, y + w * 0.22 + Math.abs(k) * -6], [x + k * w * 1.1 - 4, y + w * 0.7]]), { w: 3.5 });
    }
    stroke(h([[-124, -82], [-94, -96], [-64, -88]]), { w: 4.5 });
    stroke(h([[-2, -98], [34, -112], [72, -100]]), { w: 4.5 });
    stroke(h([[-92, 72], [-62, 86], [-30, 82], [-8, 64]]), { w: 5 });
  }
  // the nose on top of the muzzle, the mouth under it
  dot(...H([-52, 32]), (col.nose ? 20 : 16) * s, (col.nose ? 14 : 11) * s, col.nose);
  if (mood !== 'grumpy' && mood !== 'sleepy' && mood !== 'starry' && mood !== 'menace') stroke(h([[-52, 40], [-52, 54]]), { w: 4 });
  if (lids) c.part('paupieres', { pivot: H([-30, -24]), motion: 'blink', extra: true }, () => {
    c.lid(e1[0], e1[1], ...E1, col.fur);
    c.lid(e2[0], e2[1], ...E2, col.fur);
  });
  return H;
}

/**
 * The family's sitting body, turned to the left, its seat at (x, y), `s` its size: the far front leg, the body with a pale
 * chest, the round haunch, and the near front leg straight down unless `arm` is false (the form then draws its own
 * gesture). Returns where the head's centre goes and the root of the tail.
 */
export function sittingBody(c: Crayon, x: number, y: number, s: number, fur: string, far: string, chest: string, arm = true) {
  const T = ([px, py]: P): P => [x + (px - 530) * s, y + (py - 880) * s];
  const t = (pts: P[]) => pts.map(T);
  c.shape(c.band(t([[480, 640], [490, 780], [482, 880]]), 54 * s, 48 * s), far, { angle: 90 });
  c.shape(c.potato(...T([476, 890]), 44 * s, 26 * s, 8, 0.06), far, { angle: 10 });
  c.shape(t([[400, 880], [372, 740], [392, 610], [460, 530], [580, 530], [660, 610], [690, 740], [680, 880]]), fur, { angle: 80, over: 0.5 });
  c.tint(c.potato(...T([466, 660]), 74 * s, 112 * s, 10, 0.08), chest, { angle: 80, wash: 0.7 });
  openLimb(c, t([[612, 690], [570, 770], [576, 860], [626, 902], [710, 896], [736, 820], [716, 730]]), fur, 1, 6);
  c.shape(c.potato(...T([640, 904]), 70 * s, 26 * s, 8, 0.06), far, { angle: 10 });
  if (arm) {
    c.shape(c.band(t([[420, 640], [404, 790], [396, 880]]), 60 * s, 52 * s), fur, { angle: 90 });
    paw(c, ...T([388, 892]), far, 48 * s);
  }
  return { head: T([440, 450]), tail: T([650, 840]), T };
}
