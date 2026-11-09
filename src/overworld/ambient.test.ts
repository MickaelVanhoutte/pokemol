import { describe, expect, it } from 'vitest';
import { AMBIENT_COUNT, AMBIENT_KINDS, speckAt } from './ambient';

/** The same place modulo the span the specks wrap round in. */
const near = (a: number, b: number, span: number) => {
  const d = (((a - b) % span) + span) % span;
  return Math.min(d, span - d) < 1e-6;
};

describe('the air of a place', () => {
  it('stays on the map when the camera moves', () => {
    const w = 240, h = 160, t = 12.3;
    for (const kind of AMBIENT_KINDS) {
      for (let i = 0; i < AMBIENT_COUNT[kind]; i++) {
        const a = speckAt(kind, i, t, w, h, 100, 40);
        const b = speckAt(kind, i, t, w, h, 137, 21);
        // the camera went 37 px right and 19 px up: the speck goes 37 px left and 19 px down on screen
        expect(near(b.x, a.x - 37, w + 24), `${kind} ${i} x`).toBe(true);
        expect(near(b.y, a.y + 19, h + 24), `${kind} ${i} y`).toBe(true);
      }
    }
  });
});
