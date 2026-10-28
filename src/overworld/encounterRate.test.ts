import { describe, expect, it } from 'vitest';
import { calm, calmSteps, meanSteps, missed, wildOdds, wildStep } from './encounterRate';

/** A seeded random source, so the walks are the same on every run. */
const seeded = (seed: number) => () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};

/** Steps between battles over many walks on one ground, like FireRed's tall grass. */
const walk = (rate: number, battles: number, rnd: () => number) => {
  const o = wildOdds(), gaps: number[] = [];
  for (let walked = 0; gaps.length < battles;) {
    walked++;
    if (wildStep(o, rate, 'tallgrass', {}, rnd)) {
      gaps.push(walked);
      walked = 0;
      calm(o);
    }
  }
  return gaps;
};

describe('wild encounters, as in FireRed', () => {
  it('has the calm of the GBA after a battle', () => {
    expect([calmSteps(21), calmSteps(14), calmSteps(7), calmSteps(2), calmSteps(80)]).toEqual([6, 7, 8, 8, 0]);
  });

  it('meets one every 10 steps on a route, 21 in a cave, 50 on water', () => {
    expect(meanSteps(21)).toBeCloseTo(10.2, 0);
    expect(meanSteps(14)).toBeCloseTo(13.4, 0);
    expect(meanSteps(7)).toBeCloseTo(21, 0);
    expect(meanSteps(2)).toBeGreaterThan(45);
  });

  it('agrees with walking it', () => {
    for (const rate of [21, 7]) {
      const gaps = walk(rate, 20000, seeded(rate));
      expect(gaps.reduce((a, b) => a + b, 0) / gaps.length).toBeCloseTo(meanSteps(rate), 0);
    }
  });

  it('hardly ever starts a battle right after another', () => {
    const gaps = walk(21, 20000, seeded(3));
    expect(gaps.filter((g) => g <= 2).length / gaps.length).toBeLessThan(0.04);
  });

  it('wakes nothing off wild ground, and lets the first step into the grass through 4 times in 10', () => {
    const o = wildOdds();
    expect(wildStep(o, 21, '', {}, () => 0)).toBe(false);
    expect(o.steps).toBe(0);
    // past the calm, a step from the path into the grass: 0.7 × 100 ≥ 60 lets it through
    o.steps = 6;
    expect(wildStep(o, 21, 'tallgrass', {}, () => 0.7)).toBe(false);
    expect(wildStep(o, 21, 'tallgrass', {}, () => 0)).toBe(true);
  });

  it('makes each failed roll count, unless a spray is on', () => {
    const o = wildOdds();
    missed(o, 21);
    missed(o, 21);
    expect(o.buff).toBe(42);
    missed(o, 21, true);
    expect(o.buff).toBe(0);
  });
});
