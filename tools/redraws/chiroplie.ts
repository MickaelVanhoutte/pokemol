import type { P, Redraw } from './crayon.ts';

/**
 * A little bat cut out of folded black paper, like the ones children make for Halloween, turned to the left:
 * a round body, big pointed ears lined with poison green, scalloped wings, and two googly eyes stuck on
 * crooked, a single fang.
 */
export default {
  id: '103', slug: 'chiroplie', seed: 10307, size: [1000, 1000], tilt: -4,
  draw(c) {
    const { shape, paper, stroke, dot, tint, potato } = c;
    const BLACK = '#3a3346', VIOLET = '#7d5cb5', GREEN = '#8fd14f';
    const flap = { motion: 'flap', amp: 22, period: 0.5 } as const;
    /** Finger bones from the shoulder to the points of the scalloped edge. */
    const bones = (from: P, tips: P[]) => { for (const t of tips) stroke([from, t], { w: 3, col: '#8a7fa0' }); };
    /** The far wing is seen at a slant: drawn smaller, towards the shoulder. */
    const far = (pts: P[]): P[] => pts.map(([x, y]) => [430 + (x - 430) * 0.72, 470 + (y - 470) * 0.8]);
    // the far wing, smaller, behind the body
    c.part('aile-loin', { pivot: [430, 470], ...flap, behind: true }, () => {
      const wing: P[] = [[440, 450], [340, 360], [215, 315], [120, 345], [160, 415], [125, 480], [200, 495], [195, 560], [290, 535], [420, 525]];
      shape(far(wing), BLACK, { angle: 30, over: 0.5 });
      tint(far([[400, 470], [320, 390], [210, 345], [170, 400], [210, 470], [300, 510]]), VIOLET, { gap: 3.4, wash: 0.3, press: 0.7 });
      bones([430, 465], far([[120, 345], [125, 480], [195, 560]]));
    });
    // the round body
    shape(potato(495, 505, 122, 132, 11, 0.05), BLACK, { angle: 80, over: 0.6 });
    tint(potato(500, 575, 60, 58, 9, 0.06), VIOLET, { gap: 3.2, wash: 0.4 });
    // big pointed ears, lined with green
    shape([[395, 420], [350, 290], [455, 390]], BLACK, { angle: 70, over: 0.4 }, {}, false);
    tint([[400, 405], [362, 320], [432, 388]], GREEN, { gap: 3 });
    shape([[505, 380], [560, 225], [592, 405]], BLACK, { angle: 100, over: 0.4 }, {}, false);
    tint([[520, 380], [555, 275], [575, 395]], GREEN, { gap: 3 });
    // little claws at the bottom
    for (const x of [450, 530]) stroke([[x, 630], [x - 10, 668], [x + 10, 655], [x + 18, 670]], { w: 4.5 }, false);
    // googly eyes stuck on crooked, the far one smaller, pupils rolling about
    paper(potato(400, 470, 34, 34, 10, 0.02), { w: 4.5 });
    paper(potato(492, 458, 50, 50, 10, 0.02), { w: 4.5 });
    dot(394, 485, 17, 17);
    dot(506, 443, 25, 25);
    // a little grin and a single fang
    stroke([[400, 548], [440, 565], [485, 552]], { w: 5 });
    paper([[418, 556], [432, 590], [444, 561]], { w: 3 }, false);
    // the near wing, big: in battle the wings flap together
    c.part('aile', { pivot: [570, 470], ...flap }, () => {
      const wing: P[] = [[560, 445], [680, 345], [825, 300], [935, 335], [885, 420], [935, 490], [850, 500], [870, 575], [745, 550], [590, 545]];
      shape(wing, BLACK, { angle: 150, over: 0.5 });
      tint([[600, 470], [690, 380], [820, 335], [880, 380], [830, 470], [720, 520]], VIOLET, { gap: 3.4, wash: 0.3, press: 0.7 });
      bones([575, 470], [[935, 335], [935, 490], [870, 575]]);
    });
  },
} satisfies Redraw;
