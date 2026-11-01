import type { Crayon, P, Redraw } from './crayon.ts';
import { flame, lineOfAction, openLimb } from './anatomy.ts';

/**
 * Pétillapin grown into a lean fire hare, a speed show-off, turned to the left and stretched flat out in a flying gallop.
 * Its long ears stream back, their tips still smouldering charcoal like the baby's; the fire has moved to its flanks:
 * great tongues of flame grow out of its sides and blaze back past its rump as it runs, and its cotton tail burns too.
 * A small head leaning into the run, a one-sided smirk with a fang. The family's orange, a darker red back, a cream
 * belly, yellow fire.
 */
const ORANGE = '#ec7432', BACK = '#c23a1a', DEEP = '#c4521f', CREAM = '#f8e8c4', YELLOW = '#f6c63c', RED = '#e8502e', CHAR = '#4a3c42', PINK = '#f28aa8';

/** A limb along `path`, `w0` to `w1` wide, its line left open where it grows from the body. */
function leg(c: Crayon, path: P[], w0: number, w1: number, col: string) {
  openLimb(c, c.band(path, w0, w1), col, 1, 2 * path.length - 1);
}

/** A long hare ear from `base`, streaming back at `deg` (0 = up, 90 = straight back): fur, its rounded tip smouldering
 * charcoal with a ragged edge and one glowing crack (the baby's ember tips). */
function ear(c: Crayon, base: P, deg: number, len: number, w: number, col: string) {
  const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  const at = (k: number, m = 0): P => [base[0] + u[0] * len * k + v[0] * m * w, base[1] + u[1] * len * k + v[1] * m * w];
  const prof = [0.6, 0.9, 1, 0.98, 0.9, 0.78, 0.62];
  const outline: P[] = [...prof.map((m, i) => at(i / 6, -m / 2)), at(1.05, -0.2), at(1.08, 0), at(1.05, 0.2), ...prof.map((m, i) => at(i / 6, m / 2)).reverse()];
  c.shape(outline, col, { angle: deg + 90, over: 0.3 });
  const ragged = c.spikes([at(0.8, 0.4), at(0.8, -0.4)], 3, -14);
  c.shape([at(0.8, -0.4), at(0.92, -0.33), at(1.05, -0.2), at(1.08, 0), at(1.05, 0.2), at(0.92, 0.33), ...ragged.slice(0, -1)], CHAR, { angle: deg + 60, over: 0.2 }, { w: 4 }, false);
  c.stroke([at(0.86, -0.12), at(0.94, 0.04), at(1.0, -0.06)], { w: 4, col: '#f2803a' });
}

/** A tongue of fire from `root`, streaming at `deg` (0 = up, 90 = back), `h` long, `w` wide at its root, curling by
 * `bend`: wavy licking edges, a pointed tip, a red heart under a yellow edge. */
function blaze(c: Crayon, root: P, deg: number, h: number, w: number, bend = 0.12) {
  const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [-u[1], u[0]];
  const side = (sg: number, k: number) => Array.from({ length: 13 }, (_, i): P => {
    const t = i / 12, hw = (w / 2) * k * Math.min(1, 0.35 + t * 3) * Math.pow(1 - t, 0.6) * (1 + 0.38 * Math.sin(t * 13 + (sg > 0 ? 0 : 2)));
    const cx = root[0] + u[0] * h * t * (k < 1 ? 0.8 : 1) - v[0] * bend * h * t * t, cy = root[1] + u[1] * h * t * (k < 1 ? 0.8 : 1) - v[1] * bend * h * t * t;
    return [cx + v[0] * hw * sg, cy + v[1] * hw * sg];
  });
  const outline = (k: number): P[] => [...side(1, k), ...side(-1, k).reverse().slice(1)];
  c.shape(outline(1), YELLOW, { angle: deg + 90, over: 0 });
  c.tint(outline(0.78), '#ef6a28', { wash: 0.9 });
  c.tint(outline(0.5), RED, { wash: 0.85, press: 1.15 });
}

export default {
  id: '122', slug: 'brulievre', seed: 12201, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    // a low streak of dust and embers trailing behind its hind feet
    c.part('trainee', { pivot: [860, 700], motion: 'nod', amp: 2, period: 2, decor: true, behind: true }, () => {
      shape(c.band([[836, 690], [900, 688], [972, 684]], 22, 6), RED, { angle: 0, over: 0, wash: 0.6 }, { w: 3 });
      shape(c.band([[870, 716], [930, 714], [968, 712]], 14, 4), YELLOW, { angle: 0, over: 0, wash: 0.6 }, { w: 3 });
    });
    // three speed lines behind
    c.part('vitesse', { pivot: [910, 560], motion: 'nod', amp: 2, period: 2, decor: true, behind: true }, () => {
      stroke([[858, 520], [972, 516]], { w: 5 });
      stroke([[876, 556], [970, 554]], { w: 5 });
      stroke([[864, 592], [960, 592]], { w: 5 });
    });
    // the head's place, leaning into the run
    const [hx, hy, s, tilt] = [196, 452, 0.9, 2];
    const r = (tilt * Math.PI) / 180;
    const T = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
    const t = (pts: P[]) => pts.map(T);
    // the long ears streaming back, the far one behind and shorter (they sway slowly in battle)
    c.part('oreilles', { pivot: T([50, -64]), motion: 'swing', amp: 3, period: 2.8, behind: true }, () => {
      ear(c, T([24, -70]), 70, 330 * s, 64 * s, DEEP);
      ear(c, T([70, -56]), 78, 380 * s, 76 * s, ORANGE);
    });
    // far legs, mostly hidden: the front one tucked back under the chest, the hind one stretched back
    leg(c, [[470, 570], [462, 610], [492, 632]], 46, 30, ORANGE);
    shape(potato(502, 634, 24, 18, 8, 0.06), ORANGE, { angle: 20 });
    leg(c, [[720, 590], [830, 616], [940, 632]], 50, 22, DEEP);
    // the burning cotton tail
    flame(c, 796, 478, 72, 130, 70, YELLOW, RED);
    // the long lean body, stretched flat out: a slim neck, a darker red back, a cream belly
    const spine: P[] = [[266, 486], [350, 512], [460, 526], [580, 520], [690, 504], [770, 488], [800, 474]];
    shape(lineOfAction(spine, [72, 136, 126, 116, 132, 86, 40], [0, 16, 14, 0, 10, 0, 0]), ORANGE, { angle: 8, over: 0.4 });
    c.tint(lineOfAction([[330, 470], [460, 476], [590, 472], [700, 456], [770, 452]], [26, 40, 40, 36, 18]), BACK, { angle: 8, wash: 0.7 });
    c.tint(lineOfAction([[380, 574], [480, 586], [580, 574]], [34, 38, 24]), CREAM, { angle: 8, wash: 0.85 });
    // the near hind leg: a big round haunch on the rump, the long foot stretched straight back from it
    const haunch: P[] = Array.from({ length: 14 }, (_, i): P => [690 + Math.sin((i / 14) * Math.PI * 2) * 116, 540 - Math.cos((i / 14) * Math.PI * 2) * 86]);
    openLimb(c, haunch, ORANGE, 3, 12);
    c.tint(lineOfAction([[640, 470], [700, 462], [760, 470]], [20, 26, 16]), BACK, { angle: 8, wash: 0.6 });
    // the fire on its flanks: along the lower flank, from behind the shoulder to the hip, the fur turns to fire, tongues
    // of different lengths licking straight back along the body and past the rump like a wake (they sway slowly in battle)
    c.part('flammes', { pivot: [480, 594], motion: 'swing', amp: 2, period: 3 }, () => {
      blaze(c, [590, 570], 66, 330, 120, 0.06);
      blaze(c, [420, 584], 70, 360, 118, 0.08);
      blaze(c, [530, 580], 64, 420, 134, 0.1);
      blaze(c, [470, 588], 68, 500, 146, 0.12);
    });
    leg(c, [[770, 584], [870, 614], [966, 640]], 72, 30, ORANGE);
    // the near front leg reaching far forward, bent at the wrist, a round mitten paw
    leg(c, [[410, 548], [290, 616], [150, 660]], 74, 38, ORANGE);
    shape(potato(118, 672, 44, 26, 9, 0.05), ORANGE, { angle: 20 });
    // the head, small, in profile
    shape(t([[-160, 14], [-150, -22], [-96, -58], [-10, -78], [66, -70], [112, -32], [118, 26], [84, 70], [16, 90], [-62, 80], [-124, 56]]), ORANGE, { angle: 70, over: 0.45 });
    c.tint(t([[-40, -70], [40, -74], [100, -40], [40, -50]]), BACK, { wash: 0.6 });
    c.tint(t([[-158, 22], [-130, 60], [-60, 78], [0, 70], [-40, 40], [-110, 30]]), CREAM, { angle: 60, wash: 0.75 });
    // cocky: one eye, its upper lid lower on the outer side, the outer brow lifted, a one-sided smirk with the fang on
    // the raised side
    c.eye(...T([-40, -20]), 24 * s, 30 * s, '#241c38', { lid: 0.2, skin: ORANGE, tilt: tilt + 16 });
    stroke(t([[-78, -50], [-36, -56], [6, -76]]), { w: 7 });
    c.cheek(...T([40, 36]), 26 * s, 16 * s, PINK);
    dot(...T([-156, 0]), 9 * s, 7 * s, '#e07a96');
    stroke(t([[-156, 10], [-150, 28]]), { w: 4 });
    stroke(t([[-156, 34], [-128, 44], [-96, 40], [-70, 20]]), { w: 5 });
    shape(t([[-102, 40], [-88, 37], [-94, 58]]), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
    c.part('paupieres', { pivot: T([-40, -20]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-40, -20]), 24 * s, 30 * s, ORANGE);
    });
  },
} satisfies Redraw;
