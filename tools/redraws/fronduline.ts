import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction } from './anatomy.ts';

/** The family's colours: sea-green, a pale belly, golden leaf fronds, ink blue. */
export const SEA = {
  TEAL: '#3cb4a0', DEEP: '#25917f', BELLY: '#e4f4d2', GOLD: '#f4c43a', GOLD2: '#d8961c', INK: '#2a3c94',
  GLOW: '#8fe0f4', WEED: '#9ccf6e', WEED2: '#6fae4a', BUBBLE: '#d8f4fb', EYE: '#241c38', PINK: '#f29ab0',
};

/**
 * A leafy frond grown from the body at `base`, out to `tip`: a short stalk, then a ruffled leaf with `lobes` round lobes
 * on each side, `w` wide, bowed by `bend` (px sideways), a vein down its middle.
 */
export function frond(c: Crayon, base: P, tip: P, w: number, bend = 0, lobes = 2, col = SEA.GOLD, vein = SEA.GOLD2) {
  const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, n = 12;
  const spine: P[] = Array.from({ length: n + 1 }, (_, i) => {
    const f = i / n, b = Math.sin(Math.PI * f) * bend;
    return [base[0] + dx * f + nx * b, base[1] + dy * f + ny * b];
  });
  const half = (f: number) => {
    const body = Math.sin(Math.PI * Math.min(1, Math.max(0, (f - 0.12) / 0.9))) * (0.55 + 0.45 * (1 - f));
    const ruffle = 0.78 + 0.22 * Math.abs(Math.cos(Math.PI * f * (lobes + 0.5)));
    return f < 0.12 ? 0.12 : body * ruffle;
  };
  const side = (sg: number) => spine.map(([x, y], i): P => [x + nx * sg * w * half(i / n), y + ny * sg * w * half(i / n)]);
  c.shape([...side(1), ...side(-1).reverse()], col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 70, over: 0.2 }, { w: 4 });
  c.stroke(spine.slice(1, n - 1), { w: 3, col: vein });
}

/**
 * A baby leafy sea dragon (« petit rêveur des algues »), turned to the left: a big head with a short tube snout, a round
 * belly, a curling tail, and golden leaf fronds growing all over it so it hides among the seaweed. It drifts and
 * dreams, curious about every bubble.
 */
export default {
  id: '069', slug: 'fronduline', seed: 6901, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const { TEAL, DEEP, BELLY, WEED, WEED2, BUBBLE, EYE, PINK } = SEA;
    const bubble = (x: number, y: number, r: number) => {
      shape(potato(x, y, r, r, 10, 0.02), BUBBLE, { over: 0, wash: 0.25, press: 0.6 }, { w: 2.5, col: '#5aa8bc' });
      c.shine([[x - r * 0.5, y - r * 0.2], [x - r * 0.2, y - r * 0.55]], 4);
    };

    /** The baby head at (hx, hy), `s` its size, turned `rot` degrees: round, a short tube snout up to the left, two leafy
     * horns, one big curious eye. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the far leafy horn, behind
      frond(c, H([30, -80]), H([200, -190]), 50 * s, -10, 2, '#e8b02c');
      shape(h([[-100, -20], [-140, -60], [-176, -84], [-196, -66], [-176, -40], [-130, 10], [-100, 40]]), TEAL, { angle: 30 + rot, over: 0.2 });
      shape(h([[-110, 0], [-90, -70], [-20, -110], [70, -100], [120, -40], [116, 40], [60, 90], [-30, 96], [-90, 60]]), TEAL, { angle: 80 + rot, over: 0.4 });
      c.tint(h([[-104, 20], [-60, 70], [10, 90], [-20, 50], [-80, 20]]), BELLY, { wash: 0.75 });
      // the mouth: a tiny round opening at the tip of the snout
      // only the very tip of its snout: a little brush point already dipped in ink
      shape(h([[-178, -84], [-196, -90], [-214, -96], [-232, -104], [-218, -86], [-206, -72], [-194, -66]]), SEA.INK, { over: 0, press: 1.2 }, { w: 3 }, false);
      // the near leafy horn, swept back from the top of its head
      frond(c, H([0, -100]), H([150, -270]), 58 * s, 26, 2);
      // curious: one big round eye looking up at the bubble, the brow raised
      c.eye(...H([-24, -24]), 40 * s, 46 * s, EYE);
      stroke(h([[-70, -90], [-26, -100], [16, -88]]), { w: 5 });
      c.cheek(...H([60, 34]), 26 * s, 16 * s, PINK);
      c.part('paupieres', { pivot: H([-24, -24]), motion: 'blink', extra: true }, () => c.lid(...H([-24, -24]), 40 * s, 46 * s, TEAL));
    };

    // B: drifting level like a little twig, the tail trailing, the head raised to a bubble
    c.part('algue', { pivot: [880, 980], motion: 'swing', amp: 2, period: 3.2, decor: true, behind: true }, () => {
      shape(band([[880, 980], [860, 860], [900, 740], [870, 600]], 44, 18), WEED, { angle: 80, over: 0 }, { w: 3.5, col: WEED2 });
    });
    c.part('bulles', { pivot: [150, 200], motion: 'nod', amp: 3, period: 2.6, decor: true }, () => {
      bubble(130, 200, 28);
      bubble(190, 130, 15);
    });
    frond(c, [640, 500], [760, 360], 54, 16, 2, '#e8b02c');
    const spine: P[] = [[380, 470], [480, 510], [600, 530], [720, 570], [800, 650], [830, 740], [870, 770], [890, 730], [860, 710]];
    shape(lineOfAction(spine, [120, 180, 170, 110, 70, 46, 32, 22, 12], [0, 40, 40, 10, 0, 0, 0, 0, 0]), TEAL, { angle: 20, over: 0.4 });
    c.tint([[420, 540], [520, 600], [640, 600], [700, 610], [600, 570], [480, 550]], BELLY, { wash: 0.85, angle: 20 });
    for (const x of [500, 560, 620]) stroke([[x, 566], [x + 6, 606]], { w: 3, col: DEEP });
    frond(c, [540, 450], [600, 280], 60, 20);
    frond(c, [720, 540], [860, 470], 50, -16);
    frond(c, [560, 600], [580, 760], 46, -14);
    frond(c, [800, 690], [720, 800], 40, 12);
    head(350, 400, 1.1, 18);
  },
} satisfies Redraw;
