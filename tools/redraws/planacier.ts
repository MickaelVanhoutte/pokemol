import type { P, Redraw } from './crayon.ts';

/**
 * A proud daredevil flying squirrel (« fonceur fier »), turned to the left: it dives at its foe, its four paws stretched
 * out, the flight membranes between them grown into jointed steel plates like armour, its bushy chestnut tail streaming
 * behind as a rudder, its big eyes fixed on the target.
 */
export default {
  id: '061', slug: 'planacier', seed: 6101, size: [1000, 1000], tilt: -22,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const FUR = '#b8642e', DEEP = '#8e4624', CREAM = '#f6e2c0', STEEL = '#8f9bb2', STEEL2 = '#aab5c8', SDARK = '#5d6880', SKY = '#5cc3ee';
    const NOSE = '#3a2a2e';

    // where its four paws hold the membranes out, spread wide
    const fn: P = [270, 770], bn: P = [700, 800], ff: P = [330, 250], bf: P = [700, 250];

    /** A membrane of steel plates between a front paw `f` and a back paw `b`, from the body edge (`r0` to `r1`), its free
     * edge curving in toward the body by `sag`; jointed bands along it, a sky-blue edge. */
    const membrane = (r0: P, r1: P, f: P, b: P, sag: number, col: string, near: boolean) => {
      const mid: P = [(f[0] + b[0]) / 2, (f[1] + b[1]) / 2], bm: P = [(r0[0] + r1[0]) / 2, (r0[1] + r1[1]) / 2];
      const dx = bm[0] - mid[0], dy = bm[1] - mid[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l];
      // k = 0 is the free edge, sagging in toward the body; k = 1 the body's edge
      const edge = (k: number): P[] => Array.from({ length: 7 }, (_, i): P => {
        const t = i / 6, s = Math.sin(Math.PI * t) * sag;
        const fx = f[0] + (b[0] - f[0]) * t + u[0] * s, fy = f[1] + (b[1] - f[1]) * t + u[1] * s;
        const bx = r0[0] + (r1[0] - r0[0]) * t, by = r0[1] + (r1[1] - r0[1]) * t;
        return [fx + (bx - fx) * k, fy + (by - fy) * k];
      });
      const outer = edge(0);
      // stiff plates: straight-sided, overlapping like roof tiles from the body out, a darker lip under each
      shape([r0, ...outer, r1], col, { angle: near ? 10 : 30, over: 0.2 }, { col: SDARK, w: 4.5 }, false);
      for (const k of [0.32, 0.64]) {
        const band = edge(k);
        c.tint([...band, ...edge(k - 0.1).reverse()], SDARK, { wash: 0.5 });
        stroke(band, { w: 5.5, col: SDARK }, false);
      }
      // the joints between the plates, across the bands, and a rivet where each joint crosses a band
      for (const i of [2, 4]) {
        stroke([edge(0)[i], edge(0.32)[i], edge(0.64)[i], edge(0.94)[i]], { w: 4.5, col: SDARK }, false);
        for (const k of [0.32, 0.64]) dot(...edge(k)[i], 7, 7, SDARK);
      }
      for (const k of [0.32, 0.64]) for (const i of [1, 3, 5]) dot(...edge(k)[i], 5, 5, SDARK);
      stroke(outer.slice(1, -1), { w: 6, col: SKY }, false);
      if (near) for (const k of [0.16, 0.48]) c.shine(edge(k).slice(1, 3), 5);
    };
    /** A limb from `a` to the paw at `p`, chestnut, a small paw gripping the plate's corner. */
    const limb = (a: P, p: P, w: number, col: string) => {
      shape(c.band([a, [(a[0] + p[0]) / 2, (a[1] + p[1]) / 2], p], w, w * 0.6), col, { angle: 60, over: 0 });
      shape(potato(p[0], p[1], w * 0.45, w * 0.36, 8, 0.06), col, { over: 0 }, { w: 4 });
      for (const d of [-1, 0, 1]) stroke([[p[0] + d * w * 0.18, p[1]], [p[0] + d * w * 0.26 + (p[0] - a[0]) * 0.06, p[1] + (p[1] - a[1]) * 0.06]], { w: 3.5 });
    };

    // its bushy tail streaming out behind, a rudder (it sways in battle)
    c.part('queue', { pivot: [640, 500], motion: 'swing', amp: 3, period: 1.6, behind: true }, () => {
      shape([[620, 470], [720, 420], [820, 380], [900, 380], [960, 420], [950, 470], [900, 520], [820, 560], [720, 560], [630, 540]], FUR, { angle: 20, over: 0.3 });
      c.tint([[720, 470], [840, 450], [930, 440], [840, 500], [730, 510]], DEEP, { wash: 0.6 });
      for (const [x, y] of [[860, 386], [930, 410], [920, 500]] as const) stroke([[x, y], [x + 26, y - 4]], { w: 4 });
    });
    // the far membrane and limbs, behind the body
    limb([420, 450], ff, 46, DEEP);
    limb([600, 460], bf, 50, DEEP);
    membrane([420, 440], [600, 450], ff, bf, 60, STEEL, false);
    // the body, a cream belly
    shape(potato(510, 500, 160, 96, 12, 0.03), FUR, { angle: 20, over: 0.35 });
    c.tint(potato(500, 540, 120, 44, 10, 0.05), CREAM, { wash: 0.8 });
    // the near membrane and limbs, in front
    membrane([400, 560], [620, 570], fn, bn, 70, STEEL2, true);
    limb([400, 540], fn, 52, FUR);
    limb([620, 550], bn, 56, FUR);
    // the head: round ears, a cream muzzle, big determined eyes, a cocky grin with one tooth
    const hx = 300, hy = 470;
    c.part('oreilles', { pivot: [hx + 20, hy - 80], motion: 'swing', amp: 2, period: 2.4, behind: true }, () => {
      shape(potato(hx - 40, hy - 92, 40, 46, 10, 0.05), DEEP, { angle: 80, over: 0 });
      shape(potato(hx + 60, hy - 100, 48, 54, 10, 0.05), FUR, { angle: 80, over: 0 });
      c.tint(potato(hx + 60, hy - 96, 26, 30, 8, 0.05), '#f2b8a0', { wash: 0.8 });
    });
    shape(potato(hx, hy, 116, 104, 12, 0.03), FUR, { angle: 75, over: 0.35 });
    c.tint([[hx - 120, hy + 10], [hx - 80, hy - 20], [hx - 20, hy + 10], [hx + 10, hy + 70], [hx - 60, hy + 96], [hx - 110, hy + 60]], CREAM, { wash: 0.85 });
    const e1: P = [hx - 52, hy - 22], e2: P = [hx + 32, hy - 30];
    c.eye(e1[0], e1[1], 32, 40, '#241c38', { lid: 0.1, skin: FUR, tilt: 6 });
    c.eye(e2[0], e2[1], 38, 46, '#241c38', { lid: 0.1, skin: FUR, tilt: -6 });
    stroke([[e1[0] - 30, e1[1] - 58], [e1[0] + 24, e1[1] - 50]], { w: 6 });
    stroke([[e2[0] - 26, e2[1] - 56], [e2[0] + 40, e2[1] - 64]], { w: 6 });
    dot(hx - 118, hy + 24, 15, 11, NOSE);
    stroke([[hx - 108, hy + 50], [hx - 80, hy + 62], [hx - 48, hy + 50]], { w: 5 });
    shape([[hx - 88, hy + 59], [hx - 68, hy + 60], [hx - 72, hy + 82], [hx - 86, hy + 80]], '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
    for (const dy of [14, 34]) stroke([[hx - 100, hy + dy], [hx - 150, hy + dy - 6 + dy * 0.3]], { w: 3 });
    c.part('paupieres', { pivot: [hx - 10, hy - 26], motion: 'blink', extra: true }, () => {
      c.lid(e1[0], e1[1], 32, 40, FUR);
      c.lid(e2[0], e2[1], 38, 46, FUR);
    });
    // speed lines behind
    for (const [x, y, l] of [[760, 640, 140], [800, 700, 100], [740, 300, 110]] as const) stroke([[x, y], [x + l, y]], { w: 5 });
  },
} satisfies Redraw;
