import type { Redraw } from './crayon.ts';

/** A floating purple head, spiky all over, a red toothy mouth, and two hands that wander off by themselves. */
export default {
  id: '010', slug: 'grimouille', seed: 1010, size: [1000, 1000], tilt: 3,
  draw(c) {
    const { shape, stroke, paper } = c;
    const PURPLE = '#7a43cc', RED = '#e8383c';
    // the head, spikes and pointed ears
    shape([[240, 420], [140, 300], [280, 320], [300, 200], [380, 290], [430, 150], [480, 280], [560, 170], [590, 290], [700, 200], [700, 320], [850, 260],
      [770, 420], [780, 560], [680, 660], [500, 690], [320, 650], [230, 560]], PURPLE, { angle: 80, over: 0.6, press: 1.1 }, {}, false);
    // angry eyes
    paper([[330, 390], [450, 420], [440, 470], [360, 470]]);
    paper([[680, 390], [560, 420], [570, 470], [650, 470]]);
    c.dot(410, 440, 18, 22);
    c.dot(600, 440, 18, 22);
    stroke([[310, 365], [460, 405]], { w: 6 });
    stroke([[700, 365], [550, 405]], { w: 6 });
    // a big red mouth with teeth
    shape([[340, 520], [660, 520], [610, 610], [500, 640], [390, 610]], RED, { angle: 0, over: 0 }, {}, false);
    paper([[350, 520], [650, 520], [630, 545], [600, 525], [570, 550], [540, 525], [510, 550], [480, 525], [450, 550], [420, 525], [390, 550], [365, 528]], {}, false);
    // the hands, off on their own
    shape([[150, 780], [120, 700], [175, 740], [190, 660], [225, 740], [270, 690], [250, 790], [200, 840]], PURPLE, { angle: 60, press: 1.1 }, {}, false);
    shape([[760, 820], [740, 740], [790, 770], [820, 690], [845, 780], [900, 740], [870, 830], [810, 870]], PURPLE, { angle: 120, press: 1.1 }, {}, false);
    for (const [x, y] of [[100, 830], [140, 880], [920, 860], [880, 910]]) stroke([[x, y], [x + 40, y - 20]], { w: 3.5 });
  },
} satisfies Redraw;
