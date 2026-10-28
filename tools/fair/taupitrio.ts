import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Taupitrio's fair copy, Ground/Steel, the same drawing grown up: the three moles taller (the middle one
 * much taller), bigger pink noses, long steel claws gripping the rim of their molehill, the molehill grown into a
 * big mound of rocks with steel ore jutting out of it, heavier brows and a fang each, and the gold star on the
 * middle mole. In battle they duck down into the mound in turn, like the drawing's: each body stops just under the
 * rim and the mound's front reaches below where it goes, so no mole ever shows under the earth. It faces left,
 * like its drawing.
 */
export default {
  id: '041', slug: 'taupitrio', seed: 41041, size: [1430, 1190], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato, shake } = c;
    const BROWN = '#8a5a34', EARTH = '#6b4a2b', PINK = '#f07f9a', PAW = '#f0b6a0', STEEL = '#b4bac6', IRON = '#5f6a80', STONE = '#9a8a78';
    // the mound: a smooth hill on top, a straight bottom leaning against the tilt so it comes out level (the rig's
    // clip box ends there), low enough that a mole ducking down never reaches it
    const W = 1430, B = 1140, lean = Math.tan((2 * Math.PI) / 180);
    const floor = (x: number) => B + (x - W / 2) * lean;
    const crest: P[] = [[15, floor(15)], [90, 1010], [170, 900], [250, 790], [320, 715], [450, 668], [710, 650], [970, 666], [1110, 710], [1185, 790], [1265, 900], [1345, 1010], [1415, floor(1415)]];
    const hill: P[] = [];
    for (let i = 0; i < crest.length - 1; i++) {
      const p0 = crest[Math.max(0, i - 1)], p1 = crest[i], p2 = crest[i + 1], p3 = crest[Math.min(crest.length - 1, i + 2)];
      for (let k = 0; k < 8; k++) {
        const t = k / 8, t2 = t * t, t3 = t2 * t;
        const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        hill.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    hill.push(crest[crest.length - 1]);
    /** The rim's height at x. */
    const rim = (x: number) => {
      const i = Math.max(1, hill.findIndex(([hx]) => hx >= x));
      const [ax, ay] = hill[i - 1], [bx, by] = hill[i];
      return ay + ((by - ay) * (x - ax)) / (bx - ax || 1);
    };
    // each mole turned three-quarters to the left: its face and nose on the left side
    // (its body stops just under the rim of the mound, at `bottom`)
    const mole = (x: number, y: number, s: number, bottom: number, star = false) => {
      shape(shake([[x - 100 * s, bottom], [x - 120 * s, y - 20 * s], [x - 95 * s, y - 170 * s], [x - 20 * s, y - 225 * s], [x + 70 * s, y - 190 * s], [x + 115 * s, y - 40 * s], [x + 110 * s, bottom]], 3), BROWN, { angle: 75 });
      c.shine([[x + 40 * s, y - 175 * s], [x + 70 * s, y - 130 * s]], 6);
      // slit eyes under heavy brows
      stroke([[x - 108 * s, y - 82 * s], [x - 80 * s, y - 72 * s]], { w: 7 });
      stroke([[x - 22 * s, y - 72 * s], [x + 22 * s, y - 84 * s]], { w: 7 });
      stroke([[x - 112 * s, y - 112 * s], [x - 72 * s, y - 96 * s]], { w: 11 });
      stroke([[x - 30 * s, y - 98 * s], [x + 25 * s, y - 120 * s]], { w: 11 });
      // a bigger pink nose, whiskers, a grin with a fang
      shape(potato(x - 75 * s, y - 22 * s, 62 * s, 46 * s, 8, 0.05), PINK, { over: 0 }, { w: 5 });
      dot(x - 92 * s, y - 26 * s, 6, 6);
      dot(x - 60 * s, y - 26 * s, 7, 7);
      c.shine([[x - 100 * s, y - 50 * s], [x - 80 * s, y - 56 * s]], 5);
      for (const d of [-1, 1]) {
        stroke([[x - 75 * s + d * 62 * s, y - 15 * s], [x - 75 * s + d * 145 * s, y - 38 * s]], { w: 3.5 });
        stroke([[x - 75 * s + d * 62 * s, y + 5 * s], [x - 75 * s + d * 145 * s, y + 22 * s]], { w: 3.5 });
      }
      stroke([[x - 108 * s, y + 55 * s], [x - 72 * s, y + 72 * s], [x - 36 * s, y + 55 * s]], { w: 5 });
      c.paper([[x - 82 * s, y + 68 * s], [x - 74 * s, y + 90 * s], [x - 64 * s, y + 66 * s]], { w: 3.5 }, false);
      if (star) c.star(x + 20 * s, y + 140 * s, 46, 8);
    };
    c.part('taupe1', { pivot: [430, 700], motion: 'peek', to: [0, 70], period: 3.6, phase: 0, behind: true, clip: true }, () => mole(430, 500, 1.08, 740));
    c.part('taupe2', { pivot: [985, 700], motion: 'peek', to: [0, 70], period: 3.6, phase: 0.33, behind: true, clip: true }, () => mole(985, 515, 1.02, 735));
    c.part('taupe3', { pivot: [710, 700], motion: 'peek', to: [0, 64], period: 3.6, phase: 0.66, behind: true, clip: true }, () => mole(710, 365, 1.45, 690, true));
    // one big mound of earth and rocks in front, steel ore jutting out of it and shining through it
    /** A chunk of steel ore: a faceted crystal from its base out to `tip`. */
    const ore = (base: P, tip: P, w: number) => {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const mid: P = [base[0] + dx * 0.7, base[1] + dy * 0.7];
      shape([[base[0] + nx * w, base[1] + ny * w], [mid[0] + nx * w * 0.9, mid[1] + ny * w * 0.9], tip, [mid[0] - nx * w * 0.9, mid[1] - ny * w * 0.9], [base[0] - nx * w, base[1] - ny * w]], STEEL, { angle: 60, over: 0 }, { w: 5 }, false);
      c.tint([[base[0], base[1]], [mid[0] - nx * w * 0.9, mid[1] - ny * w * 0.9], tip, [mid[0], mid[1]]], IRON, { over: 0, press: 0.7 });
      stroke([[base[0], base[1]], [mid[0], mid[1]], tip], { w: 3.5, col: IRON }, false);
      c.shine([[base[0] + nx * w * 0.5 + dx * 0.2, base[1] + ny * w * 0.5 + dy * 0.2], [mid[0] + nx * w * 0.45, mid[1] + ny * w * 0.45]], 6);
    };
    ore([300, 880], [140, 650], 60);
    ore([230, 990], [95, 905], 38);
    ore([1140, 880], [1300, 640], 64);
    ore([1220, 1000], [1340, 925], 38);
    shape(hill, EARTH, { angle: -20 }, {}, false);
    for (const [x, y, rx, ry] of [[410, 800, 48, 36], [990, 805, 50, 36], [550, 975, 58, 40], [910, 990, 54, 38], [285, 1010, 50, 36], [1160, 1020, 52, 36], [130, 1070, 44, 30], [1300, 1080, 46, 32]]) {
      shape(potato(x, y, rx, ry, 8, 0.12), STONE, { angle: 60, over: 0 }, { w: 5 });
    }
    ore([670, 965], [730, 810], 54);
    ore([765, 970], [855, 885], 34);
    for (const x of [380, 1070]) stroke([[x, floor(x) - 6], [x - 10, floor(x) - 66], [x + 10, floor(x) - 6], [x + 24, floor(x) - 63]], { w: 4.5 });
    // six bigger paws gripping the rim, long curved steel claws over it
    for (const x of [360, 495, 630, 790, 925, 1060]) {
      const y = rim(x) - 16;
      for (const dx of [-34, 0, 34]) shape([[x + dx - 13, y + 10], [x + dx - 16, y + 60], [x + dx - 4, y + 100], [x + dx + 6, y + 62], [x + dx + 13, y + 12]], STEEL, { over: 0, angle: 80 }, { w: 4 }, false);
      shape(potato(x, y, 66, 38, 7, 0.06), PAW, { over: 0, angle: 70 }, { w: 5 });
    }
  },
} satisfies Fair;
