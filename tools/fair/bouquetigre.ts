import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Bouquétigre's fair copy, Grass/Fighting, the same drawing grown up: its flower opened into a huge double
 * bloom half as big again, six big saw-edged leaves fanning out behind it, a mane of leaves round its head, a
 * second flower blooming on its forehead, a bigger and stronger body on thick legs with long claws, tiger stripes
 * among its spots, longer thicker vines (the forward one ending in a big leaf blade, the other in a big bud), fangs
 * bared, and the gold star on its side. It faces right, like its drawing.
 */
export default {
  id: '024', slug: 'bouquetigre', seed: 24024, size: [1560, 1340], tilt: 3,
  draw(c0) {
    const c = moved(c0, 150, 250);
    const { shape, stroke, dot, spikes, potato, shake, band } = c;
    const WHITE = '#d6ddf2', SPOT = '#3554c8', PINK = '#f0609e', ROSE = '#f79bc6', YEL = '#f4cf34', GREEN = '#6cc84a', DARK = '#3d8d2e', RED = '#dc3038';
    /** A big saw-edged leaf from its base to its tip, with its vein. */
    const leaf = (base: P, tip: P, width: number, col = GREEN) => {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const s1: P[] = [], s2: P[] = [];
      for (let i = 0; i <= 4; i++) {
        const t = i / 4, w = width * Math.sin(Math.PI * Math.min(0.92, 0.08 + t * 0.84));
        s1.push([base[0] + dx * t + nx * w, base[1] + dy * t + ny * w]);
        s2.push([base[0] + dx * t - nx * w, base[1] + dy * t - ny * w]);
      }
      const tooth = Math.max(26, width * 0.32);
      shape([...spikes(s1, 2, tooth).slice(0, -1), tip, ...spikes(s2.reverse(), 2, tooth)], col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 60 }, {}, false);
      stroke([base, [base[0] + dx * 0.88, base[1] + dy * 0.88]], { w: 5, col: DARK });
    };
    /** A vine along a path, ending in a big bud or a leaf blade. */
    const vine = (path: P[], w: number, end: 'bud' | 'blade') => {
      shape(band(path, w * 2, w * 1.6), GREEN, { angle: 40 });
      const t = path[path.length - 1], s = path[path.length - 2];
      if (end === 'bud') {
        shape(potato(t[0], t[1], 62, 54, 8, 0.08), DARK, { angle: 70 });
        for (const k of [-1, 0, 1]) shape([[t[0] + k * 26 - 18, t[1] - 40], [t[0] + k * 34, t[1] - 100 + Math.abs(k) * 22], [t[0] + k * 26 + 18, t[1] - 40]], PINK, { over: 0 }, {}, false);
      } else {
        const dx = t[0] - s[0], dy = t[1] - s[1], l = Math.hypot(dx, dy);
        leaf(t, [t[0] + (dx / l) * 270, t[1] + (dy / l) * 270], 72);
      }
    };
    const stump = (x: number, top: number, bottom: number, w: number) => {
      shape(shake([[x - w, top], [x + w, top], [x + w * 1.1, bottom - 25], [x + w * 0.75, bottom], [x - w * 0.75, bottom], [x - w * 1.1, bottom - 25]], 6), WHITE, { angle: 85 });
      for (let i = -1; i <= 1; i++) shape([[x + i * w * 0.55 - 12, bottom - 6], [x + i * w * 0.8 + 6, bottom + 62], [x + i * w * 0.55 + 14, bottom - 4]], '#ffffff', { over: 0 }, { w: 4 }, false);
    };
    /** The body, grown stronger round its middle. */
    const big = (pts: P[]) => pts.map(([x, y]): P => [580 + (x - 580) * 1.1, 640 + (y - 640) * 1.1]);

    // six big leaves fanning out behind the bloom
    for (const [deg, len] of [[-172, 560], [-142, 590], [-112, 600], [-76, 600], [-44, 580], [-14, 520]] as [number, number][]) {
      const a = (deg * Math.PI) / 180;
      leaf([560, 400], [560 + Math.cos(a) * len, 400 + Math.sin(a) * len * 0.9], 118);
    }
    // the back legs, then the body over them, bigger, its spots and tiger stripes
    stump(350, 700, 885, 74);
    stump(710, 700, 885, 74);
    shape(shake(big([[240, 580], [370, 455], [620, 425], [850, 470], [930, 620], [880, 770], [690, 835], [430, 838], [265, 765]]), 10), WHITE, { angle: 25 });
    for (const [x, y, s] of [[320, 640, 1.1], [430, 770, 0.9], [560, 705, 1.2], [800, 650, 0.9], [280, 770, 0.8]] as [number, number, number][]) {
      shape(shake([[x - 24 * s, y - 22 * s], [x + 24 * s, y - 25 * s], [x + 26 * s, y + 22 * s], [x - 22 * s, y + 24 * s]], 4), SPOT, { over: 0 }, { w: 5 }, false);
    }
    for (const [x, y] of [[290, 555], [240, 640], [890, 600], [900, 700], [700, 470]] as P[]) shape([[x - 45, y - 15], [x + 50, y - 4], [x + 55, y + 7], [x - 34, y + 11]], SPOT, { over: 0 }, { w: 4 }, false);
    c.star(565, 605, 48, -6);
    // the front legs, thick, long claws
    stump(470, 735, 940, 88);
    stump(810, 735, 935, 86);
    // the huge double bloom: back petals, front petals, a ring of pink inside, the yellow heart
    const [fx, fy] = [560, 335];
    for (const deg of [-90, -118, -62, -146, -34, -172, -8]) {
      const a = (deg * Math.PI) / 180, cx = fx + Math.cos(a) * 240, cy = fy + Math.sin(a) * 190;
      const petal = potato(0, 0, 205, 128, 9, 0.06).map(([x, y]) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)] as P);
      shape(petal, PINK, { angle: deg + 60 });
      stroke([[fx + Math.cos(a) * 140, fy + Math.sin(a) * 120], [fx + Math.cos(a) * 350, fy + Math.sin(a) * 290]], { w: 5, col: '#b03070' });
    }
    for (const deg of [-90, -130, -50, -170, -10]) {
      const a = (deg * Math.PI) / 180, cx = fx + Math.cos(a) * 135, cy = fy + Math.sin(a) * 112;
      shape(potato(cx, cy, 112, 78, 8, 0.06), ROSE, { angle: deg + 60 });
    }
    shape(potato(fx, fy, 128, 100, 10, 0.05), YEL, { angle: 20 });
    for (const [x, y] of [[505, 315], [560, 293], [615, 320], [530, 367], [592, 365], [470, 345], [650, 350]] as P[]) dot(x, y, 9, 9, '#e08a12');
    // a mane of leaves round its head
    [-176, -148, -120, -94, -66, 172, 146].forEach((deg, i) => {
      const a = (deg * Math.PI) / 180;
      leaf([955 + Math.cos(a) * 80, 570 + Math.sin(a) * 70], [955 + Math.cos(a) * 300, 570 + Math.sin(a) * 270], 62, i % 2 ? '#58b23c' : GREEN);
    });
    // the vines, longer and thicker: one hangs down to a big bud, one whips forward over its head to a leaf blade
    c.part('liane-bas', { pivot: [470, 480], motion: 'swing', amp: 4, period: 2.2 }, () => vine([[470, 480], [390, 590], [340, 720], [300, 860], [250, 990]], 28, 'bud'));
    c.part('liane', { pivot: [660, 470], motion: 'swing', amp: 6, period: 1.6 }, () => vine([[660, 470], [780, 300], [940, 200], [1080, 190], [1170, 110]], 30, 'blade'));
    // the head at the front, turned right: cat ears, a flower blooming on its forehead
    shape(shake([[835, 470], [850, 310], [930, 450]], 4), WHITE, { angle: 80 }, {}, false);
    shape(shake([[970, 445], [1050, 300], [1065, 470]], 4), WHITE, { angle: 80 }, {}, false);
    shape(potato(955, 570, 165, 140, 10, 0.05), WHITE, { angle: 35 });
    for (const deg of [-90, -150, -30, 150, 30]) {
      const a = (deg * Math.PI) / 180;
      shape(potato(955 + Math.cos(a) * 44, 446 + Math.sin(a) * 33, 38, 25, 7, 0.06), PINK, { over: 0 }, { w: 4 });
    }
    shape(potato(955, 446, 22, 18, 7, 0.06), YEL, { over: 0 }, { w: 3 });
    // fierce red eyes under heavy brows, fangs bared
    shape(shake([[875, 532], [948, 556], [888, 582]], 3), RED, { over: 0 }, { w: 5 }, false);
    shape(shake([[995, 554], [1052, 524], [1048, 574]], 3), RED, { over: 0 }, { w: 5 }, false);
    dot(905, 556, 7, 9);
    dot(1030, 552, 7, 9);
    stroke([[860, 505], [955, 540]], { w: 12 });
    stroke([[985, 540], [1068, 498]], { w: 12 });
    dot(955, 602, 8, 6);
    shape([[868, 630], [955, 654], [1044, 626], [1012, 680], [955, 694], [892, 672]], '#a3123a', { over: 0 }, { w: 6 });
    c.paper([[898, 636], [913, 682], [930, 642]], { w: 4.5 }, false);
    c.paper([[980, 643], [996, 686], [1012, 634]], { w: 4.5 }, false);
    for (const [x, y] of [[1052, 600], [1062, 620]] as P[]) stroke([[x, y], [x + 75, y - 8]], { w: 4 });
    c.shine([[880, 460], [910, 445]], 6);
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
