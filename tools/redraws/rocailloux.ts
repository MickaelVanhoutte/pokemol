import type { P, Redraw } from './crayon.ts';

/**
 * Cailloutou grown, rolled up into a big ball of grey stone plates as it tumbles down the mountain, turned to the left:
 * its sandy head peeks out of the ball, grinning. It always gets up without a scratch.
 */
export default {
  id: '039', slug: 'rocailloux', seed: 3977, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const STONE = '#a3a6ae', DEEP = '#7f838c', SAND = '#ecc9a4';
    // the ball of stone plates, rolling
    shape(potato(540, 560, 300, 290, 16, 0.025), STONE, { angle: 60, over: 0.4 });
    for (const [a, b, d] of [[[420, 290], [380, 840], [300, 560]], [[560, 270], [560, 850], [470, 560]], [[700, 310], [740, 820], [650, 560]]] as [P, P, P][]) stroke([a, d, b], { w: 6, col: DEEP });
    // the tail, wrapped round the ball (it wags in battle)
    c.part('queue', { pivot: [760, 420], motion: 'swing', amp: 8, period: 1.5 }, () => {
      shape(c.band([[760, 420], [820, 470], [840, 540]], 50, 30), SAND, { angle: 30 });
    });
    // its head peeking out of the ball, grinning: big ears, a long nose
    shape([[360, 560], [340, 470], [390, 510]], SAND, { angle: 70 }, {}, false);
    const head: P[] = [[400, 580], [320, 560], [230, 600], [170, 670], [160, 720], [210, 740], [330, 740], [410, 700]];
    shape(head, SAND, { angle: 60, over: 0.3 });
    c.eye(250, 640, 24, 30);
    c.eye(330, 632, 32, 40);
    c.cheek(366, 700, 24, 15);
    dot(168, 708, 14, 11, '#9a5a4a');
    stroke([[206, 720], [246, 734], [290, 718]], { w: 5 });
    // its little feet tucked in
    shape(potato(420, 830, 50, 30, 8, 0.06), SAND, { angle: 10 });
    shape(potato(600, 846, 50, 30, 8, 0.06), SAND, { angle: 10 });
    c.part('paupieres', { pivot: [290, 636], motion: 'blink', extra: true }, () => {
      c.lid(250, 640, 24, 30, SAND);
      c.lid(330, 632, 32, 40, SAND);
    });
  },
} satisfies Redraw;
