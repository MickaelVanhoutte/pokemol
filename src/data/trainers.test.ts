import { describe, expect, it } from 'vitest';
import { createMon } from '../engine/pk/creature';
import { TRAINERS, partyOf, rematchParty, teamLevel, trainerLevel } from './trainers';

describe('difficulty', () => {
  it('shifts trainer levels in proportion, within 2..100', () => {
    expect(trainerLevel(10, 'normal')).toBe(10);
    expect(trainerLevel(4, 'easy')).toBe(3);
    expect(trainerLevel(40, 'easy')).toBe(34);
    expect(trainerLevel(2, 'easy')).toBe(2);
    expect(trainerLevel(4, 'hard')).toBe(4);
    expect(trainerLevel(30, 'hard')).toBe(33);
    expect(trainerLevel(49, 'hard')).toBe(54);
    expect(trainerLevel(98, 'hard')).toBe(100);
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

describe('route rematches', () => {
  const team = (...levels: number[]) => levels.map((l, i) => createMon('001', l, { rng: i + 1 }));

  it('takes the player\'s level from the three strongest Bestioles, eggs left out', () => {
    expect(teamLevel(team(30, 12, 28, 5, 29))).toBe(29);
    expect(teamLevel(team(20, 10))).toBe(15);
    const egg = { ...createMon('001', 5, { rng: 9 }), level: 90, egg: { steps: 100 } };
    expect(teamLevel([...team(20, 20, 20), egg])).toBe(20);
  });

  it('keeps up with the badges, but never outgrows the player\'s team', () => {
    const t = TRAINERS.r4tim;
    // 7 badges (ace 36) against a team at 24: the ace at 24, the others a level apart under it
    expect(rematchParty(t, 7, 24).map((m) => m.level)).toEqual([22, 23, 24]);
    // a team well above: the badges' level, at least as strong as the first time
    const strong = rematchParty(t, 3, 60).map((m) => m.level);
    expect(strong[2]).toBe(22);
    strong.forEach((l, i) => expect(l).toBeGreaterThanOrEqual(t.party[i].level));
    // after the difficulty's shift too: Hard's extra levels stop at the player's level
    expect(Math.max(...partyOf(rematchParty(t, 9, 40), 1, 'hard', 40).map((m) => m.level))).toBe(40);
  });
});
