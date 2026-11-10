import type { P, Redraw } from './crayon.ts';
import { fishBody } from './sautevase.ts';

/**
 * A baby flying fish, the daredevil: a plump little blue fish bursting out of a wave in a leap up and to the left, its
 * two big fins spread like wings, its forked tail still flicking the water. Blue back, white belly, golden wing-fins
 * scalloped between their rays, one huge happy eye and a wide « D » of a grin: it has just found out it can fly. Its
 * flaw: it never knows where it will land.
 */
export const BLUE = '#3f7fd8', BDEEP = '#2c5aa8', SILVER = '#eef4fa', GOLD = '#f6c63c', GDEEP = '#e0a02a', SEA = '#8fd8e8';

/** A wing-fin: rays fanning from `root` to each tip, the membrane scalloped between them. */
export function wingFin(c: { shape: (p: P[], col: string, o?: object, l?: object, round?: boolean) => void; stroke: (p: P[], l?: object) => void }, rootP: P, tips: P[], col: string, ray = '#b07a1a') {
  const edge: P[] = [];
  tips.forEach((t, i) => {
    edge.push(t);
    const n = tips[i + 1];
    if (n) edge.push([(t[0] + n[0]) / 2 * 0.86 + rootP[0] * 0.14, (t[1] + n[1]) / 2 * 0.86 + rootP[1] * 0.14]);
  });
  c.shape([rootP, ...edge], col, { angle: 20, over: 0.15 });
  for (const t of tips.slice(1, -1)) c.stroke([[rootP[0] * 0.85 + t[0] * 0.15, rootP[1] * 0.85 + t[1] * 0.15], [rootP[0] * 0.06 + t[0] * 0.94, rootP[1] * 0.06 + t[1] * 0.94]], { w: 3.5, col: ray });
}

/** A forked tail fin from `root`, its two lobes toward `a` and `b`. */
export function forkTail(c: Parameters<typeof wingFin>[0], rootP: P, a: P, b: P, col = GOLD) {
  const m: P = [(a[0] + b[0]) / 2 * 0.7 + rootP[0] * 0.3, (a[1] + b[1]) / 2 * 0.7 + rootP[1] * 0.3];
  c.shape([[rootP[0], rootP[1] - 20], a, m, b, [rootP[0], rootP[1] + 20]], col, { angle: 30, over: 0 });
}

export default {
  id: '137', slug: 'fretivole', seed: 13703, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke } = c;
    // the curling wave it bursts out of, foam on its crest, spray thrown up
    c.part('vague', { pivot: [740, 860], motion: 'nod', amp: 2, period: 2.4, decor: true, behind: true }, () => {
      // a wave rising from the right and rolling over to the left at its crest, foam scallops along the curl, spray
      shape([[980, 960], [940, 860], [880, 790], [800, 760], [720, 770], [660, 810], [640, 860], [680, 880], [700, 840], [740, 830], [780, 860], [800, 960]], SEA, { angle: 60, over: 0.2 }, { w: 4 });
      c.paper([[640, 860], [660, 806], [720, 768], [800, 756], [860, 776], [830, 790], [800, 778], [770, 798], [740, 790], [712, 812], [690, 806], [672, 840]], { w: 3.5 });
      c.dot(620, 790, 12, 15, SEA);
      c.dot(590, 830, 9, 12, SEA);
      c.dot(650, 740, 8, 11, SEA);
    });
    // the forked tail still in the water, its lower lobe longer
    c.part('queue', { pivot: [760, 760], motion: 'swing', amp: 5, period: 1, behind: true }, () => {
      forkTail(c, [750, 760], [880, 690], [870, 920]);
    });
    // the far wing-fin, from the same shoulder, spread up behind
    c.part('aileLoin', { pivot: [470, 500], motion: 'flap', amp: 6, period: 0.9, behind: true }, () => {
      wingFin(c, [470, 500], [[500, 380], [560, 290], [640, 230], [730, 220], [740, 290]], GDEEP);
    });
    // the plump body leaping up and to the left: a pointed fish snout, deepest at the shoulder, a thin tail stalk
    fishBody(c, [[230, 370], [400, 450], [560, 570], [700, 690], [760, 750]], (k) => (k < 0.26 ? 50 + (k / 0.26) * 270 : 320 - ((k - 0.26) / 0.74) * 290), BLUE, SILVER, 36, 9);
    c.tint([[400, 360], [520, 440], [640, 550], [560, 500], [440, 420]], BDEEP, { angle: 40, wash: 0.5 });
    stroke([[430, 390], [460, 450], [450, 520]], { w: 4.5 });
    // the near wing-fin, big, from the shoulder, spread forward and down
    c.part('aile', { pivot: [470, 520], motion: 'flap', amp: 7, period: 0.9 }, () => {
      wingFin(c, [470, 520], [[540, 640], [480, 750], [380, 810], [280, 810], [230, 750]], GOLD);
    });
    // one huge happy eye, high on the head (a fish in profile shows one)
    c.eye(370, 380, 52, 58);
    stroke([[320, 302], [370, 286], [420, 302]], { w: 5 });
    // a wide « D » grin at the tip of its snout
    shape([[220, 392], [262, 404], [296, 404], [272, 446], [236, 440]], '#7a3040', { angle: 90, over: 0 }, { w: 4 });
    c.dot(264, 432, 12, 7, '#f28aa8');
    c.cheek(370, 470, 26, 15);
    c.part('paupieres', { pivot: [350, 370], motion: 'blink', extra: true }, () => {
      c.lid(370, 380, 52, 58, BLUE);
    });
  },
} satisfies Redraw;
