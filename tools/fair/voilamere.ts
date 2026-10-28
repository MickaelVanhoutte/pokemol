import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Voilamère's fair copy, Water/Electric, the same drawing grown up: its sail grown nearly twice as tall and
 * swept back like a crest of foam, with more ruffles; its dome bigger, the ring of barbs round its rim bigger and
 * sharper; its tentacles longer and thicker, each lit by a glowing yellow bead near its tip; its round spots lit up
 * like bulbs, longer crepe curtains, a sterner face under heavier brows, and the gold star on its dome.
 */
export default {
  id: '102', slug: 'voilamere', seed: 102102, size: [1180, 1460], tilt: 3,
  draw(c) {
    const { shape, paper, stroke, dot, tint, band, spikes, potato } = c;
    const VIOLET = '#8e5cc8', PINK = '#f2a0c8', LILAC = '#c4a6ec', TEAL = '#4fb8b2', POISON = '#7bc043', DEEP = '#5d3a8e', GLOW = '#f8dc3c';
    /** Everything moved down the sheet, to make room for the great sail and the longer tentacles. */
    const DY = 310;
    const D = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + DY]);
    /** The dome grown bigger, out from the middle of its rim. */
    const B = (pts: P[]): P[] => pts.map(([x, y]) => [500 + (x - 500) * 1.16, 600 + DY + (y - 600) * 1.16]);
    /** A long tentacle hanging down in waves from (x, y), knotted, a glowing bead near its tip. */
    const tentacle = (x: number, y: number, len: number, sway: number, w: number, col: string) => {
      const path: P[] = Array.from({ length: 10 }, (_, k) => [x + Math.sin(k * 0.95 + x) * sway, y + DY + (k * len) / 9]);
      shape(band(path, w, w * 0.3), col, { angle: 90, over: 0.2 });
      shape(potato(path[3][0], path[3][1], w * 0.46, w * 0.34, 7, 0.06), POISON, { over: 0 });
      const [bx, by] = path[7];
      shape(potato(bx, by, w * 0.68, w * 0.56, 8, 0.05), GLOW, { over: 0 });
      dot(bx - w * 0.15, by - w * 0.15, w * 0.15, w * 0.15, '#ffffff');
    };
    // tentacles at the back, behind everything, longer
    c.part('tentacules-loin', { pivot: [600, 560 + DY], motion: 'swing', amp: 7, period: 3, behind: true, phase: 0.5 }, () => {
      tentacle(650, 540, 500, 36, 46, TEAL);
      tentacle(770, 500, 470, -32, 42, LILAC);
      tentacle(545, 560, 490, 30, 40, DEEP);
    });
    // the sail along its top, grown huge, swept back and more ruffled: in battle it ripples
    c.part('voile', { pivot: [540, 230 + DY], motion: 'swing', amp: 5, period: 2.4, behind: true }, () => {
      const base = B([[0, 230]])[0][1];
      // grown nearly twice as tall, and swept back like a crest of foam
      const up = (pts: P[]): P[] => B(pts).map(([x, y]) => {
        const h = (base - y) * 1.9;
        return [x + Math.max(0, h) * 0.55, base - h];
      });
      const crest: P[] = [[300, 270], [305, 185], [340, 135], [370, 175], [400, 85], [450, 140], [490, 50], [530, 115], [575, 20], [615, 100], [665, 50], [690, 125], [745, 110],
        [760, 250], [640, 225], [520, 215], [400, 245]];
      shape(up(crest), TEAL, { angle: 80, over: 0.3, press: 1.15 });
      tint(up([[330, 250], [345, 175], [400, 110], [490, 80], [575, 50], [665, 80], [730, 140], [745, 230], [520, 200]]), PINK, { gap: 3.4, wash: 0.3, press: 0.7 });
      for (const [x, y] of [[340, 140], [400, 90], [490, 55], [575, 26], [665, 55], [745, 115]]) stroke(up([[x, y + 12], [x + 8, 228]]), { w: 4, col: '#2e7f7a' });
    });
    // a ring of bigger, sharper barbs round the rim, behind it
    shape(spikes(B([[180, 560], [330, 610], [500, 620], [680, 600], [820, 540]]), 5, 84).concat(B([[820, 520], [180, 540]])), POISON, { angle: 70, over: 0.2 }, {}, false);
    // the great dome, bigger, layered tissue paper
    const dome: P[] = [[175, 555], [190, 400], [280, 275], [420, 205], [580, 200], [720, 260], [810, 380], [830, 520], [785, 580], [720, 560], [660, 600], [590, 575],
      [520, 610], [450, 580], [380, 612], [310, 580], [240, 600]];
    shape(B(dome), VIOLET, { angle: 60, over: 0.5 });
    tint(B([[600, 240], [760, 300], [750, 450], [610, 420]]), PINK, { gap: 3.2, wash: 0.45 });
    tint(B([[230, 420], [360, 380], [380, 510], [240, 540]]), LILAC, { gap: 3.2, wash: 0.5 });
    tint(B([[430, 240], [560, 230], [570, 330], [440, 340]]), TEAL, { gap: 3.2, wash: 0.4 });
    stroke(B([[600, 240], [760, 300], [750, 450], [610, 420], [600, 240]]), { w: 3, col: '#c46a9e' }, false);
    // its round spots lit up like bulbs
    for (const [[x, y], r] of [[[560, 300], 26], [[700, 380], 21], [[300, 330], 18]].map(([p, r]) => [B([p as P])[0], r as number] as [P, number])) {
      shape(potato(x, y, r, r, 8, 0.05), GLOW, { over: 0 });
      dot(x - r * 0.25, y - r * 0.25, r * 0.28, r * 0.28, '#ffffff');
    }
    c.shine(B([[260, 330], [330, 260]]), 8);
    c.star(...B([[590, 480]])[0], 48, 6);
    // frills of crepe paper under the rim
    shape(spikes(B([[260, 600], [400, 640], [540, 645], [700, 610]]), 6, -44).concat(B([[700, 590], [260, 580]])), PINK, { angle: 90, over: 0.2 }, {}, false);
    // two longer curtains of ruffled crepe paper hanging from its middle
    for (const [x0, col] of [[400, PINK], [520, LILAC]] as const) {
      const down = D([[x0, 600], [x0 - 30, 730], [x0 - 10, 860], [x0 - 40, 1000]]);
      const up = D([[x0 + 30, 1010], [x0 + 60, 860], [x0 + 40, 730], [x0 + 70, 600]]);
      shape(spikes(down, 5, 28).concat(spikes(up, 5, 28)), col, { angle: 90, over: 0.3 }, {}, false);
    }
    // a sterner face, turned to the left: narrower eyes under heavy brows, a jagged frown
    const [e1, e2, m] = [B([[300, 444]])[0], B([[410, 436]])[0], B([[355, 515]])[0]];
    paper([[e1[0] - 30, e1[1] - 12], [e1[0] + 26, e1[1] - 2], [e1[0] + 22, e1[1] + 20], [e1[0] - 22, e1[1] + 18]]);
    paper([[e2[0] - 40, e2[1] - 2], [e2[0] + 38, e2[1] - 20], [e2[0] + 36, e2[1] + 24], [e2[0] - 32, e2[1] + 26]]);
    dot(e1[0] - 2, e1[1] + 6, 11, 12);
    dot(e2[0] - 4, e2[1] + 5, 15, 17);
    dot(e1[0] - 6, e1[1] - 1, 4, 4, '#ffffff');
    dot(e2[0] - 9, e2[1] - 3, 5, 5, '#ffffff');
    stroke([[e1[0] - 42, e1[1] - 32], [e1[0] + 34, e1[1] - 8]], { w: 12 });
    stroke([[e2[0] - 44, e2[1] - 8], [e2[0] + 52, e2[1] - 36]], { w: 12 });
    stroke([[m[0] - 46, m[1] + 14], [m[0] - 10, m[1] - 8], [m[0] + 48, m[1] + 4]], { w: 7 });
    // long tentacles in front, longer and thicker: in battle they sway
    c.part('tentacules', { pivot: [450, 620 + DY], motion: 'swing', amp: 6, period: 2.6 }, () => {
      tentacle(250, 600, 470, 34, 52, LILAC);
      tentacle(350, 640, 430, -38, 52, TEAL);
      tentacle(610, 640, 420, 34, 52, DEEP);
      tentacle(710, 600, 460, -32, 50, VIOLET);
    });
  },
} satisfies Fair;
