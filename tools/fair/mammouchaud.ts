import type { Colour, Crayon, Fair, Line, P } from '../redraws/crayon.ts';

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

/** A hand stencil like the oldest cave paintings: a pale hand, ochre blown round it (as on its drawing). */
function hand(c: Crayon, x: number, y: number, s: number, tilt: number, spray: string) {
  const rot = (px: number, py: number): P => {
    const a = (tilt * Math.PI) / 180;
    return [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s];
  };
  c.tint(c.potato(x, y - 10 * s, 70 * s, 78 * s, 10, 0.1), spray, { gap: 3, press: 1.15 });
  const palm = c.potato(x, y, 30 * s, 32 * s, 9, 0.05);
  const fingers: [number, number, number, number][] = [[-34, -8, -62, -34], [-16, -30, -26, -78], [2, -32, 4, -86], [18, -28, 30, -76], [30, -14, 50, -50]];
  for (const [ax, ay, bx, by] of fingers) c.paper(c.band([rot(ax, ay), rot(bx, by)], 15 * s, 12 * s), { w: 3 });
  c.paper(palm, { w: 3 });
}

/**
 * Mammouchaud's fair copy, Rock/Fighting, the same drawing grown up: its cooled-lava back heaved up into a
 * big volcano of jagged rock plates, lava glowing between them, a smoking crater on top and a second vent, much longer and thicker
 * tusks, four hand stencils on its flank instead of two (one blown in red, like a fighter's palm), a wilder crest of
 * hair, shaggier wool, heavier pillar legs, a bigger blazing tail tuft, a fiercer eye, and the gold star on its ear.
 * It faces left, like its drawing.
 */
export default {
  id: '077', slug: 'mammouchaud', seed: 7777, size: [1250, 1220], tilt: -2,
  draw(pen) {
    const c = moved(pen, 25, 135);
    const { shape, stroke, dot, band, potato, spikes } = c;
    const OCHRE = '#a8482a', DEEP = '#7c3219', ROCK = '#4f4650', CRACK = '#f7a12b', TUSK = '#f3e6c4', YEL = '#f7dc35', SMOKE = '#b8b2bd';
    // smoke rising from its crater and a second vent, behind
    c.part('fumee', { pivot: [800, 90], motion: 'flicker', period: 2.6, behind: true }, () => {
      for (const [x, y, r] of [[772, 40, 56], [742, -28, 46], [772, -84, 34], [948, 178, 50], [975, 112, 42], [955, 56, 32]] as const)
        shape(potato(x, y, r, r * 0.85, 9, 0.1), SMOKE, { gap: 3.6, press: 0.85, over: 0 }, { w: 4 });
    });
    // the bigger blazing tail tuft and the far legs, behind
    shape(band([[1010, 520], [1080, 515], [1120, 460]], 40, 26), OCHRE, { angle: 40 });
    shape([[1080, 500], [1075, 380], [1110, 425], [1122, 310], [1160, 410], [1178, 345], [1200, 470], [1160, 525]], CRACK, { angle: 80, press: 1.1 }, {}, false);
    shape([[1105, 495], [1112, 425], [1135, 455], [1150, 385], [1170, 490]], YEL, { over: 0 }, { w: 3.5 }, false);
    shape(band([[470, 760], [458, 960]], 140, 128), DEEP, { angle: 90 });
    shape(band([[880, 740], [905, 945]], 135, 125), DEEP, { angle: 90 });
    // the huge shaggy body, its back heaved up into a volcano, longer wool in zig-zags along its tummy
    const fringe = spikes([[1030, 730], [860, 815], [640, 838], [420, 800]], 5, 62);
    const body: P[] = [[370, 430], [450, 300], [580, 215], [690, 140], [770, 92], [850, 120], [940, 215], [1000, 330], [1045, 480], [1045, 630], ...fringe, [350, 712]];
    shape(body, OCHRE, { angle: 80, over: 0.55, press: 1.05 }, {}, false);
    // the volcano: lava glowing through, jagged plates of cooled lava over it, a crater on top
    c.tint([[478, 402], [505, 300], [600, 222], [700, 148], [772, 92], [850, 122], [948, 228], [1018, 400], [1022, 520], [870, 482], [640, 455]], CRACK, { gap: 3.2, press: 1.25 });
    const plates: P[][] = [
      [[700, 168], [742, 102], [800, 96], [838, 128], [812, 192], [728, 200]],
      [[562, 242], [640, 178], [690, 172], [716, 210], [676, 292], [596, 300]],
      [[846, 132], [904, 192], [958, 270], [898, 318], [822, 270], [820, 200]],
      [[726, 210], [810, 204], [814, 272], [768, 328], [690, 298]],
      [[472, 348], [522, 276], [592, 308], [636, 304], [598, 386], [506, 400]],
      [[608, 392], [646, 308], [688, 306], [762, 338], [738, 420], [644, 446]],
      [[774, 338], [824, 280], [898, 326], [930, 408], [858, 458], [760, 426]],
      [[908, 324], [962, 282], [998, 342], [1012, 428], [944, 410]],
      [[870, 470], [938, 420], [1010, 440], [1018, 506], [950, 520]],
    ];
    for (const pl of plates) shape(c.grow(pl, -7), ROCK, { angle: 30, over: 0.3, press: 1.05 }, {}, false);
    shape(potato(772, 100, 44, 15, 9, 0.05), CRACK, { over: 0, press: 1.25 }, { w: 5 });
    stroke([[745, 100], [772, 92], [800, 101]], { w: 5, col: YEL });
    shape(potato(946, 236, 24, 11, 8, 0.05), CRACK, { over: 0, press: 1.25 }, { w: 4 });
    // four hand stencils on its flank, one blown in red like a fighter's palm
    hand(c, 640, 590, 1.0, -14, '#e8b04a');
    hand(c, 800, 570, 0.95, 8, '#f3e6c4');
    hand(c, 950, 620, 0.85, 20, '#e2423a');
    hand(c, 700, 735, 0.7, -4, '#f3e6c4');
    // the near legs like heavier pillars, big toenails
    shape(band([[560, 780], [555, 985]], 150, 142), OCHRE, { angle: 90 });
    shape(band([[960, 760], [980, 975]], 145, 138), OCHRE, { angle: 90 });
    for (const [x, y] of [[510, 985], [555, 992], [600, 985], [930, 975], [978, 982], [1026, 975]] as const) c.paper(potato(x, y, 18, 13, 7, 0.08), { w: 3.5 });
    // the far tusk, longer, behind the trunk
    shape(band([[335, 590], [236, 692], [140, 690], [74, 605], [64, 505]], 68, 14), TUSK, { angle: 60, over: 0 });
    // the domed head turned left, a big ear, a wilder crest of hair
    shape(potato(400, 420, 200, 190, 12, 0.04), OCHRE, { angle: 70, over: 0.5 });
    shape(spikes([[272, 275], [350, 200], [450, 205], [525, 258]], 4, 58), DEEP, { over: 0 }, {}, false);
    shape(potato(505, 462, 64, 88, 9, 0.06), DEEP, { angle: 90, over: 0.2 });
    c.star(505, 455, 42, 8);
    // the trunk raised and curled back over its head, spitting lava onto its own back
    c.part('trompe', { pivot: [250, 500], motion: 'swing', amp: 4, period: 2.4 }, () => {
      shape(band([[250, 500], [180, 420], [158, 320], [190, 222], [262, 160], [355, 134], [428, 144]], 104, 50), OCHRE, { angle: 20, over: 0.3 });
      for (const [x, y, dx, dy] of [[150, 400, 56, 0], [140, 330, 56, -6], [172, 248, 46, 24], [228, 186, 32, 40]] as const) stroke([[x, y], [x + dx, y + dy]], { w: 4 });
      shape(band([[428, 144], [525, 114], [612, 158], [652, 240]], 68, 48), CRACK, { angle: 30, over: 0.2, press: 1.1 });
      stroke([[442, 142], [524, 128], [598, 170], [634, 230]], { w: 5, col: YEL });
      for (const [x, y, r] of [[652, 282, 48], [592, 300, 32], [712, 296, 32], [655, 345, 24]] as const) shape(potato(x, y, r, r * 0.8, 8, 0.12), CRACK, { over: 0, press: 1.1 }, { w: 4 });
      for (const [x, y] of [[566, 112], [626, 128], [690, 222]] as const) dot(x, y, 9, 9, CRACK);
    });
    // the near tusk, much longer and thicker, curving up and forward to a sharp point
    shape(band([[372, 598], [262, 735], [120, 752], [28, 668], [8, 505]], 92, 14), TUSK, { angle: 60, over: 0.1 });
    c.shine([[300, 672], [225, 722], [140, 734]], 8);
    // a fiercer eye under a heavier brow, a grim mouth
    c.paper(potato(340, 424, 28, 22, 8, 0.05));
    dot(330, 428, 13, 14);
    dot(324, 421, 4, 4.5, '#ffffff');
    stroke([[282, 378], [340, 392], [402, 368]], { w: 13 });
    stroke([[298, 548], [340, 562], [382, 545]], { w: 6 });
  },
} satisfies Fair;
