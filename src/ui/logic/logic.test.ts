import { describe, expect, it } from 'vitest';
import { createMon, maxHp } from '../../engine/pk/creature';
import { canUseOn, pocketItems, stencilStatus, useOn } from './bag';
import { canDeposit } from './pc';
import { moveCursor } from '../paper/nav';
import { giveHeld, takeHeld } from '../../state/game';
import type { SaveData } from '../../save/schema';

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
    expect(pocketItems({ 'baie-bleue': 1, gouter: 1 }, 'berries').map((i) => i.id)).toEqual(['baie-bleue']);
  });
  it('berries from the bag heal or cure, like in battle', () => {
    expect(canUseOn('baie-bleue', mon())).toBe(false);
    const hurt = mon(5);
    expect(useOn('baie-bleue', hurt)).toBe(true);
    expect(hurt.hp).toBe(15);
    const para = mon();
    para.status = 'paralyze';
    expect(canUseOn('baie-reveil', para)).toBe(false);
    expect(useOn('baie-prisme', para)).toBe(true);
    expect(para.status).toBe(null);
    expect(canUseOn('gouter', mon(5))).toBe(false);
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

describe('stencils', () => {
  it('say who can learn them', () => {
    const m = mon(); // Minousse knows Griffe, Grondement, Coup de liane, Griffe-pousse
    expect(stencilStatus('pochoir-07', m)).toBe('able');
    expect(stencilStatus('pochoir-03', m)).toBe('unable');
    m.moves[0] = { id: 'rafale-de-graines', pp: 15 };
    expect(stencilStatus('pochoir-07', m)).toBe('learned');
    expect(pocketItems({ 'pochoir-07': 1, potion: 1 }, 'stencils').map((i) => i.id)).toEqual(['pochoir-07']);
  });
});

describe('held items', () => {
  const save = () => ({ bag: { 'baie-bleue': 1, gouter: 1 } as Record<string, number> }) as unknown as SaveData;
  it('gives, swaps and takes back', () => {
    const s = save();
    const m = mon();
    expect(giveHeld(s, m, 'baie-bleue')).toBe(true);
    expect(m.item).toBe('baie-bleue');
    expect(s.bag['baie-bleue']).toBeUndefined();
    expect(giveHeld(s, m, 'gouter')).toBe(true);
    expect(m.item).toBe('gouter');
    expect(s.bag['baie-bleue']).toBe(1);
    expect(giveHeld(s, m, 'potion')).toBe(false);
    expect(takeHeld(s, m)).toBe('gouter');
    expect(m.item).toBeNull();
    expect(s.bag.gouter).toBe(1);
    expect(takeHeld(s, m)).toBeNull();
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
