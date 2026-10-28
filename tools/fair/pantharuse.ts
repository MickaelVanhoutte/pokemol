import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Pantharuse's fair copy, Dark/Fighting, the same drawing grown up: its tail longer and ending in a big
 * curved blade, its fur grown into a mane of long spikes over its neck and shoulders and a ruff on its chest, a
 * fighter's build (heavy shoulders, thick forelegs, big paws with long claws out), glowing gold eyes under heavy
 * brows, a snarl with fangs, a bigger red gem, and the gold star on its flank. It faces left, like its drawing.
 */
export default {
  id: '055', slug: 'pantharuse', seed: 55055, size: [1140, 1000], tilt: 0,
  draw(c) {
    // its own drawing's coordinates, moved down to make room for the mane and the blade
    const D: P = [20, 90];
    const m = (pts: P[]) => pts.map(([x, y]) => [x + D[0], y + D[1]] as P);
    const shape: typeof c.shape = (pts, ...r) => c.shape(m(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(m(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(m(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(m(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(m(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + D[0], y + D[1], ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: m([def.pivot])[0] }, draw);
    const { band, potato, spikes } = c;
    const DARK = '#4a3f6e', MANE = '#5c5089', LIGHT = '#8a80b0', RED = '#e2423a', GOLD = '#f2c43a', GLOW = '#fff07a', BLADE = '#c9c3e4', MOUTH = '#6a1f34';
    /** A paw at (x, y) with three long claws out, pointing left. */
    const paw = (x: number, y: number, s: number) => {
      for (const [dy, len] of [[-10, 1], [8, 1.15], [24, 0.9]] as P[]) {
        shape([[x - 30 * s, y + dy - 11], [x - 30 * s - 62 * len * s, y + dy + 16 * len], [x - 24 * s, y + dy + 12]], '#ffffff', { over: 0 }, { w: 4.5 }, false);
      }
      shape(potato(x, y + 8, 46 * s, 26 * s, 8, 0.05), DARK, { angle: 0, over: 0 });
    };
    // the far legs, behind, the front one thicker
    shape(band([[360, 555], [330, 700], [318, 830]], 78, 64), DARK, { angle: 90 });
    shape(band([[760, 560], [790, 700], [800, 830]], 58, 50), DARK, { angle: 90 });
    // the long tail curling up behind, longer, ending in a big curved blade
    part('queue', { pivot: [850, 500], motion: 'swing', amp: 8, period: 1.8, behind: true }, () => {
      shape(band([[850, 500], [970, 455], [1045, 360], [1040, 250], [990, 190]], 50, 30), DARK, { angle: 60 });
      shape([[1022, 222], [1012, 130], [966, 40], [890, -20], [790, -55], [868, 2], [925, 62], [952, 140], [962, 222]], BLADE, { angle: 30, over: 0 }, { w: 6.5 }, false);
      stroke([[992, 200], [962, 100], [900, 20], [830, -30]], { w: 4.5, col: LIGHT });
      shine([[1000, 140], [975, 70], [935, 25]], 7);
    });
    // its fur grown into a mane of long spikes over its neck and shoulders, behind the body and head
    shape([...spikes([[770, 425], [660, 372], [560, 320], [490, 250], [455, 160]], 2, 120), [400, 300], [450, 470], [720, 480]], DARK, { angle: 70, over: 0 }, {}, false);
    shape([...spikes([[690, 410], [590, 370], [510, 310], [470, 240]], 2, 70), [420, 330], [480, 460], [660, 470]], MANE, { angle: 70, over: 0 }, {}, false);
    shape([...spikes([[880, 470], [820, 418], [750, 405]], 2, 55), [780, 480]], DARK, { angle: 70, over: 0 }, {}, false);
    // a ruff of fur bristling on its chest
    shape([...spikes([[290, 430], [262, 520], [300, 610]], 2, 70), [420, 600], [430, 450]], DARK, { angle: 70, over: 0 }, {}, false);
    // the long body, a lighter belly, the star on its flank
    shape([[300, 420], [500, 390], [760, 400], [880, 460], [880, 580], [760, 640], [480, 640], [320, 600], [270, 510]], DARK, { angle: 15, over: 0.6, press: 1.05 });
    tint([[380, 560], [760, 560], [740, 620], [420, 625]], LIGHT, { angle: 15 });
    c.star(690 + D[0], 500 + D[1], 46, 8);
    shine([[580, 425], [670, 422]], 7);
    // the near legs: a heavy shoulder over a thick foreleg, big paws with their claws out
    shape([[372, 540], [405, 482], [470, 468], [525, 505], [528, 580], [490, 660], [462, 750], [452, 842], [358, 842], [364, 740], [372, 640]], DARK, { angle: 85 });
    shine([[420, 492], [470, 482]], 6);
    paw(400, 848, 1.35);
    shape(band([[680, 610], [700, 740], [710, 845]], 72, 62), DARK, { angle: 90 });
    paw(705, 850, 1.05);
    // ears, sharper, a tuft of fur inside
    shape([[228, 292], [185, 125], [302, 250]], DARK, { angle: 70 }, {}, false);
    shape([[328, 242], [410, 90], [425, 272]], DARK, { angle: 110 }, {}, false);
    shape([[350, 236], [402, 140], [405, 250]], LIGHT, { angle: 110, over: 0 }, { w: 4 }, false);
    // the head turned left, its red gem bigger
    shape([[150, 350], [210, 260], [330, 230], [440, 280], [460, 380], [400, 450], [280, 470], [170, 440], [120, 390]], DARK, { angle: 80, over: 0.5 });
    shape(potato(302, 276, 28, 25, 8, 0.05), RED, { over: 0, press: 1.2 }, { w: 4 });
    shine([[292, 266], [302, 260]], 5);
    // glowing gold eyes with slit pupils, the far one narrower, under heavy brows
    shape([[185, 352], [214, 334], [250, 344], [218, 362]], GLOW, { over: 0 }, { w: 4 }, false);
    shape([[294, 350], [342, 322], [394, 334], [348, 364]], GLOW, { over: 0 }, { w: 4 }, false);
    tint([[300, 350], [342, 330], [384, 338], [346, 350]], GOLD, { wash: 0.6 });
    stroke([[217, 337], [218, 360]], { w: 5 });
    stroke([[344, 326], [346, 361]], { w: 6 });
    stroke([[178, 320], [252, 338]], { w: 11 });
    stroke([[290, 336], [398, 306]], { w: 12 });
    dot(140, 395, 9, 7);
    // a snarl: its mouth open on fangs
    shape([[150, 418], [205, 428], [262, 412], [245, 452], [198, 464], [160, 446]], MOUTH, { over: 0 }, { w: 5 });
    paper([[168, 421], [180, 452], [192, 425]], { w: 4 }, false);
    paper([[226, 424], [238, 455], [250, 418]], { w: 4 }, false);
    stroke([[130, 410], [40, 392]], { w: 3.5 });
    stroke([[135, 430], [45, 452]], { w: 3.5 });
  },
} satisfies Fair;
