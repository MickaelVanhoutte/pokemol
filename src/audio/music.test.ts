import { describe, expect, it } from 'vitest';
import { parse, trackIds, trackLengths } from './music';

describe('music', () => {
  it('parses notes and rests', () => {
    expect(parse('A4:2 . | C5')).toEqual([[440, 2], [null, 1], [523.2511306011972, 1]]);
  });
  for (const id of trackIds()) {
    it(`${id}: melody, bass and drums loop together`, () => {
      const l = trackLengths(id);
      expect(l.lead).toBe(l.bass);
      if (l.drums) expect(l.lead % l.drums).toBe(0);
    });
  }
});
