import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Glissonde's fair copy, Water/Flying, the same drawing grown up: the ridge of the grey shell on its
 * back grown into a tall blue sail swept back like a wing, on dark spines, its edge scalloped; a longer neck;
 * bigger flippers edged like wings; a forked tail fin; a taller horn and a bigger fin on its head; a bolder stare
 * under heavier brows; and the gold star on its side. It faces left, like its drawing.
 */
export default {
  id: '060', slug: 'glissonde', seed: 60060, size: [1180, 1130], tilt: 0,
  draw(c) {
    // its own drawing's coordinates, moved down to make room for the longer neck and the sail
    const D: P = [10, 150];
    const m = (pts: P[]) => pts.map(([x, y]) => [x + D[0], y + D[1]] as P);
    const shape: typeof c.shape = (pts, ...r) => c.shape(m(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(m(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(m(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(m(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(m(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + D[0], y + D[1], ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: m([def.pivot])[0] }, draw);
    const { band, potato } = c;
    const BLUE = '#4c8be0', CREAM = '#f3e6c6', SHELL = '#9aa3b4', DEEP = '#6a7386', SAIL = '#5fa0ea', SKY = '#9cc8f4', SPINE = '#22468e';
    /** A flipper from the front of its root out to its tip, back along its edge (scalloped like a wing's feathers) to the back of its root. */
    const flipper = (front: P, tip: P, back: P[]) => {
      const pts = [tip, ...back], edge: P[] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        edge.push(a, [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.22, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.22]);
      }
      shape([front, ...edge, back[back.length - 1]], BLUE, { angle: 80 });
      tint([front, tip, back[0], back[1]], SKY, { wash: 0.45 });
      const root = back[back.length - 1], mid: P = [(front[0] + root[0]) / 2, (front[1] + root[1]) / 2];
      for (const q of back.slice(0, -2)) stroke([mid, [q[0] + (mid[0] - q[0]) * 0.15, q[1] + (mid[1] - q[1]) * 0.15]], { w: 4, col: '#2f5fa8' });
    };
    // the shell's ridge grown into a tall sail swept back like a wing: dark spines rising from the ridge, the
    // blue skin between them scalloped at the top (behind the shell, so it springs from its ridge)
    part('voile', { pivot: [770, 330], motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      const roots: P[] = [[628, 352], [690, 326], [760, 312], [830, 326], [895, 362], [935, 420]];
      const tips: P[] = [[690, 25], [795, -55], [910, -65], [1012, -10], [1090, 95], [1118, 228]];
      const skin: P[] = [roots[0], tips[0]];
      for (let i = 1; i < tips.length; i++) {
        const a = tips[i - 1], b = tips[i], mid: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], root: P = [(roots[i - 1][0] + roots[i][0]) / 2, (roots[i - 1][1] + roots[i][1]) / 2];
        skin.push([mid[0] + (root[0] - mid[0]) * 0.16, mid[1] + (root[1] - mid[1]) * 0.16], b);
      }
      skin.push(roots[roots.length - 1]);
      shape(skin, SAIL, { angle: 60, press: 1.15 }, {}, false);
      tint([[660, 330], [680, 120], [730, 50], [790, 20], [760, 200], [710, 330]], SKY, { wash: 0.5 });
      for (let i = 0; i < tips.length; i++) {
        const [r, t] = [roots[i], tips[i]];
        stroke([r, [r[0] + (t[0] - r[0]) * 1.02, r[1] + (t[1] - r[1]) * 1.02]], { w: 10, col: SPINE });
      }
    });
    // the far flipper, behind, bigger
    flipper([420, 630], [205, 770], [[280, 795], [360, 775], [450, 712]]);
    // the body and its cream belly, the star on its side
    shape([[380, 500], [560, 440], [800, 450], [960, 540], [980, 680], [880, 780], [620, 800], [420, 760], [350, 640]], BLUE, { angle: 15, over: 0.55 });
    tint([[420, 700], [700, 740], [880, 720], [860, 780], [600, 795], [430, 760]], CREAM, { gap: 3.4 });
    // the grey shell on its back, with its knobs
    shape([[520, 470], [620, 330], [780, 300], [920, 380], [950, 520], [800, 560], [620, 560]], SHELL, { angle: 70, over: 0.5 });
    for (const [x, y] of [[640, 390], [740, 350], [840, 385], [900, 465], [700, 455], [800, 475]] as const) shape(potato(x, y, 30, 26, 8, 0.1), DEEP, { over: 0 }, { w: 3.5 });
    shine([[600, 400], [650, 350]], 7);
    c.star(860 + D[0], 640 + D[1], 46, 8);
    // the near flipper, bigger, edged like a wing, and the tail, forked
    part('nageoire', { pivot: [640, 750], motion: 'swing', amp: 10, period: 1.6 }, () => {
      flipper([600, 735], [520, 945], [[595, 955], [660, 925], [712, 862], [705, 760]]);
    });
    shape([[955, 630], [1100, 560], [1070, 640], [1125, 715], [960, 690]], BLUE, { angle: 20 }, {}, false);
    tint([[975, 640], [1080, 585], [1060, 645]], SKY, { wash: 0.5 });
    part('cou', { pivot: [460, 560], motion: 'swing', amp: 4, period: 3.2 }, () => {
      // the long neck, longer, curving up, and its head looking left
      shape(band([[460, 560], [398, 420], [360, 285], [352, 175]], 112, 88), BLUE, { angle: 80 });
      tint(band([[440, 585], [388, 440], [350, 305], [340, 215]], 50, 40), CREAM, { gap: 3.4 });
      shape([[230, 150], [290, 80], [410, 60], [480, 120], [470, 200], [390, 240], [280, 230], [220, 200]], BLUE, { angle: 80, over: 0.5 });
      // a taller horn, a bigger fin
      shape([[380, 75], [418, -40], [452, 72]], SHELL, { over: 0 }, { w: 5 }, false);
      shine([[412, 0], [404, 50]], 5);
      shape([[458, 105], [560, 50], [545, 100], [575, 130], [500, 160]], BLUE, { over: 0, angle: 30 }, {}, false);
      tint([[470, 112], [545, 70], [535, 110]], SKY, { wash: 0.5 });
      // a bolder stare under heavier brows
      paper(potato(295, 142, 18, 20, 8, 0.05));
      paper(potato(375, 136, 26, 25, 8, 0.05));
      dot(292, 146, 8, 11);
      dot(371, 141, 11, 13);
      stroke([[268, 112], [318, 126]], { w: 9 });
      stroke([[350, 118], [412, 100]], { w: 10 });
      stroke([[240, 190], [290, 205], [340, 194]], { w: 5 });
      shine([[300, 85], [350, 72]], 6);
    });
  },
} satisfies Fair;
