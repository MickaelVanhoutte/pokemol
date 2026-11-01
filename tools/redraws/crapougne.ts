import type { Crayon, P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/** The family's colours: mossy purple skin, a pale belly, yellow-green warts, a toxic mist. */
export const TOAD = {
  SKIN: '#6c5a74', DEEP: '#4f4258', BELLY: '#f0e6c2', WART: '#c6e046', WART2: '#97b22e', MIST: '#d6eaa0', SMOG: '#8c7fa6',
  SMOG2: '#5e5276', EYE: '#241c38', MOUTH: '#8a2e44', PINK: '#e48aa6',
};

/** A puff of mist round (x, y), `r` big: the outline of a few round lobes of different sizes, as a child draws a
 * cloud; `k` picks its shape (odd ones are mirrored). */
export function puff(x: number, y: number, r: number, k = 5): P[] {
  const lobes: [number, number, number][] = [[0, 0.08, 0.62], [-0.62, 0.14, 0.42], [-0.26, -0.3, 0.5], [0.3, -0.26, 0.44], [0.66, 0.12, 0.38]];
  const m = k % 2 ? -1 : 1;
  return Array.from({ length: 48 }, (_, i): P => {
    const a = (i / 48) * Math.PI * 2, ux = Math.cos(a), uy = Math.sin(a);
    let d = 0;
    for (const [lx, ly, lr] of lobes) {
      const cx = lx * m, p = ux * cx + uy * ly, q = lr * lr - (cx * cx + ly * ly - p * p);
      if (q >= 0) d = Math.max(d, p + Math.sqrt(q));
    }
    return [x + ux * d * r * 1.1, y + uy * d * r * 0.9];
  });
}

/** A wart: a raised yellow-green bump with a darker rim. */
export function wart(c: Crayon, x: number, y: number, r: number) {
  c.shape(c.potato(x, y, r, r * 0.86, 8, 0.1), TOAD.WART, { over: 0, press: 1.1 }, { w: 3.5 });
  c.tint(c.potato(x + r * 0.2, y + r * 0.25, r * 0.5, r * 0.4, 7, 0.1), TOAD.WART2, { wash: 0.8 });
}

/** A webbed toad foot at (x, y), toes spread along `deg` (0 = left), `s` its size. */
export function toadFoot(c: Crayon, x: number, y: number, deg: number, s: number, col: string) {
  const r = (deg * Math.PI) / 180;
  for (const d of [-34, -6, 22]) {
    const a = r + (d * Math.PI) / 180, u: P = [-Math.cos(a), -Math.sin(a)];
    c.shape(c.band([[x, y], [x + u[0] * 52 * s, y + u[1] * 30 * s + 8 * s]], 26 * s, 20 * s), col, { over: 0 }, { w: 4 });
  }
  c.shape(c.potato(x, y, 30 * s, 22 * s, 8, 0.06), col, { over: 0 }, { w: 0.1 });
}

/**
 * A squat warty toad (« grognon des marais »), turned to the left, sulking in the marsh: half-lidded eyes, brows pulled
 * down, its wide mouth turned down in a pout. When it is cross (often), little puffs of stinging mist steam out of the
 * yellow-green warts on its back.
 */
export default {
  id: '056', slug: 'crapougne', seed: 5601, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const { SKIN, DEEP, BELLY } = TOAD;

    // squatting low, the far legs behind
    shape(c.band([[300, 720], [270, 790], [256, 820]], 60, 50), DEEP, { angle: 80 });
    toadFoot(c, 250, 826, 10, 0.9, DEEP);
    // the wide warty dome, the head flowing into it, a hump at the rump
    shape([[180, 700], [196, 610], [270, 540], [380, 500], [520, 470], [660, 480], [780, 550], [836, 670], [816, 780], [720, 846], [520, 860], [340, 850], [230, 800]], SKIN, { angle: 30, over: 0.5 });
    c.tint([[190, 700], [240, 770], [360, 820], [500, 820], [440, 750], [300, 716]], BELLY, { angle: 20, wash: 0.9 });
    for (const [x, y, r] of [[560, 530, 24], [670, 570, 30], [740, 680, 22], [590, 660, 18]] as const) wart(c, x, y, r);
    // the near hind leg folded on the flank, its foot forward
    openLimb(c, [[740, 720], [640, 700], [580, 760], [600, 830], [680, 852], [780, 820]], SKIN, 1, 5);
    toadFoot(c, 590, 862, 0, 1, SKIN);
    // the near front leg from the flank
    openLimb(c, [[470, 720], [420, 760], [404, 830], [440, 846], [470, 790], [520, 750]], SKIN, 1, 4);
    toadFoot(c, 410, 856, 0, 0.95, SKIN);
    // the eyes bulging on top of the head: sulky, half shut, brows pulled down to the middle
    shape(potato(300, 540, 54, 46, 9, 0.05), SKIN, { angle: 60, over: 0 });
    shape(potato(430, 500, 70, 58, 9, 0.05), SKIN, { angle: 60, over: 0 });
    c.eye(300, 548, 30, 30, TOAD.EYE, { lid: 0.5, skin: SKIN, tilt: -10 });
    c.eye(432, 510, 40, 38, TOAD.EYE, { lid: 0.5, skin: SKIN, tilt: 10 });
    stroke([[256, 500], [328, 520]], { w: 7 });
    stroke([[388, 478], [470, 454]], { w: 7 });
    // the wide mouth turned down in a pout, a puffed cheek
    stroke([[192, 696], [236, 672], [330, 670], [420, 692], [452, 718]], { w: 6 });
    c.cheek(480, 600, 30, 17, TOAD.PINK);
    dot(c, 206, 620);
    // puffs of mist steaming straight out of two warts, each a little bigger as it rises
    c.part('brume', { pivot: [620, 520], motion: 'swing', amp: 3, period: 3.2 }, () => {
      for (const [x, y, r] of [[600, 470, 26], [624, 396, 36], [700, 520, 22], [730, 456, 30]] as const) shape(puff(x, y, r), TOAD.MIST, { angle: 30, over: 0, press: 0.9 }, { w: 3.5, col: TOAD.WART2 });
    });
  },
} satisfies Redraw;

/** Its nostril. */
function dot(c: Crayon, x: number, y: number) {
  c.dot(x, y, 7, 5);
}
