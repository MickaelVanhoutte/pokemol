import { describe, expect, it } from 'vitest';
import { move } from '../../data/moves';
import { L } from '../../i18n';
import { act, activeMon, computeDamage, createBattle, usableSlots, type Action, type BattleState } from './battle';
import { createMon, maxHp, type Mon } from './creature';

const IV = { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 };
/** A Bestiole that knows exactly these moves. */
function mon(species: string, level: number, moves: string[]): Mon {
  const m = createMon(species, level, { rng: 1 }, IV);
  m.moves = moves.map((id) => ({ id, pp: 20 }));
  return m;
}
const battle = (me: Mon[], foe: Mon[], kind: 'trainer' | 'wild' = 'trainer'): BattleState => createBattle({
  kind, seed: 9,
  player: { name: L('Moi', 'Me'), party: me, isAI: false },
  enemy: { name: L('Eux', 'Them'), party: foe, isAI: true },
}).state;
const use = (slot: number): Action => ({ type: 'move', slot });
const idle = ['grondement'];

describe('moves that change the field (roadmap milestone 7)', () => {
  it('pins prick every Bestiole sent out on that side, not the ones that fly, never knocking one out', () => {
    let st = battle([mon('008', 40, ['epingles'])], [mon('008', 30, idle), mon('001', 30, idle), mon('013', 30, idle)]);
    let step = act(st, use(0), use(0));
    expect(step.state.sides[1].hazards).toBe(1);
    expect(step.events.some((e) => e.t === 'hazard' && e.side === 1)).toBe(true);
    st = step.state;
    step = act(st, use(0), { type: 'switch', to: 1 });
    const hurt = step.events.find((e) => e.t === 'hazardHurt');
    expect(hurt).toMatchObject({ side: 1, amount: Math.floor(maxHp(step.state.sides[1].party[1]) / 8) });
    // a flyer passes over them
    step = act(step.state, use(0), { type: 'switch', to: 2 });
    expect(step.events.some((e) => e.t === 'hazardHurt')).toBe(false);
    // three layers at most
    st = battle([mon('008', 40, ['epingles'])], [mon('008', 30, idle), mon('001', 30, idle)]);
    for (let i = 0; i < 4; i++) st = act(st, use(0), use(0)).state;
    expect(st.sides[1].hazards).toBe(3);
  });

  it('a broom sweeps its own side’s pins away', () => {
    let st = battle([mon('008', 40, ['coup-de-balai']), mon('001', 30, idle)], [mon('008', 30, ['epingles'])]);
    st = act(st, use(0), use(0)).state;
    expect(st.sides[0].hazards).toBe(1);
    const step = act(st, use(0), use(0));
    expect(step.events.some((e) => e.t === 'swept' && e.side === 0)).toBe(true);
    // the foe laid them again after the sweep (it moves after): the sweep cleared the first layer
    expect(step.state.sides[0].hazards).toBeLessThanOrEqual(1);
  });

  it('a screen halves the hits of its kind for five turns, not a critical hit', () => {
    const st = battle([mon('008', 40, ['calque-protecteur'])], [mon('008', 40, ['griffe'])]);
    const griffe = move('griffe');
    const probe = { rng: 1 };
    const open = computeDamage(probe, st.sides[1], st.sides[0], griffe, griffe.power, false, 8).dmg;
    st.sides[0].screens = { phys: 5, spec: 0 };
    const shielded = computeDamage(probe, st.sides[1], st.sides[0], griffe, griffe.power, false, 8).dmg;
    // about half (the damage is floored at each step)
    expect(Math.abs(shielded - open / 2)).toBeLessThanOrEqual(1);
    expect(shielded).toBeLessThan(open);
    const crit = computeDamage(probe, st.sides[1], st.sides[0], griffe, griffe.power, true, 8).dmg;
    expect(crit).toBeGreaterThan(open);
    // it fades after five turns
    let s2 = battle([mon('008', 40, ['calque-protecteur', 'grondement'])], [mon('008', 40, idle)]);
    s2 = act(s2, use(0), use(0)).state;
    expect(s2.sides[0].screens?.phys).toBe(4);
    let faded = false;
    for (let i = 0; i < 4; i++) {
      const step = act(s2, use(1), use(0));
      faded ||= step.events.some((e) => e.t === 'screen' && !e.on);
      s2 = step.state;
    }
    expect(faded).toBe(true);
    expect(s2.sides[0].screens?.phys).toBe(0);
  });

  it('a pivot move hits, then its user goes back at the end of the turn (the player picks, the trainer at once)', () => {
    let st = battle([mon('007', 40, ['demi-tour']), mon('001', 30, idle)], [mon('008', 40, idle)]);
    let step = act(st, use(0), use(0));
    expect(step.events.some((e) => e.t === 'pivot' && e.side === 0)).toBe(true);
    expect(step.state.needSwitch).toBe(true);
    step = act(step.state, { type: 'replace', to: 1 }, use(0));
    expect(step.state.sides[0].active).toBe(1);
    // the trainer's side switches by itself
    st = battle([mon('008', 40, idle)], [mon('007', 40, ['demi-tour']), mon('001', 30, idle)]);
    step = act(st, use(0), use(0));
    expect(step.state.sides[1].active).toBe(1);
    expect(step.state.needSwitch).toBe(false);
    // alone, it stays
    st = battle([mon('007', 40, ['demi-tour'])], [mon('008', 40, idle)]);
    expect(act(st, use(0), use(0)).state.needSwitch).toBe(false);
  });

  it('a roar drags another of the foe’s team out, but does nothing to a wild Bestiole', () => {
    let st = battle([mon('008', 40, ['grand-cri'])], [mon('008', 30, idle), mon('001', 30, idle)]);
    let step = act(st, use(0), use(0));
    expect(step.events.some((e) => e.t === 'dragged' && e.side === 1)).toBe(true);
    expect(step.state.sides[1].active).toBe(1);
    st = battle([mon('008', 40, ['grand-cri'])], [mon('008', 30, idle)], 'wild');
    step = act(st, use(0), use(0));
    expect(step.events.some((e) => e.t === 'fail' && e.side === 0)).toBe(true);
  });

  it('a taunt leaves the foe only its attacking moves for three turns', () => {
    let st = battle([mon('008', 40, ['gribouillis-moqueur', 'grondement'])], [mon('008', 30, ['grondement', 'griffe'])]);
    st = act(st, use(0), use(1)).state;
    const foe = st.sides[1];
    expect(foe.vol.taunt).toBeGreaterThan(0);
    expect(usableSlots(activeMon(foe), foe.vol)).toEqual([1]);
    for (let i = 0; i < 3; i++) st = act(st, use(1), use(1)).state;
    expect(st.sides[1].vol.taunt).toBe(0);
    expect(usableSlots(activeMon(st.sides[1]), st.sides[1].vol)).toEqual([0, 1]);
  });
});
