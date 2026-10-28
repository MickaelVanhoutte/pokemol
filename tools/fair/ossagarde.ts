import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Ossagarde's fair copy, Ground/Ghost (its own types), the same drawing grown up: its bone club grown huge
 * (nearly twice as thick, longer, its knobs half as big again) and burning at the top with big violet and blue
 * ghostly flames, its pencil wisps grown and gathered on the club; its horns twice as long, swept back; a row of bony
 * teeth on its skull helmet over its snout; red eyes glowing under heavy brows, a snarl with two fangs, longer
 * claws, its ghostly shadow underfoot, and the gold star on its belly plate. Drawn lower on a bigger sheet, so the
 * club and flames have room.
 */
export default {
  id: '066', slug: 'ossagarde', seed: 6666, size: [1300, 1440], tilt: 2,
  draw(c) {
    const { band, potato } = c;
    // the pencil drawing's coordinates, moved down and right on the bigger sheet
    const DX = 30, DY = 340;
    const mv = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape: typeof c.shape = (pts, ...r) => c.shape(mv(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(mv(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(mv(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(mv(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(mv(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + DX, y + DY, ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1] + DY] }, draw);

    const BROWN = '#8a5a30', CREAM = '#f1dcae', BONE = '#f6f1e4', DARK = '#3a3346', HORN = '#ddd2bb';
    const GHOST = '#8a5ad0', WISP = '#a7b2f2', PALE = '#eeeaff', RED = '#e8302c';
    /** A ghostly flame, violet going blue-white inside: base at (x, y), pointing at angle `deg` (0 = up). */
    const flame = (x: number, y: number, w: number, h: number, deg: number) => {
      const a = (deg * Math.PI) / 180;
      const unit: P[] = [[-0.5, 0], [-0.6, -0.35], [-0.32, -0.5], [-0.4, -0.85], [-0.08, -0.58], [0.04, -1], [0.2, -0.58], [0.45, -0.82], [0.36, -0.38], [0.58, -0.25], [0.48, 0.08], [0, 0.16]];
      const at = (f: number): P[] => unit.map(([ux, uy]) => {
        const px = ux * w * f, py = uy * h * f + h * (1 - f) * -0.12;
        return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
      });
      shape(at(1), GHOST, { angle: deg - 90 });
      tint(at(0.66), WISP, { angle: deg - 90 });
      tint(at(0.36), PALE, { angle: deg - 90 });
    };
    // a ghostly shadow under it, like its pencil drawing's
    tint(potato(520, 1050, 330, 45, 10, 0.1), '#9a6ad6', { gap: 4, wash: 0.25 });
    // the club, longer and thicker, burning with big ghostly flames at the top, behind the head (it swings in battle)
    part('massue', { pivot: [700, 560], motion: 'swing', amp: 5, period: 2 }, () => {
      flame(1060, 50, 170, 250, 30);
      flame(900, 70, 170, 250, -34);
      flame(985, 20, 230, 320, -2);
      shape(band([[805, 465], [985, 45]], 86, 76), BONE, { angle: 60, over: 0 });
      for (const [x, y, r] of [[950, 28, 72], [1030, 55, 66], [796, 494, 54], [846, 500, 50]] as const) shape(potato(x, y, r, r * 0.9, 8, 0.05), BONE, { over: 0 }, { w: 4.5 });
      tint(potato(990, 50, 85, 40, 8, 0.1), WISP, { gap: 4 });
      shine([[855, 380], [945, 160]], 8);
      stroke([[905, 250], [925, 285], [912, 320]], { w: 4 });
    });
    // the tail (it sways in battle), the far leg and the far arm reaching out with its longer claws, behind
    part('queue', { pivot: [640, 850], motion: 'swing', amp: 5, period: 2.6, behind: true }, () => {
      shape(band([[640, 850], [790, 900], [900, 860], [960, 780], [975, 730]], 78, 24), BROWN, { angle: 30 });
    });
    shape(band([[470, 830], [410, 950], [385, 1030]], 96, 84), BROWN, { angle: 90 });
    for (const dy of [-22, 0, 22]) paper([[300, 1040 + dy - 9], [262, 1046 + dy * 1.4], [300, 1040 + dy + 9]], { w: 3.5 }, false);
    shape(potato(360, 1045, 76, 32, 8, 0.06), BROWN, { over: 0 });
    shape(band([[410, 590], [300, 630], [205, 610]], 66, 56), BROWN, { angle: 30 });
    for (const dy of [-28, 0, 28]) paper([[198, 600 + dy - 10], [128, 594 + dy * 1.5], [198, 600 + dy + 10]], { w: 3.5 }, false);
    // the lean body, its ridged belly plate and the star
    shape([[360, 560], [480, 500], [620, 510], [700, 600], [700, 760], [640, 880], [500, 910], [400, 860], [350, 730]], BROWN, { angle: 80, over: 0.5 });
    shape([[415, 620], [540, 600], [595, 700], [565, 840], [465, 862], [415, 760]], CREAM, { over: 0 });
    for (const y of [680, 740, 800]) stroke([[425, y], [575, y - 8]], { w: 3.5 });
    c.star(505 + DX, 755 + DY, 44, -6);
    // the near leg, wide apart, its claws; the near arm raising the club
    shape(band([[610, 850], [655, 960], [665, 1035]], 102, 92), BROWN, { angle: 90 });
    for (const dy of [-22, 0, 22]) paper([[630, 1050 + dy - 9], [588, 1056 + dy * 1.4], [630, 1050 + dy + 9]], { w: 3.5 }, false);
    shape(potato(695, 1050, 86, 34, 8, 0.06), BROWN, { over: 0 });
    part('massue', { pivot: [700, 560], motion: 'swing', amp: 5, period: 2 }, () => {
      shape(band([[640, 600], [770, 480], [830, 370]], 70, 60), BROWN, { angle: 120 });
      shape(potato(835, 365, 46, 44, 8, 0.08), BROWN, { over: 0 });
    });
    // the head under its skull helmet, bigger now: longer horns swept back, bony teeth over the snout, a crack
    shape(potato(430, 430, 150, 125, 12, 0.05), BROWN, { angle: 80, over: 0.4 });
    shape(band([[470, 258], [520, 160], [600, 82], [700, 40], [800, 48]], 100, 8), HORN, { angle: 20, over: 0 });
    shape(band([[560, 308], [638, 225], [720, 168], [805, 148], [868, 168]], 92, 8), HORN, { angle: 20, over: 0 });
    shine([[560, 150], [640, 90]], 6);
    for (const [x, y] of [[236, 426], [272, 446], [310, 448], [348, 432]] as P[]) paper([[x - 19, y - 10], [x, y + 46], [x + 19, y - 10]], { w: 4 }, false);
    shape([[209, 426], [230, 301], [333, 226], [484, 215], [603, 269], [641, 388], [587, 453], [500, 409], [381, 415], [290, 459]], BONE, { angle: 70, over: 0.3 }, {}, false);
    stroke([[520, 225], [498, 270], [530, 298], [502, 345]], { w: 4 });
    shine([[270, 330], [330, 262]], 7);
    dot(240, 385, 7, 9, DARK);
    dot(263, 380, 6, 8, DARK);
    // glowing red eyes in the dark holes under heavy brows, a snarl with two fangs
    shape(potato(330, 352, 32, 30, 8, 0.08), DARK, { over: 0, press: 1.2 }, { w: 3.5 });
    shape(potato(447, 342, 40, 36, 8, 0.08), DARK, { over: 0, press: 1.2 }, { w: 3.5 });
    dot(334, 358, 11, 9, RED);
    dot(452, 348, 14, 11, RED);
    dot(334, 358, 4, 3, '#ffd2d2');
    dot(452, 348, 5, 4, '#ffd2d2');
    stroke([[278, 306], [362, 334]], { w: 11 });
    stroke([[402, 326], [500, 294]], { w: 12 });
    stroke([[268, 505], [330, 486], [400, 500]], { w: 5.5 });
    paper([[292, 492], [302, 524], [314, 494]], { w: 3.5 }, false);
    paper([[352, 489], [362, 520], [374, 492]], { w: 3.5 }, false);
  },
} satisfies Fair;
