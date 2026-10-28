import type { P, Redraw } from './crayon.ts';

/**
 * Avrilou grown into a sea monster: a huge paper serpent of the deep rearing out of the waves, turned to the
 * left, its back in humps out of the water, navy and teal with crimson fins, a jester's collar of points with
 * golden bells (the prank it was), a wide jaw full of torn-paper teeth, and the old strip of tape still across
 * its back like a scar.
 */
export default {
  id: '100', slug: 'leviafarce', seed: 10007, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, paper, stroke, dot, tint, band, spikes, potato } = c;
    const NAVY = '#2b4a7e', TEAL = '#3f8fa8', RED = '#c83a4a', GOLD = '#f2c230', CREAM = '#f4e2b4', SEA = '#6fb6e6', TAPE = '#dde4e6';
    // the tail out of the water at the back, a forked fin: in battle it lashes
    c.part('queue', { pivot: [880, 900], motion: 'swing', amp: 8, period: 2.2, behind: true }, () => {
      shape(band([[860, 910], [895, 800], [925, 690]], 92, 50), NAVY, { angle: 80, over: 0.4 });
      shape([[920, 705], [810, 520], [880, 535], [935, 620], [965, 500], [998, 520], [955, 715]], RED, { angle: 60, over: 0.3 }, {}, false);
      stroke([[930, 690], [860, 565]], { w: 3 });
      stroke([[945, 690], [978, 550]], { w: 3 });
    });
    // a hump of its back out of the water, crimson fins along it
    shape(spikes([[620, 800], [660, 720], [740, 690], [800, 740]], 2, 58).concat([[790, 760], [700, 730], [640, 810]]), RED, { angle: 30, over: 0.3 }, {}, false);
    shape(band([[590, 910], [615, 780], [700, 720], [790, 770], [815, 910]], 130, 120), NAVY, { angle: 70, over: 0.5 });
    for (const [x, y] of [[640, 830], [700, 770], [770, 820]] as const) stroke([[x - 22, y - 12], [x - 12, y + 12], [x + 8, y + 18], [x + 24, y + 4]], { w: 6, col: TEAL });
    // the old strip of tape across the hump, a scar
    paper([[660, 760], [790, 800], [782, 830], [796, 856], [650, 822], [664, 792]], { w: 3.5 }, false);
    tint([[668, 772], [778, 806], [772, 845], [660, 812]], TAPE, { gap: 3, wash: 0.6 });
    // crimson fins down the back of its neck
    shape(spikes([[560, 800], [570, 640], [610, 520], [590, 420]], 3, 64).concat([[560, 430], [540, 620]]), RED, { angle: 30, over: 0.3 }, {}, false);
    // its neck, rising out of the sea, thick and strong
    const neck: P[] = [[455, 920], [410, 780], [430, 620], [520, 500], [500, 390], [420, 320]];
    shape(band(neck, 200, 150), NAVY, { angle: 75, over: 0.5 });
    // golden belly plates up the front of its neck
    shape(band([[375, 915], [335, 780], [352, 625], [430, 512], [418, 420]], 64, 48), CREAM, { angle: 0, over: 0.2 });
    for (const [x, y] of [[352, 860], [338, 790], [338, 720], [352, 650], [388, 580], [425, 520]] as const) stroke([[x - 32, y - 8], [x + 32, y + 8]], { w: 3.5 });
    for (const [x, y] of [[480, 760], [490, 660], [530, 580], [555, 480]] as const) stroke([[x - 22, y - 12], [x - 12, y + 12], [x + 8, y + 18], [x + 24, y + 4]], { w: 6, col: TEAL });
    // the sea around it
    for (const [x, y, s] of [[260, 930, 1.1], [560, 950, 1.2], [880, 935, 0.9]] as const) {
      shape([[x - 140 * s, y + 30], [x - 70 * s, y - 40 * s], [x + 10 * s, y - 55 * s], [x + 45 * s, y - 20 * s], [x + 5 * s, y - 10 * s], [x + 95 * s, y - 10 * s], [x + 150 * s, y + 30]], SEA, { angle: 10, over: 0.2 });
    }
    // a jester's collar behind its head, red and gold points with bells: in battle it jingles
    c.part('collerette', { pivot: [470, 330], motion: 'swing', amp: 6, period: 1.6 }, () => {
      const n = 7;
      for (let k = 0; k < n; k++) {
        const a = ((-120 + (k * 170) / (n - 1)) * Math.PI) / 180, b = 0.3;
        const tip: P = [470 + Math.cos(a) * 205, 330 + Math.sin(a) * 205];
        shape([[470 + Math.cos(a - b) * 100, 330 + Math.sin(a - b) * 100], tip, [470 + Math.cos(a + b) * 100, 330 + Math.sin(a + b) * 100]], k % 2 ? GOLD : RED, { angle: 40, over: 0.2 }, {}, false);
        shape(potato(tip[0], tip[1], 20, 20, 8, 0.05), k % 2 ? RED : GOLD, { over: 0 });
      }
    });
    // the head, wide, turned to the left
    shape([[500, 360], [470, 240], [360, 165], [210, 170], [95, 240], [80, 305], [230, 330], [410, 375]], NAVY, { angle: 20, over: 0.5 });
    // the lower jaw, wide open: in battle it snaps
    c.part('machoire', { pivot: [440, 385], motion: 'nod', amp: -10, period: 2.8 }, () => {
      tint([[430, 360], [260, 335], [110, 320], [130, 360], [300, 395]], '#7a1f2a', { gap: 3, wash: 0.7 });
      shape([[455, 375], [310, 385], [125, 365], [100, 405], [220, 470], [420, 455]], NAVY, { angle: 10, over: 0.4 });
      shape(spikes([[125, 375], [410, 392]], 7, -34).concat([[410, 404], [125, 387]]), CREAM, { over: 0 }, { w: 3.5 }, false);
      stroke([[180, 440], [350, 440]], { w: 4, col: TEAL });
    });
    // its torn-paper upper teeth
    shape(spikes([[100, 315], [420, 362]], 8, 40).concat([[420, 350], [100, 303]]), CREAM, { over: 0 }, { w: 3.5 }, false);
    // a fierce yellow eye under a heavy brow
    shape(potato(300, 240, 42, 30, 8, 0.05), GOLD, { over: 0 });
    dot(292, 242, 8, 24);
    stroke([[230, 205], [310, 195], [380, 228]], { w: 9 });
    // nostrils and teal marks on the snout
    dot(105, 262, 9, 7);
    stroke([[360, 278], [450, 300]], { w: 6, col: TEAL });
    stroke([[345, 305], [445, 330]], { w: 6, col: TEAL });
    // only in battle: sea spray bursts round it
    c.part('ecume', { pivot: [500, 800], motion: 'flicker', period: 2.2, extra: true }, () => {
      for (const [x, y, s] of [[110, 800, 1], [520, 870, 0.7], [960, 860, 0.8], [700, 600, 0.7]] as const) {
        paper([[x, y - 50 * s], [x + 30 * s, y - 10 * s], [x + 50 * s, y + 20 * s], [x, y + 30 * s], [x - 50 * s, y + 20 * s], [x - 30 * s, y - 10 * s]], { w: 3.5 });
        tint([[x, y - 40 * s], [x + 40 * s, y + 20 * s], [x - 40 * s, y + 20 * s]], SEA, { gap: 3 });
      }
    });
  },
} satisfies Redraw;
