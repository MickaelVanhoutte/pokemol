import type { P, Redraw } from './crayon.ts';

/**
 * A little armadillo with a shell of grey stone plates, turned to the left, half curled up so that it looks just like a
 * pebble: only its sandy little head, its feet and its tail poke out. People take it for a real stone, until it gets
 * cross. It keeps its grey stone colour.
 */
export default {
  id: '030', slug: 'cailloutou', seed: 3061, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const STONE = '#a3a6ae', DEEP = '#7f838c', SAND = '#ecc9a4';
    // the little tail curling out behind (it wags in battle)
    c.part('queue', { pivot: [770, 700], motion: 'swing', amp: 10, period: 1.6, behind: true }, () => {
      shape(band([[760, 700], [850, 700], [880, 640], [850, 610]], 54, 22), SAND, { angle: 20 });
    });
    // the far feet
    shape(potato(640, 770, 54, 32, 8, 0.06), SAND, { angle: 10 });
    // the shell: a dome of grey stone plates, like a big round pebble
    const shell: P[] = [[220, 720], [230, 560], [320, 450], [480, 400], [640, 420], [760, 520], [800, 700], [700, 760], [320, 760]];
    shape(shell, STONE, { angle: 60, over: 0.4 });
    for (const x of [380, 510, 640]) stroke([[x - 30, 430], [x - 60, 580], [x - 50, 740]], { w: 5, col: DEEP });
    // the near feet
    shape(potato(330, 784, 58, 34, 8, 0.06), SAND, { angle: 10 });
    shape(potato(520, 790, 58, 34, 8, 0.06), SAND, { angle: 10 });
    // its little head poking out on the left: big ears, a long nose
    shape([[300, 520], [270, 430], [320, 470]], SAND, { angle: 70 }, {}, false);
    shape([[236, 520], [196, 440], [256, 480]], SAND, { angle: 70 }, {}, false);
    const head: P[] = [[310, 540], [240, 520], [160, 560], [90, 640], [70, 690], [110, 712], [220, 716], [310, 680]];
    shape(head, SAND, { angle: 60, over: 0.3 });
    c.eye(170, 606, 22, 28);
    c.eye(244, 600, 30, 38);
    c.cheek(274, 666, 26, 16);
    dot(78, 680, 14, 11, '#9a5a4a');
    stroke([[118, 696], [146, 706], [172, 694]], { w: 4.5 });
    c.part('paupieres', { pivot: [208, 602], motion: 'blink', extra: true }, () => {
      c.lid(170, 606, 22, 28, SAND);
      c.lid(244, 600, 30, 38, SAND);
    });
  },
} satisfies Redraw;
