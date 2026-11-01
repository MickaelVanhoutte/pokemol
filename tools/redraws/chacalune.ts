import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb, paw } from './anatomy.ts';

/** A ghostly wisp along `spine` (root to tip), `w` wide at its root: see-through violet, a faint line, curling off. */
export function wisp(c: Crayon, spine: P[], w: number, col: string, line: string, wash = 0.45) {
  const pts = c.band(spine, w, 4);
  c.tint(pts, col, { wash, angle: 40, press: 0.8 });
  c.stroke(pts.slice(0, Math.ceil(pts.length / 2) + 1), { w: 3, col: line });
}

/** Points every `step` px along the polyline through `pts`. */
function along(pts: P[], step = 12): P[] {
  const out: P[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

/**
 * Mist along `spine` (root to tip), `w0` wide at its root: no outline, see-through colour laid in `layers` ever shorter
 * tongues from the root, so it is thickest by the body and fades away towards the tip.
 */
export function mist(c: Crayon, spine: P[], w0: number, col: string, layers = 4, wash = 0.6) {
  const sp = along(spine), n = sp.length;
  for (let k = 0; k < layers; k++) {
    const m = Math.max(3, Math.round(n * (1 - k / (layers + 0.6))));
    const ws = sp.slice(0, m).map((_, i) => w0 * (1 - 0.8 * (i / (n - 1))) * Math.min(1, ((m - 1 - i) / (m - 1)) * 2.4 + 0.05) * (1 - k * 0.12));
    c.tint(lineOfAction(sp.slice(0, m), ws), col, { wash: wash / layers + 0.04, angle: 40 + k * 25, press: 0.8 });
  }
}

/**
 * A lonely little jackal (« solitaire du crépuscule »), turned to the left: big ears, sandy fur, lying alone on a fallen
 * carved stone at dusk, chin on its paws, its tail hanging down the side. Dark ear tips, and the tip of its tail is already a wisp of see-through spirit smoke: the guardian it will become.
 */
export default {
  id: '065', slug: 'chacalune', seed: 6507, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const SAND = '#e0b062', FAR = '#a87436', CREAM = '#f8e8c4', EAR = '#f2b49a', PINK = '#f29ab0';
    const GHOST = '#a48cf0', SPIRIT = '#7fe6dc', TIP = '#2e2a44', GLINE = '#6a58a8', STONE = '#b8aeb4', STONE2 = '#958a96', NOSE = '#3a2a2a';

    /** The pup's head centred on (hx, hy), `s` its size, turned `rot` degrees: lonely, gazing up. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the big ears: the far one behind, the near one tall
      shape(h([[-100, -64], [-190, -270], [-196, -300], [-150, -280], [-30, -100]]), FAR, { angle: 80, over: 0 });
      c.tint(h([[-176, -236], [-196, -300], [-150, -280], [-136, -230]]), TIP, { wash: 1 });
      c.part('oreille', { pivot: H([60, -90]), motion: 'swing', amp: 3, period: 3 }, () => {
        shape(h([[0, -100], [40, -300], [64, -340], [96, -310], [150, -80]]), SAND, { angle: 80, over: 0.2 });
        c.tint(h([[30, -110], [58, -280], [76, -300], [116, -100]]), EAR, { wash: 0.7 });
        // dark ear tips, like the guardian it will become
        c.tint(h([[30, -250], [64, -340], [96, -310], [112, -240]]), TIP, { wash: 1 });
      });
      const outline = h([[-236, 38], [-226, 16], [-170, -4], [-110, -54], [-30, -100], [50, -104], [112, -72], [142, -10], [132, 52], [84, 98], [0, 112], [-82, 98], [-152, 78], [-214, 62]]);
      shape(outline, SAND, { angle: 78, over: 0.45 }, { w: 0.1 });
      // the cream muzzle and cheek
      shape(h([[-236, 38], [-226, 16], [-170, 4], [-110, 30], [-50, 60], [20, 70], [96, 60], [132, 52], [84, 98], [0, 112], [-82, 98], [-152, 78], [-214, 62]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      // lonely: big glossy eyes looking up, brows tilted up in the middle, a small closed mouth
      const [e1, e2] = [H([-110, -24]), H([0, -30])];
      c.eye(e1[0], e1[1], 24 * s, 31 * s, '#241c38');
      c.eye(e2[0], e2[1], 31 * s, 39 * s, '#241c38');
      stroke(h([[-140, -72], [-96, -84]]), { w: 5 });
      stroke(h([[-30, -100], [30, -86]]), { w: 5 });
      dot(...H([-232, 28]), 15 * s, 11 * s, NOSE);
      stroke(h([[-210, 66], [-180, 74], [-156, 66]]), { w: 4.5 });
      c.cheek(...H([70, 50]), 24 * s, 14 * s, PINK);
      c.part('paupieres', { pivot: H([-50, -26]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 24 * s, 31 * s, SAND);
        c.lid(e2[0], e2[1], 31 * s, 39 * s, SAND);
      });
    };

    // lying on top of a fallen carved stone, chin on its paws, ears up, the tail hanging down the side
    c.part('ruine', { pivot: [560, 800], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      c.tint(potato(540, 930, 360, 26, 12, 0.03), '#ddd4e0', { wash: 0.9 });
      shape([[230, 930], [236, 720], [700, 700], [760, 740], [790, 700], [820, 710], [830, 930]], STONE, { angle: 10, over: 0.2 }, {}, false);
      stroke([[240, 780], [820, 770]], { w: 4, col: STONE2 });
      stroke([[240, 870], [826, 864]], { w: 4, col: STONE2 });
      for (const x of [330, 470, 610]) stroke([[x, 786], [x + 30, 820], [x + 60, 786], [x + 90, 820]], { w: 3.5, col: STONE2 }, false);
      stroke([[560, 880], [540, 910], [556, 930]], { w: 3, col: STONE2 });
    });
    c.part('queue', { pivot: [740, 700], motion: 'swing', amp: 3, period: 3, behind: true }, () => {
      // the bushy tail hanging down the stone, its tip turning to see-through shadow and curling up like smoke
      shape(c.band([[740, 690], [810, 740], [836, 826]], 76, 66), SAND, { angle: 80, over: 0.2 });
      // the end of the tail fading to violet, then a see-through wisp curling up and fraying into smoke
      c.tint(c.band([[816, 760], [836, 826]], 70, 66), SPIRIT, { wash: 0.45, angle: 40 });
      mist(c, [[836, 812], [846, 876], [884, 920], [940, 916], [958, 868], [930, 846]], 74, GHOST, 4, 1);
      mist(c, [[836, 812], [846, 876], [884, 916], [930, 912]], 56, SPIRIT, 3, 0.8);
      c.stroke([[862, 900], [900, 926], [944, 912], [958, 870], [934, 850], [916, 866]], { w: 3, col: GLINE });
    });
    shape(c.band([[460, 690], [360, 702], [300, 708]], 50, 40), FAR, { angle: 10 });
    paw(c, 290, 708, FAR, 40);
    shape([[300, 716], [350, 620], [480, 570], [640, 566], [770, 620], [790, 716], [300, 720]], SAND, { angle: 20, over: 0.4 });
    openLimb(c, potato(690, 650, 80, 60, 10, 0.04), SAND, 1, 8);
    shape(c.band([[470, 700], [360, 712], [290, 716]], 54, 44), SAND, { angle: 10 });
    paw(c, 270, 714, SAND, 46);
    head(330, 600, 0.92, 4);
  },
} satisfies Redraw;
