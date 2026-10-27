import type { Redraw } from './crayon.ts';

/** A little brown creature wearing a white skull as a helmet, turned to the left, holding a bone, a sad faraway look. */
export default {
  id: '065', slug: 'osselot', seed: 6501, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BROWN = '#b07a46', CREAM = '#f1dcae', BONE = '#f6f1e4', SHADOW = '#9a86c8';
    // a faint ghostly shadow under it
    c.tint(potato(500, 900, 260, 50, 10, 0.1), SHADOW, { gap: 4, spill: 0, wash: 0.2 });
    // the tail and the far leg and arm, behind
    shape(band([[620, 760], [740, 790], [800, 740]], 50, 30), BROWN, { angle: 30 });
    shape(band([[440, 770], [430, 860], [420, 900]], 64, 60), BROWN, { angle: 90 });
    shape(band([[400, 600], [330, 640], [300, 700]], 46, 40), BROWN, { angle: 60 });
    // the body and its cream belly
    shape(potato(510, 680, 150, 160, 12, 0.05), BROWN, { angle: 80, over: 0.5 });
    shape(potato(470, 700, 80, 100, 10, 0.05), CREAM, { over: 0 });
    // the near leg and the near arm holding a bone
    shape(band([[570, 790], [580, 870], [590, 905]], 66, 62), BROWN, { angle: 90 });
    shape(band([[620, 620], [690, 680], [700, 740]], 48, 42), BROWN, { angle: 100 });
    shape(band([[640, 800], [760, 620]], 24, 22), BONE, { angle: 60, over: 0 });
    for (const [x, y] of [[630, 815], [655, 790], [770, 610], [745, 595]] as const) shape(potato(x, y, 22, 20, 8, 0.05), BONE, { over: 0 }, { w: 3.5 });
    // the head under its skull helmet, turned left
    shape(potato(430, 420, 150, 130, 12, 0.05), BROWN, { angle: 80, over: 0.4 });
    shape([[270, 400], [300, 280], [420, 220], [560, 250], [610, 360], [570, 420], [480, 380], [380, 380], [320, 420]], BONE, { angle: 70, over: 0.3 }, {}, false);
    shape([[480, 250], [540, 160], [560, 270]], BONE, { over: 0 }, {}, false);
    // dark eye holes in the skull, sad eyes looking out
    shape(potato(330, 340, 26, 30, 8, 0.08), '#3a3346', { over: 0, press: 1.2 }, { w: 3 });
    shape(potato(440, 330, 34, 36, 8, 0.08), '#3a3346', { over: 0, press: 1.2 }, { w: 3 });
    dot(334, 345, 6, 8, '#ffffff');
    dot(446, 336, 7, 9, '#ffffff');
    stroke([[300, 470], [340, 460], [380, 470]], { w: 4.5 });
    dot(285, 430, 8, 6);
  },
} satisfies Redraw;
