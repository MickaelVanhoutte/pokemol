import type { P, Redraw } from './crayon.ts';

/**
 * Fâchinge grown: a bigger, shaggier ball of fur lunging to the left, one huge fist punching, the other raised,
 * iron cuffs on its wrists and ankles, a furious glare, gritted teeth, an angry vein, steam puffing off its head.
 */
export default {
  id: '068', slug: 'furisinge', seed: 6802, size: [1100, 1100], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes, rnd } = c;
    const FUR = '#d9ad6e', BROWN = '#8a5a30', PINK = '#f29ab0', IRON = '#7a8496', RED = '#e8302c';
    const cuff = (x: number, y: number, w: number, h: number, tilt: number) => {
      const r = (tilt * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
      const at = (u: number, v: number): P => [x + u * co - v * si, y + u * si + v * co];
      shape([at(-w, -h), at(w, -h), at(w, h), at(-w, h)], IRON, { over: 0, angle: tilt + 90 }, { w: 3.5 }, false);
      dot(...at(-w * 0.5, 0), 5, 5, '#ffffff');
      dot(...at(w * 0.5, 0), 5, 5, '#ffffff');
    };
    const puff = (x: number, y: number, s: number) => c.paper(potato(x, y, 46 * s, 32 * s, 9, 0.18), { w: 4 });
    // the far arm punching out to the left, its cuff and huge fist; the far foot
    shape(band([[400, 610], [270, 625], [175, 600]], 86, 76), FUR, { angle: 10 });
    cuff(205, 605, 26, 50, 0);
    shape(potato(115, 595, 72, 66, 9, 0.06), BROWN, { angle: 80, over: 0.3 });
    for (const dy of [-30, 0, 30]) stroke([[62, 595 + dy], [92, 590 + dy]], { w: 3.5 });
    shape(potato(395, 970, 95, 40, 8, 0.06), BROWN, { over: 0 });
    cuff(410, 925, 62, 22, -4);
    // the big shaggy body, its fur in uneven tufts
    const body: P[] = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2, r = i % 2 ? 320 : 370 + rnd() * 50;
      body.push([560 + Math.cos(a) * r, 600 + Math.sin(a) * r * 0.9]);
    }
    shape(body, FUR, { angle: 75, over: 0.55, press: 1.1 }, {}, false);
    for (const [x, y] of [[620, 720], [720, 600], [500, 820], [760, 800], [640, 480]] as const) stroke([[x - 22, y - 14], [x, y + 10], [x + 22, y - 14]], { w: 3.5 });
    // the near foot stamping, the near arm raised, its cuff and fist
    shape(potato(700, 985, 105, 44, 8, 0.06), BROWN, { over: 0 });
    cuff(690, 935, 66, 22, 3);
    shape(band([[760, 500], [860, 380], [905, 245]], 90, 78), FUR, { angle: 120 });
    cuff(890, 300, 58, 24, -18);
    shape(potato(915, 185, 80, 74, 9, 0.06), BROWN, { angle: 80, over: 0.3 });
    // pointy ears, steam puffing off its head
    shape([[320, 380], [215, 235], [365, 300]], BROWN, { over: 0 }, {}, false);
    shape([[640, 285], [745, 170], [710, 330]], BROWN, { over: 0 }, {}, false);
    puff(250, 175, 1);
    puff(320, 120, 0.7);
    puff(640, 130, 0.8);
    // the furious face shifted left: a heavy spiky brow, red eyes, a pig nose, gritted teeth, an angry vein
    shape(spikes([[255, 430], [380, 400], [510, 405]], 3, -24), BROWN, { over: 0, press: 1.15 }, {}, false);
    c.paper(potato(315, 470, 24, 22, 8, 0.05));
    c.paper(potato(435, 465, 32, 28, 8, 0.05));
    dot(318, 474, 10, 10, RED);
    dot(436, 470, 13, 12, RED);
    dot(318, 474, 4, 4);
    dot(436, 470, 5, 5);
    shape(potato(345, 560, 64, 46, 9, 0.06), PINK, { over: 0 }, { w: 4 });
    dot(325, 560, 8, 10);
    dot(366, 558, 8, 10);
    c.paper([[265, 630], [430, 622], [425, 668], [272, 672]], {}, false);
    stroke([[268, 648], [428, 644]], { w: 3 });
    for (const x of [300, 335, 370, 400]) stroke([[x, 626], [x, 670]], { w: 3 });
    for (const [a, b] of [[[540, 380], [560, 400]], [[580, 380], [562, 402]], [[540, 428], [560, 410]], [[582, 428], [564, 408]]] as [P, P][]) stroke([a, b], { w: 5, col: RED });
  },
} satisfies Redraw;
