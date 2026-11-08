import { describe, expect, it } from 'vitest';
import { bell, clamp01, easeBack, easeIn, easeInOut, easeOut, mix, seg } from './ease';

describe('easing', () => {
  it('starts at 0 and ends at 1', () => {
    for (const f of [easeIn, easeOut, easeInOut, easeBack]) {
      expect(f(0)).toBeCloseTo(0);
      expect(f(1)).toBeCloseTo(1);
    }
  });

  it('never goes backwards (easeBack only overshoots past 1)', () => {
    for (const f of [easeIn, easeOut, easeInOut]) {
      let last = -1;
      for (let i = 0; i <= 50; i++) {
        const v = f(i / 50);
        expect(v).toBeGreaterThanOrEqual(last - 1e-9);
        last = v;
      }
    }
    expect(Math.max(...Array.from({ length: 51 }, (_, i) => easeBack(i / 50)))).toBeGreaterThan(1);
  });

  it('clamps, segments and bells', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(seg(0.5, 0.25, 0.75)).toBeCloseTo(0.5);
    expect(seg(0.1, 0.25, 0.75)).toBe(0);
    expect(bell(0)).toBeCloseTo(0);
    expect(bell(0.5)).toBeCloseTo(1);
  });

  it('mixes colours', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
