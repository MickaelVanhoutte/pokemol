import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Ombrouille's fair copy, Ghost/Dark, the same drawing grown up: much taller ears and four long spikes on
 * its head instead of three, each spike's tip lit with a big ghostly blue flame, a third eye opening on its brow,
 * slit pupils under heavier brows, its toothy grin wider, longer claws on both hands, and the gold star on its
 * side. It faces left and leans, like its drawing.
 */
export default {
  id: '011', slug: 'ombrouille', seed: 11011, size: [1130, 1210], tilt: -4,
  draw(c0) {
    const c = moved(c0, 55, 190);
    const { shape, paper, stroke, dot, band, tint } = c;
    const PURPLE = '#8a4ed6', RED = '#f04a40', DARK = '#2a1838', BLUE = '#3f7fe6', CYAN = '#86dcff', WHITE = '#effbff';

    /** A ghostly blue flame, white-hot at its heart: base at (x, y), pointing at `deg` (0 = up). */
    const flame = (x: number, y: number, w: number, h: number, deg: number) => {
      const a = (deg * Math.PI) / 180;
      const unit: P[] = [[-0.5, 0], [-0.6, -0.35], [-0.32, -0.5], [-0.4, -0.85], [-0.08, -0.58], [0.04, -1], [0.2, -0.58], [0.45, -0.82], [0.36, -0.38], [0.58, -0.25], [0.48, 0.08], [0, 0.16]];
      const at = (f: number): P[] => unit.map(([ux, uy]) => {
        const px = ux * w * f, py = uy * h * f + h * (1 - f) * -0.12;
        return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
      });
      shape(at(1), BLUE, { angle: deg - 90 });
      tint(at(0.68), CYAN, { angle: deg - 90 });
      tint(at(0.36), WHITE, { angle: deg - 90 });
    };

    // the far leg and far arm, behind on the right, its claws longer
    shape(band([[600, 640], [650, 790], [690, 910]], 64, 56), PURPLE, { angle: 100 });
    c.part('bras-loin', { pivot: [720, 470], motion: 'swing', amp: 8, period: 1.9, behind: true }, () => {
      shape(band([[720, 470], [820, 380], [880, 260]], 50, 44), PURPLE, { angle: 120 });
      shape([[850, 275], [852, 120], [900, 245], [985, 148], [942, 272], [1040, 280], [905, 306]], PURPLE, { angle: 120, press: 1.1 }, {}, false);
    });
    // the head-body: taller ears, four longer spikes on top, face on the left; each spike's tip lit with a ghostly
    // flickering on its own behind it
    const spikes: P[] = [[365, 125], [462, 50], [565, 72], [658, 145]];
    spikes.forEach(([x, y], i) => c.part(`flamme-${i + 1}`, { pivot: [x, y + 60], motion: 'swing', amp: 7, period: 1.1 + i * 0.13, phase: i * 0.27, behind: true }, () => flame(x, y + 60, 108, 245, 12 + i * 5)));
    shape([[230, 420], [150, -15], [310, 292], spikes[0], [412, 286], spikes[1], [512, 280], spikes[2], [612, 286], spikes[3], [692, 292], [835, -55], [774, 420],
      [732, 582], [612, 664], [420, 674], [286, 604]], PURPLE, { angle: 80, over: 0.7, press: 1.1 }, {}, false);
    c.star(692, 505, 40, 12);
    // the near leg kicking forward
    shape(band([[400, 640], [310, 770], [230, 890]], 70, 60), PURPLE, { angle: 60 });
    // angry red eyes with slit pupils under heavier brows, the far one narrower; a third eye open on its brow
    shape([[262, 386], [356, 402], [349, 452], [312, 469], [276, 442]], RED, { angle: 90, over: 0 }, {}, false);
    shape([[455, 402], [592, 380], [582, 442], [528, 473], [472, 457]], RED, { angle: 90, over: 0 }, {}, false);
    dot(314, 430, 6, 16, DARK);
    dot(528, 430, 7, 19, DARK);
    stroke([[244, 366], [368, 398]], { w: 11 });
    stroke([[444, 398], [612, 360]], { w: 11 });
    shape([[415, 272], [452, 324], [415, 374], [378, 324]], RED, { angle: 90, over: 0 }, {}, false);
    dot(415, 324, 6, 19, DARK);
    // the grin, wider, its teeth
    const top = (x: number) => 530 - 0.0006 * (x - 420) ** 2, bottom = (x: number) => 630 - 0.0019 * (x - 420) ** 2;
    paper([[222, 503], [320, 524], [420, 531], [525, 524], [628, 498], [612, 562], [540, 614], [420, 630], [300, 614], [238, 562]]);
    for (const x of [285, 335, 385, 435, 485, 535, 585]) stroke([[x, top(x) + 4], [x + 4, bottom(x) - 6]], { w: 3.4 });
    stroke([[236, 542], [420, 576], [614, 536]], { w: 3.4 });
    // the near arm thrown forward, three longer claws
    c.part('bras', { pivot: [300, 500], motion: 'swing', amp: 8, period: 1.5 }, () => {
      shape(band([[300, 500], [190, 470], [90, 450]], 54, 46), PURPLE, { angle: 20 });
      shape([[100, 410], [-18, 336], [64, 438], [-34, 466], [68, 482], [-2, 570], [115, 495]], PURPLE, { angle: 20, press: 1.1 }, {}, false);
    });
    // only in battle: a big tongue poking out of its grin, now and then (drawn last, the card stays the same)
    c.part('langue', { pivot: [420, 600], motion: 'peek', to: [0, -55], shrink: 0.3, fade: true, period: 3.4, extra: true }, () => {
      shape([[372, 598], [470, 598], [478, 690], [448, 752], [404, 748], [370, 690]], '#f07f9a', { angle: 90, over: 0, press: 1.1 });
      stroke([[422, 610], [424, 710]], { w: 4, col: '#c4506b' });
    });
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
