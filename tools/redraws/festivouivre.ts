import type { Crayon, P, Redraw } from './crayon.ts';
import { accordion, tassel } from './plissou.ts';

/** A pleated paper fan opening from (x, y), from angle a0 to a1 (degrees), its folds in turn of colour. */
function fan(c: Crayon, x: number, y: number, r: number, a0: number, a1: number, cols: string[]) {
  const n = 7;
  for (let k = 0; k < n; k++) {
    const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180, b = ((a0 + ((a1 - a0) * (k + 1)) / n) * Math.PI) / 180;
    const rr = r * (k % 2 ? 0.94 : 1);
    c.shape([[x, y], [x + Math.cos(a) * rr, y + Math.sin(a) * rr], [x + Math.cos(b) * rr, y + Math.sin(b) * rr]], cols[k % cols.length], { over: 0 }, { w: 3 }, false);
  }
}

/**
 * Plisserpent grown into a great parade dragon turned to the left: a long, thick accordion body coiling up, gold
 * scales drawn on its red folds and pompoms all along, four legs with gold claws, a big head with branching gold
 * horns, pleated paper fans opening like frills behind its cheeks, a gold beard, long ribbons streaming, and the
 * dragon's rainbow pearl held in a front claw.
 */
export default {
  id: '086', slug: 'festivouivre', seed: 8601, size: [1300, 1150], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const RED = '#d8352e', GOLD = '#f2c43a', PINK = '#f29ac8', BLUE = '#6fb6ee', GREEN = '#7fcf86', VIOLET = '#b38ae0', DARK = '#9a2a24';
    const POMS = [PINK, BLUE, GREEN, VIOLET];
    // ribbons streaming behind, from the back of its head
    shape(band([[560, 260], [680, 160], [820, 180], [940, 90], [1060, 110]], 28, 14), BLUE, { over: 0 }, { w: 3 });
    shape(band([[560, 320], [700, 250], [840, 290], [980, 230]], 28, 14), PINK, { over: 0 }, { w: 3 });
    // the far legs, behind
    shape(band([[1050, 640], [1030, 820]], 60, 52), DARK, { angle: 90, over: 0 });
    shape(band([[560, 660], [540, 840]], 60, 52), DARK, { angle: 90, over: 0 });
    // the long thick body coiling up, tail first: gold scales on the red folds, pompoms along its back
    const body: P[] = [[1240, 170], [1200, 420], [1090, 600], [960, 560], [860, 400], [740, 380], [640, 500], [540, 600], [460, 520], [440, 420]];
    accordion(c, body, 17, 120, 220, [RED, GOLD], (k, [x, y], w) => {
      if (k % 2 === 0) for (const dy of [-w / 5, w / 6]) stroke([[x - 20, y + dy], [x - 6, y + dy + 14], [x + 10, y + dy], [x + 24, y + dy + 14]], { w: 3, col: '#f7dc35' });
      if (k % 3 === 2) shape(potato(x + 8, y - w / 2 - 8, 28, 25, 9, 0.14), POMS[((k / 3) | 0) % POMS.length], { over: 0 }, { w: 3 });
    });
    tassel(c, 1248, 140, 1.4, GOLD, '#f7a12b');
    // the near legs, gold claws
    for (const [x0, y0, x1, y1] of [[1100, 640, 1120, 860], [610, 640, 620, 870]] as const) {
      shape(band([[x0, y0], [x1, y1]], 70, 62), RED, { angle: 90, over: 0 });
      for (const dx of [-30, 0, 30]) shape(band([[x1 + dx, y1 + 10], [x1 + dx - 14, y1 + 46]], 18, 8), GOLD, { over: 0 }, { w: 3 });
    }
    // the fans opening behind its cheek, and the gold mane
    shape(spikes([[430, 560], [560, 470], [580, 300], [480, 160]], 3, 50).concat([[380, 300]]), GOLD, { angle: 60, over: 0 }, {}, false);
    fan(c, 440, 330, 290, -95, 55, [PINK, BLUE, GREEN, VIOLET, '#f7dc35']);
    // the far horn, branching
    shape(band([[400, 160], [450, 70], [430, 10]], 36, 18), GOLD, { angle: 90, over: 0 });
    shape(band([[440, 90], [510, 60]], 22, 14), GOLD, { over: 0 });
    // the far front leg holding up the rainbow pearl
    shape(band([[460, 600], [330, 640], [250, 600]], 66, 56), RED, { angle: 30, over: 0 });
    shape(potato(200, 590, 70, 70, 12, 0.03), PINK, { angle: 60, over: 0 }, { w: 4 });
    c.tint(potato(180, 570, 40, 36, 8, 0.1), BLUE, { gap: 3.2 });
    c.tint(potato(225, 615, 32, 28, 8, 0.1), '#f7dc35', { gap: 3.2 });
    dot(175, 560, 10, 12, '#ffffff');
    for (const dx of [-36, -6, 24]) shape(band([[250 + dx, 640], [240 + dx, 670]], 18, 8), GOLD, { over: 0 }, { w: 3 });
    // the big head: long snout, gold muzzle, a gold beard
    shape([[90, 330], [150, 230], [290, 170], [440, 180], [520, 270], [510, 400], [420, 460], [270, 480], [130, 450], [70, 390]], RED, { angle: 75, over: 0.55, press: 1.05 });
    shape(spikes([[300, 470], [210, 480], [130, 460]], 3, 50).concat([[220, 440]]), GOLD, { angle: 90, over: 0 }, {}, false);
    shape([[60, 350], [130, 300], [290, 330], [320, 410], [250, 470], [120, 460], [60, 410]], GOLD, { angle: 80, over: 0.2 }, { w: 4 });
    dot(90, 350, 10, 8);
    dot(138, 336, 10, 8);
    stroke([[100, 420], [170, 438], [240, 420], [270, 400]], { w: 5 });
    c.paper([[150, 432], [160, 455], [172, 434]], { w: 3 }, false);
    // the near horn, branching like antlers
    shape(band([[330, 190], [320, 90], [370, 20], [420, 10]], 44, 20), GOLD, { angle: 90, over: 0 });
    shape(band([[322, 110], [250, 60], [230, 10]], 28, 14), GOLD, { over: 0 });
    // fierce eyes under heavy gold brows
    c.paper(potato(230, 270, 30, 26, 8, 0.05));
    c.paper(potato(345, 260, 34, 30, 8, 0.05));
    dot(222, 276, 15, 16);
    dot(337, 267, 17, 18);
    dot(216, 268, 5, 5.5, '#ffffff');
    dot(330, 258, 5.5, 6, '#ffffff');
    shape(band([[185, 240], [240, 236], [285, 250]], 22, 12), GOLD, { over: 0 }, { w: 3 });
    shape(band([[300, 228], [355, 218], [405, 236]], 24, 12), GOLD, { over: 0 }, { w: 3 });
    // long whiskers, ribbons floating down
    shape(band([[90, 400], [40, 460], [30, 560], [70, 640]], 24, 12), PINK, { over: 0 }, { w: 3 });
    stroke([[480, 220], [500, 330], [480, 430]], { w: 3, col: DARK });
  },
} satisfies Redraw;
