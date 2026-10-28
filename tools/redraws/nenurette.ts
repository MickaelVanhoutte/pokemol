import type { Redraw } from './crayon.ts';

/** A little tree frog sitting on a lily pad, turned to the left: watercolour blue spots, a water lily growing on its head. */
export default {
  id: '095', slug: 'nenurette', seed: 9501, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const FROG = '#6cc89a', PAD = '#3f9e4d', SPOT = '#5aa8e8', PINK = '#f49ac1', BELLY = '#eef3c4', WATER = '#5aa0e0';
    // ripples round the pad
    stroke([[90, 860], [140, 900], [230, 935]], { w: 4, col: WATER });
    stroke([[880, 900], [930, 870], [950, 830]], { w: 4, col: WATER });
    stroke([[300, 970], [420, 980], [520, 975]], { w: 4, col: WATER });
    // the lily pad, its notch at the front
    shape([[120, 830], [210, 765], [420, 735], [640, 740], [820, 775], [905, 835], [860, 905], [700, 940], [640, 860], [600, 945], [400, 950], [200, 925]], PAD, { angle: 10, over: 0.4 }, {}, false);
    for (const [x, y] of [[230, 800], [380, 760], [760, 790], [840, 870], [420, 930]] as const) stroke([[520, 850], [x, y]], { w: 3 });
    // the water lily on its head, behind its eyes: in battle it sways
    c.part('fleur', { pivot: [418, 410], motion: 'swing', amp: 7, period: 2.4, behind: true }, () => {
      shape(band([[418, 420], [420, 340]], 16, 14), PAD, { over: 0 });
      for (const [a, l] of [[-150, 80], [-115, 95], [-90, 100], [-65, 95], [-30, 80]] as const) {
        const r = (a * Math.PI) / 180, cx = 420, cy = 330, tx = cx + Math.cos(r) * l, ty = cy + Math.sin(r) * l;
        const nx = -Math.sin(r) * 22, ny = Math.cos(r) * 22;
        shape([[cx + nx, cy + ny], [(cx + tx) / 2 + nx * 1.2, (cy + ty) / 2 + ny * 1.2], [tx, ty], [(cx + tx) / 2 - nx * 1.2, (cy + ty) / 2 - ny * 1.2], [cx - nx, cy - ny]], PINK, { angle: a + 90, over: 0 });
      }
      shape(potato(420, 325, 26, 18, 7, 0.08), '#f6d23a', { over: 0 });
    });
    // the frog: a round body, no neck
    shape([[290, 560], [330, 445], [440, 400], [560, 412], [660, 480], [712, 600], [702, 720], [620, 790], [450, 800], [330, 760], [280, 660]], FROG, { angle: 75, over: 0.5 });
    for (const [x, y, r] of [[560, 500, 26], [625, 600, 22], [500, 455, 16], [650, 520, 14]] as const) tint(potato(x, y, r, r * 0.8, 8, 0.1), SPOT, { gap: 3.4, wash: 0.5 });
    shape([[300, 640], [380, 612], [452, 650], [462, 760], [362, 780], [300, 720]], BELLY, { angle: 0, over: 0 });
    // the near back leg folded, its webbed foot on the pad
    shape(potato(630, 690, 108, 80, 10, 0.05), FROG, { angle: 60, over: 0.4 });
    shape([[580, 775], [480, 785], [440, 812], [485, 818], [455, 842], [530, 838], [600, 815]], FROG, { angle: 0, over: 0 }, {}, false);
    // the near front leg, a webbed hand
    shape(band([[365, 700], [338, 780], [326, 812]], 42, 34), FROG, { angle: 90, over: 0 });
    shape([[350, 805], [290, 800], [262, 822], [298, 826], [282, 845], [338, 838], [360, 820]], FROG, { over: 0 }, {}, false);
    // bulging eyes on top, the far one smaller
    shape(potato(362, 432, 50, 46, 9, 0.04), FROG, { angle: 70, over: 0 });
    shape(potato(475, 408, 62, 58, 9, 0.04), FROG, { angle: 70, over: 0 });
    paper(potato(360, 432, 32, 32, 8, 0.04));
    paper(potato(473, 408, 42, 42, 8, 0.04));
    dot(354, 438, 17, 19);
    dot(465, 414, 22, 25);
    dot(348, 428, 6, 6, '#ffffff');
    dot(457, 402, 7, 7, '#ffffff');
    // a wide smile, pink cheeks
    stroke([[284, 596], [330, 624], [400, 630], [462, 608]], { w: 5 });
    tint(potato(470, 640, 24, 14, 7, 0.1), PINK, { gap: 3 });
    // only in battle: its tongue shoots out now and then
    c.part('langue', { pivot: [295, 605], motion: 'peek', to: [48, 0], shrink: 0.2, fade: true, period: 3.2, extra: true }, () => {
      shape(band([[300, 608], [215, 618], [140, 600]], 30, 22), '#f07f9a', { angle: 0, over: 0, press: 1.1 });
      shape(potato(128, 598, 30, 24, 8, 0.05), '#f07f9a', { over: 0, press: 1.1 });
    });
  },
} satisfies Redraw;
