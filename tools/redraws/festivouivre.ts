import type { Crayon, P, Redraw } from './crayon.ts';
import { star } from './lumignon.ts';
import { accordion, charm, flower, horn } from './plissou.ts';

/** A pleated paper fan opening from (x, y), from angle a0 to a1 (degrees), its folds in turn of colour. */
function fan(c: Crayon, x: number, y: number, r: number, a0: number, a1: number, cols: string[]) {
  const n = 9;
  for (let k = 0; k < n; k++) {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180, b = ((a0 + ((a1 - a0) * (k + 1)) / n) * Math.PI) / 180;
    const rr = r * (k % 2 ? 0.93 : 1);
    c.shape([[x, y], [x + Math.cos(a) * rr, y + Math.sin(a) * rr], [x + Math.cos(b) * rr, y + Math.sin(b) * rr]], cols[k % cols.length], { over: 0 }, { w: 3 }, false);
  }
}

/**
 * Plisserpent grown into a great fairy parade dragon turned to the left: a long, thick accordion body dancing in
 * a wave, rainbow pastel folds with sparkles and paper flowers all along, a pleated paper fan opening behind its
 * head, four legs with cream claws, a big unicorn horn in a crown of flowers, a cream beard, long ribbons streaming,
 * and the dragon's rainbow pearl held in a front claw.
 */
export default {
  id: '086', slug: 'festivouivre', seed: 8601, size: [1300, 1150], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const PINK = '#f28dc0', LILAC = '#b99be8', SKY = '#8fcdf2', MINT = '#94dcaa', BUTTER = '#f9dc6a', CREAM = '#fff0d2';
    const STAR = '#f7dc35', DEEP = '#d0619d', LEG = '#a385dc';
    // ribbons streaming behind, from the back of its head
    shape(band([[560, 300], [700, 250], [840, 290], [960, 210], [1080, 230]], 28, 14), MINT, { over: 0 }, { w: 3 });
    // the far legs, behind
    shape(band([[1050, 640], [1030, 820]], 60, 52), LEG, { angle: 90, over: 0 });
    shape(band([[560, 660], [540, 840]], 60, 52), LEG, { angle: 90, over: 0 });
    // the long thick body dancing in a wave, tail first: rainbow folds, sparkles and stars along it
    const body: P[] = [[1240, 170], [1200, 420], [1090, 600], [960, 560], [860, 400], [740, 380], [640, 500], [540, 600], [460, 520], [440, 420]];
    accordion(c, body, 17, 120, 220, [PINK, BUTTER, MINT, SKY, LILAC], (k, [x, y], w) => {
      if (k % 2 === 0) shape(star(x, y, 12, k * 0.4), '#ffffff', { over: 0, wash: 1 }, { w: 2 }, false);
      if (k % 3 === 2) flower(c, x + 8, y - w / 2 - 8, 40, [PINK, SKY, MINT, BUTTER][((k / 3) | 0) % 4], k % 2 ? STAR : '#ffffff');
    });
    charm(c, 1240, 170, 1.4, STAR, PINK);
    // the near legs, cream claws
    for (const [x0, y0, x1, y1] of [[1100, 640, 1120, 860], [610, 640, 620, 870]] as const) {
      shape(band([[x0, y0], [x1, y1]], 70, 62), LILAC, { angle: 90, over: 0 });
      for (const dx of [-30, 0, 30]) shape(band([[x1 + dx, y1 + 10], [x1 + dx - 14, y1 + 46]], 18, 8), CREAM, { over: 0 }, { w: 3 });
    }
    // a pleated paper fan opening behind its head like a frill, then the scalloped mane
    fan(c, 400, 330, 330, -115, 35, [PINK, SKY, BUTTER, MINT, LILAC]);
    const mane: P[] = [];
    for (let k = 0; k <= 12; k++) { const a = -1.9 + k * 0.28, r = k % 2 ? 205 : 235; mane.push([320 + Math.cos(a) * r, 340 + Math.sin(a) * r]); }
    shape([...mane, [320, 340]], LILAC, { angle: 60, over: 0 });
    // the far front leg holding up the rainbow pearl
    shape(band([[460, 600], [330, 640], [250, 600]], 66, 56), LILAC, { angle: 30, over: 0 });
    shape(potato(200, 590, 70, 70, 12, 0.03), PINK, { angle: 60, over: 0 }, { w: 4 });
    c.tint(potato(180, 570, 40, 36, 8, 0.1), SKY, { gap: 3.2 });
    c.tint(potato(225, 615, 32, 28, 8, 0.1), BUTTER, { gap: 3.2 });
    dot(175, 560, 10, 12, '#ffffff');
    for (const dx of [-36, -6, 24]) shape(band([[250 + dx, 640], [240 + dx, 670]], 18, 8), CREAM, { over: 0 }, { w: 3 });
    // the big head: long snout, cream muzzle and a soft cream beard, a rosy cheek
    shape([[90, 330], [150, 230], [290, 170], [440, 180], [520, 270], [510, 400], [420, 460], [270, 480], [130, 450], [70, 390]], PINK, { angle: 75, over: 0.55, press: 1.05 });
    shape(spikes([[300, 470], [210, 480], [130, 460]], 3, 50).concat([[220, 440]]), CREAM, { angle: 90, over: 0 }, {}, false);
    shape([[60, 350], [130, 300], [290, 330], [320, 410], [250, 470], [120, 460], [60, 410]], CREAM, { angle: 80, over: 0.2 }, { w: 4 });
    c.tint(potato(420, 400, 36, 24, 8, 0.1), DEEP, { gap: 3 });
    dot(90, 350, 9, 7);
    dot(138, 336, 9, 7);
    stroke([[100, 420], [170, 438], [240, 420], [270, 400]], { w: 5 });
    // a big unicorn horn, and a crown of paper flowers round it
    horn(c, [250, 200], [215, 20], 66, '#fff6e6', PINK);
    for (const [x, y, r, col] of [[320, 190, 50, SKY], [400, 200, 46, BUTTER], [470, 240, 42, MINT], [180, 215, 40, LILAC]] as const) flower(c, x, y, r, col, STAR);
    // starry eyes, lashes, sure of itself
    c.paper(potato(230, 270, 30, 26, 8, 0.05));
    c.paper(potato(345, 260, 34, 30, 8, 0.05));
    dot(222, 276, 15, 16, '#5a3f8a');
    dot(337, 267, 17, 18, '#5a3f8a');
    shape(star(216, 268, 8, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    shape(star(330, 258, 9, 0.3), '#ffffff', { over: 0, wash: 1 }, { w: 1.5 }, false);
    for (const [x0, y0, x1, y1] of [[200, 250, 186, 232], [218, 245, 212, 226], [318, 236, 306, 216], [340, 231, 336, 210]] as const) stroke([[x0, y0], [x1, y1]], { w: 3.5 });
    // long whiskers, ribbons floating down
    shape(band([[90, 400], [40, 460], [30, 560], [70, 640]], 24, 12), SKY, { over: 0 }, { w: 3 });
    stroke([[480, 220], [500, 330], [480, 430]], { w: 3, col: DEEP });
    // sparkles round it
    for (const [x, y, r] of [[60, 200, 22], [140, 760, 18], [1180, 700, 20], [880, 120, 18]] as const) shape(star(x, y, r, 0.4), STAR, { over: 0 }, { w: 2.5 }, false);
  },
} satisfies Redraw;
