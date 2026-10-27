import type { Redraw } from './crayon.ts';

/** A green caterpillar on round little feet: a red forked feeler, a big eye, a yellow dot on each ring. */
export default {
  id: '012', slug: 'chenillou', seed: 1212, size: [1100, 800], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const GREEN = '#7ccc3c', YELLOW = '#f7d43a', RED = '#ee4636', CREAM = '#f6e6a8';
    // the rings, from the tail to the head, bobbing up and down
    const rings: [number, number, number][] = [[960, 560, 75], [840, 520, 88], [710, 560, 98], [570, 520, 108]];
    for (const [x, y, r] of rings) {
      shape(potato(x - 10, y + r * 0.95, 30, 22, 7, 0.1), GREEN, { over: 0 });
      shape(potato(x, y, r, r * 0.95, 12, 0.04), GREEN, { angle: 80, over: 0.4 });
      shape(potato(x + r * 0.15, y - r * 0.15, r * 0.3, r * 0.28, 9, 0.05), YELLOW, { over: 0, press: 1.1 }, { w: 3.5 });
    }
    // the red forked feeler
    c.part('antenne', { pivot: [320, 235], motion: 'swing', amp: 10, period: 1.8, behind: true }, () => {
      shape([[300, 230], [270, 120], [300, 130], [320, 190], [350, 110], [380, 120], [340, 230]], RED, { angle: 80, press: 1.1, over: 0 }, {}, false);
    });
    // the head, a cream face, a big eye
    shape(potato(330, 400, 175, 160, 12, 0.04), GREEN, { angle: 80, over: 0.5 });
    shape(potato(260, 450, 90, 80, 10, 0.05), CREAM, { over: 0 });
    c.paper(potato(345, 370, 55, 62, 10, 0.04));
    dot(330, 380, 28, 36);
    dot(320, 366, 8, 10, '#ffffff');
    stroke([[215, 470], [245, 490], [280, 478]]);
    shape(potato(300, 590, 34, 24, 7, 0.1), GREEN, { over: 0 });
  },
} satisfies Redraw;
