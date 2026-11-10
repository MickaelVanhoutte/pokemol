import type { P, Redraw } from './crayon.ts';
import { tailBand } from './pandaKit.ts';

/**
 * A baby aardvark, the curious one: sitting up on its haunches like a little dog, its long snout lifted to sniff the air,
 * head tilted, its two big ears turned toward a sound. Front paws held up at its chest, each with three big digging
 * claws. A fat tail on the ground with three little indigo plates: the dragon still asleep in it. Its flaw: it sniffs
 * so hard it ends up sneezing.
 */
export const FUR = '#e39a62', DEEP = '#bb7442', CHEST = '#f9e2c6', PINK = '#f4a29a', INDIGO = '#4a5ab8', CLAW = '#4a3a3a', EARTH = '#8a6440';

/** A dragon plate (a rounded triangle) at `p`, pointing `deg` (0 = up), `h` tall. */
export function plate(c: { shape: (p: P[], col: string, o?: object, l?: object, round?: boolean) => void }, p: P, deg: number, h: number, col = INDIGO) {
  const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  const at = (x: number, y: number): P => [p[0] + u[0] * y * h + v[0] * x * h, p[1] + u[1] * y * h + v[1] * x * h];
  c.shape([at(-0.5, 0.05), at(-0.24, 0.66), at(0, 1), at(0.24, 0.66), at(0.5, 0.05)], col, { angle: deg + 90, over: 0 }, { w: 4 });
}

/** Three curved claws at `p`, fanning toward `deg` (0 = up). */
export function claws(c: { stroke: (p: P[], l?: object) => void }, p: P, deg: number, len: number, w = 7) {
  for (const d of [-20, 0, 20]) {
    const a = ((deg + d) * Math.PI) / 180, b = ((deg + d + 25) * Math.PI) / 180;
    c.stroke([[p[0], p[1]], [p[0] + Math.sin(a) * len * 0.6, p[1] - Math.cos(a) * len * 0.6], [p[0] + Math.sin(b) * len, p[1] - Math.cos(b) * len]], { w: w + 4, col: CLAW });
  }
}

/**
 * The family's head, turned three-quarters left at (hx, hy), `s` big, tilted `tilt` degrees (positive lifts the snout):
 * one wedge from the round back of the skull, narrowing at the cheek straight into the long snout and its pink pig
 * nose (no seam, no tube stuck on). Returns a mapper from head space to the page.
 */
export function aardHead(c: Parameters<typeof plate>[0] & { tint: (p: P[], col: string, o?: object) => void; potato: (x: number, y: number, rx: number, ry: number, n: number, w: number) => P[] }, hx: number, hy: number, s: number, tilt: number, snout = 1) {
  const r = (tilt * Math.PI) / 180;
  const T = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
  const L = 280 * snout;
  // the wedge: round at the back, the brow line sloping down into the top of the snout, the jaw rising to meet it
  c.shape([T([110, -40]), T([70, -100]), T([-10, -112]), T([-90, -80]), T([-L * 0.55, -20]), T([-L * 0.92, 18]), T([-L, 40]),
    T([-L * 0.96, 62]), T([-L * 0.6, 70]), T([-110, 90]), T([-20, 100]), T([80, 70])], FUR, { angle: 10 - tilt, over: 0.4 });
  c.tint([T([-120, 84]), T([-40, 96]), T([30, 80]), T([-40, 60])], CHEST, { angle: 60, wash: 0.6 });
  c.shape(c.potato(...T([-L - 6, 42]), 34 * s, 30 * s, 8, 0.04), PINK, { angle: 0 }, { w: 4 });
  return T;
}

export default {
  id: '141', slug: 'fouissou', seed: 14101, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { stroke } = c;
    // the fat tail on the ground, three little plates along it
    const t = tailBand([[640, 830], [760, 870], [860, 850], [920, 790]], (k) => 120 - 76 * k, 26);
    c.shape(t.out, FUR, { angle: 20, over: 0.3 });
    // the body sitting up, a pale chest
    // three plates down its back, broad and sunk into the back line, overlapping, smaller toward the tail (behind)
    for (const [x, y, d, h] of [[590, 550, 30, 70], [636, 620, 52, 62], [670, 700, 72, 50]] as [number, number, number, number][]) plate(c, [x + 14, y + 10], d, h);
    // the body sitting up (Chapardou's seat, its front paws held up instead of planted)
    const S = 0.95, X = 560, Y = 900;
    const Tb = ([px, py]: P): P => [X + (px - 530) * S, Y + (py - 880) * S];
    c.shape([Tb([400, 880]), Tb([370, 740]), Tb([390, 610]), Tb([460, 530]), Tb([580, 530]), Tb([660, 610]), Tb([690, 740]), Tb([680, 880])], FUR, { angle: 80, over: 0.5 });
    c.tint(c.potato(...Tb([470, 650]), 80 * S, 110 * S, 10, 0.08), CHEST, { angle: 80, wash: 0.6 });
    c.shape(c.potato(...Tb([630, 780]), 100 * S, 112 * S, 11, 0.05), FUR, { angle: 70, over: 0.3 });
    c.shape(c.potato(...Tb([560, 900]), 70 * S, 30 * S, 8, 0.06), FUR, { angle: 10 });
    c.shape(c.potato(...Tb([430, 900]), 56 * S, 26 * S, 8, 0.06), DEEP, { angle: 10 });
    const head = Tb([410, 380]);
    const [hx, hy] = [head[0] + 40, head[1] + 80];
    // the ears, rooted at the back of the skull, up and turned to listen (they twitch in battle)
    c.part('oreilles', { pivot: [hx + 40, hy - 80], motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      c.shape([[hx + 50, hy - 70], [hx + 120, hy - 220], [hx + 200, hy - 300], [hx + 200, hy - 200], [hx + 110, hy - 50]], DEEP, { angle: 70, over: 0.2 });
      c.shape([[hx - 20, hy - 80], [hx - 10, hy - 240], [hx + 40, hy - 330], [hx + 90, hy - 230], [hx + 60, hy - 70]], FUR, { angle: 80, over: 0.2 });
      c.tint([[hx, hy - 100], [hx + 6, hy - 230], [hx + 40, hy - 300], [hx + 70, hy - 220], [hx + 48, hy - 100]], PINK, { angle: 80, wash: 0.7 });
    });
    // the head, the snout lifted to sniff the air
    const T = aardHead(c, hx, hy, 0.95, -32, 0.92);
    c.dot(...T([-262, 42]), 6, 5);
    // curious, one emotion: brows lifted
    // its eyes on the pebble: white eyes, the pupils low and toward its nose
    for (const [e, rx, ry] of [[T([-56, -24]), 30, 38], [T([30, -34]), 38, 48]] as [P, number, number][]) {
      c.shape(c.potato(e[0], e[1], rx, ry, 10, 0.03), '#ffffff', { angle: 90, over: 0 }, { w: 3.5 });
      c.dot(e[0] - rx * 0.3, e[1] + ry * 0.32, rx * 0.62, ry * 0.58, '#241c38');
      c.dot(e[0] - rx * 0.45, e[1] + ry * 0.12, rx * 0.2, ry * 0.18, '#ffffff');
    }
    stroke([T([-92, -86]), T([-62, -104]), T([-30, -98])], { w: 5 });
    stroke([T([-4, -116]), T([34, -138]), T([74, -122])], { w: 5 });
    c.cheek(...T([64, 46]), 28, 18);
    stroke([T([-120, 70]), T([-96, 78]), T([-76, 70])], { w: 4.5 });
    // its front paws held up like a begging dog, wrists bent, a shiny pebble between them that it sniffs
    for (const [top, paw, col] of [[[470, 610], [400, 720], DEEP], [[530, 640], [460, 740], FUR]] as [P, P, string][]) {
      c.shape(c.band([top, [(top[0] + paw[0]) / 2 - 10, (top[1] + paw[1]) / 2], paw], 56, 44), col, { angle: 70 }, { w: 4.5 });
      c.shape(c.potato(paw[0] - 8, paw[1] + 8, 36, 28, 8, 0.06), col, { angle: 20 }, { w: 4.5 });
      for (const dx of [-30, -10, 10]) c.shape([[paw[0] + dx - 8, paw[1] + 26], [paw[0] + dx + 6, paw[1] + 30], [paw[0] + dx - 4, paw[1] + 54]], '#5a4640', { angle: 0, over: 0 }, { w: 3 }, false);
    }
    // the pebble right under its nose
    const [nx, ny] = T([-262, 42]);
    c.shape(c.potato(nx + 4, ny + 52, 34, 28, 9, 0.08), '#9aa4b4', { angle: 30 }, { w: 4 });
    c.dot(nx - 6, ny + 42, 8, 6, '#ffffff');
    c.part('paupieres', { pivot: T([-10, -30]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-56, -24]), 30, 38, FUR);
      c.lid(...T([30, -34]), 38, 48, FUR);
    });
  },
} satisfies Redraw;

/** A big curved claw from `p`, pointing `deg` (0 = up), `len` long and `w` wide at its root: a solid dark crescent. */
export function bigClaw(c: { shape: (p: P[], col: string, o?: object, l?: object, round?: boolean) => void }, p: P, deg: number, len: number, w: number, col = '#4a3a3a') {
  const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  const at = (x: number, y: number): P => [p[0] + u[0] * y * len + v[0] * x * w, p[1] + u[1] * y * len + v[1] * x * w];
  c.shape([at(-0.5, 0), at(-0.42, 0.55), at(0.12, 1), at(0.22, 0.5), at(0.5, 0)], col, { angle: deg + 90, over: 0 }, { w: 4 }, true);
}

/** Older names, for the family's other forms. */
export const SAND = FUR, SDEEP = DEEP, CREAM = CHEST;
