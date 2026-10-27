import type { Redraw } from './crayon.ts';

/** A green chrysalis standing on its tip, hard plates, one sleepy eye peeking out. */
export default {
  id: '015', slug: 'chrysalou', seed: 1515, size: [900, 1000], tilt: 4,
  draw(c) {
    const { shape, stroke, dot } = c;
    const GREEN = '#6ec43c', DEEP = '#3f9a2a';
    // the shell: pointed on top, curling at the bottom
    shape([[450, 40], [560, 200], [650, 420], [690, 640], [640, 820], [520, 920], [360, 930], [270, 860], [330, 790], [300, 640], [330, 420], [380, 200]],
      GREEN, { angle: 80, over: 0.6, press: 1.1 });
    // plates
    stroke([[350, 420], [440, 470], [600, 430]]);
    stroke([[330, 640], [470, 690], [670, 630]]);
    stroke([[340, 800], [470, 830], [620, 800]]);
    c.tint([[560, 230], [640, 440], [670, 620], [620, 600], [580, 420]], DEEP, { gap: 3.4, angle: 70 });
    // a sleepy eye
    c.paper([[400, 300], [500, 280], [540, 330], [500, 370], [420, 365]]);
    dot(470, 340, 20, 22);
    stroke([[395, 300], [450, 282], [540, 318]], { w: 6 });
  },
} satisfies Redraw;
