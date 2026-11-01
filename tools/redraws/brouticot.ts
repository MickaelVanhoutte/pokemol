import type { Crayon, P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';

/** A goat's hoof at (x, y), `w` wide, turned `deg` degrees (clockwise): a dark rounded wedge, toe to the left, its split. */
export function hoof(c: Crayon, x: number, y: number, w: number, deg = 0, col = '#4e3a36') {
  const a = (deg * Math.PI) / 180, R = ([px, py]: P): P => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
  c.shape(([[-w * 0.44, -14], [w * 0.44, -14], [w * 0.52, 4], [w * 0.46, 16], [-w * 0.66, 16], [-w * 0.6, 2]] as P[]).map(R), col, { angle: 80 + deg, over: 0, press: 1.1 }, { w: 4 });
  c.stroke(([[-w * 0.06, -10], [-w * 0.1, 14]] as P[]).map(R), { w: 3, col: '#2a2024' });
  c.stroke(([[-w * 0.36, -8], [-w * 0.42, 6]] as P[]).map(R), { w: 3, col: '#8a706a' });
}

/** A limb through its joints (hip or shoulder first), `ws` wide at each, its line open where it joins the body. */
export function limb(c: Crayon, pts: P[], ws: number[], col: string) {
  const out = lineOfAction(pts, ws);
  openLimb(c, out, col, 1, out.length - 1);
}

/**
 * A goat's leg through its joints: from the shoulder or hip, the knee or hock, the fetlock, down to the top of the hoof
 * (last point). Coloured `col`, a `sock` from the knee or hock down (the `sockFrom`-th point), the hoof turned `deg`.
 */
export function goatLeg(c: Crayon, pts: P[], ws: number[], col: string, sock: string, sockFrom: number, deg = 0) {
  limb(c, pts, ws, col);
  const [a, b] = [pts[sockFrom], pts[sockFrom + 1]];
  const sp: P[] = [[a[0] + (b[0] - a[0]) * 0.15, a[1] + (b[1] - a[1]) * 0.15], ...pts.slice(sockFrom + 1)];
  c.shape(lineOfAction(sp, [ws[sockFrom] * 0.92, ...ws.slice(sockFrom + 1)]), sock, { angle: 80, over: 0 }, { w: 4 });
  const [x, y] = pts[pts.length - 1], n = ws[ws.length - 1];
  const r = (deg * Math.PI) / 180;
  hoof(c, x - Math.sin(r) * 12, y + Math.cos(r) * 12, n * 1.35, deg);
}

/**
 * The kid goat (« chevreau gourmand »), turned to the left: a little goat lying tucked like a loaf, a big head, a green
 * coat with a cream blaze and cream socks, a seedling sprouting from its forehead (the vine horns to come), munching a leaf that
 * hangs from its mouth, its cheek full. It eats everything, even what it shouldn't.
 */
export default {
  id: '062', slug: 'brouticot', seed: 6201, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const FUR = '#8cc653', DEEP = '#6aa63e', FAR = '#5c9436', CREAM = '#f7eccb', SPROUT = '#4fb03a', VEIN = '#2f7a26';
    const PINK = '#f29ab0', NOSE = '#d9738e', LEAF = '#3f9a30';

    /** The kid's head centred on (hx, hy), `s` its size, turned `rot` degrees: delighted, munching a leaf. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the seedling on its forehead: a curling stem, two round leaves
      c.part('pousse', { pivot: H([-10, -110]), motion: 'swing', amp: 5, period: 2.4, behind: true }, () => {
        shape(c.band(h([[-14, -100], [-20, -150], [-4, -196], [10, -214]]), 20, 14), SPROUT, { angle: 80, over: 0 });
        shape(h([[6, -210], [-40, -236], [-96, -232], [-80, -196], [-30, -192]]), SPROUT, { angle: 30, over: 0.2 });
        stroke(h([[0, -208], [-70, -220]]), { w: 3, col: VEIN });
        shape(h([[14, -212], [48, -254], [104, -262], [96, -222], [50, -206]]), SPROUT, { angle: 150, over: 0.2 });
        stroke(h([[18, -214], [84, -242]]), { w: 3, col: VEIN });
      });
      // the far ear, sticking out behind the crown
      shape(h([[-70, -86], [-140, -128], [-206, -128], [-180, -100], [-110, -64]]), FAR, { angle: 20, over: 0 });
      // the near ear, long and floppy, sticking out sideways
      c.part('oreille', { pivot: H([110, -60]), motion: 'swing', amp: 5, period: 2.8 }, () => {
        shape(h([[90, -84], [170, -92], [252, -60], [276, -30], [236, -14], [160, -20], [100, -30]]), FUR, { angle: 20, over: 0.2 });
        c.tint(h([[124, -66], [190, -68], [244, -42], [190, -36], [130, -44]]), PINK, { wash: 0.6 });
      });
      const outline = h([[-236, 40], [-230, 6], [-196, -18], [-136, -62], [-56, -110], [34, -118], [112, -88], [150, -24], [142, 44], [100, 94], [24, 116], [-70, 110], [-150, 94], [-214, 80]]);
      shape(outline, FUR, { angle: 78, over: 0.45 }, { w: 0.1 });
      // the cream blaze: down the forehead to the muzzle
      shape(h([[-236, 40], [-230, 6], [-196, -18], [-130, -44], [-70, -104], [-30, -114], [-44, -40], [-64, 30], [-50, 106], [-70, 110], [-150, 94], [-214, 80]]), CREAM, { angle: 60, over: 0 }, { w: 0.1 });
      stroke([...outline, outline[0], outline[1]], { w: 5 });
      // delighted: big shiny eyes, brows up, a full cheek
      const [e1, e2] = [H([-118, -34]), H([4, -40])];
      c.eye(e1[0], e1[1], 24 * s, 31 * s, '#241c38');
      c.eye(e2[0], e2[1], 32 * s, 40 * s, '#241c38');
      stroke(h([[-142, -82], [-116, -92], [-92, -84]]), { w: 5 });
      stroke(h([[-26, -100], [6, -110], [38, -98]]), { w: 5 });
      c.cheek(...H([62, 54]), 34 * s, 22 * s, PINK);
      // the nose at the muzzle's tip; under it the mouth chewing, a leaf on its stalk hanging from the corner
      shape(potato(...H([-222, 20]), 15 * s, 11 * s, 8, 0.05), NOSE, { over: 0 }, { w: 3 });
      stroke(h([[-224, 60], [-196, 72], [-160, 70], [-140, 58]]), { w: 4.5 });
      // the leaf it is munching: its stalk in the corner of the mouth, a bite taken out of its tip
      c.part('feuille', { pivot: H([-180, 70]), motion: 'swing', amp: 5, period: 1.6 }, () => {
        stroke(h([[-170, 70], [-214, 92], [-250, 100]]), { w: 5, col: VEIN });
        shape(h([[-248, 96], [-290, 100], [-330, 130], [-342, 170], [-322, 176], [-316, 196], [-296, 196], [-262, 166], [-246, 128]]), LEAF, { angle: 120, over: 0.2 });
        stroke(h([[-250, 102], [-290, 140], [-312, 176]]), { w: 3, col: '#bfe48a' });
      });
      c.part('paupieres', { pivot: H([-56, -36]), motion: 'blink', extra: true }, () => {
        c.lid(e1[0], e1[1], 24 * s, 31 * s, FUR);
        c.lid(e2[0], e2[1], 32 * s, 40 * s, FUR);
      });
    };
    // lying tucked like a little loaf, legs folded under, head up, munching away
    c.part('ombre', { pivot: [620, 900], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      c.tint(potato(600, 904, 320, 32, 12, 0.03), '#e2dccc', { wash: 0.9 });
    });
    c.part('queue', { pivot: [800, 720], motion: 'swing', amp: 8, period: 1.2, behind: true }, () => {
      shape([[786, 730], [826, 650], [864, 638], [848, 690], [816, 746]], DEEP, { angle: 60, over: 0 });
    });
    // the far front leg stretched forward on the ground: the knee, the cannon, the hoof in front
    goatLeg(c, [[500, 846], [430, 870], [380, 878], [350, 878]], [50, 40, 32, 28], FAR, CREAM, 1, 80);
    // the body, a round loaf on the ground, the chest up under the chin
    shape([[440, 880], [430, 760], [480, 690], [600, 660], [740, 680], [830, 760], [830, 870], [720, 902], [540, 904]], FUR, { angle: 20, over: 0.4 });
    // the near hind leg folded: the round haunch, the hock back, the cannon forward under the belly, the hoof
    openLimb(c, potato(736, 808, 80, 70, 10, 0.04), FUR, 1, 8);
    goatLeg(c, [[760, 840], [790, 884], [700, 890], [640, 886], [618, 884]], [70, 44, 34, 30, 28], FUR, CREAM, 1, 80);
    // the near front leg folded: the elbow on the chest, the knee forward on the ground, the cannon tucked back, the hoof
    goatLeg(c, [[530, 790], [470, 846], [440, 870], [490, 888], [530, 888]], [72, 52, 42, 34, 30], FUR, CREAM, 2, -80);
    head(400, 600, 1.05, -6);
  },
} satisfies Redraw;
