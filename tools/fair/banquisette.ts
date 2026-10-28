import type { Crayon, Fair, P } from '../redraws/crayon.ts';

/**
 * Banquisette's fair copy, Ice/Fairy, the same drawing grown up: its spiral horn twice as long with a
 * glint, a big crest of ice spikes grown behind its frosty mane from the top of its head down its back, tail flukes
 * half as big again, a bigger ice floe with crystals twice as tall, two long tusks and heavier brows, pink fairy
 * twinkles on its horn and a crystal, and the gold star on its flank.
 */
export default {
  id: '042', slug: 'banquisette', seed: 42042, size: [1380, 1260], tilt: -3,
  draw(c) {
    // the pencil drawing's own coordinates, lowered to make room for the long horn
    const DY = 240;
    const m = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + DY]);
    const shape: Crayon['shape'] = (pts, ...r) => c.shape(m(pts), ...r);
    const tint: Crayon['tint'] = (pts, ...r) => c.tint(m(pts), ...r);
    const stroke: Crayon['stroke'] = (pts, ...r) => c.stroke(m(pts), ...r);
    const paper: Crayon['paper'] = (pts, ...r) => c.paper(m(pts), ...r);
    const shine: Crayon['shine'] = (pts, ...r) => c.shine(m(pts), ...r);
    const dot = (x: number, y: number, rx: number, ry = rx, col?: string) => c.dot(x, y + DY, rx, ry, col);
    const part = (name: string, def: Parameters<Crayon['part']>[1], draw: () => void) => c.part(name, { ...def, pivot: [def.pivot[0], def.pivot[1] + DY] }, draw);
    const { band, potato, spikes } = c;
    const WHITE = '#d3e4f7', ICE = '#a2c8f0', BLUE = '#6fa8ea', MANE = '#c2dcf6', HORN = '#f2d77a', FLOE = '#c8ecf6', PINK = '#f590cc';
    /** A tall jagged ice crystal cluster standing on the floe, a lighter facet on each point. */
    const crystals = (pts: P[]) => {
      shape(pts, ICE, { angle: 80, over: 0 }, {}, false);
      for (let i = 1; i < pts.length - 1; i += 2) tint([pts[i], [pts[i][0] + 14, pts[i + 1][1]], [pts[i][0] - 4, pts[i + 1][1] + 10]], '#eef8ff', { angle: 80 });
    };
    /** A four-pointed fairy twinkle. */
    const twinkle = (x: number, y: number, r: number) => {
      const pts: P[] = Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4 - Math.PI / 2, k = i % 2 ? 0.26 : 1;
        return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k];
      });
      shape(pts, PINK, { over: 0, spill: 1 }, { w: 4 }, false);
    };
    /** Big ice spikes along a path (drawn from the tail toward the head, so they point up), one per stretch. */
    const crest = (path: P[], heights: number[], under: P[]) => {
      const pts: P[] = [], tips: [P, P, P][] = [];
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i], b = path[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
        const tip: P = [a[0] + dx * 0.55 - (dy / l) * heights[i], a[1] + dy * 0.55 + (dx / l) * heights[i]];
        pts.push(a, tip);
        tips.push([tip, a, b]);
      }
      shape([...pts, path[path.length - 1], ...under], ICE, { angle: 80, over: 0 }, {}, false);
      // a lighter facet down one side of each spike
      for (const [t, a, b] of tips) tint([t, [t[0] * 0.4 + a[0] * 0.6, t[1] * 0.4 + a[1] * 0.6], [t[0] * 0.45 + (a[0] + b[0]) * 0.275, t[1] * 0.45 + (a[1] + b[1]) * 0.275]], '#eef8ff', { angle: 80 });
    };
    // the ice floe, bigger, crystals twice as tall at both ends
    shape([[20, 850], [1300, 820], [1275, 990], [55, 1005]], FLOE, { angle: -10, over: 0.3 }, {}, false);
    crystals([[35, 862], [60, 650], [105, 770], [155, 500], [205, 740], [240, 620], [270, 858]]);
    crystals([[1070, 840], [1100, 700], [1140, 770], [1185, 600], [1225, 750], [1262, 660], [1290, 835]]);
    stroke([[600, 915], [680, 945], [760, 920]], { w: 3.5 });
    stroke([[900, 910], [950, 928]], { w: 3.5 });
    // the tail flukes raised behind, half as big again, the far flipper
    part('queue', { pivot: [985, 615], motion: 'swing', amp: 6, period: 2, behind: true }, () => {
      shape([[947, 600], [1082, 352], [1202, 232], [1172, 397], [1330, 367], [1217, 532], [1052, 652]], BLUE, { angle: 50 });
      for (const t of [[1180, 270], [1290, 390]] as P[]) stroke([[1040, 590], t], { w: 5, col: '#3f78c8' });
    });
    shape([[350, 700], [300, 780], [230, 850], [330, 850], [400, 760]], ICE, { angle: 60 });
    // a big crest of ice spikes, from the top of its head down its back, behind the mane
    crest([[1000, 545], [900, 570], [800, 566], [722, 535], [702, 465], [676, 368], [600, 272], [482, 224], [405, 236]],
      [95, 125, 135, 150, 165, 165, 145, 95], [[440, 420], [700, 640], [1000, 620]]);
    // the long body rearing up, the frosty shade under it, the star on its flank
    shape([[290, 470], [420, 400], [560, 460], [720, 560], [870, 570], [990, 530], [1030, 600], [940, 710], [760, 800], [540, 830], [380, 810], [290, 710], [260, 580]], WHITE, { angle: -20, over: 0.45, press: 1.1 });
    tint(band([[340, 780], [560, 805], [760, 775], [930, 690]], 50, 24), ICE, { gap: 4 });
    c.star(770, 680 + DY, 48, -8);
    // the near flipper, flat on the ice, three little claws
    for (let i = 0; i < 3; i++) shape([[585 - i * 30, 842 + i * 4], [630 - i * 30, 872 + i * 3], [578 - i * 30, 860 + i * 4]], '#ffffff', { over: 0 }, { w: 3.5 }, false);
    shape([[450, 700], [520, 770], [600, 850], [480, 862], [415, 780]], ICE, { angle: 100 });
    // the mane: fuller frosty curls flowing further down its neck and back
    shape(([[350, 228], [480, 232], [600, 282], [680, 372], [705, 480], [665, 580], [595, 625], [545, 590]] as P[])
      .concat(spikes([[545, 590], [545, 490], [512, 395], [445, 335], [380, 312]], 2, 52)), MANE, { angle: 40, over: 0.25 });
    for (const curl of [[[470, 280], [570, 335], [610, 430]], [[520, 262], [630, 330], [665, 450]], [[565, 420], [610, 500], [600, 575]]] as P[][]) stroke(curl, { w: 3.5 });
    // the long spiral horn, twice as long, then the head turned left
    shape([[280, 252], [354, -190], [404, 247]], HORN, { angle: 90, over: 0 }, {}, false);
    for (const y of [200, 135, 70, 5, -60, -125]) {
      const k = (250 - y) / 440, l = 280 + 74 * k, r = 404 - 50 * k;
      stroke([[l + 2, y + 10], [r - 2, y - 10]], { w: 4 });
    }
    shine([[308, 200], [340, -60]], 7);
    shape([[150, 360], [200, 275], [310, 230], [420, 255], [465, 340], [430, 415], [320, 445], [210, 440], [150, 410]], WHITE, { angle: 80, over: 0.4, press: 1.1 });
    tint(potato(320, 415, 90, 26, 8, 0.1), ICE, { gap: 4 });
    // sharper eyes under heavy brows, two long tusks
    dot(250, 325, 10, 12);
    dot(355, 318, 12, 14);
    dot(247, 320, 3, 4, '#ffffff');
    dot(351, 312, 4, 5, '#ffffff');
    stroke([[218, 290], [276, 309]], { w: 10 });
    stroke([[326, 300], [392, 276]], { w: 11 });
    shape(potato(160, 375, 20, 15, 7, 0.1), '#3a3440', { over: 0, press: 1.2 }, { w: 3.5 });
    stroke([[175, 412], [225, 424], [270, 412]], { w: 5 });
    paper([[198, 419], [210, 478], [224, 422]], { w: 4 }, false);
    paper([[240, 423], [254, 472], [266, 419]], { w: 4 }, false);
    stroke([[165, 392], [85, 385]], { w: 3 });
    stroke([[167, 404], [92, 420]], { w: 3 });
    // fairy twinkles on its horn and its crystals
    part('eclats', { pivot: [350, 0], motion: 'flicker', period: 2.2 }, () => {
      twinkle(354, -182, 50);
      twinkle(1185, 606, 44);
    });
  },
} satisfies Fair;
