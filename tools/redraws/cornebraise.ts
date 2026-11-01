import type { Crayon, P, Redraw } from './crayon.ts';
import { flame, openLimb } from './anatomy.ts';

/**
 * A stubborn little fire bull calf (« têtu »), turned to the left: it plants itself, head down low, and scrapes the
 * ground back with its near front hoof (scrape marks, two clods flying), ready to charge anything. A big round head, a
 * stubborn frown over big shiny eyes, a pout, two horn nubs glowing like embers (Fournacorne's blazing horns to come),
 * a little puff of smoke from its nostril. A deep red-brown coat, a cream muzzle and belly, ember hooves and tail tuft.
 */
export const COAT = '#9c3a26', DEEP = '#74281c', CREAM = '#f6e2bc', EMBER = '#f39a32', YEL = '#f8d04a', RED = '#e2462a';
export const SMOKE = '#bdb5bc', PINK = '#ef8fa4', NAVY = '#241c38', HOOF_FAR = '#d9802a';

/** A leg along its joints `pts` (top first), `ws` wide at each, its line left open where it grows from the body. */
export function limb(c: Crayon, pts: P[], ws: number[], col: string) {
  const L: P[] = [], R: P[] = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
    const l = Math.hypot(bx - ax, by - ay) || 1, h = ws[i] / 2;
    L.push([x + ((by - ay) / l) * h, y - ((bx - ax) / l) * h]);
    R.push([x - ((by - ay) / l) * h, y + ((bx - ax) / l) * h]);
  });
  openLimb(c, [...L, ...R.reverse()], col, 1, 2 * pts.length - 1);
}

/**
 * A glowing cloven hoof: its top (the fetlock) at `p`, pointing `deg` (0 = down), `w` wide, its toe to the left. Two
 * toes split by a notch, a brighter band at the top.
 */
export function hoof(c: Crayon, p: P, deg: number, w: number, col = EMBER) {
  const a = (deg * Math.PI) / 180, d: P = [-Math.sin(a), Math.cos(a)], s: P = [Math.cos(a), Math.sin(a)];
  const at = (u: number, v: number): P => [p[0] + s[0] * u * w + d[0] * v * w, p[1] + s[1] * u * w + d[1] * v * w];
  c.shape([at(-0.4, -0.04), at(0.4, -0.04), at(0.5, 0.3), at(0.48, 0.62), at(0.04, 0.64), at(-0.02, 0.4), at(-0.1, 0.64), at(-0.62, 0.62), at(-0.56, 0.3)],
    col, { angle: deg + 10, over: 0, press: 1.15 }, { w: 4 }, false);
  c.tint([at(-0.38, 0), at(0.38, 0), at(0.42, 0.18), at(-0.46, 0.2)], YEL, { wash: 0.85 });
}

/** A little puff of smoke at (x, y), drifting toward `dx` (−1 left, 1 right), `s` its size. */
export function puff(c: Crayon, x: number, y: number, s: number, dx = -1) {
  const bumps: [number, number, number][] = [[0, 0, 20], [dx * 24, -12, 24], [dx * 52, -4, 18]];
  for (const [bx, by, r] of bumps) c.shape(c.potato(x + bx * s, y + by * s, r * s, r * s * 0.85, 8, 0.06), SMOKE, { angle: 30, over: 0, wash: 0.5 }, { w: 3 });
}

export default {
  id: '080', slug: 'cornebraise', seed: 8001, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot } = c;
    // the tail flicked up behind, its ember tuft (it swishes slowly in battle)
    c.part('queue', { pivot: [750, 516], motion: 'swing', amp: 5, period: 2.4, behind: true }, () => {
      const path: P[] = [[750, 516], [800, 470], [828, 420], [846, 370]];
      shape(c.band(path, 32, 16), COAT, { angle: 40, over: 0.2 });
      const [tx, ty] = path[3];
      shape([[tx - 18, ty + 8], [tx - 26, ty - 30], [tx - 6, ty - 60], [tx + 4, ty - 34], [tx + 20, ty - 52], [tx + 24, ty - 16], [tx + 14, ty + 10]], EMBER, { angle: 80, over: 0 }, { w: 4 });
      c.tint([[tx - 10, ty], [tx - 10, ty - 30], [tx + 10, ty - 26], [tx + 8, ty]], YEL, { wash: 0.85 });
    });
    // the far legs, darker, half hidden: the front one planted, the hind one with its hock bending back
    limb(c, [[424, 720], [416, 790], [413, 812], [410, 858]], [88, 50, 56, 42], DEEP);
    hoof(c, [410, 858], 0, 60, HOOF_FAR);
    limb(c, [[730, 610], [740, 720], [774, 800], [768, 858]], [124, 62, 44, 42], DEEP);
    hoof(c, [768, 858], 0, 56, HOOF_FAR);
    // the body: a round deep chest under the neck, the back rising from the shoulders to a small round rump (ready to
    // charge)
    shape([[300, 720], [300, 640], [340, 584], [420, 550], [500, 530], [600, 508], [680, 486], [740, 488], [778, 530], [780, 600], [752, 660], [690, 700], [600, 722], [520, 750], [440, 774], [366, 760]],
      COAT, { angle: 20, over: 0.4 });
    c.tint(c.band([[430, 756], [530, 732], [640, 702]], 34, 18), CREAM, { angle: 10, wash: 0.85 });
    // the near hind leg: a big rounded thigh on the rump, the hock bending back, the cannon straight down
    limb(c, [[686, 600], [670, 716], [726, 800], [722, 860]], [160, 74, 46, 44], COAT);
    hoof(c, [722, 860], 0, 62);
    // the near front leg scraping: the knee bent, the cannon swept back, the hoof's toe dragging the ground, scrape
    // marks behind it
    limb(c, [[500, 716], [478, 792], [494, 812], [550, 840]], [100, 56, 60, 46], COAT);
    hoof(c, [550, 840], -58, 60);
    stroke([[604, 900], [690, 896]], { w: 5 });
    stroke([[620, 920], [700, 916]], { w: 4 });

    // the big round head held down low
    const [hx, hy, tilt] = [290, 672, -30];
    const r = (tilt * Math.PI) / 180;
    const T = ([px, py]: P): P => [hx + px * Math.cos(r) - py * Math.sin(r), hy + px * Math.sin(r) + py * Math.cos(r)];
    const t = (pts: P[]) => pts.map(T);
    /** A horn nub glowing like an ember, its root sunk under the head's outline. */
    const nub = (bx: number, by: number, k: number, lean: number) => {
      shape(t([[bx - 28 * k, by + 24], [bx - 24 * k + lean * 0.4, by - 28 * k], [bx + lean, by - 60 * k], [bx + 22 * k + lean * 0.6, by - 28 * k], [bx + 28 * k, by + 24]]), EMBER, { angle: 80, over: 0, press: 1.15 }, { w: 4 });
      // ember: dark red at the root, orange, a white-hot tip
      c.tint(t([[bx - 28 * k, by + 24], [bx + 28 * k, by + 24], [bx + 22 * k + lean * 0.4, by - 22 * k], [bx - 24 * k + lean * 0.3, by - 22 * k]]), '#b8321e', { wash: 0.9, press: 1.2 });
      c.tint(t([[bx - 14 * k + lean * 0.5, by - 26 * k], [bx + lean * 0.95, by - 56 * k], [bx + 14 * k + lean * 0.6, by - 26 * k]]), YEL, { wash: 0.95 });
      c.tint(t([[bx - 6 * k + lean * 0.8, by - 42 * k], [bx + lean, by - 58 * k], [bx + 6 * k + lean * 0.8, by - 42 * k]]), '#fff4c8', { wash: 1 });
    };
    // the far ear and far nub, behind the head
    shape(t([[-120, -76], [-176, -96], [-190, -72], [-144, -52]]), DEEP, { angle: 10 });
    nub(-62, -112, 0.8, -12);
    nub(48, -124, 1, -8);
    shape(t([[-170, 0], [-160, -64], [-110, -118], [-20, -144], [80, -132], [146, -78], [160, 0], [136, 70], [70, 112], [-20, 124], [-110, 110], [-158, 64]]), COAT, { angle: 78, over: 0.45 });
    // a tiny curl of flame on the poll between the nubs (the fire to come)
    flame(c, ...T([-8, -136]), tilt - 10, 50, 32, YEL, RED);
    // the big cream muzzle, low and forward
    shape(t([[-196, 70], [-186, 26], [-140, 8], [-70, 10], [-10, 32], [8, 76], [-20, 118], [-90, 134], [-160, 124], [-194, 104]]), CREAM, { angle: 20, over: 0.2 });
    // the near ear sticking out sideways
    shape(t([[126, -76], [214, -96], [236, -62], [190, -36], [136, -30]]), COAT, { angle: 10, over: 0.2 });
    c.tint(t([[150, -64], [208, -78], [214, -60], [160, -46]]), PINK, { wash: 0.6 });
    // stubborn: big shiny eyes glaring up from under brows pulled down to the nose, a pout, a round cheek
    c.eye(...T([-96, -40]), 26, 34, NAVY, { lid: 0.24, skin: COAT, tilt: tilt + 16 });
    c.eye(...T([4, -42]), 34, 42, NAVY, { lid: 0.24, skin: COAT, tilt: tilt - 16 });
    stroke(t([[-134, -98], [-104, -90], [-70, -74]]), { w: 7 });
    stroke(t([[-34, -78], [6, -98], [50, -104]]), { w: 7.5 });
    c.cheek(...T([70, 30]), 30, 18, PINK);
    dot(...T([-168, 56]), 9, 12, '#6a3a34');
    stroke(t([[-128, 108], [-106, 98], [-82, 106]]), { w: 5 });
    // a little puff of smoke from its nostril
    puff(c, ...T([-224, 30]), 0.8);
    c.part('paupieres', { pivot: T([-40, -40]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-96, -40]), 26, 34, COAT);
      c.lid(...T([4, -42]), 34, 42, COAT);
    });
  },
} satisfies Redraw;
