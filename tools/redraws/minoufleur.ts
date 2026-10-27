import type { P, Redraw } from './crayon.ts';

/**
 * Minousse grown: a pale blue cat crouching three-quarters to the left, dark blue spots, a pink bud on its
 * back between big jagged leaves raised like jaws, vines coiled like whips, red eyes, a shut snarl with fangs.
 */
export default {
  id: '020', slug: 'minoufleur', seed: 2022, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, spikes, potato, band } = c;
    const PALE = '#cfe6f7', SPOT = '#3e6fd0', PINK = '#ef5f9e', GREEN = '#6cc23a', RED = '#e8302c';
    // the vine raised behind, coiled
    c.part('liane-loin', { pivot: [640, 480], motion: 'swing', amp: 7, period: 2.2, behind: true }, () => {
      shape(band([[640, 480], [760, 420], [860, 330], [880, 240], [825, 195], [770, 225], [790, 285]], 48, 22), GREEN, { angle: 120, press: 1.1 });
    });
    // back legs, the body behind on the right with its spots
    shape([[820, 700], [900, 700], [910, 880], [830, 885]], PALE, { angle: 90 });
    shape([[480, 470], [700, 430], [880, 480], [930, 620], [880, 770], [680, 800], [520, 760], [470, 620]], PALE, { angle: 85, over: 0.5 });
    for (const [x, y] of [[620, 540], [760, 520], [840, 640], [700, 680], [560, 680]]) shape(potato(x, y, 28, 24, 6, 0.15), SPOT, { over: 0 }, { w: 3.5 });
    shape([[690, 720], [780, 720], [785, 890], [700, 895]], PALE, { angle: 90 });
    for (const x of [700, 730, 760]) stroke([[x, 893], [x - 6, 922]], { w: 4 });
    // the big pink bud on its back, the leaves raised like jaws
    shape(potato(640, 300, 150, 140, 13, 0.05), PINK, { angle: 80, over: 0.6, press: 1.1 });
    stroke([[575, 205], [640, 285], [715, 200]], { w: 4.5 });
    shape(([[560, 360], [480, 250], [360, 150], [220, 90], [130, 80], [190, 160]] as P[]).concat(spikes([[190, 160], [300, 270], [430, 350], [540, 420]], 6, 30)), GREEN, { angle: 30, press: 1.15, over: 0.5 }, {}, false);
    shape(([[720, 360], [790, 240], [900, 150], [990, 100], [975, 175]] as P[]).concat(spikes([[975, 175], [890, 270], [800, 350], [720, 420]], 5, -30)), GREEN, { angle: 150, press: 1.15, over: 0.5 }, {}, false);
    // the far front leg, the chest, the near front leg
    shape([[470, 690], [550, 690], [560, 880], [478, 885]], PALE, { angle: 90 });
    shape([[280, 560], [520, 560], [560, 700], [520, 770], [300, 770], [260, 680]], PALE, { angle: 85, over: 0.4 });
    shape([[320, 690], [410, 690], [405, 890], [318, 895]], PALE, { angle: 90 });
    for (const x of [325, 355, 385, 485, 515, 545]) stroke([[x, 893], [x - 6, 922]], { w: 4 });
    // the near vine, coiled low in front, ready to whip
    c.part('liane', { pivot: [330, 600], motion: 'swing', amp: 6, period: 1.9 }, () => {
      shape(band([[330, 600], [230, 640], [130, 610], [80, 520], [100, 430], [165, 410], [200, 460]], 50, 22), GREEN, { angle: 60, press: 1.1 });
    });
    // ears, their base hidden in the head
    shape([[250, 430], [245, 300], [330, 400]], PALE, { angle: 70 }, {}, false);
    shape([[400, 380], [500, 270], [510, 430]], PALE, { angle: 110 }, {}, false);
    // the head turned left: fierce red eyes under frowning brows, a shut snarl with two fangs
    shape([[230, 470], [290, 380], [420, 360], [530, 410], [550, 520], [500, 610], [380, 640], [270, 620], [200, 560], [195, 500]], PALE, { angle: 80, over: 0.5 });
    shape(potato(430, 405, 20, 15, 7, 0.1), SPOT, { over: 0 }, { w: 3 });
    shape([[250, 470], [320, 482], [305, 520], [262, 512]], RED, { over: 0, press: 1.2 }, { w: 4 }, false);
    shape([[390, 482], [480, 465], [470, 515], [410, 525]], RED, { over: 0, press: 1.2 }, { w: 4 }, false);
    dot(288, 496, 8, 10);
    dot(432, 496, 9, 10);
    stroke([[235, 445], [330, 475]], { w: 7 });
    stroke([[385, 475], [500, 440]], { w: 7 });
    dot(222, 545, 9, 7);
    c.paper([[270, 588], [285, 628], [300, 590]], {}, false);
    c.paper([[380, 590], [396, 630], [412, 588]], {}, false);
    stroke([[230, 575], [290, 592], [340, 582], [395, 592], [455, 572]], { w: 5.5 });
  },
} satisfies Redraw;
