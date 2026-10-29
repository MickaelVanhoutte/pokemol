import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Taillou's fair copy, Steel, the same drawing grown up: its collar of shaving doubled into two rows of bigger
 * zig-zags in every colour of the pencil case, its blade polished to a shine, sharp blades glinting in both its
 * eye-holes, fierce little brows, a longer tongue, and the gold star screwed on its side.
 */
export default {
  id: '111', slug: 'taillou', seed: 111111, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const STEEL = '#bcc4d0', SIDE = '#939daf', TOP = '#dbe1e8', WOOD = '#ecc58e', HOLE = '#5d6574', DEEP = '#2f343f', TONGUE = '#f28aa0';
    const RIMS = ['#e2483f', '#f08a3a', '#f2c14e', '#4fae5a', '#3e7fd6', '#a45ad6', '#f29ab0'];
    // the block, seen a little from above: its side, its top, its front
    const A: P = [200, 540], B: P = [620, 460], C: P = [650, 720], D: P = [230, 810], E: P = [770, 385], F: P = [350, 465], G: P = [792, 640];
    shape([B, E, G, C], SIDE, { angle: 90, over: 0.3 }, {}, false);
    shape([A, B, E, F], TOP, { angle: 15, over: 0 }, {}, false);
    shape([A, B, C, D], STEEL, { angle: 80, over: 0.4 }, {}, false);
    // the blade on its top, polished to a shine, and its screw
    for (const k of [0.3, 0.45, 0.6]) stroke([[A[0] + (F[0] - A[0]) * k + 120, A[1] + (F[1] - A[1]) * k - 22], [B[0] + (E[0] - B[0]) * k - 20, B[1] + (E[1] - B[1]) * k + 4]], { w: 4.5 });
    c.shine([[420, 512], [600, 478]], 8);
    shape(potato(690, 432, 26, 15, 8, 0.04), SIDE, { over: 0 }, { w: 4 });
    stroke([[672, 434], [708, 430]], { w: 4.5 });
    // the collar of shaving, two rows of bigger zig-zags: in battle it ruffles
    c.part('copeau', { pivot: [400, 470], motion: 'nod', amp: 7, period: 2, behind: true }, () => {
      const cx = 400, cy = 490, from = -3.05, to = -0.2, n = RIMS.length;
      for (const [outer, inner, off] of [[310, 240, 0.5], [250, 190, 0]] as const) {
        for (let i = 0; i < n; i++) {
          const a0 = from + ((to - from) * (i + off)) / n, a1 = from + ((to - from) * (i + 1 + off)) / n + 0.02;
          if (a1 > to + 0.05) continue;
          const fringe: P[] = [];
          for (let k = 0; k <= 6; k++) {
            const a = a0 + ((a1 - a0) * k) / 6, r = k % 2 ? outer : inner;
            fringe.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85]);
          }
          const base: P[] = [[cx + Math.cos(a1) * 150, cy + Math.sin(a1) * 150 * 0.85], [cx + Math.cos(a0) * 150, cy + Math.sin(a0) * 150 * 0.85]];
          shape([...fringe, ...base], RIMS[(i + (off ? 3 : 0)) % n], { angle: (((a0 + a1) / 2) * 180) / Math.PI, over: 0 }, {}, false);
        }
      }
      const band: P[] = [];
      for (let k = 0; k <= 12; k++) { const a = from + ((to - from) * k) / 12; band.push([cx + Math.cos(a) * 170, cy + Math.sin(a) * 170 * 0.85]); }
      for (let k = 12; k >= 0; k--) { const a = from + ((to - from) * k) / 12; band.push([cx + Math.cos(a) * 95, cy + Math.sin(a) * 95 * 0.85]); }
      shape(band, WOOD, { angle: 90, over: 0.3 });
      for (let k = 1; k < 10; k++) {
        const a = from + ((to - from) * k) / 10;
        stroke([[cx + Math.cos(a) * 102, cy + Math.sin(a) * 102 * 0.85], [cx + Math.cos(a) * 162, cy + Math.sin(a) * 162 * 0.85]], { w: 3.5, col: '#b8894e' });
      }
    });
    // its eye-holes, a sharp blade glinting in each, fierce little brows
    shape(potato(330, 660, 60, 62, 11, 0.03), HOLE, { angle: 40, over: 0.2 });
    shape(potato(332, 662, 38, 40, 9, 0.03), DEEP, { angle: 40, over: 0 }, { w: 3.5 });
    shape([[332, 628], [346, 662], [332, 696], [318, 662]], '#f4f7fa', { over: 0, wash: 1 }, { w: 3.5 }, false);
    shape(potato(520, 625, 84, 88, 12, 0.03), HOLE, { angle: 40, over: 0.2 });
    shape(potato(522, 628, 56, 60, 10, 0.03), DEEP, { angle: 40, over: 0 }, { w: 3.5 });
    stroke([[466, 576], [578, 676]], { w: 6, col: '#c9ced6' });
    shape([[522, 580], [544, 628], [522, 676], [500, 628]], '#f4f7fa', { over: 0, wash: 1 }, { w: 3.5 }, false);
    dot(498, 594, 9, 9, '#ffffff');
    stroke([[280, 586], [372, 604]], { w: 9 });
    stroke([[452, 540], [584, 552]], { w: 9 });
    // the gold star screwed on its side
    c.star(715, 535, 44, 8);
    // a longer tongue sticking out: in battle it waggles
    c.part('langue', { pivot: [440, 785], motion: 'swing', amp: 10, period: 1.3 }, () => {
      shape([[388, 790], [492, 774], [508, 880], [452, 940], [396, 895]], TONGUE, { angle: 80, over: 0 });
      stroke([[446, 800], [440, 860], [454, 900]], { w: 4.5, col: '#c4506a' });
    });
    dot(760, 620, 8, 8, '#6e7684');
  },
} satisfies Fair;
