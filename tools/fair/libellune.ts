import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Libellune's fair copy, Bug/Dragon, the same drawing grown up (like its twin Noctaile: much bigger wings
 * and a third pair sprouting low, longer antennae, a bolder look, the star on its body): six stained-glass wings
 * instead of four, 1.4 times as long, their panes cut into crystal facets with glints; a row of little dragon
 * spines down its ringed tail and a crystal fin at its tip; its big gentle eyes under determined brows, a confident
 * smile. Drawn lower and to the right on a bigger sheet, so the wings have room.
 */
export default {
  id: '071', slug: 'libellune', seed: 7171, size: [1340, 1240], tilt: 0,
  draw(c) {
    const { band, potato } = c;
    // the pencil drawing's coordinates, moved on the bigger sheet
    const DX = 60, DY = 100;
    const mv = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape: typeof c.shape = (pts, ...r) => c.shape(mv(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(mv(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(mv(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(mv(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(mv(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + DX, y + DY, ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1] + DY] }, draw);

    const BODY = '#5cc6c0', DEEP = '#2f8f8c', PANES = ['#f6a7c8', '#bfe2fa', '#f7e37a', '#c9ec9a', '#d9ccf5'], LEAD = '#3f3b46';
    // a wing of stained glass: a long leaf shape cut into crystal facets
    const wing = (root: P, tip: P, width: number, seed: number, front: boolean) => {
      const dx = tip[0] - root[0], dy = tip[1] - root[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      const at = (t: number, side: number): P => [root[0] + dx * t + nx * side * width * Math.sin(Math.PI * Math.min(1, t * 1.1)), root[1] + dy * t + ny * side * width * Math.sin(Math.PI * Math.min(1, t * 1.1))];
      const outline: P[] = [];
      for (let k = 0; k <= 10; k++) outline.push(at(k / 10, 1));
      for (let k = 10; k >= 0; k--) outline.push(at(k / 10, -1));
      shape(outline, PANES[seed % PANES.length], { angle: 40 + seed * 20, over: 0.35, press: front ? 1.3 : 1.1 }, { w: front ? 6 : 5 });
      // the facets: panes tinted in other colours, a lattice of lead lines, glints of light
      for (const [t, k] of [[0.24, 1], [0.48, 2], [0.72, 3]] as P[]) {
        const [x, y] = at(t, 0);
        tint(potato(x, y, width * 0.36, width * 0.36, 8, 0.1), PANES[(seed + k) % PANES.length], { gap: 3.4, spill: 0 });
      }
      stroke([at(0.04, 0), at(0.95, 0)], { w: 4.5, col: LEAD });
      for (const t of [0.1, 0.34, 0.58]) {
        stroke([at(t, 1), at(t + 0.26, -1)], { w: 4, col: LEAD });
        stroke([at(t, -1), at(t + 0.26, 1)], { w: 4, col: LEAD });
      }
      for (const t of [0.26, 0.5]) shine([at(t, 0.55), at(t + 0.08, 0.35)], 6);
    };
    // the far wings, three now, behind on the left
    const buzz = { motion: 'flap', amp: 9, period: 0.22, behind: true } as const;
    part('ailes-loin', { pivot: [470, 450], ...buzz }, () => {
      wing([470, 425], [64, 16], 92, 0, false);
      wing([470, 470], [22, 408], 80, 2, false);
      wing([480, 505], [170, 740], 66, 4, false);
    });
    // the slender ringed tail, a little thicker, dragon spines along it and a crystal fin at its tip
    const tail: P[] = [[520, 470], [640, 560], [760, 650], [860, 760], [900, 860], [860, 930]];
    for (let i = 1; i < tail.length - 1; i++) {
      const [a, b] = [tail[i - 1], tail[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
      const [x, y] = tail[i], w = (78 + ((34 - 78) * i) / (tail.length - 1)) / 2 + 64;
      shape([[x - (dx / l) * 28, y - (dy / l) * 28], [x + (dy / l) * w + (dx / l) * 16, y - (dx / l) * w + (dy / l) * 16], [x + (dx / l) * 26, y + (dy / l) * 26]], DEEP, { over: 0 }, { w: 4.5 }, false);
    }
    shape([[872, 905], [765, 955], [770, 1065], [855, 995], [912, 935]], PANES[4], { angle: 50, over: 0.2, press: 1.2 }, { w: 5 }, false);
    stroke([[868, 925], [775, 1050]], { w: 4, col: LEAD });
    shine([[790, 975], [800, 1015]], 6);
    shape(band(tail, 78, 34), BODY, { angle: 30, over: 0.4 });
    for (let i = 1; i < tail.length - 1; i++) stroke([[tail[i][0] - 32, tail[i][1] + 24], [tail[i][0] + 28, tail[i][1] - 28]], { w: 4.5, col: DEEP });
    // the near wings, three now, bigger, spread up and to the right
    part('ailes', { pivot: [565, 445], ...buzz, phase: 0.5 }, () => {
      wing([590, 495], [1010, 650], 72, 0, true);
      wing([570, 470], [1188, 354], 108, 3, true);
      wing([560, 420], [1034, -52], 126, 1, true);
    });
    // the thorax with the star, and the head looking left
    shape(potato(520, 452, 84, 78, 10, 0.05), BODY, { angle: 70, over: 0.4 });
    c.star(530 + DX, 455 + DY, 42, 10);
    shape(potato(390, 420, 108, 98, 12, 0.04), BODY, { angle: 80, over: 0.4 });
    // big gentle eyes under determined brows, the far one smaller, a confident smile
    paper(potato(325, 398, 34, 40, 9, 0.04));
    paper(potato(420, 388, 48, 52, 9, 0.04));
    shape(potato(322, 406, 22, 28, 9, 0.04), '#8a6cd0', { angle: 90, over: 0, press: 1.1 }, { w: 3.5 });
    shape(potato(414, 398, 30, 36, 9, 0.04), '#8a6cd0', { angle: 90, over: 0, press: 1.1 }, { w: 3.5 });
    dot(316, 395, 7, 10, '#ffffff');
    dot(406, 385, 10, 13, '#ffffff');
    stroke([[288, 352], [352, 368]], { w: 10 });
    stroke([[384, 352], [470, 330]], { w: 11 });
    stroke([[300, 468], [342, 490], [388, 474]], { w: 5.5 });
    // longer antennae, curling back
    stroke([[360, 330], [325, 245], [280, 195], [235, 195]], { w: 6 });
    stroke([[410, 330], [425, 235], [470, 180], [520, 185]], { w: 6 });
  },
} satisfies Fair;
