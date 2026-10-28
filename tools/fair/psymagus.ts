import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Psymagus's fair copy, Psychic/Fairy, the same drawing grown up: five spoons instead of two (its two
 * held ones bigger, three more fanned out behind its head, glowing a fairy pink like the others), a longer, thicker
 * moustache, taller ears and a bigger zig-zag crest, a broader brown chest, narrower eyes under heavy brows, and its
 * red gem set in the gold star on its brow. It faces left, like its drawing.
 */
export default {
  id: '053', slug: 'psymagus', seed: 53053, size: [1020, 1140], tilt: 2,
  draw(c) {
    // its own drawing's coordinates, moved down a little to make room for the spoons over its head
    const D: P = [20, 140];
    const m = (pts: P[]) => pts.map(([x, y]) => [x + D[0], y + D[1]] as P);
    const shape: typeof c.shape = (pts, ...r) => c.shape(m(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(m(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(m(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(m(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(m(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + D[0], y + D[1], ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: m([def.pivot])[0] }, draw);
    const { band, potato, spikes } = c;
    const YELLOW = '#eeb534', BROWN = '#8a4f26', SILVER = '#b8c2d0', RED = '#e2423a', PINK = '#f49ac8';
    /** A spoon from the end of its handle to the middle of its bowl, a fairy-pink glow round the bowl. */
    const spoon = (a: P, b: P, s = 1) => {
      tint(potato(b[0], b[1], 74 * s, 88 * s, 10, 0.06), PINK, { angle: 30, wash: 0.5 });
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
      shape(band([a, [b[0] - ux * 50 * s, b[1] - uy * 50 * s]], 24 * s, 20 * s), SILVER, { angle: 90, over: 0 });
      const bowl = potato(0, 0, 48 * s, 64 * s, 10, 0.04).map(([x, y]) => [b[0] + x * -uy + y * ux, b[1] + x * ux + y * uy] as P);
      shape(bowl, SILVER, { angle: 60, over: 0 });
      shine([[b[0] - uy * 20 * s + ux * 20 * s, b[1] + ux * 20 * s + uy * 20 * s], [b[0] - uy * 22 * s - ux * 10 * s, b[1] + ux * 22 * s - uy * 10 * s]], 6);
    };
    // three more spoons fanned out behind its head, held up by its mind
    part('aureole', { pivot: [420, 290], motion: 'swing', amp: 5, period: 3.2, behind: true }, () => {
      for (const deg of [-116, -90, -64]) {
        const a = (deg * Math.PI) / 180;
        spoon([420 + Math.cos(a) * 160, 290 + Math.sin(a) * 160], [420 + Math.cos(a) * 335, 290 + Math.sin(a) * 335], 0.8);
      }
    });
    // the far arm, behind: its hand and a bigger spoon past the left edge
    part('cuillere-loin', { pivot: [400, 520], motion: 'swing', amp: -6, period: 2.4, behind: true, phase: 0.5 }, () => {
      shape(band([[400, 520], [280, 520], [200, 470]], 58, 50), YELLOW, { angle: 20 });
      spoon([175, 445], [125, 250]);
      shape(potato(190, 460, 38, 36, 8, 0.06), YELLOW, { over: 0 });
    });
    // the far leg and the far ear, taller
    shape(band([[440, 760], [420, 860], [395, 935]], 74, 68), YELLOW, { angle: 90 });
    shape([[330, 255], [225, 15], [415, 215]], YELLOW, { angle: 70 }, {}, false);
    shape([[340, 220], [262, 70], [385, 205]], '#f6d27a', { angle: 70, over: 0 }, { w: 4 }, false);
    // a tall body, broad shoulders, the brown chest broader
    shape([[340, 445], [520, 395], [685, 450], [700, 640], [635, 795], [430, 805], [355, 650]], YELLOW, { angle: 85 });
    shape([[372, 458], [520, 422], [652, 468], [640, 630], [520, 690], [392, 628]], BROWN, { angle: 80, press: 1.1 });
    shine([[600, 480], [625, 540]], 7);
    // the near leg
    shape(band([[580, 770], [600, 870], [610, 940]], 80, 74), YELLOW, { angle: 90 });
    shape(potato(630, 948, 70, 28, 8, 0.05), YELLOW, { over: 0 });
    // the near arm and its spoon held high, bigger
    part('cuillere', { pivot: [650, 500], motion: 'swing', amp: 6, period: 2.4, phase: 0 }, () => {
      shape(band([[650, 500], [760, 440], [800, 340]], 62, 54), YELLOW, { angle: 120 });
      spoon([815, 305], [895, 110]);
      shape(potato(805, 325, 40, 38, 8, 0.06), YELLOW, { over: 0 });
    });
    // the near ear, taller
    shape([[478, 205], [655, -10], [585, 255]], YELLOW, { angle: 110 }, {}, false);
    shape([[515, 200], [628, 50], [575, 225]], '#f6d27a', { angle: 110, over: 0 }, { w: 4 }, false);
    // the head: a bigger zig-zag crest, its gem set in the gold star on its brow
    shape([[250, 300], [320, 190], [460, 160], [580, 210], [610, 310], [560, 400], [430, 430], [310, 410], [220, 360], [210, 325]], YELLOW, { angle: 80 });
    shape(spikes([[290, 205], [395, 168], [510, 178]], 3, 46), YELLOW, { over: 0 }, {}, false);
    tint(potato(440, 232, 64, 58, 10, 0.04), PINK, { angle: 30, wash: 0.5 });
    c.star(440 + D[0], 228 + D[1], 48, 4);
    shape(potato(440, 232, 11, 11, 7, 0.08), RED, { over: 0 }, { w: 3 });
    // narrow fierce eyes under heavy brows
    paper([[296, 318], [322, 300], [346, 312], [324, 326]], { w: 4.5 }, false);
    paper([[420, 314], [458, 292], [494, 306], [460, 326]], { w: 4.5 }, false);
    dot(322, 313, 8, 9);
    dot(458, 309, 10, 11);
    stroke([[275, 278], [350, 302]], { w: 12 });
    stroke([[400, 296], [510, 268]], { w: 13 });
    dot(222, 340, 9, 7);
    // a longer, thicker moustache drooping from the snout, its ends curling
    for (const [dx, len] of [[-8, 1.15], [10, 1.3], [28, 1.1], [58, 1.25], [76, 1.1]] as const) {
      stroke([[245 + dx, 370], [220 + dx, 430], [205 + dx, 440 + 170 * len], [214 + dx, 460 + 210 * len], [232 + dx, 470 + 226 * len]], { w: 6 });
    }
  },
} satisfies Fair;
