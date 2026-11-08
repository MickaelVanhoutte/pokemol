import { describe, expect, it } from 'vitest';
import { changedBounds, eraseBands, restoreRadius, riseHeight, sketchStrokes } from './redraw';

describe('redraw', () => {
  it('finds where a map changed', () => {
    const before = ['g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'];
    const after = ['g', 'g', 'g', 'g', 'e', 'e', 'g', 'g', 'g'];
    expect(changedBounds(before, after, 3)).toEqual({ x: 1, y: 1, w: 2, h: 1 });
    expect(changedBounds(before, before, 3)).toBeNull();
  });

  it('every way of redrawing goes from nothing to everything, never backwards', () => {
    const steps = Array.from({ length: 41 }, (_, i) => i / 40);
    const check = (values: number[][]) => {
      for (let j = 0; j < values[0].length; j++) {
        let last = -1;
        for (const v of values) {
          expect(v[j]).toBeGreaterThanOrEqual(last - 1e-9);
          last = v[j];
        }
      }
      expect(values[0].every((v) => v === 0)).toBe(true);
      expect(values[values.length - 1].every((v) => v >= 0.999)).toBe(true);
    };
    check(steps.map((t) => eraseBands(t, 6)));
    check(steps.map((t) => sketchStrokes(t, 20)));
    check(steps.map((t) => [riseHeight(t)]));
    check(steps.map((t) => [Math.min(1, restoreRadius(t))]));
  });
});
