import type { P, Redraw } from './crayon.ts';

/**
 * A greedy beetle grub (« gourmand »), turned to the left: a plump grub curled in a tight C, sitting on its own tail,
 * a red berry in the jaws of its big shiny emerald head, eyes shut with delight, one cheek full, three tiny stubby legs.
 * A little nub on its forehead: the horn to come.
 */
export default {
  id: '012', slug: 'gloutillon', seed: 1212, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const MINT = '#9adca4', BELLY = '#f6f0d2', EM = '#1f9e62', EMD = '#14724a', SHEEN = '#5cc6e6';
    const BERRY = '#e8404a', LEAF = '#3c9a3a', PINK = '#f28aa6', MOUTH = '#7a2a3a';

    /**
     * The soft body curled round (cx, cy) in fat rolls, tail first, from angle `a0` (tail tip) to `a1` (neck), `R` the
     * radius of the curl, each roll `r` wide: a pale belly on the inside of the curl.
     */
    const grub = (cx: number, cy: number, R: number, a0: number, a1: number, radii: number[]) => {
      radii.forEach((r, i) => {
        const a = ((a0 + ((a1 - a0) * i) / (radii.length - 1)) * Math.PI) / 180, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        shape(potato(x, y, r, r * 0.94, 12, 0.03), MINT, { angle: 70, over: 0.3 });
        // the belly: the side of the roll facing the inside of the curl
        const t = Math.atan2(cy - y, cx - x), cap: P[] = [];
        for (let k = -4; k <= 4; k++) cap.push([x + Math.cos(t + k * 0.3) * r * 0.97, y + Math.sin(t + k * 0.3) * r * 0.97]);
        c.tint([...cap, [x + Math.cos(t) * r * 0.25, y + Math.sin(t) * r * 0.25]], BELLY, { wash: 0.85 });
      });
    };
    /**
     * A tiny stubby leg growing out of the roll centred on `at` (`r` its size), on its underside along the direction `d`:
     * its base sunk inside the roll, no line across it (it melts into the body), a dark little foot.
     */
    const leg = (at: P, r: number, d: P) => {
      const l = Math.hypot(d[0], d[1]), u: P = [d[0] / l, d[1] / l];
      const root: P = [at[0] + u[0] * r * 0.8, at[1] + u[1] * r * 0.8], tip: P = [at[0] + u[0] * (r + 40), at[1] + u[1] * (r + 40)];
      const pts = c.band([root, tip], 40, 28);
      shape(pts, MINT, { angle: 30, over: 0 }, { w: 0.1 });
      stroke(pts.slice(0, 2), { w: 4.5 });
      stroke(pts.slice(2), { w: 4.5 });
      shape(potato(tip[0], tip[1], 15, 12, 7, 0.05), EMD, { over: 0 }, { w: 3.5 });
    };
    /** A red berry at (x, y), `r` its size, a leaf cap, a bite out of its top right (where its mouth is). */
    const berry = (x: number, y: number, r: number) => {
      const pts: P[] = [];
      for (let k = 0; k < 12; k++) {
        const a = -Math.PI / 2 + (k / 12) * Math.PI * 2;
        pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 0.94]);
      }
      // the bite: three scallops cut into the top right
      const bite: P[] = [[x + r * 0.2, y - r * 0.95], [x + r * 0.2, y - r * 0.62], [x + r * 0.46, y - r * 0.6], [x + r * 0.56, y - r * 0.34], [x + r * 0.84, y - r * 0.3], [x + r * 0.95, y - r * 0.1]];
      const body: P[] = [...bite, ...pts.slice(3), pts[0]];
      shape(body, BERRY, { angle: 60, over: 0.3, press: 1.1 });
      c.tint([...bite.slice(1, -1), [x + r * 0.6, y - r * 0.1], [x + r * 0.25, y - r * 0.4]], '#ffc2b0', { wash: 0.95 });
      c.shine([[x - r * 0.62, y + r * 0.1], [x - r * 0.5, y + r * 0.42]], 8);
      shape([[x - r * 0.1, y - r * 0.9], [x - r * 0.5, y - r * 1.22], [x - r * 0.1, y - r * 1.3], [x + r * 0.12, y - r * 1.0]], LEAF, { over: 0 }, { w: 3.5 });
    };
    /** The big emerald head at (hx, hy), `s` its size: happy shut eyes, a stuffed cheek, a nub on the brow. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const r = (rot * Math.PI) / 180;
      const H = ([x, y]: P): P => [hx + (x * Math.cos(r) - y * Math.sin(r)) * s, hy + (x * Math.sin(r) + y * Math.cos(r)) * s];
      const h = (pts: P[]) => pts.map(H);
      // the nub, the horn to come
      shape(h([[-110, -150], [-142, -214], [-112, -238], [-72, -204], [-60, -160]]), EMD, { angle: 70, over: 0 });
      // the head capsule, the stuffed near cheek bulging at the back of the jaw
      shape(h([[-200, 30], [-196, -60], [-150, -140], [-60, -186], [50, -180], [150, -120], [196, -20], [210, 70], [190, 140], [120, 186], [30, 180], [-80, 160], [-170, 110]]), EM, { angle: 76, over: 0.45 });
      c.tint(h([[60, -160], [150, -110], [186, -30], [140, -60], [80, -120]]), SHEEN, { angle: 40, wash: 0.55 });
      c.shine(h([[-40, -150], [30, -164], [90, -146]]), 9);
      c.cheek(...H([110, 100]), 46 * s, 28 * s, PINK);
      // delight: both eyes squeezed shut in happy arcs, the far one smaller
      stroke(h([[-160, -40], [-134, -68], [-106, -44]]), { w: 9 });
      stroke(h([[-46, -50], [-8, -88], [30, -52]]), { w: 10 });
      // the mouth wide round the top of the berry, chomping
      shape(h([[-196, 92], [-150, 78], [-90, 92], [-60, 130], [-100, 150], [-170, 150], [-200, 128]]), MOUTH, { over: 0 }, { w: 4.5 });
    };

    // curled tight, three tiny stubby legs growing from its front rolls, a berry in its jaws
    grub(520, 680, 180, 165, -75, [62, 88, 112, 132, 145, 150, 148]);
    // the three front rolls (behind the head) each carry a leg on the inside of the curl
    const roll = (deg: number): P => [520 + Math.cos((deg * Math.PI) / 180) * 180, 680 + Math.sin((deg * Math.PI) / 180) * 180];
    leg(roll(5), 145, [-0.97, 0.25]);
    leg(roll(-35), 150, [-0.8, 0.6]);
    leg(roll(-75), 148, [-0.55, 0.84]);
    c.part('tete', { pivot: [470, 520], motion: 'nod', amp: 2, period: 1.1 }, () => {
      head(390, 350, 1, 10);
      berry(226, 498, 74);
    });
  },
} satisfies Redraw;
