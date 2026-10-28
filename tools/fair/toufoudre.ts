import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Toufoudre's fair copy, Electric/Flying, the same drawing grown up: the zig-zag fur on its back grown
 * into two fans of jagged lightning feathers like wings, its spiky tail grown into a big lightning bolt, a bigger
 * spiky white collar, longer ears, a sharp eye under a heavy brow, a fang, and the gold star on its side. It faces
 * left and leaps, like its drawing.
 */
export default {
  id: '019', slug: 'toufoudre', seed: 19019, size: [1260, 1000], tilt: 2,
  draw(c0) {
    const c = moved(c0, 25, 60);
    const { shape, paper, stroke, dot, band, spikes } = c;
    const YELLOW = '#f7da2c', GREY = '#55505c', AMBER = '#eba417';

    /** A fan of pointed feathers from `root`, a lightning bolt down each: tips at these angles (degrees, -90 = up) and lengths. */
    const wing = (root: P, tips: [number, number][], col: string) => {
      const at = (deg: number, len: number): P => [root[0] + Math.cos((deg * Math.PI) / 180) * len, root[1] + Math.sin((deg * Math.PI) / 180) * len];
      const pts: P[] = [[root[0] - 45, root[1] + 10]];
      tips.forEach(([deg, len], i) => {
        if (i) pts.push(at((tips[i - 1][0] + deg) / 2, Math.min(tips[i - 1][1], len) * 0.6));
        pts.push(at(deg, len));
      });
      pts.push([root[0] + 55, root[1] + 25]);
      shape(pts, col, { angle: tips[1][0] + 90, press: 1.05 }, {}, false);
      for (const [deg, len] of tips) stroke([at(deg + 2, len * 0.22), at(deg - 4, len * 0.45), at(deg + 4, len * 0.52), at(deg - 1, len * 0.78)], { w: 5, col: GREY }, false);
    };

    // back legs
    shape(band([[760, 560], [850, 680], [900, 820]], 80, 62), YELLOW, { angle: 70 });
    shape(band([[650, 590], [640, 720], [620, 840]], 74, 60), YELLOW, { angle: 95 });
    // its tail grown into a big lightning bolt
    c.part('queue', { pivot: [850, 455], motion: 'swing', amp: 6, period: 1.2, behind: true }, () => {
      shape([[800, 440], [990, 268], [955, 258], [1170, 70], [1045, 300], [1085, 312], [895, 500]], YELLOW, { angle: 30, press: 1.1 }, {}, false);
      stroke([[870, 450], [995, 300], [1000, 295], [1110, 160]], { w: 5, col: AMBER }, false);
    });
    // the far wing, behind, higher
    c.part('aile-loin', { pivot: [630, 410], motion: 'flap', amp: 10, period: 0.7, behind: true }, () => {
      wing([630, 410], [[-88, 420], [-68, 465], [-48, 445]], AMBER);
    });
    // the body, zig-zag fur along the back, the gold star on its side
    shape(spikes([[330, 470], [470, 400], [640, 380], [820, 420]], 4, 62).concat([[860, 520], [780, 610], [560, 640], [380, 620], [300, 560]]), YELLOW, { angle: 15, over: 0.5 }, {}, false);
    c.star(700, 540, 46, -10);
    // the near wing, its fur grown into lightning feathers
    c.part('aile', { pivot: [565, 430], motion: 'flap', amp: -10, period: 0.7 }, () => {
      wing([565, 430], [[-75, 380], [-55, 420], [-35, 410], [-15, 340]], YELLOW);
    });
    // front legs stretched forward
    shape(band([[360, 580], [260, 680], [150, 740]], 70, 58), YELLOW, { angle: 30 });
    shape(band([[430, 600], [380, 720], [330, 840]], 70, 58), YELLOW, { angle: 70 });
    // the white collar of spiky fur, bigger
    paper(spikes([[190, 415], [330, 618], [485, 548], [462, 368]], 4, 62).concat([[300, 325]]), {}, false);
    // the head, longer ears with grey insides
    shape([[236, 232], [322, 8], [372, 240]], YELLOW, { angle: 70 }, {}, false);
    shape([[273, 220], [322, 78], [347, 226]], GREY, { angle: 70, over: 0, press: 0.9 }, { w: 3 }, false);
    shape([[330, 250], [548, 95], [432, 302]], YELLOW, { angle: 40 }, {}, false);
    shape([[372, 255], [500, 150], [422, 287]], GREY, { angle: 40, over: 0, press: 0.9 }, { w: 3 }, false);
    shape([[120, 330], [180, 250], [300, 220], [420, 290], [430, 380], [330, 440], [190, 430], [110, 390]], YELLOW, { angle: 60, over: 0.5 });
    // a sharp eye under a heavy brow, the nose, a grin with a fang
    paper([[226, 322], [308, 298], [316, 336], [290, 362], [246, 354]], { w: 5 });
    shape(c.potato(274, 333, 32, 30, 9, 0.04), GREY, { angle: 80, over: 0, press: 1.2 }, { w: 3 });
    dot(276, 335, 13, 15);
    dot(266, 322, 7, 7, '#ffffff');
    stroke([[212, 302], [322, 270]], { w: 12 });
    dot(125, 345, 9, 7);
    stroke([[128, 388], [175, 414], [222, 392]], { w: 6 });
    paper([[158, 405], [167, 432], [178, 409]], { w: 4 }, false);
    c.shine([[200, 270], [235, 255]], 6);
    // sparks crackling off it (only in battle)
    c.part('etincelles', { pivot: [530, 190], motion: 'flicker', period: 1.6, extra: true }, () => {
      stroke([[60, 170], [95, 210], [70, 215], [105, 260]], { w: 5 }, false);
      stroke([[1150, 230], [1185, 270], [1160, 278], [1200, 330]], { w: 5 }, false);
      stroke([[860, 20], [890, 60], [868, 66], [900, 110]], { w: 5 }, false);
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
