import type { Colour, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Léviafarce's fair copy, Water/Dragon, the same drawing grown up: its jester's collar grown into a huge
 * crest behind its head and neck, eleven long red and gold points with their golden bells; its crimson fins much
 * taller and more numerous down its neck and over its back; a longer body (a second hump out of the waves before
 * the tail); a forked tail fin half as big again; its brow swept back into a dragon's horn, longer torn-paper fangs,
 * a fierce eye under a heavier brow, and the gold star on its neck.
 */
export default {
  id: '100', slug: 'leviafarce', seed: 100100, size: [1220, 1110], tilt: 2,
  draw(c) {
    // the whole drawing sits lower on the sheet, to make room for its great crest
    const DY = 110;
    const T = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + DY]);
    const shape = (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(T(pts), col, o, l, round);
    const paper = (pts: P[], l?: Line, round?: boolean) => c.paper(T(pts), l, round);
    const stroke = (pts: P[], l?: Line, round?: boolean) => c.stroke(T(pts), l, round);
    const tint = (pts: P[], col: string, o?: Colour) => c.tint(T(pts), col, o);
    const dot = (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x, y + DY, rx, ry, col);
    const shine = (pts: P[], w?: number) => c.shine(T(pts), w);
    const { band, spikes, potato } = c;
    /** The tail fin grown half as big again, out from the tip of the tail. */
    const F = (pts: P[]): P[] => pts.map(([x, y]) => [1085 + (x - 1085) * 1.55, 700 + (y - 700) * 1.55]);
    const NAVY = '#2b4a7e', TEAL = '#3f8fa8', RED = '#c83a4a', GOLD = '#f2c230', CREAM = '#f4e2b4', SEA = '#6fb6e6', TAPE = '#dde4e6';
    const mark = (x: number, y: number) => stroke([[x - 22, y - 12], [x - 12, y + 12], [x + 8, y + 18], [x + 24, y + 4]], { w: 6, col: TEAL });
    // the tail out of the water at the back, longer, a bigger forked fin: in battle it lashes
    c.part('queue', { pivot: [1030, 900 + DY], motion: 'swing', amp: 8, period: 2.2, behind: true }, () => {
      shape(spikes([[1035, 860], [1050, 790], [1072, 720]], 2, 44).concat([[1060, 730], [1030, 860]]), RED, { angle: 30, over: 0.3 }, {}, false);
      shape(band([[1010, 915], [1040, 800], [1075, 680]], 96, 52), NAVY, { angle: 80, over: 0.4 });
      shape(F([[1070, 700], [930, 470], [1015, 492], [1080, 590], [1100, 430], [1142, 455], [1105, 710]]), RED, { angle: 60, over: 0.3 }, {}, false);
      stroke(F([[1078, 685], [990, 530]]), { w: 4 });
      stroke(F([[1092, 685], [1122, 485]]), { w: 4 });
    });
    // the jester's collar grown into a great crest behind its head and neck, eleven long points with bells, only
    // showing round them: in battle it jingles
    c.part('collerette', { pivot: [470, 330 + DY], motion: 'swing', amp: 6, period: 1.6, behind: true }, () => {
      const n = 11;
      for (let k = 0; k < n; k++) {
        const a = ((-150 + (k * 205) / (n - 1)) * Math.PI) / 180, b = 0.27, r = k % 2 ? 330 : 395;
        const tip: P = [470 + Math.cos(a) * r, 330 + Math.sin(a) * r];
        shape([[470 + Math.cos(a - b) * 120, 330 + Math.sin(a - b) * 120], tip, [470 + Math.cos(a + b) * 120, 330 + Math.sin(a + b) * 120]], k % 2 ? GOLD : RED, { angle: 40, over: 0.2 }, {}, false);
        shape(potato(tip[0], tip[1], 30, 30, 8, 0.05), k % 2 ? RED : GOLD, { over: 0 });
      }
    });
    // a second hump of its back out of the water, fins along it
    shape(spikes([[860, 850], [905, 790], [965, 785], [1000, 830]], 2, -95).concat([[990, 845], [930, 815], [870, 870]]), RED, { angle: 30, over: 0.3 }, {}, false);
    shape(band([[845, 920], [865, 830], [925, 795], [985, 830], [1000, 920]], 105, 98), NAVY, { angle: 70, over: 0.5 });
    mark(930, 850);
    // the first hump, taller crimson fins along it
    shape(spikes([[615, 805], [650, 715], [740, 675], [810, 735]], 2, -120).concat([[790, 760], [700, 730], [640, 810]]), RED, { angle: 30, over: 0.3 }, {}, false);
    shape(band([[590, 910], [615, 780], [700, 720], [790, 770], [815, 910]], 130, 120), NAVY, { angle: 70, over: 0.5 });
    for (const [x, y] of [[640, 830], [770, 820]] as const) mark(x, y);
    // the old strip of tape across the hump, a scar
    paper([[660, 760], [790, 800], [782, 830], [796, 856], [650, 822], [664, 792]], { w: 4.5 }, false);
    tint([[668, 772], [778, 806], [772, 845], [660, 812]], TAPE, { gap: 3, wash: 0.6 });
    // taller crimson fins down the back of its neck, more of them
    shape(spikes([[565, 820], [575, 640], [615, 515], [590, 400]], 4, 128).concat([[560, 430], [540, 620]]), RED, { angle: 30, over: 0.3 }, {}, false);
    // its neck, rising out of the sea, thick and strong
    const neck: P[] = [[455, 920], [410, 780], [430, 620], [520, 500], [500, 390], [420, 320]];
    shape(band(neck, 200, 150), NAVY, { angle: 75, over: 0.5 });
    // golden belly plates up the front of its neck
    shape(band([[375, 915], [335, 780], [352, 625], [430, 512], [418, 420]], 64, 48), CREAM, { angle: 0, over: 0.2 });
    for (const [x, y] of [[352, 860], [338, 790], [338, 720], [352, 650], [388, 580], [425, 520]] as const) stroke([[x - 32, y - 8], [x + 32, y + 8]], { w: 4 });
    for (const [x, y] of [[490, 800], [530, 580], [555, 480]] as const) mark(x, y);
    c.star(465, 700 + DY, 48, 8);
    // the sea around it
    for (const [x, y, s] of [[260, 930, 1.1], [560, 950, 1.2], [880, 940, 0.9], [1060, 950, 0.75]] as const) {
      shape([[x - 140 * s, y + 30], [x - 70 * s, y - 40 * s], [x + 10 * s, y - 55 * s], [x + 45 * s, y - 20 * s], [x + 5 * s, y - 10 * s], [x + 95 * s, y - 10 * s], [x + 150 * s, y + 30]], SEA, { angle: 10, over: 0.2 });
    }
    // the head, wide, turned to the left
    shape([[500, 360], [470, 240], [360, 165], [210, 170], [95, 240], [80, 305], [230, 330], [410, 375]], NAVY, { angle: 20, over: 0.5 });
    // the lower jaw, wide open, longer fangs: in battle it snaps
    c.part('machoire', { pivot: [440, 385 + DY], motion: 'nod', amp: -10, period: 2.8 }, () => {
      tint([[430, 360], [260, 335], [110, 320], [130, 360], [300, 395]], '#7a1f2a', { gap: 3, wash: 0.7 });
      shape([[455, 375], [310, 385], [125, 365], [100, 405], [220, 470], [420, 455]], NAVY, { angle: 10, over: 0.4 });
      shape(spikes([[125, 375], [410, 392]], 7, -46).concat([[410, 404], [125, 387]]), CREAM, { over: 0 }, { w: 4 }, false);
      stroke([[180, 440], [350, 440]], { w: 5, col: TEAL });
    });
    // its torn-paper upper teeth, longer, two big fangs at the front
    shape(spikes([[150, 322], [420, 362]], 7, 46).concat([[420, 350], [150, 310]]), CREAM, { over: 0 }, { w: 4 }, false);
    for (const x of [100, 132]) shape([[x - 4, 308], [x + 8, 392], [x + 24, 312]], CREAM, { over: 0 }, { w: 4 }, false);
    // its brow swept back into a dragon's horn
    shape([[330, 200], [380, 172], [535, 62], [430, 214], [395, 226]], CREAM, { angle: 30, over: 0 }, {}, false);
    shine([[400, 182], [480, 118]], 6);
    // a fierce yellow eye under a heavier brow
    shape(potato(300, 244, 44, 27, 8, 0.04), GOLD, { over: 0 }, { w: 5 });
    dot(294, 246, 7, 21);
    stroke([[222, 224], [300, 204], [385, 205]], { w: 15 });
    // nostrils and teal marks on the snout
    dot(105, 262, 10, 8);
    stroke([[360, 278], [450, 300]], { w: 7, col: TEAL });
    stroke([[345, 305], [445, 330]], { w: 7, col: TEAL });
    shine([[170, 200], [230, 185]], 6);
  },
} satisfies Fair;
