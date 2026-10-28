import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Noctaile's fair copy, Dark/Ghost, the same drawing grown up (like its twin Libellune: much bigger wings
 * and a third pair sprouting low, longer antennae, a bolder look, the star on its body): its four dark wings a third
 * bigger and tattered, a second spiral eye-spot on the big one; a third pair of wings below, with their own
 * eye-spots, smoke rising off their tips (in place of the wisps drifting round it); its grey collar grown into a
 * big fluffy mane; feathery antennae half as long again; glowing eyes under heavier brows and two small fangs.
 * Drawn lower and to the right on a bigger sheet, so the wings have room.
 */
export default {
  id: '072', slug: 'noctaile', seed: 7272, size: [1350, 1250], tilt: 0,
  draw(c) {
    const { band, potato, spikes } = c;
    // the pencil drawing's coordinates, moved on the bigger sheet
    const DX = 70, DY = 70;
    const mv = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape: typeof c.shape = (pts, ...r) => c.shape(mv(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(mv(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(mv(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(mv(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + DX, y + DY, ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1] + DY] }, draw);

    const WING = '#3a3160', DEEP = '#241e40', PINK = '#ee5fb0', FUR = '#b9b2c8', BODY = '#4a3f6e', SMOKE = '#8a6cd0';
    /** Scales a shape around a point (its wings grow from where they join). */
    const big = (pts: P[], o: P, k = 1.3): P[] => pts.map(([x, y]) => [o[0] + (x - o[0]) * k, o[1] + (y - o[1]) * k]);
    /** A spiral eye-spot. */
    const eyespot = (x: number, y: number, r: number) => {
      shape(potato(x, y, r, r, 10, 0.04), PINK, { angle: 90, over: 0, press: 1.1 }, { w: 4.5 });
      const sp: P[] = [];
      for (let k = 0; k < 22; k++) { const a = k * 0.55, rad = (k / 22) * r * 0.8; sp.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); }
      stroke(sp, { w: 4.5, col: DEEP });
    };
    // a big tattered moth wing and its eye-spots
    const wing = (pts: P[], spots: [number, number, number][], front: boolean) => {
      shape(pts, WING, { angle: 60, over: 0.6, press: front ? 1.15 : 1 }, { w: front ? 6.5 : 5.5 });
      for (const [x, y, r] of spots) eyespot(x, y, r);
    };
    /** A hind wing: a long rounded lobe from its root, its outer end tattered, its eye-spot, smoke rising off its tip. */
    const hindwing = (root: P, tip: P, width: number) => {
      const dx = tip[0] - root[0], dy = tip[1] - root[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      const cx = root[0] + dx * 0.5, cy = root[1] + dy * 0.5, s = ux > 0 ? 1 : -1;
      const lobe: P[] = [];
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2, out = Math.cos(a) > 0.3 ? (k % 2 ? 0.86 : 1.08) : 1;
        const u = Math.cos(a) * len * 0.5 * out, v = Math.sin(a) * width * out * (Math.cos(a) < 0 ? 0.7 : 1);
        lobe.push([cx + ux * u - uy * v, cy + uy * u + ux * v]);
      }
      const smoke: P[] = [[tip[0] - ux * 30, tip[1] - uy * 30], [tip[0] + s * 70, tip[1] - 5], [tip[0] + s * 100, tip[1] - 70], [tip[0] + s * 70, tip[1] - 135], [tip[0] + s * 110, tip[1] - 190]];
      tint(band(smoke, 70, 22), SMOKE, { gap: 4, wash: 0.35 });
      stroke(smoke, { w: 7, col: SMOKE });
      shape(lobe, WING, { angle: 70, over: 0.5, press: 1.05 }, { w: 5.5 });
      eyespot(cx + ux * len * 0.15, cy + uy * len * 0.15, width * 0.45);
    };
    // the far wings, a third bigger and tattered, a hind wing below, behind on the left
    const beat = { motion: 'fold', amp: 45, period: 0.9, behind: true, phase: 0 } as const;
    part('ailes-loin', { pivot: [470, 450], ...beat }, () => {
      hindwing([490, 660], [320, 1010], 82);
      const o: P = [470, 450];
      wing(big(([[470, 400], [330, 210]] as P[]).concat(spikes([[330, 210], [180, 160], [110, 260], [170, 380]], 3, 30), [[330, 450]]), o), [[158, 216, 50]], false);
      wing(big(([[470, 470], [300, 520]] as P[]).concat(spikes([[300, 520], [200, 640], [260, 720]], 2, 28), [[380, 650], [470, 540]]), o), [[249, 645, 38]], false);
    });
    part('ailes', { pivot: [610, 470], ...beat }, () => hindwing([630, 690], [800, 1060], 88));
    // the plump furry body, a little bigger, its stripes and the star
    shape(potato(560, 570, 118, 205, 12, 0.06), BODY, { angle: 80, over: 0.5 });
    for (const y of [650, 715]) stroke([[470, y], [650, y + 10]], { w: 4.5, col: DEEP });
    c.star(560 + DX, 712 + DY, 44, -8);
    // the near wings, a third bigger and tattered, two eye-spots on the big one (its hind wing is under the body)
    part('ailes', { pivot: [610, 470], ...beat }, () => {
      const o: P = [610, 470];
      wing(big(([[590, 400], [700, 180]] as P[]).concat(spikes([[700, 180], [880, 110], [1020, 200], [1050, 380]], 4, 30), [[900, 470], [640, 470]]), o), [[961, 223, 78], [800, 345, 40]], true);
      wing(big(([[620, 500], [860, 520]] as P[]).concat(spikes([[860, 520], [1000, 620], [960, 780]], 3, 28), [[800, 800], [640, 640]]), o), [[890, 690, 58]], true);
    });
    // the grey collar grown into a big fluffy mane round its neck
    const mane: P[] = [];
    for (let k = 0; k <= 20; k++) {
      const a = Math.PI * (0.92 - (k / 20) * 1.3), r = k % 2 ? 185 : 225 + c.rnd() * 30;
      mane.push([500 + Math.cos(a) * r * 1.05, 450 + Math.sin(a) * r * 0.8]);
    }
    shape([...mane, [470, 300]], FUR, { angle: 80, over: 0.2 }, {}, false);
    for (const [x, y] of [[420, 560], [520, 590], [610, 545]] as P[]) stroke([[x - 20, y - 14], [x, y + 12], [x + 20, y - 14]], { w: 4, col: '#7d7590' });
    // feathery antennae half as long again: two curved fronds of grey fur
    for (const [x0, y0, x1, y1, bend] of [[405, 305, 190, 20, -80], [470, 298, 545, -10, 64]] as const) {
      const pts: P[] = [], back: P[] = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8, w = 38 * Math.sin(Math.PI * Math.min(1, t * 1.05 + 0.05));
        const x = x0 + (x1 - x0) * t + bend * Math.sin(Math.PI * t) * 0.6, y = y0 + (y1 - y0) * t;
        pts.push([x - w, y]);
        back.unshift([x + w, y]);
      }
      shape([...pts, ...back], FUR, { angle: 80, over: 0 }, { w: 4.5 });
      stroke([[x0, y0], [x0 + (x1 - x0) * 0.5 + bend * 0.6, y0 + (y1 - y0) * 0.5], [x1, y1]], { w: 4, col: DEEP });
    }
    // the head, looking left, glowing pink eyes under heavy brows, a frown with two small fangs
    shape(potato(450, 380, 118, 98, 12, 0.04), BODY, { angle: 80, over: 0.5 });
    shape([[350, 362], [410, 372], [404, 394], [356, 392]], PINK, { over: 0, press: 1.3 }, { w: 4 });
    shape([[446, 360], [520, 346], [518, 382], [452, 390]], PINK, { over: 0, press: 1.3 }, { w: 4 });
    dot(378, 380, 7, 8, '#ffffff');
    dot(482, 370, 9, 10, '#ffffff');
    stroke([[338, 336], [412, 362]], { w: 12 });
    stroke([[440, 352], [530, 326]], { w: 13 });
    stroke([[365, 436], [412, 426], [460, 436]], { w: 5.5 });
    paper([[384, 432], [392, 458], [402, 430]], { w: 4 }, false);
    paper([[428, 430], [438, 456], [446, 432]], { w: 4 }, false);
  },
} satisfies Fair;
