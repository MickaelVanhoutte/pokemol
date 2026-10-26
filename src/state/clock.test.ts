import { describe, expect, it } from 'vitest';
import { hourNow, meetsTime, phaseAt, shiftTo } from './clock';

describe('day and night', () => {
  it('splits the day into day, evening and night', () => {
    expect([6.9, 7, 12, 18.9, 19, 20.9, 21, 23.5, 0, 3].map(phaseAt)).toEqual(['night', 'day', 'day', 'day', 'evening', 'evening', 'night', 'night', 'night', 'night']);
  });

  it('shifts the clock to a chosen hour (a nap at home)', () => {
    const now = new Date(2026, 9, 26, 15, 30).getTime();
    expect(hourNow(0, now)).toBe(15.5);
    const shift = shiftTo(22, now);
    expect(hourNow(shift, now)).toBeCloseTo(22, 5);
    expect(phaseAt(hourNow(shiftTo(8, now), now))).toBe('day');
  });

  it('lets night Bestioles out only at night, day ones the rest of the time', () => {
    expect(meetsTime('night', 'night')).toBe(true);
    expect(meetsTime('night', 'evening')).toBe(false);
    expect(meetsTime('day', 'evening')).toBe(true);
    expect(meetsTime('day', 'night')).toBe(false);
    expect(meetsTime(undefined, 'night')).toBe(true);
  });
});
