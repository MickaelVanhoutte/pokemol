import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Hippoplume's fair copy, Water/Psychic, the same drawing grown up: its golden pen-nib snout twice as big,
 * with its slit and its breather hole, writing a spiral of ink that glows violet; its crest grown to four quills
 * half as long again, five quill fins down its back, each half as long again; a bigger spiky chest fin; its tail
 * curled into a fuller spiral; a glowing violet eye under a heavy brow; the gold star on its body. Drawn lower and to
 * the right on a bigger sheet, so the crest, quills and ink have room.
 */
export default {
  id: '070', slug: 'hippoplume', seed: 7070, size: [1220, 1300], tilt: -2,
  draw(c) {
    const { band, potato, spikes } = c;
    // the pencil drawing's coordinates, moved on the bigger sheet
    const DX = 80, DY = 170;
    const mv = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape: typeof c.shape = (pts, ...r) => c.shape(mv(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(mv(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(mv(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(mv(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(mv(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + DX, y + DY, ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1] + DY] }, draw);

    const BLUE = '#2f62c4', CREAM = '#f3e6c6', FIN = '#8cbcf0', INK = '#1f2a5a', GOLD = '#e8c04a', PSY = '#c25ad6';
    // a quill from a to b: a long pointed leaf, its tip dipped in ink
    const quill = (a: P, b: P, w: number) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
      const m: P = [a[0] + dx * 0.45, a[1] + dy * 0.45], t: P = [a[0] + dx * 0.78, a[1] + dy * 0.78];
      shape([[a[0] + n[0] * w * 0.5, a[1] + n[1] * w * 0.5], [m[0] + n[0] * w, m[1] + n[1] * w], b, [m[0] - n[0] * w, m[1] - n[1] * w], [a[0] - n[0] * w * 0.5, a[1] - n[1] * w * 0.5]], FIN, { angle: 60, over: 0 });
      tint([[t[0] + n[0] * w * 0.5, t[1] + n[1] * w * 0.5], b, [t[0] - n[0] * w * 0.5, t[1] - n[1] * w * 0.5]], INK, { gap: 3, press: 1.2 });
      stroke([a, [a[0] + dx * 0.85, a[1] + dy * 0.85]], { w: 3 });
    };
    // five bigger quill fins fanned out along its back
    part('plumes', { pivot: [590, 560], motion: 'swing', amp: 4, period: 2.4, behind: true }, () => {
      quill([560, 375], [944, 172], 62);
      quill([600, 490], [1032, 388], 66);
      quill([605, 615], [1016, 646], 62);
      quill([585, 725], [912, 852], 54);
      quill([545, 815], [860, 975], 46);
    });
    // the body and its tail curled into a fuller spiral, the cream ribbed belly
    shape(band([[500, 330], [590, 470], [590, 640], [520, 790], [465, 900], [495, 1000], [600, 1030], [680, 975], [680, 885], [610, 860], [568, 905], [595, 950], [636, 930]], 170, 34), BLUE, { angle: 80, over: 0.6, press: 1.05 });
    tint(band([[445, 360], [500, 480], [495, 640], [445, 770]], 64, 28), CREAM, { gap: 3.4 });
    for (const y of [420, 490, 560, 630, 700]) stroke([[408, y], [482, y + 8]], { w: 3.5 });
    c.star(560 + DX, 770 + DY, 44, -10);
    shine([[650, 900], [640, 960]], 6);
    // a bigger spiky fin at its chest
    shape(([[515, 570]] as P[]).concat(spikes([[535, 515], [665, 550], [650, 660]], 3, -52)).concat([[540, 640]] as P[]), FIN, { angle: 30, over: 0 }, { w: 4 }, false);
    // the crest, four longer quills swept back behind the head (it sways in battle)
    part('crete', { pivot: [490, 190], motion: 'swing', amp: 4, period: 2.8, behind: true }, () => {
      quill([420, 180], [380, -105], 40);
      quill([470, 172], [545, -110], 44);
      quill([520, 180], [720, -30], 42);
      quill([560, 210], [830, 90], 40);
    });
    // the head, the snout pointing left, a bigger golden pen nib: its shoulders, slit and breather hole
    shape(potato(480, 250, 135, 120, 12, 0.05), BLUE, { angle: 80, over: 0.5 });
    shape(band([[380, 285], [265, 292], [185, 286]], 66, 56), BLUE, { angle: 0 });
    shape([[205, 220], [168, 230], [60, 272], [8, 288], [60, 304], [168, 346], [205, 356]], GOLD, { angle: 0, over: 0 }, { w: 5.5 }, false);
    stroke([[168, 232], [178, 288], [168, 344]], { w: 4, col: '#a8802a' });
    stroke([[146, 288], [28, 288]], { w: 4 });
    dot(148, 288, 11, 11);
    shine([[95, 266], [165, 248]], 7);
    // the spiral of ink it writes from the tip of its nib (it swirls in battle)
    part('encre', { pivot: [10, 292], motion: 'swing', amp: 6, period: 2 }, () => {
      const path: P[] = [[10, 292], [-14, 365], [0, 450], [72, 494], [150, 466], [162, 396], [112, 366], [68, 396], [80, 440], [116, 432]];
      tint(band(path, 60, 34), PSY, { gap: 4, wash: 0.3 });
      shape(band(path, 32, 14), INK, { angle: 30, over: 0, press: 1.2 }, { w: 4 });
    });
    // a glowing violet eye under a heavy brow
    paper([[410, 216], [486, 232], [482, 262], [414, 260]]);
    shape(potato(446, 240, 19, 18, 8, 0.05), PSY, { over: 0, press: 1.2 }, { w: 3 });
    dot(444, 241, 9, 9);
    dot(438, 234, 4, 4, '#ffffff');
    stroke([[394, 196], [502, 222]], { w: 12 });
  },
} satisfies Fair;
