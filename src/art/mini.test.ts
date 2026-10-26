import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CREATURES } from '../data/creatures';
import { palette, pixelize } from './mini';

describe('overworld miniatures', () => {
  it('outlines the drawing and keeps few colours', () => {
    // a 4×4 square of two colours with a soft edge
    const w = 4, h = 4;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const x = i % w;
      data.set(x < 2 ? [240, 60, 60, 255] : [60, 60, 240, 255], i * 4);
    }
    data[3] = 40; // a corner too faint to count
    const out = pixelize({ data, width: w, height: h }, { colors: 2 });
    expect(out.width).toBe(6);
    expect(out.height).toBe(6);
    const px = (x: number, y: number) => Array.from(out.data.slice((y * 6 + x) * 4, (y * 6 + x) * 4 + 4));
    expect(px(0, 0)[3]).toBe(0);
    expect(px(1, 0)).toEqual([0, 0, 0, 0]);
    expect(px(2, 0)).toEqual([42, 34, 56, 255]);
    expect(px(1, 1)).toEqual([42, 34, 56, 255]);
    const colours = new Set<string>();
    for (let y = 1; y < 5; y++) for (let x = 1; x < 5; x++) if (px(x, y)[3]) colours.add(px(x, y).slice(0, 3).join());
    expect(colours.size).toBeLessThanOrEqual(3);
  });

  it('fits a palette to the colours', () => {
    const pal = palette([[0, 0, 0], [10, 10, 10], [250, 250, 250], [240, 240, 240]], 2);
    expect(pal).toHaveLength(2);
  });

  it('has a miniature for every Bestiole (npm run cards / npm run minis)', () => {
    const dir = new URL('../../public/minis', import.meta.url).pathname;
    for (const c of CREATURES) expect(existsSync(join(dir, `${c.id}-${c.slug}.png`)), `${c.id}-${c.slug}.png`).toBe(true);
  });
});
