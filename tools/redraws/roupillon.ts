import type { P, Redraw } from './crayon.ts';

/**
 * A round walrus pup (« gros dormeur »), turned to the left, flopped belly-down on its block of ice, fast asleep, its
 * chin on the ice and a bubble at its nose. Two little tusks of clear ice poke down from its puffy muzzle, its whiskers
 * are frosted white, its tail flippers lifted in its sleep. Wake it and it grumbles.
 */
export default {
  id: '032', slug: 'roupillon', seed: 3271, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const BLUE = '#86a8e2', DEEP = '#6a8cce', BELLY = '#d6e2f6', MUZZLE = '#eef3fb', ICE = '#e4f8fc', ICEDEEP = '#9fdcea';
    const FLOE = '#c4eef0', FLOESIDE = '#8fd2dc', PINK = '#f29ab0', BUBBLE = '#d8f2ff';

    /** An ice tusk from `root` to its `tip`, `w` wide at the root: clear ice with a shine and a dark outline. */
    const tusk = (root: P, tip: P, w: number) => {
      const dx = tip[0] - root[0], dy = tip[1] - root[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
      const at = (f: number, k: number): P => [root[0] + dx * f + n[0] * k * w, root[1] + dy * f + n[1] * k * w];
      shape([at(0, -0.5), at(0.5, -0.42), at(0.86, -0.2), at(1, 0), at(0.8, 0.26), at(0.4, 0.46), at(0, 0.5)], ICE, { angle: 80, over: 0, wash: 0.9 }, { w: 4 });
      c.tint([at(0.1, 0.1), at(0.6, 0.2), at(0.9, 0.04), at(0.6, 0.4), at(0.1, 0.44)], ICEDEEP, { wash: 0.7 });
      c.shine([at(0.12, -0.2), at(0.6, -0.16)], 6);
    };
    /** The puffy muzzle: two round whisker pads, frosted white whisker dots, a few short frosty whiskers. */
    const muzzle = (x: number, y: number, s: number) => {
      const M = ([dx, dy]: P): P => [x + dx * s, y + dy * s];
      shape(([[-110, 10], [-96, -30], [-50, -50], [0, -36], [50, -54], [100, -36], [120, 10], [96, 50], [40, 60], [0, 44], [-50, 60], [-96, 46]] as P[]).map(M), MUZZLE, { angle: 20, over: 0 });
      stroke(([[0, -30], [-4, 10], [0, 40]] as P[]).map(M), { w: 3.5 });
      for (const [dx, dy] of [[-66, -6], [-40, 18], [44, 14], [70, -8]] as P[]) dot(x + dx * s, y + dy * s, 4.5 * s, 4.5 * s, '#a8bcda');
      for (const [a, b] of [[[-100, -6], [-150, -20]], [[-98, 16], [-152, 22]]] as [P, P][]) stroke([[x + a[0] * s, y + a[1] * s], [x + b[0] * s, y + b[1] * s]], { w: 3.5, col: '#7a94bc' });
    };

    // its block of ice (scenery: off the follower)
    c.part('glacon', { pivot: [500, 860], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape([[80, 840], [140, 790], [860, 780], [930, 830], [920, 900], [100, 910]], FLOESIDE, { angle: 0, over: 0.2 }, {}, false);
      shape([[80, 840], [140, 790], [860, 780], [930, 830], [860, 856], [150, 862]], FLOE, { angle: 0, over: 0.2 }, {}, false);
      stroke([[200, 820], [340, 812]], { w: 5, col: '#ffffff' });
    });
    // the tail flippers lifted in its sleep (they wave slowly in battle)
    c.part('queue', { pivot: [800, 700], motion: 'swing', amp: 4, period: 2.8, behind: true }, () => {
      shape([[780, 720], [850, 640], [930, 600], [920, 660], [960, 700], [880, 740], [800, 770]], DEEP, { angle: 40 });
    });
    // the far flipper, then the whole pup in one teardrop with no neck: the head is its narrow end, its chin on the ice
    shape([[560, 770], [640, 806], [700, 832], [600, 838], [540, 806]], DEEP, { angle: 30 });
    shape([[140, 690], [160, 600], [230, 530], [360, 470], [520, 440], [680, 470], [800, 570], [836, 690], [790, 790], [600, 832], [400, 834], [230, 812], [160, 770]], BLUE, { angle: 10, over: 0.4 });
    c.tint([[300, 812], [500, 826], [700, 812], [800, 740], [640, 776], [420, 790]], BELLY, { angle: 10, wash: 0.8 });
    // the near front flipper from the flank under its chin, flat on the ice
    shape([[440, 680], [410, 760], [350, 826], [450, 842], [510, 796], [520, 700]], DEEP, { angle: 30 });
    for (const x of [380, 412]) stroke([[x, 826], [x + 10, 806]], { w: 3.5 });
    // asleep: closed eyes, a pink cheek
    stroke([[200, 600], [220, 616], [244, 612]], { w: 5.5 });
    stroke([[286, 590], [312, 610], [342, 604]], { w: 5.5 });
    c.cheek(380, 660, 28, 16, PINK);
    // its little ice tusks, poking down to the ice from under the muzzle
    tusk([196, 724], [184, 800], 30);
    tusk([270, 728], [274, 804], 34);
    muzzle(232, 688, 0.95);
    // the bubble at its nose, swelling and shrinking as it breathes
    c.part('bulle', { pivot: [130, 650], motion: 'throw', to: [-6, -4], shrink: 0.6, period: 3 }, () => {
      shape(potato(112, 640, 20, 19, 10, 0.02), BUBBLE, { over: 0, wash: 0.25, press: 0.6 }, { w: 2.5, col: '#7a94bc' });
      c.shine([[102, 634], [108, 628]], 4);
    });
  },
} satisfies Redraw;
