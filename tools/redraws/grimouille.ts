import type { Redraw } from './crayon.ts';

/** A floating purple head turned to the left, spiky all over, a red toothy mouth, two hands wandering off on their own. */
export default {
  id: '010', slug: 'grimouille', seed: 1011, size: [1000, 1000], tilt: 3,
  draw(c) {
    const { shape, stroke, paper } = c;
    const PURPLE = '#7a43cc', RED = '#e8383c';
    // the far hand, smaller, behind on the right
    shape([[800, 720], [790, 660], [825, 690], [845, 630], [865, 695], [905, 660], [890, 735], [845, 770]], PURPLE, { angle: 120, press: 1.1 }, {}, false);
    // the head, spikes and pointed ears, its face on the left
    shape([[220, 430], [130, 330], [260, 330], [280, 200], [370, 290], [420, 150], [480, 280], [560, 170], [600, 290], [720, 200], [730, 330], [870, 300],
      [790, 440], [790, 570], [690, 660], [500, 690], [330, 650], [230, 560]], PURPLE, { angle: 80, over: 0.6, press: 1.1 }, {}, false);
    // angry eyes, the far one narrower
    paper([[290, 395], [370, 420], [365, 470], [300, 470]]);
    paper([[460, 395], [580, 420], [570, 470], [480, 470]]);
    c.dot(340, 442, 14, 20);
    c.dot(525, 442, 18, 22);
    stroke([[275, 372], [380, 405]], { w: 6 });
    stroke([[440, 370], [595, 405]], { w: 6 });
    // a big red mouth with teeth, toward the left
    shape([[270, 520], [570, 520], [520, 610], [410, 640], [310, 610]], RED, { angle: 0, over: 0 }, {}, false);
    paper([[280, 520], [560, 520], [540, 545], [510, 525], [480, 550], [450, 525], [420, 550], [390, 525], [360, 550], [330, 525], [300, 548]], {}, false);
    // the near hand, big, reaching out in front
    shape([[130, 780], [100, 690], [160, 735], [175, 640], [215, 730], [265, 680], [245, 790], [190, 840]], PURPLE, { angle: 60, press: 1.1 }, {}, false);
    for (const [x, y] of [[80, 830], [120, 880], [900, 800], [870, 840]]) stroke([[x, y], [x + 40, y - 20]], { w: 3.5 });
  },
} satisfies Redraw;
