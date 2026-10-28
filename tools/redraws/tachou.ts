import type { Redraw } from './crayon.ts';

/** A drop of ink that came alive: a round blot floating to the left, dripping underneath, splashes all round. */
export default {
  id: '096', slug: 'tachou', seed: 9601, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, paper, stroke, dot, potato } = c;
    const INK = '#2c3a8c', SHEEN = '#6d7fd8';
    // splashes round it
    for (const [x, y, r] of [[200, 380, 24], [175, 470, 13], [805, 330, 19], [835, 425, 11], [230, 630, 15], [780, 640, 12]] as const) {
      shape(potato(x, y, r, r * 0.9, 7, 0.12), INK, { over: 0, press: 1.2 }, { w: 3.5 });
    }
    // the blot, three drips hanging under it
    shape([[262, 520], [252, 420], [302, 322], [382, 262], [472, 232], [562, 242], [652, 282], [722, 362], [752, 462], [732, 562], [702, 622], [692, 702],
      [672, 762], [645, 702], [612, 652], [562, 672], [540, 780], [515, 832], [490, 772], [472, 682], [422, 662], [392, 722], [372, 752], [352, 702],
      [322, 642], [282, 602]], INK, { angle: 60, over: 0.8, press: 1.2 });
    c.tint(potato(560, 330, 90, 45, 9, 0.1), SHEEN, { gap: 3.6 });
    paper(potato(360, 330, 32, 17, 8, 0.06));
    // big round eyes, shifted left, a little round mouth
    paper(potato(338, 442, 36, 48, 8, 0.04));
    paper(potato(458, 432, 46, 58, 8, 0.04));
    dot(332, 452, 18, 26);
    dot(450, 444, 23, 31);
    dot(325, 438, 7, 8, '#ffffff');
    dot(441, 426, 8, 9, '#ffffff');
    paper(potato(392, 548, 24, 18, 8, 0.06));
    // in battle a drop falls from its longest drip
    c.part('goutte', { pivot: [515, 868], motion: 'peek', to: [0, 220], shrink: 0.7, fade: true, period: 2.6, extra: true }, () => {
      shape([[515, 840], [538, 880], [528, 905], [502, 905], [492, 880]], INK, { over: 0, press: 1.2 }, { w: 4 });
    });
    // and it blinks
    c.part('paupiere', { pivot: [400, 440], motion: 'blink', extra: true }, () => {
      shape(potato(338, 442, 40, 52, 8, 0.03), INK, { angle: 80, over: 0, press: 1.2 });
      shape(potato(458, 432, 50, 62, 8, 0.03), INK, { angle: 80, over: 0, press: 1.2 });
      stroke([[302, 452], [338, 468], [374, 452]], { w: 4, col: '#f1e6ee' });
      stroke([[412, 444], [458, 462], [504, 444]], { w: 4, col: '#f1e6ee' });
    });
  },
} satisfies Redraw;
