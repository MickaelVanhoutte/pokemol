/** Tiny helpers to paint pixel art into a canvas without anti-aliasing. */

export type Ctx = CanvasRenderingContext2D;

export function hash(x: number, y: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export class Painter {
  constructor(public ctx: Ctx, public ox = 0, public oy = 0) {}

  at(ox: number, oy: number) {
    this.ox = ox;
    this.oy = oy;
    return this;
  }

  px(x: number, y: number, c: string) {
    this.ctx.fillStyle = c;
    this.ctx.fillRect(this.ox + x, this.oy + y, 1, 1);
  }

  rect(x: number, y: number, w: number, h: number, c: string) {
    this.ctx.fillStyle = c;
    this.ctx.fillRect(this.ox + x, this.oy + y, w, h);
  }

  fill(c: string, w = 16, h = 16) {
    this.rect(0, 0, w, h, c);
  }

  /** Sprinkles pixels of color `c` with probability `p`, deterministic per seed. */
  noise(p: number, c: string, seed: number, w = 16, h = 16) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (hash(x, y, seed) < p) this.px(x, y, c);
  }

  disc(cx: number, cy: number, r: number, c: string) {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x - cx + 0.5) ** 2 + (y - cy + 0.5) ** 2 <= r * r) this.px(x, y, c);
      }
    }
  }

  /** Draws rows of characters using a palette; '.' and ' ' are transparent. */
  sprite(rows: string[], pal: Record<string, string>, flip = false) {
    const w = rows[0].length;
    rows.forEach((row, y) => {
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        const c = pal[ch];
        if (!c || ch === '.' || ch === ' ') continue;
        this.px(flip ? w - 1 - x : x, y, c);
      }
    });
  }
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
