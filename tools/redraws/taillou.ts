import type { P, Redraw } from './crayon.ts';

/**
 * A classic metal pencil sharpener turned to the left, drawn from the owner's sketch: its two holes are its eyes
 * (a small one and a big one, the blade showing in the big one), the blade screwed on its top, a curved collar
 * of pencil shaving standing on its head with its zig-zag painted edge, and a little pink tongue sticking out.
 */
export default {
  id: '111', slug: 'taillou', seed: 11117, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const STEEL = '#bcc4d0', SIDE = '#939daf', TOP = '#dbe1e8', WOOD = '#ecc58e', HOLE = '#5d6574', DEEP = '#2f343f', TONGUE = '#f28aa0';
    const RIMS = ['#e2483f', '#f2c14e', '#4fae5a', '#3e7fd6', '#a45ad6'];
    // the block, seen a little from above: its side, its top, its front
    const A: P = [200, 540], B: P = [620, 460], C: P = [650, 720], D: P = [230, 810], E: P = [770, 385], F: P = [350, 465], G: P = [792, 640];
    shape([B, E, G, C], SIDE, { angle: 90, over: 0.3 }, {}, false);
    shape([A, B, E, F], TOP, { angle: 15, over: 0 }, {}, false);
    shape([A, B, C, D], STEEL, { angle: 80, over: 0.4 }, {}, false);
    // the blade on its top: its lines, its screw
    for (const k of [0.3, 0.45, 0.6]) stroke([[A[0] + (F[0] - A[0]) * k + 120, A[1] + (F[1] - A[1]) * k - 22], [B[0] + (E[0] - B[0]) * k - 20, B[1] + (E[1] - B[1]) * k + 4]], { w: 4.5 });
    shape(potato(690, 432, 24, 14, 8, 0.04), SIDE, { over: 0 }, { w: 4 });
    stroke([[673, 434], [707, 430]], { w: 4.5 });
    // the collar of pencil shaving standing on its head: wood inside, a zig-zag painted edge
    c.part('copeau', { pivot: [380, 450], motion: 'nod', amp: 6, period: 2.2, behind: true }, () => {
      const cx = 400, cy = 490, from = -3.0, to = -0.25, n = RIMS.length;
      for (let i = 0; i < n; i++) {
        const a0 = from + ((to - from) * i) / n, a1 = from + ((to - from) * (i + 1)) / n + 0.02;
        const fringe: P[] = [];
        for (let k = 0; k <= 6; k++) {
          const a = a0 + ((a1 - a0) * k) / 6, r = k % 2 ? 250 : 190;
          fringe.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85]);
        }
        const base: P[] = [[cx + Math.cos(a1) * 150, cy + Math.sin(a1) * 150 * 0.85], [cx + Math.cos(a0) * 150, cy + Math.sin(a0) * 150 * 0.85]];
        shape([...fringe, ...base], RIMS[i], { angle: (((a0 + a1) / 2) * 180) / Math.PI, over: 0 }, {}, false);
      }
      const band: P[] = [];
      for (let k = 0; k <= 12; k++) { const a = from + ((to - from) * k) / 12; band.push([cx + Math.cos(a) * 160, cy + Math.sin(a) * 160 * 0.85]); }
      for (let k = 12; k >= 0; k--) { const a = from + ((to - from) * k) / 12; band.push([cx + Math.cos(a) * 95, cy + Math.sin(a) * 95 * 0.85]); }
      shape(band, WOOD, { angle: 90, over: 0.3 });
      for (let k = 1; k < 9; k++) {
        const a = from + ((to - from) * k) / 9;
        stroke([[cx + Math.cos(a) * 102, cy + Math.sin(a) * 102 * 0.85], [cx + Math.cos(a) * 152, cy + Math.sin(a) * 152 * 0.85]], { w: 3.5, col: '#b8894e' });
      }
    });
    // its two holes are its eyes: a small one, and a big one with the blade showing
    shape(potato(330, 660, 56, 58, 11, 0.03), HOLE, { angle: 40, over: 0.2 });
    shape(potato(332, 662, 34, 36, 9, 0.03), DEEP, { angle: 40, over: 0 }, { w: 3.5 });
    dot(344, 660, 14, 20, '#ffffff');
    dot(324, 650, 6, 6, '#ffffff');
    shape(potato(520, 625, 80, 84, 12, 0.03), HOLE, { angle: 40, over: 0.2 });
    shape(potato(522, 628, 52, 56, 10, 0.03), DEEP, { angle: 40, over: 0 }, { w: 3.5 });
    stroke([[470, 580], [575, 672]], { w: 6, col: '#c9ced6' });
    shape([[522, 585], [540, 628], [522, 672], [504, 628]], '#f4f7fa', { over: 0, wash: 1 }, { w: 3.5 }, false);
    dot(500, 598, 8, 8, '#ffffff');
    // a little tongue sticking out under its front: in battle it waggles
    c.part('langue', { pivot: [440, 785], motion: 'swing', amp: 9, period: 1.4 }, () => {
      shape([[392, 790], [488, 776], [500, 860], [450, 905], [400, 870]], TONGUE, { angle: 80, over: 0 });
      stroke([[446, 800], [440, 840], [452, 865]], { w: 4.5, col: '#c4506a' });
    });
    // a rivet, and a scratch of wear
    dot(760, 580, 8, 8, '#6e7684');
    stroke([[600, 520], [618, 560]], { w: 3 });
  },
} satisfies Redraw;
