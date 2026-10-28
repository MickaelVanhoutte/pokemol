import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';
import { star } from '../redraws/lumignon.ts';
import { DRAGON, accordion, charm, flower, horn } from '../redraws/plissou.ts';

/** The same pen moved by (dx, dy) on the sheet, so the drawing keeps its own coordinates with room round it. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]) => [x + dx, y + dy] as P);
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

/** A pleated paper fan opening from (x, y), from angle a0 to a1 (degrees), n folds in turn of colour. */
function fan(c: Crayon, x: number, y: number, r: number, a0: number, a1: number, n: number, cols: string[]) {
  for (let k = 0; k < n; k++) {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180, b = ((a0 + ((a1 - a0) * (k + 1)) / n) * Math.PI) / 180;
    const rr = r * (k % 2 ? 0.92 : 1);
    c.shape([[x, y], [x + Math.cos(a) * rr, y + Math.sin(a) * rr], [x + Math.cos(b) * rr, y + Math.sin(b) * rr]], cols[k % cols.length], { over: 0 }, { w: 4 }, false);
  }
}

/**
 * Festivouivre's fair copy, Dragon/Fire, the same drawing grown up: its pleated paper fan grown into a mane
 * twice as big round its head, two layers of folds like a lion-dance head (a few of them fire-red), fireworks bursting
 * from three of its tips; its parade body longer and thicker, arching high behind the mane with more folds and paper
 * flowers; a bigger burst of fireworks from the star charm at the tip of its tail; a fuller scalloped mane, a bigger
 * unicorn horn in a bigger crown of flowers, longer claws, fangs under its grin, brows over its starry eyes, and the
 * gold star on its head. It faces left, like its drawing.
 */
export default {
  id: '086', slug: 'festivouivre', seed: 8686, size: [1800, 1370], tilt: -2,
  draw(pen) {
    const c = moved(pen, 115, 335);
    const { shape, stroke, dot, band, potato, spikes } = c;
    const { BODY, MANE, ACCENT, ACCENT2, ACCENT3, CREAM, STAR, DEEP, LEG_FAR, HORN, STRIPE } = DRAGON;
    const FIRE = '#ee4b2b', EMBER = '#f7a12b';
    /** A firework bursting round (x, y): rays out from it, a bead of fire at the end of each. */
    const burst = (x: number, y: number, r0: number, r1: number, n: number, turn: number, bead = 14) => {
      for (let k = 0; k < n; k++) {
        const a = turn + (k / n) * Math.PI * 2, col = [FIRE, EMBER, STAR][k % 3];
        const p0: P = [x + Math.cos(a) * r0, y + Math.sin(a) * r0], p1: P = [x + Math.cos(a) * r1, y + Math.sin(a) * r1];
        stroke([p0, p1], { w: 15 });
        stroke([p0, p1], { w: 8, col });
        shape(potato(p1[0], p1[1], bead, bead, 7, 0.05), col, { over: 0, wash: 1 }, { w: 4 });
      }
    };
    c.part('corps', { pivot: [440, 420], motion: 'swing', amp: 1.5, period: 2.4, behind: true }, () => {
      // the far legs, behind
      shape(band([[1265, 720], [1245, 905]], 70, 58), LEG_FAR, { angle: 90, over: 0 });
      shape(band([[560, 660], [540, 850]], 66, 56), LEG_FAR, { angle: 90, over: 0 });
      // the longer, thicker body arching high behind the mane, tail first: more folds, sparkles and flowers along it
      const body: P[] = [[1500, 160], [1525, 410], [1445, 615], [1300, 690], [1170, 610], [1110, 420], [1060, 220], [960, 140], [840, 230], [730, 420], [600, 580], [460, 460]];
      accordion(c, body, 29, 140, 250, [BODY, ACCENT3, ACCENT2, ACCENT, MANE], (k, [x, y], w) => {
        if (k % 2 === 0) shape(star(x, y, 16, k * 0.4), '#ffffff', { over: 0, wash: 1 }, { w: 2.5 }, false);
        if (k % 3 === 2) flower(c, x + 8, y - w / 2 - 6, 50, [BODY, ACCENT, ACCENT2, ACCENT3][((k / 3) | 0) % 4], k % 2 ? STAR : '#ffffff');
      });
      // a bigger burst of fireworks from the star charm at the tip of its tail
      burst(1517, 31, 44, 165, 10, 0.2, 17);
      charm(c, 1500, 160, 1.5, STAR, FIRE);
    });
    // the near legs, longer cream claws
    for (const [x0, y0, x1, y1] of [[1335, 720, 1355, 935], [615, 660, 625, 885]] as const) {
      shape(band([[x0, y0], [x1, y1]], 80, 70), MANE, { angle: 90, over: 0 });
      for (const dx of [-34, 0, 34]) shape(band([[x1 + dx, y1 + 10], [x1 + dx - 18, y1 + 64]], 22, 6), CREAM, { over: 0 }, { w: 3.5 });
    }
    // fireworks bursting from three tips of the mane (behind it, so they grow out of its folds)
    const tip = (deg: number, r: number): P => [400 + Math.cos((deg * Math.PI) / 180) * r, 330 + Math.sin((deg * Math.PI) / 180) * r];
    for (const [d, t] of [[-136, 0.1], [-95, 0.4], [-55, 0.25]] as const) { const [x, y] = tip(d, 560); burst(x, y, 30, 118, 8, t); }
    // the pleated paper fan grown into a mane twice as big, two layers of folds, a few fire-red, then the scalloped mane
    fan(c, 400, 330, 545, -150, 45, 19, [BODY, ACCENT, ACCENT3, FIRE, ACCENT2, MANE]);
    fan(c, 400, 330, 395, -142, 40, 15, [ACCENT, ACCENT2, MANE, ACCENT3, FIRE, BODY]);
    const mane: P[] = [];
    for (let k = 0; k <= 16; k++) { const a = -2.05 + k * 0.235, r = k % 2 ? 255 : 300; mane.push([330 + Math.cos(a) * r, 340 + Math.sin(a) * r]); }
    shape([...mane, [330, 340]], MANE, { angle: 60, over: 0 });
    // the far front leg holding up the rainbow pearl, longer claws
    shape(band([[460, 600], [330, 640], [250, 600]], 72, 60), MANE, { angle: 30, over: 0 });
    shape(potato(200, 590, 76, 76, 12, 0.03), BODY, { angle: 60, over: 0 });
    c.tint(potato(180, 568, 44, 40, 8, 0.1), ACCENT, { gap: 3.2 });
    c.tint(potato(228, 618, 36, 30, 8, 0.1), ACCENT3, { gap: 3.2 });
    dot(172, 556, 11, 13, '#ffffff');
    for (const dx of [-40, -8, 24]) shape(band([[252 + dx, 640], [238 + dx, 690]], 20, 6), CREAM, { over: 0 }, { w: 3.5 });
    // the big head: long snout, cream muzzle and a fuller cream beard, a rosy cheek
    shape([[90, 330], [150, 230], [290, 170], [440, 180], [520, 270], [510, 400], [420, 460], [270, 480], [130, 450], [70, 390]], BODY, { angle: 75, over: 0.55, press: 1.05 });
    shape(spikes([[320, 470], [220, 485], [120, 462]], 3, 66).concat([[220, 440]]), CREAM, { angle: 90, over: 0 }, {}, false);
    shape([[60, 350], [130, 300], [290, 330], [320, 410], [250, 470], [120, 460], [60, 410]], CREAM, { angle: 80, over: 0.2 });
    c.tint(potato(400, 410, 36, 24, 8, 0.1), DEEP, { gap: 3 });
    c.star(440, 320, 42, 10);
    dot(90, 350, 10, 8);
    dot(138, 336, 10, 8);
    // a grin with two fangs
    c.paper([[150, 430], [162, 466], [176, 432]], { w: 4 }, false);
    c.paper([[214, 432], [226, 466], [240, 428]], { w: 4 }, false);
    stroke([[100, 420], [170, 438], [240, 420], [275, 396]], { w: 6 });
    // a bigger unicorn horn, and a bigger crown of paper flowers round it
    horn(c, [250, 205], [200, -25], 80, HORN, STRIPE);
    for (const [x, y, r, col] of [[330, 185, 56, ACCENT], [415, 196, 52, ACCENT3], [485, 238, 48, ACCENT2], [170, 212, 46, MANE], [380, 128, 40, ACCENT2]] as const) flower(c, x, y, r, col, STAR);
    // starry eyes under brows
    c.paper(potato(230, 272, 30, 24, 8, 0.05));
    c.paper(potato(345, 262, 34, 28, 8, 0.05));
    dot(224, 277, 15, 15, '#5a3f8a');
    dot(339, 268, 17, 17, '#5a3f8a');
    shape(star(218, 270, 8, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    shape(star(332, 260, 9, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    stroke([[192, 238], [262, 254]], { w: 10 });
    stroke([[305, 246], [384, 228]], { w: 10 });
    // long ribbon whiskers, a paper fold on the head
    shape(band([[90, 400], [36, 470], [26, 580], [70, 670]], 28, 12), ACCENT, { over: 0 }, { w: 4 });
    stroke([[490, 220], [508, 330], [488, 430]], { w: 3.5, col: DEEP });
    c.shine([[120, 250], [200, 205]], 7);
    // in battle, little flames flicker at its nostrils
    c.part('souffle', { pivot: [80, 345], motion: 'flicker', period: 1.4, extra: true }, () => {
      for (const [x, y, a] of [[70, 340, -150], [118, 318, -120]] as const) {
        const r = (a * Math.PI) / 180, ux = Math.cos(r), uy = Math.sin(r), nx = -uy, ny = ux;
        shape([[x + nx * 14, y + ny * 14], [x + ux * 46 + nx * 20, y + uy * 46 + ny * 20], [x + ux * 70, y + uy * 70], [x + ux * 40 - nx * 16, y + uy * 40 - ny * 16], [x - nx * 14, y - ny * 14]], FIRE, { over: 0 }, { w: 4 });
        shape([[x + nx * 6, y + ny * 6], [x + ux * 40, y + uy * 40], [x - nx * 6, y - ny * 6]], STAR, { over: 0 }, { w: 2.5 }, false);
      }
    });
  },
} satisfies Fair;
