import { fairCopyOf, monTypes } from '../../data/fairCopies';
import { item } from '../../data/items';
import { move } from '../../data/moves';
import type { MoveDef } from '../../data/schema';
import { talentEffect } from '../../data/talents';
import { nextRandom, randomInt } from '../rng';
import {
  activeMon, canFairCopy, computeDamage, effectiveStat, freshVol, itemUsable, moveEffectiveness, stabOf, stageMult, talentPowerMult, usableSlots,
  type Action, type BattleState, type SideState,
} from './battle';
import { maxHp, type Mon } from './creature';

/** The Bestiole a team keeps its fair copy for: its highest-level one still standing that can be one (the last on a tie). */
export function fairAce(party: Mon[]): number {
  let best = -1;
  party.forEach((m, i) => {
    if (m.hp > 0 && !m.egg && fairCopyOf(m.species) && (best < 0 || m.level >= party[best].level)) best = i;
  });
  return best;
}

/**
 * Enemy choice for this turn: wild creatures pick a random move, trainers think a little, and a `smart`
 * side (bosses, later trainers, Hard) thinks ahead: knock-outs, danger, potions, switching out of a bad matchup.
 * `slip` is the chance a trainer picks a random move anyway (easy difficulty).
 * A trainer with a Feutre makes its ace a fair copy as soon as it fights.
 */
export function aiChoose(st: BattleState, slip = 0): Action {
  const a = choose(st, slip);
  const me = st.sides[1];
  return a.type === 'move' && canFairCopy(st, 1) && me.active === fairAce(me.party) ? { ...a, fair: true } : a;
}

function choose(st: BattleState, slip: number): Action {
  const me = st.sides[1];
  const m = activeMon(me);
  const slots = usableSlots(m, me.vol);
  if (!slots.length) return { type: 'move', slot: -1 };
  if (st.kind === 'wild' || (slip > 0 && nextRandom(st) < slip)) return { type: 'move', slot: slots[randomInt(st, slots.length)] };
  return me.smart ? thinkAhead(st, slots) : simple(st, slots);
}

// ------------------------------------------------------------------ the plain trainer

function simple(st: BattleState, slots: number[]): Action {
  const me = st.sides[1];
  const foe = st.sides[0];
  const m = activeMon(me);
  const target = activeMon(foe);

  // stuck against an immune foe (e.g. Normal vs Ghost)? send a teammate that can hit it (not when tied up)
  const canHurt = (mon: Mon) => mon.moves.some((sl) => sl.pp > 0 && move(sl.id).cat !== 'status' && moveEffectiveness(mon, move(sl.id), target) > 0);
  if (!canHurt(m) && !me.vol.trap && !me.vol.charging) {
    const mate = me.party.findIndex((p, i) => i !== me.active && p.hp > 0 && canHurt(p));
    if (mate >= 0) return { type: 'switch', to: mate };
  }
  let best = slots[0];
  let bestScore = -Infinity;
  for (const i of slots) {
    const mv = move(m.moves[i].id);
    let score = mv.cat !== 'status' ? hitScore(st, mv) : statusScore(st, mv);
    score *= 0.85 + nextRandom(st) * 0.3;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return { type: 'move', slot: best };
}

/** The plain trainer's score for an attacking move: its power once types, talents, accuracy and stages count. */
function hitScore(st: BattleState, mv: MoveDef): number {
  const me = st.sides[1];
  const foe = st.sides[0];
  const m = activeMon(me);
  const target = activeMon(foe);
  let power = mv.power;
  for (const e of mv.effects ?? []) {
    if (e.kind === 'multi') power *= (e.min + e.max) / 2;
    if (e.kind === 'boostIfFoeAsleep' && target.status === 'sleep') power *= e.mult;
    if (e.kind === 'onlyAsleep' && m.status !== 'sleep') power = 0;
  }
  const atk = mv.cat === 'phys' ? stageMult(me.vol.stages.atk) : stageMult(me.vol.stages.spa);
  // its own power counts too (Arc-en-ciel, Poings d’Acier, Foudre Têtue…)
  let score = power * talentPowerMult(m, mv) * moveEffectiveness(m, mv, target) * stabOf(m, mv) * ((mv.acc ?? 100) / 100) * atk;
  // a move that goes first finishes a weakened foe before it can hit back
  if ((mv.priority ?? 0) > 0 && target.hp / maxHp(target) < 0.3) score *= 1.5;
  // a two-turn move is slower to pay off; ties and seeds are better on a foe that stays
  if (mv.effects?.some((e) => e.kind === 'charge' && !(e.sunSkips && st.weather?.kind === 'soleil'))) score *= 0.7;
  if (mv.effects?.some((e) => e.kind === 'trap') && !foe.vol.trap && foe.vol.sub <= 0) score += 15;
  // out of reach this turn
  if (foe.vol.invuln) score *= 0.1;
  if (talentEffect(target, 'absorb')?.type === mv.type) score = -20;
  return score;
}

/** What changes an attacking move's worth in both minds: two-turn moves, ties, a foe out of reach, a move it absorbs. */
function extras(st: BattleState, mv: MoveDef): number {
  const foe = st.sides[0];
  const target = activeMon(foe);
  if (talentEffect(target, 'absorb')?.type === mv.type) return -0.1;
  let k = 1;
  // a two-turn move is slower to pay off
  if (mv.effects?.some((e) => e.kind === 'charge' && !(e.sunSkips && st.weather?.kind === 'soleil'))) k *= 0.7;
  // out of reach this turn
  if (foe.vol.invuln) k *= 0.1;
  return k;
}

/** Score of a status move (both minds): what it would do to this foe now. */
function statusScore(st: BattleState, mv: MoveDef): number {
  const me = st.sides[1];
  const foe = st.sides[0];
  const m = activeMon(me);
  const target = activeMon(foe);
  const hpRatio = m.hp / maxHp(m);
  const myTypes = monTypes(m);
  const immuneTo = talentEffect(target, 'immune')?.status;
  const doll = foe.vol.sub > 0;
  // weather that helps one of its own types
  const likes = (w: string) => (w === 'pluie' && myTypes.includes('eau')) || (w === 'soleil' && (myTypes.includes('feu') || myTypes.includes('plante')))
    || (w === 'sable' && myTypes.some((t) => t === 'sol' || t === 'roche' || t === 'acier')) || (w === 'grele' && myTypes.includes('glace'));
  let score = 0;
  for (const e of mv.effects ?? []) {
    if (e.kind === 'status') score += target.status || immuneTo === e.status ? -50 : e.status === 'sleep' ? 70 : 50;
    if (e.kind === 'confuse') score += foe.vol.confusion ? -50 : 35;
    if (e.kind === 'stage' && e.target === 'foe') score += foe.vol.stages[e.stat] <= -2 || (e.stages < 0 && foe.guard > 0) ? -30 : 25;
    if (e.kind === 'stage' && e.target === 'self') score += me.vol.stages[e.stat] >= 2 || hpRatio < 0.5 ? -30 : 30;
    if (e.kind === 'heal' || e.kind === 'rest') score += hpRatio < 0.4 ? 90 : -60;
    if (e.kind === 'toxic') score += target.status || monTypes(target).some((t) => t === 'poison' || t === 'acier') ? -50 : 55;
    if (e.kind === 'weather') score += st.weather?.kind === e.weather ? -60 : likes(e.weather) ? 30 : 5;
    if (e.kind === 'protect') score += me.vol.protectChain > 0 ? -60 : foe.vol.charging ? 60 : 10;
    if (e.kind === 'seed') score += foe.vol.seeded || monTypes(target).includes('plante') ? -60 : 40;
    if (e.kind === 'substitute') score += me.vol.sub > 0 || hpRatio < 0.35 ? -60 : 22;
  }
  // the foe's paper doll blocks statuses and stat drops
  if (doll && mv.effects?.some((e) => e.kind === 'status' || e.kind === 'toxic' || e.kind === 'confuse' || e.kind === 'seed' || (e.kind === 'stage' && e.target === 'foe'))) score -= 60;
  score *= (mv.acc ?? 100) / 100;
  if (talentEffect(target, 'absorb')?.type === mv.type) score = -20;
  return score;
}

// ------------------------------------------------------------------ the trainer who thinks ahead

/** The middle of the 85–100 % damage roll. */
const MEAN_ROLL = 8;

/**
 * Damage `mv` should do from `atk`'s active Bestiole to `def`'s: no critical hit, a middle roll, times its
 * accuracy and its mean number of hits. Uses no random numbers.
 */
export function expectedDamage(st: BattleState, atk: SideState, def: SideState, mv: MoveDef): number {
  if (mv.cat === 'status' || mv.power <= 0) return 0;
  const user = activeMon(atk);
  const target = activeMon(def);
  if (talentEffect(target, 'absorb')?.type === mv.type) return 0;
  let power = mv.power;
  let hits = 1;
  for (const e of mv.effects ?? []) {
    // Gen 3's 2–5 hits average three
    if (e.kind === 'multi') hits = e.min === 2 && e.max === 5 ? 3 : (e.min + e.max) / 2;
    if (e.kind === 'boostIfFoeAsleep' && target.status === 'sleep') power *= e.mult;
    if (e.kind === 'onlyAsleep' && user.status !== 'sleep') return 0;
  }
  const { dmg } = computeDamage({ rng: st.rng, weather: st.weather, night: st.night }, atk, def, mv, Math.floor(power), false, MEAN_ROLL);
  return dmg * hits * ((mv.acc ?? 100) / 100);
}

/** The hardest hit `atk`'s active Bestiole can land on `def`'s now, and whether it goes first. */
function bestHit(st: BattleState, atk: SideState, def: SideState): { dmg: number; prio: number } {
  const m = activeMon(atk);
  let dmg = 0;
  let prio = 0;
  for (const i of usableSlots(m, atk.vol)) {
    const mv = move(m.moves[i].id);
    const d = expectedDamage(st, atk, def, mv);
    if (d > dmg) {
      dmg = d;
      prio = mv.priority ?? 0;
    }
  }
  return { dmg, prio };
}

/** `side` as if its Bestiole `idx` were out (fresh stages), to weigh a switch. */
const asIfOut = (side: SideState, idx: number): SideState => (idx === side.active ? side : { ...side, active: idx, vol: freshVol() });

/**
 * How good Bestiole `idx` of `side` looks against the foe out now, from −1 to 1: the share of the foe's HP it
 * takes in one hit, minus the share of its own HP the foe takes back.
 */
export function matchup(st: BattleState, side: SideState, idx: number, foe: SideState): number {
  const me = asIfOut(side, idx);
  const mon = side.party[idx];
  const foeMon = activeMon(foe);
  const out = Math.min(1, bestHit(st, me, foe).dmg / Math.max(1, foeMon.hp));
  const back = Math.min(1, bestHit(st, foe, me).dmg / Math.max(1, mon.hp));
  return out - back;
}

/** Turns a trainer waits after switching before it switches again. */
const SWITCH_REST = 3;

function thinkAhead(st: BattleState, slots: number[]): Action {
  const me = st.sides[1];
  const foe = st.sides[0];
  const m = activeMon(me);
  const target = activeMon(foe);
  const hp = m.hp;
  const foeHit = bestHit(st, foe, me);
  const mySpeed = effectiveStat(me, 'spe', undefined, st.night);
  const foeSpeed = effectiveStat(foe, 'spe', undefined, st.night);
  // the foe hits before it does (a tie counts as a risk)
  const foeFirst = (prio: number) => foeHit.prio > prio || (foeHit.prio === prio && foeSpeed >= mySpeed);
  const goesFirst = (prio: number) => prio > foeHit.prio || (prio === foeHit.prio && mySpeed > foeSpeed);

  // every usable move's expected damage, once
  const dmgOf = new Map(slots.map((i) => [i, expectedDamage(st, me, foe, move(m.moves[i].id))]));
  const koFirst = slots.some((i) => dmgOf.get(i)! >= target.hp && goesFirst(move(m.moves[i].id).priority ?? 0));
  const inDanger = foeHit.dmg >= hp && foeFirst(0);

  // 1. a potion when the next hit would knock it out but the potion lets it take that hit
  if (!koFirst) {
    const potion = pickPotion(st, foeHit.dmg);
    if (potion) return potion;
  }

  // 2. switch out of a hopeless matchup (never while tied up, charging, or able to finish the foe first)
  if (st.kind === 'trainer' && (me.switches ?? 0) > 0 && !koFirst && !me.vol.trap && !me.vol.charging && st.turn - (me.switchedAt ?? -SWITCH_REST) >= SWITCH_REST) {
    const now = matchup(st, me, me.active, foe);
    if (now <= -0.5) {
      let best = -1;
      let bestScore = -Infinity;
      me.party.forEach((p, i) => {
        if (i === me.active || p.hp <= 0 || p.egg) return;
        const score = matchup(st, me, i, foe);
        if (score > bestScore) {
          bestScore = score;
          best = i;
        }
      });
      if (best >= 0 && bestScore > -0.2 && bestScore >= now + 0.6) return { type: 'switch', to: best };
    }
  }

  // 3. the move that does most now
  let pick = slots[0];
  let pickScore = -Infinity;
  for (const i of slots) {
    const mv = move(m.moves[i].id);
    let score: number;
    if (mv.cat !== 'status') {
      const dmg = dmgOf.get(i)!;
      const prio = mv.priority ?? 0;
      // a knock-out: certain if it hits first, worth less if the foe swings first
      if (dmg >= target.hp) score = goesFirst(prio) ? 300 + (mv.acc ?? 100) : 150;
      else score = 120 * Math.min(1, dmg / Math.max(1, target.hp));
      if (mv.effects?.some((e) => e.kind === 'trap') && !foe.vol.trap && foe.vol.sub <= 0) score += 15;
      score *= extras(st, mv);
    } else {
      score = statusScore(st, mv);
      const heals = mv.effects?.find((e) => e.kind === 'heal' || e.kind === 'rest');
      if (heals) {
        const amount = heals.kind === 'rest' ? maxHp(m) - hp : Math.floor((maxHp(m) * heals.pct) / 100);
        // healing is worth it when it outlasts the foe's next hit, and it is low enough to need it
        score = hp <= foeHit.dmg * 1.3 && amount > foeHit.dmg ? 95 : hp / maxHp(m) < 0.5 ? 35 : -60;
      } else if (!mv.effects?.some((e) => e.kind === 'protect')) {
        // no time to set up or poison when the next hit knocks it out, nor on a foe about to fall
        if (inDanger) score *= score > 0 ? 0.2 : 1;
        else if (target.hp / maxHp(target) < 0.3) score *= score > 0 ? 0.3 : 1;
        if (mv.effects?.some((e) => e.kind === 'stage' && e.target === 'self')) {
          if (foeHit.dmg < hp / 3) score *= score > 0 ? 1.6 : 1;
          else if (foeHit.dmg >= hp / 2) score *= score > 0 ? 0.3 : 1;
        }
      }
    }
    score *= 0.9 + nextRandom(st) * 0.2;
    if (score > pickScore) {
      pickScore = score;
      pick = i;
    }
  }
  return { type: 'move', slot: pick };
}

/** A potion from the trainer's bag that saves its Bestiole from the next hit, or a cure for a crippling status. */
function pickPotion(st: BattleState, foeHit: number): Action | null {
  const me = st.sides[1];
  const bag = me.items?.filter((i) => i.n > 0) ?? [];
  if (!bag.length) return null;
  const m = activeMon(me);
  const target = me.active;
  const low = m.hp <= foeHit || m.hp / maxHp(m) < 0.3;
  if (low) {
    // the biggest potion that lets it take the next hit
    const heals = bag.map((i) => item(i.id)).filter((d) => d.kind === 'heal').sort((a, b) => b.amount - a.amount);
    const heal = heals.find((d) => m.hp + Math.min(d.amount, maxHp(m) - m.hp) > foeHit && itemUsable(st, d.id, target, 1));
    if (heal) return { type: 'item', item: heal.id, target };
    return null;
  }
  // asleep, frozen or paralysed while still healthy: a Retouche
  if (m.status && m.status !== 'poison' && m.hp / maxHp(m) > 0.5) {
    const cure = bag.map((i) => item(i.id)).find((d) => d.kind === 'status' && itemUsable(st, d.id, target, 1));
    if (cure) return { type: 'item', item: cure.id, target };
  }
  return null;
}
