import type { P, Redraw } from './crayon.ts';
import { flame, lineOfAction } from './anatomy.ts';

/**
 * Braisaure grown into a majestic fire serpent that swims through the air without wings, turned to the left: coiled in
 * an S high above, its snout tipped up, it looks down its nose at you from a proud wedge-shaped head. One continuous crest of
 * flame runs along its back (grown from Braisaure's little embers), two small clawed arms held under its chest (no legs: it never lands), and the
 * family's tail ember has become a big ring of fire it twirls on the tip of its tail. The family's orange, cream belly
 * and flame shapes.
 */
// the line of action: an upright S, the head on top looking down, the bottom coil swinging round, clear of the ground,
// and the tail rising at the bottom right into its ring
const SPINE: P[] = [[340, 250], [450, 236], [566, 272], [646, 352], [656, 452], [596, 534], [486, 584], [410, 650], [392, 732], [430, 800], [520, 830], [620, 816], [714, 790], [800, 770], [860, 734], [896, 700]];
const WIDTHS = [120, 146, 166, 174, 172, 162, 150, 134, 116, 98, 82, 66, 52, 42, 34, 28];
/** Where the crest runs, as fractions of the spine (0 = neck, 1 = tail tip), and its height at its peak. */
const CREST: [number, number, number] = [0.0, 0.5, 150];
const RING = { at: [912, 688] as P, rx: 112, ry: 62, rot: -24 };

export default {
  id: '025', slug: 'dragobraise', seed: 2651, size: [1100, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot } = c;
    const ORANGE = '#ec8a34', DEEP = '#c9652a', CREAM = '#f8e8c4', FLAME = '#f6c63c', RED = '#e8502e', CLAW = '#f8f2e4';
    const spine = SPINE, widths = WIDTHS;
    /** The spine resampled smoothly (Catmull-Rom), each point with its width, its back normal and its fraction. */
    const fine: { p: P; w: number; n: P; f: number }[] = [];
    {
      const m = spine.length, at = (i: number) => spine[Math.max(0, Math.min(m - 1, i))];
      const pts: P[] = [], ws: number[] = [];
      for (let i = 0; i < m - 1; i++) for (let k = 0; k < 8; k++) {
        const t = k / 8, t2 = t * t, t3 = t2 * t, [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
        const f = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
        pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
        ws.push(widths[i] + (widths[i + 1] - widths[i]) * t);
      }
      pts.push(spine[m - 1]);
      ws.push(widths[m - 1]);
      pts.forEach((p, i) => {
        const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)], l = Math.hypot(bx - ax, by - ay) || 1;
        fine.push({ p, w: ws[i], n: [(by - ay) / l, -(bx - ax) / l], f: i / (pts.length - 1) });
      });
    }
    const atF = (f: number) => fine[Math.round(f * (fine.length - 1))];
    /** A point off the spine at fraction f: `k` > 0 toward the back, < 0 toward the belly. */
    const off = (f: number, k: number): P => {
      const { p, n } = atF(f);
      return [p[0] + n[0] * k, p[1] + n[1] * k];
    };

    /**
     * A small arm under the chest at fraction f, held forward like a dragon's: upper arm, elbow, forearm, a bent wrist and
     * a little hand with three curved claws.
     */
    const arm = (f: number, col: string, k: number) => {
      const { w } = atF(f), [x, y] = off(f, -w * 0.3);
      const elbow: P = [x + 10 * k, y + 74 * k], wrist: P = [elbow[0] - 62 * k, elbow[1] - 8 * k];
      shape(c.band([[x, y], elbow, wrist], 58 * k, 34 * k), col, { angle: 70, over: 0.2 });
      const [hx, hy] = [wrist[0] - 14 * k, wrist[1] + 14 * k];
      shape(c.potato(hx, hy, 24 * k, 20 * k, 8, 0.05), col, { angle: 30, over: 0 });
      for (const d of [-1, 0, 1]) {
        const bx = hx - 14 * k + d * 12 * k, by = hy + 14 * k - d * 4 * k;
        shape([[bx - 6 * k, by - 3 * k], [bx - 10 * k, by + 16 * k], [bx - 2 * k, by + 24 * k], [bx + 5 * k, by + 2 * k]], CLAW, { over: 0, wash: 1 }, { w: 3 });
      }
    };

    /**
     * Its ring of fire, twirled round the tip of its tail like a hoop: a glowing hoop seen at a slant, flames rising
     * off it. `back` draws the far half (behind the tail), otherwise the near half.
     */
    const ring = (back: boolean) => {
      const { at: [cx, cy], rx, ry, rot } = RING, r = (rot * Math.PI) / 180;
      const on = (t: number): P => {
        const x = Math.cos(t) * rx, y = Math.sin(t) * ry;
        return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
      };
      const t0 = back ? Math.PI : 0, arc: P[] = [];
      for (let i = 0; i <= 12; i++) arc.push(on(t0 + (i / 12) * Math.PI));
      const ts = [0.08, 0.3, 0.5, 0.7, 0.92].map((k) => t0 + k * Math.PI);
      const ys = ts.map((t) => on(t)[1]), lo = Math.min(...ys), hi = Math.max(...ys);
      for (const t of ts) {
        const [x, y] = on(t), up = 1 - (y - lo) / (hi - lo || 1);
        flame(c, x, y + 6, 12, 60 + 120 * up, 56 + 26 * up, FLAME, RED);
      }
      shape(c.band(arc, 30, 30), '#ee6a2c', { angle: rot, over: 0.2 });
      stroke(arc.map(([x, y]): P => [x + (cx - x) * 0.04, y + (cy - y) * 0.04]), { w: 6, col: FLAME });
    };

    // the far arm, darker, half hidden behind the chest
    arm(0.2, DEEP, 0.85);
    // the crest: one continuous flame along its back, from the nape to the middle of its back, its tongues leaning back
    // (it flickers in battle)
    const [c0, c1, H] = CREST;
    c.part('crete', { pivot: off((c0 + c1) / 2, 60), motion: 'swing', amp: 2, period: 2.6, behind: true }, () => {
      const span = fine.filter((q) => q.f >= c0 && q.f <= c1);
      const height = (f: number) => {
        const u = (f - c0) / (c1 - c0);
        return H * (0.6 + 0.4 * Math.sin(Math.PI * u)) * Math.min(1, (1 - u) * 3 + 0.15);
      };
      // a strip of flame hugging its back, then flames rising from it all along, each overlapping the next, leaning back
      const base: P[] = [], top: P[] = [];
      for (const q of span) {
        base.push(off(q.f, q.w / 2 - 24));
        top.push(off(q.f, q.w / 2 + height(q.f) * 0.3));
      }
      shape([...base.reverse(), ...top], FLAME, { angle: 30, over: 0 });
      const n = 12;
      for (let j = n - 1; j >= 0; j--) {
        const f = c0 + ((c1 - c0) * (j + 0.3)) / n, q = atF(f), h = height(f) * (j % 2 ? 0.82 : 1.06);
        const [x, y] = off(f, q.w / 2 - 14);
        flame(c, x, y, (Math.atan2(q.n[0], -q.n[1]) * 180) / Math.PI + 38, h, h * 0.6, FLAME, RED);
      }
    });
    c.part('anneau-loin', { pivot: RING.at, motion: 'swing', amp: 5, period: 2.2, behind: true }, () => ring(true));
    // the long body in one line of action, tapering to the tail; a cream belly in rings along its underside
    shape(lineOfAction(spine, widths), ORANGE, { angle: 30, over: 0.4 });
    const belly = fine.filter((q) => q.f > 0.04 && q.f < 0.82);
    const bl: P[] = belly.map((q) => off(q.f, -q.w * 0.22)), br: P[] = belly.map((q) => off(q.f, -q.w * 0.47));
    c.tint([...bl, ...br.reverse()], CREAM, { angle: 0, wash: 0.9 });
    for (let k = 4; k < belly.length - 2; k += 6) stroke([off(belly[k].f, -belly[k].w * 0.24), off(belly[k].f, -belly[k].w * 0.46)], { w: 3 });
    // the tail tip glowing, holding its ring of fire (it spins in battle)
    c.tint(c.band(fine.slice(-8).map((q) => q.p), 40, 30), RED, { wash: 0.7 });
    c.part('anneau', { pivot: RING.at, motion: 'swing', amp: 5, period: 2.2 }, () => ring(false));
    // the near arm, held forward under the chest
    arm(0.16, ORANGE, 1);

    // the wedge head, looking down its nose
    const [hx, hy] = [262, 236], tilt = -8, r = (tilt * Math.PI) / 180;
    const T = ([x, y]: P): P => [hx + 1.1 * (x * Math.cos(r) - y * Math.sin(r)), hy + 1.1 * (x * Math.sin(r) + y * Math.cos(r))];
    const t = (pts: P[]) => pts.map(T);
    // its flame ears grown long, streaming back from the skull into the crest (they flicker in battle)
    c.part('flammes', { pivot: T([60, -70]), motion: 'swing', amp: 3, period: 2, behind: true }, () => {
      flame(c, ...T([40, -74]), 74 + tilt, 250, 92);
      flame(c, ...T([90, -40]), 90 + tilt, 210, 80);
    });
    shape(t([[-228, 8], [-220, -12], [-162, -36], [-106, -54], [-80, -82], [-30, -80], [20, -92], [80, -78], [116, -36], [118, 18], [80, 58], [0, 76], [-100, 56], [-188, 32]]), ORANGE, { angle: 78, over: 0.45 }, {}, false);
    c.tint(t([[-212, 22], [-180, 34], [-100, 54], [0, 72], [62, 56], [0, 46], [-92, 38], [-186, 22]]), CREAM, { angle: 60, wash: 0.7 });
    // majestic, one emotion: proud. Snout tipped up, it looks down its nose: open eyes with the pupils sunk to the bottom,
    // a sliver of lid, brows arched calmly over them, a closed mouth turning up at the corner, one small fang
    const proudEye = (x: number, y: number, rx: number, ry: number) => {
      shape(c.potato(x, y, rx, ry, 10, 0.03), '#fffaf0', { over: 0, wash: 1 }, { w: 3.5 });
      dot(x - rx * 0.1, y + ry * 0.34, rx * 0.7, ry * 0.58, '#241c38');
      dot(x - rx * 0.34, y + ry * 0.16, rx * 0.2, ry * 0.15, '#ffffff');
      shape([[x - rx * 1.1, y - ry * 1.2], [x + rx * 1.1, y - ry * 1.2], [x + rx * 1.1, y - ry * 0.34], [x - rx * 1.1, y - ry * 0.44]], ORANGE, { over: 0, wash: 1 }, { w: 0.1 }, false);
      stroke([[x - rx * 1.02, y - ry * 0.42], [x, y - ry * 0.44], [x + rx * 1.02, y - ry * 0.32]], { w: 5.5 });
    };
    proudEye(...T([-108, -34]), 20, 27);
    proudEye(...T([-30, -30]), 30, 38);
    stroke(t([[-130, -56], [-108, -66], [-86, -58]]), { w: 6 });
    stroke(t([[-64, -56], [-30, -72], [8, -62]]), { w: 7 });
    dot(...T([-204, -4]), 5, 4);
    stroke(t([[-214, 18], [-140, 34], [-60, 40], [10, 32], [30, 20]]), { w: 5 });
    shape(t([[-136, 34], [-120, 36], [-128, 56]]), '#ffffff', { over: 0, wash: 1 }, { w: 3 }, false);
    c.part('paupieres', { pivot: T([-60, -34]), motion: 'blink', extra: true }, () => {
      c.lid(...T([-108, -34]), 20, 27, ORANGE);
      c.lid(...T([-30, -30]), 30, 38, ORANGE);
    });
  },
} satisfies Redraw;
