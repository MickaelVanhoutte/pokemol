import { describe, expect, it } from 'vitest';
import { createMon, statsOf } from '../../engine/pk/creature';
import { drainMs, isLow, levelGains, moneySteps } from './tally';

describe('battle tallies', () => {
  it('HP runs longer for a bigger share of the bar', () => {
    expect(drainMs(0, 100)).toBe(0);
    expect(drainMs(10, 100)).toBeLessThan(drainMs(80, 100));
    expect(drainMs(-30, 100)).toBe(drainMs(30, 100));
    expect(drainMs(500, 100)).toBe(1250);
  });

  it('danger below a fifth of the HP, not when knocked out', () => {
    expect(isLow(20, 100)).toBe(true);
    expect(isLow(21, 100)).toBe(false);
    expect(isLow(0, 100)).toBe(false);
  });

  it('a level’s gains add up to the new stats', () => {
    const m = createMon('021', 24, { rng: 3 });
    const { before, after, gain } = levelGains(m, 25);
    expect(after).toEqual(statsOf({ ...m, level: 25 }));
    for (const k of Object.keys(gain) as (keyof typeof gain)[]) {
      expect(before[k] + gain[k]).toBe(after[k]);
      expect(gain[k]).toBeGreaterThanOrEqual(0);
    }
    expect(gain.hp).toBeGreaterThan(0);
  });

  it('the prize counts up in a few steps and ends on the prize', () => {
    const s = moneySteps(640);
    expect(s.length).toBeLessThanOrEqual(12);
    expect(s[s.length - 1]).toBe(640);
    expect(s).toEqual([...s].sort((a, b) => a - b));
    expect(moneySteps(5)).toEqual([1, 2, 3, 4, 5]);
    expect(moneySteps(0)).toEqual([0]);
  });
});
