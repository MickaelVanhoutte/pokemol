import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Gloutoflor's fair copy, Grass/Dark, the same drawing grown up: its flytrap jaw opened on a dark maw
 * with two rows of longer fangs; its leaf hood bigger and more jagged, a second row of tall leaf points rising
 * behind it like a crown; its two leaves half as big again and more serrated; its vines longer, thicker and covered
 * in dark thorns; a fiercer glare under heavy brows; the gold star on its leaf hood. Drawn on a bigger sheet, so
 * the leaves have room.
 */
export default {
  id: '064', slug: 'gloutoflor', seed: 6464, size: [1520, 1280], tilt: 2,
  draw(c) {
    const { band, potato, spikes } = c;
    // the pencil drawing's coordinates, moved on the bigger sheet
    const DX = 200, DY = 130;
    const mv = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape: typeof c.shape = (pts, ...r) => c.shape(mv(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(mv(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(mv(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(mv(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(mv(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + DX, y + DY, ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1] + DY] }, draw);
    const YELLOW = '#efc22c', GREEN = '#3f9a2a', DEEPGREEN = '#2a6e1c', BROWN = '#8a5a2c', RED = '#d8456a', MAW = '#3a1f3a', THORN = '#4a2d4e';
    // a point along a path, t from 0 to 1
    const along = (path: P[], t: number): P => {
      const f = t * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), k = f - i;
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
    };
    /** A thick vine along a path, dark thorns on both sides. */
    const vine = (path: P[], w0: number, w1: number, angle: number) => {
      for (let i = 1; i < path.length - 1; i++) {
        const [a, b] = [path[i - 1], path[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
        const w = (w0 + ((w1 - w0) * i) / (path.length - 1)) / 2, s = i % 2 ? 1 : -1, [x, y] = path[i], h = w + 46;
        shape([[x - (dx / l) * 14, y - (dy / l) * 14], [x + nx * s * h + (dx / l) * 12, y + ny * s * h + (dy / l) * 12], [x + (dx / l) * 14, y + (dy / l) * 14]], THORN, { over: 0 }, { w: 4 }, false);
      }
      shape(band(path, w0, w1), GREEN, { angle });
      stroke(path.slice(0, -1).map(([x, y]) => [x + 4, y - 4] as P), { w: 3, col: DEEPGREEN });
    };
    /** Scales a shape around a point. */
    const big = (pts: P[], o: P, k: number): P[] => pts.map(([x, y]) => [o[0] + (x - o[0]) * k, o[1] + (y - o[1]) * k]);
    // thick thorny vines coiled behind, longer: one above the hood, one out to the right, one low on the left
    part('lianes', { pivot: [560, 620], motion: 'swing', amp: 4, period: 2.6, behind: true }, () => {
      const o: P = [560, 620];
      vine(big([[700, 340], [770, 210], [870, 130], [975, 140], [1015, 230], [970, 295], [905, 270], [915, 215]], o, 1.15), 96, 34, 60);
      vine(big([[790, 660], [940, 680], [1040, 780], [1030, 900], [950, 930], [910, 875], [950, 840]], o, 1.15), 88, 30, 120);
      vine(big([[380, 860], [250, 900], [150, 860], [130, 770], [190, 730], [235, 775], [205, 810]], o, 1.15), 82, 28, 30);
    });
    // the far leaf, half as big again
    const far = big([[340, 660], [220, 590], [160, 560], [80, 545], [120, 600], [40, 600], [140, 640], [30, 675], [150, 700], [60, 750], [200, 725], [130, 790], [330, 735]], [340, 700], 1.5);
    shape(far, GREEN, { angle: 20, press: 1.1 }, {}, false);
    stroke([[330, 690], [-60, 595]], { w: 5, col: DEEPGREEN });
    // the huge pitcher, round, its point at the bottom, brown spots
    shape([[290, 450], [380, 340], [550, 300], [730, 330], [830, 450], [850, 620], [800, 790], [700, 920], [600, 990], [545, 1050], [505, 985], [400, 900], [310, 760], [270, 600]], YELLOW, { angle: 80, over: 0.6, press: 1.05 });
    for (const [x, y, r] of [[750, 530, 30], [770, 700, 26], [670, 860, 28], [430, 840, 22], [580, 960, 16]] as const) shape(potato(x, y, r, r * 0.8, 8, 0.1), BROWN, { over: 0 }, { w: 3.5 });
    shine([[360, 760], [400, 860]], 8);
    // the maw opened wide, dark inside, upper fangs hanging down
    const top: P[] = [[272, 625], [350, 585], [460, 570], [580, 576], [690, 596], [752, 645]];
    const low: P[] = [[272, 625], [350, 690], [460, 712], [580, 712], [690, 690], [752, 645]];
    shape([...top, ...low.slice(1, -1).reverse()], MAW, { angle: 0, over: 0, press: 1.2 }, { w: 5 });
    tint(potato(510, 670, 120, 22, 9, 0.1), RED, { gap: 4 });
    for (let k = 0; k < 9; k++) {
      const [x, y] = along(top, 0.08 + k * 0.105), h = 62 - Math.abs(k - 4) * 6;
      paper([[x - 17, y - 4], [x + 2, y + h], [x + 17, y - 4]], { w: 4 }, false);
    }
    stroke(top.map(([x, y]) => [x, y - 6] as P), { w: 7, col: RED });
    stroke(top, { w: 6.5 });
    // the lower jaw and its fangs pointing up
    for (let k = 0; k < 8; k++) {
      const [x, y] = along(low, 0.12 + k * 0.108), h = 52 - Math.abs(k - 3.5) * 6;
      paper([[x - 15, y + 4], [x + 2, y - h], [x + 15, y + 4]], { w: 4 }, false);
    }
    stroke(low.map(([x, y]) => [x, y + 6] as P), { w: 7, col: RED });
    stroke(low, { w: 6.5 });
    // the jagged leaf hood, bigger, a second row of tall leaf points rising behind it, its tip hanging over the face
    shape(spikes([[200, 430], [330, 290], [520, 200], [730, 205], [905, 320]], 3, -110).concat([[835, 405], [640, 385], [460, 410], [320, 462], [200, 468]] as P[]), DEEPGREEN, { angle: 60, press: 1.1, over: 0.3 }, {}, false);
    shape(spikes([[180, 440], [320, 320], [520, 240], [730, 250], [900, 355]], 3, -58).concat([[835, 405], [640, 385], [460, 410], [320, 462], [200, 468]] as P[]), GREEN, { angle: 30, press: 1.15, over: 0.4 }, {}, false);
    stroke([[215, 450], [440, 355], [680, 315], [865, 375]], { w: 4, col: DEEPGREEN });
    c.star(640 + DX, 352 + DY, 46, 6);
    // a fierce glare under heavy brows
    paper([[322, 498], [388, 516], [380, 540], [330, 536]]);
    paper([[440, 506], [518, 486], [516, 526], [450, 534]]);
    dot(356, 523, 11, 11);
    dot(480, 514, 13, 13);
    dot(352, 519, 3, 3, '#ffffff');
    dot(475, 509, 4, 4, '#ffffff');
    stroke([[305, 482], [392, 508]], { w: 12 });
    stroke([[430, 500], [528, 470]], { w: 13 });
    // the near leaf, half as big again and serrated
    part('feuille', { pivot: [765, 750], motion: 'swing', amp: 6, period: 2 }, () => {
      shape(big([[760, 700], [880, 640], [960, 600], [1000, 560], [1010, 625], [1075, 620], [1030, 680], [1095, 720], [1010, 750], [1060, 800], [960, 800], [985, 850], [870, 815], [770, 790]], [765, 750], 1.5), GREEN, { angle: 160, press: 1.1 }, {}, false);
      stroke([[780, 750], [1210, 660]], { w: 5, col: DEEPGREEN });
    });
  },
} satisfies Fair;
