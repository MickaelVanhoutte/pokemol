import { describe, expect, it } from 'vitest';
import { CREATURES } from '../../data/creatures';
import { FAIR_COPY, monTypes } from '../../data/fairCopies';
import { talentOf } from '../../data/talents';
import { fairAce, aiChoose } from './ai';
import { act, canFairCopy, createBattle, IllegalAction, type BattleState, type SideSetup } from './battle';
import { createMon, maxHp, statsOf, type Mon } from './creature';

const L = (s: string) => ({ fr: s, en: s });
const mon = (species: string, level: number, moves = ['griffe']): Mon => {
  const m = createMon(species, level, { rng: 5 }, { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 });
  m.nature = 'joyeuse';
  m.talent = 0;
  m.item = null;
  m.moves = moves.map((id) => ({ id, pp: 20 }));
  return m;
};
const start = (me: Mon[], foe: Mon[], pens: { me?: SideSetup['fairCopy']; foe?: SideSetup['fairCopy'] } = { me: 'light' }, seed = 7) =>
  createBattle({
    kind: 'trainer', seed,
    player: { name: L('a'), party: me, isAI: false, fairCopy: pens.me },
    enemy: { name: L('b'), party: foe, isAI: true, fairCopy: pens.foe },
  }, true).state;
const move = (slot = 0, fair = false) => ({ type: 'move' as const, slot, ...(fair ? { fair: true } : {}) });

describe('fair copies (« mise au propre »)', () => {
  it('needs the Feutre and a final form that has one', () => {
    expect(canFairCopy(start([mon('018', 30)], [mon('001', 30)], {}), 0)).toBe(false);
    expect(canFairCopy(start([mon('016', 30)], [mon('001', 30)]), 0)).toBe(false);
    const st = start([mon('018', 30)], [mon('001', 30)]);
    expect(canFairCopy(st, 0)).toBe(true);
    expect(() => act(start([mon('016', 30)], [mon('001', 30)]), move(0, true), move())).toThrow(IllegalAction);
  });

  it('transforms before anyone moves: stats up but HP, its new type, once per battle', () => {
    const st = start([mon('025', 40)], [mon('001', 30)]);
    const before = statsOf(st.sides[0].party[0]);
    const step = act(st, move(0, true), move());
    const first = step.events.findIndex((e) => e.t === 'fairCopy');
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(step.events.findIndex((e) => e.t === 'move'));
    const m = step.state.sides[0].party[0];
    expect(m.fair).toBe(true);
    expect(maxHp(m)).toBe(before.hp);
    expect(statsOf(m).atk).toBeGreaterThan(before.atk);
    expect(monTypes(m)).toEqual(['feu', 'dragon']);
    expect(canFairCopy(step.state, 0)).toBe(false);
    expect(() => act(step.state, move(0, true), move())).toThrow(IllegalAction);
  });

  it('counts its new Speed on the turn it transforms', () => {
    const me = mon('023', 50);
    const slow = statsOf(me).spe, fast = statsOf({ ...me, fair: true }).spe;
    // a foe faster than the pencil Tortorrent, slower than its fair copy
    const foe = CREATURES.map((c) => mon(c.id, 50)).find((f) => statsOf(f).spe > slow && statsOf(f).spe < fast)!;
    const firstMover = (fair: boolean) => {
      const e = act(start([mon('023', 50)], [foe]), move(0, fair), move()).events.find((x) => x.t === 'move');
      return e?.t === 'move' ? e.side : -1;
    };
    expect(firstMover(false)).toBe(1);
    expect(firstMover(true)).toBe(0);
  });

  it('stays a fair copy after switching out and back', () => {
    let st: BattleState = start([mon('018', 30), mon('017', 30)], [mon('001', 40)]);
    st = act(st, move(0, true), move()).state;
    st = act(st, { type: 'switch', to: 1 }, move()).state;
    st = act(st, { type: 'switch', to: 0 }, move()).state;
    expect(st.sides[0].party[0].fair).toBe(true);
    expect(canFairCopy(st, 0)).toBe(false);
  });

  it('takes a new talent when its fair copy has one', () => {
    const m = mon('028', 30);
    expect(talentOf(m).id).toBe('pleine-lune');
    expect(talentOf({ ...m, fair: true }).id).toBe(FAIR_COPY['028'].talent);
  });

  it('keeps its types when the owner chose a new talent instead, and shows that talent as it transforms', () => {
    const st = start([mon('011', 40)], [mon('001', 30)]);
    const step = act(st, move(0, true), move());
    const at = step.events.findIndex((e) => e.t === 'fairCopy');
    expect(step.events[at + 1]).toEqual({ t: 'talent', side: 0, talent: 'troisieme-oeil' });
    const me = step.state.sides[0].party[0];
    expect(monTypes(me)).toEqual(['spectre', 'tenebres']);
    expect(talentOf(me).id).toBe('troisieme-oeil');
  });

  it('lets trainers make their ace a fair copy as soon as it fights, the Great Eraser in black', () => {
    const team = [mon('001', 30), mon('011', 34)];
    expect(fairAce(team)).toBe(1);
    const lead = start([mon('017', 34)], team, { foe: 'light' });
    expect(aiChoose(lead)).not.toHaveProperty('fair');
    const ace = start([mon('017', 34)], [mon('011', 34)], { foe: 'dark' });
    const a = aiChoose(ace);
    expect(a).toMatchObject({ type: 'move', fair: true });
    const step = act(ace, move(), a);
    expect(step.events.find((e) => e.t === 'fairCopy')).toEqual({ t: 'fairCopy', side: 1, dark: true });
    // a trainer without a Feutre never does
    expect(aiChoose(start([mon('017', 34)], [mon('011', 34)], {}))).not.toHaveProperty('fair');
  });
});
