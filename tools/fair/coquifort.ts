import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Coquifort's fair copy, Ice/Rock, the same drawing grown up: more spikes round its shell, longer and cut
 * like crystals with frosted tips, rough rock shards growing between them, its horn of ice
 * bigger with two small ones beside it, a sterner face under heavy brows, and the gold star on its shell. It faces
 * left, like its drawing.
 */
export default {
  id: '059', slug: 'coquifort', seed: 59059, size: [1180, 1180], tilt: 0,
  draw(c) {
    // its own drawing's coordinates, moved to the middle of a bigger sheet for the longer spikes
    const D: P = [90, 90];
    const m = (pts: P[]) => pts.map(([x, y]) => [x + D[0], y + D[1]] as P);
    const shape: typeof c.shape = (pts, ...r) => c.shape(m(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(m(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(m(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(m(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(m(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + D[0], y + D[1], ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: m([def.pivot])[0] }, draw);
    const { potato } = c;
    const SHELL = '#7b8fb8', DEEP = '#4b5674', INSIDE = '#2e2a3a', FACE = '#d9d4ec', ICE = '#bfe8f4', STONE = '#a89880', CRACK = '#6e604e';
    const at = (a: number, r: number): P => [520 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.95];
    // more spikes all round the shell, longer, cut like crystals, rough rock shards growing between them
    part('piques', { pivot: [520, 520], motion: 'swing', amp: 5, period: 4, behind: true }, () => {
      const N = 9;
      for (let i = 0; i < N; i++) {
        const a = ((i + 0.5) / N) * Math.PI * 2 + 0.1, h = Math.PI / N;
        shape([at(a - h * 0.55, 320), at(a - h * 0.3, 410), at(a - h * 0.05, 470), at(a + h * 0.22, 400), at(a + h * 0.3, 425), at(a + h * 0.55, 320)], STONE, { angle: (a * 180) / Math.PI, over: 0 }, { w: 5 }, false);
        tint([at(a - h * 0.05, 462), at(a + h * 0.2, 402), at(a + h * 0.45, 330), at(a + h * 0.05, 330)], CRACK, { wash: 0.45 });
      }
      const ring: P[] = [];
      for (let i = 0; i < N * 2; i++) ring.push(at((i / (N * 2)) * Math.PI * 2 + 0.1, i % 2 ? 330 : 560));
      shape(ring, SHELL, { angle: 60, over: 0.5, press: 1.05 }, {}, false);
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + 0.1;
        stroke([at(a + 0.06, 345), at(a, 550)], { w: 4, col: DEEP });
        tint([at(a, 560), at(a - 0.07, 470), at(a + 0.07, 470)], ICE, { wash: 0.8 });
        shine([at(a - 0.08, 390), at(a - 0.04, 470)], 6);
      }
    });
    // the big round shell and the star
    shape(potato(520, 520, 330, 320, 16, 0.03), SHELL, { angle: 80, over: 0.6, press: 1.1 });
    for (let i = 0; i < 7; i++) stroke([[520, 520], [520 + Math.cos(i * 0.9 + 0.3) * 310, 520 + Math.sin(i * 0.9 + 0.3) * 300]], { w: 4, col: DEEP });
    c.star(740 + D[0], 690 + D[1], 50, 10);
    shine([[690, 250], [770, 300]], 9);
    // the dark opening, shifted left
    shape(potato(400, 520, 200, 180, 14, 0.05), INSIDE, { angle: 0, over: 0, press: 1.2 });
    // the stern face inside, its horn of ice bigger, two small ones beside it
    shape(potato(390, 540, 120, 110, 12, 0.05), FACE, { angle: 80, over: 0.3 });
    shape([[338, 460], [318, 385], [372, 448]], ICE, { over: 0, press: 1.1 }, { w: 5 }, false);
    shape([[438, 448], [490, 380], [462, 462]], ICE, { over: 0, press: 1.1 }, { w: 5 }, false);
    shape([[380, 445], [418, 285], [450, 448]], ICE, { over: 0, press: 1.1 }, {}, false);
    shine([[410, 330], [404, 400]], 6);
    paper([[322, 532], [346, 516], [368, 530], [344, 544]], { w: 4.5 }, false);
    paper([[404, 528], [432, 510], [460, 524], [432, 542]], { w: 4.5 }, false);
    dot(345, 531, 8, 10);
    dot(432, 527, 10, 12);
    stroke([[312, 496], [368, 516]], { w: 10 });
    stroke([[400, 512], [470, 490]], { w: 11 });
    stroke([[338, 604], [390, 592], [442, 604]], { w: 6 });
  },
} satisfies Fair;
