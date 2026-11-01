import type { P, Redraw } from './crayon.ts';
import { lineOfAction } from './anatomy.ts';

/**
 * Chrysalou hatched into a proud flying beetle (« fier »), turned to the left: a lean emerald beetle in the air, a hard angular shield on its chest, its
 * shiny wing cases lifted wide open like a car's bonnet and its rainbow prism wings unfolded from under them, a great
 * horn swept up from its brow, chin held high, three legs tucked.
 */
export default {
  id: '007', slug: 'scaraprisme', seed: 108, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, tint } = c;
    const EM = '#1f9e62', EMD = '#14724a', EMDD = '#0e5a3a', BELLY = '#f6f0d2', SHEEN = '#5cc6e6', LEG = '#14724a';
    const PRISM = ['#f58ab8', '#f7c64a', '#f2ee7a', '#7fe0b0', '#6fc8f0', '#a890ec'];

    // the whole pose is drawn level, then turned `deg` around (500, 500)
    const deg = 12, r0 = (deg * Math.PI) / 180;
    const k0 = 0.92, T = ([x, y]: P): P => [500 + ((x - 500) * Math.cos(r0) - (y - 500) * Math.sin(r0)) * k0, 520 + ((x - 500) * Math.sin(r0) + (y - 500) * Math.cos(r0)) * k0];
    const t = (pts: P[]) => pts.map(T);

    /** A prism wing along `spine` (root to tip): see-through paper, rainbow bands across, two veins. */
    const wing = (spine: P[], widths: number[], down: number[], far: boolean) => {
      const sp = t(spine), out = lineOfAction(sp, widths, down), n = sp.length;
      const L = out.slice(0, n), R = out.slice(n).reverse();
      c.paper(out, { w: 0.1 });
      for (let k = 0; k < n - 1; k++) {
        for (let q = 0; q < 2; q++) {
          const f0 = q / 2, f1 = (q + 1) / 2, mix = (a: P, b: P, f: number): P => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
          const band: P[] = [mix(L[k], L[k + 1], f0), mix(L[k], L[k + 1], f1), mix(R[k], R[k + 1], f1), mix(R[k], R[k + 1], f0)];
          tint(c.densify(band, 10), PRISM[(k * 2 + q) % PRISM.length], { wash: far ? 0.7 : 0.55, angle: 30 });
        }
      }
      stroke(sp.slice(0, -1).map(([x, y], i) => [x + (L[i][0] - x) * 0.45, y + (L[i][1] - y) * 0.45] as P), { w: 3, col: '#8a86a8' });
      stroke(sp.slice(0, -1).map(([x, y], i) => [x + (R[i][0] - x) * 0.4, y + (R[i][1] - y) * 0.4] as P), { w: 3, col: '#8a86a8' });
      stroke([...out, out[0]], { w: 4.5 });
    };
    /**
     * A wing case lifted open like a bonnet: a half shell from its hinge (`h0`–`h1`) to its `tip`, its straight seam from
     * `h1` to the tip, its domed outer edge bulging through `bulge`; the dark rim of its underside along the seam.
     */
    const elytron = (h0: P, h1: P, tip: P, bulge: P[], col: string, near: boolean) => {
      const outer = t([h0, ...bulge, tip]), seam = t([h1, tip]);
      const rim: P[] = t([h1, [h1[0] + (tip[0] - h1[0]) * 0.5 + 6, h1[1] + (tip[1] - h1[1]) * 0.5 - 22], tip, [h1[0] + (tip[0] - h1[0]) * 0.5 + 2, h1[1] + (tip[1] - h1[1]) * 0.5 + 6]]);
      shape([...outer, seam[0]], col, { angle: 60, over: 0.4 });
      shape(rim, EMDD, { angle: 40, over: 0 }, { w: 3.5 });
      if (near) {
        tint(t([bulge[0], ...bulge.slice(1), [bulge[bulge.length - 1][0] - 30, bulge[bulge.length - 1][1] + 50], [bulge[0][0] + 20, bulge[0][1] + 60]]), SHEEN, { wash: 0.18, angle: 50 });
        c.shine(t(bulge.map(([x, y]): P => [x + 10, y + 26])), 10);
      }
    };
    /** A jointed leg: a thigh from `root` to `knee`, a thinner shin to `ankle`, a hooked foot of two claws. */
    const leg = (root: P, knee: P, ankle: P, col: string) => {
      shape(c.band(t([root, knee]), 38, 28), col, { angle: 30, over: 0 }, { w: 4 });
      shape(c.band(t([knee, ankle]), 24, 14), col, { angle: 30, over: 0 }, { w: 4 });
      const [a, b] = t([knee, ankle]), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l];
      for (const k of [1, -1]) stroke([b, [b[0] + u[0] * 22 - u[1] * 14 * k, b[1] + u[1] * 22 + u[0] * 14 * k], [b[0] + u[0] * 30 - u[1] * 4 * k, b[1] + u[1] * 30 + u[0] * 4 * k]], { w: 7, col });
    };

    // the far wing case and wing, behind
    c.part('elytreLoin', { pivot: T([490, 380]), motion: 'swing', amp: 2, period: 2.6, behind: true }, () => {
      elytron([470, 370], [520, 400], [640, 80], [[450, 260], [490, 150], [560, 80]], EMD, false);
    });
    c.part('aileLoin', { pivot: T([540, 400]), motion: 'swing', amp: 3, period: 1.8, behind: true }, () => {
      wing([[540, 400], [640, 310], [740, 230], [840, 180], [920, 160]], [50, 150, 170, 120, 8], [0, 20, 30, 20, 0], true);
    });
    leg([640, 640], [740, 660], [790, 760], EMDD);
    // the abdomen, a pale ringed belly underneath
    shape(t([[470, 520], [600, 500], [720, 540], [800, 610], [760, 660], [620, 664], [510, 620]]), EM, { angle: 30, over: 0.3 });
    tint(t([[510, 614], [620, 660], [750, 654], [780, 630], [640, 616], [540, 580]]), BELLY, { wash: 0.85 });
    for (const x of [600, 660, 720]) stroke(t([[x, 606], [x + 6, 660]]), { w: 4, col: EMD });
    // the near prism wing, unfolded wide
    c.part('aile', { pivot: T([560, 450]), motion: 'swing', amp: 3, period: 1.8 }, () => {
      wing([[560, 450], [680, 450], [800, 470], [910, 500], [980, 520]], [60, 170, 200, 140, 8], [0, 40, 60, 40, 0], false);
    });
    // two small curved mandibles under the horn, the far one first
    for (const [x, y, col] of [[196, 536, EMDD], [176, 546, EMD]] as const) shape(t([[x + 22, y - 14], [x - 12, y - 2], [x - 30, y + 24], [x - 26, y + 50], [x - 12, y + 30], [x + 4, y + 18], [x + 26, y + 10]]), col, { over: 0 }, { w: 3.5 });
    // the head, short and rounded, its great horn swept up from the front of it
    shape(c.band(t([[204, 470], [172, 410], [156, 340], [162, 270], [190, 212], [234, 172], [290, 150]]), 120, 8), EM, { angle: 70, over: 0.3 }, {}, false);
    c.shine(t([[146, 340], [152, 276], [180, 222]]), 8);
    shape(t([[164, 500], [180, 448], [240, 420], [320, 426], [350, 486], [330, 540], [256, 560], [190, 548]]), EM, { angle: 70, over: 0.3 });
    // the hard angular shield of its chest
    shape(t([[300, 470], [304, 380], [390, 312], [540, 300], [656, 366], [612, 466], [530, 556], [384, 574]]), EM, { angle: 70, over: 0.4 }, {}, false);
    tint(t([[470, 310], [560, 320], [640, 372], [600, 420], [520, 352]]), SHEEN, { wash: 0.5 });
    stroke(t([[318, 420], [410, 356], [560, 340], [640, 372]]), { w: 4.5, col: EMDD });
    c.shine(t([[340, 390], [400, 340], [470, 326]]), 10);
    leg([480, 560], [550, 640], [500, 730], LEG);
    leg([350, 560], [290, 620], [210, 600], LEG);
    // proud: the eye wide open and shining, a firm level brow, a closed mouth
    const e = T([266, 490]);
    c.eye(e[0], e[1], 20, 25, '#241c38');
    shape(t([[226, 450], [270, 442], [312, 452], [308, 466], [270, 458], [230, 464]]), EMDD, { over: 0 }, { w: 3.5 });
    c.part('paupieres', { pivot: e, motion: 'blink', extra: true }, () => c.lid(e[0], e[1], 20, 25, EM));
    // the near wing case lifted open like a bonnet
    c.part('elytre', { pivot: T([530, 420]), motion: 'swing', amp: 2, period: 2.6 }, () => {
      elytron([500, 400], [570, 460], [830, 120], [[520, 290], [600, 180], [710, 100], [810, 86]], EM, true);
    });
  },
} satisfies Redraw;
