/**
 * Colouring-pencil drawing on a 2D canvas: parallel crayon hatching, wobbly graphite outlines and
 * scattered strokes. Used for the battle backdrops and the move animations.
 */

export const GRAPHITE = '#3a3346';

export type Pt = [number, number];
export type Rand = () => number;

export function seeded(seed: number): Rand {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Pencil {
  constructor(public ctx: CanvasRenderingContext2D, public r: Rand) {}

  paper(W: number, H: number) {
    const { ctx, r } = this;
    ctx.fillStyle = '#fbf6ea';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = r() < 0.5 ? 'rgba(120,100,70,0.06)' : 'rgba(255,255,255,0.35)';
      ctx.fillRect(r() * W, r() * H, 1, 1);
    }
  }

  private trace(pts: Pt[], close: boolean) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
    if (close) ctx.closePath();
  }

  /** Colours a shape with parallel pencil strokes (slightly crooked, uneven pressure). */
  hatch(pts: Pt[], color: string, o: { angle?: number; gap?: number; alpha?: number; width?: number } = {}) {
    const { ctx, r } = this;
    const angle = o.angle ?? -0.55;
    const gap = o.gap ?? 3.2;
    const alpha = Math.min(1, (o.alpha ?? 0.55) * 1.15);
    ctx.save();
    this.trace(pts, true);
    ctx.clip();
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs) - 4, x1 = Math.max(...xs) + 4, y0 = Math.min(...ys) - 4, y1 = Math.max(...ys) + 4;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const half = Math.hypot(x1 - x0, y1 - y0) / 2;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    for (let off = -half; off < half; off += gap * (0.7 + r() * 0.6)) {
      ctx.globalAlpha = alpha * (0.55 + r() * 0.45);
      ctx.lineWidth = (o.width ?? 1.5) * (0.8 + r() * 0.5);
      const px = cx - dy * off, py = cy + dx * off;
      ctx.beginPath();
      const steps = 8;
      for (let k = 0; k <= steps; k++) {
        const t = -half + (2 * half * k) / steps;
        const wob = (r() - 0.5) * 1.6;
        const x = px + dx * t - dy * wob, y = py + dy * t + dx * wob;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /** Graphite contour, drawn twice slightly off like a quick sketch. */
  outline(pts: Pt[], o: { color?: string; alpha?: number; width?: number; close?: boolean } = {}) {
    const { ctx, r } = this;
    ctx.strokeStyle = o.color ?? GRAPHITE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.globalAlpha = (o.alpha ?? 0.7) * (pass ? 0.45 : 1);
      ctx.lineWidth = (o.width ?? 1.6) * (pass ? 0.7 : 1);
      this.trace(pts.map(([x, y]) => [x + (r() - 0.5) * 1.8, y + (r() - 0.5) * 1.8] as Pt), o.close ?? true);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /** Paper-coloured blank (clouds, light): pencil leaves the paper white. */
  blank(pts: Pt[]) {
    this.ctx.fillStyle = '#fbf6ea';
    this.trace(pts, true);
    this.ctx.fill();
  }

  strokes(n: number, area: [number, number, number, number], color: string, len: number, o: { angle?: number; alpha?: number; width?: number } = {}) {
    const { ctx, r } = this;
    const [x0, y0, x1, y1] = area;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
      const a = (o.angle ?? -Math.PI / 2) + (r() - 0.5) * 0.6;
      ctx.globalAlpha = (o.alpha ?? 0.6) * (0.6 + r() * 0.4);
      ctx.lineWidth = o.width ?? 1.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len * (0.6 + r() * 0.6), y + Math.sin(a) * len * (0.6 + r() * 0.6));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
