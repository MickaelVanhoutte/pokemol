import type { P, Redraw } from './crayon.ts';

/**
 * A sheep of dust that lives under the bed, turned to the left: a big grey fluffball with curly edges, a lost red
 * sock and a stub of crayon caught in its fluff, a dark sheep face with curled horns and wide worried eyes (it is
 * afraid of the dark), two little front legs, and its back end trailing off into wisps of dust like a ghost.
 */
export default {
  id: '088', slug: 'moutoussiere', seed: 8801, size: [1050, 900], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const DUST = '#c4c0c8', DEEP = '#9a95a2', FACE = '#5a5560', HORN = '#8c8794', SOCK = '#e2423a', CRAYON = '#4f8fe0';
    // wisps of dust trailing off behind it, like a ghost's tail
    shape([[700, 420], [860, 380], [960, 300], [1010, 330], [940, 420], [1020, 470], [930, 520], [990, 600], [880, 600], [760, 600]], DUST, { angle: 20, over: 0.2, press: 0.85 }, { w: 3.5 });
    stroke([[850, 430], [930, 380]], { w: 3, col: DEEP });
    stroke([[860, 540], [950, 560]], { w: 3, col: DEEP });
    // the far front leg, behind
    shape(band([[360, 640], [350, 780]], 34, 30), FACE, { angle: 90, over: 0 });
    // the big fluffball of a body, curly all round
    const fluff: P[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2, r = i % 2 ? 1 : 1.13;
      fluff.push([560 + Math.cos(a) * 280 * r, 470 + Math.sin(a) * 200 * r]);
    }
    shape(fluff, DUST, { angle: 70, over: 0.45 });
    c.tint([[620, 600], [800, 520], [820, 600], [700, 660]], DEEP, { gap: 3.6 });
    // curls in the fluff
    for (const [x, y] of [[520, 380], [660, 430], [740, 360], [600, 540], [460, 520], [700, 560]] as const) {
      const curl: P[] = [];
      for (let k = 0; k < 9; k++) { const a = k * 0.85, r = 6 + k * 2.4; curl.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8]); }
      stroke(curl, { w: 3, col: DEEP });
    }
    // a lost red sock and a crayon stub caught in its fluff
    shape([[660, 280], [700, 270], [710, 360], [760, 380], [750, 410], [680, 400], [670, 360]], SOCK, { angle: 80, over: 0 }, { w: 3.5 }, false);
    stroke([[662, 300], [702, 292]], { w: 3, col: '#ffffff' });
    shape([[770, 470], [850, 440], [860, 465], [780, 495]], CRAYON, { angle: 20, over: 0 }, { w: 3.5 }, false);
    shape([[850, 440], [885, 445], [860, 465]], '#f3e6c4', { over: 0 }, { w: 3 }, false);
    // the near front leg
    shape(band([[440, 650], [440, 800]], 38, 34), FACE, { angle: 90, over: 0 });
    shape(potato(436, 808, 30, 16, 7, 0.06), '#35303a', { over: 0 });
    shape(potato(346, 790, 28, 15, 7, 0.06), '#35303a', { over: 0 });
    // the far horn, the dark sheep face turned left, the near horn curled
    shape(band([[380, 330], [420, 280], [470, 300], [460, 350], [420, 345]], 34, 24), HORN, { angle: 30, over: 0 });
    shape([[180, 450], [220, 360], [320, 320], [400, 360], [410, 470], [360, 560], [260, 580], [190, 540]], FACE, { angle: 80, over: 0.4 });
    shape(band([[330, 350], [290, 300], [230, 310], [220, 370], [270, 390], [290, 360]], 40, 26), HORN, { angle: 30, over: 0 });
    // a fluffy fringe over its brow
    shape(potato(330, 340, 70, 40, 10, 0.12), DUST, { over: 0.2 }, { w: 3.5 });
    // wide worried eyes, brows up, a wobbly little mouth
    c.paper(potato(250, 440, 30, 36, 8, 0.05));
    c.paper(potato(345, 432, 34, 40, 8, 0.05));
    dot(244, 450, 13, 17);
    dot(338, 442, 15, 19);
    dot(239, 440, 4.5, 5.5, '#ffffff');
    dot(332, 431, 5, 6, '#ffffff');
    stroke([[220, 390], [262, 378]], { w: 6, col: '#f2eef5' });
    stroke([[322, 376], [370, 388]], { w: 6, col: '#f2eef5' });
    stroke([[240, 530], [262, 520], [282, 532], [304, 520]], { w: 5, col: '#f2eef5' });
  },
} satisfies Redraw;
