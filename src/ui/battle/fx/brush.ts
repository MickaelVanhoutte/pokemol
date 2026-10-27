/**
 * The pencil the move animations draw with. Its wobble comes from `boil`, the flipbook frame
 * (12 a second): the same frame draws the same strokes, the next one redraws them a little
 * differently, like a hand-drawn cartoon.
 */
import { GRAPHITE, seeded, type Rand } from '../../paper/pencilCanvas';
import { mix, type Env, type P } from './core';
import { DOODLES, type DoodleKind } from './doodles';

export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;

let makeCanvas = (w: number, h: number): CanvasLike => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** Tests draw on stub canvases. */
export function setCanvasFactory(f: (w: number, h: number) => CanvasLike) {
  makeCanvas = f;
  doodles.clear();
}

const DOODLE = 128;
const doodles = new Map<string, CanvasLike>();

/** A small drawing (flame, bubble, rock…) in one of its three flipbook versions, drawn once. */
function doodle(kind: DoodleKind, color: string, v: number): CanvasLike {
  const key = `${kind}|${color}|${v}`;
  let c = doodles.get(key);
  if (!c) {
    c = makeCanvas(DOODLE, DOODLE);
    const ctx = c.getContext('2d') as CanvasRenderingContext2D;
    DOODLES[kind](ctx, color, seeded(kind.length * 131 + v * 977 + color.charCodeAt(2)));
    doodles.set(key, c);
  }
  return c;
}

export class Brush {
  constructor(public ctx: CanvasRenderingContext2D, public env: Env, public boil: number) {}

  /** Random numbers that stay the same during one flipbook frame. */
  rand(seed: number): Rand {
    return seeded((seed * 7919) ^ (this.boil * 104729) ^ this.env.seed);
  }

  private trace(pts: P[], close: boolean) {
    const { ctx } = this;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (close) ctx.closePath();
  }

  /** A pencil line, gone over twice slightly off. `width` is scaled with the scene. */
  line(pts: P[], color: string, width: number, o: { alpha?: number; jit?: number; seed?: number; passes?: number; close?: boolean } = {}) {
    if (pts.length < 2) return;
    const { ctx } = this;
    const r = this.rand(o.seed ?? 1);
    const jit = (o.jit ?? 1.6) * this.env.k;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const passes = o.passes ?? 2;
    for (let pass = 0; pass < passes; pass++) {
      ctx.globalAlpha = (o.alpha ?? 1) * (pass ? 0.5 : 1);
      ctx.lineWidth = Math.max(0.6, width * this.env.k * (pass ? 0.6 : 1));
      this.trace(pts.map(([x, y]) => [x + (r() - 0.5) * jit, y + (r() - 0.5) * jit] as P), !!o.close);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /** Crayon colouring: a light wash of the colour, then parallel strokes clipped to the shape. */
  fill(pts: P[], color: string, o: { alpha?: number; gap?: number; angle?: number; width?: number; seed?: number; wash?: number } = {}) {
    if (pts.length < 3) return;
    const { ctx } = this;
    const r = this.rand(o.seed ?? 2);
    const alpha = o.alpha ?? 1;
    ctx.save();
    this.trace(pts, true);
    ctx.globalAlpha = alpha * (o.wash ?? 0.45);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.clip();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const half = Math.hypot(x1 - x0, y1 - y0) / 2 + 2;
    const a = (o.angle ?? -0.6) + (r() - 0.5) * 0.12;
    const dx = Math.cos(a), dy = Math.sin(a);
    const gap = Math.max(1.5, (o.gap ?? 3.2) * this.env.k);
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    for (let off = -half; off < half; off += gap * (0.7 + r() * 0.6)) {
      ctx.globalAlpha = alpha * (0.55 + r() * 0.45);
      ctx.lineWidth = (o.width ?? 1.5) * this.env.k * (0.8 + r() * 0.5);
      const px = cx - dy * off, py = cy + dx * off;
      const wob = (r() - 0.5) * 2.4 * this.env.k;
      ctx.beginPath();
      ctx.moveTo(px - dx * half, py - dy * half);
      ctx.quadraticCurveTo(px - dy * wob, py + dx * wob, px + dx * half, py + dy * half);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /** Coloured shape with a graphite contour. */
  shape(pts: P[], color: string, o: { alpha?: number; line?: string | false; lw?: number; seed?: number; gap?: number; wash?: number; angle?: number } = {}) {
    this.fill(pts, color, { alpha: o.alpha, seed: o.seed, gap: o.gap, wash: o.wash, angle: o.angle });
    if (o.line !== false) this.line(pts, o.line ?? mix(color, GRAPHITE, 0.6), o.lw ?? 1.4, { alpha: (o.alpha ?? 1) * 0.85, seed: (o.seed ?? 2) + 5, close: true });
  }

  /** A wobbly round shape. */
  blob(cx: number, cy: number, rx: number, ry: number, seed: number, n = 14, wob = 0.16): P[] {
    const r = this.rand(seed);
    const a0 = r() * Math.PI * 2;
    return Array.from({ length: n }, (_, i) => {
      const a = a0 + (i / n) * Math.PI * 2;
      const q = 1 + (r() - 0.5) * wob * 2;
      return [cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q] as P;
    });
  }

  /** Spiky burst, the comic-book "pow". */
  star(cx: number, cy: number, rad: number, color: string, o: { points?: number; inner?: number; rot?: number; alpha?: number; seed?: number } = {}) {
    const r = this.rand(o.seed ?? 3);
    const n = o.points ?? 9;
    const pts: P[] = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (o.rot ?? 0) + (i / (n * 2)) * Math.PI * 2;
      const q = i % 2 ? (o.inner ?? 0.45) * (0.85 + r() * 0.3) : 0.85 + r() * 0.3;
      pts.push([cx + Math.cos(a) * rad * q, cy + Math.sin(a) * rad * q]);
    }
    this.shape(pts, color, { alpha: o.alpha, seed: o.seed });
  }

  /** One of the small drawings from `doodles.ts`, centred on (x, y). */
  doodle(kind: DoodleKind, color: string, x: number, y: number, size: number, o: { rot?: number; alpha?: number; flip?: boolean; seed?: number } = {}) {
    if (size <= 0.5 || (o.alpha ?? 1) <= 0.01) return;
    const { ctx } = this;
    const img = doodle(kind, color, (this.boil + (o.seed ?? 0)) % 3);
    ctx.save();
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    if (o.flip) ctx.scale(-1, 1);
    ctx.drawImage(img as CanvasImageSource, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  /** Handwritten words (a ghost's « hi hi »). */
  text(str: string, x: number, y: number, size: number, color: string, o: { rot?: number; alpha?: number } = {}) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.font = `${Math.round(size)}px 'Patrick Hand', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.strokeStyle = '#fffdf4';
    ctx.strokeText(str, 0, 0);
    ctx.fillStyle = color;
    ctx.fillText(str, 0, 0);
    ctx.restore();
  }

  /** A wobbly ellipse outline (rings, ripples). */
  ring(cx: number, cy: number, rx: number, ry: number, color: string, width: number, o: { alpha?: number; seed?: number; from?: number; to?: number } = {}) {
    const from = o.from ?? 0, to = o.to ?? Math.PI * 2;
    const n = Math.max(6, Math.ceil(((to - from) / (Math.PI * 2)) * 28));
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const a = from + ((to - from) * i) / n;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P;
    });
    this.line(pts, color, width, { alpha: o.alpha, seed: o.seed });
  }

  /** Pencil strokes all over the scene (darkening for ghost, dark and dragon moves). */
  wash(color: string, alpha: number, o: { gap?: number; angle?: number; seed?: number } = {}) {
    if (alpha <= 0.01) return;
    const { w, h } = this.env;
    this.fill([[0, 0], [w, 0], [w, h], [0, h]], color, { alpha, gap: o.gap ?? 4, angle: o.angle ?? -0.7, seed: o.seed ?? 9, wash: 0.5, width: 1.8 });
  }

  /** Paper-white (or coloured) flash over the scene. */
  flash(alpha: number, color = '#fffdf4') {
    if (alpha <= 0.01) return;
    const { ctx } = this;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this.env.w, this.env.h);
    ctx.globalAlpha = 1;
  }
}
