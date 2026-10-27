import type { Draft, P } from './kid.ts';

/** Braisaure's evolution: bat wings, horns, a flame on its tail, breathing fire. */
export default {
  id: '025', slug: 'dragobraise', seed: 21, layered: true, size: [1320, 1260], tilt: -3, pivot: [620, 620], offset: [90, 60],
  draw(k) {
    const { j, potato, shake, densify, shape, colourOnly, stroke, dot, raw, bumps } = k;
    const ORANGE = '#ec6f16', CREAM = '#f3d88a', WING = '#f39a2e', RED = '#e2392c', ORANGE_F = '#f59a26', YEL = '#f9d73a', BLUE = '#3a6fd8';

    /** A flame with three tongues, base at (x, y), pointing at angle `deg` (0 = up). */
    function flame(x: number, y: number, w: number, h: number, deg: number) {
      const a = (deg * Math.PI) / 180;
      const unit: P[] = [[-0.5, 0], [-0.6, -0.35], [-0.32, -0.5], [-0.4, -0.85], [-0.08, -0.58], [0.04, -1], [0.2, -0.58], [0.45, -0.82], [0.36, -0.38], [0.58, -0.25], [0.48, 0.08], [0, 0.16]];
      const at = (f: number): P[] => densify(shake(unit.map(([ux, uy]) => {
        const px = ux * w * f, py = uy * h * f + h * (1 - f) * -0.12;
        return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
      }), 6), 4);
      shape(at(1), RED, { gap: 10, w: 13, miss: 0, angle: deg - 90, wash: 0.7 }, 5.5);
      colourOnly(at(0.68), ORANGE_F, { gap: 10, w: 13, miss: 0, angle: deg - 90 });
      colourOnly(at(0.38), YEL, { gap: 9, w: 13, miss: 0, angle: deg - 90 });
    }
    /** A bat wing: bone from the shoulder up to the top, out to the tip, scalloped bottom edge. */
    function wing(sh: P, top: P, tip: P, bottom: P[], out: number) {
      shape([sh, top, ...bumps([tip, ...bottom], 1, out)], WING, { gap: 14, w: 13, miss: 0.06 });
      stroke([sh, top, tip], 9);
      for (const b of bottom.slice(0, -1)) stroke([top, b], 4.5);
    }
    const thigh = (x: number, y: number, rx: number, ry: number) => shape(potato(x, y, rx, ry, 8, 0.06), ORANGE, { gap: 14, miss: 0.05 });
    const foot = (x: number, y: number) => {
      shape(potato(x, y, 92, 42, 7, 0.1), ORANGE, { gap: 13, miss: 0.05 });
      for (let i = -1; i <= 1; i++) stroke([[x - 60 + i * 26, y + 10 + i * 8], [x - 104 + i * 30 + j(8), y + 28 + i * 18 + j(8)]], 6);
    };

    // wings behind everything: one each side of the back
    k.part('aile-g', { pivot: [570, 500], motion: 'flap', amp: 14, period: 0.7, behind: true, phase: 0 }, () => {
      wing([570, 500], [430, 250], [250, 170], [[262, 380], [390, 470], [540, 560]], 42);
    });
    k.part('aile-d', { pivot: [690, 500], motion: 'flap', amp: -14, period: 0.7, behind: true, phase: 0 }, () => {
      wing([690, 500], [840, 230], [1070, 160], [[1045, 370], [905, 480], [715, 585]], -42);
    });
    // tail curling right, a big flame at its tip
    {
      const path: P[] = [[700, 880], [830, 960], [980, 965], [1090, 895], [1140, 790]];
      const a: P[] = [], b: P[] = [];
      path.forEach((p, i) => {
        const q = path[Math.min(4, i + 1)], o = path[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy), w = 58 - i * 8;
        a.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]); b.push([p[0] + (dy / l) * w, p[1] + -(dx / l) * w]);
      });
      shape([...a, ...b.reverse()], ORANGE, { gap: 14, miss: 0.05 });
      flame(1150, 790, 150, 230, 15);
    }
    // back leg, body, belly, front leg
    foot(745, 1085);
    thigh(720, 930, 85, 120);
    shape(shake([[515, 470], [655, 448], [745, 565], [778, 765], [748, 930], [620, 992], [492, 950], [452, 770], [468, 590]], 18), ORANGE, { angle: -70, gap: 15, miss: 0.08 });
    shape(potato(592, 755, 100, 198, 8, 0.07), CREAM, { gap: 14, w: 13, miss: 0.08, angle: -80 });
    for (let i = -2; i <= 2; i++) stroke([[515 + j(10), 755 + i * 62], [668 + j(10), 750 + i * 62]], 4.5);
    foot(505, 1090);
    thigh(525, 940, 95, 125);
    // neck, then the arm reaching forward with its claws
    shape(shake([[505, 530], [450, 420], [445, 330], [545, 295], [605, 385], [625, 505]], 10), ORANGE, { gap: 14, miss: 0.05 });
    shape(shake([[535, 600], [445, 620], [385, 652], [375, 692], [415, 702], [478, 672], [565, 652]], 8), ORANGE, { gap: 13, w: 12, miss: 0 });
    for (const [a, b] of [[[384, 660], [336, 636]], [[376, 682], [324, 686]], [[392, 700], [350, 732]]] as [P, P][]) stroke([a, [b[0] + j(10), b[1] + j(10)]], 6.5);
    // horns, then the head: a long snout to the left, mouth open
    shape(shake([[548, 232], [612, 105], [608, 245]], 5), CREAM, { gap: 10, w: 11, miss: 0 }, 6);
    shape(shake([[588, 252], [700, 158], [650, 275]], 5), CREAM, { gap: 10, w: 11, miss: 0 }, 6);
    shape(shake([[602, 262], [590, 200], [520, 178], [440, 192], [372, 222], [292, 246], [262, 286], [290, 330], [380, 346], [482, 352], [572, 332]], 6), ORANGE, { angle: -40, gap: 14, miss: 0.04 });
    raw(`<path d='M266 300 L470 318 L300 344 Z' fill='#5a2430' stroke='#2e2a35' stroke-width='5' stroke-linejoin='round'/>`);
    raw(`<path d='M300 303 L310 322 L322 305 Z M350 307 L360 326 L372 309 Z M402 311 L412 328 L424 313 Z' fill='#fff' stroke='#2e2a35' stroke-width='4' stroke-linejoin='round'/>`);
    shape(shake([[438, 262], [500, 248], [512, 270], [470, 282]], 3), BLUE, { gap: 7, w: 9, miss: 0 }, 5);
    stroke([[420, 248], [520, 222]], 9);
    dot(298, 262, 6);
    // fire breath out of the mouth
    flame(262, 322, 150, 380, -110);
  },
} satisfies Draft;
