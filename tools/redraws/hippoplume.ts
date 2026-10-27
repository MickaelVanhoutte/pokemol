import type { P, Redraw } from './crayon.ts';

/**
 * Hippomine grown: a big, spiny seahorse turned to the left, a crest of quills swept back, sharp quill fins
 * along its back dipped in ink, a snout ending in a golden pen nib dripping ink, a fierce eye, a tight curl.
 */
export default {
  id: '070', slug: 'hippoplume', seed: 7002, size: [1000, 1100], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const BLUE = '#2f62c4', CREAM = '#f3e6c6', FIN = '#8cbcf0', INK = '#1f2a5a', GOLD = '#e8c04a';
    // a quill from a to b: a long pointed leaf, its tip dipped in ink
    const quill = (a: P, b: P, w: number) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
      const m: P = [a[0] + dx * 0.45, a[1] + dy * 0.45], t: P = [a[0] + dx * 0.8, a[1] + dy * 0.8];
      shape([[a[0] + n[0] * w * 0.5, a[1] + n[1] * w * 0.5], [m[0] + n[0] * w, m[1] + n[1] * w], b, [m[0] - n[0] * w, m[1] - n[1] * w], [a[0] - n[0] * w * 0.5, a[1] - n[1] * w * 0.5]], FIN, { angle: 60, over: 0 });
      c.tint([[t[0] + n[0] * w * 0.45, t[1] + n[1] * w * 0.45], b, [t[0] - n[0] * w * 0.45, t[1] - n[1] * w * 0.45]], INK, { gap: 3, press: 1.2 });
      stroke([a, [a[0] + dx * 0.85, a[1] + dy * 0.85]], { w: 2.5 });
    };
    // the quill fins fanned out along its back
    c.part('plumes', { pivot: [590, 560], motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      quill([560, 380], [800, 250], 46);
      quill([600, 500], [870, 430], 50);
      quill([600, 630], [860, 640], 46);
      quill([560, 740], [780, 810], 38);
    });
    // the body and the tight curl of its tail, the cream ribbed belly
    shape(band([[500, 330], [590, 470], [590, 640], [520, 790], [470, 900], [520, 985], [625, 965], [635, 890], [570, 880]], 170, 40), BLUE, { angle: 80, over: 0.6, press: 1.05 });
    c.tint(band([[445, 360], [500, 480], [495, 640], [445, 770]], 64, 28), CREAM, { gap: 3.4 });
    for (const y of [420, 490, 560, 630, 700]) stroke([[408, y], [482, y + 8]], { w: 3 });
    // a small spiky fin at its chest
    shape(([[520, 560]] as P[]).concat(spikes([[540, 520], [640, 560], [620, 640]], 2, -40)).concat([[540, 620]] as P[]), FIN, { angle: 30, over: 0 }, { w: 3.5 }, false);
    // the crest of quills swept back, behind the head
    quill([440, 180], [520, 20], 30);
    quill([500, 180], [650, 60], 32);
    quill([550, 210], [730, 150], 30);
    // the head, the long snout pointing left, its golden pen nib dripping ink
    shape(potato(480, 250, 135, 120, 12, 0.05), BLUE, { angle: 80, over: 0.5 });
    shape(band([[380, 285], [270, 292], [190, 285]], 62, 50), BLUE, { angle: 0 });
    shape([[200, 252], [105, 287], [200, 320]], GOLD, { angle: 0, over: 0 }, { w: 4 }, false);
    stroke([[190, 287], [125, 287]], { w: 3 });
    dot(165, 287, 6, 6);
    shape([[95, 312], [80, 350], [95, 372], [112, 350]], INK, { over: 0, press: 1.3 }, { w: 3 });
    // a fierce eye
    c.paper(potato(450, 232, 30, 27, 8, 0.05));
    dot(442, 238, 14, 13);
    dot(436, 232, 4, 4, '#ffffff');
    stroke([[405, 196], [495, 214]], { w: 6.5 });
    // ink splashes
    c.part('encre', { pivot: [500, 500], motion: 'flicker', period: 2.2 }, () => {
      for (const [x, y, r] of [[120, 460, 14], [170, 520, 9], [860, 140, 11], [130, 760, 12]] as const) shape(potato(x, y, r, r, 7, 0.15), INK, { over: 0, press: 1.2 }, { w: 2.5 });
    });
  },
} satisfies Redraw;
