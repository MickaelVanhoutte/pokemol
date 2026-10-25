import { describe, expect, it } from 'vitest';
import { createMon, maxHp } from '../../engine/pk/creature';
import { canUseOn, pocketItems, useOn } from './bag';
import { canDeposit } from './pc';
import { moveCursor } from '../paper/nav';

const mon = (hp?: number) => {
  const m = createMon('001', 10, { rng: 1 });
  if (hp !== undefined) m.hp = hp;
  return m;
};

describe('bag', () => {
  it('sorts items into pockets', () => {
    const bag = { potion: 2, 'crayon-ball': 3, retouche: 0 };
    expect(pocketItems(bag, 'items').map((i) => i.id)).toEqual(['potion']);
    expect(pocketItems(bag, 'balls').map((i) => i.id)).toEqual(['crayon-ball']);
    expect(pocketItems(bag, 'key')).toEqual([]);
  });
  it('heals, cures and revives with the battle rules', () => {
    const full = mon();
    expect(canUseOn('potion', full)).toBe(false);
    const hurt = mon(5);
    expect(useOn('potion', hurt)).toBe(true);
    expect(hurt.hp).toBe(25);
    const ko = mon(0);
    expect(canUseOn('potion', ko)).toBe(false);
    expect(useOn('rappel', ko)).toBe(true);
    expect(ko.hp).toBe(Math.floor(maxHp(ko) / 2));
    const sick = mon();
    sick.status = 'poison';
    expect(useOn('retouche', sick)).toBe(true);
    expect(sick.status).toBe(null);
  });
});

describe('pc', () => {
  it('keeps at least one creature able to fight', () => {
    expect(canDeposit([mon()], 0)).toBe(false);
    expect(canDeposit([mon(), mon(0)], 0)).toBe(false);
    expect(canDeposit([mon(), mon()], 0)).toBe(true);
  });
});

describe('menu cursor', () => {
  it('wraps in lists and grids', () => {
    expect(moveCursor(0, 4, 'up')).toBe(3);
    expect(moveCursor(3, 4, 'down')).toBe(0);
    expect(moveCursor(0, 4, 'right', 2)).toBe(1);
    expect(moveCursor(1, 4, 'down', 2)).toBe(3);
    expect(moveCursor(2, 3, 'right', 2)).toBe(2);
  });
});
