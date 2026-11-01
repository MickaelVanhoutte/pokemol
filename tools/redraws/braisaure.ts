import type { P, Redraw } from './crayon.ts';
import { flame, flankLeg, lineOfAction, openLimb, paw } from './anatomy.ts';

/**
 * Braisou grown into a show-off (« Frimeur ») four-legged runner, turned to the left: it skids to a stop on purpose,
 * leaning back on its low haunches, both front legs braced forward in a puff of dust, to show off its tail raised high
 * like a torch (Braisou's tail ember grown into a big flame: the happier it is, the bigger the flame). A small crest of
 * embers along its back (Dragobraise's crest to come). Teen proportions: a smaller head with a muzzle, chin up, one brow
 * cocked, a lopsided grin with one fang. The family's orange, cream belly and flame shapes.
 */
export default {
  id: '021', slug: 'braisaure', seed: 2231, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot } = c;
    const ORANGE = '#f0963e', DEEP = '#cf6e2a', CREAM = '#f8e8c4', RED = '#e8502e', PINK = '#f28aa8';
    // the line of action: from the neck, the chest held high, the body leaning back down to its low hips, then the tail
    // swept up into the torch
    const spine: P[] = [[300, 520], [392, 582], [492, 612], [600, 640], [696, 668], [770, 660], [838, 604], [878, 528], [884, 448], [868, 388], [862, 362]];
    const widths = [124, 178, 172, 152, 166, 116, 88, 70, 58, 50, 46];
    const down = [0, 30, 12, 0, 18, 0, 0, 0, 0, 0, 0];
    const n = spine.length;
    /** The unit normal pointing up/out of the back at spine point i. */
    const backNormal = (i: number): P => {
      const [ax, ay] = spine[Math.max(0, i - 1)], [bx, by] = spine[Math.min(n - 1, i + 1)];
      const l = Math.hypot(bx - ax, by - ay) || 1;
      return [(by - ay) / l, -(bx - ax) / l];
    };
    /** A runner's hind leg, crouched: a big thigh from the hip, the knee forward, the shin back to the hock, the paw. */
    const hindLeg = (pts: P[], col: string, w: number) => {
      const ws = [w, w * 0.62, w * 0.36, w * 0.32];
      const L: P[] = [], R: P[] = [];
      pts.forEach(([x, y], i) => {
        const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
        const l = Math.hypot(bx - ax, by - ay) || 1, h = ws[i] / 2;
        L.push([x + ((by - ay) / l) * h, y - ((bx - ax) / l) * h]);
        R.push([x - ((by - ay) / l) * h, y + ((bx - ax) / l) * h]);
      });
      openLimb(c, [...L, ...R.reverse()], col, 1, 2 * pts.length - 1);
      const [fx, fy] = pts[pts.length - 1];
      paw(c, fx - 8, fy + 4, col, w * 0.4);
    };

    // the far legs, darker, half hidden: the front one braced forward, the hind one crouched under
    flankLeg(c, [468, 630], [290, 884], DEEP, 92);
    hindLeg([[760, 664], [712, 770], [800, 836], [770, 884]], DEEP, 120);
    // its tail torch: Braisou's ember grown into a big flame on the raised tail tip (it flickers in battle)
    const [tx, ty] = spine[n - 1];
    c.part('torche', { pivot: [tx, ty], motion: 'swing', amp: 4, period: 2.2, behind: true }, () => {
      flame(c, tx + 4, ty + 22, -6, 290, 196);
    });
    // a small crest of embers along its back, from the shoulders to the hips (Dragobraise's crest to come)
    for (const [i, h] of [[1.6, 62], [2.3, 76], [3, 70], [3.7, 54]] as const) {
      const k = Math.floor(i), f = i - k;
      const [x, y] = [spine[k][0] + (spine[k + 1][0] - spine[k][0]) * f, spine[k][1] + (spine[k + 1][1] - spine[k][1]) * f];
      const [nx, ny] = backNormal(k), half = widths[k] / 2 - 18;
      flame(c, x + nx * half, y + ny * half, (Math.atan2(nx, -ny) * 180) / Math.PI + 34, h, h * 0.62);
    }
    // the body and the raised tail in one line of action, a cream belly
    shape(lineOfAction(spine, widths, down), ORANGE, { angle: 15, over: 0.4 });
    c.tint(lineOfAction(spine.slice(1, 5).map(([x, y], i): P => [x, y + [62, 66, 56, 52][i]]), [52, 54, 40, 30]), CREAM, { angle: 10, wash: 0.85 });
    // the tail tip glowing red under the torch
    c.tint(c.band([spine[n - 3], spine[n - 2], spine[n - 1]], widths[n - 3] * 0.7, widths[n - 1] * 0.9), RED, { angle: 30, wash: 0.6 });
    // the near legs on its flank, line left open where they melt into it: the front one braced forward, the hind one
    // crouched under its low haunch
    flankLeg(c, [404, 620], [184, 886], ORANGE, 110);
    hindLeg([[694, 660], [630, 770], [730, 842], [700, 888]], ORANGE, 172);
    // skid marks scraped behind its braced front paws, a puff of dust thrown up in front of them
    for (const [x, y] of [[184, 886], [290, 884]] as const) {
      stroke([[x + 40, y + 34], [x + 150, y + 30]], { w: 4.5 });
      stroke([[x + 70, y + 50], [x + 160, y + 46]], { w: 4 });
    }
    c.part('poussiere', { pivot: [130, 870], motion: 'nod', amp: 3, period: 2.4, decor: true }, () => {
      // a scalloped little cloud, flat along the ground, puffing up and forward
      const bumps: [number, number, number][] = [[176, 872, 26], [146, 846, 32], [104, 840, 36], [66, 860, 28], [52, 892, 20]];
      const cloud: P[] = [[186, 900]];
      for (const [x, y, rr] of bumps) for (let k = 0; k <= 4; k++) {
        const a = Math.PI * (1.85 - (k / 4) * 1.1);
        cloud.push([x + Math.cos(a) * rr, y - Math.abs(Math.sin(a)) * rr]);
      }
      cloud.push([44, 904]);
      shape(cloud, '#eadcc4', { angle: 20, over: 0, wash: 0.5 }, { w: 3.5 });
      stroke([[40, 830], [8, 812]], { w: 4 });
      stroke([[70, 808], [46, 780]], { w: 4 });
    });
    // the head, on the neck at the front of the line: a teen's head, smaller than Braisou's, with a muzzle
    const [hx, hy] = [240, 470], tilt = 8, r = (tilt * Math.PI) / 180;
    const T = ([x, y]: P): P => [hx + x * Math.cos(r) - y * Math.sin(r), hy + x * Math.sin(r) + y * Math.cos(r)];
    const t = (pts: P[]) => pts.map(T);
    // its two flame ears, swept back (they flicker in battle)
    c.part('flammes', { pivot: T([60, -80]), motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      flame(c, ...T([30, -84]), 58 + tilt, 190, 92);
      flame(c, ...T([84, -50]), 82 + tilt, 160, 80);
    });
    shape(t([[-156, 6], [-160, -26], [-128, -58], [-60, -92], [26, -102], [98, -74], [124, -14], [102, 48], [40, 82], [-58, 84], [-128, 60]]), ORANGE, { angle: 78, over: 0.45 });
    c.tint(t([[-152, 12], [-126, 56], [-60, 76], [4, 62], [-38, 34], [-108, 22]]), CREAM, { angle: 60, wash: 0.65 });
    // show-off, one emotion: smug. Chin up, eyes open with a sliver of lid, the near brow cocked high, a lopsided grin
    // with one fang
    c.eye(...T([-84, -36]), 22, 30, '#241c38', { lid: 0.2, skin: ORANGE, tilt: tilt + 8 });
    c.eye(...T([2, -30]), 30, 38, '#241c38', { lid: 0.16, skin: ORANGE, tilt: tilt - 6 });
    stroke(t([[-110, -74], [-66, -78]]), { w: 6 });
    stroke(t([[-30, -90], [0, -120], [46, -112]]), { w: 6.5 });
    c.cheek(...T([56, 36]), 24, 14, PINK);
    dot(...T([-150, -14]), 5, 4);
    stroke(t([[-150, 30], [-104, 50], [-44, 54], [4, 34], [24, 6]]), { w: 5.5 });
    stroke(t([[12, 24], [30, 30]]), { w: 4 });
    shape(t([[-112, 50], [-94, 53], [-104, 76]]), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
    c.part('paupieres', { pivot: T([-40, -34]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-84, -36]), 22, 30, ORANGE);
      c.lid(...T([2, -30]), 30, 38, ORANGE);
    });
  },
} satisfies Redraw;
