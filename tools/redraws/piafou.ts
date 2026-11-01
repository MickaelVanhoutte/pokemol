import type { P, Redraw } from './crayon.ts';
import { lineOfAction } from './anatomy.ts';

/**
 * An agile young swallow that always wants to arrive first (« toujours première »), turned to the left: it streaks low
 * and long just over the ground, wings swept back, a short fork to its tail, a determined grin on its beak. A swallow's
 * colours: glossy navy back, wings and tail, a rusty red face and throat, a cream belly; a pale steel-blue stripe along
 * the leading edge of its wing (the blade it will grow).
 */
export default {
  id: '013', slug: 'piafou', seed: 1361, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const RUST = '#d9562e', NAVY = '#34488c', DEEP = '#232f5e', CREAM = '#f4ecd6', BEAK = '#4a4458', GROUND = '#b8b0a6', EDGE = '#a9c8ee';

    /** A long pointed wing along `spine` (root to tip), `widths` wide, its trailing side widened by `down`. */
    const wing = (spine: P[], widths: number[], down: number[], col: string, edged = false) => {
      const out = lineOfAction(spine, widths, down);
      shape(out, col, { angle: 20, over: 0.3 });
      // its leading edge already pale: the blade it will grow
      if (edged) shape([...out.slice(1, spine.length), ...out.slice(1, spine.length - 1).map(([x, y], i): P => [x + (spine[i + 1][0] - x) * 0.75, y + (spine[i + 1][1] - y) * 0.75]).reverse()], EDGE, { angle: 20, over: 0, press: 1.2 }, { w: 4 });
      const n = spine.length;
      stroke([spine[n - 3], spine[n - 2]].map(([x, y]): P => [x + 6, y + 10]), { w: 3.5 });
    };
    const fork = (root: P, tips: P[], w: number, col: string) => {
      for (const [tx, ty] of tips) shape(lineOfAction([root, [(root[0] + tx) / 2, (root[1] + ty) / 2], [tx, ty]], [w, w * 0.45, 4]), col, { angle: 10, over: 0.2 });
    };
    /**
     * Head and body in one outline (from the front of its face to its tail), tipped `rot` degrees round its face at
     * (hx, hy): a brown cap and back, the yellow face and belly, one keen eye, a grin on its beak.
     */
    const bird = (hx: number, hy: number, rot: number, wings: { far: P[]; near: P[] }) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + x * Math.cos(r) - y * Math.sin(r), hy + x * Math.sin(r) + y * Math.cos(r)];
      const h = (pts: P[]) => pts.map(H);
      wing(h(wings.far), [100, 90, 50, 6], [0, 10, 10, 0], DEEP);
      fork(H([560, 10]), h([[730, -20], [710, 70]]), 66, DEEP);
      shape(lineOfAction(h([[-90, 0], [-50, -4], [20, 0], [100, 14], [240, 24], [400, 24], [560, 10]]), [80, 180, 196, 150, 176, 130, 50], [0, 0, 10, 10, 10, 6, 0]), NAVY, { angle: 10 + rot, over: 0.4 });
      // the yellow face runs on down its throat: only its edge under the cap is drawn
      const face: P[] = [[-92, 6], [-70, -40], [-10, -56], [44, -24], [64, 30], [110, 80], [40, 104], [-40, 90], [-86, 50]];
      shape(h(face), RUST, { angle: 70, over: 0.2 }, { w: 0.1 });
      stroke(h(face.slice(0, 6)), { w: 3.5 });
      c.tint(lineOfAction(h([[60, 80], [200, 100], [340, 96], [460, 66]]), [50, 64, 50, 16]), CREAM, { angle: 10, wash: 0.85 });
      // the beak: long and pointed, its gape running back and curling up into a grin at the corner
      shape(h([[-82, -6], [-130, -4], [-214, 14], [-130, 34], [-76, 36]]), BEAK, { angle: 0, over: 0 }, { w: 4 }, false);
      stroke(h([[-196, 16], [-120, 18], [-70, 22]]), { w: 4.5 });
      // a determined grin: the corner of its beak pulled up into its cheek
      stroke(h([[-84, 22], [-50, 38], [-18, 30], [2, 2]]), { w: 8 });
      stroke(h([[2, 2], [6, -8]]), { w: 6 });
      // determined: one keen eye, a brow slanted hard down to the beak
      c.eye(...H([-4, -18]), 25, 32, '#161226');
      stroke(h([[46, -70], [-46, -40]]), { w: 8.5 }, false);
      c.part('aile', { pivot: H(wings.near[0]), motion: 'swing', amp: 3, period: 2.2 }, () => wing(h(wings.near), [130, 110, 60, 6], [0, 20, 16, 0], NAVY, true));
      c.part('paupieres', { pivot: H([-4, -18]), motion: 'blink', extra: true }, () => c.lid(...H([-4, -18]), 25, 32, RUST));
    };

    c.part('vitesse', { pivot: [520, 860], motion: 'swing', amp: 1, period: 2, decor: true }, () => {
      c.tint(potato(500, 840, 280, 18, 10, 0.04), GROUND, { wash: 0.6 });
      for (const [x, y, l] of [[860, 740, 100], [820, 790, 130]] as const) stroke([[x, y], [x + l, y]], { w: 5 });
    });
    // wings swept back and a little up, like a dart
    bird(210, 620, 0, { far: [[300, -30], [420, -110], [560, -200], [720, -270]], near: [[240, 0], [380, -60], [540, -130], [750, -180]] });
  },
} satisfies Redraw;
