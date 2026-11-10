import type { P, Redraw } from './crayon.ts';
import { rounded, sample } from './pandaKit.ts';

/**
 * A baby mudskipper, the daredevil: a caramel fish lying on a lump of mud, its front propped up on one strong fin like
 * an elbow, its body curved like a spring and its tail flicked up behind it, ready to hop. Two big eyes bulging on top of
 * its head, a wide cheeky grin. Turquoise spots down its back and on the little sail of a fin it raises when excited.
 * Its flaw: it always jumps before looking.
 */
export const BODY = '#c8722e', DEEP = '#8a4620', BELLY = '#f6e6c4', SPOT = '#25b0ea', SAIL = '#9ee0f4', MUD = '#6e4e32';

/** A fin: a fan from `root` to the edge `pts`, a few rays, a scalloped feel left to the line. */
export function fin(c: { shape: (p: P[], col: string, o?: object, l?: object, round?: boolean) => void; stroke: (p: P[], l?: object) => void }, rootP: P, pts: P[], col: string, rays = 3, ray = '#4a8aa8') {
  c.shape([rootP, ...pts], col, { angle: 30, over: 0.1 });
  for (let i = 1; i <= rays; i++) {
    const q = pts[Math.round((i * (pts.length - 1)) / (rays + 1))];
    c.stroke([[rootP[0] * 0.8 + q[0] * 0.2, rootP[1] * 0.8 + q[1] * 0.2], [rootP[0] * 0.12 + q[0] * 0.88, rootP[1] * 0.12 + q[1] * 0.88]], { w: 3, col: ray });
  }
}

/** The fish's body along `ctrl` (head first), `w(t)` wide, rounded at both ends, with its pale belly on the `R` side. */
export function fishBody(c: Parameters<typeof fin>[0] & { tint: (p: P[], col: string, o?: object) => void }, ctrl: P[], w: (t: number) => number, col = BODY, belly = BELLY, N = 40, bellyFrom = 2) {
  const sp = sample(ctrl, N), ws = sp.map((_, i) => w(i / (N - 1)));
  c.shape(rounded(sp, ws), col, { angle: 30, over: 0.4 });
  // the belly: a pale band along the lower edge
  const L: P[] = [], R: P[] = [];
  sp.forEach(([x, y], i) => {
    const [ax, ay] = sp[Math.max(0, i - 1)], [bx, by] = sp[Math.min(N - 1, i + 1)], l = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / l, ny = (bx - ax) / l, h = ws[i] / 2;
    L.push([x + nx * h * 0.2, y + ny * h * 0.2]);
    R.push([x + nx * h * 0.92, y + ny * h * 0.92]);
  });
  c.tint([...L.slice(bellyFrom, N - 8), ...R.slice(bellyFrom, N - 8).reverse()], belly, { angle: 30, wash: 0.85 });
  return { sp, ws };
}

export default {
  id: '135', slug: 'sautevase', seed: 13503, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    // the lump of wet mud, lumpy, a shine along its edge, a little splash ring under the elbow
    c.part('vase', { pivot: [540, 880], motion: 'nod', amp: 1, period: 3, decor: true, behind: true }, () => {
      // a lumpy puddle of wet mud: an uneven rim, darker and shiny at its wet edge, a splash ring under the elbow
      shape([[150, 880], [200, 850], [260, 866], [320, 836], [400, 852], [470, 826], [560, 846], [640, 822], [740, 846], [820, 836], [890, 874], [850, 906], [880, 930], [760, 926], [660, 944], [560, 930], [440, 950], [340, 932], [240, 944], [180, 920]], MUD, { angle: 10, over: 0.3 });
      c.tint([[160, 900], [260, 930], [440, 942], [660, 936], [860, 920], [700, 912], [460, 920], [260, 912]], '#4a3220', { angle: 10, wash: 0.6 });
      stroke([[230, 862], [300, 846]], { w: 4, col: '#c0a080' });
      stroke([[620, 832], [700, 844]], { w: 4, col: '#c0a080' });
      stroke([[220, 878], [260, 860], [320, 862], [360, 880]], { w: 3.5, col: '#8fd0e6' });
      c.dot(200, 840, 9, 11, MUD);
      c.dot(370, 836, 7, 9, MUD);
    });
    // the tail fin, flicked up behind
    c.part('queue', { pivot: [850, 640], motion: 'swing', amp: 4, period: 1.4, behind: true }, () => {
      fin(c, [860, 640], [[880, 540], [930, 500], [970, 560], [950, 630], [980, 690], [910, 700]], SAIL, 3);
    });
    // the body: a big blunt head propped up at the front, tapering along the mud to a thin tail that curls up
    // the little sail on its back, its base sunk behind the back line
    fin(c, [570, 690], [[560, 600], [600, 556], [650, 540], [700, 566], [740, 640], [740, 700]], SAIL, 4);
    c.dot(624, 600, 12, 12, SPOT);
    c.dot(684, 612, 10, 10, SPOT);
    fishBody(c, [[320, 560], [440, 650], [580, 740], [720, 760], [830, 700], [860, 650]], (k) => (k < 0.18 ? 300 : 300 - ((k - 0.18) / 0.82) * 250));
    for (const [x, y, r] of [[520, 660, 15], [610, 700, 13], [700, 710, 11], [780, 680, 10], [440, 610, 13]] as [number, number, number][]) c.dot(x, y, r, r, SPOT);
    // the near front fin: an arm with an elbow, the forearm flat on the mud, the fin fanned at the end
    shape(c.band([[420, 710], [400, 790], [340, 836]], 96, 76), BODY, { angle: 40, over: 0.2 }, { w: 4.5 });
    fin(c, [330, 836], [[270, 790], [220, 830], [250, 876], [330, 878]], '#8fd0e6', 3);
    // turret eyes on top of its head: the near one big, the far one half hidden behind it
    shape(potato(410, 420, 64, 70, 10, 0.04), BODY, { angle: 60, over: 0.2 });
    c.eye(414, 412, 40, 46);
    shape(potato(300, 440, 72, 76, 10, 0.04), BODY, { angle: 60, over: 0.2 });
    c.eye(300, 434, 48, 56);
    // one brow cocked, daring
    stroke([[262, 376], [300, 350], [346, 362]], { w: 6.5 });
    // a one-sided smirk under the tip of the snout
    stroke([[200, 600], [240, 622], [292, 618], [320, 596]], { w: 6 });
    stroke([[312, 604], [328, 590]], { w: 4.5 });
    c.cheek(380, 580, 32, 18);
    c.part('paupieres', { pivot: [356, 424], motion: 'blink', extra: true }, () => {
      c.lid(414, 412, 40, 46, BODY);
      c.lid(300, 434, 48, 56, BODY);
    });
  },
} satisfies Redraw;
