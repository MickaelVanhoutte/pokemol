import type { P, Redraw } from './crayon.ts';

/**
 * A snail turned to the left whose shell is a snow globe on a red base: inside the glass, snow falls on a tiny
 * house with a lit window. A pale blue body, two eye stalks with big dreamy eyes, a soft smile.
 */
export default {
  id: '087', slug: 'globargot', seed: 8701, size: [1000, 920], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BODY = '#a9c8ec', DEEP = '#7ea2d0', BASE = '#c8434a', GLASS = '#cfe6f7', ROOF = '#e2423a', WALL = '#f7e3b4', LIT = '#f7dc35', PINK = '#f29ac8';
    // the far eye stalk, behind
    shape(band([[250, 520], [260, 380], [290, 300]], 30, 22), BODY, { angle: 90, over: 0 });
    shape(potato(295, 280, 38, 40, 8, 0.05), BODY, { over: 0 });
    // the long soft body along the ground, its tail trailing right
    const body: P[] = [[150, 620], [190, 520], [300, 470], [420, 600], [600, 660], [800, 680], [930, 720], [880, 790], [600, 800], [320, 800], [170, 760], [120, 700]];
    shape(body, BODY, { angle: 10, over: 0.45 });
    c.tint([[180, 750], [880, 760], [860, 790], [600, 798], [320, 798], [190, 770]], DEEP, { gap: 3.6, angle: 10 });
    // the red base of the globe on its back
    shape([[420, 660], [470, 560], [760, 560], [810, 660], [720, 690], [520, 692]], BASE, { angle: 0, over: 0.4 }, { w: 4.5 }, false);
    stroke([[455, 600], [775, 600]], { w: 3.5, col: '#8f2a30' });
    // the glass globe: snow on the ground, a tiny house with a lit window, flakes falling
    c.paper(potato(615, 380, 210, 205, 14, 0.015), { w: 5 });
    c.tint([[420, 330], [470, 230], [540, 190], [500, 260], [470, 360], [490, 470], [440, 450]], GLASS, { gap: 3.4, angle: 70 });
    c.tint([[790, 330], [810, 430], [760, 520], [700, 560], [750, 470], [780, 390]], GLASS, { gap: 3.4, angle: 110 });
    c.paper([[440, 500], [520, 450], [620, 440], [720, 455], [800, 500], [780, 550], [620, 570], [460, 550]], { w: 3.5 });
    shape([[560, 470], [560, 380], [680, 380], [680, 470]], WALL, { over: 0 }, { w: 3.5 }, false);
    shape([[540, 390], [620, 320], [700, 390]], ROOF, { over: 0 }, { w: 3.5 }, false);
    shape([[590, 400], [625, 400], [625, 432], [590, 432]], LIT, { over: 0 }, { w: 3 }, false);
    shape([[640, 425], [665, 425], [665, 470], [640, 470]], '#8a5326', { over: 0 }, { w: 3 }, false);
    c.paper([[548, 385], [620, 322], [692, 385], [680, 372], [620, 336], [560, 374]], { w: 2.5 }, false);
    c.part('neige', { pivot: [615, 320], motion: 'flicker', period: 1.8 }, () => {
      for (const [x, y] of [[480, 300], [540, 250], [700, 240], [760, 330], [720, 300], [500, 400], [610, 270], [740, 410], [660, 210]] as const)
        shape(potato(x, y, 9, 9, 7, 0.1), GLASS, { over: 0 }, { w: 2.5, col: '#7ea2d0' });
    });
    // a shine on the glass
    stroke([[480, 260], [520, 215], [575, 190]], { w: 6, col: '#ffffff' });
    // the near eye stalk and the head, turned left
    shape(potato(220, 600, 110, 90, 10, 0.05), BODY, { angle: 80, over: 0.3 });
    shape(band([[220, 540], [190, 400], [170, 320]], 34, 26), BODY, { angle: 90, over: 0 });
    shape(potato(165, 295, 46, 48, 8, 0.05), BODY, { over: 0 });
    // big dreamy eyes at the tips, a pink shine of dreams in them
    c.paper(potato(160, 292, 30, 32, 8, 0.05));
    c.paper(potato(292, 278, 24, 26, 8, 0.05));
    dot(152, 298, 15, 19);
    dot(286, 284, 12, 15);
    dot(146, 288, 5, 6, '#ffffff');
    dot(281, 276, 4, 5, '#ffffff');
    dot(160, 312, 4, 4, PINK);
    dot(292, 294, 3.5, 3.5, PINK);
    // a soft smile, rosy cheek
    stroke([[150, 640], [185, 658], [220, 646]], { w: 4.5 });
    c.tint(potato(250, 640, 24, 16, 8, 0.1), PINK, { gap: 3 });
  },
} satisfies Redraw;
