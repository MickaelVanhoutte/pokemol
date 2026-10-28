import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Quadripoing's fair copy, Fighting, the same drawing grown up: a much bulkier torso, a broad V of a chest
 * with big shoulders its four arms come out of; its own arms, bent the same way as the pencil ones, thicker, with
 * red gloves grown about two thirds bigger; its own head bigger, with its big open shout, fangs and heavier brows;
 * its own belt and buckle bigger; the knot of its own headband with two long tails flowing back behind its head;
 * and the gold star on its chest. It faces left, like its drawing.
 */
export default {
  id: '038', slug: 'quadripoing', seed: 38038, size: [1370, 1100], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato, band } = c;
    const GREY = '#6f80ad', RED = '#e23b3b', DARK = '#3d3a4a', GOLD = '#f2c12e', MOUTH = '#5a2430', LINE = '#3f4a6e';
    // the drawing sits 70 px further right than its pencil one, so the bigger gloves fit
    const X = 70;
    const m = (pts: P[]): P[] => pts.map(([x, y]) => [x + X, y]);
    const pot = (x: number, y: number, rx: number, ry: number, n = 9, mess = 0.04) => potato(x + X, y, rx, ry, n, mess);
    /** One of its arms: a thick bent tube from the shoulder through the elbow, ending in a big round red glove. */
    const arm = (path: P[], w: number, glove: P, r: number) => {
      shape(band(m(path), w, w * 0.84), GREY, { angle: 70 });
      shape(pot(glove[0], glove[1], r * 1.06, r), RED, { angle: 50 });
      c.shine(m([[glove[0] - r * 0.4, glove[1] - r * 0.5], [glove[0] - r * 0.08, glove[1] - r * 0.7]]), 8);
    };
    /** A ribbon tail along `path`, its end cut in a V. */
    const ribbon = (path: P[], w0: number, w1: number) => {
      const out = band(m(path), w0, w1), n = path.length, [ex, ey] = path[n - 1], [px, py] = path[n - 2], l = Math.hypot(ex - px, ey - py);
      out.splice(n, 0, [ex + X - ((ex - px) / l) * w1 * 0.9, ey - ((ey - py) / l) * w1 * 0.9]);
      shape(out, RED, { angle: 30, over: 0 }, {}, false);
    };
    // the two tails of its headband's knot, flowing back behind its head (they flutter in battle)
    c.part('bandeau', { pivot: [712 + X, 296], motion: 'swing', amp: 6, period: 0.9, behind: true }, () => {
      ribbon([[700, 284], [752, 240], [800, 212], [835, 200]], 46, 40);
      ribbon([[704, 308], [765, 296], [815, 298], [845, 315]], 44, 38);
    });
    // the near arms on the right come out of its big shoulder, where the pencil ones are: one jabs, one swings
    c.part('bras-bas', { pivot: [795 + X, 675], motion: 'peek', to: [-10, 0], period: 1.3, behind: true }, () => {
      arm([[760, 678], [960, 722], [1085, 724]], 92, [1135, 726], 135);
    });
    c.part('bras-haut', { pivot: [795 + X, 470], motion: 'swing', amp: 7, period: 1.2, behind: true }, () => {
      arm([[760, 485], [935, 420], [1000, 295]], 92, [1012, 222], 135);
    });
    // the far arms and far leg, behind the body on the left
    arm([[450, 680], [280, 722], [165, 728]], 86, [118, 730], 122);
    arm([[450, 480], [295, 410], [232, 275]], 86, [214, 205], 122);
    shape(m([[368, 815], [552, 815], [557, 985], [362, 990]]), GREY, { angle: 85 });
    shape(pot(455, 1010, 118, 46, 8, 0.05), GREY, { angle: 0 });
    // the torso, much bulkier: big shoulders, a broad V of a chest narrowing to its waist, big muscles
    shape(m([[340, 402], [560, 394], [790, 402], [885, 382], [968, 418], [1002, 500], [968, 592], [880, 680], [832, 790], [700, 880], [490, 880], [368, 790], [312, 680], [222, 592], [185, 500], [215, 418], [292, 384]]), GREY, { angle: 70 });
    stroke(m([[300, 425], [262, 505], [312, 595]]), { w: 6, col: LINE });
    stroke(m([[875, 425], [918, 505], [872, 595]]), { w: 6, col: LINE });
    stroke(m([[352, 510], [455, 600], [565, 565]]), { w: 8 });
    stroke(m([[580, 565], [690, 600], [800, 510]]), { w: 8 });
    stroke(m([[572, 498], [572, 575]]), { w: 5, col: LINE });
    stroke(m([[440, 670], [570, 705], [700, 670]]), { w: 6 });
    stroke(m([[470, 728], [570, 745], [670, 728]]), { w: 5 });
    c.star(735 + X, 520, 46, 6);
    // its own belt, wider, with a bigger gold buckle
    shape(m([[320, 765], [880, 765], [872, 872], [328, 872]]), DARK, { angle: 10, over: 0 });
    shape(m([[440, 730], [630, 730], [630, 908], [440, 908]]), GOLD, { angle: 70, over: 0 }, {}, false);
    shape(m([[474, 764], [596, 764], [596, 874], [474, 874]]), '#fbe58a', { over: 0 }, { w: 4 }, false);
    // the near leg, in front on the right
    shape(m([[640, 815], [832, 815], [837, 985], [635, 990]]), GREY, { angle: 85 });
    shape(pot(738, 1013, 124, 48, 8, 0.05), GREY, { angle: 0 });
    // its head, bigger, and its red headband knotted at the back
    shape(pot(540, 345, 168, 148, 10, 0.04), GREY, { angle: 70 });
    shape(m([[380, 275], [705, 262], [710, 324], [375, 336]]), RED, { angle: 10, over: 0 });
    shape(pot(714, 296, 34, 38, 8, 0.05), RED, { over: 0 }, { w: 5 });
    // heavy brows over its eyes, its big open shout with two fangs
    stroke(m([[402, 352], [482, 388]]), { w: 15 });
    stroke(m([[515, 390], [602, 350]]), { w: 15 });
    dot(450 + X, 405, 10, 13);
    dot(558 + X, 403, 11, 14);
    dot(446 + X, 398, 3.5, 4, '#ffffff');
    dot(554 + X, 396, 4, 5, '#ffffff');
    shape(m([[405, 440], [572, 434], [550, 528], [425, 534]]), MOUTH, { over: 0 }, { w: 6.5 });
    c.tint(pot(488, 510, 54, 20, 8, 0.05), '#e2667a', { over: 0, press: 1.2 });
    c.paper(m([[418, 442], [432, 478], [448, 441]]), { w: 4 }, false);
    c.paper(m([[540, 437], [554, 474], [566, 436]]), { w: 4 }, false);
  },
} satisfies Fair;
