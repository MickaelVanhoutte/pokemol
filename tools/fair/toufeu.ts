import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Toufeu's fair copy, Fire, the same drawing grown up: three big flame tails fanning out instead of one,
 * a bigger ruff of flame-fur (orange flames inside the yellow), a taller nest of flames, longer ears, a flame
 * rising out of the fringe on its brow, white-hot at its heart, sharp eyes under heavy brows, a fang, and the gold
 * star on its chest. It faces left, like its drawing.
 */
export default {
  id: '018', slug: 'toufeu', seed: 18018, size: [1270, 1080], tilt: 2,
  draw(c0) {
    const c = moved(c0, 30, 70);
    const { shape, stroke, dot, spikes, potato, tint } = c;
    const CORAL = '#f0705a', YELLOW = '#f8cf3a', ORANGE = '#f59a2c', DEEP = '#c84a36';
    const WHITE_HOT = '#fff4cc';

    /** Its tail of flame-fur, the pencil drawing's own, turned by `deg` around its root and grown by `k`. */
    const tail = (deg: number, k: number) => {
      const a = (deg * Math.PI) / 180, [ox, oy] = [650, 690];
      const turn = (pts: P[]) => pts.map(([x, y]): P => {
        const dx = (x - ox) * k, dy = (y - oy) * k;
        return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)];
      });
      shape(turn(spikes([[660, 700], [810, 620], [890, 480], [870, 350]], 2, 55).concat([[790, 420], [750, 560], [630, 640]])), YELLOW, { angle: 60 + deg, press: 1.1 }, {}, false);
      tint(turn([[700, 660], [800, 590], [850, 470], [840, 420], [780, 500], [720, 600]]), ORANGE, { angle: 60 + deg, gap: 3.4 });
    };
    /** A flame: base at (x, y), pointing at `deg` (0 = up). */
    const flame = (x: number, y: number, w: number, h: number, deg: number) => {
      const a = (deg * Math.PI) / 180;
      const unit: P[] = [[-0.5, 0], [-0.6, -0.35], [-0.32, -0.5], [-0.4, -0.85], [-0.08, -0.58], [0.04, -1], [0.2, -0.58], [0.45, -0.82], [0.36, -0.38], [0.58, -0.25], [0.48, 0.08], [0, 0.16]];
      const at = (f: number): P[] => unit.map(([ux, uy]) => {
        const px = ux * w * f, py = uy * h * f + h * (1 - f) * -0.12;
        return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
      });
      shape(at(1), ORANGE, { angle: deg - 90 });
      tint(at(0.66), YELLOW, { angle: deg - 90 });
      tint(at(0.34), WHITE_HOT, { angle: deg - 90 });
    };

    // three flame tails fanning out behind, on the right (each sways on its own)
    c.part('queue', { pivot: [650, 690], motion: 'swing', amp: 6, period: 1.8, behind: true }, () => tail(-14, 1.3));
    c.part('queue-2', { pivot: [650, 690], motion: 'swing', amp: 5, period: 2.1, phase: 0.35, behind: true }, () => tail(22, 1.25));
    c.part('queue-3', { pivot: [650, 690], motion: 'swing', amp: 6, period: 1.6, phase: 0.7, behind: true }, () => tail(56, 1.15));
    // the nest it sits in, its flames taller, orange flames inside
    shape(spikes([[120, 900], [160, 700], [300, 610], [700, 610], [840, 700], [880, 900]], 3, 80).concat([[500, 955]]), YELLOW, { angle: 15, press: 1.1, over: 0.5 }, {}, false);
    shape(spikes([[220, 890], [255, 740], [370, 680], [630, 680], [745, 740], [780, 890]], 3, 55).concat([[500, 925]]), ORANGE, { angle: 25, over: 0.3 }, {}, false);
    tint(potato(500, 840, 250, 60, 10, 0.1), DEEP, { gap: 3.4, angle: 15, press: 0.7 });
    // the far ear, behind, longer
    shape([[340, 270], [262, 40], [318, 18], [410, 240]], CORAL, { angle: 80 });
    shape([[350, 230], [290, 85], [325, 72], [390, 225]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // the body sitting up, the gold star on its chest
    shape(potato(510, 640, 160, 140, 12, 0.06), CORAL, { angle: 85, over: 0.55 });
    c.star(545, 690, 46, 8);
    // the ruff of flame-fur, bigger: long yellow flames, orange ones inside
    const ruff = (n: number, from: number, span: number, r0: number, r1: number, sx: number, sy: number): P[] => {
      const pts: P[] = [];
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (from + (i / (n - 1)) * span), r = i % 2 ? r1 : r0;
        pts.push([480 + Math.cos(a) * r * sx, 440 + Math.sin(a) * r * sy]);
      }
      return pts.concat([[330, 470], [480, 500], [630, 470]]);
    };
    shape(ruff(19, 0, 1, 150, 255, 1.1, 0.74), YELLOW, { angle: 80, over: 0.3 }, {}, false);
    shape(ruff(17, 0.03, 0.94, 140, 200, 1.06, 0.7), ORANGE, { angle: 70, over: 0.2 }, {}, false);
    // the near ear, longer
    shape([[520, 240], [598, 12], [662, 34], [610, 270]], CORAL, { angle: 75 });
    shape([[545, 225], [606, 72], [634, 82], [585, 240]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // the head turned left, a pointed snout
    shape([[310, 330], [370, 240], [480, 215], [590, 260], [620, 360], [570, 450], [450, 480], [340, 450], [250, 400], [240, 370]], CORAL, { angle: 80, over: 0.5 });
    // its fringe, the flame rising out of it
    shape(spikes([[400, 230], [470, 205], [540, 225]], 2, 30), YELLOW, { over: 0 }, {}, false);
    // sharp eyes under heavy brows
    c.paper([[322, 316], [386, 334], [382, 356], [352, 364], [326, 350]], { w: 5 });
    c.paper([[452, 334], [532, 304], [536, 336], [504, 364], [464, 356]], { w: 5.5 });
    dot(358, 343, 11, 14);
    dot(494, 340, 14, 17);
    dot(352, 336, 4, 4, '#ffffff');
    dot(486, 332, 5, 5, '#ffffff');
    stroke([[312, 300], [392, 328]], { w: 12 });
    stroke([[446, 328], [542, 290]], { w: 12 });
    // the nose, a smirk with a fang
    dot(250, 382, 10, 8);
    stroke([[264, 418], [322, 446], [392, 428]], { w: 6 });
    c.paper([[302, 438], [313, 466], [326, 444]], { w: 4 }, false);
    c.shine([[640, 560], [660, 600]], 6);
    // the flame on its brow, wavering
    c.part('flamme', { pivot: [470, 236], motion: 'swing', amp: 7, period: 1.3 }, () => flame(470, 238, 120, 200, -4));
  },
} satisfies Fair;

/** The crayon drawing everything (dx, dy) further, to make room for what grew; the shapes keep the pencil drawing's coordinates. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]): P => [x + dx, y + dy]);
  return {
    ...c,
    shape: (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(m(pts), col, o, l, round),
    paper: (pts: P[], l?: Line, round?: boolean) => c.paper(m(pts), l, round),
    tint: (pts: P[], col: string, o?: Colour) => c.tint(m(pts), col, o),
    stroke: (pts: P[], l?: Line, round?: boolean) => c.stroke(m(pts), l, round),
    dot: (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x + dx, y + dy, rx, ry, col),
    shine: (pts: P[], w?: number) => c.shine(m(pts), w),
    star: (x: number, y: number, r: number, rot?: number) => c.star(x + dx, y + dy, r, rot),
    part: (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + dx, def.pivot[1] + dy] }, draw),
  };
}
