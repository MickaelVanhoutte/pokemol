import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';

/**
 * A little meerkat on watch (« sentinelle anxieuse »), turned to the left: standing up on its hind legs beside its
 * burrow, propped on its tail, its little digging paws held up at its chest, head turned towards a noise only it heard,
 * eyes wide in their dark patches, brows up with worry. A tuft on its crown (the chief's crest to come) and small spade
 * claws, the ones it digs with in a flash when it dives back into its tunnel.
 */
export default {
  id: '031', slug: 'guettou', seed: 3119, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const SAND = '#e3b064', DEEP = '#c48e46', CREAM = '#f8e6c0', PATCH = '#8a5a36', DARK = '#5a3a26', PINK = '#f29ab0';
    const SOIL = '#b07840', HOLE = '#2e1e14', CLAW = '#6a4e44';

    /** A digging paw at (x, y) pointing along `deg` (0 = down): a little mitt, three long spade claws. */
    const digPaw = (x: number, y: number, deg: number, s: number, col: string) => {
      const a = (deg * Math.PI) / 180, u: P = [-Math.sin(a), Math.cos(a)], v: P = [Math.cos(a), Math.sin(a)];
      const at = (px: number, py: number): P => [x + (v[0] * px + u[0] * py) * s, y + (v[1] * px + u[1] * py) * s];
      for (const k of [-14, 0, 14]) shape([at(k - 7, 10), at(k - 5, 46), at(k, 58), at(k + 6, 44), at(k + 7, 10)], CLAW, { over: 0 }, { w: 3 });
      shape(potato(...at(0, 4), 24 * s, 20 * s, 8, 0.05), col, { over: 0 });
    };
    /** The head centred on (hx, hy), `s` its size, turned `rot` degrees: a short pointed snout, worried eyes in patches. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the far ear peeking
      shape(potato(...H([-30, -120]), 26 * s, 30 * s, 8, 0.05), DARK, { over: 0 });
      shape(h([[-196, 40], [-190, 6], [-150, -40], [-80, -110], [20, -130], [110, -100], [160, -30], [160, 50], [110, 110], [20, 136], [-70, 120], [-150, 80]]), SAND, { angle: 80, over: 0.4 });
      c.tint(h([[-196, 42], [-150, 78], [-70, 116], [0, 120], [-40, 70], [-120, 40]]), CREAM, { angle: 60, wash: 0.75 });
      // the tuft on its crown
      shape(h([[-50, -116], [-20, -154], [30, -170], [80, -158], [96, -134], [66, -142], [40, -132], [20, -118]]), SAND, { angle: 30, over: 0 });
      // the near ear, low on the side of the head
      shape(potato(...H([128, -6]), 28 * s, 36 * s, 8, 0.05), DARK, { angle: 80, over: 0 });
      // dark patches round the eyes, drooping a little towards the cheek (the meerkat's)
      const [e1, e2] = [H([-92, -24]), H([10, -30])];
      shape(h([[-124, -50], [-66, -64], [-54, -6], [-60, 48], [-82, 70], [-100, 30], [-126, 0]]), PATCH, { angle: 80, over: 0, wash: 0.8 }, { w: 0.1 });
      shape(h([[-28, -68], [44, -72], [58, -10], [52, 50], [30, 84], [4, 40], [-30, 4]]), PATCH, { angle: 80, over: 0, wash: 0.8 }, { w: 0.1 });
      // worried: eyes wide open, brows tilted up in the middle, a small wobbly mouth
      c.eye(e1[0], e1[1], 26 * s, 34 * s, '#241c38');
      c.eye(e2[0], e2[1], 32 * s, 40 * s, '#241c38');
      stroke(h([[-118, -96], [-74, -110]]), { w: 6 });
      stroke(h([[-22, -118], [40, -106]]), { w: 6 });
      c.cheek(...H([82, 58]), 24 * s, 14 * s, PINK);
      dot(...H([-190, 22]), 14 * s, 11 * s, DARK);
      stroke(h([[-166, 72], [-150, 62], [-134, 72], [-118, 64]]), { w: 4.5 });
      // a drop of worry
      shape(h([[150, -120], [134, -88], [146, -70], [164, -82], [160, -104]]), '#bfe2f6', { over: 0, wash: 1 }, { w: 3.5 });
      c.part('paupieres', { pivot: H([-40, -26]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 26 * s, 34 * s, PATCH);
        c.lid(e2[0], e2[1], 32 * s, 40 * s, PATCH);
      });
    };

    // its burrow in front, a ring of dug-up soil round a dark hole (scenery: off the follower)
    c.part('terrier', { pivot: [220, 900], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape([[30, 930], [60, 860], [130, 820], [220, 808], [320, 822], [390, 870], [410, 930], [300, 950], [140, 952]], SOIL, { angle: 10, over: 0.3 });
      shape([[96, 900], [110, 866], [170, 846], [260, 846], [330, 866], [344, 900], [300, 916], [160, 918]], HOLE, { angle: 0, over: 0, press: 1.3, wash: 1 }, { w: 4 });
      stroke([[60, 940], [200, 930], [380, 936]], { w: 3.5, col: '#8a5a30' });
    });
    // the meerkat tripod: haunches and both hind feet planted, the tail laid on the ground behind as the third prop
    shape(band([[620, 850], [700, 900], [800, 910], [890, 900]], 60, 22), DEEP, { angle: 20 });
    c.tint(band([[820, 908], [890, 900]], 28, 16), DARK, { wash: 0.8 });
    shape(potato(372, 904, 54, 18, 8, 0.05), DEEP, { angle: 0 });
    // the body: a pear, narrow at the shoulders and wide at the seat, a cream belly
    shape([[430, 470], [386, 530], [360, 630], [342, 750], [362, 850], [440, 900], [580, 900], [650, 840], [656, 720], [616, 580], [548, 482]], SAND, { angle: 80, over: 0.4 });
    c.tint([[400, 540], [380, 650], [372, 770], [420, 870], [490, 860], [480, 720], [462, 560]], CREAM, { angle: 80, wash: 0.8 });
    // the near haunch, round on the flank, the hind foot flat on the ground pointing forward
    openLimb(c, [[580, 690], [500, 730], [470, 810], [440, 870], [380, 900], [390, 920], [610, 920], [662, 870], [664, 770], [630, 700]], SAND, 1, 9);
    // both little digging paws held up at its chest, drooping
    shape(band([[392, 540], [366, 600], [326, 600]], 46, 40), DEEP, { angle: 60 });
    digPaw(310, 606, 24, 0.95, DEEP);
    shape(band([[450, 540], [430, 620], [380, 618]], 58, 46), SAND, { angle: 60 });
    digPaw(362, 624, 18, 1.15, SAND);
    head(450, 330, 1, -6);
  },
} satisfies Redraw;
