import { describe, expect, it } from 'vitest';
import { CREATURES, dexNo } from '../../data/creatures';
import { HIDDEN_TALENT_CHANCE, TALENTS, talent, talentOf, talentFromUid } from '../../data/talents';
import { partyOf } from '../../data/trainers';
import { move } from '../../data/moves';
import { act, computeDamage, createBattle, effectiveStat, freshVol, moveEffectiveness, stabOf, talentPowerMult, type BattleState } from './battle';
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
  it('keeps every evolution family together, each form after the one it comes from', () => {
    const index = (id: string) => CREATURES.findIndex((c) => c.id === id);
    const root = (id: string): string => {
      const from = CREATURES.find((c) => c.id === id)?.evolvesFrom;
      return from ? root(from) : id;
    };
    for (const c of CREATURES) {
      for (const r of c.evolutions ?? []) {
        expect(index(r.to), `${c.id} → ${r.to}`).toBeGreaterThan(index(c.id));
        expect(CREATURES.find((x) => x.id === r.to)?.evolvesFrom, r.to).toBe(c.id);
      }
      // everything between a family's first and last member belongs to that family
      const fam = CREATURES.filter((x) => root(x.id) === root(c.id)).map((x) => index(x.id));
      for (let i = Math.min(...fam); i <= Math.max(...fam); i++) expect(root(CREATURES[i].id), c.id).toBe(root(c.id));
    }
    expect(dexNo('012')).toBe('010');
    expect(dexNo('007')).toBe('012');
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
    for (const c of CREATURES) {
      for (const r of c.evolutions ?? []) expect(CREATURES.find((x) => x.id === r.to)!.talents.length, c.id).toBe(c.talents.length);
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
    const { state, events } = battle(mon('013', 15, 0), mon('050', 15, 0));
    expect(talentOf(state.sides[1].party[0]).id).toBe('regard-noir');
    expect(events.some((e) => e.t === 'talent' && e.side === 1)).toBe(true);
    expect(state.sides[0].vol.stages.atk).toBe(-1);
  });

  it('Sponge turns a Water move into healing', () => {
    const me = mon('003', 20, 0, ['bulles']);
    const foe = mon('017', 20, 2);
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
    const foe = mon('032', 20, 2);
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
    const low = mon('001', 20, 2, ['coup-de-liane']);
    const full = structuredClone(low);
    low.hp = Math.floor(maxHp(low) / 4);
    const foe = mon('013', 20, 0);
    const side = (m: Mon) => ({ name: L('x'), party: [m], active: 0, isAI: false, vol: freshVol(), guard: 0 });
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

describe('family powers (docs/bestioles.md)', () => {
  const side = (m: Mon) => ({ name: L('x'), party: [m], active: 0, isAI: false, vol: freshVol(), guard: 0 });
  const hit = (me: Mon, foe: Mon, id: string, tweak?: (d: ReturnType<typeof side>) => void) => {
    const d = side(foe);
    tweak?.(d);
    return computeDamage({ rng: 9 }, side(me), d, move(id), move(id).power, false).dmg;
  };
  const growl = { type: 'move', slot: 0 } as const;

  it('Jardin Secret heals a little each turn, more in sunshine', () => {
    const me = mon('001', 20, 0, ['grondement']);
    me.hp = 10;
    const { state } = act(battle(me, mon('013', 20, 0, ['grondement'])).state, growl, growl);
    expect(state.sides[0].party[0].hp).toBe(10 + Math.floor(maxHp(me) / 16));
    const sunny = battle(structuredClone(me), mon('013', 20, 0, ['grondement'])).state;
    sunny.weather = { kind: 'soleil', turns: 5 };
    expect(act(sunny, growl, growl).state.sides[0].party[0].hp).toBe(10 + Math.floor(maxHp(me) / 8));
  });

  it('Feu de Joie raises Sp. Atk after a knockout', () => {
    const st = createBattle({ kind: 'trainer', seed: 4, player: { name: L('a'), party: [mon('002', 50, 0, ['flammeche'])], isAI: false },
      enemy: { name: L('b'), party: [mon('013', 3, 0), mon('013', 3, 0)], isAI: true } }).state;
    expect(act(st, growl, growl).state.sides[0].vol.stages.spa).toBe(1);
  });

  it('Carapace Pleine halves damage at full HP only', () => {
    const full = mon('003', 20, 0), hurt = mon('003', 20, 0);
    hurt.hp -= 1;
    const me = mon('013', 20, 0);
    expect(hit(me, full, 'bousculade')).toBeLessThan(hit(me, hurt, 'bousculade') * 0.6);
  });

  it('Ailes Prisme halves super-effective hits, and its status moves never miss', () => {
    const me = mon('002', 20, 0);
    expect(hit(me, mon('012', 20, 0), 'flammeche')).toBeLessThan(hit(me, mon('012', 20, 2), 'flammeche') * 0.6);
    const misses = (slot: 0 | 2) => {
      let n = 0;
      for (let seed = 1; seed < 30; seed++) {
        const st = battle(mon('012', 20, slot, ['poudre-dodo']), mon('008', 20, 2, ['grondement']), 'trainer', seed).state;
        st.sides[1].vol.stages.eva = 6;
        n += act(st, growl, growl).events.filter((e) => e.t === 'miss' && e.side === 0).length;
      }
      return n;
    };
    expect(misses(0)).toBe(0);
    expect(misses(2)).toBeGreaterThan(10);
  });

  it('Premier Envol makes its Flying moves go first at full HP', () => {
    const order = (hp: 'full' | 'hurt') => {
      const me = mon('013', 5, 0, ['rafale']);
      if (hp === 'hurt') me.hp -= 1;
      const { events } = act(battle(me, mon('041', 50, 0, ['grondement'])).state, growl, growl);
      return events.find((e) => e.t === 'move')?.side;
    };
    expect(order('full')).toBe(0);
    expect(order('hurt')).toBe(1);
  });

  it('Foudre Têtue hits Ground types with Electric moves', () => {
    expect(moveEffectiveness(mon('004', 20, 0), move('petite-etincelle'), mon('031', 20, 0))).toBe(1);
    expect(moveEffectiveness(mon('004', 20, 2), move('petite-etincelle'), mon('031', 20, 0))).toBe(0);
  });

  it('Pleine Lune raises Sp. Atk and Sp. Def at night', () => {
    const s = side(mon('006', 30, 0));
    expect(effectiveStat(s, 'spa', undefined, true)).toBe(Math.floor(effectiveStat(s, 'spa') * 1.3));
    expect(effectiveStat(s, 'atk', undefined, true)).toBe(effectiveStat(s, 'atk'));
    const other = side(mon('006', 30, 2));
    expect(effectiveStat(other, 'spd', undefined, true)).toBe(effectiveStat(other, 'spd'));
  });

  it('Gros Dodo halves damage and heals while asleep', () => {
    const me = mon('013', 30, 0);
    const awake = mon('008', 30, 0), asleep = mon('008', 30, 0);
    asleep.status = 'sleep';
    expect(hit(me, asleep, 'bousculade')).toBeLessThan(hit(me, awake, 'bousculade') * 0.6);
    const napper = mon('008', 30, 0, ['grondement']);
    napper.status = 'sleep';
    napper.sleepTurns = 3;
    napper.hp = 20;
    const { state } = act(battle(napper, mon('013', 30, 0, ['grondement'])).state, growl, growl);
    expect(state.sides[0].party[0].hp).toBe(20 + Math.floor(maxHp(napper) / 8));
  });

  it('Mauvais Rêves hurts a sleeping foe each turn, and only a sleeping one', () => {
    const moth = mon('072', 45, 0, ['grondement']);
    const sleeper = mon('008', 30, 2, ['grondement']);
    sleeper.status = 'sleep';
    sleeper.sleepTurns = 4;
    const run = act(battle(moth, sleeper).state, growl, growl);
    expect(run.events.some((e) => e.t === 'nightmare' && e.side === 1)).toBe(true);
    expect(run.state.sides[1].party[0].hp).toBe(maxHp(sleeper) - Math.floor(maxHp(sleeper) / 8));
    const awake = act(battle(moth, mon('008', 30, 2, ['grondement'])).state, growl, growl);
    expect(awake.events.some((e) => e.t === 'nightmare')).toBe(false);
  });

  it('Passe-Muraille halves the first attack after it comes in', () => {
    const me = mon('002', 30, 0, ['flammeche']);
    const ghost = mon('009', 30, 0, ['grondement']);
    expect(hit(me, ghost, 'flammeche', (d) => (d.vol.phase = true))).toBeLessThan(hit(me, ghost, 'flammeche') * 0.6);
    const s0 = battle(me, ghost).state;
    expect(s0.sides[1].vol.phase).toBe(true);
    const { state, events } = act(s0, growl, growl);
    expect(events.some((e) => e.t === 'talent' && e.note === 'phased')).toBe(true);
    expect(state.sides[1].vol.phase).toBe(false);
  });

  it('Arc-en-ciel gives every move the same-type bonus', () => {
    expect(stabOf(mon('014', 20, 0), move('flammeche'))).toBe(1.5);
    expect(stabOf(mon('014', 20, 2), move('flammeche'))).toBe(1);
  });

  it('Fourrure Douce halves physical damage', () => {
    const me = mon('013', 20, 0);
    expect(hit(me, mon('016', 20, 0), 'bousculade')).toBeLessThan(hit(me, mon('016', 20, 2), 'bousculade') * 0.6);
  });

  it('Poings d’Acier and Ciseaux Affûtés boost punches and cuts', () => {
    expect(talentPowerMult(mon('029', 20, 0), move('poing-crayon'))).toBe(1.3);
    expect(talentPowerMult(mon('029', 20, 0), move('bousculade'))).toBe(1);
    expect(talentPowerMult(mon('048', 20, 0), move('coup-de-ciseaux'))).toBe(1.5);
    expect(talentPowerMult(mon('048', 20, 2), move('coup-de-ciseaux'))).toBe(1);
  });

  it('Peau de Mousse halves Water and Grass', () => {
    const me = mon('003', 20, 0);
    expect(hit(me, mon('030', 20, 0), 'bulles')).toBeLessThan(hit(me, mon('030', 20, 2), 'bulles') * 0.6);
  });

  it('Patinoire and Perle de Pluie change the weather as they come in', () => {
    expect(battle(mon('013', 20, 0), mon('032', 20, 0)).state.weather?.kind).toBe('grele');
    expect(battle(mon('013', 20, 0), mon('034', 20, 0)).state.weather?.kind).toBe('pluie');
    expect(battle(mon('013', 20, 0), mon('034', 20, 2)).state.weather).toBeFalsy();
  });

  it('Venin Frais may poison with its physical hits', () => {
    const poisoned = (slot: 0 | 2) => {
      let n = 0;
      for (let seed = 1; seed < 30; seed++) {
        const st = battle(mon('033', 20, slot, ['bousculade']), mon('008', 40, 2, ['grondement']), 'trainer', seed).state;
        if (act(st, growl, growl).state.sides[1].party[0].status === 'poison') n++;
      }
      return n;
    };
    expect(poisoned(0)).toBeGreaterThan(3);
    expect(poisoned(2)).toBe(0);
  });

  it('Bébé Poche hits a second time', () => {
    const { events } = act(battle(mon('049', 20, 0, ['bousculade']), mon('008', 40, 2, ['grondement'])).state, growl, growl);
    expect(events).toContainEqual({ t: 'hits', count: 2 });
  });
});
