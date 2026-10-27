import type { P, Redraw } from './crayon.ts';

/**
 * Dragounet grown: a long, graceful sea dragon rising from a loop of its own body, turned to the left: big
 * feathery white fins on its head, a little horn, a crystal orb at its throat and two on its tail, a cream belly.
 */
export default {
  id: '044', slug: 'dragondine', seed: 4402, size: [1150, 1150], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const BLUE = '#5b8ee8', BELLY = '#f4eedd', FIN = '#d3e2fb', ORB = '#8fd8ff', HORN = '#f3f6ff';
    // a path pushed sideways by d (from d0 at its start to d1 at its end)
    const offset = (path: P[], d0: number, d1: number): P[] => path.map((p, i) => {
      const q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)];
      const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1, d = d0 + ((d1 - d0) * i) / (path.length - 1);
      return [p[0] - (dy / l) * d, p[1] + (dx / l) * d];
    });
    const orb = (x: number, y: number, r: number) => {
      shape(potato(x, y, r, r, 9, 0.04), ORB, { angle: 60, over: 0, press: 1.1 }, { w: 4 });
      dot(x - r * 0.35, y - r * 0.35, r * 0.22, r * 0.28, '#ffffff');
    };
    const sparkle = (x: number, y: number, s: number) =>
      shape([[x, y - 34 * s], [x + 8 * s, y - 8 * s], [x + 34 * s, y], [x + 8 * s, y + 8 * s], [x, y + 34 * s], [x - 8 * s, y + 8 * s], [x - 34 * s, y], [x - 8 * s, y - 8 * s]], ORB, { over: 0 }, { w: 3 }, false);
    // one stretch of the body with its belly: widths w0 → w1, belly on the inner side
    const stretch = (path: P[], w0: number, w1: number, side: number) => {
      shape(band(path, w0, w1), BLUE, { angle: -40, over: 0.5 });
      const belly = offset(path, (side * w0) / 4, (side * w1) / 4);
      shape(band(belly, w0 / 3, w1 / 3), BELLY, { angle: 0, over: 0 }, { w: 3 });
      for (const [x, y] of belly.slice(1, -1)) stroke([[x - 10, y - 10], [x + 10, y + 10]], { w: 2.5 });
    };
    // the far fin on its head, behind
    shape([[430, 225], [380, 140], [330, 70], [345, 140], [280, 110], [320, 180], [255, 175], [330, 235], [400, 260]], FIN, { angle: 60, over: 0 }, {}, false);
    // the tail fin, then the body: down from the neck, round in a loop, then over itself and out to the tail
    shape([[1030, 640], [1050, 520], [1110, 470], [1100, 540], [1140, 560], [1080, 640]], FIN, { angle: 30, over: 0 }, {}, false);
    stretch([[470, 330], [540, 440], [565, 580], [625, 690], [740, 730], [860, 670], [885, 560], [820, 480], [700, 505], [660, 570]], 118, 80, 1);
    stretch([[700, 505], [645, 610], [625, 760], [680, 900], [820, 965], [960, 915], [1040, 800], [1060, 650]], 80, 44, -1);
    // the orbs on its tail and at its throat
    orb(1052, 760, 26);
    orb(1062, 700, 20);
    orb(500, 470, 36);
    // the near fin, big and feathery, the little horn, the head turned left
    shape([[560, 255], [640, 160], [730, 80], [820, 50], [790, 120], [860, 120], [790, 185], [850, 210], [760, 250], [800, 280], [690, 290], [600, 300]], FIN, { angle: 30, over: 0 }, {}, false);
    shape([[365, 222], [372, 150], [410, 212]], HORN, { over: 0 }, { w: 4 }, false);
    shape([[250, 300], [320, 225], [440, 190], [570, 210], [620, 290], [585, 365], [470, 400], [350, 390], [255, 372], [215, 340]], BLUE, { angle: 80, over: 0.4 });
    // a calm, proud face
    c.paper(potato(350, 285, 18, 23, 8, 0.05));
    c.paper(potato(445, 278, 23, 27, 8, 0.05));
    dot(345, 291, 9, 14);
    dot(439, 284, 12, 17);
    dot(341, 283, 3, 4, '#ffffff');
    dot(435, 275, 4, 5, '#ffffff');
    stroke([[318, 250], [370, 257]], { w: 5 });
    stroke([[413, 247], [475, 238]], { w: 5.5 });
    dot(232, 325, 5, 4);
    stroke([[242, 352], [290, 364], [335, 352]], { w: 5 });
    // sparkles round it
    for (const [x, y, s] of [[150, 520, 1], [230, 840, 0.8], [960, 330, 0.9], [1050, 250, 0.6], [760, 600, 0.55], [420, 960, 0.7]] as const) sparkle(x, y, s);
  },
} satisfies Redraw;
