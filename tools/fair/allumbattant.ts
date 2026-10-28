import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';
import { flame } from '../redraws/allumou.ts';

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
 * Allumbattant's fair copy, Fire/Steel, the same drawing grown up: the little flames on its head blaze up
 * into a mane of fire more than twice as tall, swept back, with a white-hot heart; its striker-strip gloves twice as
 * big, bound with riveted steel cuffs, flames and steel sparks flying off the near one; its wooden body broadened
 * into a fighter's V of shoulders and chest; thicker arms and legs, a bigger matchbox for shorts, heavier brows over
 * gritted teeth, and the gold star on its chest. It faces left, like its drawing.
 */
export default {
  id: '081', slug: 'allumbattant', seed: 8181, size: [1270, 1430], tilt: -2,
  draw(pen) {
    const c = moved(pen, 175, 265);
    const { shape, stroke, dot, band, potato } = c;
    const WOOD = '#e2c288', GRAIN = '#a9814a', RED = '#c22d27', DARK = '#7f1d1a', ORANGE = '#f7a12b', YEL = '#f7dc35', HOT = '#fff6c8', STRIKE = '#6b4a3a';
    const BOX = '#3f6fc6', LABEL = '#f2c43a', STEEL = '#b9c3d3', IRON = '#5f6a80', SHOE = '#5a4030';
    /** A tongue of fire from `base`, pointing `deg` (0 up, 90 right), its tip swept by `lean` (share of its height). */
    const tongue = (base: P, deg: number, w: number, h: number, lean: number): P[] => {
      const a = (deg * Math.PI) / 180;
      return flame(0, 0, w, h, lean * h).map(([x, y]) => [base[0] + x * Math.cos(a) - y * Math.sin(a), base[1] + x * Math.sin(a) + y * Math.cos(a)] as P);
    };
    /** A boxing glove of match-striker paper, bound to the arm by a steel cuff with rivets. */
    const glove = (x: number, y: number, r: number, cuff: P) => {
      const back: P = [cuff[0] + (cuff[0] - x) * 0.25, cuff[1] + (cuff[1] - y) * 0.25], mid: P = [x + (cuff[0] - x) * 0.55, y + (cuff[1] - y) * 0.55];
      shape(band([back, mid], r * 0.8, r * 0.8), STEEL, { over: 0 }, {}, false);
      const dx = mid[0] - back[0], dy = mid[1] - back[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      stroke([[back[0] + dx * 0.4 + nx * r * 0.4, back[1] + dy * 0.4 + ny * r * 0.4], [back[0] + dx * 0.4 - nx * r * 0.4, back[1] + dy * 0.4 - ny * r * 0.4]], { w: 7, col: IRON });
      for (const k of [-0.24, 0, 0.24]) dot(back[0] + dx * 0.16 + nx * r * k, back[1] + dy * 0.16 + ny * r * k, 8, 8, IRON);
      shape(potato(x, y, r, r * 0.9, 11, 0.04), STRIKE, { angle: 40, over: 0.4, press: 1.1 });
      for (let k = 0; k < 26; k++) dot(x + c.j(r * 1.3), y + c.j(r * 1.2), r / 26, r / 26, '#a88a72');
      stroke([[x - r * 0.6, y + r * 0.35], [x + r * 0.2, y + r * 0.6]], { w: 7, col: '#3e2a20' });
      c.shine([[x - r * 0.45, y - r * 0.5], [x - r * 0.1, y - r * 0.72]], 10);
    };
    /** A white-hot steel spark, a four-pointed glint. */
    const spark = (x: number, y: number, r: number) =>
      shape([[x, y - r], [x + r * 0.24, y - r * 0.24], [x + r, y], [x + r * 0.24, y + r * 0.24], [x, y + r], [x - r * 0.24, y + r * 0.24], [x - r, y], [x - r * 0.24, y - r * 0.24]], HOT, { over: 0, wash: 1 }, { w: 5 }, false);
    // the mane of fire, more than twice as tall, swept back from its head, a white-hot heart
    c.part('crete', { pivot: [450, 250], motion: 'swing', amp: 3, period: 0.6, behind: true }, () => {
      const mane = [[-125, 15, 150, 330, 0.25], [-100, 28, 175, 410, 0.3], [-75, 42, 185, 440, 0.3], [-50, 58, 180, 420, 0.3], [-25, 72, 170, 380, 0.25], [0, 88, 150, 320, 0.2], [25, 104, 130, 250, 0.15]] as const;
      const at = (t: number): P => [430 + Math.cos((t * Math.PI) / 180) * 160, 300 + Math.sin((t * Math.PI) / 180) * 160];
      for (const [t, d, w, h, l] of mane) shape(tongue(at(t), d, w, h, l), ORANGE, { angle: d - 30, over: 0.3, press: 1.1 }, {}, false);
      for (const [t, d, w, h, l] of mane.slice(0, 6)) shape(tongue(at(t), d, w * 0.55, h * 0.62, l), YEL, { over: 0, press: 1.1 }, { w: 4.5 }, false);
      for (const [t, d, w, h, l] of mane.slice(1, 5)) shape(tongue(at(t), d, w * 0.28, h * 0.34, l), HOT, { over: 0, wash: 1 }, { w: 4 }, false);
    });
    // the far leg and the far glove up by its face, behind
    shape(band([[455, 840], [395, 955], [350, 1065]], 96, 84), WOOD, { angle: 70, over: 0 });
    shape(potato(312, 1088, 102, 44, 7, 0.06), SHOE, { over: 0 });
    shape(band([[420, 540], [325, 592], [268, 548]], 88, 80), WOOD, { angle: 60, over: 0 });
    glove(205, 468, 135, [282, 556]);
    // the wooden body broadened into a fighter's V of shoulders and chest, grain lines, the star on its chest
    shape([[330, 472], [420, 426], [560, 424], [652, 466], [662, 560], [612, 680], [582, 802], [418, 806], [392, 690], [345, 582]], WOOD, { angle: 90, over: 0.4 });
    stroke([[430, 500], [452, 640], [470, 770]], { w: 4.5, col: GRAIN });
    stroke([[575, 520], [552, 660], [538, 780]], { w: 4.5, col: GRAIN });
    c.star(528, 712, 46, 8);
    // the bigger matchbox shorts: blue, a yellow label, striker strips on the sides
    shape([[368, 770], [628, 758], [642, 925], [360, 932]], BOX, { angle: 0, over: 0.3 }, {}, false);
    shape([[428, 796], [574, 790], [576, 892], [430, 897]], LABEL, { over: 0 }, { w: 4.5 }, false);
    shape(flame(502, 880, 66, 74, 8), '#e2423a', { over: 0 }, { w: 4 }, false);
    shape([[360, 782], [390, 780], [392, 930], [360, 932]], STRIKE, { over: 0 }, { w: 4 }, false);
    shape([[602, 760], [628, 758], [642, 925], [610, 927]], STRIKE, { over: 0 }, { w: 4 }, false);
    // the near leg, thicker, planted
    shape(band([[560, 920], [615, 1012], [648, 1084]], 104, 90), WOOD, { angle: 110, over: 0 });
    shape(potato(690, 1102, 112, 46, 7, 0.06), SHOE, { over: 0 });
    // the charred red head, the far side darker
    shape(potato(430, 300, 185, 180, 12, 0.04), RED, { angle: 75, over: 0.55, press: 1.05 });
    c.tint([[520, 168], [606, 280], [596, 405], [522, 466], [562, 320]], DARK, { gap: 3.6 });
    // a fiercer face, shifted left: heavier brows, gritted teeth
    c.paper(potato(340, 302, 26, 19, 8, 0.05));
    c.paper(potato(445, 294, 30, 22, 8, 0.05));
    dot(334, 306, 12, 12);
    dot(439, 298, 14, 14);
    dot(329, 300, 4, 4, '#ffffff');
    dot(433, 292, 5, 5, '#ffffff');
    stroke([[292, 266], [372, 292]], { w: 13 });
    stroke([[408, 284], [496, 248]], { w: 13.5 });
    c.paper([[312, 372], [428, 376], [420, 410], [322, 406]], { w: 5.5 });
    for (const x of [340, 368, 396]) stroke([[x, 376], [x, 406]], { w: 3.5 });
    stroke([[316, 390], [424, 393]], { w: 3.5 });
    c.shine([[300, 190], [350, 160]], 8);
    // the near arm, thicker, punching forward to the left: a glove twice as big, flames and steel sparks flying off it
    c.part('poing', { pivot: [560, 520], motion: 'peek', to: [10, 0], period: 1.5 }, () => {
      shape(band([[560, 520], [430, 612], [300, 662]], 100, 88), WOOD, { angle: 160, over: 0 });
      for (const [b, d, w, h, l] of [[[20, 590], -62, 90, 170, -0.2], [[10, 760], -112, 76, 140, 0.2], [[70, 520], -28, 70, 120, -0.15]] as const)
        shape(tongue([b[0], b[1]], d, w, h, l), ORANGE, { over: 0, press: 1.1 }, { w: 4.5 }, false);
      glove(150, 672, 165, [302, 662]);
      spark(-30, 690, 44);
      spark(30, 505, 32);
    });
  },
} satisfies Fair;
