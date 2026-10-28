import type { Colour, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Fanétome's fair copy, Ghost/Fairy, the same drawing grown up: its faded bell of a flower much bigger and in
 * full bloom, its rim petals flared wide open; each leaf arm grown into a fan of three big pointed leaves, like wings;
 * a longer veil trailing into a curl with petal-scalloped hems, its stem running down it to a second flower blooming
 * at the tip; fiercer slanted ghost eyes and a little fanged grin, and the gold star on its veil.
 */
export default {
  id: '098', slug: 'fanetome', seed: 98098, size: [1040, 1110], tilt: 3,
  draw(c) {
    // the whole drawing sits a little lower on the sheet, to make room for its bigger flower
    const DY = 70;
    const T = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + DY]);
    const shape = (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(T(pts), col, o, l, round);
    const paper = (pts: P[], l?: Line, round?: boolean) => c.paper(T(pts), l, round);
    const stroke = (pts: P[], l?: Line, round?: boolean) => c.stroke(T(pts), l, round);
    const tint = (pts: P[], col: string, o?: Colour) => c.tint(T(pts), col, o);
    const dot = (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x, y + DY, rx, ry, col);
    const { potato, grow } = c;
    /** The bell grown bigger, out from its rim. */
    const H = (pts: P[]): P[] => pts.map(([x, y]) => [410 + (x - 410) * 1.22, 445 + (y - 445) * 1.22]);
    const PINK = '#d99ab0', DPINK = '#c47596', LAV = '#b7a0d6', SAGE = '#9caf88', DSAGE = '#7d9068', GOLD = '#f2cf5a';
    /** A pointed leaf from its base to its tip, with its vein. */
    const leaf = (base: P, tip: P, w: number, col: string) => {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const s1: P[] = [], s2: P[] = [];
      for (let i = 1; i < 8; i++) {
        const t = i / 8, ww = w * Math.sin(Math.PI * Math.pow(t, 0.8)) * (1 - t * 0.3);
        s1.push([base[0] + dx * t + nx * ww, base[1] + dy * t + ny * ww]);
        s2.push([base[0] + dx * t - nx * ww * 0.8, base[1] + dy * t - ny * ww * 0.8]);
      }
      shape([base, ...s1, tip, ...s2.reverse()], col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 50, over: 0 }, {}, false);
      stroke([base, [base[0] + dx * 0.85, base[1] + dy * 0.85]], { w: 3.5 });
    };
    /** A flower in full bloom: five petals round a gold heart. */
    const bloom = (x: number, y: number, r: number, rot: number) => {
      for (let k = 0; k < 5; k++) {
        const a = ((rot + k * 72) * Math.PI) / 180;
        shape(potato(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.55, r * 0.42, 8, 0.05).map(([px, py]) => {
          const ux = px - (x + Math.cos(a) * r * 0.62), uy = py - (y + Math.sin(a) * r * 0.62);
          return [x + Math.cos(a) * r * 0.62 + ux * Math.cos(a) - uy * Math.sin(a), y + Math.sin(a) * r * 0.62 + ux * Math.sin(a) + uy * Math.cos(a)] as P;
        }), k % 2 ? PINK : DPINK, { angle: rot + k * 72 + 60, over: 0 }, { w: 4.5 });
      }
      shape(potato(x, y, r * 0.3, r * 0.28, 8, 0.05), GOLD, { over: 0 }, { w: 4 });
    };
    // the far leaf arm, behind, grown into a fan of three big leaves
    c.part('feuille-loin', { pivot: [560, 560 + DY], motion: 'swing', amp: -6, period: 2.8, behind: true, phase: 0.4 }, () => {
      leaf([552, 570], [820, 745], 44, SAGE);
      leaf([552, 565], [915, 600], 52, DSAGE);
      leaf([552, 560], [880, 430], 56, SAGE);
    });
    // the veil of a body, longer, trailing into a curl, its hem scalloped like petals; the stem running down it
    const veil: P[] = [[300, 500], [505, 495], [590, 600], [625, 715], [700, 815], [800, 868], [895, 860], [955, 800], [990, 735], [985, 830], [940, 905],
      [850, 950], [770, 935], [722, 990], [660, 935], [600, 1000], [545, 925], [484, 970], [450, 875], [365, 740], [302, 612]];
    paper(veil);
    tint(grow(veil, -24), LAV, { angle: 70, wash: 0.3 });
    stroke([[455, 500], [500, 620], [565, 742], [660, 840], [790, 895], [880, 885]], { w: 9, col: SAGE });
    c.star(440, 668 + DY, 46, -8);
    // a second flower blooming at the end of its stem, on the curl of the veil
    bloom(905, 868, 82, -20);
    // the near leaf arm, grown into a fan of three big leaves: in battle it waves
    c.part('feuille', { pivot: [340, 565 + DY], motion: 'swing', amp: 9, period: 2.2 }, () => {
      leaf([336, 582], [140, 790], 46, SAGE);
      leaf([340, 575], [20, 655], 54, DSAGE);
      leaf([345, 568], [30, 478], 62, SAGE);
    });
    // the head: a pale face under a bigger bell of petals flared open; in battle it bows
    c.part('tete', { pivot: [430, 505 + DY], motion: 'nod', amp: 8, period: 3.6 }, () => {
      paper(potato(398, 456, 124, 98, 10, 0.04));
      // the bell, much bigger, its outer petals flared wide open
      const hood: P[] = H([[200, 372], [222, 240], [322, 140], [462, 120], [588, 190], [640, 300], [665, 352], [705, 372], [748, 352], [722, 410], [640, 428], [592, 425],
        [542, 402], [500, 445], [452, 410], [402, 452], [342, 418], [282, 444], [232, 432], [165, 440], [92, 405], [138, 392], [178, 380]]);
      shape(hood, PINK, { angle: 70, over: 0.4 });
      tint(H([[640, 380], [700, 385], [738, 362], [718, 402], [645, 420]]), DPINK, { angle: 10, wash: 0.55 });
      tint(H([[175, 392], [120, 400], [100, 408], [165, 432], [215, 425]]), DPINK, { angle: 10, wash: 0.55 });
      // its petals' folds, and the green cup on top, longer sepals
      for (const [x0, y0, x1, y1] of [[342, 418], [452, 410], [542, 402]].map(([x, y]) => [x, y, x + (430 - x) * 0.25, 150])) {
        stroke(H([[x0, y0], [x0 + (x1 - x0) * 0.4 - 18, y0 + (y1 - y0) * 0.55], [x1, y1]]), { w: 4.5, col: DPINK });
      }
      shape(H([[362, 150], [378, 92], [424, 134], [462, 72], [494, 134], [548, 98], [532, 160], [450, 176]]), SAGE, { angle: 80, over: 0 }, {}, false);
      c.shine(T(H([[300, 200], [355, 165]])), 8);
      // hollow ghost eyes, slanted and fierce under heavy brows, the far one smaller
      shape([[312, 448], [360, 466], [360, 492], [340, 506], [316, 492]], '#2a2433', { over: 0, wash: 1 }, { w: 4 });
      shape([[400, 452], [462, 432], [466, 478], [448, 504], [414, 500]], '#2a2433', { over: 0, wash: 1 }, { w: 4 });
      dot(330, 470, 6, 7, '#ffffff');
      dot(426, 462, 7, 8, '#ffffff');
      stroke([[302, 434], [366, 455]], { w: 11 });
      stroke([[394, 444], [474, 414]], { w: 12 });
      // a little ghostly grin with a fang
      shape([[352, 526], [388, 518], [428, 526], [410, 550], [370, 550]], '#5a2430', { over: 0 }, { w: 4.5 });
      paper([[386, 520], [394, 541], [403, 521]], { w: 3.5 }, false);
    });
  },
} satisfies Fair;
