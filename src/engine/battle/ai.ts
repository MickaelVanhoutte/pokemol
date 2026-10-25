import { creature } from '../../data/creatures';
import { support } from '../../data/supportCards';
import { RESISTANCE_AMOUNT, WEAKNESS_MULT } from '../../data/types';
import type { AttackDef } from '../../data/schema';
import {
  activeOf, attackProblem, canAttachEnergy, canAttack, canPlay, playTargets, retreatTargets,
} from './engine';
import type { Action, BattleState, Fighter, Side } from './types';

const other = (s: Side): Side => (s === 0 ? 1 : 0);

/** Rough expected damage of an attack against the current defender (coins count as 50%). */
export function expectedDamage(st: BattleState, side: Side, a: AttackDef, extraBonus = 0): number {
  const s = st.sides[side];
  const atk = activeOf(s);
  const foe = activeOf(st.sides[other(side)]);
  let dmg = a.damage;
  const m = a.mod;
  if (m?.kind === 'perHeads') dmg = (a.damage * m.flips) / 2;
  if (m?.kind === 'flipOrFail') dmg = a.damage / 2;
  if (m?.kind === 'bonusIfStatus' && foe.status.includes(m.status)) dmg += m.bonus;
  if (m?.kind === 'bonusOnHeads') dmg += m.bonus / 2;
  if (m?.kind === 'bonusPerExtraEnergy') dmg += m.bonus * Math.max(0, atk.energy - a.cost);
  if (a.damage > 0 && dmg > 0) dmg += atk.dmgBonus + s.atkBonus + s.firstAtkBonus + extraBonus;
  const fDef = creature(foe.defId);
  const aDef = creature(atk.defId);
  if (fDef.weakness === aDef.type) dmg *= WEAKNESS_MULT;
  if (fDef.resistance === aDef.type) dmg -= RESISTANCE_AMOUNT;
  return Math.max(0, dmg - foe.protect);
}

function attackScore(st: BattleState, side: Side, ai: number): number {
  const atk = activeOf(st.sides[side]);
  const foe = activeOf(st.sides[other(side)]);
  const a = creature(atk.defId).attacks[ai];
  const dmg = expectedDamage(st, side, a);
  let score = dmg;
  if (dmg >= foe.hp) score += 100;
  for (const e of a.effects ?? []) {
    if (e.kind === 'status' && e.target === 'defender' && !foe.status.includes(e.status)) score += 18;
    if (e.kind === 'coin') score += 8;
    if (e.kind === 'heal') score += Math.min(e.amount, atk.maxHp - atk.hp) * 0.8;
    if (e.kind === 'status' && e.target === 'self' && e.status === 'sleep') score -= atk.hp < atk.maxHp * 0.4 ? 0 : 25;
    if (e.kind === 'selfDamage') score -= e.amount / 2;
    if (e.kind === 'discardEnergy' && e.target === 'self') score -= 6;
    if (e.kind === 'discardHand') score += st.sides[other(side)].hand.length ? 6 : 0;
    if (e.kind === 'protect') score += 8;
  }
  return score;
}

function maxCost(f: Fighter): number {
  return Math.max(...creature(f.defId).attacks.map((a) => a.cost));
}

function missing(f: Fighter) {
  return f.ko ? 0 : f.maxHp - f.hp;
}

/** Next action for the AI side whose turn it is. Call repeatedly until it returns an attack/endTurn. */
export function aiStep(st: BattleState): Action {
  const side = st.turn;
  const s = st.sides[side];
  const foeSide = other(side);
  const foe = st.sides[foeSide];
  const me = activeOf(s);
  const myDef = creature(me.defId);
  const foeActive = activeOf(foe);

  // 1. support cards
  for (let hi = 0; hi < s.hand.length; hi++) {
    if (!canPlay(st, side, hi)) continue;
    const def = support(s.hand[hi]);
    const targets = playTargets(st, side, hi);
    // untargeted branches below only apply to cards that take no target
    const free = targets === null;
    for (const e of def.effects) {
      switch (e.kind) {
        case 'heal': {
          const t = (targets ?? []).filter((i) => missing(s.fighters[i]) >= e.amount * 0.6);
          if (t.length) return { type: 'playCard', hand: hi, target: t.sort((a, b) => missing(s.fighters[b]) - missing(s.fighters[a]))[0] };
          break;
        }
        case 'healAll':
          if (free && s.fighters.reduce((n, f) => n + Math.min(missing(f), e.amount), 0) >= e.amount * 1.5) return { type: 'playCard', hand: hi };
          break;
        case 'cure':
          if (me.status.length && targets?.includes(s.active)) return { type: 'playCard', hand: hi, target: s.active };
          break;
        case 'energy': {
          if (targets?.includes(s.active) && me.energy < maxCost(me)) return { type: 'playCard', hand: hi, target: s.active };
          const needy = (targets ?? []).filter((i) => s.fighters[i].energy < maxCost(s.fighters[i]));
          if (needy.length) return { type: 'playCard', hand: hi, target: needy[0] };
          break;
        }
        case 'switch': {
          const stuck = me.status.includes('sleep') || me.status.includes('paralyze') || creature(foeActive.defId).type === myDef.weakness;
          if (stuck && targets?.length) return { type: 'playCard', hand: hi, target: targets[0] };
          break;
        }
        case 'revive':
          if (targets?.length) return { type: 'playCard', hand: hi, target: targets[0] };
          break;
        case 'draw':
          if (free && s.hand.length <= 3) return { type: 'playCard', hand: hi };
          break;
        case 'reshuffle':
          if (free && s.hand.length <= 2 && s.deck.length >= 4) return { type: 'playCard', hand: hi };
          break;
        case 'scribble':
          if (free && foe.hand.length >= 2) return { type: 'playCard', hand: hi };
          break;
        case 'gust': {
          const weakBench = foe.fighters.some((f, i) => i !== foe.active && !f.ko && f.hp < foeActive.hp);
          if (free && weakBench) return { type: 'playCard', hand: hi };
          break;
        }
        case 'atkBonus': {
          const usable = myDef.attacks.some((a, i) => a.damage > 0 && (canAttack(st, side, i) || (!s.energyAttached && me.energy + 1 >= a.cost && !attackProblemIgnoringEnergy(st, side))));
          if (free && usable && !s.atkBonus) return { type: 'playCard', hand: hi };
          break;
        }
        case 'protect':
          if (free && !me.protect && (canAttackSoon(st, side) || me.hp <= me.maxHp / 2)) return { type: 'playCard', hand: hi };
          break;
        case 'luckyCoin': {
          const coiny = myDef.attacks.some((a) => a.mod || a.effects?.some((x) => x.kind === 'coin'));
          if (free && !s.luckyCoin && (coiny || me.status.includes('blind') || me.status.includes('confuse'))) return { type: 'playCard', hand: hi };
          break;
        }
        case 'glue':
          break;
      }
    }
  }

  // 2. energy
  if (!s.energyAttached) {
    if (canAttachEnergy(st, side, s.active) && me.energy < maxCost(me)) return { type: 'attachEnergy', fighter: s.active };
    const bench = s.fighters.map((_, i) => i).filter((i) => i !== s.active && canAttachEnergy(st, side, i));
    const needy = bench.filter((i) => s.fighters[i].energy < maxCost(s.fighters[i]));
    if (needy.length) return { type: 'attachEnergy', fighter: needy[0] };
    if (canAttachEnergy(st, side, s.active)) return { type: 'attachEnergy', fighter: s.active };
  }

  // 3. retreat a badly hurt or badly matched active
  const rt = retreatTargets(st, side);
  if (rt.length) {
    const healthiest = rt.sort((a, b) => s.fighters[b].hp - s.fighters[a].hp)[0];
    const hurt = me.hp <= 20 && s.fighters[healthiest].hp > me.hp * 2;
    const badMatch = creature(foeActive.defId).type === myDef.weakness && creature(foeActive.defId).type !== creature(s.fighters[healthiest].defId).weakness;
    if ((hurt || badMatch) && !myDef.attacks.some((a, i) => canAttack(st, side, i) && expectedDamage(st, side, a) >= foeActive.hp)) {
      return { type: 'retreat', to: healthiest };
    }
  }

  // 4. attack
  const options = myDef.attacks.map((_, i) => i).filter((i) => canAttack(st, side, i));
  if (options.length) {
    const best = options.sort((a, b) => attackScore(st, side, b) - attackScore(st, side, a))[0];
    return { type: 'attack', attack: best };
  }
  return { type: 'endTurn' };
}

function attackProblemIgnoringEnergy(st: BattleState, side: Side): boolean {
  const p = attackProblem(st, side, 0);
  return p === 'asleep' || p === 'paralyzed';
}

function canAttackSoon(st: BattleState, side: Side): boolean {
  const s = st.sides[side];
  const me = activeOf(s);
  const energy = me.energy + (s.energyAttached ? 0 : 1);
  return creature(me.defId).attacks.some((a) => a.cost <= energy);
}
