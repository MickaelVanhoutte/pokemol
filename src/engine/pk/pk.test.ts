import { describe, expect, it } from 'vitest';
import { CREATURES } from '../../data/creatures';
import { MOVES } from '../../data/moves';
import { effectiveness } from '../../data/types';
import { L } from '../../i18n';
import { aiChoose } from './ai';
import { act, activeMon, catchChance, computeDamage, createBattle, IllegalAction, usableSlots, type Action, type BattleState } from './battle';
import { addXp, calcStat, createMon, evolutionOf, evolve, maxHp, movesAt, xpAt, type Mon } from './creature';

const IV0 = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const mon = (species: string, level: number, seed = 1, patch: Partial<Mon> = {}) => ({ ...createMon(species, level, { rng: seed }, IV0), ...patch });

function battle(player: Mon[], enemy: Mon[], kind: 'wild' | 'trainer' = 'trainer', seed = 5) {
  return createBattle({
    kind, seed,
    player: { name: L('Moi', 'Me'), party: player, isAI: false },
    enemy: { name: L('Eux', 'Them'), party: enemy, isAI: true },
  }).state;
}

const slotOf = (m: Mon, id: string) => m.moves.findIndex((s) => s.id === id);

describe('data', () => {
  it('every learnset move exists and every species is complete', () => {
    const ids = new Set(MOVES.map((m) => m.id));
    for (const c of CREATURES) {
      for (const [, mv] of c.learnset) expect(ids.has(mv), `${c.id} ${mv}`).toBe(true);
      expect(c.learnset.some(([l]) => l === 1)).toBe(true);
    }
  });

  it('type chart', () => {
    expect(effectiveness('feu', 'plante')).toBe(2);
    expect(effectiveness('eau', 'feu')).toBe(2);
    expect(effectiveness('plante', 'eau')).toBe(2);
    expect(effectiveness('normal', 'spectre')).toBe(0);
    expect(effectiveness('spectre', 'normal')).toBe(0);
    expect(effectiveness('feu', 'eau')).toBe(0.5);
    expect(effectiveness('fee', 'combat')).toBe(2);
  });
});

describe('creatures', () => {
  it('computes Gen 3 stats', () => {
    expect(calcStat('hp', 50, 0, 5)).toBe(20);
    expect(calcStat('atk', 52, 31, 50)).toBe(Math.floor(((104 + 31) * 50) / 100) + 5);
    expect(maxHp(mon('001', 5))).toBe(20);
  });

  it('knows the last four level-up moves', () => {
    expect(movesAt('009', 13)).toEqual(['langue-fantome', 'coup-en-douce', 'regard-hypnotique', 'grimace']);
    expect(movesAt('001', 1)).toEqual(['griffe', 'grondement']);
    expect(movesAt('001', 5)).toEqual(['griffe', 'grondement', 'coup-de-liane']);
  });

  it('levels up, learns moves and keeps missing HP', () => {
    const m = mon('001', 9);
    m.hp -= 5;
    const before = maxHp(m) - m.hp;
    const ups = addXp(m, xpAt(10) - m.xp);
    expect(m.level).toBe(10);
    expect(ups[0].learned).toEqual(['griffe-pousse']);
    expect(maxHp(m) - m.hp).toBe(before);
  });

  it('asks before replacing a move when four are known', () => {
    const m = mon('009', 13);
    expect(m.moves).toHaveLength(4);
    const ups = addXp(m, xpAt(18) - m.xp);
    expect(ups.flatMap((u) => u.pending)).toContain('cauchemar');
    expect(m.moves).toHaveLength(4);
  });

  it('evolves at the right level', () => {
    const m = mon('009', 16);
    expect(evolutionOf(m)).toBe('010');
    evolve(m, '010');
    expect(m.species).toBe('010');
    expect(evolutionOf(mon('009', 15))).toBeNull();
  });
});

describe('battle', () => {
  it('damage stays within the formula range', () => {
    const st = battle([mon('002', 10)], [mon('001', 10)]);
    const fire = MOVES.find((m) => m.id === 'flammeche')!;
    for (let i = 0; i < 50; i++) {
      const { dmg, eff } = computeDamage({ rng: i }, st.sides[0], st.sides[1], fire, 40, false);
      expect(eff).toBe(2);
      expect(dmg).toBeGreaterThan(0);
      expect(dmg).toBeLessThan(40);
    }
  });

  it('a move hurts the foe and costs PP', () => {
    const me = mon('002', 10);
    const st = battle([me], [mon('001', 10)]);
    const slot = slotOf(me, 'flammeche');
    const r = act(st, { type: 'move', slot }, aiChoose(st));
    expect(activeMon(r.state.sides[1]).hp).toBeLessThan(maxHp(activeMon(r.state.sides[1])));
    expect(activeMon(r.state.sides[0]).moves[slot].pp).toBe(activeMon(st.sides[0]).moves[slot].pp - 1);
  });

  it('normal moves do nothing to ghosts', () => {
    const me = mon('008', 10);
    const st = battle([me], [mon('009', 10)]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'bousculade') }, { type: 'move', slot: 0 });
    expect(r.events.some((e) => e.t === 'noEffect')).toBe(true);
  });

  it('knocking out the last foe wins and gives XP', () => {
    const me = mon('002', 20);
    const foe = mon('001', 3);
    const st = battle([me], [foe]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'flammeche') }, { type: 'move', slot: 0 });
    expect(r.state.result).toBe('win');
    expect(r.events.some((e) => e.t === 'xp')).toBe(true);
    expect(activeMon(r.state.sides[0]).xp).toBeGreaterThan(me.xp);
  });

  it('asks for a replacement after a faint', () => {
    const weak = mon('001', 3);
    const st = battle([weak, mon('003', 10)], [mon('002', 25)]);
    const r = act(st, { type: 'move', slot: 0 }, { type: 'move', slot: slotOf(st.sides[1].party[0], 'flammeche') });
    expect(r.state.needSwitch).toBe(true);
    expect(() => act(r.state, { type: 'move', slot: 0 }, { type: 'move', slot: 0 })).toThrow(IllegalAction);
    const r2 = act(r.state, { type: 'replace', to: 1 }, { type: 'move', slot: 0 });
    expect(r2.state.sides[0].active).toBe(1);
  });

  it('wild creatures are easier to catch when weak or asleep', () => {
    const full = mon('004', 5);
    const weak = { ...mon('004', 5), hp: 1 };
    const sleepy = { ...weak, status: 'sleep' as const };
    expect(catchChance(weak, 1).p).toBeGreaterThan(catchChance(full, 1).p);
    expect(catchChance(sleepy, 1).p).toBeGreaterThanOrEqual(catchChance(weak, 1).p);
    expect(catchChance(mon('008', 20), 1).p).toBeLessThan(catchChance(full, 1).p);
  });

  it('cannot run from or catch in trainer battles', () => {
    const st = battle([mon('001', 5)], [mon('002', 5)]);
    const r = act(st, { type: 'run' }, { type: 'move', slot: 0 });
    expect(r.events.some((e) => e.t === 'cantRun')).toBe(true);
    expect(r.state.result).toBeNull();
    const r2 = act(st, { type: 'ball', item: 'crayon-ball' }, { type: 'move', slot: 0 });
    expect(r2.events.some((e) => e.t === 'blocked')).toBe(true);
  });

  it('uses Struggle only when no PP is left', () => {
    const me = mon('001', 5);
    me.moves.forEach((s) => (s.pp = 0));
    const st = battle([me], [mon('002', 5)]);
    expect(() => act(battle([mon('001', 5)], [mon('002', 5)]), { type: 'move', slot: -1 }, { type: 'move', slot: 0 })).toThrow(IllegalAction);
    const r = act(st, { type: 'move', slot: -1 }, { type: 'move', slot: 0 });
    expect(r.events.some((e) => e.t === 'move' && e.side === 0 && e.move === 'lutte')).toBe(true);
  });

  it('potions heal the chosen creature and use the turn', () => {
    const me = mon('001', 10);
    me.hp = 5;
    const st = battle([me], [mon('002', 5)]);
    const r = act(st, { type: 'item', item: 'potion', target: 0 }, { type: 'move', slot: 0 });
    expect(r.events[0]).toMatchObject({ t: 'useItem', amount: 20 });
  });

  it('learn prompts block the battle until answered', () => {
    const me = mon('009', 17);
    me.xp = 18 ** 3 - 1;
    const st = battle([me], [mon('004', 3)]);
    const r = act(st, { type: 'move', slot: slotOf(me, 'langue-fantome') }, { type: 'move', slot: 0 });
    expect(r.state.learnQueue[0]).toMatchObject({ move: 'cauchemar' });
    const r2 = act(r.state, { type: 'learn', forget: 0 }, { type: 'move', slot: 0 });
    expect(activeMon(r2.state.sides[0]).moves[0].id).toBe('cauchemar');
    expect(r2.state.learnQueue).toHaveLength(0);
  });

  it('AI vs AI battles always end', () => {
    const ids = CREATURES.map((c) => c.id);
    for (let seed = 1; seed <= 200; seed++) {
      const party = (k: number, n: number) => Array.from({ length: n }, (_, i) => createMon(ids[(seed * 3 + i * 5 + k) % ids.length], 3 + ((seed + i) % 30), { rng: seed * 31 + i + k }));
      let st: BattleState = battle(party(0, 1 + (seed % 4)), party(7, 1 + ((seed + 2) % 4)), seed % 3 ? 'trainer' : 'wild', seed);
      let turns = 0;
      while (!st.result && turns++ < 400) {
        let a: Action;
        if (st.learnQueue.length) a = { type: 'learn', forget: seed % 2 ? 0 : null };
        else if (st.needSwitch) a = { type: 'replace', to: st.sides[0].party.findIndex((m) => m.hp > 0) };
        else {
          const slots = usableSlots(activeMon(st.sides[0]));
          a = { type: 'move', slot: slots.length ? slots[turns % slots.length] : -1 };
        }
        st = act(st, a, aiChoose(st)).state;
      }
      expect(st.result, `seed ${seed}`).not.toBeNull();
    }
  });
});
