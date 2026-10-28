import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Canarmure's fair copy, Steel/Fighting, the same drawing grown up: its pencil-sword grown into a huge
 * greatsword, half as wide again and nearly twice as long, sharpened to a steel point, a big pointed crossguard;
 * the red point on its helmet grown into a tall plume of three red feathers; its helmet bigger with a visor point
 * and a riveted rim; its breastplate bigger and made of overlapping riveted plates; a bigger far wing and sharper
 * feathers on its wings and tail; heavy brows and its beak open in a battle cry; the gold star on its breastplate.
 * Drawn lower on a taller sheet, so the sword has room.
 */
export default {
  id: '061', slug: 'canarmure', seed: 6161, size: [1100, 1290], tilt: 2,
  draw(c) {
    const { band, potato } = c;
    // the pencil drawing's coordinates, moved on the bigger sheet
    const DX = 40, DY = 270;
    const mv = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape: typeof c.shape = (pts, ...r) => c.shape(mv(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(mv(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(mv(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(mv(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + DX, y + DY, ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1] + DY] }, draw);

    const BROWN = '#a8743e', CREAM = '#f3e3c0', STEEL = '#a9b4c6', DEEP = '#6a7386', ORANGE = '#f28a2a', PENCIL = '#f2c43a';
    const RED = '#e2423a', WOOD = '#f3d6a8', DARK = '#5a2430';
    /** A long pointed feather from its base to its tip, its vein down the middle. */
    const feather = (base: P, tip: P, w: number, col: string, vein: string) => {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const at = (t: number, s: number): P => [base[0] + dx * t + nx * s * w * Math.sin(Math.PI * Math.min(0.95, 0.12 + t * 0.85)), base[1] + dy * t + ny * s * w * Math.sin(Math.PI * Math.min(0.95, 0.12 + t * 0.85))];
      const pts: P[] = [];
      for (let k = 0; k <= 5; k++) pts.push(at(k / 5.4, 1));
      pts.push(tip);
      for (let k = 5; k >= 0; k--) pts.push(at(k / 5.4, -1));
      shape(pts, col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 70, over: 0.3 });
      stroke([base, [base[0] + dx * 0.8, base[1] + dy * 0.8]], { w: 4.5, col: vein });
    };
    // the tall plume of red feathers grown from the point of its helmet, swept back (it sways in battle)
    part('plumet', { pivot: [455, 215], motion: 'swing', amp: 5, period: 2.2, behind: true }, () => {
      feather([478, 225], [660, 60], 42, RED, '#a82a24');
      feather([458, 220], [565, -30], 46, RED, '#a82a24');
      feather([440, 222], [420, -10], 42, RED, '#a82a24');
    });
    // the far wing, bigger, its feathers sharp (it flaps in battle); orange feet with sharp toes
    part('aile-loin', { pivot: [390, 560], motion: 'flap', amp: 18, period: 0.45, behind: true }, () => {
      shape([[385, 510], [250, 520], [140, 585], [195, 605], [120, 660], [225, 655], [200, 715], [315, 665], [410, 610]], BROWN, { angle: 30 }, {}, false);
    });
    shape([[430, 850], [418, 915], [345, 940], [395, 942], [380, 958], [455, 945], [472, 860]], ORANGE, { over: 0 }, {}, false);
    shape([[560, 850], [568, 920], [495, 945], [545, 946], [530, 962], [612, 945], [602, 860]], ORANGE, { over: 0 }, {}, false);
    // tail feathers fanned out sharper, the round body
    shape([[635, 630], [815, 560], [770, 625], [865, 640], [785, 685], [850, 745], [655, 730]], BROWN, { angle: 20 }, {}, false);
    shape(potato(500, 680, 192, 202, 12, 0.05), BROWN, { angle: 80, over: 0.5 });
    // the breastplate, bigger: overlapping plates, rivets, a ridge, a shine and the star
    shape([[340, 552], [520, 505], [635, 570], [628, 772], [488, 838], [350, 772]], STEEL, { angle: 70, over: 0.4 });
    for (const [y, dy] of [[612, -12], [676, -14], [738, -16]] as P[]) {
      stroke([[352, y + 8], [490, y + 16], [624, y + dy]], { w: 5, col: DEEP });
      for (const x of [372, 604]) dot(x, x < 500 ? y + 22 : y + dy + 12, 7, 7, DEEP);
    }
    stroke([[505, 520], [492, 825]], { w: 4, col: DEEP });
    shine([[372, 585], [384, 690]], 7);
    c.star(555 + DX, 700 + DY, 44, 8);
    // the near wing holding the greatsword up (it brandishes it in battle)
    part('epee', { pivot: [590, 580], motion: 'swing', amp: 5, period: 2.8 }, () => {
      shape([[600, 600], [660, 560], [700, 520], [745, 440], [690, 425], [640, 470], [620, 520], [570, 560], [560, 600], [585, 585]], BROWN, { angle: 110 }, {}, false);
      // the long thick blade (a pencil's six sides), the sharpened wood and the steel point
      const d: P = [0.249, -0.969], n: P = [0.969, 0.249], base: P = [841, -78];
      shape(band([[702, 470], [772, 196], base], 66, 60), PENCIL, { angle: 80, over: 0.15 });
      for (const k of [-11, 11]) stroke([[702 + n[0] * k, 470 + n[1] * k], [base[0] + n[0] * k, base[1] + n[1] * k]], { w: 3.5, col: '#c99a1e' });
      const tip: P = [base[0] + d[0] * 140, base[1] + d[1] * 140], mid: P = [base[0] + d[0] * 70, base[1] + d[1] * 70];
      shape([[base[0] - n[0] * 31, base[1] - n[1] * 31], tip, [base[0] + n[0] * 31, base[1] + n[1] * 31]], WOOD, { over: 0 }, { w: 5 }, false);
      shape([[mid[0] - n[0] * 16, mid[1] - n[1] * 16], tip, [mid[0] + n[0] * 16, mid[1] + n[1] * 16]], STEEL, { over: 0 }, { w: 5 }, false);
      shine([[728, 400], [800, 110]], 7);
      // the crossguard, big, its ends pointed
      shape([[600, 462], [640, 446], [770, 476], [818, 506], [770, 528], [636, 500]], DEEP, { over: 0 }, { w: 5 }, false);
      for (const [x, y] of [[668, 476], [742, 496]] as P[]) dot(x, y, 7, 7, '#ffffff');
    });
    // the head turned left under its helmet, bigger now: a visor point over the beak, a riveted rim
    shape(potato(430, 380, 130, 120, 12, 0.05), CREAM, { angle: 80, over: 0.3 });
    shape([[268, 372], [300, 300], [335, 245], [430, 200], [535, 228], [580, 300], [595, 400], [565, 415], [545, 360], [480, 335], [400, 325], [335, 345]], STEEL, { angle: 70, over: 0.5 }, {}, false);
    stroke([[290, 360], [340, 335], [400, 318], [480, 326], [550, 352], [588, 395]], { w: 5, col: DEEP });
    for (const [x, y] of [[345, 322], [425, 305], [505, 316], [565, 346]] as P[]) dot(x, y, 6, 6, DEEP);
    stroke([[440, 210], [430, 300]], { w: 4, col: DEEP });
    shine([[350, 270], [395, 240]], 7);
    // its beak open in a battle cry
    shape([[300, 412], [178, 414], [196, 482], [300, 448]], DARK, { over: 0 }, { w: 4 }, false);
    shape([[300, 442], [192, 478], [206, 500], [300, 470]], ORANGE, { angle: 20, over: 0 }, {}, false);
    shape([[304, 386], [165, 396], [175, 420], [302, 418]], ORANGE, { angle: 0, over: 0 }, {}, false);
    // fierce eyes under heavy brows
    paper(potato(348, 385, 18, 20, 8, 0.05));
    paper(potato(432, 382, 24, 25, 8, 0.05));
    dot(343, 389, 8, 11);
    dot(426, 386, 11, 13);
    stroke([[316, 356], [374, 377]], { w: 11 });
    stroke([[402, 374], [470, 350]], { w: 12 });
  },
} satisfies Fair;
