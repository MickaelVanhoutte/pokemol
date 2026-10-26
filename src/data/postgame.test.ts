import { describe, expect, it } from 'vitest';
import { createMon, maxHp } from '../engine/pk/creature';
import { CREATURES } from './creatures';
import { ITEM_BY_ID } from './items';
import { MOVES } from './moves';
import { makeEgg } from '../state/daycare';
import { CONCOURS, hallEntry, TOWER_LEVEL, TOWER_POOL, TOWER_ROUND, TOWER_STOCK, TOWER_TEAM, towerCopy, towerFoe, towerPoints, towerRound } from './postgame';

const species = new Set(CREATURES.map((c) => c.id));
const moves = new Set(MOVES.map((m) => m.id));

describe('Grand Concours', () => {
  it('lines up four Grands Maîtres then the champion', () => {
    expect(CONCOURS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(CONCOURS.map((s) => s.trainer.id)).size).toBe(5);
    expect(CONCOURS.at(-1)!.trainer.party).toHaveLength(6);
    for (const s of CONCOURS) {
      for (const m of s.trainer.party) {
        expect(species.has(m.species), m.species).toBe(true);
        expect(m.level).toBeLessThanOrEqual(50);
        expect(m.level).toBeGreaterThanOrEqual(45);
        if (m.item) expect(ITEM_BY_ID[m.item], m.item).toBeDefined();
      }
    }
  });

  it('photographs the team for the Hall of Fame, eggs left out', () => {
    const st = { rng: 5 };
    const a = createMon('002', 50, st);
    a.nickname = 'Flamme';
    const e = hallEntry([a, makeEgg(a, a, st)], 123);
    expect(e).toEqual({ date: 123, team: [{ species: '002', nickname: 'Flamme', level: 50, shiny: a.shiny || undefined }] });
  });
});

describe('Tour des Défis', () => {
  it('builds three different Bestioles at level 50', () => {
    for (let seed = 1; seed < 60; seed++) {
      const foe = towerFoe(0, { rng: seed });
      expect(foe.party).toHaveLength(TOWER_TEAM);
      expect(new Set(foe.party.map((m) => m.species)).size).toBe(TOWER_TEAM);
      for (const m of foe.party) {
        expect(TOWER_POOL).toContain(m.species);
        expect(m.level).toBe(TOWER_LEVEL);
        expect(m.moves.length).toBeGreaterThan(0);
        for (const mv of m.moves) expect(moves.has(mv.id), mv.id).toBe(true);
      }
      expect(foe.name.fr.length).toBeGreaterThan(0);
      expect(foe.name.en.length).toBeGreaterThan(0);
    }
  });

  it('gets tougher: items and stencil moves later, never the same item twice', () => {
    let items = 0;
    for (let seed = 1; seed < 60; seed++) {
      const foe = towerFoe(TOWER_ROUND * 3, { rng: seed });
      const held = foe.party.flatMap((m) => (m.item ? [m.item] : []));
      expect(new Set(held).size).toBe(held.length);
      items += held.length;
    }
    expect(items).toBeGreaterThan(100);
    const sig = (seed: number) => towerFoe(3, { rng: seed }).party.map((m) => [m.species, m.item, m.moves.map((x) => x.id)]);
    expect(sig(9)).toEqual(sig(9));
  });

  it('fights with a full-health copy at level 50, the real one unchanged', () => {
    const m = createMon('012', 9, { rng: 2 });
    m.hp = 1;
    m.status = 'poison';
    const c = towerCopy(m);
    expect(c.level).toBe(50);
    expect(c.hp).toBe(maxHp(c));
    expect(c.status).toBeNull();
    expect(m.level).toBe(9);
    expect(m.hp).toBe(1);
  });

  it('counts rounds of seven and gives a bonus at the end of each', () => {
    expect([1, 7, 8, 14, 15].map(towerRound)).toEqual([1, 2, 2, 3, 3]);
    expect(towerPoints(1)).toBe(1);
    expect(towerPoints(6)).toBe(1);
    expect(towerPoints(7)).toBeGreaterThan(1);
    expect(towerPoints(14)).toBeGreaterThan(towerPoints(7));
  });

  it('only exchanges items that exist', () => {
    for (const id of Object.keys(TOWER_STOCK)) expect(ITEM_BY_ID[id], id).toBeDefined();
  });
});
