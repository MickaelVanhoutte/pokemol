import type { Redraw } from './crayon.ts';

/** A green chrysalis leaning to the left, hard plates, one sleepy eye peeking out on its left side. */
export default {
  id: '015', slug: 'chrysalou', seed: 1516, size: [900, 1000], tilt: -8,
  draw(c) {
    const { shape, stroke, dot } = c;
    const GREEN = '#6ec43c', DEEP = '#3f9a2a';
    // the shell: pointed on top, curling at the bottom to the right
    shape([[430, 40], [540, 200], [640, 420], [680, 640], [640, 820], [530, 920], [380, 935], [300, 880], [370, 800], [330, 640], [340, 420], [370, 200]],
      GREEN, { angle: 80, over: 0.6, press: 1.1 });
    // plates
    stroke([[350, 420], [460, 470], [620, 430]]);
    stroke([[340, 640], [480, 690], [665, 630]]);
    stroke([[360, 800], [480, 830], [630, 800]]);
    c.tint([[545, 230], [630, 440], [665, 620], [610, 600], [570, 420]], DEEP, { gap: 3.4, angle: 70 });
    // a sleepy eye on the left side
    c.paper([[350, 300], [430, 285], [460, 330], [425, 368], [360, 362]]);
    dot(395, 338, 18, 21);
    stroke([[345, 300], [400, 284], [462, 318]], { w: 6 });
    // only in battle: a green eyelid closing over its sleepy eye now and then (drawn last, the card stays the same)
    c.part('paupiere', { pivot: [400, 330], motion: 'blink', extra: true }, () => {
      shape([[345, 302], [430, 287], [462, 330], [425, 370], [358, 364]], GREEN, { angle: 80, over: 0 });
      stroke([[352, 336], [405, 350], [455, 334]], { w: 5 });
    });
  },
} satisfies Redraw;
