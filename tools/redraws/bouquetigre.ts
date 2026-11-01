import type { P, Redraw } from './crayon.ts';
import { jaggedLeaf, openLimb } from './anatomy.ts';

/**
 * Minoufleur grown into a patient hunter (« chasseur patient », Grass/Fighting), turned to the left: a striped tiger
 * creeping belly low, shoulders high, coiled to spring. Minoufleur's bud has grown into a big flower rooted in its back
 * that opens like a jaw, two jagged leaves for lips, and lashes out two vine-whips at whoever it stalks. A wedge head,
 * long legs bent at the joints, narrowed eyes: angular where its first forms were round.
 */
export default {
  id: '024', slug: 'bouquetigre', seed: 2491, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band } = c;
    const LIME = '#8ccc34', DEEP = '#6aa828', STRIPE = '#2f6a22', LEAF = '#4fa83a', VEIN = '#2f7a26', PALE = '#eef6d4';
    const PINK = '#f29ab0', PETAL = '#f06aa8', LIP = '#ff8cc4', THROAT = '#8a2a66', VINE = '#3f9a30';

    /** Maps (across, up) from `base` along the direction `deg` (0 = up, clockwise), scaled by `s`. */
    const along = (base: P, deg: number, s: number) => {
      const a = (deg * Math.PI) / 180, u: P = [Math.sin(a), -Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      return ([px, py]: P): P => [base[0] + (v[0] * px + u[0] * py) * s, base[1] + (v[1] * px + u[1] * py) * s];
    };
    /** One lip of the flower: half a bud, its inner edge cut in petal points, a jagged leaf hugging its outside. */
    const lip = (base: P, deg: number, s: number, side: 1 | -1) => {
      const at = along(base, deg, s), t = (pts: P[]) => pts.map(([x, y]): P => at([x * side, y]));
      jaggedLeaf(c, t([[20, 0], [80, 60], [100, 150], [70, 220]]), 30 * s, side > 0 ? DEEP : LEAF, VEIN);
      shape(t([[0, 0], [60, 30], [86, 120], [70, 210], [20, 290], [-6, 300], [0, 250], [-16, 226], [4, 190], [-14, 160], [6, 120], [-6, 80]]), PETAL, { angle: deg + 70, over: 0.3 });
      c.tint(t([[8, 40], [40, 120], [36, 220], [10, 270]]), LIP, { wash: 0.5 });
    };
    /**
     * The flower on its back, rooted at `base`, opening along `deg` like a jaw `gape` degrees wide: the dark throat, the far
     * lip, the two vine-whips lashing out along `vines`, the near lip.
     */
    const flower = (base: P, deg: number, s: number, gape: number, vines: P[][]) => {
      const at = along(base, deg, s);
      shape([at([0, -10]), at([-150, 220]), at([-60, 250]), at([0, 230]), at([60, 250]), at([150, 220])], THROAT, { angle: deg, over: 0 });
      for (const [x, y] of [[-20, 120], [16, 140], [0, 170]] as P[]) dot(...at([x, y]), 9 * s, 9 * s, '#f6d65a');
      lip(base, deg + gape / 2, s, 1);
      c.part('lianes', { pivot: at([0, 120]), motion: 'swing', amp: 6, period: 1.4 }, () => {
        for (const v of vines) {
          shape(band([at([0, 120]), ...v], 30, 12), VINE, { angle: 40 });
          // the whip's tip: a narrow pointed leaf
          const [a, b] = [v[v.length - 2], v[v.length - 1]], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), u: P = [dx / l, dy / l], n: P = [-u[1], u[0]];
          const tip = (f: number, k: number): P => [b[0] + u[0] * f + n[0] * k, b[1] + u[1] * f + n[1] * k];
          shape([tip(-6, 0), tip(30, 22), tip(70, 14), tip(96, 0), tip(70, -14), tip(30, -22)], LEAF, { angle: 30, over: 0 });
          stroke([tip(0, 0), tip(80, 0)], { w: 3, col: VEIN });
        }
      });
      lip(base, deg - gape / 2, s, -1);
    };
    /** Tiger stripes: tapered dark marks from `a` to `b`. */
    const stripes = (pts: [P, P][]) => {
      for (const [a, b] of pts) {
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
        shape([[a[0] + n[0] * 16, a[1] + n[1] * 16], [(a[0] + b[0]) / 2 + n[0] * 9, (a[1] + b[1]) / 2 + n[1] * 9], b, [a[0] - n[0] * 16, a[1] - n[1] * 16]], STRIPE, { over: 0 }, { w: 2.5 });
      }
    };
    /** The wedge head centred on (hx, hy), `s` its size, turned `rot` degrees: pointed ears, a cheek ruff, a patient glare. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      shape(h([[-70, -60], [-96, -178], [-10, -84]]), DEEP, { angle: 70 }, {}, false);
      shape(h([[20, -84], [64, -200], [110, -60]]), LIME, { angle: 70 }, {}, false);
      c.tint(h([[40, -84], [64, -160], [90, -70]]), PINK, { wash: 0.55 });
      shape(h([[-168, 20], [-140, -34], [-70, -78], [40, -92], [120, -64], [150, -20], [176, -6], [146, 18], [178, 46], [132, 60], [150, 92], [60, 92], [-40, 82], [-120, 66], [-162, 50]]), LIME, { angle: 78 + rot, over: 0.45 }, {}, false);
      c.tint(h([[-168, 22], [-110, 14], [-60, 40], [-60, 80], [-140, 64]]), PALE, { angle: 60, wash: 0.75 });
      stroke(h([[10, -88], [0, -46]]), { w: 11, col: STRIPE });
      stroke(h([[60, -80], [44, -44]]), { w: 11, col: STRIPE });
      stroke(h([[120, 20], [80, 30]]), { w: 10, col: STRIPE });
      // patient: eyes wide open, staring ahead, brows slanting down to the nose, the mouth shut over two small fangs
      const [e1, e2] = [H([-80, -14]), H([12, -20])];
      c.eye(e1[0], e1[1], 22 * s, 26 * s, '#241c38', { lid: 0.18, skin: LIME, tilt: 18 + rot });
      c.eye(e2[0], e2[1], 30 * s, 34 * s, '#241c38', { lid: 0.18, skin: LIME, tilt: 6 + rot });
      stroke(h([[-112, -50], [-60, -32]]), { w: 8 });
      stroke(h([[-16, -40], [50, -48]]), { w: 8 });
      dot(...H([-160, 14]), 14 * s, 11 * s, '#e07a96');
      stroke(h([[-156, 50], [-110, 60], [-50, 58]]), { w: 5 });
      for (const x of [-128, -96]) shape(h([[x - 8, 56], [x + 8, 58], [x, 80]]), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
      stroke(h([[-150, 34], [-230, 24]]), { w: 3 });
      stroke(h([[-148, 46], [-226, 58]]), { w: 3 });
      c.part('paupieres', { pivot: H([-34, -16]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 22 * s, 26 * s, LIME);
        c.lid(e2[0], e2[1], 30 * s, 34 * s, LIME);
      });
    };
    /** A long angular paw on the ground, toes at the front. */
    const foot = (x: number, y: number, w: number, col: string) => {
      shape([[x - w * 0.6, y - 18], [x + w * 0.5, y - 22], [x + w * 0.56, y + 16], [x - w * 0.64, y + 18]], col, { angle: 0 });
      for (const d of [-0.42, -0.16]) stroke([[x + d * w, y], [x + d * w + 2, y + 18]], { w: 3.5 });
    };

    // stalking: the belly low, the shoulder blade high on the back line, the legs bent and coiled, the flower in the dip
    // of its back open like a jaw, lashing two vine-whips forward over its head
    c.part('queue', { pivot: [950, 650], motion: 'swing', amp: 9, period: 1.4, behind: true }, () => {
      shape(band([[940, 650], [1010, 710], [1060, 660], [1060, 550], [1010, 500]], 60, 30), LIME, { angle: 40, over: 0.3 });
    });
    // the far legs, darker: the front one bent back at the elbow, the hind one folded
    shape(band([[560, 650], [620, 800], [530, 896]], 62, 44), DEEP, { angle: 80 });
    foot(520, 900, 100, DEEP);
    shape(band([[880, 700], [820, 820], [890, 900]], 62, 46), DEEP, { angle: 80 });
    // body and neck in one soft outline: the neck down to the low head, the shoulder blade a peak on the back, the back
    // dipping to the flower, the haunch, the belly low
    shape([[300, 690], [380, 610], [432, 560], [466, 496], [490, 494], [536, 566], [600, 620], [690, 640], [800, 620], [890, 590], [956, 640], [962, 730], [900, 800], [740, 820], [580, 828], [450, 820], [370, 790], [300, 760]], LIME, { angle: 10, over: 0.4 });
    c.tint([[470, 812], [620, 818], [820, 800], [620, 826]], PALE, { wash: 0.7 });
    // the near hind leg coiled: the round haunch, the knee forward, the hock back on the ground, the foot flat
    openLimb(c, [[810, 650], [758, 724], [742, 806], [836, 870], [770, 884], [748, 912], [966, 914], [980, 868], [952, 800], [978, 720], [946, 646]], LIME, 1, 10);
    for (const x of [764, 790]) stroke([[x, 890], [x + 2, 912]], { w: 3.5 });
    stripes([[[780, 646], [770, 740]], [[846, 634], [834, 730]], [[910, 630], [896, 712]]]);
    // the near front leg: under the shoulder blade, the upper arm down and back to the elbow, the wrist, the paw reaching
    // forward
    openLimb(c, [[430, 600], [470, 700], [516, 770], [440, 850], [360, 880], [348, 912], [480, 914], [524, 870], [600, 820], [624, 780], [596, 690], [540, 600]], LIME, 1, 11);
    for (const x of [364, 390]) stroke([[x, 890], [x + 2, 912]], { w: 3.5 });
    // the flower rooted in the dip of its back, rising from it like a jaw opening upward (clear of the shoulder blade),
    // and a collar of jagged leaves growing out of the fur round its base, lying along the back and flanks: it grows out
    // of the body, it isn't laid on it
    flower([724, 630], -18, 0.82, 76, [[[560, 420], [470, 440], [380, 400], [300, 430]], [[600, 360], [520, 300], [430, 310], [350, 270]]]);
    jaggedLeaf(c, [[700, 636], [640, 676], [590, 720]], 34, DEEP, VEIN);
    jaggedLeaf(c, [[748, 636], [810, 672], [868, 690]], 34, LEAF, VEIN);
    jaggedLeaf(c, [[724, 640], [726, 700], [716, 750]], 30, LEAF, VEIN);
    head(232, 742, 0.84, -4);
  },
} satisfies Redraw;
