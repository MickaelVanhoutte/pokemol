import type { Redraw } from './crayon.ts';

/** A little shield bug turned to the left: its back is the round red head of a drawing pin, the pin's point its tail. */
export default {
  id: '089', slug: 'punaisette', seed: 8901, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, paper, stroke, dot, band, tint, potato } = c;
    const RED = '#e8413c', METAL = '#b4b8c8', NAVY = '#3d4170';
    // the far legs, behind
    for (const x of [470, 610, 740]) shape(band([[x, 640], [x + 20, 740], [x + 30, 790]], 24, 18), NAVY, { angle: 90, over: 0 });
    // the pin's point, sticking out behind like a little tail
    shape(band([[770, 610], [870, 628], [960, 640]], 34, 4), METAL, { angle: 10, over: 0 }, {}, false);
    // the metal disk under the dome
    shape(potato(565, 640, 270, 42, 12, 0.03), METAL, { angle: 0, over: 0.3 });
    // the red dome, shiny
    shape([[320, 630], [335, 500], [400, 400], [500, 340], [620, 330], [730, 380], [800, 480], [820, 600], [780, 650], [560, 665], [380, 660]], RED, { angle: 75, over: 0.6, press: 1.1 });
    paper(potato(515, 420, 58, 30, 9, 0.06));
    paper(potato(610, 392, 18, 12, 7, 0.06));
    // the round head, in front on the left
    shape(potato(270, 565, 108, 98, 10, 0.05), NAVY, { angle: 60, over: 0.5 });
    // the near legs
    for (const [x, dx] of [[380, -40], [525, -20], [680, 20]] as const) shape(band([[x, 650], [x + dx, 760], [x + dx * 1.8, 830]], 28, 22), NAVY, { angle: 90, over: 0 });
    // antennae: in battle they wave
    c.part('antennes', { pivot: [262, 475], motion: 'swing', amp: 10, period: 1.7 }, () => {
      stroke([[240, 480], [205, 400], [150, 352]], { w: 5 });
      dot(146, 348, 14, 14, NAVY);
      stroke([[292, 474], [296, 385], [262, 318]], { w: 5 });
      dot(258, 312, 14, 14, NAVY);
    });
    // big eyes, the far one smaller, pink cheeks, a pale smile
    paper(potato(212, 550, 26, 36, 8, 0.04));
    paper(potato(298, 545, 34, 44, 8, 0.04));
    dot(210, 558, 13, 20);
    dot(294, 554, 17, 24);
    dot(205, 546, 5, 6, '#ffffff');
    dot(287, 540, 6, 7, '#ffffff');
    tint(potato(335, 610, 22, 13, 7, 0.1), '#f29ac8', { gap: 3 });
    stroke([[222, 618], [252, 634], [286, 624]], { w: 5, col: '#f1e6ee' });
    // in battle it blinks
    c.part('paupiere', { pivot: [255, 550], motion: 'blink', extra: true }, () => {
      shape(potato(212, 550, 30, 40, 8, 0.03), NAVY, { angle: 80, over: 0 });
      shape(potato(298, 545, 38, 48, 8, 0.03), NAVY, { angle: 80, over: 0 });
      stroke([[186, 556], [212, 568], [240, 556]], { w: 4, col: '#f1e6ee' });
      stroke([[264, 552], [298, 566], [334, 552]], { w: 4, col: '#f1e6ee' });
    });
  },
} satisfies Redraw;
