import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Moutoussière's fair copy, Normal/Flying, the same drawing grown up: its fluff bigger and puffier, grown
 * into two great wings of dust on its back that beat like clouds, its ghostly trail longer with more wisps, its
 * curled horns bigger, its worried eyes now brave under frowning brows, a bold grin, the sock and crayon still caught
 * in its fluff, and the gold star in the fluff of its side.
 */
export default {
  id: '088', slug: 'moutoussiere', seed: 88088, size: [1090, 900], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const DUST = '#c4c0c8', DEEP = '#9a95a2', FACE = '#5a5560', HORN = '#8c8794', SOCK = '#e2423a', CRAYON = '#4f8fe0', LIGHT = '#f2eef5';
    /** Round puffs along a path, bulging to its left (a cloud's edge). */
    const puffs = (path: P[], h: number): P[] => {
      const out: P[] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const [a, b] = [path[i], path[i + 1]];
        const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
        out.push(a);
        for (const [t, k] of [[0.2, 0.62], [0.5, 1], [0.8, 0.62]] as P[]) out.push([a[0] + (b[0] - a[0]) * t + (nx / l) * h * k, a[1] + (b[1] - a[1]) * t + (ny / l) * h * k]);
      }
      out.push(path[path.length - 1]);
      return out;
    };
    /** A wing of fluff from its root on the back: a round leading edge up to the tip, puffs all along the trailing edge. */
    const wing = (root: P, lead: P[], tip: P, trail: P[], h: number) => {
      const edge = puffs([root, ...trail, tip], h).slice(1, -1).reverse();
      shape([root, ...lead, tip, ...edge], DUST, { angle: 40, over: 0.35, press: 0.9 });
      for (const t of trail.slice(1)) stroke([[root[0] + (tip[0] - root[0]) * 0.2, root[1] + (tip[1] - root[1]) * 0.2], [t[0] * 0.85 + root[0] * 0.15, t[1] * 0.85 + root[1] * 0.15]], { w: 3.5, col: DEEP });
    };
    // the far wing of dust, behind, peeking past the near one
    c.part('aile-loin', { pivot: [540, 330], motion: 'flap', amp: 10, period: 0.9, behind: true }, () => {
      wing([540, 330], [[495, 220], [530, 110], [620, 45]], [730, 20], [[620, 290], [670, 190], [715, 100]], 40);
    });
    // the near wing of dust grown out of its fluff
    c.part('aile', { pivot: [640, 330], motion: 'flap', amp: 12, period: 0.9, behind: true }, () => {
      wing([640, 330], [[600, 210], [650, 100], [770, 40]], [925, 30], [[730, 350], [810, 280], [870, 190], [915, 105]], 46);
    });
    // wisps of dust trailing off behind it, like a ghost's tail, longer
    c.part('traine', { pivot: [740, 500], motion: 'swing', amp: 6, period: 2.6, behind: true }, () => {
      shape([[720, 410], [880, 370], [990, 280], [1050, 300], [970, 400], [1075, 440], [975, 500], [1065, 570], [960, 600], [1020, 670], [900, 650], [780, 610]], DUST, { angle: 20, over: 0.2, press: 0.85 });
      stroke([[870, 420], [960, 360]], { w: 4, col: DEEP });
      stroke([[880, 520], [990, 540]], { w: 4, col: DEEP });
      stroke([[870, 600], [950, 640]], { w: 4, col: DEEP });
    });
    // the far front leg, behind
    shape(band([[360, 640], [350, 780]], 36, 32), FACE, { angle: 90, over: 0 });
    // the big fluffball of a body, puffier, curly all round
    const fluff: P[] = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2, r = i % 2 ? 1 : 1.15;
      fluff.push([575 + Math.cos(a) * 300 * r, 470 + Math.sin(a) * 212 * r]);
    }
    shape(fluff, DUST, { angle: 70, over: 0.45 });
    c.tint([[640, 610], [830, 520], [850, 610], [720, 670]], DEEP, { gap: 3.6 });
    // curls in the fluff
    for (const [x, y] of [[530, 370], [680, 440], [760, 350], [460, 500], [700, 580], [830, 450]] as const) {
      const curl: P[] = [];
      for (let k = 0; k < 9; k++) { const a = k * 0.85, r = 7 + k * 2.8; curl.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8]); }
      stroke(curl, { w: 4, col: DEEP });
    }
    c.star(560, 590, 46, -8);
    // a lost red sock and a crayon stub caught in its fluff
    shape([[660, 270], [702, 260], [712, 352], [766, 372], [756, 406], [680, 396], [668, 352]], SOCK, { angle: 80, over: 0 }, { w: 5 }, false);
    stroke([[662, 292], [704, 284]], { w: 4, col: '#ffffff' });
    shape([[780, 478], [862, 446], [872, 472], [790, 504]], CRAYON, { angle: 20, over: 0 }, { w: 5 }, false);
    shape([[862, 446], [900, 452], [872, 472]], '#f3e6c4', { over: 0 }, { w: 4 }, false);
    // the near front leg
    shape(band([[440, 650], [440, 800]], 40, 36), FACE, { angle: 90, over: 0 });
    shape(potato(436, 808, 32, 17, 7, 0.06), '#35303a', { over: 0 });
    shape(potato(346, 790, 30, 16, 7, 0.06), '#35303a', { over: 0 });
    // the far horn, bigger, the dark sheep face turned left, the near horn curled bigger
    shape(band([[380, 330], [425, 262], [500, 270], [505, 345], [450, 352]], 44, 22), HORN, { angle: 30, over: 0 });
    shape([[180, 450], [220, 360], [320, 320], [400, 360], [410, 470], [360, 560], [260, 580], [190, 540]], FACE, { angle: 80, over: 0.4 });
    shape(band([[338, 352], [300, 282], [215, 278], [180, 350], [215, 412], [282, 405], [298, 352], [262, 335]], 54, 20), HORN, { angle: 30, over: 0 });
    for (const [a, b] of [[[290, 300], [275, 330]], [[205, 330], [235, 340]], [[215, 395], [240, 375]]] as [P, P][]) stroke([a, b], { w: 3.5, col: '#5f5a68' });
    // a fluffy fringe over its brow
    shape(potato(330, 340, 72, 42, 10, 0.12), DUST, { over: 0.2 });
    // brave eyes under frowning brows, a bold grin
    c.paper(potato(250, 442, 30, 32, 8, 0.05));
    c.paper(potato(345, 434, 34, 36, 8, 0.05));
    dot(242, 450, 13, 15);
    dot(336, 442, 15, 17);
    dot(237, 441, 4.5, 5, '#ffffff');
    dot(330, 432, 5, 5.5, '#ffffff');
    stroke([[212, 394], [276, 412]], { w: 10, col: LIGHT });
    stroke([[314, 410], [384, 386]], { w: 10, col: LIGHT });
    shape([[226, 520], [300, 512], [292, 540], [248, 548]], '#2e2a33', { over: 0 }, { col: LIGHT, w: 5 });
    c.paper([[262, 516], [272, 538], [282, 515]], { w: 3, col: LIGHT }, false);
  },
} satisfies Fair;
