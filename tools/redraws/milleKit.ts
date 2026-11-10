import type { Crayon, P } from './crayon.ts';
import { tailBand } from './pandaKit.ts';

/** The millipede family (Roulipède, Fouettipède): violet plates, a yellow warning spot on each, little dark legs. */
export const VIOLET = '#8a5cc8', VDEEP = '#5e3c94', LILAC = '#c8a8ec', YELLOW = '#f2c14e', LEG = '#3a2a4e';

/**
 * A segmented body along `ctrl` (tail first, head last), `w(t)` wide: the band, a seam across every `seg` points, a
 * yellow spot on each plate, and `legs` little legs under the edge on side `legSide` (1: the `R` edge, -1: `L`).
 */
export function segmented(c: Crayon, ctrl: P[], w: (t: number) => number, o: { N?: number; seg?: number; legs?: boolean; legSide?: 1 | -1; legLen?: number; col?: string; spots?: boolean } = {}) {
  const N = o.N ?? 60, seg = o.seg ?? 5;
  const t = tailBand(ctrl, w, N);
  const legEdge = (o.legSide ?? 1) === 1 ? t.R : t.L;
  // the legs first, behind the body: two little bent strokes at every seam
  if (o.legs !== false) {
    for (let i = seg; i < N - 3; i += seg) {
      const p = legEdge[i], s = t.sp[i], dx = p[0] - s[0], dy = p[1] - s[1], l = Math.hypot(dx, dy) || 1;
      const L = o.legLen ?? 34, u: P = [dx / l, dy / l], back: P = [t.sp[i - 1][0] - t.sp[i][0], t.sp[i - 1][1] - t.sp[i][1]];
      const bl = Math.hypot(...back) || 1;
      const knee: P = [p[0] + u[0] * L * 0.7, p[1] + u[1] * L * 0.7];
      const foot: P = [knee[0] + (back[0] / bl) * L * 0.5 + u[0] * L * 0.3, knee[1] + (back[1] / bl) * L * 0.5 + u[1] * L * 0.3];
      c.stroke([[p[0] - u[0] * 6, p[1] - u[1] * 6], knee, foot], { w: 6, col: LEG });
    }
  }
  c.shape(t.out, o.col ?? VIOLET, { angle: 40, over: 0.35 });
  // the darker underside along the leg edge
  c.tint([...legEdge.slice(2, N - 2), ...t.sp.slice(2, N - 2).reverse()], VDEEP, { angle: 50, wash: 0.45, press: 0.8 });
  for (let i = seg; i < N - 2; i += seg) {
    c.stroke([t.L[i], [(t.L[i][0] + t.R[i][0]) / 2 + 2, (t.L[i][1] + t.R[i][1]) / 2 + 2], t.R[i]], { w: 4 });
    if (o.spots !== false) {
      const k = i - Math.floor(seg / 2), m: P = [(t.L[k][0] * 0.62 + t.sp[k][0] * 0.38), (t.L[k][1] * 0.62 + t.sp[k][1] * 0.38)];
      c.dot(m[0], m[1], Math.max(6, t.ws[k] * 0.11), Math.max(6, t.ws[k] * 0.11), YELLOW);
    }
  }
  return t;
}

/** Points of a spiral round (cx, cy) from angle a0 to a1 (degrees), radius r0 to r1. */
export const spiral = (cx: number, cy: number, a0: number, a1: number, r0: number, r1: number, n = 12): P[] =>
  Array.from({ length: n }, (_, i): P => {
    const k = i / (n - 1), a = ((a0 + (a1 - a0) * k) * Math.PI) / 180, r = r0 + (r1 - r0) * k;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
