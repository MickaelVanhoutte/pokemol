import { describe, expect, it } from 'vitest';
import { creature } from '../../data/creatures';
import { ITEM_BY_ID } from '../../data/items';
import type { SpeciesDef } from '../../data/schema';
import { addXp, BASE_FRIENDSHIP, createMon, evolutionFor, evolutionOf, rememberableMoves, xpAt } from './creature';

// a made-up branching species, like Touffou will be once its evolutions are drawn
const branching = {
  ...creature('016'),
  evolutions: [
    { to: '002', item: 'crayon-magique-feu' },
    { to: '003', item: 'crayon-magique-eau' },
    { to: '005', friendship: 220 },
    { to: '008', level: 30 },
  ],
} as SpeciesDef;

describe('evolution rules', () => {
  it('follows level rules on level-up', () => {
    expect(evolutionOf({ ...createMon('012', 7, { rng: 1 }) })).toBe('015');
    expect(evolutionOf({ ...createMon('012', 6, { rng: 1 }) })).toBeNull();
    expect(evolutionOf({ ...createMon('015', 10, { rng: 1 }) })).toBe('007');
  });

  it('evolves with the right magic pencil only, never by levelling for an item rule', () => {
    const m = { level: 12, friendship: BASE_FRIENDSHIP };
    expect(evolutionFor(branching, m, { kind: 'item', item: 'crayon-magique-feu' })).toBe('002');
    expect(evolutionFor(branching, m, { kind: 'item', item: 'crayon-magique-eau' })).toBe('003');
    expect(evolutionFor(branching, m, { kind: 'item', item: 'crayon-magique-psy' })).toBeNull();
    expect(evolutionFor(branching, m, { kind: 'level' })).toBeNull();
  });

  it('evolves with a great friendship, or at the rule’s level', () => {
    expect(evolutionFor(branching, { level: 12, friendship: 230 }, { kind: 'level' })).toBe('005');
    expect(evolutionFor(branching, { level: 30, friendship: 10 }, { kind: 'level' })).toBe('008');
  });

  it('has the magic pencils (not sold in shops yet)', () => {
    expect(ITEM_BY_ID['crayon-magique-feu'].kind).toBe('evo');
  });
});

describe('friendship', () => {
  it('grows on every level-up, faster when low', () => {
    const m = createMon('013', 5, { rng: 4 });
    expect(m.friendship).toBe(BASE_FRIENDSHIP);
    addXp(m, xpAt(8) - m.xp);
    expect(m.friendship).toBe(BASE_FRIENDSHIP + 15);
  });
});

describe('move rememberer', () => {
  it('lists level-up moves it could know but doesn’t, newest first', () => {
    const m = createMon('016', 20, { rng: 2 });
    m.moves = [{ id: 'bousculade', pp: 35 }];
    expect(rememberableMoves(m)).toEqual(['mordillage', 'pas-de-loup', 'grondement', 'fretillement']);
  });
});
