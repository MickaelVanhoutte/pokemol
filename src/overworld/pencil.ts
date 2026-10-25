import { hash } from './pixel';

const PAPER = [251, 246, 234];

/**
 * Turns a painted map layer into "coloured pencil on paper": colours lightened toward the
 * paper, diagonal pencil strokes, paper showing through here and there, graphite outlines.
 * Deterministic per pixel, so both animation frames match.
 */
export function pencilize(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const w = c.width;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] === 0) continue;
      let r = d[i], g = d[i + 1], b = d[i + 2];
      // the void around small rooms stays plain black
      if (r < 8 && g < 8 && b < 8) continue;
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      if (lum < 55) {
        // ink outlines become soft graphite, with a few gaps like a quick sketch
        const gap = hash(x, y, 31) < 0.12;
        r = gap ? 120 : 64 + (r >> 2);
        g = gap ? 114 : 58 + (g >> 2);
        b = gap ? 132 : 78 + (b >> 2);
      } else {
        // pencil does not fully cover the paper: lighter and a little less saturated
        const k = 0.16;
        r += (PAPER[0] - r) * k;
        g += (PAPER[1] - g) * k;
        b += (PAPER[2] - b) * k;
        const m = (r + g + b) / 3;
        r += (m - r) * 0.12;
        g += (m - g) * 0.12;
        b += (m - b) * 0.12;
        // diagonal strokes, broken into segments of uneven pressure
        const seg = hash(Math.floor((x - y) / 6), Math.floor((x + y) / 4), 7);
        const diag = (x + y) & 3;
        let shade = 0;
        if (diag === 0 && seg > 0.15) shade = 0.13 * (0.6 + seg * 0.6);
        else if (diag === 2 && hash(x, y, 3) < 0.2) shade = 0.06;
        r *= 1 - shade;
        g *= 1 - shade;
        b *= 1 - shade;
        // paper grain showing through the colour
        const speck = hash(x, y, 11);
        if (speck < 0.08) {
          const t = 0.55;
          r += (PAPER[0] - r) * t;
          g += (PAPER[1] - g) * t;
          b += (PAPER[2] - b) * t;
        }
      }
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
  }
  ctx.putImageData(img, 0, 0);
}
