import { describe, expect, it } from 'vitest';
import { cutRender } from './cutout';

/** A w×h sheet, see-through but for a ring of grey (#9a98a8) with a see-through middle. */
function ring(w: number, h: number) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - w / 2, y - h / 2);
      if (d > 10 && d < 20) data.set([0x9a, 0x98, 0xa8, 255], (y * w + x) * 4);
    }
  }
  return { data, width: w, height: h };
}

describe('cutRender (drawings made in code)', () => {
  const paper: [number, number, number] = [0xf7, 0xf3, 0xea];
  const res = cutRender(ring(100, 80), paper);
  const at = (x: number, y: number) => Array.from(res.data.slice((y * res.width + x) * 4, (y * res.width + x) * 4 + 4));

  it('trims to the drawing with a small margin and gives its offset', () => {
    expect(res.offset).toEqual([25, 15]);
    expect([res.width, res.height]).toEqual([51, 51]);
  });

  it('keeps what the lines enclose see-through', () => {
    expect(at(25, 25)[3]).toBe(0);
  });

  it('keeps a light grey grey, not paper white', () => {
    const [r, g, b, a] = at(25, 25 - 15);
    expect(a).toBe(255);
    expect(Math.max(r, g, b)).toBeLessThan(215);
  });

  it('takes the paper colour to white', () => {
    const img = { data: new Uint8ClampedArray([...paper, 255]), width: 1, height: 1 };
    expect(Array.from(cutRender(img, paper).data)).toEqual([255, 255, 255, 255]);
  });
});
