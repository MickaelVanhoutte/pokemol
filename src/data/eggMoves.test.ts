import { describe, expect, it } from 'vitest';
import { CREATURES, creature } from './creatures';
import { MOVE_BY_ID } from './moves';
import { EGG_MOVES } from './eggMoves';
import { TOWER_POOL, TOWER_TEAMS, towerFoe } from './postgame';
import { familyRoot, makeEgg } from '../state/daycare';
import { createMon, type Mon } from '../engine/pk/creature';

describe('egg moves', () => {
  it('are real moves a first form can’t learn by itself', () => {
    for (const [root, ids] of Object.entries(EGG_MOVES)) {
      expect(familyRoot(root), root).toBe(root);
      const family = CREATURES.filter((c) => familyRoot(c.id) === root);
      for (const id of ids) {
        expect(MOVE_BY_ID[id], `${root} ${id}`).toBeDefined();
        expect(family.some((c) => c.learnset.some(([, m]) => m === id)), `${root} already learns ${id}`).toBe(false);
      }
    }
  });

  it('come to the egg when a parent knows one, and a Red Ribbon hands down five strengths', () => {
    const root = Object.keys(EGG_MOVES).find((r) => creature(r).evolutions?.length)!;
    const egg = EGG_MOVES[root][0];
    const parent = (seed: number, patch: Partial<Mon> = {}): Mon => ({ ...createMon(root, 30, { rng: seed }), ...patch });
    const a = parent(1);
    a.moves = [{ id: egg, pp: 10 }, ...a.moves.slice(1)];
    const child = makeEgg(a, parent(2), { rng: 5 });
    expect(child.moves.map((s) => s.id)).toContain(egg);
    expect(child.moves.length).toBeLessThanOrEqual(4);
    // without it, no egg move
    expect(makeEgg(parent(3), parent(4), { rng: 5 }).moves.map((s) => s.id)).not.toContain(egg);
    // five IVs from the parents with the ribbon: parents with all-31 IVs, the egg then has at least five 31s
    const strong = (seed: number, item: string | null) => ({ ...parent(seed), item, ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 } });
    for (let seed = 1; seed < 30; seed++) {
      const e = makeEgg(strong(1, 'ruban-rouge'), strong(2, null), { rng: seed });
      expect(Object.values(e.ivs).filter((v) => v === 31).length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('themed tower teams', () => {
  it('use tower Bestioles, and come from the second round', () => {
    for (const t of TOWER_TEAMS) for (const sp of t.species) expect(TOWER_POOL, sp).toContain(sp);
    const names = Array.from({ length: 60 }, (_, seed) => towerFoe(7, { rng: seed + 1 }).name.fr);
    expect(names.some((n) => n.includes('équipe'))).toBe(true);
    const first = Array.from({ length: 60 }, (_, seed) => towerFoe(0, { rng: seed + 1 }).name.fr);
    expect(first.some((n) => n.includes('équipe'))).toBe(false);
    for (let seed = 1; seed < 40; seed++) for (const m of towerFoe(7, { rng: seed }).party) expect(m.level).toBe(50);
  });
});
