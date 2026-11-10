import { describe, expect, it } from 'vitest';
import { BADGES } from '../data/badges';
import { TRAINERS } from '../data/trainers';
import { act, createBattle } from '../engine/pk/battle';
import { createMon, xpAt } from '../engine/pk/creature';
import { L } from '../i18n';
import type { SaveData } from '../save/schema';
import { battleBag, catchForbidden, innPrice, levelCapOf } from './rules';

const save = (patch: Partial<SaveData>): SaveData => ({ flags: {}, badges: [], bag: {}, difficulty: 'normal', ...patch } as SaveData);

describe('challenge rules', () => {
  it('one colour only: only that type can be caught', () => {
    const s = save({ rules: { monotype: 'eau' } });
    expect(catchForbidden(s, '003', 'route3')).toBe(false);
    expect(catchForbidden(s, '001', 'route3')).toBe(true);
    expect(catchForbidden(save({}), '001', 'route3')).toBe(false);
  });

  it('one catch per place, legends aside', () => {
    const s = save({ rules: { onePerMap: true }, flags: { 'catch:route3': 1 } });
    expect(catchForbidden(s, '003', 'route3')).toBe(true);
    expect(catchForbidden(s, '003', 'route4')).toBe(false);
    expect(catchForbidden(s, '071', 'route3')).toBe(false);
  });

  it('the level cap follows the next Master, then the Great Eraser, and lifts after the story', () => {
    const s = save({ rules: { levelCap: true } });
    const ace = (id: string) => Math.max(...TRAINERS[id].party.map((m) => m.level));
    expect(levelCapOf(s)).toBe(ace('mireille'));
    expect(levelCapOf({ ...s, badges: ['pastel'] })).toBe(ace('gaspard'));
    expect(levelCapOf({ ...s, badges: BADGES.map((b) => b.id) })).toBe(ace('effaceur'));
    expect(levelCapOf({ ...s, flags: { ending: 1 } })).toBeUndefined();
    expect(levelCapOf(save({}))).toBeUndefined();
  });

  it('the cap stops a battle’s XP at its level', () => {
    const me = createMon('021', 10, { rng: 1 });
    me.xp = xpAt(10);
    const foe = createMon('008', 30, { rng: 2 });
    foe.hp = 1;
    let st = createBattle({ kind: 'wild', seed: 2, levelCap: 10, player: { name: L('a', 'a'), party: [me], isAI: false }, enemy: { name: L('b', 'b'), party: [foe], isAI: true } }).state;
    for (let i = 0; i < 6 && !st.result; i++) st = act(st, { type: 'move', slot: 0 }, { type: 'move', slot: 0 }).state;
    expect(st.result).toBe('win');
    expect(st.sides[0].party[0].level).toBe(10);
    expect(st.sides[0].party[0].xp).toBeLessThan(xpAt(11));
  });

  it('a sealed bag keeps only the Croque-Carnets; Inns cost more with each badge', () => {
    const s = save({ rules: { sealedBag: true }, bag: { potion: 3, 'crayon-ball': 5, 'super-crayon-ball': 1 } });
    expect(battleBag(s)).toEqual({ 'crayon-ball': 5, 'super-crayon-ball': 1 });
    expect(battleBag(save({ bag: { potion: 3 } }))).toEqual({ potion: 3 });
    expect(innPrice({ badges: [] })).toBeLessThan(innPrice({ badges: ['pastel', 'plume'] }));
  });

  it('a Croque-Carnet thrown against a rule says so', () => {
    const st = createBattle({ kind: 'wild', seed: 2, noCatch: 'rule', player: { name: L('a', 'a'), party: [createMon('021', 10, { rng: 1 })], isAI: false }, enemy: { name: L('b', 'b'), party: [createMon('008', 5, { rng: 2 })], isAI: true } }).state;
    const step = act(st, { type: 'ball', item: 'crayon-ball' }, { type: 'move', slot: 0 });
    expect(step.events.find((e) => e.t === 'blocked')).toMatchObject({ rule: true });
  });
});
