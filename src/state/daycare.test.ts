import { describe, expect, it } from 'vitest';
import { createMon, STAT_KEYS } from '../engine/pk/creature';
import { canBreed, daycareStep, EGG_CHECK_STEPS, familyRoot, makeEgg, withdrawPrice } from './daycare';
import { newGame, partyAlive } from './game';

const st = () => ({ rng: 11 });

describe('Pension Crayonnée', () => {
  it('finds the first form of a family', () => {
    expect(familyRoot('007')).toBe('012');
    expect(familyRoot('015')).toBe('012');
    expect(familyRoot('011')).toBe('009');
    expect(familyRoot('004')).toBe('004');
  });

  it('pairs only two Bestioles of one family, never eggs', () => {
    const s = st();
    const chenillou = createMon('012', 8, s), papivole = createMon('007', 14, s);
    expect(canBreed(chenillou, papivole)).toBe(true);
    expect(canBreed(chenillou, createMon('013', 8, s))).toBe(false);
    expect(canBreed(chenillou, undefined)).toBe(false);
    expect(canBreed(chenillou, makeEgg(chenillou, papivole, s))).toBe(false);
  });

  it('charges 100 plus 100 per level gained', () => {
    const m = createMon('004', 12, st());
    expect(withdrawPrice({ mon: m, level: 12 })).toBe(100);
    expect(withdrawPrice({ mon: m, level: 9 })).toBe(400);
  });

  it('lays an egg of the base form with inherited traits', () => {
    for (let seed = 1; seed < 40; seed++) {
      const s = { rng: seed };
      const a = createMon('007', 20, s), b = createMon('015', 9, s);
      a.item = 'pierre-immuable';
      b.talent = 2;
      const egg = makeEgg(a, b, s);
      expect(egg.species).toBe('012');
      expect(egg.level).toBe(5);
      expect(egg.nature).toBe(a.nature);
      expect(egg.egg!.steps).toBeGreaterThanOrEqual(600);
      expect(egg.egg!.steps).toBeLessThanOrEqual(1200);
      const inherited = STAT_KEYS.filter((k) => egg.ivs[k] === a.ivs[k] || egg.ivs[k] === b.ivs[k]);
      expect(inherited.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('passes the hidden talent about half the time', () => {
    let hidden = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const s = { rng: seed };
      const a = createMon('012', 8, s), b = createMon('012', 8, s);
      a.talent = 2;
      b.talent = 0;
      if (makeEgg(a, b, s).talent === 2) hidden++;
    }
    expect(hidden).toBeGreaterThan(150);
    expect(hidden).toBeLessThan(260);
  });

  it('gives 1 XP a step and sometimes an egg every 256 steps', () => {
    const s = newGame('Lou', 0, 'f', 'Feutre');
    const r = st();
    const a = createMon('012', 5, r), b = createMon('012', 5, r);
    s.daycare = { slots: [{ mon: a, level: 5 }, { mon: b, level: 5 }], egg: false };
    const xp = a.xp;
    let eggs = 0;
    for (let step = 1; step <= EGG_CHECK_STEPS * 40; step++) {
      if (daycareStep(s, step, r)) {
        eggs++;
        s.daycare.egg = false;
      }
    }
    expect(a.xp).toBeGreaterThan(xp);
    expect(a.level).toBeGreaterThan(5);
    expect(a.moves.length).toBeLessThanOrEqual(4);
    expect(eggs).toBeGreaterThan(8);
    expect(eggs).toBeLessThan(32);
  });

  it('never makes an egg from two families', () => {
    const s = newGame('Lou', 0, 'f', 'Feutre');
    const r = st();
    s.daycare = { slots: [{ mon: createMon('012', 5, r), level: 5 }, { mon: createMon('013', 5, r), level: 5 }], egg: false };
    for (let step = 1; step <= EGG_CHECK_STEPS * 20; step++) expect(daycareStep(s, step, r)).toBe(false);
  });

  it('does not count an egg as able to fight', () => {
    const s = newGame('Lou', 0, 'f', 'Feutre');
    const r = st();
    const a = createMon('012', 5, r);
    s.party = [makeEgg(a, a, r)];
    expect(partyAlive(s)).toBe(false);
    s.party.push(a);
    expect(partyAlive(s)).toBe(true);
  });
});
