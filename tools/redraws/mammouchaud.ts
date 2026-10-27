import type { Crayon, P, Redraw } from './crayon.ts';

/** A hand stencil like the oldest cave paintings: a pale hand, ochre blown round it. */
function hand(c: Crayon, x: number, y: number, s: number, tilt: number, spray: string) {
  const rot = (px: number, py: number): P => {
    const a = (tilt * Math.PI) / 180;
    return [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s];
  };
  c.tint(c.potato(x, y - 10 * s, 70 * s, 78 * s, 10, 0.1), spray, { gap: 3, press: 1.1 });
  const palm = c.potato(x, y, 30 * s, 32 * s, 9, 0.05);
  const fingers: [number, number, number, number][] = [[-34, -8, -62, -34], [-16, -30, -26, -78], [2, -32, 4, -86], [18, -28, 30, -76], [30, -14, 50, -50]];
  for (const [ax, ay, bx, by] of fingers) c.paper(c.band([rot(ax, ay), rot(bx, by)], 15 * s, 12 * s), { w: 2.5 });
  c.paper(palm, { w: 2.5 });
}

/**
 * Ocrinou grown into a huge mammoth turned to the left, drawn in charcoal: a cooled-lava back of dark rock plates
 * with glowing cracks and smoke rising off it, long curved tusks, its trunk raised high, shaggy ochre wool, two
 * hand stencils on its flank like the oldest cave paintings, and a blazing tail tuft.
 */
export default {
  id: '077', slug: 'mammouchaud', seed: 7701, size: [1200, 1050], tilt: -2, felt: true,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const OCHRE = '#a8482a', DEEP = '#7c3219', ROCK = '#4f4650', CRACK = '#f7a12b', TUSK = '#f3e6c4', YEL = '#f7dc35', SMOKE = '#b8b2bd';
    // smoke rising off its back in two curls, behind
    for (const [x, y, r] of [[730, 215, 48], [705, 155, 40], [735, 100, 32], [880, 280, 46], [905, 218, 38], [888, 162, 30]] as const)
      shape(potato(x, y, r, r * 0.85, 9, 0.1), SMOKE, { gap: 3.6, press: 0.85, over: 0 }, { w: 3.5 });
    // the blazing tail tuft and the far legs, behind
    shape(band([[1000, 520], [1070, 520], [1110, 470]], 34, 22), OCHRE, { angle: 40 });
    shape([[1080, 500], [1080, 400], [1110, 440], [1125, 350], [1160, 430], [1170, 380], [1185, 470], [1150, 520]], CRACK, { angle: 80, press: 1.1 }, {}, false);
    shape([[1110, 495], [1118, 440], [1135, 465], [1148, 420], [1158, 490]], YEL, { over: 0 }, { w: 3 }, false);
    shape(band([[470, 760], [460, 950]], 120, 110), DEEP, { angle: 90 });
    shape(band([[880, 740], [905, 930]], 115, 108), DEEP, { angle: 90 });
    // the huge shaggy body, wool hanging in zig-zags all along its tummy
    const fringe = spikes([[1010, 720], [860, 800], [640, 820], [430, 790]], 4, 44);
    const body: P[] = [[380, 420], [470, 300], [640, 250], [820, 270], [960, 350], [1030, 480], [1030, 620], ...fringe, [360, 700]];
    shape(body, OCHRE, { angle: 80, over: 0.55, press: 1.05 }, {}, false);
    // the back: plates of cooled lava, cracks still glowing
    const plates: P[][] = [
      [[480, 330], [560, 270], [640, 262], [650, 340], [560, 380]],
      [[650, 262], [760, 262], [800, 330], [700, 370], [655, 345]],
      [[805, 290], [900, 310], [970, 380], [880, 420], [810, 365]],
      [[560, 385], [660, 352], [705, 378], [680, 440], [580, 448]],
      [[712, 378], [805, 370], [875, 425], [800, 470], [700, 450]],
    ];
    for (const pl of plates) shape(pl, ROCK, { angle: 30, over: 0.3, press: 1.05 }, { w: 4 }, false);
    stroke([[560, 380], [650, 343], [702, 372], [808, 368], [878, 422]], { w: 4.5, col: CRACK });
    stroke([[645, 265], [652, 340]], { w: 4, col: CRACK });
    stroke([[800, 330], [808, 366]], { w: 4, col: CRACK });
    // two hand stencils on its flank
    hand(c, 690, 600, 0.9, -12, '#e8b04a');
    hand(c, 870, 560, 0.75, 14, '#f3e6c4');
    // the near legs like pillars, wool round the top, toenails
    shape(band([[560, 780], [555, 970]], 130, 125), OCHRE, { angle: 90 });
    shape(band([[960, 760], [980, 960]], 125, 120), OCHRE, { angle: 90 });
    for (const [x, y] of [[520, 970], [560, 975], [600, 970], [940, 962], [980, 966], [1020, 962]] as const) c.paper(potato(x, y, 15, 11, 7, 0.08), { w: 3 });
    // the far tusk, behind the trunk
    shape(band([[330, 600], [250, 660], [180, 640], [140, 560]], 44, 20), TUSK, { angle: 60, over: 0 });
    // the domed head turned left, a big ear
    shape(potato(400, 420, 200, 190, 12, 0.04), OCHRE, { angle: 70, over: 0.5 });
    shape(potato(500, 460, 58, 80, 9, 0.06), DEEP, { angle: 90, over: 0.2 });
    shape(spikes([[280, 270], [360, 200], [450, 210], [520, 260]], 3, 40), DEEP, { over: 0 }, {}, false);
    // the trunk raised and curled back over its head, spitting lava onto its own back
    shape(band([[250, 500], [185, 420], [165, 320], [195, 225], [265, 165], [355, 140], [425, 150]], 92, 46), OCHRE, { angle: 20, over: 0.3 });
    for (const [x, y, dx, dy] of [[160, 400, 50, 0], [150, 330, 50, -6], [180, 250, 42, 22], [235, 190, 30, 36]] as const) stroke([[x, y], [x + dx, y + dy]], { w: 3.5 });
    shape(band([[425, 150], [520, 122], [605, 165], [645, 250]], 62, 44), CRACK, { angle: 30, over: 0.2, press: 1.1 });
    stroke([[440, 148], [520, 136], [592, 176], [628, 236]], { w: 4, col: YEL });
    for (const [x, y, r] of [[645, 290, 46], [585, 305, 30], [705, 305, 32], [650, 350, 22], [740, 340, 18]] as const) shape(potato(x, y, r, r * 0.8, 8, 0.12), CRACK, { over: 0, press: 1.1 }, { w: 3.5 });
    for (const [x, y] of [[560, 120], [620, 135], [680, 230]] as const) dot(x, y, 8, 8, CRACK);
    // the near tusk, long, curving up and forward
    shape(band([[360, 610], [270, 700], [170, 700], [100, 620], [90, 540]], 54, 22), TUSK, { angle: 60, over: 0.1 });
    // a fierce eye under a heavy brow
    c.paper(potato(340, 420, 26, 24, 8, 0.05));
    dot(332, 424, 13, 14);
    dot(326, 416, 4, 4.5, '#ffffff');
    stroke([[290, 380], [340, 386], [395, 372]], { w: 8 });
    stroke([[300, 540], [345, 560], [380, 548]], { w: 5 });
    // embers off its tail
  },
} satisfies Redraw;
