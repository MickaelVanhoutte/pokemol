/**
 * Cuts a pencil/felt-pen drawing out of a photo of paper.
 * Pure function over RGBA pixels, shared by the Node card pipeline and (later) the in-browser Atelier.
 */

export type Point = [number, number];

export interface CutoutOptions {
  /** Normalized luminance below which a pixel is ink (0..1). */
  inkLum: number;
  /** Normalized chroma (max-min of RGB) above which a pixel is colored ink (0..1). */
  inkChroma: number;
  /** Max raw chroma for a pixel to be sampled as paper (raise for warm/beige paper or yellow light). */
  paperChroma: number;
  /** Radius (px) of the morphological closing that seals small gaps in outlines. */
  close: number;
  /** Components smaller than this fraction of the largest one are dropped (neighbor fragments, specks). */
  minComponent: number;
  /** Alpha feather radius (px). */
  feather: number;
  /** Saturation multiplier applied to the drawing colors. */
  saturate: number;
  /** Polygons (local coords) whose pixels are forced to background. */
  erase: Point[][];
  /** Points (local coords) in paper the drawing encloses that should still be see-through (between a mane and a neck…). */
  holes: Point[];
}

export const defaultCutoutOptions: CutoutOptions = {
  inkLum: 0.8,
  inkChroma: 0.11,
  paperChroma: 0.12,
  close: 3,
  minComponent: 0.05,
  feather: 1,
  saturate: 1.2,
  erase: [],
  holes: [],
};

export interface Rgba {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
}

/** Least-squares fit of a quadratic surface c(x,y) to samples, one per channel. */
function fitQuadratic(xs: number[], ys: number[], vs: number[]): number[] {
  // basis: 1, x, y, x², xy, y²
  const n = 6;
  const ata = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const atb = new Array<number>(n).fill(0);
  const b = new Array<number>(n);
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i], y = ys[i];
    b[0] = 1; b[1] = x; b[2] = y; b[3] = x * x; b[4] = x * y; b[5] = y * y;
    for (let r = 0; r < n; r++) {
      atb[r] += b[r] * vs[i];
      for (let c = 0; c < n; c++) ata[r][c] += b[r] * b[c];
    }
  }
  // Gaussian elimination with tiny ridge for stability
  for (let i = 0; i < n; i++) ata[i][i] += 1e-6;
  const m = ata.map((row, i) => [...row, atb[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r][col] / m[col][col];
      for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c];
    }
  }
  return m.map((row, i) => row[n] / row[i]);
}

function evalQuadratic(k: number[], x: number, y: number) {
  return k[0] + k[1] * x + k[2] * y + k[3] * x * x + k[4] * x * y + k[5] * y * y;
}

/** Estimates paper color across the image (handles lighting gradients) and returns normalized RGB floats. */
function flattenPaper(img: Rgba, paperChroma: number): Float32Array {
  const { data, width: w, height: h } = img;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    lum[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
  }
  // paper candidates: bright and grey
  const sorted = Float32Array.from(lum).sort();
  const lumCut = sorted[Math.floor(sorted.length * 0.6)];
  const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 20000)));
  let samples: number[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = y * w + x;
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
      if (lum[i] >= lumCut && chroma < paperChroma) samples.push(i);
    }
  }
  const nx = (x: number) => x / w - 0.5;
  const ny = (y: number) => y / h - 0.5;
  let coeffs: number[][] = [];
  for (let pass = 0; pass < 3; pass++) {
    const xs = samples.map((i) => nx(i % w));
    const ys = samples.map((i) => ny(Math.floor(i / w)));
    coeffs = [0, 1, 2].map((c) => fitQuadratic(xs, ys, samples.map((i) => data[i * 4 + c] / 255)));
    // reject outliers (ink that slipped in) for next pass
    samples = samples.filter((i) => {
      const x = nx(i % w), y = ny(Math.floor(i / w));
      const pl = 0.299 * evalQuadratic(coeffs[0], x, y) + 0.587 * evalQuadratic(coeffs[1], x, y) + 0.114 * evalQuadratic(coeffs[2], x, y);
      return lum[i] > pl - 0.05;
    });
  }
  const out = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      for (let c = 0; c < 3; c++) {
        const bg = Math.max(0.2, evalQuadratic(coeffs[c], nx(x), ny(y)));
        out[i * 3 + c] = Math.min(1, data[i * 4 + c] / 255 / bg);
      }
    }
  }
  return out;
}

/** Binary max filter (dilate) or min filter (erode) with a square element, separable. */
function morph(mask: Uint8Array, w: number, h: number, r: number, dilate: boolean): Uint8Array {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  const hit = dilate ? 1 : 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = dilate ? 0 : 1;
      for (let d = -r; d <= r; d++) {
        const xx = Math.min(w - 1, Math.max(0, x + d));
        if (mask[y * w + xx] === hit) { v = hit; break; }
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = dilate ? 0 : 1;
      for (let d = -r; d <= r; d++) {
        const yy = Math.min(h - 1, Math.max(0, y + d));
        if (tmp[yy * w + x] === hit) { v = hit; break; }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

/** Labels 8-connected components of `mask`; returns labels and their areas (label 0 = none). */
function components(mask: Uint8Array, w: number, h: number): { labels: Int32Array; areas: number[] } {
  const labels = new Int32Array(w * h);
  const areas = [0];
  const stack: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || labels[start]) continue;
    const id = areas.length;
    let area = 0;
    labels[start] = id;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop()!;
      area++;
      const x = i % w, y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx;
          if (mask[j] && !labels[j]) { labels[j] = id; stack.push(j); }
        }
      }
    }
    areas.push(area);
  }
  return { labels, areas };
}

function pointInPolygon(x: number, y: number, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  if (r <= 0) return src;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const size = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let d = -r; d <= r; d++) s += src[y * w + Math.min(w - 1, Math.max(0, x + d))];
      tmp[y * w + x] = s / size;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let d = -r; d <= r; d++) s += tmp[Math.min(h - 1, Math.max(0, y + d)) * w + x];
      out[y * w + x] = s / size;
    }
  }
  return out;
}

export interface CutoutResult extends Rgba {
  data: Uint8ClampedArray;
  /** Offset of the trimmed result inside the input image. */
  offset: Point;
}

export function cutout(img: Rgba, opts: Partial<CutoutOptions> = {}): CutoutResult {
  const o = { ...defaultCutoutOptions, ...opts };
  const { width: w, height: h } = img;
  const n = w * h;
  const flat = flattenPaper(img, o.paperChroma);

  // 1. ink mask
  let ink: Uint8Array = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = flat[i * 3], g = flat[i * 3 + 1], b = flat[i * 3 + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    ink[i] = l < o.inkLum || chroma > o.inkChroma ? 1 : 0;
  }
  // 2. erase polygons (neighbor drawings)
  const erased = new Uint8Array(n);
  if (o.erase.length) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (o.erase.some((p) => pointInPolygon(x, y, p))) { erased[y * w + x] = 1; ink[y * w + x] = 0; }
      }
    }
  }
  // 3. despeckle: drop tiny ink islands (paper grain)
  {
    const { labels, areas } = components(ink, w, h);
    for (let i = 0; i < n; i++) if (ink[i] && areas[labels[i]] < 40) ink[i] = 0;
  }
  // 4. close gaps
  if (o.close > 0) ink = morph(morph(ink, w, h, o.close, true), w, h, o.close, false);
  for (let i = 0; i < n; i++) if (erased[i]) ink[i] = 0;

  // 5. flood fill paper from the border: reachable paper = outside
  const outside = new Uint8Array(n);
  const stack: number[] = [];
  const seed = (i: number) => { if (!ink[i] && !outside[i]) { outside[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
  for (const [hx, hy] of o.holes) {
    const x = Math.round(hx), y = Math.round(hy);
    if (x >= 0 && y >= 0 && x < w && y < h) seed(y * w + x);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w, y = (i - x) / w;
    if (x > 0) seed(i - 1);
    if (x < w - 1) seed(i + 1);
    if (y > 0) seed(i - w);
    if (y < h - 1) seed(i + w);
  }
  const body = new Uint8Array(n);
  for (let i = 0; i < n; i++) body[i] = outside[i] || erased[i] ? 0 : 1;

  // 6. keep main components
  const { labels, areas } = components(body, w, h);
  const largest = Math.max(0, ...areas);
  const keep = areas.map((a) => a >= largest * o.minComponent);
  keep[0] = false;
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) alpha[i] = keep[labels[i]] ? 1 : 0;
  const soft = boxBlur(alpha, w, h, Math.round(o.feather));

  // 7. trim
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (soft[y * w + x] > 0.02) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const m = 6;
  x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m);
  x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
  const ow = x1 - x0 + 1, oh = y1 - y0 + 1;

  // 8. colors: whiten paper inside the drawing, boost saturation a bit
  const out = new Uint8ClampedArray(ow * oh * 4);
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const si = (y + y0) * w + (x + x0);
      const di = (y * ow + x) * 4;
      let r = flat[si * 3], g = flat[si * 3 + 1], b = flat[si * 3 + 2];
      // levels: push near-white paper to pure white
      const lv = (v: number) => Math.min(1, Math.max(0, (v - 0.03) / 0.9));
      r = lv(r); g = lv(g); b = lv(b);
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = l + (r - l) * o.saturate;
      g = l + (g - l) * o.saturate;
      b = l + (b - l) * o.saturate;
      out[di] = r * 255;
      out[di + 1] = g * 255;
      out[di + 2] = b * 255;
      out[di + 3] = soft[si] * 255;
    }
  }
  return { data: out, width: ow, height: oh, offset: [x0, y0] };
}

/**
 * Trims a drawing rendered on a see-through sheet (the Bestioles drawn in code): its own alpha is the cut-out,
 * so what its lines enclose stays see-through and light greys stay grey. The colours get the levels of
 * `cutout`, with `paper` (the kit's paper colour, 0–255) taken to white.
 */
export function cutRender(img: Rgba, paper: [number, number, number], saturate = defaultCutoutOptions.saturate): CutoutResult {
  const { width: w, height: h, data } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 5) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
  const m = 6;
  x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m);
  x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
  const ow = x1 - x0 + 1, oh = y1 - y0 + 1;
  const out = new Uint8ClampedArray(ow * oh * 4);
  const lv = (v: number) => Math.min(1, Math.max(0, (v - 0.03) / 0.9));
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      const si = ((y + y0) * w + (x + x0)) * 4;
      const di = (y * ow + x) * 4;
      let r = lv(data[si] / paper[0]), g = lv(data[si + 1] / paper[1]), b = lv(data[si + 2] / paper[2]);
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = l + (r - l) * saturate;
      g = l + (g - l) * saturate;
      b = l + (b - l) * saturate;
      out[di] = r * 255;
      out[di + 1] = g * 255;
      out[di + 2] = b * 255;
      out[di + 3] = data[si + 3];
    }
  }
  return { data: out, width: ow, height: oh, offset: [x0, y0] };
}
