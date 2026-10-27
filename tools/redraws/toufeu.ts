import type { Redraw } from './crayon.ts';

/** Touffou turned fire: a coral-red fox sitting in a nest of yellow flame-fur, long ears, a fluffy flame tail. */
export default {
  id: '018', slug: 'toufeu', seed: 1818, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, spikes, potato } = c;
    const CORAL = '#f0705a', YELLOW = '#f8cf3a', ORANGE = '#f59a2c', DEEP = '#c84a36';
    // the flame-fur tail curling up behind
    shape(spikes([[650, 700], [800, 620], [880, 480], [860, 350]], 3, 50).concat([[780, 420], [740, 560], [620, 640]]), YELLOW, { angle: 60, press: 1.1 }, {}, false);
    // the nest of flame-fur it sits in
    shape(spikes([[140, 880], [180, 720], [300, 640], [700, 640], [820, 720], [860, 880]], 3, 60).concat([[500, 930]]), YELLOW, { angle: 15, press: 1.1, over: 0.5 }, {}, false);
    c.tint(potato(500, 820, 280, 70, 10, 0.1), ORANGE, { gap: 3.4, angle: 15 });
    // the body sitting up
    shape(potato(500, 640, 160, 140, 12, 0.06), CORAL, { angle: 85, over: 0.55 });
    // a fluffy yellow collar of flame-fur round the neck
    const collar: [number, number][] = [];
    for (let i = 0; i < 18; i++) {
      const a = Math.PI * 0.05 + (i / 17) * Math.PI * 0.9, r = i % 2 ? 150 : 205;
      collar.push([500 + Math.cos(a) * r * 1.05, 440 + Math.sin(a) * r * 0.7]);
    }
    shape(collar.concat([[350, 470], [500, 500], [650, 470]]), YELLOW, { angle: 80, over: 0.3 }, {}, false);
    // long ears
    shape([[360, 270], [310, 60], [360, 50], [430, 240]], CORAL, { angle: 80 });
    shape([[370, 230], [340, 100], [370, 95], [410, 225]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    shape([[570, 240], [630, 50], [680, 70], [640, 270]], CORAL, { angle: 75 });
    shape([[590, 225], [640, 100], [660, 110], [620, 240]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // the head, a yellow tuft
    shape(potato(500, 340, 160, 130, 12, 0.05), CORAL, { angle: 80, over: 0.5 });
    shape(spikes([[430, 230], [500, 200], [570, 230]], 2, 30), YELLOW, { over: 0 }, {}, false);
    c.paper(potato(440, 330, 32, 38, 9, 0.04));
    c.paper(potato(560, 325, 32, 38, 9, 0.04));
    dot(445, 338, 17, 22);
    dot(555, 333, 17, 22);
    dot(500, 385, 11, 8);
    stroke([[465, 420], [500, 435], [538, 420]]);
  },
} satisfies Redraw;
