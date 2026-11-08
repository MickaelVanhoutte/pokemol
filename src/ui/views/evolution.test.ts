import { describe, expect, it } from 'vitest';
import { BURST, EVO_SWAPS, isStopKey } from './evolution';

describe('the evolution scene', () => {
  it('swaps faster and faster', () => {
    for (let i = 1; i < EVO_SWAPS.length; i++) expect(EVO_SWAPS[i]).toBeLessThanOrEqual(EVO_SWAPS[i - 1]);
  });
  it('stops only on a fresh press of B, never on a key held down from before', () => {
    expect(isStopKey({ key: 'x', repeat: false })).toBe(true);
    expect(isStopKey({ key: 'x', repeat: true })).toBe(false);
    expect(isStopKey({ key: 'z', repeat: false })).toBe(false);
  });
  it('bursts sparkles all the way round', () => {
    expect(new Set(BURST.map(([a]) => Math.floor(a / 90))).size).toBe(4);
  });
});

import { creditsY, CREDITS_SPEED } from '../screens/creditsRoll';
describe('the credits roll', () => {
  it('starts under the view, climbs, and stops with its end in the middle', () => {
    expect(creditsY(0, 800, 3000)).toEqual({ y: 800, end: false });
    expect(creditsY(1000, 800, 3000).y).toBe(800 - CREDITS_SPEED);
    expect(creditsY(1e9, 800, 3000)).toEqual({ y: 400 - 3000, end: true });
  });
});
