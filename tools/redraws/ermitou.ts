import type { P, Redraw } from './crayon.ts';

/**
 * A shy little hermit crab (« timide »), turned to the left: it lives in a big, pretty spiral shell of ice and only
 * peeks out of it, two clear eyes on short stalks, one small claw held up in front of its mouth. Steel blue-grey, an
 * icy pale-blue shell, the warm coral lip of its opening.
 */
export default {
  id: '058', slug: 'ermitou', seed: 5801, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, potato } = c;
    const STEEL = '#7d92b8', DEEP = '#5a6c92', DARK = '#3c4866', BELLY = '#d6deee';
    const ICE = '#d2eefa', ICE2 = '#a6d6ef', ICE3 = '#7fbde2', ICELINE = '#4a7fb0', LIP = '#f39a86', LIP2 = '#e07a68', INSIDE = '#3b3550', PINK = '#f29ab0';

    /** A claw: the arm from `a` by `b` to the wrist `w`, the palm pointing along `deg` (0 = left, 90 = up), `r` its size,
     * the moving finger above, the tips meeting. */
    const claw = (a: P, b: P, w: P, deg: number, r: number, col: string) => {
      const an = (deg * Math.PI) / 180, u: P = [-Math.cos(an), -Math.sin(an)], n: P = [-u[1], u[0]];
      const Q = (f: number, k: number): P => [w[0] + (u[0] * f + n[0] * k) * r, w[1] + (u[1] * f + n[1] * k) * r];
      shape(c.band([a, b, w], r * 0.5, r * 0.46), col, { angle: 60, over: 0 });
      shape([Q(1.35, -0.42), Q(1.8, -0.56), Q(2.3, -0.42), Q(2.62, -0.1), Q(2.3, -0.16), Q(1.8, -0.14), Q(1.5, -0.06)], col, { angle: deg, over: 0 });
      shape([Q(1.45, 0.08), Q(1.9, 0.06), Q(2.3, 0.0), Q(2.58, -0.06), Q(2.3, 0.22), Q(1.9, 0.38), Q(1.45, 0.42)], col, { angle: deg, over: 0 });
      shape([Q(-0.05, -0.4), Q(0.4, -0.58), Q(1.0, -0.6), Q(1.45, -0.42), Q(1.62, -0.06), Q(1.55, 0.3), Q(1.2, 0.52), Q(0.6, 0.52), Q(0.05, 0.38)], col, { angle: deg + 60, over: 0.2 });
      c.shine([Q(0.4, -0.36), Q(1.0, -0.4)], 5);
    };
    /** A walking leg tip coming out over the lip, jointed, a dark point. */
    const leg = (pts: P[], col: string, w: number) => {
      shape(c.band(pts, w, w * 0.6), col, { angle: 60, over: 0 });
      const [p, q] = [pts[pts.length - 2], pts[pts.length - 1]], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy);
      shape([[q[0] - (dy / l) * w * 0.3, q[1] + (dx / l) * w * 0.3], [q[0] + (dx / l) * 30, q[1] + (dy / l) * 30], [q[0] + (dy / l) * w * 0.3, q[1] - (dx / l) * w * 0.3]], DARK, { over: 0 }, { w: 3 }, false);
    };

    // the shell: whorls stacked along its axis, from the tip down to the big round body whorl, each one overlapping the
    // last, smooth glassy ice; a spiral rib round the body whorl, the coral lip of its opening on the left
    const R = 220, ang = (-52 * Math.PI) / 180, [cx, cy] = [590, 650];
    const at = (k: number, side = 0): P => [cx + Math.cos(ang) * k * R - Math.sin(ang) * side * R, cy + Math.sin(ang) * k * R + Math.cos(ang) * side * R];
    const whorls: [number, number][] = [[1.86, 0.17], [1.56, 0.32], [1.0, 0.6], [0, 1]];
    whorls.forEach(([k, sz], i) => {
      const [x, y] = at(k);
      shape(potato(x, y, R * sz, R * sz * 0.9, 14, 0.02), i % 2 ? ICE : ICE2, { angle: 70, over: 0.2, press: 0.8 }, { col: ICELINE, w: 5 });
      c.tint(potato(x + R * sz * 0.25, y + R * sz * 0.3, R * sz * 0.6, R * sz * 0.5, 10, 0.04), i % 2 ? ICE2 : ICE3, { wash: 0.5 });
      c.shine([[x - R * sz * 0.55, y - R * sz * 0.35], [x - R * sz * 0.15, y - R * sz * 0.66]], Math.max(5, 10 * sz));
    });
    const rib: P[] = [];
    for (let t = 0; t <= 1.001; t += 0.08) {
      const a2 = ang + Math.PI * (0.55 + t * 1.25), rr = R * (0.82 - t * 0.3);
      rib.push([cx + Math.cos(a2) * rr, cy + Math.sin(a2) * rr * 0.9]);
    }
    stroke(rib, { w: 4, col: ICE3 });
    const [ax, ay] = at(-0.5, 0.2);
    shape(potato(ax, ay, 118, 148, 14, 0.02), LIP, { angle: 30, over: 0.2 }, { col: ICELINE, w: 5 });
    c.tint(potato(ax + 36, ay + 40, 60, 90, 10, 0.05), LIP2, { wash: 0.5 });
    shape(potato(ax + 10, ay + 6, 86, 116, 14, 0.02), INSIDE, { angle: 0, over: 0, press: 1.2 }, { w: 3.5 });

    // the crab, small and round, peeking out: two leg tips on the lip, the head, a claw held up shyly
    leg([[ax + 10, ay + 110], [ax - 50, ay + 140], [ax - 70, ay + 200]], DEEP, 30);
    leg([[ax + 60, ay + 116], [ax + 30, ay + 170], [ax + 30, ay + 224]], STEEL, 32);
    const hx = ax - 70, hy = ay + 40;
    // the eye stalks, short, the far one first
    shape(c.band([[hx - 40, hy - 50], [hx - 72, hy - 96]], 20, 18), DEEP, { angle: 90 });
    c.part('antennes', { pivot: [hx - 60, hy - 40], motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      stroke([[hx - 50, hy - 50], [hx - 130, hy - 120], [hx - 180, hy - 120]], { w: 4, col: DARK });
      stroke([[hx - 60, hy - 30], [hx - 150, hy - 70], [hx - 200, hy - 60]], { w: 4, col: DARK });
    });
    shape(potato(hx, hy, 92, 80, 12, 0.03), STEEL, { angle: 80, over: 0.3 });
    c.tint(potato(hx - 20, hy + 34, 60, 30, 10, 0.05), BELLY, { wash: 0.7 });
    shape(c.band([[hx + 20, hy - 56], [hx + 2, hy - 110]], 22, 20), STEEL, { angle: 90 });
    // shy: clear eyes glancing down and away, brows lifted a little, a blush
    const e1: P = [hx - 76, hy - 112], e2: P = [hx - 2, hy - 128];
    c.eye(e1[0], e1[1], 19, 23, '#241c38');
    c.eye(e2[0], e2[1], 22, 27, '#241c38');
    c.cheek(hx - 56, hy + 6, 22, 14, PINK);
    c.cheek(hx + 52, hy + 2, 18, 12, PINK);
    stroke([[hx - 36, hy + 30], [hx - 22, hy + 36], [hx - 8, hy + 30]], { w: 4.5 });
    c.part('paupieres', { pivot: [hx, hy - 136], motion: 'blink', extra: true }, () => {
      c.lid(e1[0], e1[1], 19, 23, STEEL);
      c.lid(e2[0], e2[1], 22, 27, STEEL);
    });
    // the other claw resting on the lip, then the small claw held up in front of its mouth
    claw([hx + 50, hy + 50], [hx + 70, hy + 100], [hx + 30, hy + 120], -10, 34, DEEP);
    c.part('pince', { pivot: [hx - 60, hy + 60], motion: 'swing', amp: 3, period: 2.6 }, () => claw([hx - 50, hy + 50], [hx - 110, hy + 70], [hx - 110, hy + 10], 60, 34, STEEL));
  },
} satisfies Redraw;
