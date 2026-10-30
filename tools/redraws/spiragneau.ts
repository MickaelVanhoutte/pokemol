import type { P, Redraw } from './crayon.ts';

/**
 * A little lamb turned to the left: a cloud of lilac wool curled in spirals, thin dark legs and hooves, a soft
 * pink-cream face with big shiny eyes, floppy ears, a tuft of wool on its brow, and two little spiral horn buds
 * (the hypnotist's spiral) coming through.
 */
export default {
  id: '118', slug: 'spiragneau', seed: 11809, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const WOOL = '#dcc6f2', CURL = '#b496d8', FACE = '#f7e3ea', EAR = '#f2b3cf', LEG = '#5a4a6a', HORN = '#c27ad6', HORN2 = '#e7b3f0', CHEEK = '#f29ab0';
    const cloud = (cx: number, cy: number, rx: number, ry: number, n: number, bump: number): P[] =>
      Array.from({ length: n * 2 }, (_, i) => {
        const a = (i / (n * 2)) * Math.PI * 2, k = i % 2 ? 1 : 1 + bump;
        return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
      });
    const curl = (x: number, y: number, r: number) => {
      const pts: P[] = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2.4, rr = r * (1 - i / 14);
        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
      });
      stroke(pts, { w: 3.5, col: CURL });
    };
    const spiral = (cx: number, cy: number, r0: number, turns: number, a0: number): P[] =>
      Array.from({ length: 18 }, (_, i) => {
        const t = i / 17, a = a0 + t * turns * Math.PI * 2, r = r0 * (1 - 0.8 * t);
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      });
    // the far legs, behind
    shape(band([[520, 740], [530, 830], [535, 880]], 34, 30), LEG, { angle: 90, over: 0 });
    shape(band([[740, 740], [760, 830], [765, 875]], 34, 30), LEG, { angle: 90, over: 0 });
    // a little woolly tail
    c.part('queue', { pivot: [790, 590], motion: 'swing', amp: 14, period: 1.1, behind: true }, () => {
      shape(cloud(820, 575, 45, 38, 5, 0.18), WOOL, { over: 0 });
    });
    // the cloud of wool, curled in spirals
    shape(cloud(600, 630, 230, 160, 9, 0.12), WOOL, { angle: 30, over: 0.35 });
    for (const [x, y, r] of [[520, 560, 22], [620, 540, 20], [710, 590, 22], [560, 660, 20], [680, 690, 18], [760, 660, 16]] as const) curl(x, y, r);
    // the near legs, thin, dark hooves
    shape(band([[470, 760], [460, 850], [455, 905]], 38, 34), LEG, { angle: 90, over: 0 });
    shape(potato(452, 915, 26, 14, 7, 0.05), '#3a3050', { over: 0 });
    shape(band([[700, 770], [705, 860], [705, 905]], 38, 34), LEG, { angle: 90, over: 0 });
    shape(potato(703, 915, 26, 14, 7, 0.05), '#3a3050', { over: 0 });
    // the far ear, behind the head
    shape([[440, 400], [520, 380], [565, 420], [520, 450]], EAR, { angle: 20, over: 0 });
    // the soft face, its muzzle to the left
    const face: P[] = [[220, 520], [240, 440], [300, 385], [390, 375], [460, 420], [480, 510], [450, 590], [370, 630], [280, 625], [230, 580]];
    shape(face, FACE, { angle: 30, over: 0.3 });
    // big shiny eyes (the far one smaller), cheeks, a little nose and a "w" mouth
    for (const [x, y, rx, ry] of [[285, 485, 24, 30], [385, 478, 34, 40]] as const) {
      shape(potato(x, y, rx, ry, 10, 0.03), '#3a3050', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - rx * 0.3, y - ry * 0.35, rx * 0.34, ry * 0.28, '#ffffff');
      dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
    }
    shape(potato(255, 565, 18, 12, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(430, 560, 26, 15, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(262, 540, 14, 10, 7, 0.05), '#c45a78', { over: 0 }, { w: 2.5 });
    stroke([[258, 580], [275, 595], [292, 582], [308, 595], [324, 580]], { w: 4 });
    // the tuft of wool on its brow and the two spiral horn buds
    shape(cloud(355, 380, 70, 40, 6, 0.2), WOOL, { angle: 30, over: 0.2 });
    for (const [x, y, r] of [[300, 365, 30], [430, 360, 36]] as const) {
      shape(potato(x, y, r, r, 10, 0.05), HORN, { angle: 60, over: 0.3 });
      stroke(spiral(x, y, r * 0.8, 1.6, -Math.PI / 2), { w: 4, col: HORN2 });
    }
    // the near ear, flopped down
    shape([[460, 430], [545, 440], [590, 500], [560, 520], [480, 480]], EAR, { angle: 20, over: 0.2 });
  },
} satisfies Redraw;
