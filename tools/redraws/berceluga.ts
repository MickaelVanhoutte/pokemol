import type { P, Redraw } from './crayon.ts';

/**
 * A big gentle white whale that sings (« géant doux chanteur »), turned to the left: a round melon of a forehead, a
 * smile that never leaves it, a little grey calf riding on its back across the icy sea while it sings to it.
 */
export default {
  id: '060', slug: 'berceluga', seed: 6001, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const WHITE = '#f3f7fb', SHADE = '#c6dcef', SHADE2 = '#a9c7e3', LINE = '#4d6a8e', CALF = '#a8b6cc', CALF2 = '#8a9ab4';
    const SEA = '#6fd0d4', SEA2 = '#3fb0bf', FLOE = '#e6f7fb', PINK = '#f29ab0', NOTE = '#dff3fb';

    // the pose: the whale is drawn swimming level, then bent by M into a cradle, head and flukes up
    const M = ([x, y]: P): P => [x, y - 0.0011 * (x - 560) * (x - 560) + 120];
    const m = (pts: P[]) => pts.map(M);
    const body: P[] = [[106, 540], [138, 514], [150, 470], [168, 390], [230, 306], [320, 274], [412, 296], [474, 346], [520, 366], [620, 362], [740, 372], [850, 392], [935, 408], [990, 414], [996, 452], [930, 484], [840, 544], [720, 612], [580, 658], [420, 668], [290, 644], [190, 604], [128, 566]];
    const wl = 700;

    // the icy sea behind it, a little foam where it meets the body, a floe (scenery)
    c.part('mer', { pivot: [550, 800], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      const y0 = 690;
      const top: P[] = [[40, y0 + 20], [200, y0 - 6], [400, y0 + 14], [600, y0 - 4], [800, y0 + 12], [1060, y0 - 4]];
      c.tint([...top, [1060, y0 + 150], [800, y0 + 176], [500, y0 + 160], [200, y0 + 180], [40, y0 + 160]], SEA, { angle: 0, wash: 0.7 });
      c.tint([[60, y0 + 100], [500, y0 + 80], [1040, y0 + 100], [1040, y0 + 150], [500, y0 + 160], [60, y0 + 160]], SEA2, { wash: 0.6 });
      stroke(top, { w: 5, col: SEA2 });
      for (const [x, y, l] of [[120, y0 + 60, 120], [880, y0 + 70, 140], [520, y0 + 130, 110]] as const) stroke([[x, y], [x + l / 2, y - 10], [x + l, y]], { w: 4, col: '#ffffff' });
      shape([[860, y0 + 20], [900, y0 - 26], [1000, y0 - 30], [1040, y0 + 16], [960, y0 + 30]], FLOE, { angle: 0, over: 0 }, { col: LINE, w: 4 });
    });
    c.part('remous', { pivot: [550, 720], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      for (const [x0, x1, dy] of [[60, 200, 4], [800, 960, 8], [120, 230, 40], [860, 980, 44]] as const) stroke([[x0, wl + dy], [(x0 + x1) / 2, wl + dy - 12], [x1, wl + dy]], { w: 5, col: '#ffffff' });
    });
    // the flukes, raised behind (they wave slowly)
    c.part('queue', { pivot: M([960, 420]), motion: 'swing', amp: 4, period: 3, behind: true }, () => {
      shape(m([[950, 410], [990, 330], [1050, 290], [1060, 330], [1030, 380], [1080, 420], [1060, 450], [990, 440]]), WHITE, { angle: 40, over: 0 }, { col: LINE });
      c.tint(m([[990, 430], [1060, 445], [1040, 420], [1000, 410]]), SHADE, { wash: 0.8 });
    });
    // the far flipper
    shape(m([[420, 600], [470, 690], [540, 720], [530, 640]]), SHADE, { angle: 60, over: 0 }, { col: LINE });
    // the body: a melon of a forehead, a short beak, a heavy smooth white back and no fin, icy blue in the shade
    shape(m(body), WHITE, { angle: 70, over: 0, wash: 1 }, { col: LINE });
    c.tint(m([[190, 604], [290, 644], [420, 668], [580, 658], [720, 612], [840, 544], [930, 484], [880, 470], [720, 560], [560, 610], [400, 616], [260, 590]]), SHADE, { angle: 10, wash: 0.8 });
    // the part of its body down in the water, a touch bluer
    const under: P[] = [], b2 = m(body);
    b2.forEach((p, i) => {
      const q = b2[(i + 1) % b2.length];
      if (p[1] >= wl) under.push(p);
      if ((p[1] - wl) * (q[1] - wl) < 0) under.push([p[0] + ((q[0] - p[0]) * (wl - p[1])) / (q[1] - p[1]), wl]);
    });
    if (under.length > 2) c.tint(under, SEA, { angle: 0, wash: 0.4 });
    // the crease between its melon and its beak, the soft folds of its neck
    stroke(m([[146, 506], [176, 486], [214, 490]]), { w: 4.5, col: LINE });
    stroke(m([[470, 420], [490, 480], [480, 540]]), { w: 4, col: SHADE2 });
    c.shine(m([[214, 360], [290, 314]]), 10);
    // the near flipper, long, curved and pointed, trailing back
    c.part('nageoire', { pivot: M([360, 600]), motion: 'swing', amp: 5, period: 2.8 }, () => {
      shape(m([[330, 590], [340, 660], [390, 730], [470, 770], [450, 700], [420, 630], [400, 590]]), WHITE, { angle: 60, over: 0, wash: 1 }, { col: LINE });
      c.tint(m([[340, 650], [390, 724], [460, 764], [420, 680]]), SHADE, { wash: 0.7 });
    });
    // the face: one happy eye, a gentle smile running along its beak up toward its cheek, a pink cheek
    const e = M([262, 432]);
    c.eye(e[0], e[1], 30, 36, '#241c38');
    stroke(m([[226, 382], [262, 370], [298, 382]]), { w: 5 });
    stroke(m([[112, 546], [150, 556], [196, 552], [236, 532], [258, 506]]), { w: 5.5 });
    stroke(m([[248, 500], [268, 512]]), { w: 4.5 });
    c.cheek(...M([300, 500]), 34, 20, PINK);
    c.part('paupieres', { pivot: e, motion: 'blink', extra: true }, () => c.lid(e[0], e[1], 30, 36, WHITE));
    // a little grey calf riding on its back, its eyes shut with joy
    const calf = (x: number, y: number) => {
      const C = ([px, py]: P): P => M([x + px, y + py]);
      const cc = (pts: P[]) => pts.map(C);
      shape(cc([[96, -20], [140, -70], [170, -64], [150, -30], [180, -6], [150, 6], [110, 6]]), CALF2, { angle: 40, over: 0 }, { col: LINE, w: 4 });
      shape(cc([[-150, 20], [-130, 6], [-128, -30], [-104, -76], [-50, -100], [10, -90], [60, -50], [110, -20], [120, 10], [60, 40], [-40, 46], [-120, 40]]), CALF, { angle: 70, over: 0.2 }, { col: LINE, w: 4.5 });
      shape(cc([[-30, 20], [-10, 60], [30, 70], [20, 30]]), CALF2, { angle: 60, over: 0 }, { col: LINE, w: 4 });
      stroke(cc([[-136, 6], [-118, -2], [-100, -8]]), { w: 3.5, col: LINE });
      stroke(cc([[-96, -40], [-80, -54], [-62, -42]]), { w: 4.5 });
      stroke(cc([[-140, 24], [-116, 30], [-96, 22]]), { w: 4 });
      c.cheek(...C([-70, -10]), 16, 10, PINK);
    };
    calf(640, 330);
    // its song: soft notes in bubbles rising from its mouth
    const note = (x: number, y: number, r: number) => {
      shape(potato(x, y, r, r, 10, 0.03), NOTE, { over: 0, wash: 0.6 }, { col: LINE, w: 4 });
      dot(x - r * 0.18, y + r * 0.32, r * 0.22, r * 0.17, LINE);
      stroke([[x, y + r * 0.3], [x + r * 0.02, y - r * 0.45], [x + r * 0.32, y - r * 0.22]], { w: 4, col: LINE });
    };
    c.part('chant', { pivot: M([150, 420]), motion: 'swing', amp: 3, period: 3, decor: true }, () => {
      const [mx, my] = M([150, 470]);
      note(mx - 70, my - 110, 46);
      note(mx - 10, my - 220, 38);
      note(mx + 70, my - 300, 30);
    });
  },
} satisfies Redraw;
