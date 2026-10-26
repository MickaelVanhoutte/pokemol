import { describe, expect, it } from 'vitest';
import { CREATURES, dexNo } from '../../data/creatures';
import { HIDDEN_TALENT_CHANCE, TALENTS, talent, talentOf, talentFromUid } from '../../data/talents';
import { partyOf } from '../../data/trainers';
import { act, computeDamage, createBattle, type BattleState } from './battle';
import { createMon, maxHp, type Mon } from './creature';

const L = (s: string) => ({ fr: s, en: s });
const mon = (species: string, level: number, slot: 0 | 1 | 2, moves?: string[]): Mon => {
  const m = createMon(species, level, { rng: 5 }, { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 });
  m.talent = slot;
  m.nature = 'joyeuse';
  if (moves) m.moves = moves.map((id) => ({ id, pp: 20 }));
  return m;
};
const battle = (me: Mon, foe: Mon, kind: 'wild' | 'trainer' = 'trainer', seed = 11) =>
  createBattle({ kind, seed, player: { name: L('a'), party: [me], isAI: false }, enemy: { name: L('b'), party: [foe], isAI: true } });

describe('Bestiodex order', () => {
  it('keeps every evolution line together, in order', () => {
    CREATURES.forEach((c, i) => {
      if (c.evolvesTo) expect(CREATURES[i + 1]?.id, `${c.id} → ${c.evolvesTo}`).toBe(c.evolvesTo);
    });
    expect(dexNo('012')).toBe('004');
    expect(dexNo('007')).toBe('006');
  });
});

describe('talents data', () => {
  it('gives every species one or two talents and a hidden one, all known', () => {
    for (const c of CREATURES) {
      expect(c.talents.length, c.id).toBeGreaterThanOrEqual(1);
      for (const id of [...c.talents, c.hiddenTalent]) expect(() => talent(id), `${c.id} ${id}`).not.toThrow();
    }
    expect(new Set(TALENTS.map((t) => t.id)).size).toBe(TALENTS.length);
  });

  it('keeps the talent slot through evolution', () => {
    for (const c of CREATURES.filter((x) => x.evolvesTo)) {
      const next = CREATURES.find((x) => x.id === c.evolvesTo)!;
      expect(next.talents.length, c.id).toBe(c.talents.length);
    }
  });

  it('gives about one Bestiole in four its hidden talent', () => {
    const st = { rng: 42 };
    const n = 4000;
    let hidden = 0;
    for (let i = 0; i < n; i++) if (createMon('013', 5, st).talent === 2) hidden++;
    expect(Math.abs(hidden / n - HIDDEN_TALENT_CHANCE)).toBeLessThan(0.03);
    expect([0, 1, 2]).toContain(talentFromUid('abc'));
  });

  it('gives trainers their first regular talent', () => {
    expect(partyOf([{ species: '009', level: 20 }], 3).every((m) => m.talent === 0)).toBe(true);
  });
});

describe('talents in battle', () => {
  it('Stink Eye lowers the foe’s Attack as it arrives', () => {
    const { state, events } = battle(mon('013', 15, 0), mon('009', 15, 0));
    expect(talentOf(state.sides[1].party[0]).id).toBe('regard-noir');
    expect(events.some((e) => e.t === 'talent' && e.side === 1)).toBe(true);
    expect(state.sides[0].vol.stages.atk).toBe(-1);
  });

  it('Sponge turns a Water move into healing', () => {
    const me = mon('003', 20, 0, ['bulles']);
    const foe = mon('003', 20, 2);
    foe.hp = 10;
    const s0 = battle(me, foe).state;
    const { state, events } = act(s0, { type: 'move', slot: 0 }, { type: 'move', slot: 0 });
    expect(events.some((e) => e.t === 'talent' && e.talent === 'eponge')).toBe(true);
    expect(state.sides[1].party[0].hp).toBeGreaterThan(10);
  });

  it('Unbreakable leaves 1 HP after a knockout blow from full HP', () => {
    const me = mon('002', 50, 0, ['flammeche']);
    const foe = mon('008', 5, 2);
    const { state, events } = act(battle(me, foe).state, { type: 'move', slot: 0 }, { type: 'move', slot: 0 });
    const f = state.sides[1].party[0];
    // Padding would halve Fire; the hidden talent is Unbreakable
    expect(talentOf(f).id).toBe('increvable');
    expect(f.hp).toBe(1);
    expect(events.some((e) => e.t === 'talent' && e.note === 'endure')).toBe(true);
  });

  it('Bendy can’t be paralysed by a status move', () => {
    const me = mon('007', 20, 1, ['poudre-piquante']);
    const foe = mon('006', 20, 1);
    let st: BattleState = battle(me, foe, 'trainer', 3).state;
    let blocked = 0;
    for (let i = 0; i < 6 && !st.result; i++) {
      const step = act(st, { type: 'move', slot: 0 }, { type: 'move', slot: 0 });
      blocked += step.events.filter((e) => e.t === 'talent' && e.talent === 'souple' && e.note === 'immune').length;
      st = step.state;
    }
    expect(st.sides[1].party[0].status).not.toBe('paralyze');
    expect(blocked).toBeGreaterThan(0);
  });

  it('Wild Sap makes Grass moves stronger at low HP', () => {
    const low = mon('001', 20, 0, ['coup-de-liane']);
    const full = structuredClone(low);
    low.hp = Math.floor(maxHp(low) / 4);
    const foe = mon('013', 20, 0);
    const side = (m: Mon) => ({ name: L('x'), party: [m], active: 0, isAI: false, vol: { stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, confusion: 0, flinch: false, focus: false, lock: null }, guard: 0 });
    const hit = (m: Mon) => computeDamage({ rng: 9 }, side(m), side(foe), { id: 'coup-de-liane', name: L('x'), type: 'plante', cat: 'phys', power: 45, acc: 100, pp: 25, desc: L('x') }, 45, false).dmg;
    expect(hit(low)).toBeGreaterThan(hit(full));
  });

  it('Light Feet always gets away from wild Bestioles', () => {
    for (let seed = 1; seed < 20; seed++) {
      const me = mon('012', 3, 2);
      const foe = mon('008', 40, 0);
      const { state } = act(battle(me, foe, 'wild', seed).state, { type: 'run' }, { type: 'move', slot: 0 });
      expect(state.result).toBe('flee');
    }
  });
});
