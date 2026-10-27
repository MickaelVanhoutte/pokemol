import type { Redraw } from './crayon.ts';

/** A little blue seahorse turned to the left: a long tube snout, a fin on its back, a curled tail, a cream ribbed belly. */
export default {
  id: '069', slug: 'hippomine', seed: 6901, size: [900, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const BLUE = '#5aa0e6', CREAM = '#f3e6c6', FIN = '#bfe2fa';
    // the fin on its back
    c.part('nageoire', { pivot: [550, 520], motion: 'swing', amp: 7, period: 0.7, behind: true }, () => {
      shape(([[540, 410], [570, 400]] as [number, number][]).concat(spikes([[570, 400], [640, 510], [630, 640]], 3, -55)).concat([[560, 640]]), FIN, { angle: 60, over: 0 }, {}, false);
    });
    // the body and the curled tail
    shape(band([[480, 400], [530, 520], [520, 650], [460, 760], [420, 840], [460, 900], [540, 880], [540, 830], [495, 830]], 120, 30), BLUE, { angle: 80, over: 0.5 });
    c.tint(band([[440, 420], [480, 530], [470, 650], [430, 740]], 50, 26), CREAM, { gap: 3.4 });
    for (const y of [480, 540, 600, 660]) stroke([[410, y], [470, y + 8]], { w: 3 });
    // a tiny far fin-arm and near fin-arm
    // the head and its long tube snout pointing left
    shape(potato(470, 300, 120, 110, 12, 0.05), BLUE, { angle: 80, over: 0.5 });
    shape(band([[380, 330], [280, 340], [200, 330]], 54, 46), BLUE, { angle: 0 });
    shape(spikes([[430, 200], [490, 190], [550, 210]], 2, 30), BLUE, { over: 0 }, {}, false);
    c.paper(potato(450, 280, 26, 30, 8, 0.05));
    dot(442, 286, 12, 14);
    dot(436, 278, 4, 5, '#ffffff');
    dot(198, 330, 8, 9);
  },
} satisfies Redraw;
