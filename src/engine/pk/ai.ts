import { typesOf } from '../../data/creatures';
import { move } from '../../data/moves';
import { talentEffect } from '../../data/talents';
import { nextRandom, randomInt } from '../rng';
import { activeMon, moveEffectiveness, stabOf, stageMult, talentPowerMult, usableSlots, type Action, type BattleState } from './battle';
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
  const slots = usableSlots(m, me.vol);
  if (!slots.length) return { type: 'move', slot: -1 };
  if (st.kind === 'wild' || (slip > 0 && nextRandom(st) < slip)) return { type: 'move', slot: slots[randomInt(st, slots.length)] };

  const myTypes = typesOf(m.species);

  // stuck against an immune foe (e.g. Normal vs Ghost)? send a teammate that can hit it (not when tied up)
  const canHurt = (mon: typeof m) => mon.moves.some((sl) => sl.pp > 0 && move(sl.id).cat !== 'status' && moveEffectiveness(mon, move(sl.id), target) > 0);
  if (!canHurt(m) && !me.vol.trap && !me.vol.charging) {
    const mate = me.party.findIndex((p, i) => i !== me.active && p.hp > 0 && canHurt(p));
    if (mate >= 0) return { type: 'switch', to: mate };
  }
  const hpRatio = m.hp / maxHp(m);
  // the foe's talent: a move it absorbs or a status it can't get is wasted
  const absorbs = talentEffect(target, 'absorb')?.type;
  const immuneTo = talentEffect(target, 'immune')?.status;
  const doll = foe.vol.sub > 0;
  // weather that helps one of its own types
  const likes = (w: string) => (w === 'pluie' && myTypes.includes('eau')) || (w === 'soleil' && (myTypes.includes('feu') || myTypes.includes('plante')))
    || (w === 'sable' && myTypes.some((t) => t === 'sol' || t === 'roche' || t === 'acier')) || (w === 'grele' && myTypes.includes('glace'));
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
      // its own power counts too (Arc-en-ciel, Poings d’Acier, Foudre Têtue…)
      score = power * talentPowerMult(m, mv) * moveEffectiveness(m, mv, target) * stabOf(m, mv) * ((mv.acc ?? 100) / 100) * atk;
      // a move that goes first finishes a weakened foe before it can hit back
      if ((mv.priority ?? 0) > 0 && target.hp / maxHp(target) < 0.3) score *= 1.5;
      // a two-turn move is slower to pay off; ties and seeds are better on a foe that stays
      if (mv.effects?.some((e) => e.kind === 'charge' && !(e.sunSkips && st.weather?.kind === 'soleil'))) score *= 0.7;
      if (mv.effects?.some((e) => e.kind === 'trap') && !foe.vol.trap && !doll) score += 15;
      // out of reach this turn
      if (foe.vol.invuln) score *= 0.1;
      if (absorbs === mv.type) score = -20;
    } else {
      for (const e of mv.effects ?? []) {
        if (e.kind === 'status') score += target.status || immuneTo === e.status ? -50 : e.status === 'sleep' ? 70 : 50;
        if (e.kind === 'confuse') score += foe.vol.confusion ? -50 : 35;
        if (e.kind === 'stage' && e.target === 'foe') score += foe.vol.stages[e.stat] <= -2 || (e.stages < 0 && foe.guard > 0) ? -30 : 25;
        if (e.kind === 'stage' && e.target === 'self') score += me.vol.stages[e.stat] >= 2 || hpRatio < 0.5 ? -30 : 30;
        if (e.kind === 'heal' || e.kind === 'rest') score += hpRatio < 0.4 ? 90 : -60;
        if (e.kind === 'toxic') score += target.status || typesOf(target.species).some((t) => t === 'poison' || t === 'acier') ? -50 : 55;
        if (e.kind === 'weather') score += st.weather?.kind === e.weather ? -60 : likes(e.weather) ? 30 : 5;
        if (e.kind === 'protect') score += me.vol.protectChain > 0 ? -60 : foe.vol.charging ? 60 : 10;
        if (e.kind === 'seed') score += foe.vol.seeded || typesOf(target.species).includes('plante') ? -60 : 40;
        if (e.kind === 'substitute') score += me.vol.sub > 0 || hpRatio < 0.35 ? -60 : 22;
      }
      // the foe's paper doll blocks statuses and stat drops
      if (doll && mv.effects?.some((e) => e.kind === 'status' || e.kind === 'toxic' || e.kind === 'confuse' || e.kind === 'seed' || (e.kind === 'stage' && e.target === 'foe'))) score -= 60;
      score *= (mv.acc ?? 100) / 100;
      if (absorbs === mv.type) score = -20;
    }
    score *= 0.85 + nextRandom(st) * 0.3;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return { type: 'move', slot: best };
}
