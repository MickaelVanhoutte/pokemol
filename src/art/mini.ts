/**
 * Miniatures of the drawings for the overworld (the Bestiole that follows you): a pixel-art pass
 * on an already shrunk image, with hard edges, a few flat colours and a dark outline like the GBA
 * sprites around it.
 */
export interface Rgba {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
}

export interface MiniOptions {
  /** Alpha (0–255) from which a pixel counts as drawn. */
  alpha: number;
  /** Colours kept (a palette fitted to each drawing). */
  colors: number;
  /** Outline colour. */
  outline: [number, number, number];
}

export const defaultMiniOptions: MiniOptions = { alpha: 100, colors: 6, outline: [42, 34, 56] };

type Rgb = [number, number, number];
const dist = (a: Rgb, b: Rgb) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const lum = (c: Rgb) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;

/** A small palette for the colours (k-means, started from evenly spread shades). */
export function palette(colors: Rgb[], k: number): Rgb[] {
  if (!colors.length) return [];
  const sorted = [...colors].sort((a, b) => lum(a) - lum(b));
  let centres: Rgb[] = Array.from({ length: Math.min(k, colors.length) }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]] as Rgb);
  for (let round = 0; round < 10; round++) {
    const sums = centres.map(() => [0, 0, 0, 0]);
    for (const c of colors) {
      let best = 0;
      for (let j = 1; j < centres.length; j++) if (dist(c, centres[j]) < dist(c, centres[best])) best = j;
      sums[best][0] += c[0];
      sums[best][1] += c[1];
      sums[best][2] += c[2];
      sums[best][3]++;
    }
    centres = centres.map((old, j) => (sums[j][3] ? [sums[j][0] / sums[j][3], sums[j][1] / sums[j][3], sums[j][2] / sums[j][3]].map(Math.round) as Rgb : old));
  }
  return centres;
}

/** Hard alpha, a few flat colours without lone specks, and a 1 px outline (the result is 2 px bigger). */
export function pixelize(img: Rgba, options: Partial<MiniOptions> = {}): Rgba {
  const o = { ...defaultMiniOptions, ...options };
  const { width: w, height: h } = img;
  const solid = new Uint8Array(w * h);
  const px: Rgb[] = [];
  for (let i = 0; i < w * h; i++) {
    if (img.data[i * 4 + 3] < o.alpha) continue;
    solid[i] = 1;
    px.push([img.data[i * 4], img.data[i * 4 + 1], img.data[i * 4 + 2]]);
  }
  const pal = palette(px, o.colors);
  const idx = new Int16Array(w * h).fill(-1);
  for (let i = 0, n = 0; i < w * h; i++) {
    if (!solid[i]) continue;
    const c = px[n++];
    let best = 0;
    for (let j = 1; j < pal.length; j++) if (dist(c, pal[j]) < dist(c, pal[best])) best = j;
    idx[i] = best;
  }
  // a lone speck takes the colour all its neighbours share
  const at = (x: number, y: number) => (x >= 0 && y >= 0 && x < w && y < h ? idx[y * w + x] : -1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const me = at(x, y);
      if (me < 0) continue;
      const around = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].filter((v) => v >= 0);
      if (around.length >= 3 && around.every((v) => v === around[0]) && around[0] !== me) idx[y * w + x] = around[0];
    }
  }
  const W = w + 2, H = h + 2;
  const out = new Uint8ClampedArray(W * H * 4);
  const put = (x: number, y: number, c: Rgb) => {
    const j = ((y + 1) * W + x + 1) * 4;
    out[j] = c[0];
    out[j + 1] = c[1];
    out[j + 2] = c[2];
    out[j + 3] = 255;
  };
  for (let y = -1; y <= h; y++) {
    for (let x = -1; x <= w; x++) {
      const v = at(x, y);
      if (v >= 0) put(x, y, pal[v]);
      else if (at(x - 1, y) >= 0 || at(x + 1, y) >= 0 || at(x, y - 1) >= 0 || at(x, y + 1) >= 0) put(x, y, o.outline);
    }
  }
  return { data: out, width: W, height: H };
}
