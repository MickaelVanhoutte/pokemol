import type { Colour, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Vampapier's fair copy, Poison/Dark, the same drawing grown up: its wings twice as big, five fingers each,
 * their edges deeply scalloped, torn and ragged, holes ripped through them, long claws at their joints; its ears nearly
 * twice as tall, its high collar grown into great pointed lapels; fangs grown long down over its chest in an open
 * snarl, poison beading at their tips; narrower eyes under heavier brows, longer talons, and the gold star on its
 * violet front.
 */
export default {
  id: '104', slug: 'vampapier', seed: 104104, size: [1620, 1140], tilt: 2,
  draw(c) {
    // the body stays the size it was; the sheet grows round it to make room for the wings, ears and collar
    const DX = 160, DY = 175;
    const T = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape = (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(T(pts), col, o, l, round);
    const paper = (pts: P[], l?: Line, round?: boolean) => c.paper(T(pts), l, round);
    const stroke = (pts: P[], l?: Line, round?: boolean) => c.stroke(T(pts), l, round);
    const tint = (pts: P[], col: string, o?: Colour) => c.tint(T(pts), col, o);
    const dot = (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x + DX, y + DY, rx, ry, col);
    const { potato } = c;
    const BLACK = '#3a3346', VIOLET = '#7d5cb5', LINING = '#a27fd6', GREEN = '#8fd14f', BONE = '#8a7fa0', CLAW = '#e9e2d0';
    const beat = { motion: 'flap', amp: 9, period: 0.9 } as const;
    const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    /** Twice as big, out from the shoulder (a little less upwards). */
    const big = (o: P) => (pts: P[]): P[] => pts.map(([x, y]) => [o[0] + (x - o[0]) * 2, o[1] + (y - o[1]) * 1.75]);
    /** A ragged hole torn through a wing. */
    const hole = (x: number, y: number, r: number): P[] =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, k = [1, 0.78, 0.92, 0.7][i % 4];
        return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * k * 0.8];
      });
    /**
     * A bat wing: from the shoulder up to its joint (a long claw there), out to its five finger tips, the membrane
     * between them deeply scalloped and torn, ragged strips along its trailing edge, the violet lining, the finger
     * bones from the shoulder, and holes ripped through it.
     */
    const wing = (shoulder: P, joint: P, tips: P[], back: P, holes: [number, number][], f = (pts: P[]) => pts) => {
      const skin: P[] = [shoulder, lerp(shoulder, joint, 0.5), joint, tips[0]];
      tips.slice(1).forEach((b, i) => {
        // the membrane dips deep between two fingers, a narrow tear cut into it
        const a = tips[i], dip = lerp(lerp(a, b, 0.5), shoulder, 0.34), t = i % 2 ? 0.62 : 0.38;
        const s = (u: number) => (u < 0.5 ? lerp(a, dip, u * 2) : lerp(dip, b, u * 2 - 1));
        skin.push(s(t - 0.06), lerp(s(t), shoulder, 0.15), s(t + 0.06), dip, b);
      });
      // ragged strips along the trailing edge, back to the body
      const last = tips[tips.length - 1];
      for (const u of [0.25, 0.5, 0.75]) skin.push(lerp(last, back, u - 0.08), lerp(lerp(last, back, u), shoulder, -0.09), lerp(last, back, u + 0.06));
      skin.push(back);
      shape(f(skin), BLACK, { angle: 40, over: 0.5 });
      tint(f(skin.slice(1).map((p) => lerp(p, shoulder, 0.26))), LINING, { gap: 3.4, wash: 0.5, press: 0.85 });
      for (const t of f(tips)) stroke([f([shoulder])[0], t], { w: 7, col: BONE });
      for (const [i, u] of holes) paper(f(hole(...lerp(shoulder, lerp(tips[i], tips[i + 1], 0.5), u), 52)), { w: 4.5 });
      const [jx, jy] = f([joint])[0];
      shape([[jx - 20, jy + 14], [jx + 8, jy - 80], [jx + 20, jy + 12]], CLAW, { over: 0 }, { w: 4 }, false);
    };
    // the far wing, behind, seen at a slant: smaller, towards the shoulder
    const far = (pts: P[]): P[] => pts.map(([x, y]) => [410 + (x - 410) * 0.7, 420 + (y - 420) * 0.82]);
    c.part('aile-loin', { pivot: [410 + DX, 420 + DY], ...beat, behind: true }, () => {
      const g = big([410, 410]);
      const [sh, j, bk, ...tips] = g([[420, 405], [190, 152], [330, 520], [70, 175], [30, 265], [45, 360], [60, 450], [90, 530]]);
      wing(sh, j, tips, bk, [[1, 0.62]], (pts) => far(pts));
    });
    // the high collar behind its head, grown into great pointed lapels lined with violet
    shape([[330, 372], [205, 60], [350, 232], [420, 290], [540, 280], [655, 190], [775, 30], [655, 388]], BLACK, { angle: 90, over: 0.3 }, {}, false);
    tint([[352, 345], [245, 130], [372, 258], [540, 300], [690, 130], [632, 362]], VIOLET, { gap: 3.2, wash: 0.45 });
    // the body standing tall, a violet front
    shape([[390, 380], [600, 380], [650, 560], [610, 760], [520, 820], [420, 790], [360, 620]], BLACK, { angle: 80, over: 0.6 });
    tint(potato(495, 600, 85, 150, 10, 0.05), VIOLET, { gap: 3.2, wash: 0.5 });
    for (const y of [590, 660, 730]) stroke([[440, y], [470, y + 12], [520, y + 12], [550, y]], { w: 3.5, col: BONE });
    c.star(500 + DX, 680 + DY, 50, -8);
    // legs, and long talons gripping
    for (const x of [440, 560]) {
      shape([[x - 24, 790], [x + 24, 790], [x + 20, 880], [x - 20, 880]], BLACK, { angle: 90, over: 0 });
      for (const dx of [-26, 0, 26]) shape([[x + dx * 0.5 - 10, 872], [x + dx * 2.3, 965], [x + dx * 0.5 + 10, 874]], CLAW, { over: 0 }, { w: 3.5 }, false);
    }
    // its ears, nearly twice as tall
    shape([[330, 282], [200, -70], [442, 225]], BLACK, { angle: 70, over: 0.4 }, {}, false);
    tint([[350, 262], [232, 10], [420, 222]], GREEN, { gap: 3 });
    shape([[476, 214], [592, -150], [606, 256]], BLACK, { angle: 100, over: 0.4 }, {}, false);
    tint([[496, 210], [586, -60], [590, 240]], GREEN, { gap: 3 });
    // the head
    shape(potato(435, 315, 120, 98, 11, 0.05), BLACK, { angle: 70, over: 0.5 });
    // glowing green eyes, narrower and fiercer under heavier brows, the far one smaller
    shape([[332, 300], [372, 286], [400, 308], [360, 320]], GREEN, { over: 0 }, { w: 3.5 }, false);
    shape([[424, 296], [488, 272], [524, 300], [462, 320]], GREEN, { over: 0 }, { w: 3.5 }, false);
    dot(368, 303, 6, 12);
    dot(474, 296, 7, 16);
    stroke([[318, 266], [406, 294]], { w: 13 });
    stroke([[416, 278], [534, 246]], { w: 14 });
    // an open snarl, two fangs grown long down over its chest
    shape([[338, 350], [400, 370], [470, 364], [508, 342], [478, 392], [405, 402], [352, 380]], '#5a2430', { over: 0 }, { w: 5 });
    dot(330, 322, 9, 7);
    paper([[356, 362], [378, 528], [398, 368]], { w: 4 }, false);
    paper([[436, 368], [462, 552], [482, 364]], { w: 4 }, false);
    // the near wing, twice as big and torn: in battle the wings beat slowly
    c.part('aile', { pivot: [600 + DX, 420 + DY], ...beat }, () => {
      const g = big([590, 405]);
      const [sh, j, bk, ...tips] = g([[590, 405], [850, 122], [640, 520], [975, 160], [1010, 265], [995, 370], [975, 460], [930, 545]]);
      wing(sh, j, tips, bk, [[1, 0.6], [3, 0.62]]);
    });
    // only in battle: poison beads at the tips of its fangs
    c.part('gouttes', { pivot: [420 + DX, 540 + DY], motion: 'flicker', period: 1.7, extra: true }, () => {
      for (const [x, y] of [[378, 528], [462, 552]] as P[]) shape([[x, y - 6], [x + 16, y + 26], [x, y + 44], [x - 16, y + 26]], GREEN, { over: 0 }, { w: 3.5 });
    });
  },
} satisfies Fair;
