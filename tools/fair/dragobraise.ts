import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Dragobraise's fair copy, Fire/Dragon, the same drawing grown up: its bat wings grown huge, spreading far
 * past its body with four fingers each, a spike past every fingertip and a hooked claw at each wrist; a bigger
 * spiked wing grown from its forearm; longer horns and a third one; a row of dragon spikes from its head to its
 * tail; its flames gone white-hot blue (on its tail, in its roar and flickering at the corners of its mouth); and
 * the gold star on its belly.
 */
export default {
  id: '025', slug: 'dragobraise', seed: 25025, size: [1560, 1380], tilt: -3,
  draw(c0) {
    const c = moved(c0, 150, 160);
    const { shape, stroke, dot, potato, shake, band } = c;
    const ORANGE = '#ec6f16', CREAM = '#f3d88a', WING = '#f39a2e', SKIN = '#f6b04e', SPIKE = '#c43a22';
    const BLUE = '#2f7fe8', SKY = '#8fd0ff', WHITE = '#eef8ff', EYE = '#3a6fd8';

    /** A white-hot flame: base at (x, y), pointing at angle `deg` (0 = up). */
    const flame = (x: number, y: number, w: number, h: number, deg: number) => {
      const a = (deg * Math.PI) / 180;
      const unit: P[] = [[-0.5, 0], [-0.6, -0.35], [-0.32, -0.5], [-0.4, -0.85], [-0.08, -0.58], [0.04, -1], [0.2, -0.58], [0.45, -0.82], [0.36, -0.38], [0.58, -0.25], [0.48, 0.08], [0, 0.16]];
      const at = (f: number): P[] => unit.map(([ux, uy]) => {
        const px = ux * w * f, py = uy * h * f + h * (1 - f) * -0.12;
        return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
      });
      shape(at(1), BLUE, { angle: deg - 90 });
      c.tint(at(0.66), SKY, { angle: deg - 90 });
      c.tint(at(0.36), WHITE, { angle: deg - 90 });
    };
    /**
     * A bat wing: the arm bone up to the wrist, its fingers out to the tips, the skin scalloped between them, a hooked
     * claw at the wrist and a spike past each fingertip.
     */
    const wing = (sh: P, wrist: P, tips: P[], dir: number) => {
      const skin: P[] = [sh, wrist, tips[0]];
      for (let i = 1; i < tips.length; i++) {
        const a = tips[i - 1], b = tips[i];
        skin.push([(a[0] + b[0]) / 2 + (wrist[0] - (a[0] + b[0]) / 2) * 0.32, (a[1] + b[1]) / 2 + (wrist[1] - (a[1] + b[1]) / 2) * 0.32], b);
      }
      const last = tips[tips.length - 1];
      skin.push([(last[0] + sh[0]) / 2 + dir * 40, (last[1] + sh[1]) / 2 + 90]);
      for (const t of tips) {
        const dx = t[0] - wrist[0], dy = t[1] - wrist[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        shape([[t[0] - uy * 15 - ux * 20, t[1] + ux * 15 - uy * 20], [t[0] + ux * 75, t[1] + uy * 75], [t[0] + uy * 15 - ux * 20, t[1] - ux * 15 - uy * 20]], CREAM, { over: 0 }, { w: 4 }, false);
      }
      shape(skin, WING, { angle: 60 * dir }, {}, false);
      // lighter skin between the first fingers, darker by the last ones
      const toward = (t: P, k: number): P => [wrist[0] + (t[0] - wrist[0]) * k, wrist[1] + (t[1] - wrist[1]) * k];
      c.tint([toward(tips[0], 0.25), toward(tips[0], 0.72), toward(tips[1], 0.62), toward(tips[1], 0.3)], SKIN, { angle: 60 * dir });
      c.tint([toward(tips[2], 0.3), toward(tips[2], 0.62), toward(tips[3], 0.6), toward(tips[3], 0.3)], ORANGE, { angle: 60 * dir, press: 0.6 });
      stroke([sh, wrist], { w: 15 });
      for (const t of tips) stroke([wrist, t], { w: 8 });
      shape([[wrist[0] - 18, wrist[1] + 8], [wrist[0] + dir * 14, wrist[1] - 75], [wrist[0] + 20, wrist[1] + 4]], CREAM, { over: 0 }, { w: 4.5 }, false);
    };
    // the wings behind everything, grown huge: four fingers each, spiked tips
    c.part('aile-g', { pivot: [570, 500], motion: 'flap', amp: 10, period: 0.9, behind: true }, () => {
      wing([570, 500], [360, 175], [[230, -40], [40, 40], [-60, 220], [-40, 430]], -1);
    });
    c.part('aile-d', { pivot: [690, 500], motion: 'flap', amp: -10, period: 0.9, behind: true }, () => {
      wing([690, 500], [900, 160], [[990, -60], [1190, 0], [1320, 180], [1310, 400]], 1);
    });
    // the tail curling right, dragon spikes along it, a white-hot flame at its tip
    c.part('queue', { pivot: [700, 880], motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      const path: P[] = [[700, 880], [830, 960], [980, 965], [1090, 895], [1140, 790]];
      for (const [x, y, a] of [[850, 900, -20], [990, 905, 10], [1095, 820, 50]] as [number, number, number][]) {
        const r = (a * Math.PI) / 180;
        shape([[x - 26 * Math.cos(r), y - 26 * Math.sin(r)], [x + 60 * Math.sin(r), y - 60 * Math.cos(r)], [x + 26 * Math.cos(r), y + 26 * Math.sin(r)]], SPIKE, { over: 0 }, { w: 4 }, false);
      }
      shape(band(path, 116, 60), ORANGE, { angle: 30 });
      flame(1150, 790, 170, 270, 15);
    });
    // the back leg, the body and its cream belly, the front leg
    shape(potato(745, 1085, 92, 42, 8, 0.06), ORANGE, { angle: 0 });
    shape(potato(720, 930, 85, 120, 9, 0.05), ORANGE, { angle: 80 });
    for (const [x, y] of [[640, 470], [720, 560], [760, 680]] as P[]) shape([[x - 26, y - 6], [x + 46, y - 34], [x + 20, y + 30]], SPIKE, { over: 0 }, { w: 4 }, false);
    shape(shake([[515, 470], [655, 448], [745, 565], [778, 765], [748, 930], [620, 992], [492, 950], [452, 770], [468, 590]], 8), ORANGE, { angle: 70 });
    shape(potato(592, 755, 100, 198, 9, 0.05), CREAM, { angle: 80, over: 0 });
    for (let i = -2; i <= 2; i++) stroke([[515, 755 + i * 62], [668, 750 + i * 62]], { w: 4.5, col: '#c98a2e' });
    c.star(592, 760, 46, -6);
    for (const [fx, fy] of [[505, 1090], [745, 1085]] as P[]) for (let i = -1; i <= 1; i++) shape([[fx - 60 + i * 26, fy + 4 + i * 8], [fx - 112 + i * 30, fy + 26 + i * 18], [fx - 56 + i * 26, fy + 22 + i * 8]], '#ffffff', { over: 0 }, { w: 4 }, false);
    shape(potato(505, 1090, 96, 44, 8, 0.06), ORANGE, { angle: 0 });
    shape(potato(525, 940, 95, 125, 9, 0.05), ORANGE, { angle: 80 });
    // the neck, then the arm reaching forward with its claws and a small wing
    shape(shake([[505, 530], [450, 420], [445, 330], [545, 295], [605, 385], [625, 505]], 5), ORANGE, { angle: 70 });
    for (const [x, y] of [[600, 330], [620, 410]] as P[]) shape([[x - 6, y - 20], [x + 60, y - 30], [x + 10, y + 26]], SPIKE, { over: 0 }, { w: 4 }, false);
    // a wing grown from its forearm, spiked too
    for (const [t, u] of [[[300, 400], [262, 352]], [[255, 500], [200, 488]], [[300, 590], [252, 612]]] as [P, P][]) shape([[t[0] - 10, t[1] + 10], u, [t[0] + 12, t[1] - 6]], CREAM, { over: 0 }, { w: 4 }, false);
    shape([[525, 615], [470, 500], [400, 440], [300, 400], [345, 470], [255, 500], [335, 545], [300, 590], [420, 610]], WING, { angle: 40 }, {}, false);
    stroke([[525, 615], [470, 500], [400, 440], [300, 400]], { w: 7 });
    for (const t of [[255, 500], [300, 590]] as P[]) stroke([[400, 440], t], { w: 5 });
    shape(shake([[535, 600], [445, 620], [385, 652], [375, 692], [415, 702], [478, 672], [565, 652]], 4), ORANGE, { angle: 20 });
    for (const [a, b] of [[[384, 660], [330, 630]], [[376, 682], [318, 686]], [[392, 700], [344, 736]]] as [P, P][]) shape([[a[0], a[1] - 9], b, [a[0] + 4, a[1] + 9]], '#ffffff', { over: 0 }, { w: 4 }, false);
    // three long horns swept back, then the head: a long snout to the left, its mouth open
    shape([[548, 232], [640, 70], [608, 245]], CREAM, { over: 0 }, { w: 6 }, false);
    shape([[588, 252], [740, 130], [650, 275]], CREAM, { over: 0 }, { w: 6 }, false);
    shape([[500, 205], [540, 110], [545, 215]], CREAM, { over: 0 }, { w: 5 }, false);
    shape(shake([[602, 262], [590, 200], [520, 178], [440, 192], [372, 222], [292, 246], [262, 286], [290, 330], [380, 346], [482, 352], [572, 332]], 4), ORANGE, { angle: 60 });
    shape([[266, 300], [470, 318], [300, 346]], '#5a2430', { over: 0 }, { w: 5 }, false);
    for (const x of [300, 350, 402]) c.paper([[x, 304], [x + 10, 324], [x + 22, 307]], { w: 4 }, false);
    shape([[438, 262], [500, 248], [512, 270], [470, 282]], EYE, { over: 0 }, { w: 5 }, false);
    stroke([[418, 246], [522, 218]], { w: 11 });
    dot(298, 262, 7, 6);
    c.shine([[700, 640], [715, 720]], 7);
    // white-hot flames at the corners of its mouth, and its roar (only in battle)
    c.part('braises', { pivot: [470, 320], motion: 'flicker', period: 1.2, extra: true }, () => flame(475, 318, 50, 90, 60));
    c.part('souffle', { pivot: [262, 322], motion: 'flicker', period: 1.8, extra: true }, () => flame(262, 322, 160, 400, -110));
  },
} satisfies Fair;

/** The crayon drawing everything (dx, dy) further, to make room for what grew; the shapes keep the pencil drawing's coordinates. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]): P => [x + dx, y + dy]);
  return {
    ...c,
    shape: (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(m(pts), col, o, l, round),
    paper: (pts: P[], l?: Line, round?: boolean) => c.paper(m(pts), l, round),
    tint: (pts: P[], col: string, o?: Colour) => c.tint(m(pts), col, o),
    stroke: (pts: P[], l?: Line, round?: boolean) => c.stroke(m(pts), l, round),
    dot: (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x + dx, y + dy, rx, ry, col),
    shine: (pts: P[], w?: number) => c.shine(m(pts), w),
    star: (x: number, y: number, r: number, rot?: number) => c.star(x + dx, y + dy, r, rot),
    part: (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + dx, def.pivot[1] + dy] }, draw),
  };
}
