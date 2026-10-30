import { describe, expect, it } from 'vitest';
import { creature, grownForm } from '../../data/creatures';
import { ITEM_BY_ID } from '../../data/items';
import type { SpeciesDef } from '../../data/schema';
import { addXp, BASE_FRIENDSHIP, createMon, evolutionFor, evolutionMoves, evolutionOf, movesAt, rememberableMoves, xpAt } from './creature';

// a made-up branching species mixing every kind of rule
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

  it('has the magic pencils', () => {
    expect(ITEM_BY_ID['crayon-magique-feu'].kind).toBe('evo');
  });

  it('turns Touffou into Touflot, Toufeu or Toufoudre with the water, fire or lightning pencil', () => {
    const touffou = createMon('016', 20, { rng: 3 });
    const by = (item: string) => evolutionFor(creature('016'), touffou, { kind: 'item', item });
    expect([by('crayon-magique-eau'), by('crayon-magique-feu'), by('crayon-magique-electrique')]).toEqual(['017', '018', '019']);
    expect(by('crayon-magique-plante')).toBeNull();
    expect(evolutionOf({ ...touffou, level: 50 })).toBeNull();
    for (const id of ['017', '018', '019']) expect(creature(id).evolvesFrom).toBe('016');
  });

  it('teaches a move of the new type the moment Touffou evolves, at any level', () => {
    expect(evolutionMoves('017', 24)).toEqual(['jet-d-eau']);
    expect(evolutionMoves('018', 30)).toEqual(['flammeche', 'patte-brulante', 'coup-de-boule']);
    expect(evolutionMoves('019', 9)).toEqual(['petite-etincelle']);
    // wild or trainer ones know it too
    expect(movesAt('017', 5)).toContain('jet-d-eau');
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
    expect(rememberableMoves(m)).toEqual(['mordillage', 'bouclier-papier', 'pas-de-loup', 'grondement', 'fretillement']);
  });
});

describe('level cap', () => {
  it('goes up to 100 (level³ XP), and stops there', () => {
    const m = createMon('003', 50, { rng: 1 });
    addXp(m, xpAt(100) - m.xp + 5000);
    expect(m.level).toBe(100);
    expect(m.xp).toBe(xpAt(100));
    expect(addXp(m, 1000)).toEqual([]);
  });
  it('Dragondine grows into Dragopataud at 55, like the GBA games', () => {
    expect(grownForm('034', 54)).toBe('044');
    expect(grownForm('034', 55)).toBe('045');
  });
});

describe('grownForm (trainer teams)', () => {
  it('follows level evolutions only', () => {
    expect(grownForm('001', 15)).toBe('001');
    expect(grownForm('001', 16)).toBe('020');
    expect(grownForm('002', 20)).toBe('021');
    expect(grownForm('002', 43)).toBe('025');
    expect(grownForm('003', 31)).toBe('022');
    expect(grownForm('003', 50)).toBe('023');
    // Chenillou → Chrysalou (L7) → Papivole (L10)
    expect(grownForm('012', 8)).toBe('015');
    expect(grownForm('012', 10)).toBe('007');
    // Touffou needs a Magic Pencil
    expect(grownForm('016', 50)).toBe('016');
  });
});

describe('the brouillons’ evolutions', () => {
  it('Piafou at 18, Zigzou with the Electric Magic Pencil, Lunelle by friendship', () => {
    expect(evolutionFor(creature('013'), { level: 17 }, { kind: 'level' })).toBeNull();
    expect(evolutionFor(creature('013'), { level: 18 }, { kind: 'level' })).toBe('026');
    expect(evolutionFor(creature('004'), { level: 50 }, { kind: 'level' })).toBeNull();
    expect(evolutionFor(creature('004'), { level: 5 }, { kind: 'item', item: 'crayon-magique-electrique' })).toBe('027');
    expect(evolutionFor(creature('006'), { level: 30, friendship: 200 }, { kind: 'level' })).toBeNull();
    expect(evolutionFor(creature('006'), { level: 30, friendship: 230 }, { kind: 'level' })).toBe('028');
  });
  it('every draft has its card and miniature', async () => {
    const { existsSync } = await import('node:fs');
    const { CREATURES } = await import('../../data/creatures');
    for (const c of CREATURES.filter((x) => x.draft)) {
      expect(existsSync(`public/cards/${c.id}-${c.slug}.webp`), c.slug).toBe(true);
      expect(existsSync(`public/minis/${c.id}-${c.slug}.png`), c.slug).toBe(true);
    }
  });
});
