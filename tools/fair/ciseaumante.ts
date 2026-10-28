import type { Crayon, Fair, P } from '../redraws/crayon.ts';

/**
 * Ciseaumante's fair copy, Bug/Steel, the same drawing grown up: its scissor arms grown into big steel
 * shears, the blades twice as long and twice as broad with a dark sharp edge and a glint, bigger red handles, its
 * wings a third bigger with veins, a thicker body with shell rings round its abdomen, thicker legs ending in steel
 * claws, longer antennae, heavy brows over its eyes, and the gold star on its abdomen.
 */
export default {
  id: '048', slug: 'ciseaumante', seed: 48048, size: [1500, 1150], tilt: -3,
  draw(c) {
    // the pencil drawing's own coordinates, moved right to make room for the long blades
    const DX = 250;
    const m = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y]);
    const shape: Crayon['shape'] = (pts, ...r) => c.shape(m(pts), ...r);
    const tint: Crayon['tint'] = (pts, ...r) => c.tint(m(pts), ...r);
    const stroke: Crayon['stroke'] = (pts, ...r) => c.stroke(m(pts), ...r);
    const shine: Crayon['shine'] = (pts, ...r) => c.shine(m(pts), ...r);
    const dot = (x: number, y: number, rx: number, ry = rx, col?: string) => c.dot(x + DX, y, rx, ry, col);
    const part = (name: string, def: Parameters<Crayon['part']>[1], draw: () => void) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1]] }, draw);
    const { potato, shake, band } = c;
    const GREEN = '#5fbf4a', DARK = '#3d8d2e', LIGHT = '#bfe8b0', BLADE = '#a9b2c4', IRON = '#5f6a80', HANDLE = '#e24848', YEL = '#f2d132';
    // bigger see-through wings behind, their veins
    part('ailes', { pivot: [630, 520], motion: 'flap', amp: 8, period: 0.18, behind: true }, () => {
      shape(shake([[616, 452], [994, 162], [1217, 210], [1048, 439], [724, 581]], 4), LIGHT, { angle: 40, miss: 0.3, wash: 0.25 });
      for (const t of [[990, 220], [1110, 270], [1015, 380]] as P[]) stroke([[640, 470], t], { w: 4, col: DARK });
      shape(shake([[616, 520], [1035, 452], [1217, 587], [967, 689], [697, 662]], 4), LIGHT, { angle: 10, miss: 0.3, wash: 0.25 });
      for (const t of [[1035, 510], [1120, 590], [960, 640]] as P[]) stroke([[640, 545], t], { w: 4, col: DARK });
    });
    // thicker legs, ending in steel claws
    for (const [a, b, e] of [[[595, 700], [690, 900], [660, 1050]], [[545, 700], [500, 920], [540, 1060]], [[720, 740], [820, 850], [850, 1000]]] as [P, P, P][]) {
      shape([[e[0] - 10, e[1] - 6], [e[0] + 66, e[1] + 22], [e[0] + 6, e[1] + 14]], BLADE, { over: 0 }, { w: 4 }, false);
      shape(band([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b, e], 30, 18), GREEN, { angle: 60, over: 0 });
    }
    // the long body, thicker: the abdomen ringed like a shell, the thorax
    shape(shake([[516, 566], [702, 500], [882, 628], [978, 818], [864, 926], [654, 823]], 5), GREEN, { angle: 65 });
    for (const [a, b] of [[[650, 540], [600, 720]], [[765, 560], [690, 800]], [[870, 640], [785, 860]], [[945, 750], [870, 905]]] as [P, P][]) {
      stroke([a, [(a[0] + b[0]) / 2 + 16, (a[1] + b[1]) / 2], b], { w: 6, col: DARK });
    }
    c.star(810 + DX, 745, 50, 10);
    shape(potato(560, 565, 116, 185, 10, 0.04), GREEN, { angle: -70 });
    tint(potato(522, 610, 46, 120, 8, 0.05), LIGHT, { angle: -70 });
    /** One blade of the shears from the screw `s` along `u`: a broad spine tapering to a point, its sharp edge, a glint. */
    const blade = (s: P, u: P, L: number, side: number) => {
      const n: P = [-u[1] * side, u[0] * side];
      const at = (t: number, w: number): P => [s[0] + u[0] * t + n[0] * w, s[1] + u[1] * t + n[1] * w];
      shape([at(-55, 30), at(L * 0.14, 66), at(L * 0.62, 46), at(L, 4), at(L * 0.45, 0), at(-25, -10)], BLADE, { angle: (Math.atan2(u[1], u[0]) * 180) / Math.PI + 25, over: 0 }, {}, false);
      stroke([at(36, 7), at(L * 0.9, 7)], { w: 5, col: IRON });
      shine([at(L * 0.14, 50), at(L * 0.58, 36)], 7);
    };
    // the shears for arms: big red handles at the elbow, the lower blade of each pair snipping round the screw
    const shears = (s: P, tip: P, name: string, phase: number) => {
      const dx = tip[0] - s[0], dy = tip[1] - s[1], L = Math.hypot(dx, dy), u: P = [dx / L, dy / L], n: P = [-u[1], u[0]];
      for (const [k, w] of [[-58, 40], [-42, -42]] as P[]) {
        const h: P = [s[0] + u[0] * k + n[0] * w, s[1] + u[1] * k + n[1] * w];
        shape(potato(h[0], h[1], 64, 48, 9, 0.04), HANDLE, { angle: 30, over: 0 });
        shape(potato(h[0] - u[0] * 12, h[1] - u[1] * 12, 28, 19, 7, 0.05), '#f7f3ea', { over: 0, wash: 0 }, { w: 4 });
      }
      blade(s, u, L, 1);
      part(name, { pivot: s, motion: 'flap', amp: 12, period: 0.6, phase }, () => {
        blade(s, u, L * 0.97, -1);
        dot(s[0], s[1], 13, 13, IRON);
      });
    };
    shape(band([[525, 520], [470, 470], [438, 465]], 30, 24), GREEN, { angle: 30, over: 0 });
    shears([408, 460], [-92, 160], 'lame-haut', 0);
    shape(band([[545, 600], [482, 640], [452, 645]], 30, 24), GREEN, { angle: 30, over: 0 });
    shears([420, 643], [-180, 676], 'lame-bas', 0.5);
    // the triangle head: longer antennae, big eyes under heavy brows
    stroke([[500, 262], [455, 130], [380, 62]], { w: 5.5 });
    stroke([[565, 262], [632, 128], [725, 78]], { w: 5.5 });
    shape(shake([[420, 296], [632, 272], [540, 430]], 3), GREEN, { angle: 60 });
    shape(potato(470, 316, 44, 36, 8, 0.05), YEL, { over: 0 });
    shape(potato(584, 304, 44, 36, 8, 0.05), YEL, { over: 0 });
    dot(463, 322, 12, 13);
    dot(577, 310, 12, 13);
    dot(459, 315, 3.5, 3.5, '#ffffff');
    dot(573, 303, 3.5, 3.5, '#ffffff');
    stroke([[426, 278], [502, 300]], { w: 11 });
    stroke([[548, 293], [628, 264]], { w: 11 });
    stroke([[506, 382], [542, 372]], { w: 5 });
  },
} satisfies Fair;
