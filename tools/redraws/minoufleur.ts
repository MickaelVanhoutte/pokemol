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
    // the body behind, to the left, joined to the chest, a clawed back foot
    shape(spikes([[170, 740], [190, 820], [270, 830], [300, 750]], 1, -18), PALE, { over: 0 }, {}, false);
    shape([[140, 520], [300, 430], [480, 460], [560, 600], [520, 760], [360, 790], [170, 770], [100, 650]], PALE, { angle: 85, over: 0.5 });
    for (const [x, y] of [[200, 560], [300, 650], [380, 540], [220, 700]]) shape(potato(x, y, 26, 22, 6, 0.15), SPOT, { over: 0 }, { w: 3.5 });
    // vines coiled like whips, ready to strike
    shape(band([[470, 560], [340, 610], [220, 580], [140, 480], [150, 380], [215, 350], [255, 400]], 50, 22), GREEN, { angle: 60, press: 1.1 });
    shape(band([[680, 560], [800, 610], [910, 560], [975, 450], [950, 360], [885, 345], [860, 400]], 50, 22), GREEN, { angle: 120, press: 1.1 });
    // front legs, clawed, under a solid chest
    shape([[440, 680], [530, 680], [535, 880], [445, 885]], PALE, { angle: 90 });
    shape([[610, 680], [700, 680], [705, 880], [615, 885]], PALE, { angle: 90 });
    for (const x of [450, 480, 510, 620, 650, 680]) stroke([[x, 885], [x + 6, 915]], { w: 4 });
    shape([[420, 560], [720, 560], [735, 700], [700, 760], [440, 760], [410, 690]], PALE, { angle: 85, over: 0.4 });
    shape(potato(660, 700, 20, 18, 6, 0.1), SPOT, { over: 0 }, { w: 3 });
    // the big pink bud
    shape(potato(560, 240, 160, 150, 13, 0.05), PINK, { angle: 80, over: 0.6, press: 1.1 });
    stroke([[490, 140], [560, 220], [640, 135]], { w: 4.5 });
    // jagged leaves raised like jaws, teeth along their inside edge
    shape(([[470, 350], [400, 230], [280, 140], [140, 80], [50, 70], [110, 150]] as P[]).concat(spikes([[110, 150], [220, 260], [350, 340], [460, 410]], 6, 30)), GREEN, { angle: 30, press: 1.15, over: 0.5 }, {}, false);
    shape(([[650, 350], [720, 230], [840, 140], [960, 80], [1000, 75], [960, 150]] as P[]).concat(spikes([[960, 150], [850, 260], [740, 340], [650, 410]], 6, -30)), GREEN, { angle: 150, press: 1.15, over: 0.5 }, {}, false);
    // cat ears, their base hidden in the head
    shape([[445, 440], [450, 265], [560, 380]], PALE, { angle: 70 }, {}, false);
    shape([[600, 380], [705, 260], [715, 440]], PALE, { angle: 110 }, {}, false);
    // the head in front: fierce red eyes under frowning brows, a shut mouth with two fangs
    shape(potato(580, 500, 170, 150, 13, 0.04), PALE, { angle: 80, over: 0.5 });
    shape(potato(630, 395, 22, 16, 7, 0.1), SPOT, { over: 0 }, { w: 3 });
    shape([[460, 455], [550, 470], [530, 510], [475, 500]], RED, { over: 0, press: 1.2 }, { w: 4 }, false);
    shape([[620, 470], [710, 452], [700, 500], [640, 510]], RED, { over: 0, press: 1.2 }, { w: 4 }, false);
    dot(510, 482, 9, 10);
    dot(660, 482, 9, 10);
    stroke([[440, 425], [560, 462]], { w: 7 });
    stroke([[610, 462], [730, 422]], { w: 7 });
    dot(585, 540, 8, 6);
    c.paper([[512, 588], [528, 628], [544, 590]], {}, false);
    c.paper([[622, 590], [638, 630], [654, 588]], {}, false);
    stroke([[480, 575], [535, 592], [585, 582], [635, 592], [690, 572]], { w: 5.5 });
  },
} satisfies Redraw;
