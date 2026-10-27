import type { P, Redraw } from './crayon.ts';

/**
 * The bad dream: a big shadow moth hovering three-quarters to the left. Dark wings with pink spiral eye-spots,
 * a grey fluffy collar, feathery antennae, glowing pink eyes, wisps of nightmare drifting off.
 */
export default {
  id: '072', slug: 'noctaile', seed: 7201, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato, spikes } = c;
    const WING = '#3a3160', DEEP = '#241e40', PINK = '#ee5fb0', FUR = '#b9b2c8', BODY = '#4a3f6e';
    // a big rounded moth wing with a scalloped edge
    const wing = (pts: P[], spot: P, r: number, front: boolean) => {
      shape(pts, WING, { angle: 60, over: 0.6, press: front ? 1.15 : 1 }, { w: front ? 5 : 4 });
      // the spiral eye-spot
      shape(potato(spot[0], spot[1], r, r, 10, 0.04), PINK, { angle: 90, over: 0, press: 1.1 }, { w: 3.5 });
      const sp: P[] = [];
      for (let k = 0; k < 22; k++) { const a = k * 0.55, rad = (k / 22) * r * 0.8; sp.push([spot[0] + Math.cos(a) * rad, spot[1] + Math.sin(a) * rad]); }
      stroke(sp, { w: 3.5, col: DEEP });
    };
    // wisps of nightmare drifting off behind
    for (const [x, y] of [[960, 200], [1040, 520], [140, 860], [880, 900]] as const) {
      stroke([[x, y], [x + 30, y - 40], [x + 5, y - 70], [x + 40, y - 110]], { w: 5, col: '#8a6cd0' });
    }
    // the far wings, smaller, behind on the left
    const beat = { motion: 'fold', amp: 45, period: 0.9, behind: true, phase: 0 } as const;
    c.part('ailes-loin', { pivot: [470, 450], ...beat }, () => {
      wing([[470, 400], [330, 210], [180, 160], [110, 260], [170, 380], [330, 450]], [230, 270], 38, false);
      wing([[470, 470], [300, 520], [200, 640], [260, 720], [380, 650], [470, 540]], [300, 600], 30, false);
    });
    // the plump furry body and its tail
    shape(potato(560, 560, 110, 190, 12, 0.06), BODY, { angle: 80, over: 0.5 });
    for (const y of [560, 630, 700]) stroke([[470, y], [650, y + 10]], { w: 4, col: DEEP });
    // the near wings, big, spread up and to the right, scalloped
    c.part('ailes', { pivot: [610, 470], ...beat }, () => {
      wing(([[590, 400], [700, 180]] as P[]).concat(spikes([[700, 180], [880, 110], [1020, 200], [1050, 380]], 3, 22), [[900, 470], [640, 470]]), [880, 280], 62, true);
      wing(([[620, 500], [860, 520]] as P[]).concat(spikes([[860, 520], [1000, 620], [960, 780]], 2, 20), [[800, 800], [640, 640]]), [840, 640], 46, true);
    });
    // the grey fluffy collar
    shape(spikes([[400, 470], [480, 540], [600, 540], [660, 470]], 3, 30).concat([[560, 420], [450, 420]]), FUR, { angle: 80, over: 0 }, {}, false);
    // feathery antennae: two curved fronds of grey fur
    for (const [x0, y0, x1, y1, bend] of [[405, 305, 270, 130, -60], [470, 298, 500, 110, 50]] as const) {
      const pts: P[] = [], back: P[] = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8, w = 26 * Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.05));
        const x = x0 + (x1 - x0) * t + bend * Math.sin(Math.PI * t) * 0.6, y = y0 + (y1 - y0) * t;
        pts.push([x - w, y]);
        back.unshift([x + w, y]);
      }
      shape([...pts, ...back], FUR, { angle: 80, over: 0 }, { w: 3.5 });
      stroke([[x0, y0], [x0 + (x1 - x0) * 0.5 + bend * 0.6, y0 + (y1 - y0) * 0.5], [x1, y1]], { w: 3, col: DEEP });
    }
    // the head, looking left (in front of the antennae' roots), glowing pink eyes under a frown
    shape(potato(450, 380, 115, 95, 12, 0.04), BODY, { angle: 80, over: 0.5 });
    shape(potato(380, 375, 28, 22, 8, 0.05), PINK, { over: 0, press: 1.3 }, { w: 3 });
    shape(potato(480, 368, 38, 28, 8, 0.05), PINK, { over: 0, press: 1.3 }, { w: 3 });
    dot(376, 377, 8, 10, '#ffffff');
    dot(474, 370, 10, 12, '#ffffff');
    stroke([[350, 340], [405, 356]], { w: 5.5 });
    stroke([[445, 344], [520, 330]], { w: 6 });
    stroke([[365, 432], [410, 424], [455, 434]], { w: 4.5 });
  },
} satisfies Redraw;
