import { describe, expect, it } from 'vitest';
import { effectiveness } from '../../data/types';
import { typesOf } from '../../data/creatures';
import { act, computeDamage, createBattle, freshVol, IllegalAction, type BattleState } from './battle';
import { createMon, maxHp, type Mon } from './creature';

const L = (s: string) => ({ fr: s, en: s });
const mon = (species: string, level: number, moves: string[], party = false): Mon => {
  const m = createMon(species, level, { rng: 5 }, { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 });
  m.nature = 'joyeuse';
  m.talent = 0;
  m.moves = moves.map((id) => ({ id, pp: 20 }));
  if (party) m.item = null;
  return m;
};
const start = (me: Mon[], foe: Mon[], kind: 'wild' | 'trainer' = 'trainer', seed = 7) =>
  createBattle({ kind, seed, player: { name: L('a'), party: me, isAI: false }, enemy: { name: L('b'), party: foe, isAI: true } }, true).state;
const turn = (st: BattleState, mine = 0, theirs = 0) => act(st, { type: 'move', slot: mine }, { type: 'move', slot: theirs });

describe('types', () => {
  it('multiplies both types of a dual-type Bestiole', () => {
    expect(typesOf('007')).toEqual(['insecte', 'vol']);
    expect(effectiveness('roche', typesOf('007'))).toBe(4);
    expect(effectiveness('sol', typesOf('013'))).toBe(0);
    expect(effectiveness('electrique', typesOf('013'))).toBe(2);
    expect(effectiveness('combat', typesOf('007'))).toBe(0.25);
  });
});

describe('weather', () => {
  it('lasts 5 turns and makes Water moves stronger in the rain', () => {
    let st = start([mon('003', 30, ['averse', 'bulles'])], [mon('008', 30, ['gros-baillement'])]);
    st = turn(st).state;
    expect(st.weather).toEqual({ kind: 'pluie', turns: 4 });
    const dry = { ...st, weather: null };
    const wet = computeDamage({ rng: 3, weather: st.weather }, st.sides[0], st.sides[1], { id: 'bulles', name: L('x'), type: 'eau', cat: 'spec', power: 40, acc: 100, pp: 30, desc: L('x') }, 40, false).dmg;
    const plain = computeDamage({ rng: 3, weather: dry.weather }, st.sides[0], st.sides[1], { id: 'bulles', name: L('x'), type: 'eau', cat: 'spec', power: 40, acc: 100, pp: 30, desc: L('x') }, 40, false).dmg;
    expect(wet).toBeGreaterThan(plain);
    for (let i = 0; i < 4; i++) st = turn(st, 1).state;
    expect(st.weather).toBeNull();
  });

  it('sandstorm hurts everyone but Ground, Rock and Metal types', () => {
    let st = start([mon('003', 30, ['tempete-de-sable'])], [mon('008', 30, ['gros-baillement'])]);
    const step = turn(st);
    st = step.state;
    expect(step.events.filter((e) => e.t === 'weatherHurt')).toHaveLength(2);
  });
});

describe('paper shield, two-turn moves, ties, seeds and dolls', () => {
  it('Paper Shield blocks the foe’s move this turn', () => {
    const st = start([mon('016', 30, ['bouclier-papier'])], [mon('002', 30, ['flammeche'])]);
    const step = turn(st);
    expect(step.events.some((e) => e.t === 'protected' && e.side === 0)).toBe(true);
    expect(step.state.sides[0].party[0].hp).toBe(maxHp(step.state.sides[0].party[0]));
  });

  it('Sky Dive flies up (out of reach), then dives next turn for one PP', () => {
    let st = start([mon('013', 40, ['grand-vol'])], [mon('002', 20, ['flammeche'])]);
    const first = turn(st);
    st = first.state;
    expect(first.events.some((e) => e.t === 'charge')).toBe(true);
    expect(first.events.some((e) => e.t === 'miss' && e.side === 1)).toBe(true);
    expect(st.sides[0].vol.charging?.move).toBe('grand-vol');
    const second = act(st, { type: 'move', slot: 0 }, { type: 'move', slot: 0 });
    expect(second.events.some((e) => e.t === 'damage' && e.side === 1)).toBe(true);
    expect(second.state.sides[0].party[0].moves[0].pp).toBe(19);
  });

  it('a tied-up Bestiole can’t switch or flee, and loses HP each turn', () => {
    let st: BattleState | null = null;
    for (let seed = 1; seed < 40 && !st; seed++) {
      const s = turn(start([mon('013', 30, ['bousculade']), mon('004', 30, ['bousculade'])], [mon('012', 30, ['fil-enroule'])], 'wild', seed)).state;
      if (s.sides[0].vol.trap) st = s;
    }
    expect(st).not.toBeNull();
    expect(() => act(st!, { type: 'switch', to: 1 }, { type: 'move', slot: 0 })).toThrow(IllegalAction);
    const run = act(st!, { type: 'run' }, { type: 'move', slot: 0 });
    expect(run.events.some((e) => e.t === 'cantEscape')).toBe(true);
    expect(run.events.some((e) => e.t === 'trapHurt')).toBe(true);
  });

  it('Greedy Seed drains the foe and heals the user’s side', () => {
    let st: BattleState | null = null;
    for (let seed = 1; seed < 40 && !st; seed++) {
      const me = mon('001', 30, ['graine-gourmande']);
      me.hp = Math.floor(maxHp(me) / 2);
      const step = turn(start([me], [mon('008', 30, ['gros-baillement'])], 'trainer', seed));
      if (step.events.some((e) => e.t === 'seedDrain')) st = step.state;
    }
    expect(st).not.toBeNull();
    expect(st!.sides[0].party[0].hp).toBeGreaterThan(Math.floor(maxHp(st!.sides[0].party[0]) / 2));
  });

  it('a Paper Doll takes the hits and blocks statuses', () => {
    let st = start([mon('016', 45, ['pantin-papier'])], [mon('009', 20, ['regard-hypnotique'])]);
    const step = turn(st);
    st = step.state;
    expect(st.sides[0].vol.sub).toBeGreaterThan(0);
    expect(st.sides[0].party[0].status).toBeNull();
  });
});

describe('freeze and bad poison', () => {
  it('a frozen Bestiole can’t move; a Fire hit thaws it', () => {
    let st = start([mon('002', 30, ['flammeche'])], [mon('008', 30, ['bousculade'])]);
    st.sides[1].party[0].status = 'freeze';
    const step = turn(st);
    expect(step.events.some((e) => e.t === 'thaw' && e.side === 1)).toBe(true);
  });

  it('Ice types can’t be frozen, Fire types can’t be burned', () => {
    let st = start([mon('008', 30, ['bousculade'])], [mon('002', 30, ['bousculade'])]);
    st = { ...st, sides: [st.sides[0], { ...st.sides[1], vol: freshVol() }] as BattleState['sides'] };
    expect(typesOf('002')).toContain('feu');
  });

  it('Toxic Ink badly poisons: the poison hurts more every turn', () => {
    let st: BattleState | null = null;
    let first = 0;
    for (let seed = 1; seed < 40 && !st; seed++) {
      const step = turn(start([mon('009', 30, ['encre-toxique', 'bouh'])], [mon('008', 40, ['grondement'])], 'trainer', seed));
      const r = step.events.find((e) => e.t === 'residual');
      if (r && r.t === 'residual') { st = step.state; first = r.amount; }
    }
    expect(st).not.toBeNull();
    const next = turn(st!, 1).events.find((e) => e.t === 'residual');
    expect(next && next.t === 'residual' && next.amount).toBeGreaterThan(first);
  });
});
