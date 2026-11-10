import { describe, expect, it } from 'vitest';
import { move } from '../../data/moves';
import { TRAINERS, brainOf } from '../../data/trainers';
import { L } from '../../i18n';
import { aiChoose, expectedDamage, matchup } from './ai';
import { act, activeMon, createBattle, type BattleState, type SideSetup } from './battle';
import { createMon, maxHp, type Mon } from './creature';

const IV = { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 };
const mon = (species: string, level: number, patch: Partial<Mon> = {}): Mon => ({ ...createMon(species, level, { rng: 3 }, IV), nature: 'joyeuse', talent: 0, ...patch });

function battle(player: Mon[], enemy: Mon[], brain: Pick<SideSetup, 'smart' | 'switches' | 'items'> = { smart: true }): BattleState {
  return createBattle({
    kind: 'trainer', seed: 11,
    player: { name: L('Moi', 'Me'), party: player, isAI: false },
    enemy: { name: L('Eux', 'Them'), party: enemy, isAI: true, ...brain },
  }).state;
}

describe('the trainer who thinks ahead', () => {
  it('estimates damage without using random numbers', () => {
    const st = battle([mon('008', 30)], [mon('007', 30)]);
    const rng = st.rng;
    const mv = move(activeMon(st.sides[1]).moves.find((s) => move(s.id).cat !== 'status')!.id);
    const a = expectedDamage(st, st.sides[1], st.sides[0], mv);
    expect(a).toBeGreaterThan(0);
    expect(expectedDamage(st, st.sides[1], st.sides[0], mv)).toBe(a);
    expect(st.rng).toBe(rng);
  });

  it('finishes a foe it can knock out first instead of a status move', () => {
    const foe = mon('008', 30, { hp: 1 });
    const me = mon('007', 35);
    const hit = me.moves.findIndex((s) => move(s.id).cat !== 'status' && (move(s.id).acc ?? 100) >= 90);
    expect(hit).toBeGreaterThanOrEqual(0);
    me.moves = [{ id: 'grondement', pp: 40 }, me.moves[hit]];
    for (let seed = 1; seed < 20; seed++) {
      const st = { ...battle([foe], [me]), rng: seed };
      expect(aiChoose(st)).toEqual({ type: 'move', slot: 1 });
    }
  });

  it('drinks a potion that lets it take the next hit, and only has as many as its bag holds', () => {
    let st = battle([mon('008', 30)], [mon('008', 30)], { smart: true, items: [{ id: 'super-potion', n: 1 }] });
    const foeHit = Math.max(...activeMon(st.sides[0]).moves.map((s) => expectedDamage(st, st.sides[0], st.sides[1], move(s.id))));
    const m = activeMon(st.sides[1]);
    m.hp = Math.max(1, Math.floor(foeHit) - 3);
    expect(maxHp(m) - m.hp).toBeGreaterThan(5);
    const a = aiChoose(st);
    expect(a).toEqual({ type: 'item', item: 'super-potion', target: 0 });
    const step = act(st, { type: 'move', slot: 0 }, a);
    expect(step.events.find((e) => e.t === 'useItem')).toMatchObject({ item: 'super-potion', side: 1 });
    expect(step.state.sides[1].items![0].n).toBe(0);
    // the bag is empty now: no potion any more
    st = step.state;
    activeMon(st.sides[1]).hp = Math.max(1, Math.floor(foeHit) - 3);
    expect(aiChoose(st).type).toBe('move');
  });

  it('switches out of a hopeless matchup only while it has switches left', () => {
    const player = [mon('007', 40)];
    const enemy = () => [mon('001', 8), mon('007', 40)];
    const st = battle(player, enemy(), { smart: true, switches: 1 });
    expect(matchup(st, st.sides[1], 0, st.sides[0])).toBeLessThanOrEqual(-0.5);
    expect(aiChoose(st)).toEqual({ type: 'switch', to: 1 });
    const after = act(st, { type: 'move', slot: 0 }, { type: 'switch', to: 1 }).state;
    expect(after.sides[1].active).toBe(1);
    expect(after.sides[1].switches ?? 0).toBe(0);
    // without switches it stays and fights
    const stay = battle(player, enemy(), { smart: true });
    expect(aiChoose(stay).type).toBe('move');
  });

  it('a plain trainer never uses its bag nor switches by choice', () => {
    const st = battle([mon('007', 40)], [mon('001', 8, { hp: 2 }), mon('007', 40)], { items: [{ id: 'super-potion', n: 2 }], switches: 3 });
    for (let seed = 1; seed < 20; seed++) expect(aiChoose({ ...st, rng: seed }).type).toBe('move');
  });
});

describe('brainOf', () => {
  const route = { id: 'someone' };
  it('Easy: nobody thinks ahead, no potions', () => {
    expect(brainOf(TRAINERS.marine, [{ level: 19 }], 'easy')).toEqual({});
  });
  it('Normal: early route trainers stay plain, bosses think and carry their potions, switching only after the story', () => {
    expect(brainOf(route, [{ level: 12 }], 'normal')).toEqual({});
    expect(brainOf(route, [{ level: 22 }], 'normal')).toEqual({ smart: true });
    expect(brainOf(TRAINERS.marine, [{ level: 19 }], 'normal')).toEqual({ smart: true, items: [{ id: 'potion', n: 1 }] });
    expect(brainOf({ id: 'mireille:rematch' }, [{ level: 50 }], 'normal')).toEqual({ smart: true, switches: 1 });
  });
  it('Hard: everyone thinks, three switches, bosses with twice the potions', () => {
    expect(brainOf(route, [{ level: 8 }], 'hard')).toEqual({ smart: true, switches: 3 });
    expect(brainOf(route, [{ level: 31 }], 'hard')).toEqual({ smart: true, switches: 3, items: [{ id: 'super-potion', n: 1 }] });
    expect(brainOf(TRAINERS.marine, [{ level: 19 }], 'hard')).toEqual({ smart: true, switches: 3, items: [{ id: 'potion', n: 2 }] });
  });
  it('every potion on a trainer is a real healing or curing item', async () => {
    const { item } = await import('../../data/items');
    for (const t of Object.values(TRAINERS)) for (const id of t.items ?? []) expect(['heal', 'status'], `${t.id} ${id}`).toContain(item(id).kind);
  });
});
