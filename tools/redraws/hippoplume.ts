import type { Redraw } from './crayon.ts';

/** Hippomine grown: a bigger, spiny seahorse turned to the left, fins like sharp quills, a fierce eye, a curled tail. */
export default {
  id: '070', slug: 'hippoplume', seed: 7001, size: [950, 1050], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const BLUE = '#3f74d0', CREAM = '#f3e6c6', FIN = '#9cc8f2';
    // the quill fins on its back
    shape(([[560, 300]] as [number, number][]).concat(spikes([[590, 310], [690, 430], [720, 570], [690, 720]], 3, -80)).concat([[600, 700], [580, 420]]), FIN, { angle: 60, over: 0, press: 1.1 }, {}, false);
    // the body and the curled tail
    shape(band([[500, 330], [570, 470], [560, 640], [490, 780], [450, 880], [500, 950], [590, 920], [590, 860], [535, 860]], 150, 36), BLUE, { angle: 80, over: 0.6, press: 1.05 });
    c.tint(band([[450, 360], [500, 480], [490, 640], [440, 760]], 60, 28), CREAM, { gap: 3.4 });
    for (const y of [420, 490, 560, 630, 700]) stroke([[410, y], [480, y + 8]], { w: 3 });
    // the head, a spiky crest, the long snout pointing left
    shape(potato(480, 240, 130, 115, 12, 0.05), BLUE, { angle: 80, over: 0.5 });
    shape(spikes([[400, 140], [480, 110], [570, 140], [620, 210]], 3, 40), BLUE, { over: 0 }, {}, false);
    shape(band([[380, 270], [260, 280], [170, 265]], 58, 48), BLUE, { angle: 0 });
    c.paper(potato(450, 225, 28, 26, 8, 0.05));
    dot(442, 230, 13, 12);
    stroke([[410, 195], [490, 210]], { w: 6 });
    dot(166, 265, 9, 10);
  },
} satisfies Redraw;
