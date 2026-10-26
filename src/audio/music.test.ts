import { describe, expect, it } from 'vitest';
import { parse, trackIds, trackLengths, trackNotes, trackSeconds } from './music';

describe('music', () => {
  it('parses notes, rests and sixteenths', () => {
    expect(parse('A4:2 . | C5 A4:.5')).toEqual([[440, 2], [null, 1], [523.2511306011972, 1], [440, 0.5]]);
  });
  for (const id of trackIds()) {
    it(`${id}: every voice and the drums loop together, bar after bar`, () => {
      const l = trackLengths(id);
      for (const v of l.voices) expect(v).toBe(l.voices[0]);
      if (l.drums) expect(l.voices[0] % l.drums).toBe(0);
      l.bars.forEach((voice, i) => voice.forEach((b, k) => expect(b, `voice ${i} bar ${k + 1}`).toBe(l.bar)));
    });
    it(`${id}: every note is readable`, () => {
      for (const n of trackNotes(id)) expect(n === '.' || parse(n)[0][0] !== null, n).toBe(true);
    });
  }
  it('gives every tune a loop length for the music box', () => {
    for (const id of trackIds()) {
      expect(trackSeconds(id), id).toBeGreaterThan(5);
      expect(trackSeconds(id), id).toBeLessThan(60);
    }
  });
});
