import type { P, Redraw } from './crayon.ts';

/**
 * Minousse grown: a pale blue cat crouching to pounce, dark blue spots, a pink bud on its back, and big
 * jagged leaves raised on both sides like jaws ready to snap, long leafy vines down to the ground, red eyes.
 */
export default {
  id: '020', slug: 'minoufleur', seed: 2021, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, spikes, potato, band } = c;
    const PALE = '#cfe6f7', SPOT = '#3e6fd0', PINK = '#ef5f9e', GREEN = '#6cc23a', RED = '#e8302c';
    // the body behind, to the left, with its spots and a clawed back foot
    shape([[140, 520], [300, 430], [460, 470], [480, 700], [360, 780], [170, 760], [100, 650]], PALE, { angle: 85, over: 0.5 });
    for (const [x, y] of [[200, 560], [300, 640], [380, 540], [220, 690]]) shape(potato(x, y, 26, 22, 6, 0.15), SPOT, { over: 0 }, { w: 3.5 });
    shape(spikes([[160, 760], [190, 830], [260, 840], [280, 770]], 1, -18), PALE, { over: 0 }, {}, false);
    // the big pink bud
    shape(potato(520, 230, 160, 150, 13, 0.05), PINK, { angle: 80, over: 0.6, press: 1.1 });
    stroke([[450, 130], [520, 210], [600, 125]], { w: 4.5 });
    // jagged leaves raised like jaws, teeth along their inside edge
    shape(([[450, 340], [380, 220], [260, 130], [120, 70], [30, 60], [90, 140]] as P[]).concat(spikes([[90, 140], [200, 250], [330, 330], [440, 400]], 6, 30)), GREEN, { angle: 30, press: 1.15, over: 0.5 }, {}, false);
    shape(([[620, 340], [690, 220], [810, 130], [930, 70], [990, 60], [940, 140]] as P[]).concat(spikes([[940, 140], [830, 250], [720, 330], [620, 400]], 6, -30)), GREEN, { angle: 150, press: 1.15, over: 0.5 }, {}, false);
    // long leafy vines hanging to the ground
    shape(band([[400, 420], [300, 560], [250, 760], [240, 930]], 46, 38), GREEN, { angle: 90 });
    shape(band([[700, 420], [820, 560], [850, 760], [860, 930]], 46, 38), GREEN, { angle: 90 });
    // front legs, clawed
    shape([[440, 700], [530, 700], [535, 880], [445, 885]], PALE, { angle: 90 });
    shape([[600, 700], [690, 700], [695, 880], [605, 885]], PALE, { angle: 90 });
    for (const x of [450, 480, 510, 610, 640, 670]) stroke([[x, 885], [x + 6, 915]], { w: 4 });
    shape(potato(650, 780, 18, 18, 6, 0.1), SPOT, { over: 0 }, { w: 3 });
    // the head in front, cat ears, fierce red eyes, a snarl with fangs
    shape([[420, 350], [450, 250], [500, 340]], PALE, { angle: 70 }, {}, false);
    shape([[630, 340], [690, 245], [710, 360]], PALE, { angle: 110 }, {}, false);
    shape(potato(570, 500, 170, 150, 13, 0.04), PALE, { angle: 80, over: 0.5 });
    shape(potato(620, 395, 22, 16, 7, 0.1), SPOT, { over: 0 }, { w: 3 });
    shape([[450, 455], [540, 470], [520, 510], [465, 500]], RED, { over: 0, press: 1.2 }, { w: 4 }, false);
    shape([[610, 470], [700, 452], [690, 500], [630, 510]], RED, { over: 0, press: 1.2 }, { w: 4 }, false);
    dot(500, 482, 9, 10);
    dot(650, 482, 9, 10);
    stroke([[430, 425], [550, 462]], { w: 7 });
    stroke([[600, 462], [720, 422]], { w: 7 });
    shape([[480, 560], [660, 560], [630, 615], [570, 630], [510, 615]], '#7a2430', { over: 0 }, { w: 4.5 });
    c.paper([[495, 560], [515, 600], [532, 560]], {}, false);
    c.paper([[610, 560], [627, 600], [645, 560]], {}, false);
    dot(570, 540, 8, 6);
  },
} satisfies Redraw;
