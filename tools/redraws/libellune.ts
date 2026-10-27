import type { P, Redraw } from './crayon.ts';

/**
 * The good dream: a glowing dragonfly of stained glass, hovering three-quarters to the left. Four wings of
 * coloured panes held by dark lead lines, a slender ringed body curling down, big gentle eyes, sparkles.
 */
export default {
  id: '071', slug: 'libellune', seed: 7101, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BODY = '#5cc6c0', DEEP = '#2f8f8c', PANES = ['#f6a7c8', '#bfe2fa', '#f7e37a', '#c9ec9a', '#d9ccf5'], LEAD = '#3f3b46';
    // a wing of stained glass: a long leaf shape cut into panes
    const wing = (root: P, tip: P, width: number, seed: number, front: boolean) => {
      const dx = tip[0] - root[0], dy = tip[1] - root[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      const at = (t: number, side: number): P => [root[0] + dx * t + nx * side * width * Math.sin(Math.PI * Math.min(1, t * 1.1)), root[1] + dy * t + ny * side * width * Math.sin(Math.PI * Math.min(1, t * 1.1))];
      const outline: P[] = [];
      for (let k = 0; k <= 10; k++) outline.push(at(k / 10, 1));
      for (let k = 10; k >= 0; k--) outline.push(at(k / 10, -1));
      shape(outline, PANES[seed % PANES.length], { angle: 40 + seed * 20, over: 0.3, press: front ? 1.15 : 0.95 }, { w: front ? 5 : 4 });
      // the lead lines between the panes
      stroke([at(0.05, 0), at(0.95, 0)], { w: 4, col: LEAD });
      for (const t of [0.3, 0.55, 0.78]) {
        stroke([at(t, 1), at(t + 0.06, 0), at(t, -1)], { w: 3.5, col: LEAD });
      }
      // a few panes tinted in other colours
      for (const [t, side, k] of [[0.18, 0.5, 1], [0.42, -0.5, 2], [0.66, 0.5, 3], [0.88, -0.4, 4]] as const) {
        const [x, y] = at(t, side);
        c.tint(potato(x, y, width * 0.32, width * 0.32, 8, 0.1), PANES[(seed + k) % PANES.length], { gap: 3.4, spill: 0 });
      }
    };
    // the far wings, smaller, behind on the left
    const buzz = { motion: 'flap', amp: 9, period: 0.22, behind: true } as const;
    c.part('ailes-loin', { pivot: [470, 450], ...buzz }, () => {
      wing([470, 430], [180, 140], 70, 0, false);
      wing([470, 470], [150, 420], 60, 2, false);
    });
    // the slender ringed body, curling down and back
    const tail: P[] = [[520, 470], [640, 560], [760, 650], [860, 760], [900, 860], [860, 930]];
    shape(band(tail, 70, 30), BODY, { angle: 30, over: 0.4 });
    for (let i = 1; i < tail.length - 1; i++) stroke([[tail[i][0] - 30, tail[i][1] + 22], [tail[i][0] + 26, tail[i][1] - 26]], { w: 4, col: DEEP });
    // the near wings, big, spread up and to the right
    c.part('ailes', { pivot: [565, 445], ...buzz, phase: 0.5 }, () => {
      wing([560, 420], [900, 90], 95, 1, true);
      wing([570, 470], [1010, 380], 80, 3, true);
    });
    // the thorax and the head, looking left
    shape(potato(520, 450, 80, 75, 10, 0.05), BODY, { angle: 70, over: 0.4 });
    shape(potato(390, 420, 105, 95, 12, 0.04), BODY, { angle: 80, over: 0.4 });
    // big gentle eyes, the far one smaller, a little smile
    c.paper(potato(325, 395, 34, 42, 9, 0.04));
    c.paper(potato(420, 385, 48, 54, 9, 0.04));
    shape(potato(322, 405, 22, 30, 9, 0.04), '#8a6cd0', { angle: 90, over: 0, press: 1.1 }, { w: 3 });
    shape(potato(414, 397, 30, 38, 9, 0.04), '#8a6cd0', { angle: 90, over: 0, press: 1.1 }, { w: 3 });
    dot(316, 392, 7, 10, '#ffffff');
    dot(406, 382, 10, 13, '#ffffff');
    stroke([[300, 470], [340, 488], [380, 476]], { w: 4.5 });
    // little antennae, sparkles of light around it
    stroke([[360, 330], [330, 260], [300, 240]], { w: 4 });
    stroke([[410, 330], [420, 250], [450, 225]], { w: 4 });
    for (const [x, y, r] of [[160, 620, 22], [260, 760, 16], [700, 860, 18], [980, 600, 20], [90, 300, 16]] as const) {
      stroke([[x - r, y], [x + r, y]], { w: 4, col: '#f2c43a' });
      stroke([[x, y - r], [x, y + r]], { w: 4, col: '#f2c43a' });
    }
  },
} satisfies Redraw;
