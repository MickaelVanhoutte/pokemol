import { describe, expect, it } from 'vitest';
import { shinyRecolour } from './shiny';

const px = (...rgba: number[][]) => new Uint8ClampedArray(rgba.flat());

describe('sparkly colours', () => {
  it('turns coloured pixels and keeps outlines, paper and see-through pixels', () => {
    const data = px([240, 200, 40, 255], [40, 36, 48, 255], [250, 248, 240, 255], [240, 200, 40, 0]);
    const changed = shinyRecolour(data, '004');
    expect(changed).toEqual([0]);
    expect([...data.slice(0, 3)]).not.toEqual([240, 200, 40]);
    expect([...data.slice(4)]).toEqual([40, 36, 48, 255, 250, 248, 240, 255, 240, 200, 40, 0]);
  });

  it('gives a species the same colours every time (card and miniature match)', () => {
    const a = px([90, 160, 230, 255]), b = px([90, 160, 230, 255]);
    shinyRecolour(a, '070');
    shinyRecolour(b, '070');
    expect([...a]).toEqual([...b]);
  });
});
