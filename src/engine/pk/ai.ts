import { creature } from '../../data/creatures';
import { move } from '../../data/moves';
import { effectiveness } from '../../data/types';
import { nextRandom, randomInt } from '../rng';
import { activeMon, stageMult, usableSlots, type Action, type BattleState } from './battle';
import { maxHp } from './creature';

/**
 * Enemy choice for this turn: wild creatures pick a random move, trainers think a little.
 * `slip` is the chance a trainer picks a random move anyway (easy difficulty).
 */
export function aiChoose(st: BattleState, slip = 0): Action {
  const me = st.sides[1];
  const foe = st.sides[0];
  const m = activeMon(me);
  const target = activeMon(foe);
  const slots = usableSlots(m);
  if (!slots.length) return { type: 'move', slot: -1 };
  if (st.kind === 'wild' || (slip > 0 && nextRandom(st) < slip)) return { type: 'move', slot: slots[randomInt(st, slots.length)] };

  const myType = creature(m.species).type;
  const foeType = creature(target.species).type;

  // stuck against an immune foe (e.g. Normal vs Ghost)? send a teammate that can hit it
  const canHurt = (mon: typeof m) => mon.moves.some((sl) => sl.pp > 0 && move(sl.id).cat !== 'status' && effectiveness(move(sl.id).type, foeType) > 0);
  if (!canHurt(m)) {
    const mate = me.party.findIndex((p, i) => i !== me.active && p.hp > 0 && canHurt(p));
    if (mate >= 0) return { type: 'switch', to: mate };
  }
  const hpRatio = m.hp / maxHp(m);
  let best = slots[0];
  let bestScore = -Infinity;
  for (const i of slots) {
    const mv = move(m.moves[i].id);
    let score = 0;
    if (mv.cat !== 'status') {
      let power = mv.power;
      for (const e of mv.effects ?? []) {
        if (e.kind === 'multi') power *= (e.min + e.max) / 2;
        if (e.kind === 'boostIfFoeAsleep' && target.status === 'sleep') power *= e.mult;
        if (e.kind === 'onlyAsleep' && m.status !== 'sleep') power = 0;
      }
      const atk = mv.cat === 'phys' ? stageMult(me.vol.stages.atk) : stageMult(me.vol.stages.spa);
      score = power * effectiveness(mv.type, foeType) * (myType === mv.type ? 1.5 : 1) * ((mv.acc ?? 100) / 100) * atk;
    } else {
      for (const e of mv.effects ?? []) {
        if (e.kind === 'status') score += target.status ? -50 : e.status === 'sleep' ? 70 : 50;
        if (e.kind === 'confuse') score += foe.vol.confusion ? -50 : 35;
        if (e.kind === 'stage' && e.target === 'foe') score += foe.vol.stages[e.stat] <= -2 ? -30 : 25;
        if (e.kind === 'stage' && e.target === 'self') score += me.vol.stages[e.stat] >= 2 || hpRatio < 0.5 ? -30 : 30;
        if (e.kind === 'heal' || e.kind === 'rest') score += hpRatio < 0.4 ? 90 : -60;
      }
      score *= (mv.acc ?? 100) / 100;
    }
    score *= 0.85 + nextRandom(st) * 0.3;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return { type: 'move', slot: best };
}
