import { describe, expect, it } from 'vitest';
import { createMon, maxHp } from '../engine/pk/creature';
import { CREATURES } from './creatures';
import { ITEM_BY_ID } from './items';
import { MOVES } from './moves';
import { TRAINERS, rivalFinalTeam } from './trainers';
import { makeEgg } from '../state/daycare';
import { CONCOURS, CONCOURS_MAX_LEVEL, MASTER_REMATCH, REMATCH_MAX_LEVEL, RIVAL_MAX_LEVEL, rivalPostTeam, concoursStage, fullyGrown, hallEntry, masterRematchParty, TOWER_LEVEL, TOWER_POOL, TOWER_ROUND, TOWER_STOCK, TOWER_TEAM, towerCopy, towerFoe, towerPoints, towerRound } from './postgame';

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
        // above the story's finale (around L45, iteration 16)
        expect(m.level).toBeLessThanOrEqual(58);
        expect(m.level).toBeGreaterThanOrEqual(50);
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

describe('the Concours grows with you', () => {
  it('is the written Concours the first time', () => {
    for (const st of CONCOURS) expect(concoursStage(st.n, 0)).toBe(st);
  });

  it('gets stronger with every win, fully grown, with a sixth Bestiole from the second win, never past the cap', () => {
    for (const st of CONCOURS) {
      let prev = 0;
      for (let wins = 1; wins <= 12; wins++) {
        const party = concoursStage(st.n, wins).trainer.party;
        for (const m of party) {
          expect(species.has(m.species), `${st.trainer.id} ${m.species}`).toBe(true);
          expect(m.level).toBeLessThanOrEqual(CONCOURS_MAX_LEVEL);
          // fully grown: nothing left to evolve into but a story form
          expect(fullyGrown(m.species, m.level), `${st.trainer.id} ${m.species}`).toBe(m.species);
        }
        const top = Math.max(...party.map((m) => m.level));
        expect(top).toBeGreaterThanOrEqual(prev);
        prev = top;
        if (st.n < 5 && wins >= 2) expect(party).toHaveLength(6);
      }
    }
  });

  it('turns between two other teams from the third win, the ace always last', () => {
    const a = concoursStage(1, 3).trainer.party.map((m) => m.species);
    const b = concoursStage(1, 4).trainer.party.map((m) => m.species);
    expect(a).not.toEqual(b);
    expect(a.at(-1)).toBe(b.at(-1));
  });

  it('the Prof redraws your last Hall of Fame team from the fourth win', () => {
    const hall = [{ date: 1, team: [{ species: '001', level: 60 }, { species: '000', level: 60 }, { species: '013', level: 60 }] }];
    expect(concoursStage(5, 3, hall).trainer.party.map((m) => m.species)).toContain('024');
    const mirror = concoursStage(5, 4, hall).trainer.party.map((m) => m.species);
    // grown, the player's own drawing left out
    expect(mirror).toEqual([fullyGrown('001', 61), fullyGrown('013', 61)]);
  });
});

describe('Atelier Masters’ rematches', () => {
  it('every Master has six Bestioles of her own, fully grown, her ace last and strongest', () => {
    const masters = Object.values(TRAINERS).filter((t) => t.badge);
    expect(Object.keys(MASTER_REMATCH).sort()).toEqual(masters.map((t) => t.id).sort());
    for (const t of masters) {
      for (const times of [0, 1, 3, 9]) {
        const party = masterRematchParty(t, times, 44);
        expect(party).toHaveLength(6);
        expect(new Set(party.map((m) => m.species)).size, t.id).toBe(6);
        const ace = party.at(-1)!;
        for (const m of party) {
          expect(species.has(m.species)).toBe(true);
          expect(fullyGrown(m.species, m.level)).toBe(m.species);
          expect(m.level).toBeLessThanOrEqual(ace.level);
        }
        expect(ace.level).toBeLessThanOrEqual(REMATCH_MAX_LEVEL);
      }
    }
  });

  it('starts at your team’s level (at least L45) and grows by two per rematch won', () => {
    const t = TRAINERS.mireille;
    expect(masterRematchParty(t, 0, 30).at(-1)!.level).toBe(45);
    expect(masterRematchParty(t, 0, 50).at(-1)!.level).toBe(50);
    expect(masterRematchParty(t, 2, 50).at(-1)!.level).toBe(54);
    expect(masterRematchParty(t, 40, 100).at(-1)!.level).toBe(REMATCH_MAX_LEVEL);
  });
});

describe('the rival after the story', () => {
  it('brings his finale team fully grown, ten levels up, two more per win, never past the cap', () => {
    for (const starter of ['001', '002', '003']) {
      for (const choice of [undefined, 'a', 'b'] as const) {
        let prev = 0;
        for (const wins of [0, 1, 4, 10, 30]) {
          const team = rivalPostTeam(starter, wins, choice);
          expect(team).toHaveLength(6);
          for (const m of team) {
            expect(species.has(m.species)).toBe(true);
            expect(fullyGrown(m.species, m.level)).toBe(m.species);
            expect(m.level).toBeLessThanOrEqual(RIVAL_MAX_LEVEL);
          }
          const top = Math.max(...team.map((m) => m.level));
          expect(top).toBeGreaterThanOrEqual(prev);
          prev = top;
        }
      }
    }
    // his starter's line stays his ace
    expect(rivalPostTeam('002', 0).at(-1)!.species).toBe(fullyGrown('002', 60));
  });

  it('trained (choice 5 « entraîne-toi »), two of his Bestioles are stronger and hold an item', () => {
    const plain = rivalFinalTeam('001');
    const trained = rivalFinalTeam('001', 'a');
    expect(trained.filter((m, i) => m.level > plain[i].level && m.item)).toHaveLength(2);
    expect(rivalFinalTeam('001', 'b')).toEqual(plain);
  });
});
