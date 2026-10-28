import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Papivole's fair copy, Bug/Fairy, the same drawing grown up: its wings grown half as big again, veined,
 * the lower ones trailing long swallowtails, the little dots grown into big glittering spots (the biggest ringed
 * like eyes), long antennae curled at their tips, heavy brows over its huge red eyes, and the gold star on its
 * body. It faces left, like its drawing.
 */
export default {
  id: '007', slug: 'papivole', seed: 7007, size: [1190, 1240], tilt: -4,
  draw(c0) {
    const c = moved(c0, 45, 75);
    const { shape, paper, stroke, dot, band, potato } = c;
    const PURPLE = '#7a3dc2', RED = '#ef4c45', BLUE = '#3c6fd8', PINK = '#f29ac8', YELLOW = '#f6d23a', DARK = '#3a1f5c', VEIN = '#b39ddb';
    /** The pencil drawing's wing points, grown by `k` from the wing's root. */
    const grow = ([ox, oy]: P, k: number) => (pts: P[]) => pts.map(([x, y]): P => [ox + (x - ox) * k, oy + (y - oy) * k]);
    /** A big glittering spot: its colour, a white glint. */
    const spot = (x: number, y: number, r: number, col: string, ring?: string) => {
      if (ring) shape(potato(x, y, r * 1.4, r * 1.2, 10, 0.04), ring, { over: 0 }, { w: 4 });
      shape(potato(x, y, r, r * 0.84, 9, 0.05), col, { over: 0 }, { w: 4 });
      c.shine([[x - r * 0.5, y - r * 0.05], [x - r * 0.35, y - r * 0.45], [x - r * 0.02, y - r * 0.6]], 8);
      dot(x + r * 0.35, y + r * 0.3, r * 0.12, r * 0.12, '#ffffff');
    };

    // the far wings, grown, behind on the left (they fold in battle), the lower one trailing a swallowtail
    c.part('ailes-loin', { pivot: [405, 480], motion: 'fold', behind: true }, () => {
      const far = grow([405, 480], 1.35);
      paper(far([[400, 330], [300, 220], [190, 200], [180, 290], [215, 330], [190, 390], [260, 450], [400, 460]]));
      paper(far([[400, 500], [300, 540], [250, 640], [246, 712], [222, 770], [196, 812], [214, 826], [254, 784], [290, 732], [370, 720], [410, 620]]));
      for (const t of [[262, 240], [212, 322], [252, 420], [292, 570], [288, 690]] as P[]) stroke(far([[396, t[1] < 470 ? 455 : 505], t]), { w: 4, col: VEIN });
      spot(222, 268, 36, PINK, YELLOW);
      spot(292, 662, 40, YELLOW);
    });
    // the far leg
    shape(band([[440, 640], [410, 770], [380, 880]], 52, 46), BLUE, { angle: 80 });
    // the body: a tall purple block, the head on top, turned left; the gold star on it
    shape([[390, 425], [580, 425], [595, 560], [565, 680], [410, 680], [385, 560]], PURPLE, { angle: 95, over: 0.6 });
    c.star(492, 595, 44, -6);
    shape([[370, 235], [500, 215], [590, 235], [595, 430], [480, 438], [372, 432]], PURPLE, { angle: 95, press: 1.1, over: 0.7 });
    // the near wings, grown big, spreading to the right (they fold in battle), the lower one trailing a swallowtail
    c.part('ailes', { pivot: [565, 480], motion: 'fold' }, () => {
      const up = grow([565, 480], 1.4), low = grow([565, 480], 1.35);
      paper(up([[560, 320], [730, 160], [900, 120], [940, 240], [890, 300], [935, 380], [860, 470], [690, 490], [570, 450]]));
      paper(low([[570, 490], [740, 520], [860, 610], [850, 770], [858, 830], [884, 885], [904, 918], [882, 928], [842, 880], [800, 822], [740, 820], [650, 780], [560, 630]]));
      for (const t of [[760, 200], [880, 200], [900, 350], [820, 450]] as P[]) stroke(up([[580, 460], t]), { w: 4, col: VEIN });
      for (const t of [[770, 560], [820, 700], [720, 780]] as P[]) stroke(low([[580, 500], t]), { w: 4, col: VEIN });
      spot(842, 180, 48, PINK, YELLOW);
      spot(955, 345, 50, YELLOW);
      spot(752, 372, 46, PINK);
      spot(826, 718, 40, YELLOW, PINK);
      spot(720, 615, 44, PINK);
    });
    // the near leg
    shape(band([[530, 650], [540, 790], [535, 900]], 58, 50), BLUE, { angle: 88 });
    // long antennae, curled at their tips
    stroke([[410, 225], [372, 140], [318, 72], [248, 42], [196, 62], [190, 110], [228, 124], [250, 96]], { w: 6.5 });
    stroke([[520, 222], [534, 128], [570, 52], [632, 14], [690, 26], [704, 72], [672, 92], [650, 66]], { w: 6.5 });
    // big red eyes under heavy brows, shifted left (the far one narrower), a little blue mouth
    shape(potato(410, 320, 38, 76, 10, 0.04), RED, { angle: 90, press: 1.1, over: 0 });
    shape(potato(510, 318, 52, 82, 10, 0.04), RED, { angle: 90, press: 1.1, over: 0 });
    dot(402, 302, 8, 15, DARK);
    dot(500, 300, 10, 16, DARK);
    dot(396, 286, 4, 5, '#ffffff');
    dot(492, 282, 5, 6, '#ffffff');
    stroke([[362, 248], [446, 274]], { w: 12 });
    stroke([[466, 274], [572, 238]], { w: 12 });
    shape(potato(430, 480, 30, 22, 8, 0.1), BLUE, { angle: 0, over: 0 });
    stroke([[408, 516], [430, 530], [454, 516]], { w: 5 });
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
