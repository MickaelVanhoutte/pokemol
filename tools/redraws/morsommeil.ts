import type { P, Redraw } from './crayon.ts';

/**
 * Givrinou grown into an old walrus, huge and placid (« vieux morse placide et imposant »), turned to the left: propped
 * up on its front flippers like a mountain on its ice floe, it looks down its nose at you, half-asleep and unbothered.
 * Its little ice tusks have grown into two great crystal tusks planted in the ice, its frosted whiskers into a
 * moustache hung with icicles, and the frost on its back into a ridge of ice: it has napped so long the ice grew on it.
 */
export default {
  id: '042', slug: 'morsommeil', seed: 4202, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot } = c;
    const BLUE = '#7698da', DEEP = '#5a7cc2', BELLY = '#cfdcf4', MUZZLE = '#e8eff9', ICE = '#c4eafa', ICEDEEP = '#74c0e2';
    const FLOE = '#c4eef0', FLOESIDE = '#8fd2dc', PINK = '#f29ab0', SNOW = '#f4fbff';

    /** A great crystal tusk from `root` to its `tip`, `w` wide at the root: faceted clear ice, a dark outline. */
    const tusk = (root: P, tip: P, w: number) => {
      const dx = tip[0] - root[0], dy = tip[1] - root[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
      const at = (f: number, k: number): P => [root[0] + dx * f + n[0] * k * w, root[1] + dy * f + n[1] * k * w];
      shape([at(0, -0.5), at(0.35, -0.5), at(0.7, -0.36), at(1, -0.04), at(0.96, 0.14), at(0.62, 0.42), at(0.3, 0.52), at(0, 0.5)], ICE, { angle: 80, over: 0, wash: 0.5, press: 0.7 }, { w: 5, col: '#3a5a8a' }, false);
      // facets: a darker blue face along one side, a crease down the middle, a cut across near the tip
      c.tint([at(0, 0.1), at(0.3, 0.16), at(0.62, 0.1), at(0.96, 0.1), at(0.62, 0.4), at(0.3, 0.5), at(0, 0.48)], ICEDEEP, { wash: 0.6 });
      stroke([at(0.02, 0.1), at(0.3, 0.16), at(0.62, 0.1), at(0.97, 0.04)], { w: 3.5, col: '#3a5a8a' }, false);
      stroke([at(0.7, -0.36), at(0.62, 0.1), at(0.62, 0.42)], { w: 3, col: '#3a5a8a' }, false);
      c.shine([at(0.08, -0.24), at(0.5, -0.24)], 7);
    };
    /** The moustache: two wide whisker pads, frost dots, three icicles hanging from it. */
    const moustache = (x: number, y: number, s: number) => {
      const M = ([dx, dy]: P): P => [x + dx * s, y + dy * s];
      for (const [dx, h] of [[-80, 56], [-30, 40], [60, 50]] as P[]) shape(([[dx - 12, 40], [dx, 40 + h], [dx + 12, 40]] as P[]).map(M), ICE, { over: 0, wash: 0.9 }, { w: 3.5 }, false);
      shape(([[-130, 10], [-116, -34], [-60, -56], [0, -40], [70, -60], [130, -40], [150, 10], [120, 50], [50, 56], [0, 40], [-60, 56], [-116, 46]] as P[]).map(M), MUZZLE, { angle: 20, over: 0 });
      stroke(([[0, -34], [-4, 10], [0, 36]] as P[]).map(M), { w: 4 });
      for (const [dx, dy] of [[-84, -6], [-50, 18], [50, 14], [86, -10]] as P[]) dot(...M([dx, dy]), 5 * s, 5 * s, '#a8bcda');
    };

    // its ice floe (scenery: off the follower)
    c.part('banquise', { pivot: [550, 900], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape([[40, 880], [100, 820], [1000, 810], [1070, 860], [1060, 950], [60, 956]], FLOESIDE, { angle: 0, over: 0.2 }, {}, false);
      shape([[40, 880], [100, 820], [1000, 810], [1070, 860], [1000, 890], [110, 896]], FLOE, { angle: 0, over: 0.2 }, {}, false);
      stroke([[700, 846], [900, 840]], { w: 5, col: '#ffffff' });
    });
    // the tail flippers resting behind
    c.part('queue', { pivot: [960, 820], motion: 'swing', amp: 2, period: 3.4, behind: true }, () => {
      shape([[900, 800], [1000, 760], [1070, 720], [1060, 790], [1080, 840], [980, 850], [900, 850]], DEEP, { angle: 30 });
    });
    // the far flipper
    shape([[520, 640], [500, 760], [470, 850], [580, 850], [600, 740]], DEEP, { angle: 80 });
    // the huge body: a mountain from the head up to the hump and down to the tail, a pale chest
    shape([[260, 330], [340, 250], [470, 240], [600, 270], [740, 360], [860, 500], [940, 640], [990, 760], [960, 850], [700, 860], [480, 856], [330, 820], [250, 700], [220, 540]], BLUE, { angle: 60, over: 0.45 });
    c.tint([[250, 560], [270, 700], [340, 810], [480, 846], [440, 720], [360, 600]], BELLY, { angle: 70, wash: 0.8 });
    // the snow settled along its shoulders while it slept, three icicles hanging from its edge
    shape([[450, 252], [490, 248], [600, 278], [732, 366], [848, 500], [826, 530], [790, 516], [760, 470], [712, 450], [660, 400], [600, 384], [540, 340], [480, 330], [446, 300]], SNOW, { angle: 30, over: 0, wash: 0.8 }, { w: 4.5 });
    for (const [x, y, h] of [[600, 376, 54], [712, 444, 60], [800, 514, 48]] as const) shape([[x - 14, y - 10], [x + 14, y - 6], [x - 2, y + h]], ICE, { over: 0, wash: 0.6 }, { w: 3.5, col: '#3a5a8a' }, false);
    c.shine([[540, 280], [640, 312]], 7);
    // wrinkles of an old walrus on the neck
    for (const [a, b] of [[[470, 520], [520, 560]], [[480, 590], [540, 620]]] as [P, P][]) stroke([a, b], { w: 4, col: DEEP });
    // the near flipper planted, holding it up
    shape([[400, 640], [360, 760], [300, 860], [440, 864], [480, 760], [500, 660]], BLUE, { angle: 80, over: 0.3 });
    for (const x of [330, 370, 410]) stroke([[x, 862], [x + 6, 838]], { w: 3.5 });
    // the big old head, chin up
    shape(c.potato(320, 380, 196, 160, 14, 0.03), BLUE, { angle: 70, over: 0.4 });
    // the great crystal tusks planted in the ice
    tusk([300, 500], [282, 890], 70);
    tusk([200, 494], [160, 840], 56);
    // placid: calm half-lids, relaxed brows lifted a little, a pink cheek; it looks at you down its nose
    c.eye(240, 340, 24, 28, '#241c38', { lid: 0.5, skin: BLUE, tilt: 4 });
    c.eye(346, 330, 30, 34, '#241c38', { lid: 0.5, skin: BLUE, tilt: -2 });
    stroke([[212, 296], [240, 286], [266, 292]], { w: 5 });
    stroke([[312, 282], [348, 272], [384, 282]], { w: 5 });
    c.cheek(436, 410, 30, 17, PINK);
    moustache(270, 448, 1.15);
    c.part('paupieres', { pivot: [294, 336], motion: 'blink', extra: true }, () => {
      c.lid(240, 340, 24, 28, BLUE);
      c.lid(346, 330, 30, 34, BLUE);
    });
  },
} satisfies Redraw;
