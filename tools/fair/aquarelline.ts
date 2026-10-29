import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Aquarelline's fair copy, Water/Fairy, the same manta grown majestic: its veils of colour twice as long, a gold
 * edge along the front of its wings, its horn fins taller with gold tips, a halo of paint drops above it, and the
 * gold star on its back.
 */
export default {
  id: '115', slug: 'aquarelline', seed: 115115, size: [1150, 1000], tilt: -6,
  draw(c) {
    const { shape, stroke, dot, band } = c;
    const GOLD_EDGE = '#e8b84a', BACK = '#3d6fb8', BELLY = '#bfe1f2', PINK = '#f49ac2', ORANGE = '#f4a860', GOLD = '#f6cf5a', GREEN = '#8fd38a', TEAL = '#5fc6c9', BLUE = '#7ab0f0', VIOLET = '#9a7ae0';
    /** A veil of paint streaming off behind a trailing edge (from a to b), tapering to a point. */
    const veil = (a: P, b: P, len: number, drop: number, col: string) => {
      const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      c.tint([a, [a[0] + len * 0.6, a[1] + drop * 0.6], [m[0] + len, m[1] + drop], [b[0] + len * 0.5, b[1] + drop * 0.5], b], col, { wash: 0.45, angle: 10, miss: 0.2 });
    };
    /** The same colour seeping out along that edge, inside the wing (`inset` points into the wing). */
    const edge = (a: P, b: P, inset: P, col: string) =>
      c.tint([a, b, [b[0] + inset[0], b[1] + inset[1]], [a[0] + inset[0], a[1] + inset[1]]], col, { wash: 0.6, angle: 30 });
    // the near wing's trailing edge, from the body to the tip: green, gold, orange, pink
    const NEAR: [P, P, number, number, string, P][] = [
      [[690, 580], [580, 642], 380, 70, GREEN, [-40, -50]],
      [[580, 642], [480, 740], 450, 80, GOLD, [-50, -45]],
      [[480, 740], [380, 860], 520, 70, ORANGE, [-45, -35]],
      [[380, 860], [300, 940], 560, 40, PINK, [-25, -40]],
    ];
    for (const [a, b, len, drop, col] of NEAR) veil(a, b, len, drop, col);
    // the tail: one long brush stroke
    c.part('queue', { pivot: [760, 520], motion: 'swing', amp: 7, period: 3, behind: true }, () => {
      shape(band([[740, 520], [880, 540], [1010, 590], [1120, 650]], 30, 6), BACK, { angle: 20, over: 0.2 });
    });
    // the far wing, curving up to a sharp tip, its colours streaming behind it: in battle it beats slowly
    c.part('aile-loin', { pivot: [540, 400], motion: 'flap', amp: -9, period: 2.6, behind: true }, () => {
      const FAR: [P, P, number, number, string, P][] = [
        [[870, 64], [820, 150], 270, 30, VIOLET, [-34, 6]],
        [[820, 150], [740, 262], 380, 40, BLUE, [-55, 0]],
        [[740, 262], [662, 376], 420, 50, TEAL, [-60, -10]],
      ];
      for (const [a, b, len, drop, col] of FAR) veil(a, b, len, drop, col);
      shape([[430, 380], [540, 280], [660, 190], [780, 110], [870, 60], [820, 150], [740, 260], [660, 380], [560, 430]], BACK, { angle: 40, over: 0.4 });
      stroke([[440, 372], [540, 282], [660, 192], [780, 112], [866, 64]], { w: 7, col: GOLD_EDGE });
      for (const [a, b, , , col, inset] of FAR) edge(a, b, inset, col);
    });
    // the body and the near wing sweeping down to a sharp tip
    const body: P[] = [[130, 470], [230, 390], [380, 350], [540, 360], [690, 420], [760, 510], [690, 580], [580, 640], [480, 740], [380, 860], [300, 940], [320, 830], [300, 700], [220, 570]];
    shape(body, BACK, { angle: 25, over: 0.5, press: 1.1 });
    for (const [a, b, , , col, inset] of NEAR) edge(a, b, inset, col);
    stroke([[300, 936], [318, 830], [300, 700], [222, 572]], { w: 7, col: GOLD_EDGE });
    // its pale underside showing along the leading edge
    c.tint([[140, 470], [240, 400], [380, 362], [300, 420], [200, 480]], BELLY, { wash: 0.8, angle: 10 });
    // horn-like fins curling by its face
    shape(band([[170, 430], [100, 370], [80, 270], [130, 220]], 28, 10), BACK, { angle: 60, over: 0 });
    shape(band([[220, 400], [180, 310], [200, 210], [252, 186]], 28, 10), BACK, { angle: 60, over: 0 });
    for (const [x, y] of [[130, 220], [252, 186]] as const) c.dot(x, y, 9, 9, GOLD_EDGE);
    // a calm, very old face: almond eyes, no smile
    for (const [x, y, rx, ry] of [[220, 466, 18, 10], [290, 450, 24, 13]] as const) {
      shape([[x - rx, y + 2], [x, y - ry], [x + rx, y], [x, y + ry * 0.8]], '#f6f0d8', { over: 0 }, { w: 3.5 });
      dot(x + 2, y, ry * 0.75, ry * 0.75, '#1e2a4a');
      dot(x - 1, y - ry * 0.3, 2.5, 2.5, '#ffffff');
    }
    stroke([[196, 452], [244, 442]], { w: 5, col: '#20345e' });
    stroke([[266, 432], [318, 424]], { w: 5, col: '#20345e' });
    // a halo of paint drops above it, and the gold star on its back
    for (const [x, y, col] of [[330, 250, PINK], [420, 220, ORANGE], [510, 210, GOLD], [600, 220, GREEN]] as const) {
      shape([[x, y - 22], [x + 12, y], [x, y + 13], [x - 12, y]], col, { over: 0, wash: 0.9 }, { w: 3 }, true);
    }
    c.star(470, 470, 46, -6);
    // only in battle: sparkles of colour float round it (drawn last, the card stays the same)
    c.part('reflets', { pivot: [450, 550], motion: 'flicker', period: 2.6, extra: true }, () => {
      for (const [x, y, r, col] of [[360, 300, 16, GOLD], [600, 250, 14, PINK], [180, 700, 14, TEAL], [860, 420, 14, GREEN], [520, 900, 12, VIOLET]] as const) {
        shape([[x, y - r], [x + r / 4, y - r / 4], [x + r, y], [x + r / 4, y + r / 4], [x, y + r], [x - r / 4, y + r / 4], [x - r, y], [x - r / 4, y - r / 4]], col, { over: 0, wash: 0.9 }, { w: 2.5 }, false);
      }
    });
    // sparkles of colour floating in the water
    for (const [x, y, r, col] of [[120, 250, 12, GOLD], [980, 470, 11, PINK], [560, 120, 10, TEAL]] as const) {
      shape([[x, y - r], [x + r / 4, y - r / 4], [x + r, y], [x + r / 4, y + r / 4], [x, y + r], [x - r / 4, y + r / 4], [x - r, y], [x - r / 4, y - r / 4]], col, { over: 0, wash: 0.9 }, { w: 2.5 }, false);
    }
  },
} satisfies Fair;
