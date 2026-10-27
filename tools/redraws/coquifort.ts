import type { Redraw } from './crayon.ts';

/** Coquilou grown: a huge spiky steel shell turned to the left, a stern pale face inside with a horn of ice. */
export default {
  id: '059', slug: 'coquifort', seed: 5901, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const SHELL = '#7b8fb8', DEEP = '#4b5674', INSIDE = '#2e2a3a', FACE = '#d9d4ec', ICE = '#bfe8f4';
    // spikes all round the shell, behind it
    const spikes: [number, number][] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.1, r = i % 2 ? 330 : 470;
      spikes.push([520 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.95]);
    }
    shape(spikes, SHELL, { angle: 60, over: 0.5, press: 1.05 }, {}, false);
    // the big round shell
    shape(potato(520, 520, 330, 320, 16, 0.03), SHELL, { angle: 80, over: 0.6, press: 1.1 });
    for (let i = 0; i < 7; i++) stroke([[520, 520], [520 + Math.cos(i * 0.9 + 0.3) * 310, 520 + Math.sin(i * 0.9 + 0.3) * 300]], { w: 4, col: DEEP });
    // the dark opening, shifted left
    shape(potato(400, 520, 200, 180, 14, 0.05), INSIDE, { angle: 0, over: 0, press: 1.2 });
    // the stern face inside, a horn of ice
    shape(potato(390, 540, 120, 110, 12, 0.05), FACE, { angle: 80, over: 0.3 });
    shape([[390, 440], [420, 330], [440, 445]], ICE, { over: 0, press: 1.1 }, {}, false);
    c.paper(potato(345, 530, 18, 22, 8, 0.05));
    c.paper(potato(430, 528, 24, 26, 8, 0.05));
    dot(343, 534, 8, 11);
    dot(426, 532, 10, 13);
    stroke([[320, 505], [360, 515]], { w: 5.5 });
    stroke([[405, 512], [465, 500]], { w: 6 });
    stroke([[340, 600], [390, 594], [440, 600]], { w: 5 });
  },
} satisfies Redraw;
