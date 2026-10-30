import { describe, expect, it } from 'vitest';
import { GREY, mixPrimaries } from './primaries';

describe('primaries coming back to the lake', () => {
  it('mixes like paints, whatever the order', () => {
    expect(mixPrimaries([])).toBe(GREY);
    expect(mixPrimaries(['red']).colour).toBe('#e0453a');
    expect(mixPrimaries(['yellow', 'red'])).toEqual(mixPrimaries(['red', 'yellow']));
    expect(mixPrimaries(['red', 'yellow']).colour).toBe('#f08a3a');
    expect(mixPrimaries(['blue', 'yellow']).colour).toBe('#5cae5a');
    expect(mixPrimaries(['red', 'blue']).colour).toBe('#9a6ad6');
  });

  it('lets more of the colours through with each spring', () => {
    const s = [mixPrimaries([]), mixPrimaries(['blue']), mixPrimaries(['blue', 'red']), mixPrimaries(['blue', 'red', 'yellow'])];
    for (let i = 1; i < s.length; i++) expect(s[i].strength).toBeLessThan(s[i - 1].strength);
  });
});
