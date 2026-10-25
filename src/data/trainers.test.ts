import { describe, expect, it } from 'vitest';
import { TRAINERS, partyOf, trainerLevel } from './trainers';

describe('difficulty', () => {
  it('shifts trainer levels in proportion, within 2..50', () => {
    expect(trainerLevel(10, 'normal')).toBe(10);
    expect(trainerLevel(4, 'easy')).toBe(3);
    expect(trainerLevel(40, 'easy')).toBe(34);
    expect(trainerLevel(2, 'easy')).toBe(2);
    expect(trainerLevel(4, 'hard')).toBe(4);
    expect(trainerLevel(30, 'hard')).toBe(33);
    expect(trainerLevel(49, 'hard')).toBe(50);
  });

  it('builds teams with the shifted levels', () => {
    const party = TRAINERS.mireille.party;
    expect(partyOf(party, 1, 'hard').map((m) => m.level)).toEqual(party.map((t) => trainerLevel(t.level, 'hard')));
    expect(partyOf(party, 1, 'easy').every((m, i) => m.level < party[i].level)).toBe(true);
  });

  it('starts gently: the first two trainers have low-level teams', () => {
    for (const id of ['iris', 'leo']) expect(Math.max(...TRAINERS[id].party.map((m) => m.level))).toBeLessThanOrEqual(4);
  });
});
