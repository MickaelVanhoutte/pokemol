import type { P, Redraw } from './crayon.ts';

/**
 * A little octopus of the lake's depths, turned to the left: a round violet head with big shiny eyes and pink
 * cheeks, four curly tentacles (the far ones behind), one of them holding a paintbrush dripping with blue, and a
 * little cloud of watercolour ink puffed out behind it.
 */
export default {
  id: '113', slug: 'poulpinceau', seed: 11307, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const VIOLET = '#c48ae6', DEEP = '#9a5ccc', SUCKER = '#f6e4f2', WOOD = '#d9a868', GOLD = '#e8b84a', BRISTLE = '#7a4a2a', PAINT = '#3e6fd0';
    const suckers = (path: P[]) => path.forEach(([x, y], i) => i % 2 && shape(potato(x, y, 9, 8, 7, 0.1), SUCKER, { over: 0 }, { w: 2.5 }));
    // a puff of watercolour ink behind it
    c.tint(potato(760, 560, 170, 120, 12, 0.12), '#9fc4f0', { wash: 0.5, angle: 30 });
    c.tint(potato(820, 470, 90, 70, 10, 0.12), '#f4a3c8', { wash: 0.45, angle: 30 });
    // the far tentacles, behind
    shape(band([[600, 640], [700, 720], [760, 820], [720, 880], [680, 840]], 66, 26), DEEP, { angle: 60, over: 0.2 });
    shape(band([[520, 660], [560, 780], [540, 880], [490, 900], [470, 860]], 66, 26), DEEP, { angle: 80, over: 0.2 });
    // the round head
    shape(potato(520, 420, 230, 240, 14, 0.03), VIOLET, { angle: 70, over: 0.5 });
    for (const [x, y, r] of [[600, 260, 22], [660, 340, 16], [560, 210, 12]] as const) shape(potato(x, y, r, r, 8, 0.08), DEEP, { over: 0 }, { w: 3 });
    // the near tentacles, curling
    const t1: P[] = [[440, 620], [380, 720], [390, 820], [450, 850], [470, 800]];
    shape(band(t1, 78, 28), VIOLET, { angle: 80, over: 0.3 });
    suckers(t1);
    // the tentacle holding the paintbrush up: in battle it paints the air
    c.part('pinceau', { pivot: [380, 600], motion: 'reach', amp: -22, period: 2.2 }, () => {
      const t2: P[] = [[400, 600], [300, 590], [230, 520], [220, 440]];
      shape(band(t2, 74, 30), VIOLET, { angle: 30, over: 0.3 });
      suckers(t2);
      shape(band([[230, 470], [200, 330], [190, 250]], 22, 18), WOOD, { angle: 80, over: 0 });
      shape([[178, 260], [205, 255], [205, 215], [178, 220]], GOLD, { over: 0 }, { w: 3.5 }, false);
      shape([[176, 222], [190, 150], [208, 220]], BRISTLE, { over: 0 }, { w: 3.5 }, false);
      shape([[184, 178], [190, 150], [198, 178]], PAINT, { over: 0, press: 1.2 }, { w: 3 }, false);
      shape([[170, 196], [178, 214], [170, 226], [162, 214]], PAINT, { over: 0 }, { w: 3 }, true);
    });
    // big shiny eyes shifted left (the far one smaller), pink cheeks, a little smile
    for (const [x, y, r] of [[360, 420, 34], [480, 410, 46]] as const) {
      shape(potato(x, y, r, r * 1.15, 9, 0.03), '#2f2a4a', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - r * 0.3, y - r * 0.38, r * 0.34, r * 0.3, '#ffffff');
      dot(x + r * 0.25, y + r * 0.3, r * 0.13, r * 0.12, '#ffffff');
    }
    shape(potato(330, 505, 30, 18, 7, 0.1), '#f48ab0', { over: 0 }, { w: 0.1 });
    shape(potato(545, 500, 36, 20, 7, 0.1), '#f48ab0', { over: 0 }, { w: 0.1 });
    stroke([[400, 520], [425, 540], [452, 520]], { w: 5 });
    // bubbles
    for (const [x, y, r] of [[300, 180, 16], [340, 110, 10], [780, 230, 13]] as const) c.paper(potato(x, y, r, r, 8, 0.05), { w: 3.5 });
  },
} satisfies Redraw;
