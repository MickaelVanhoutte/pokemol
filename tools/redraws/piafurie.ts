import type { P, Redraw } from './crayon.ts';
import { lineOfAction } from './anatomy.ts';

/**
 * Piafou grown into the champion of the sky (« champion du ciel »), turned to the left: a lean swallow hanging in the
 * air like a banner on FOUR sickle-blade wings, one pair raised high and wide, a second pair spread lower (their pale steel cutting edges are its weapons),
 * its head held high in profile with a fierce proud stare, a sleek crest swept back, two very long tail streamers.
 * A swallow's colours: glossy navy, a rusty red forehead and throat, a cream belly.
 */
export default {
  id: '036', slug: 'piafurie', seed: 3691, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke } = c;
    const NAVY = '#34488c', DEEP = '#232f5e', RUST = '#d9562e', CREAM = '#f4ecd6', BEAK = '#4a4458', EDGE = '#a9c8ee';
    const CLAW = '#2a2432', LEG = '#5a4e5e';

    /**
     * A sickle-blade wing along `spine` (root to tip): its cutting edge (side `lead`, 0 or 1) pale steel, a white glint
     * along it.
     */
    const blade = (spine: P[], widths: number[], down: number[], col: string, lead: 0 | 1) => {
      const out = lineOfAction(spine, widths, down), n = spine.length;
      const edge = lead === 0 ? out.slice(0, n) : out.slice(n).reverse();
      const inner = edge.map(([x, y], i): P => [x + (spine[i][0] - x) * 0.5, y + (spine[i][1] - y) * 0.5]);
      shape(out, col, { angle: 20, over: 0.3 });
      shape([...edge.slice(1), ...inner.slice(1, -1).reverse()], EDGE, { angle: 20, over: 0, press: 1.2 }, { w: 3.5 });
      c.shine(edge.slice(1, -1).map(([x, y], i): P => [x + (spine[i + 1][0] - x) * 0.14, y + (spine[i + 1][1] - y) * 0.14]), 6);
    };
    /**
     * The face on its head in profile (the head itself is the top of the body's outline), facing left at (hx, hy), held
     * high: one fierce eye, a sharp beak, a sleek crest swept back with a pale edge.
     */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      c.part('huppe', { pivot: H([60, -60]), motion: 'swing', amp: 2, period: 2.8, behind: true }, () => {
        const crest = h([[20, -60], [90, -104], [160, -136], [230, -150]]);
        const out = lineOfAction(crest, [76, 50, 24, 3]);
        shape(out, NAVY, { angle: 50, over: 0 });
        shape([...out.slice(1, 4), ...crest.slice(1, 3).reverse()], EDGE, { angle: 50, over: 0 }, { w: 3 });
      });
      // the rusty red of its forehead and throat, its eye set in it
      const face: P[] = [[-112, 10], [-96, -40], [-50, -56], [10, -40], [24, 10], [40, 70], [70, 100], [-10, 106], [-90, 74]];
      shape(h(face), RUST, { angle: 70, over: 0.2 }, { w: 0.1 });
      stroke(h(face.slice(1, 7)), { w: 3.5 });
      // the beak, short, sharp and closed
      shape(h([[-104, -8], [-150, -2], [-220, 18], [-150, 30], [-100, 30]]), BEAK, { angle: 0, over: 0 }, { w: 4 }, false);
      stroke(h([[-204, 19], [-140, 16], [-100, 12]]), { w: 4 });
      // fierce and proud: the eye open and shining, a hard straight brow set down toward the beak
      c.eye(...H([-36, -8]), 22, 27, '#161226');
      stroke(h([[-80, -24], [8, -50]]), { w: 9 }, false);
      c.part('paupieres', { pivot: H([-36, -8]), motion: 'blink', extra: true }, () => c.lid(...H([-36, -8]), 22, 27, RUST));
    };
    /** Head, neck and lean body in one outline along `spine` (crown to tail root): navy, a sharp cream keel down the front. */
    const body = (spine: P[]) => {
      const out = lineOfAction(spine, [80, 190, 120, 170, 120, 90, 50], [0, 0, 0, 40, 10, 0, 0]), n = spine.length;
      shape(out, NAVY, { angle: 70, over: 0.4 });
      const front = out.slice(n).reverse();
      const inner = front.map(([x, y], i): P => [x + (spine[i][0] - x) * 1.1, y + (spine[i][1] - y) * 1.1]);
      shape([...front.slice(2, 6), ...inner.slice(2, 6).reverse()], CREAM, { angle: 80, over: 0.2 }, { w: 3 });
    };
    /** Two very long streamers from `root`, sharp tips. */
    const streamers = (root: P, tips: P[]) => {
      for (const [tx, ty] of tips) shape(lineOfAction([root, [(root[0] + tx) / 2 + 14, (root[1] + ty) / 2], [tx, ty]], [62, 24, 3]), DEEP, { angle: 80, over: 0.2 });
    };
    /** Strong talons reaching forward and down, open: a thick shank, three hooked front toes and one behind. */
    const talons = (top: P, foot: P, col = LEG) => {
      shape(c.band([top, foot], 34, 24), col, { angle: 70, over: 0 }, { w: 4 });
      for (const [dx, dy] of [[-44, 8], [-20, 30], [8, 34], [30, -6]] as const) {
        stroke([foot, [foot[0] + dx, foot[1] + dy]], { w: 12, col });
        shape([[foot[0] + dx - 8, foot[1] + dy - 4], [foot[0] + dx + 6, foot[1] + dy + 2], [foot[0] + dx * 1.15 - 4, foot[1] + dy + 26]], CLAW, { over: 0 }, { w: 3 }, false);
      }
    };

    // a banner of four blades: the first pair raised high in a wide V, a smaller second pair under them,
    // curved like crescents, their tips curling back, body upright, talons out, streamers hanging long
    c.part('aileLoin', { pivot: [450, 420], motion: 'swing', amp: 2, period: 3, behind: true }, () => {
      blade([[460, 410], [380, 300], [270, 200], [160, 130], [50, 110]], [140, 130, 100, 54, 3], [0, 10, 10, 6, 0], DEEP, 1);
      blade([[452, 440], [380, 432], [310, 452], [262, 502], [252, 570], [278, 620]], [124, 116, 96, 66, 34, 3], [0, 8, 8, 6, 4, 0], DEEP, 1);
    });
    streamers([560, 690], [[680, 965], [560, 975]]);
    // the far leg, shorter and darker, its talons partly behind the near one's
    talons([506, 606], [476, 660], '#463c4a');
    talons([470, 600], [416, 676]);
    body([[396, 200], [410, 270], [436, 360], [454, 460], [490, 560], [530, 630], [560, 690]]);
    c.part('aile', { pivot: [520, 440], motion: 'swing', amp: 2, period: 3 }, () => {
      blade([[522, 456], [610, 444], [692, 466], [746, 520], [758, 590], [732, 646]], [132, 122, 100, 70, 36, 3], [0, 8, 8, 6, 4, 0], NAVY, 0);
      blade([[510, 430], [620, 300], [740, 190], [860, 110], [960, 80]], [150, 140, 108, 58, 3], [0, 10, 10, 6, 0], NAVY, 0);
    });
    head(410, 290, 0.9, -4);
  },
} satisfies Redraw;
