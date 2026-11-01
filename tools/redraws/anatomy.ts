/**
 * Proven anatomy for drawing Bestioles: pieces taken from the drawings the owner approved, so a new Bestiole starts from
 * bodies and limbs that already work instead of guessing coordinates (.claude/skills/bestiole-design, « Anatomy kit »).
 * Every piece takes the crayon `c`, a place and a size `s` (1 = the size it had in the drawing it comes from), and is
 * drawn turned to the left.
 *
 * - `lineOfAction` (Braisaure, Dragobraise): a body and tail as one outline along a curve, its width changing all along,
 *   swelling down at the shoulder and hip if asked. No seam between body and tail.
 * - `openLimb` (Braisaure, Clapotin): a limb filled with no outline, its line drawn only along its outer edge, so it
 *   melts into the body it grows from (the owner's idea: « ne pas fermer le cercle de sa cuisse »).
 * - `flankLeg` (Braisaure): a near leg on the flank, a teardrop thigh tapering down to a round paw, line left open.
 * - `seated` (Chapardou, Minousse): a four-legged animal sitting up, chest, haunch and front legs; returns where its
 *   head goes. The pose the owner liked best for first forms.
 * - `paw`: a round paw with toe lines.
 * - `flame` (Braisou's family): a flame from its root, pointing anywhere, red heart.
 * - `jaggedLeaf` (Minousse's family): a wide leaf with toothed edges and a vein, along a curved spine.
 */
import type { Crayon, P } from './crayon.ts';

/** The outline of a body along `spine`, `widths` wide; `down` widens its underside (shoulder, hip). */
export function lineOfAction(spine: P[], widths: number[], down: number[] = []): P[] {
  const L: P[] = [], R: P[] = [];
  spine.forEach(([x, y], i) => {
    const [ax, ay] = spine[Math.max(0, i - 1)], [bx, by] = spine[Math.min(spine.length - 1, i + 1)];
    const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, h = widths[i] / 2, d = h + (down[i] ?? 0);
    L.push([x + (dy / l) * h, y - (dx / l) * h]);
    R.push([x - (dy / l) * d, y + (dx / l) * d]);
  });
  return [...L, ...R.reverse()];
}

/** A limb filled with no outline, its line drawn only from point `from` to point `to` (its outer edge). */
export function openLimb(c: Crayon, pts: P[], col: string, from = 1, to = pts.length - 1) {
  c.shape(pts, col, { angle: 70, over: 0.3 }, { w: 0.1 });
  c.stroke(pts.slice(from, to), { w: 5 });
}

/** A round paw at (x, y), `w` wide, with toe lines. */
export function paw(c: Crayon, x: number, y: number, col: string, w = 50) {
  c.shape(c.potato(x, y, w, w * 0.56, 8, 0.06), col, { angle: 10 });
  for (const d of [-0.36, 0.12]) c.stroke([[x + d * w, y + w * 0.08], [x + d * w + 2, y + w * 0.44]], { w: 3.5 });
}

/**
 * A near leg on the flank, drawn over the body: a teardrop thigh (or shoulder) whose top sits at `top`, tapering down to
 * a paw at `foot`, `w` wide at the thigh; its line stays open on the body side.
 */
export function flankLeg(c: Crayon, top: P, foot: P, col: string, w = 100) {
  const [tx, ty] = top, [fx, fy] = foot;
  const dx = fx - tx, dy = fy - ty, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  const at = (t: number, k: number): P => [tx + dx * t + nx * k, ty + dy * t + ny * k];
  const pts: P[] = [at(-0.05, -w * 0.15), at(0.1, w * 0.5), at(0.4, w * 0.42), at(0.75, w * 0.26), at(1, w * 0.22), at(1, -w * 0.22), at(0.75, -w * 0.24), at(0.4, -w * 0.32), at(0.12, -w * 0.45)];
  openLimb(c, pts, col, 1, 8);
  paw(c, fx - nx * 4, fy + 6, col, w * 0.5);
}

/**
 * A four-legged animal sitting up, turned to the left (Chapardou's body): the far front leg, the body with a pale chest,
 * the round haunch, the near front leg. Its seat is at (x, y), `s` its size. Returns where the centre of its head goes
 * (for a head about 400 wide at s = 1) and the root of its tail.
 */
export function seated(c: Crayon, x: number, y: number, s: number, fur: string, deep: string, chest: string) {
  const T = ([px, py]: P): P => [x + (px - 530) * s, y + (py - 880) * s];
  const t = (pts: P[]) => pts.map(T);
  c.shape(c.band(t([[480, 640], [490, 780], [482, 880]]), 54 * s, 48 * s), deep, { angle: 90 });
  c.shape(c.potato(...T([476, 890]), 44 * s, 26 * s, 8, 0.06), deep, { angle: 10 });
  c.shape(t([[400, 880], [370, 740], [390, 610], [460, 530], [580, 530], [660, 610], [690, 740], [680, 880]]), fur, { angle: 80, over: 0.5 });
  c.tint(c.potato(...T([470, 650]), 80 * s, 110 * s, 10, 0.08), chest, { angle: 80, wash: 0.6 });
  c.shape(c.potato(...T([630, 780]), 100 * s, 112 * s, 11, 0.05), fur, { angle: 70, over: 0.3 });
  c.shape(c.potato(...T([560, 900]), 70 * s, 30 * s, 8, 0.06), fur, { angle: 10 });
  c.shape(c.band(t([[410, 640], [400, 790], [392, 880]]), 58 * s, 52 * s), fur, { angle: 90 });
  paw(c, ...T([384, 892]), fur, 48 * s);
  return { head: T([410, 380]), tail: T([600, 800]) };
}

/** A flame from its root (x, y), pointing at `deg` (0 = up), `h` tall and `w` wide, a red heart. */
export function flame(c: Crayon, x: number, y: number, deg: number, h: number, w: number, col = '#f6c63c', heart = '#e8502e') {
  const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  const at = (px: number, py: number): P => [x + u[0] * py * h + v[0] * px * w, y + u[1] * py * h + v[1] * px * w];
  c.shape([at(-0.5, 0), at(-0.6, 0.4), at(-0.25, 0.62), at(-0.3, 0.8), at(0, 1), at(0.2, 0.7), at(0.5, 0.5), at(0.5, 0)], col, { angle: deg + 90, over: 0 });
  c.tint([at(-0.28, 0.05), at(-0.3, 0.4), at(0, 0.7), at(0.26, 0.4), at(0.28, 0.05)], heart, { wash: 0.7 });
}

/** A wide leaf with toothed edges along a curved `spine` (base to tip), `w` wide at its widest, a middle vein. */
export function jaggedLeaf(c: Crayon, spine: P[], w: number, col = '#4fa83a', vein = '#3a8a2c') {
  const n = spine.length;
  const side = (sgn: number) => spine.map(([x, y], i): P => {
    const [ax, ay] = spine[Math.max(0, i - 1)], [bx, by] = spine[Math.min(n - 1, i + 1)];
    const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, k = Math.sin((i / (n - 1)) * Math.PI) * w;
    return [x - (dy / l) * k * sgn, y + (dx / l) * k * sgn];
  });
  c.shape([...c.spikes(side(1), 2, 16), ...c.spikes(side(-1), 2, -16).reverse()], col, { angle: 70, over: 0.3 }, {}, false);
  c.stroke(spine, { w: 4, col: vein });
}
