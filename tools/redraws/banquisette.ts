import type { P, Redraw } from './crayon.ts';

/**
 * Givrinou grown: a long, frosty white seal rearing up on its ice floe, turned to the left, a long spiral
 * horn, a mane of frosty curls flowing down its neck, big tail flukes raised behind, sparkles of frost.
 */
export default {
  id: '042', slug: 'banquisette', seed: 4202, size: [1250, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const WHITE = '#d3e4f7', ICE = '#a2c8f0', BLUE = '#6fa8ea', MANE = '#c2dcf6', HORN = '#f2d77a', FLOE = '#c8ecf6';
    const flake = (x: number, y: number, s: number) => {
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI) / 3, d: P = [Math.cos(a) * 30 * s, Math.sin(a) * 30 * s];
        stroke([[x - d[0], y - d[1]], [x + d[0], y + d[1]]], { w: 4 });
      }
    };
    // the ice floe, its jagged crystals
    shape([[70, 850], [1190, 830], [1160, 960], [110, 965]], FLOE, { angle: -10, over: 0.3 }, {}, false);
    shape([[90, 860], [120, 730], [165, 800], [190, 700], [230, 855]], ICE, { angle: 80, over: 0 }, {}, false);
    shape([[1080, 845], [1120, 740], [1150, 790], [1180, 690], [1200, 840]], ICE, { angle: 80, over: 0 }, {}, false);
    stroke([[640, 900], [700, 925], [760, 905]], { w: 3.5 });
    // the tail flukes raised behind, the far flipper
    c.part('queue', { pivot: [985, 615], motion: 'swing', amp: 6, period: 2, behind: true }, () => {
      shape([[960, 600], [1050, 440], [1130, 360], [1110, 470], [1215, 450], [1140, 560], [1030, 640]], BLUE, { angle: 50 });
    });
    shape([[350, 700], [300, 780], [230, 850], [330, 850], [400, 760]], ICE, { angle: 60 });
    // the long body rearing up, the frosty shade under it
    shape([[290, 470], [420, 400], [560, 460], [720, 560], [870, 570], [990, 530], [1030, 600], [940, 710], [760, 800], [540, 830], [380, 810], [290, 710], [260, 580]], WHITE, { angle: -20, over: 0.45, press: 1.1 });
    c.tint(band([[340, 780], [560, 805], [760, 775], [930, 690]], 50, 24), ICE, { gap: 4 });
    // the near flipper, flat on the ice
    shape([[450, 700], [520, 770], [600, 850], [480, 862], [415, 780]], ICE, { angle: 100 });
    // the mane: frosty curls flowing down its neck
    shape(([[360, 235], [470, 250], [570, 300], [630, 380], [640, 470], [600, 540], [545, 560], [520, 520]] as P[])
      .concat(spikes([[520, 520], [530, 450], [500, 380], [440, 330], [380, 310]], 2, 28)), MANE, { angle: 40, over: 0.2 });
    stroke([[470, 285], [560, 340], [590, 430]], { w: 3 });
    // the long spiral horn, then the head turned left, a calm proud face, a little tusk
    shape([[300, 245], [345, 30], [385, 240]], HORN, { angle: 90, over: 0 }, {}, false);
    for (const y of [190, 140, 90]) stroke([[322 + (230 - y) / 8, y + 8], [365 - (230 - y) / 8, y - 8]], { w: 3 });
    shape([[150, 360], [200, 275], [310, 230], [420, 255], [465, 340], [430, 415], [320, 445], [210, 440], [150, 410]], WHITE, { angle: 80, over: 0.4, press: 1.1 });
    c.tint(potato(320, 415, 90, 26, 8, 0.1), ICE, { gap: 4 });
    dot(250, 325, 10, 13);
    dot(355, 318, 12, 15);
    dot(246, 319, 3, 4, '#ffffff');
    dot(350, 311, 4, 5, '#ffffff');
    stroke([[225, 295], [272, 302]], { w: 5 });
    stroke([[330, 289], [386, 281]], { w: 5.5 });
    shape(potato(160, 375, 20, 15, 7, 0.1), '#3a3440', { over: 0, press: 1.2 }, { w: 3.5 });
    stroke([[175, 412], [225, 424], [270, 412]], { w: 5 });
    c.paper([[208, 420], [217, 449], [227, 422]], { w: 3.5 }, false);
    stroke([[165, 392], [85, 385]], { w: 3 });
    stroke([[167, 404], [92, 420]], { w: 3 });
    // sparkles of frost
    c.part('flocons', { pivot: [640, 250], motion: 'flicker', period: 2.6 }, () => {
      for (const [x, y, s] of [[110, 180, 1], [560, 160, 0.8], [880, 360, 1], [1180, 250, 0.7], [700, 270, 0.6]] as const) flake(x, y, s);
    });
  },
} satisfies Redraw;
