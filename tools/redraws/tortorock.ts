import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * Clapoflot grown into the gruff old captain of the pond (Water/Rock), turned to the left, ramming: its whole body is a ship. Its
 * shell is a long armoured hull rising to a high stern: Clapotin's squares grown into big raised plates, a keel crest of
 * raked plates along its back, a dark keel along its underside; its head comes low and forward, and its snout has grown into the ship's stem, a cutwater hard
 * as iron. Its front legs are braced, its hind legs push. One heavy squinting eye under a bushy white brow, a crooked
 * half-smile with one fang, a curly white beard. The family's blue skin, brown shell, yellow belly.
 */
export default {
  id: '023', slug: 'tortorock', seed: 2361, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const BLUE = '#4a86e0', FAR = '#2f5aa8', SHELL = '#7e6a58', CREST = '#5e4e44', PLATE = '#a8907a', RIM = '#4a3a30', PLASTRON = '#f6d86a';
    const IRON = '#6e6258', EDGE = '#e8e2d4', NAIL = '#c4d0e4', FROTH = '#5aa8b4';
    const nails = (pts: P[]) => { for (const [x, y] of pts) shape(potato(x, y, 15, 10, 7, 0.05), NAIL, { over: 0 }, { w: 2.5 }); };
    /** A height along a polyline, by x. */
    const along = (pts: P[], x: number) => {
      for (let k = 1; k < pts.length; k++) {
        const [ax, ay] = pts[k - 1], [bx, by] = pts[k];
        if (x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax);
      }
      return pts[pts.length - 1][1];
    };
    const TOP: P[] = [[340, 690], [440, 570], [600, 492], [780, 442], [920, 418], [980, 430]];
    const BOT: P[] = [[340, 772], [460, 774], [600, 734], [760, 676], [900, 600], [980, 512]];
    // the far legs, darker, half hidden: the front one braced, the hind one pushing
    shape([[510, 730], [500, 820], [520, 860], [500, 912], [600, 912], [590, 860], [600, 820], [596, 716]], FAR, { angle: 80, over: 0.3 });
    shape([[760, 650], [790, 760], [830, 840], [850, 904], [940, 900], [912, 840], [880, 760], [850, 626]], FAR, { angle: 80, over: 0.3 });
    // a crest of rock spires along its back, raked backward, rising toward the stern like a keel
    for (const [x, h] of [[640, 70], [780, 100], [910, 132]] as const) {
      const by = along(TOP, x) + 14;
      shape([[x - 52, by], [x - 20, by - h * 0.55], [x + 30, by - h], [x + 20, by - h * 0.5], [x + 40, by - 4]], CREST, { angle: 60, over: 0.2 });
      stroke([[x - 46, by - 8], [x - 18, by - h * 0.55], [x + 26, by - h + 8]], { w: 5, col: EDGE }, false);
      stroke([[x + 4, by - 10], [x + 10, by - h * 0.4]], { w: 3, col: '#2e2420' }, false);
    }
    // the hull: a long shell rising to a high stern
    const hull: P[] = [[340, 770], [350, 660], [440, 570], [600, 492], [780, 442], [920, 418], [978, 446], [972, 520], [900, 600], [760, 676], [600, 734], [460, 772]];
    shape(hull, SHELL, { angle: 70, over: 0.4 }, {}, false);
    // its shell turned to stone: Clapotin's squares grown into big rock slabs, staggered and uneven, each with a lit top
    // edge, a crack here and there, the bottom row jutting past the hull's edge
    const mid = (x: number) => (along(TOP, x) + along(BOT, x)) / 2;
    const jig = [0, 9, -7, 5, -10, 8, -4, 6];
    const rows: [number[], (x: number) => number, (x: number) => number][] = [
      [[380, 520, 690, 840, 962], (x) => along(TOP, x) + 12, (x) => mid(x) - 4],
      [[372, 460, 610, 770, 930], (x) => mid(x) + 4, (x) => along(BOT, x) + 16],
    ];
    rows.forEach(([cols, top, bot], r) => {
      for (let k = 0; k < cols.length - 1; k++) {
        const [x0, x1] = [cols[k] + 7, cols[k + 1] - 7], xm = (x0 + x1) / 2, d = jig[(k + r * 3) % jig.length];
        const slab: P[] = [[x0, top(x0) + d * 0.6], [xm - 10, top(xm) - 8 + d], [x1, top(x1) - d * 0.5], [x1 + d * 0.4, (top(x1) + bot(x1)) / 2], [x1, bot(x1)], [xm + 14, bot(xm) + d * 0.5], [x0, bot(x0)]];
        shape(slab, PLATE, { angle: 50 + d * 3, over: 0.3 }, { w: 5, col: '#2e2420' }, false);
        stroke([[x0 + 10, top(x0) + d * 0.6 + 9], [xm - 10, top(xm) + 2 + d], [x1 - 10, top(x1) - d * 0.5 + 9]], { w: 6, col: EDGE }, false);
        if ((k + r) % 2 === 0) stroke([[xm + 8, top(xm) + 16 + d], [xm - 6, (top(xm) + bot(xm)) / 2], [xm + 12, bot(xm) - 14]], { w: 3.5, col: '#2e2420' }, false);
      }
    });
    // the keel: a dark band along the underside, the yellow belly showing under it
    stroke([[350, 790], [460, 790], [600, 750], [760, 692], [900, 616], [972, 530]], { w: 12, col: RIM }, false);
    shape([[380, 796], [600, 760], [780, 698], [760, 714], [600, 776], [400, 810]], PLASTRON, { angle: 0, over: 0 });
    // the near hind leg pushing back, an elephant leg with a bent knee and a broad foot
    openLimb(c, [[790, 670], [810, 760], [860, 830], [880, 916], [990, 916], [980, 860], [944, 800], [920, 720], [900, 620]], BLUE, 1, 8);
    nails([[896, 908], [934, 914], [968, 912]]);
    // the near front leg braced forward, planted under the head's foot: an elbow, a broad clawed foot
    openLimb(c, [[420, 760], [380, 820], [398, 862], [360, 918], [530, 918], [516, 862], [534, 820], [536, 760]], BLUE, 1, 7);
    nails([[378, 910], [420, 918], [464, 920]]);
    // a short thick neck, low and forward out of the hull's front
    const [hx, hy]: P = [250, 790];
    shape(band([[380, 690], [330, 740], [hx + 50, hy - 4]], 170, 150), BLUE, { angle: 80, over: 0.3 });
    // a curly white beard on its jaw, under the head (not a moving part: a part would sit over its mouth in battle)
    {
    c.paper([[hx - 110, hy + 70], [hx + 70, hy + 74], [hx + 76, hy + 112], [hx + 46, hy + 132], [hx + 20, hy + 160], [hx - 14, hy + 136], [hx - 44, hy + 162], [hx - 72, hy + 132], [hx - 104, hy + 140], [hx - 116, hy + 104]], { w: 3.5, col: FROTH });
    for (const [x, y] of [[hx + 30, hy + 120], [hx - 30, hy + 128], [hx - 90, hy + 116]] as const) {
      stroke([[x + 10, y + 8], [x - 8, y + 10], [x - 12, y - 2], [x - 2, y - 10], [x + 6, y - 4]], { w: 3, col: FROTH }, false);
    }
    }
    // the head, low and forward
    shape(potato(hx, hy, 116, 100, 14, 0.03), BLUE, { angle: 80, over: 0.4 });
    // its snout grown into a prow of rock: a narrow blade of stone, one convex cutting edge sweeping from the chin up and
    // forward to a point above the brow, a pale highlight along the edge, a chip and a crack
    shape([[hx - 70, hy + 80], [hx - 140, hy + 50], [hx - 190, hy - 10], [hx - 206, hy - 80], [hx - 190, hy - 140], [hx - 150, hy - 120], [hx - 110, hy - 100], [hx - 60, hy - 88], [hx - 50, hy - 20], [hx - 52, hy + 40]], IRON, { angle: 70, over: 0.2 }, { w: 5 });
    stroke([[hx - 82, hy + 74], [hx - 148, hy + 40], [hx - 192, hy - 20], [hx - 202, hy - 82], [hx - 188, hy - 132]], { w: 7, col: EDGE }, false);
    stroke([[hx - 120, hy - 60], [hx - 104, hy - 10], [hx - 120, hy + 30]], { w: 3.5, col: '#2e2420' }, false);
    // gruff old captain: one heavy squinting eye under a dark scowling brow, a crooked half-smile with one fang
    c.eye(hx + 20, hy - 14, 32, 38, '#241c38', { lid: 0.45, skin: BLUE, tilt: -12 });
    stroke([[hx - 22, hy - 44], [hx + 20, hy - 60], [hx + 62, hy - 66]], { w: 13 });
    stroke([[hx - 64, hy + 66], [hx - 20, hy + 60], [hx + 20, hy + 56], [hx + 44, hy + 36]], { w: 6 });
    shape([[hx - 6, hy + 58], [hx + 8, hy + 56], [hx + 2, hy + 74]], '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
    c.part('paupieres', { pivot: [hx + 20, hy - 18], motion: 'blink', extra: true }, () => {
      c.lid(hx + 20, hy - 18, 32, 38, BLUE);
    });
  },
} satisfies Redraw;
