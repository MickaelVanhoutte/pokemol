import type { Redraw } from './crayon.ts';

/** Touffou turned fire: a coral-red fox sitting three-quarters to the left in a nest of yellow flame-fur, long ears, a snout. */
export default {
  id: '018', slug: 'toufeu', seed: 1819, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, spikes, potato } = c;
    const CORAL = '#f0705a', YELLOW = '#f8cf3a', ORANGE = '#f59a2c', DEEP = '#c84a36';
    // the flame-fur tail curling up behind, on the right
    shape(spikes([[660, 700], [810, 620], [890, 480], [870, 350]], 3, 50).concat([[790, 420], [750, 560], [630, 640]]), YELLOW, { angle: 60, press: 1.1 }, {}, false);
    // the nest of flame-fur it sits in
    shape(spikes([[140, 880], [180, 720], [300, 640], [700, 640], [820, 720], [860, 880]], 3, 60).concat([[500, 930]]), YELLOW, { angle: 15, press: 1.1, over: 0.5 }, {}, false);
    c.tint(potato(500, 820, 280, 70, 10, 0.1), ORANGE, { gap: 3.4, angle: 15 });
    // the far ear, behind
    shape([[340, 270], [270, 70], [320, 50], [410, 240]], CORAL, { angle: 80 });
    shape([[350, 230], [300, 105], [330, 95], [390, 225]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // the body sitting up
    shape(potato(510, 640, 160, 140, 12, 0.06), CORAL, { angle: 85, over: 0.55 });
    // a fluffy yellow collar
    const collar: [number, number][] = [];
    for (let i = 0; i < 18; i++) {
      const a = Math.PI * 0.05 + (i / 17) * Math.PI * 0.9, r = i % 2 ? 150 : 205;
      collar.push([480 + Math.cos(a) * r * 1.05, 440 + Math.sin(a) * r * 0.7]);
    }
    shape(collar.concat([[330, 470], [480, 500], [630, 470]]), YELLOW, { angle: 80, over: 0.3 }, {}, false);
    // the near ear
    shape([[520, 240], [590, 45], [650, 65], [610, 270]], CORAL, { angle: 75 });
    shape([[545, 225], [600, 100], [625, 110], [585, 240]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // the head turned left, a pointed snout
    shape([[310, 330], [370, 240], [480, 215], [590, 260], [620, 360], [570, 450], [450, 480], [340, 450], [250, 400], [240, 370]], CORAL, { angle: 80, over: 0.5 });
    shape(spikes([[400, 230], [470, 205], [540, 225]], 2, 30), YELLOW, { over: 0 }, {}, false);
    c.paper(potato(355, 330, 24, 34, 9, 0.04));
    c.paper(potato(490, 325, 34, 40, 9, 0.04));
    dot(350, 338, 12, 20);
    dot(482, 333, 17, 22);
    dot(250, 382, 10, 8);
    stroke([[268, 420], [320, 440], [380, 430]]);
  },
} satisfies Redraw;
