import type { P, Redraw } from './crayon.ts';

/**
 * A little sand gecko turned to the left: sandy skin with brown spots, a pale belly, huge shiny eyes on top of its
 * wide head, round pads on its splayed toes, a tail curling up behind, and three small amber crystals poking out
 * along its back.
 */
export default {
  id: '116', slug: 'gecaillou', seed: 11603, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const SKIN = '#e6b56c', DEEP = '#c48a45', SPOT = '#a8683a', BELLY = '#f3d9a4', CRYS = '#f2c46a', CRYS2 = '#fbe7b0', CHEEK = '#f29ab0';
    const toes = (x: number, y: number, col: string) => {
      for (const [dx, dy] of [[-34, -6], [-12, 10], [14, 12], [36, -2]] as const) {
        shape(band([[x, y - 14], [x + dx, y + dy]], 14, 12), col, { over: 0 }, { w: 3 });
        shape(potato(x + dx, y + dy + 2, 13, 11, 7, 0.05), col, { over: 0 }, { w: 3 });
      }
    };
    // the far legs, behind
    shape(band([[480, 650], [505, 730], [520, 790]], 46, 40), DEEP, { angle: 70, over: 0 });
    toes(522, 805, DEEP);
    shape(band([[740, 650], [790, 720], [815, 780]], 50, 42), DEEP, { angle: 50, over: 0 });
    toes(818, 795, DEEP);
    // the tail curling up behind
    c.part('queue', { pivot: [760, 650], motion: 'swing', amp: 10, period: 1.4, behind: true }, () => {
      shape(band([[740, 660], [850, 640], [915, 560], [905, 470], [845, 445], [815, 490], [850, 515]], 84, 26), SKIN, { angle: 60, over: 0.3 });
      for (const [x, y] of [[880, 600], [905, 510]] as const) shape(potato(x, y, 14, 11, 7, 0.1), SPOT, { over: 0 }, { w: 2.5 });
    });
    // the body, chunky, a pale belly underneath
    const body: P[] = [[400, 560], [480, 500], [620, 488], [745, 520], [805, 595], [785, 682], [680, 722], [520, 722], [418, 680]];
    shape(body, SKIN, { angle: 15, over: 0.4 });
    c.tint([[440, 675], [540, 712], [680, 712], [770, 675], [700, 700], [520, 704]], BELLY, { gap: 3.4, angle: 10 });
    for (const [x, y, r] of [[560, 555, 18], [655, 590, 15], [520, 640, 13], [725, 565, 14], [600, 655, 12]] as const) shape(potato(x, y, r, r * 0.8, 7, 0.1), SPOT, { over: 0 }, { w: 2.5 });
    // three small amber crystals along its back
    for (const [x, y, h] of [[505, 505, 55], [595, 492, 72], [690, 508, 50]] as const) {
      shape([[x - 24, y + 8], [x - 6, y - h], [x + 22, y + 6]], CRYS, { angle: 80, over: 0 }, { w: 3.5 }, false);
      stroke([[x - 8, y - h + 16], [x - 12, y - 2]], { w: 4, col: CRYS2 });
    }
    // the near legs, splayed, round pads on the toes
    shape(band([[385, 625], [340, 710], [305, 785]], 54, 46), SKIN, { angle: 110, over: 0.2 });
    toes(300, 800, SKIN);
    shape(band([[660, 680], [645, 760], [620, 820]], 56, 48), SKIN, { angle: 100, over: 0.2 });
    toes(615, 835, SKIN);
    // the wide flat head, its snout to the left
    const head: P[] = [[150, 525], [180, 445], [262, 402], [372, 405], [445, 452], [462, 532], [425, 602], [320, 632], [212, 618], [160, 578]];
    shape(head, SKIN, { angle: 20, over: 0.35 });
    c.tint([[175, 585], [260, 615], [380, 610], [430, 585], [320, 625], [215, 612]], BELLY, { gap: 3.4, angle: 10 });
    shape(potato(380, 430, 14, 10, 7, 0.1), SPOT, { over: 0 }, { w: 2.5 });
    // huge shiny eyes on top of the head (the far one smaller), the eye ridges in skin colour
    shape(potato(236, 462, 40, 42, 9, 0.05), SKIN, { over: 0 });
    shape(potato(342, 448, 60, 62, 9, 0.05), SKIN, { over: 0 });
    for (const [x, y, rx, ry] of [[234, 465, 28, 32], [342, 452, 44, 48]] as const) {
      shape(potato(x, y, rx, ry, 10, 0.03), '#3a3050', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - rx * 0.3, y - ry * 0.35, rx * 0.34, ry * 0.28, '#ffffff');
      dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
    }
    // nostrils, a wide happy grin, a pink cheek
    dot(168, 515, 5, 4);
    dot(192, 506, 4, 3);
    stroke([[165, 565], [220, 588], [290, 590], [330, 572]], { w: 4.5 });
    shape(potato(385, 560, 26, 15, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
  },
} satisfies Redraw;
