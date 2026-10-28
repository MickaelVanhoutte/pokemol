import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';
import { star } from '../redraws/lumignon.ts';

/** The same pen moved by (dx, dy) on the sheet, so the drawing keeps its own coordinates with room round it. */
function moved(c: Crayon, dx: number, dy: number): Crayon {
  const m = (pts: P[]) => pts.map(([x, y]) => [x + dx, y + dy] as P);
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

/**
 * Projétoile's fair copy, Electric/Dark, the same drawing grown up: its cape of night sky spread out far past
 * its raised hands like great bat wings, pointed at the tips, cut into deep points all down their edges and along the
 * hem, folds running out from its hands; more and bigger stars on it, a big bright galaxy swirling on one wing and a
 * bigger moon on the other; its dome crown much taller, more stars on it, its knob grown into a big star on top; a
 * slightly bigger body, a bigger star plug on its cord tail, violet eyes narrowed under sly brows, a smirk, and the
 * gold star on its body. It faces left, like its drawing.
 */
export default {
  id: '083', slug: 'projetoile', seed: 8383, size: [1480, 1420], tilt: -2,
  draw(pen) {
    const c = moved(pen, 160, 190);
    const { shape, stroke, dot, band, potato } = c;
    const NIGHT = '#2f3a7a', DEEP = '#1f2656', FOLD = '#4b5cb0', GLOW = '#fbe58a', WARM = '#f7c650', YEL = '#f7dc35', MOON = '#f2c43a', PSY = '#c27ae6', ROSE = '#f59ae0';
    const big = (pts: P[]): P[] => pts.map(([x, y]) => [535 + (x - 535) * 1.1, 520 + (y - 520) * 1.1]);
    // the cape spread out like great bat wings past its raised hands, deep points down their edges and along the hem
    const cape: P[] = [
      [430, 470], [290, 375], [205, 300], [60, 175], [-110, 70],
      [10, 290], [-125, 420], [15, 560], [-110, 700], [30, 830], [-60, 990],
      [110, 960], [200, 1150], [320, 1025], [430, 1165], [550, 1045], [665, 1170], [780, 1045], [892, 1155], [1010, 965],
      [1120, 990], [1060, 830], [1200, 700], [1080, 560], [1225, 420], [1095, 290], [1270, 50],
      [1110, 160], [958, 290], [850, 360], [670, 470],
    ];
    shape(cape, NIGHT, { angle: 70, over: 0.55, press: 1.05 }, {}, false);
    c.tint([[720, 480], [958, 300], [1110, 160], [1270, 50], [1095, 290], [1225, 420], [1080, 560], [1200, 700], [1060, 830], [1120, 990], [1010, 965], [880, 650]], DEEP, { gap: 3.6 });
    // folds running out from its hands to the points of the wings
    for (const [a, b] of [[[205, 300], [-125, 420]], [[205, 300], [-110, 700]], [[230, 380], [-60, 990]], [[958, 290], [1225, 420]], [[958, 290], [1200, 700]], [[930, 380], [1120, 990]]] as [P, P][]) stroke([a, b], { w: 7, col: FOLD });
    // a big bright galaxy swirling on one wing
    c.tint(potato(180, 715, 140, 104, 10, 0.08), '#7a52c8', { gap: 3, angle: -20, press: 1.3 });
    const arm = (turn: number): P[] => Array.from({ length: 16 }, (_, i) => {
      const a = turn + i * 0.4, r = 10 + i * 7.6;
      return [180 + Math.cos(a) * r * 1.25, 715 + Math.sin(a) * r * 0.85];
    });
    stroke(arm(0), { w: 22, col: ROSE });
    stroke(arm(Math.PI), { w: 22, col: PSY });
    shape(potato(180, 715, 26, 21, 8, 0.05), '#ffffff', { over: 0, wash: 1 }, { w: 4 });
    // a bigger moon on the other
    shape([[928, 772], [1000, 664], [1120, 650], [1040, 702], [1012, 790], [1052, 878], [1128, 908], [1010, 906], [946, 856]], MOON, { over: 0, press: 1.1 }, { w: 5.5 });
    // more and bigger stars twinkling on it
    c.part('etoiles', { pivot: [570, 700], motion: 'flicker', period: 2.4 }, () => {
      for (const [x, y, r, t] of [[40, 290, 42, 0.1], [-40, 545, 34, -0.3], [265, 570, 30, 0.2], [70, 940, 40, 0.4], [290, 930, 30, -0.1], [-10, 1000, 24, 0.3], [1105, 330, 42, 0.2], [1130, 560, 34, -0.1], [830, 610, 30, 0.3], [880, 960, 42, 0.3], [1110, 1000, 30, 0.1], [770, 1080, 26, 0.5]] as const)
        shape(star(x, y, r, t), YEL, { over: 0, press: 1.1 }, { w: 4.5 }, false);
    });
    // the cord tail, a bigger star plug at its end
    c.part('cordon', { pivot: [680, 1050], motion: 'swing', amp: 6, period: 2 }, () => {
      stroke([[680, 1050], [800, 1135], [960, 1160], [1080, 1120]], { w: 8 });
      shape(star(1128, 1100, 62, 0.3), YEL, { over: 0, press: 1.15 }, { w: 5.5 }, false);
      dot(1116, 1084, 7, 7, '#ffffff');
    });
    // the far arm raised, holding up the cape
    shape(band([[420, 610], [300, 500], [222, 345]], 56, 48), GLOW, { angle: 60, over: 0 });
    shape(potato(210, 320, 38, 36, 8, 0.06), GLOW, { over: 0 });
    // the glowing body, a little bigger, warmer at the bottom, two feet, the gold star
    shape(potato(425, 1112, 70, 32, 8, 0.06), WARM, { over: 0 });
    shape(big([[400, 520], [650, 515], [710, 700], [700, 900], [630, 1025], [460, 1040], [380, 940], [360, 720]]), GLOW, { angle: 80, over: 0.35 });
    c.tint(big([[370, 880], [705, 870], [630, 1020], [460, 1035]]), WARM, { gap: 3.6, angle: 80 });
    c.star(565, 790, 50, 6);
    shape(potato(610, 1118, 76, 34, 8, 0.06), WARM, { over: 0 });
    // the near arm raised the other way
    shape(band([[665, 610], [810, 490], [945, 312]], 62, 50), GLOW, { angle: 120, over: 0 });
    shape(potato(958, 288, 41, 39, 8, 0.06), GLOW, { over: 0 });
    // the round glowing head
    shape(potato(470, 432, 170, 142, 12, 0.04), GLOW, { angle: 75, over: 0.3 });
    // the dome crown, much taller: night blue, more stars, a ring of little moons, its knob grown into a big star
    shape(band([[495, 40], [498, -40]], 30, 22), MOON, { over: 0 }, { w: 5 });
    shape(star(500, -95, 78, 0.12), YEL, { over: 0, press: 1.15 }, { w: 6 }, false);
    dot(482, -118, 9, 9, '#ffffff');
    shape([[296, 350], [298, 190], [380, 82], [500, 30], [620, 74], [692, 196], [702, 300], [672, 356], [480, 374]], NIGHT, { angle: 70, over: 0.5 });
    for (const [x, y, r, t] of [[380, 180, 32, 0.1], [510, 110, 30, -0.2], [612, 200, 32, 0.3], [470, 250, 26, 0.4], [360, 300, 22, -0.3], [600, 310, 20, 0.2], [430, 100, 18, 0.5]] as const) shape(star(x, y, r, t), YEL, { over: 0 }, { w: 4 }, false);
    shape(band([[284, 354], [480, 384], [688, 354]], 42, 42), DEEP, { angle: 10, over: 0 });
    for (const [x, y] of [[336, 364], [412, 376], [490, 382], [568, 376], [644, 364]] as const) shape(potato(x, y, 14, 14, 8, 0.05), GLOW, { over: 0 }, { w: 3 });
    c.shine([[330, 300], [340, 200]], 8);
    // violet eyes narrowed under sly brows, a smirk
    c.paper(potato(358, 456, 32, 30, 8, 0.05));
    c.paper(potato(470, 448, 36, 34, 8, 0.05));
    dot(353, 462, 18, 20, PSY);
    dot(464, 454, 20, 22, PSY);
    dot(353, 462, 8, 10);
    dot(464, 454, 9, 11);
    dot(346, 452, 5, 6, '#ffffff');
    dot(457, 443, 6, 7, '#ffffff');
    stroke([[314, 410], [398, 433]], { w: 13 });
    stroke([[430, 430], [522, 396]], { w: 13 });
    stroke([[370, 528], [420, 545], [468, 526], [488, 506]], { w: 6.5 });
  },
} satisfies Fair;
