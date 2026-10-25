import type { LText } from '../../i18n';
import { creature } from '../../data/creatures';
import { ITEM_BY_ID, item } from '../../data/items';
import { move } from '../../data/moves';
import type { HoldEffect, Major, MoveDef, StageKey } from '../../data/schema';
import { effectiveness } from '../../data/types';
import { nextRandom, randomInt } from '../rng';
import { addXp, gainEvs, learnMove, maxHp, statsOf, xpYield, type Mon } from './creature';

export type Side = 0 | 1;
export type BattleKind = 'wild' | 'trainer';
export type BattleResult = 'win' | 'lose' | 'capture' | 'flee';

export interface Volatile {
  stages: Record<StageKey, number>;
  confusion: number;
  flinch: boolean;
  /** Dire Hit: one more critical-hit stage (lost when withdrawn). */
  focus: boolean;
  /** Choice items: the only move allowed until the creature is withdrawn. */
  lock: string | null;
}

export interface SideState {
  name: LText;
  party: Mon[];
  active: number;
  isAI: boolean;
  vol: Volatile;
  /** Guard Spec: turns left during which the foe can't lower this side's stats (whole side). */
  mist: number;
}

export interface BattleState {
  kind: BattleKind;
  sides: [SideState, SideState];
  rng: number;
  turn: number;
  result: BattleResult | null;
  /** The player's active creature fainted: a replacement must be chosen. */
  needSwitch: boolean;
  /** Level-up moves waiting for a "forget a move?" answer, in order. */
  learnQueue: { uid: string; move: string }[];
  /** Player creatures that fought the current enemy (they share the XP). */
  participants: string[];
  escapes: number;
}

export type Action =
  | { type: 'move'; slot: number }
  | { type: 'switch'; to: number }
  | { type: 'item'; item: string; target: number }
  | { type: 'ball'; item: string }
  | { type: 'run' }
  | { type: 'replace'; to: number }
  | { type: 'learn'; forget: number | null };

export type BattleEvent =
  | { t: 'sendOut'; side: Side; idx: number }
  | { t: 'withdraw'; side: Side; idx: number }
  | { t: 'move'; side: Side; move: string }
  | { t: 'miss'; side: Side }
  | { t: 'fail'; side: Side }
  | { t: 'noEffect'; side: Side }
  | { t: 'damage'; side: Side; amount: number; crit?: boolean; eff?: number }
  | { t: 'hits'; count: number }
  | { t: 'heal'; side: Side; amount: number }
  | { t: 'status'; side: Side; status: Major }
  | { t: 'already'; side: Side; status: Major }
  | { t: 'stage'; side: Side; stat: StageKey; delta: number; capped: boolean }
  | { t: 'confuse'; side: Side }
  | { t: 'confusedHit'; side: Side; amount: number }
  | { t: 'isConfused'; side: Side }
  | { t: 'snapOut'; side: Side }
  | { t: 'flinch'; side: Side }
  | { t: 'asleep'; side: Side }
  | { t: 'wake'; side: Side }
  | { t: 'paralyzed'; side: Side }
  | { t: 'residual'; side: Side; status: 'poison' | 'burn'; amount: number }
  | { t: 'recoil'; side: Side; amount: number }
  | { t: 'drain'; side: Side; amount: number }
  | { t: 'rest'; side: Side }
  | { t: 'faint'; side: Side; idx: number }
  | { t: 'xp'; idx: number; amount: number }
  | { t: 'levelUp'; idx: number; level: number }
  | { t: 'learned'; idx: number; move: string }
  | { t: 'learnPrompt'; idx: number; move: string }
  | { t: 'forgot'; idx: number; old: string; move: string }
  | { t: 'gaveUp'; idx: number; move: string }
  | { t: 'useItem'; item: string; target: number; amount?: number }
  /** A held berry was eaten (HP restored and/or a status cured). */
  | { t: 'berry'; side: Side; item: string; amount?: number; cured?: Major | 'confusion' }
  | { t: 'leftovers'; side: Side; item: string; amount: number }
  | { t: 'focus'; side: Side }
  /** A held item restored HP (Shell Bell) or cost HP (Life Orb, the foe's Rocky Helmet). */
  | { t: 'itemHeal'; side: Side; item: string; amount: number }
  | { t: 'itemHurt'; side: Side; item: string; amount: number }
  /** Focus Sash: hung on with 1 HP. */
  | { t: 'sash'; side: Side; item: string }
  /** Quick Claw: moves first. */
  | { t: 'quick'; side: Side; item: string }
  /** Guard Spec starts (`on`) or wears off. */
  | { t: 'guard'; side: Side; on: boolean }
  /** A foe's stat drop was blocked by Guard Spec. */
  | { t: 'guarded'; side: Side }
  | { t: 'ball'; item: string; shakes: number; caught: boolean }
  | { t: 'blocked' }
  | { t: 'run'; ok: boolean }
  | { t: 'cantRun' }
  | { t: 'end'; result: BattleResult };

export interface Step {
  state: BattleState;
  events: BattleEvent[];
  snaps: BattleState[];
}

export interface SideSetup {
  name: LText;
  party: Mon[];
  isAI: boolean;
}

export interface BattleSetup {
  kind: BattleKind;
  seed: number;
  player: SideSetup;
  enemy: SideSetup;
}

export class IllegalAction extends Error {}

interface Out {
  push(e: BattleEvent): void;
}

class Recorder implements Out {
  events: BattleEvent[] = [];
  snaps: BattleState[] = [];
  constructor(private st: BattleState, private withSnaps: boolean) {}
  push(e: BattleEvent) {
    this.events.push(e);
    if (this.withSnaps) this.snaps.push(structuredClone(this.st));
  }
}

const STRUGGLE = 'lutte';
const other = (s: Side): Side => (s === 0 ? 1 : 0);
const freshVol = (): Volatile => ({ stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, confusion: 0, flinch: false, focus: false, lock: null });
/** Effect of the item a creature holds (undefined if none or not a held item). */
const held = (m: Mon): HoldEffect | undefined => (m.item ? ITEM_BY_ID[m.item]?.hold : undefined);
const CHOICE: HoldEffect[] = ['choiceBand', 'choiceSpecs', 'choiceScarf'];
/** Stat multipliers of held items (Choice items, Assault Vest). */
const HELD_STAT: Partial<Record<HoldEffect, Partial<Record<'atk' | 'def' | 'spa' | 'spd' | 'spe', number>>>> = {
  choiceBand: { atk: 1.5 }, choiceSpecs: { spa: 1.5 }, choiceScarf: { spe: 1.5 }, assaultVest: { spd: 1.5 },
};
/** Gen 3 critical-hit chance by stage (high-crit moves +1, Dire Hit +1). */
const CRIT = [1 / 16, 1 / 8, 1 / 4, 1 / 3, 1 / 2];
export const activeMon = (s: SideState): Mon => s.party[s.active];
const alive = (m: Mon) => m.hp > 0;

// ------------------------------------------------------------------ setup

export function createBattle(setup: BattleSetup, withSnaps = false): Step {
  const mk = (s: SideSetup): SideState => ({
    name: s.name, party: structuredClone(s.party), active: Math.max(0, s.party.findIndex(alive)), isAI: s.isAI, vol: freshVol(), mist: 0,
  });
  const state: BattleState = {
    kind: setup.kind, sides: [mk(setup.player), mk(setup.enemy)], rng: setup.seed >>> 0, turn: 0, result: null,
    needSwitch: false, learnQueue: [], participants: [], escapes: 0,
  };
  const out = new Recorder(state, withSnaps);
  out.push({ t: 'sendOut', side: 1, idx: state.sides[1].active });
  out.push({ t: 'sendOut', side: 0, idx: state.sides[0].active });
  state.participants = [activeMon(state.sides[0]).uid];
  checkBerry(state, 1, out);
  checkBerry(state, 0, out);
  return { state, events: out.events, snaps: out.snaps };
}

// ------------------------------------------------------------------ helpers

export function stageMult(s: number) {
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
}
function accMult(s: number) {
  return s >= 0 ? (3 + s) / 3 : 3 / (3 - s);
}

export function effectiveStat(side: SideState, key: 'atk' | 'def' | 'spa' | 'spd' | 'spe'): number {
  const m = activeMon(side);
  let v = statsOf(m)[key] * stageMult(side.vol.stages[key]);
  if (key === 'spe' && m.status === 'paralyze') v *= 0.25;
  const h = held(m);
  if (h) v *= HELD_STAT[h]?.[key] ?? 1;
  return v;
}

/**
 * Moves the creature may pick: some PP left, only the locked move after a Choice item was used,
 * and only attacking moves with an Assault Vest. Empty = Struggle.
 */
export function usableSlots(m: Mon, vol?: Pick<Volatile, 'lock'>): number[] {
  let slots = m.moves.map((_, i) => i).filter((i) => m.moves[i].pp > 0);
  if (held(m) === 'assaultVest') slots = slots.filter((i) => move(m.moves[i].id).cat !== 'status');
  const lock = vol?.lock && m.moves.some((s) => s.id === vol.lock) ? vol.lock : null;
  return lock ? slots.filter((i) => m.moves[i].id === lock) : slots;
}

export function blocked(st: BattleState): boolean {
  return st.result !== null || st.needSwitch || st.learnQueue.length > 0;
}

function hurt(st: BattleState, side: Side, amount: number, out: Out, extra: Partial<Extract<BattleEvent, { t: 'damage' }>> = {}) {
  const m = activeMon(st.sides[side]);
  let dmg = Math.min(m.hp, Math.max(0, Math.round(amount)));
  // Focus Sash: a knockout from full HP leaves 1 HP instead (once)
  const sash = dmg >= m.hp && m.hp === maxHp(m) && m.hp > 1 && held(m) === 'focusSash' ? m.item! : null;
  if (sash) dmg = m.hp - 1;
  m.hp -= dmg;
  out.push({ t: 'damage', side, amount: dmg, ...extra });
  if (sash) {
    m.item = null;
    out.push({ t: 'sash', side, item: sash });
  }
  checkBerry(st, side, out);
  return dmg;
}

/** HP lost or regained because of a held item (Life Orb, Rocky Helmet, Shell Bell). */
function itemHp(st: BattleState, side: Side, item: string, amount: number, out: Out) {
  const m = activeMon(st.sides[side]);
  if (!alive(m)) return;
  if (amount < 0) {
    const lost = Math.min(m.hp, -amount);
    m.hp -= lost;
    out.push({ t: 'itemHurt', side, item, amount: lost });
    checkBerry(st, side, out);
  } else {
    const h = Math.min(maxHp(m) - m.hp, amount);
    if (h <= 0) return;
    m.hp += h;
    out.push({ t: 'itemHeal', side, item, amount: h });
  }
}

/**
 * A held berry is eaten as soon as it helps: HP at half or less, or a status it cures. Checked
 * after anything that hurts or afflicts the active creature, on both sides.
 */
function checkBerry(st: BattleState, side: Side, out: Out) {
  const s = st.sides[side];
  const m = activeMon(s);
  const def = m?.item ? ITEM_BY_ID[m.item] : undefined;
  if (!def || def.kind !== 'berry' || !alive(m)) return;
  if (def.amount > 0 && m.hp * 2 <= maxHp(m) && m.hp < maxHp(m)) {
    const h = Math.min(def.amount, maxHp(m) - m.hp);
    m.hp += h;
    m.item = null;
    out.push({ t: 'berry', side, item: def.id, amount: h });
    return;
  }
  const cures = def.cures ?? [];
  if (m.status && cures.includes(m.status)) {
    const cured = m.status;
    m.status = null;
    m.sleepTurns = 0;
    m.item = null;
    out.push({ t: 'berry', side, item: def.id, cured });
  } else if (s.vol.confusion > 0 && cures.includes('confusion')) {
    s.vol.confusion = 0;
    m.item = null;
    out.push({ t: 'berry', side, item: def.id, cured: 'confusion' });
  }
}

function healSide(st: BattleState, side: Side, amount: number, out: Out): number {
  const m = activeMon(st.sides[side]);
  const h = Math.min(maxHp(m) - m.hp, Math.max(0, Math.round(amount)));
  if (h > 0) {
    m.hp += h;
    out.push({ t: 'heal', side, amount: h });
  }
  return h;
}

function setStatus(st: BattleState, side: Side, status: Major, out: Out, fromMove: boolean): boolean {
  const m = activeMon(st.sides[side]);
  if (!alive(m)) return false;
  if (m.status) {
    if (fromMove) out.push({ t: 'already', side, status: m.status });
    return false;
  }
  m.status = status;
  if (status === 'sleep') m.sleepTurns = 1 + randomInt(st, 3);
  out.push({ t: 'status', side, status });
  checkBerry(st, side, out);
  return true;
}

/** `byFoe`: the change comes from the other side (Guard Spec blocks those drops). */
function changeStage(st: BattleState, side: Side, stat: StageKey, delta: number, out: Out, byFoe = false) {
  if (byFoe && delta < 0 && st.sides[side].mist > 0) {
    out.push({ t: 'guarded', side });
    return;
  }
  const v = st.sides[side].vol;
  const before = v.stages[stat];
  const after = Math.max(-6, Math.min(6, before + delta));
  v.stages[stat] = after;
  out.push({ t: 'stage', side, stat, delta: after - before, capped: after === before });
}

function switchIn(st: BattleState, side: Side, to: number, out: Out) {
  const s = st.sides[side];
  if (s.party[s.active] && alive(s.party[s.active])) out.push({ t: 'withdraw', side, idx: s.active });
  s.active = to;
  s.vol = freshVol();
  out.push({ t: 'sendOut', side, idx: to });
  if (side === 0 && !st.participants.includes(activeMon(s).uid)) st.participants.push(activeMon(s).uid);
  checkBerry(st, side, out);
}

// ------------------------------------------------------------------ damage

/** Gen 3 style damage for one hit. */
export function computeDamage(st: { rng: number }, atkSide: SideState, defSide: SideState, mv: MoveDef, power: number, forceCrit?: boolean) {
  const a = activeMon(atkSide), d = activeMon(defSide);
  const phys = mv.cat === 'phys';
  const A = effectiveStat(atkSide, phys ? 'atk' : 'spa') * (phys && a.status === 'burn' ? 0.5 : 1);
  const D = effectiveStat(defSide, phys ? 'def' : 'spd');
  const h = held(a);
  const critChance = CRIT[(mv.effects?.some((e) => e.kind === 'highCrit') ? 1 : 0) + (atkSide.vol.focus ? 1 : 0) + (h === 'scopeLens' ? 1 : 0)];
  // type boosters (Charcoal, Mystic Water…): +20% power
  if (h === 'typeBoost' && mv.id !== STRUGGLE && ITEM_BY_ID[a.item!]?.type === mv.type) power = Math.floor(power * 1.2);
  const crit = forceCrit ?? nextRandom(st) < critChance;
  let dmg = Math.floor(Math.floor((Math.floor((2 * a.level) / 5 + 2) * power * A) / D) / 50) + 2;
  if (crit) dmg *= 2;
  // Struggle is typeless: no STAB, hits everything
  const typeless = mv.id === STRUGGLE;
  if (!typeless && creature(a.species).type === mv.type) dmg = Math.floor(dmg * 1.5);
  const eff = typeless ? 1 : effectiveness(mv.type, creature(d.species).type);
  dmg = Math.floor(dmg * eff);
  dmg = Math.floor((dmg * (85 + randomInt(st, 16))) / 100);
  if (h === 'lifeOrb' && mv.id !== STRUGGLE) dmg = Math.floor(dmg * 1.3);
  if (eff > 0) dmg = Math.max(1, dmg);
  return { dmg, crit, eff };
}

function hitCount(st: BattleState, mv: MoveDef): number {
  const m = mv.effects?.find((e) => e.kind === 'multi');
  if (!m || m.kind !== 'multi') return 1;
  if (m.min === m.max) return m.min;
  // Gen 3 distribution for 2–5 hits
  const r = randomInt(st, 8);
  return Math.min(m.max, r < 3 ? 2 : r < 6 ? 3 : r < 7 ? 4 : 5);
}

// ------------------------------------------------------------------ moves


function useMove(st: BattleState, side: Side, slot: number, out: Out) {
  const s = st.sides[side];
  const foeSide = other(side);
  const foe = st.sides[foeSide];
  const user = activeMon(s);
  const target = activeMon(foe);
  if (!alive(user)) return;
  const moveId = slot < 0 ? STRUGGLE : user.moves[slot]?.id ?? STRUGGLE;
  const mv = move(moveId);
  const onlyAsleep = mv.effects?.some((e) => e.kind === 'onlyAsleep');

  // can the user act?
  if (user.status === 'sleep') {
    if (user.sleepTurns <= 0) {
      user.status = null;
      out.push({ t: 'wake', side });
    } else {
      user.sleepTurns--;
      out.push({ t: 'asleep', side });
      if (!onlyAsleep) return;
    }
  }
  if (s.vol.flinch) {
    out.push({ t: 'flinch', side });
    return;
  }
  if (s.vol.confusion > 0) {
    s.vol.confusion--;
    if (s.vol.confusion === 0) {
      out.push({ t: 'snapOut', side });
    } else {
      out.push({ t: 'isConfused', side });
      if (nextRandom(st) < 0.5) {
        // typeless 40-power physical hit on itself
        const A = effectiveStat(s, 'atk'), D = effectiveStat(s, 'def');
        let dmg = Math.floor(Math.floor((Math.floor((2 * user.level) / 5 + 2) * 40 * A) / D) / 50) + 2;
        dmg = Math.max(1, Math.floor((dmg * (85 + randomInt(st, 16))) / 100));
        const amount = Math.min(user.hp, dmg);
        user.hp -= amount;
        out.push({ t: 'confusedHit', side, amount });
        checkBerry(st, side, out);
        return;
      }
    }
  }
  if (user.status === 'paralyze' && nextRandom(st) < 0.25) {
    out.push({ t: 'paralyzed', side });
    return;
  }

  if (slot >= 0 && user.moves[slot]) user.moves[slot].pp = Math.max(0, user.moves[slot].pp - 1);
  out.push({ t: 'move', side, move: moveId });
  if (moveId !== STRUGGLE && !s.vol.lock && CHOICE.includes(held(user)!)) s.vol.lock = moveId;

  if (onlyAsleep && user.status !== 'sleep') {
    out.push({ t: 'fail', side });
    return;
  }
  const targetsFoe = mv.cat !== 'status' || (mv.effects ?? []).some((e) => e.kind === 'status' || e.kind === 'confuse' || (e.kind === 'stage' && e.target === 'foe'));
  if (targetsFoe && !alive(target)) {
    out.push({ t: 'fail', side });
    return;
  }
  // type immunity is announced before any accuracy roll
  if (mv.cat !== 'status' && moveId !== STRUGGLE && effectiveness(mv.type, creature(target.species).type) === 0) {
    out.push({ t: 'noEffect', side: foeSide });
    return;
  }
  // accuracy
  if (mv.acc !== null && targetsFoe) {
    const chance = (mv.acc / 100) * accMult(Math.max(-6, Math.min(6, s.vol.stages.acc - foe.vol.stages.eva)));
    if (nextRandom(st) >= chance) {
      out.push({ t: 'miss', side });
      return;
    }
  }

  if (mv.cat === 'status') {
    applyStatusMove(st, side, mv, out);
    return;
  }

  // damaging move
  let power = mv.power;
  for (const e of mv.effects ?? []) if (e.kind === 'boostIfFoeAsleep' && target.status === 'sleep') power *= e.mult;
  const hits = hitCount(st, mv);
  let total = 0;
  let done = 0;
  for (let h = 0; h < hits && alive(target) && alive(user); h++) {
    const { dmg, crit, eff } = computeDamage(st, s, foe, mv, power);
    const dealt = hurt(st, foeSide, dmg, out, { crit, eff });
    total += dealt;
    done++;
    // Rocky Helmet: hitting its holder up close hurts
    if (dealt > 0 && mv.cat === 'phys' && moveId !== STRUGGLE && held(target) === 'rockyHelmet') itemHp(st, side, target.item!, -Math.max(1, Math.floor(maxHp(user) / 6)), out);
  }
  if (hits > 1) out.push({ t: 'hits', count: done });
  const mine = held(user);
  if (total > 0 && mine === 'shellBell') itemHp(st, side, user.item!, Math.max(1, Math.floor(total / 8)), out);
  if (total > 0 && mine === 'lifeOrb' && moveId !== STRUGGLE) itemHp(st, side, user.item!, -Math.max(1, Math.floor(maxHp(user) / 10)), out);
  if (total > 0 && mine === 'kingsRock' && alive(target) && !mv.effects?.some((e) => e.kind === 'flinch') && nextRandom(st) < 0.1) foe.vol.flinch = true;

  for (const e of mv.effects ?? []) {
    switch (e.kind) {
      case 'drain':
        healSide(st, side, (total * e.pct) / 100, out);
        break;
      case 'recoil': {
        const r = Math.max(1, Math.round((total * e.pct) / 100));
        const m = activeMon(s);
        const amount = Math.min(m.hp, r);
        m.hp -= amount;
        out.push({ t: 'recoil', side, amount });
        checkBerry(st, side, out);
        break;
      }
      case 'status':
        if (alive(target) && nextRandom(st) * 100 < e.chance) setStatus(st, foeSide, e.status, out, false);
        break;
      case 'confuse':
        if (alive(target) && foe.vol.confusion === 0 && nextRandom(st) * 100 < e.chance) {
          foe.vol.confusion = 2 + randomInt(st, 4);
          out.push({ t: 'confuse', side: foeSide });
          checkBerry(st, foeSide, out);
        }
        break;
      case 'flinch':
        if (alive(target) && nextRandom(st) * 100 < e.chance) foe.vol.flinch = true;
        break;
      case 'stage':
        if (nextRandom(st) * 100 < e.chance) {
          if (e.target === 'self') changeStage(st, side, e.stat, e.stages, out);
          else if (alive(target)) changeStage(st, foeSide, e.stat, e.stages, out, true);
        }
        break;
    }
  }
}

function applyStatusMove(st: BattleState, side: Side, mv: MoveDef, out: Out) {
  const s = st.sides[side];
  const foeSide = other(side);
  const foe = st.sides[foeSide];
  const user = activeMon(s);
  let anything = false;
  let reported = false;
  for (const e of mv.effects ?? []) {
    switch (e.kind) {
      case 'status':
        if (setStatus(st, foeSide, e.status, out, true)) anything = true;
        else reported = true;
        break;
      case 'confuse':
        if (foe.vol.confusion > 0) break;
        foe.vol.confusion = 2 + randomInt(st, 4);
        out.push({ t: 'confuse', side: foeSide });
        checkBerry(st, foeSide, out);
        anything = true;
        break;
      case 'stage':
        changeStage(st, e.target === 'self' ? side : foeSide, e.stat, e.stages, out, e.target !== 'self');
        anything = true;
        break;
      case 'heal':
        anything = healSide(st, side, (maxHp(user) * e.pct) / 100, out) > 0;
        break;
      case 'rest':
        if (user.hp >= maxHp(user)) break;
        user.status = 'sleep';
        user.sleepTurns = 2;
        out.push({ t: 'rest', side });
        healSide(st, side, (maxHp(user) * e.pct) / 100, out);
        checkBerry(st, side, out);
        anything = true;
        break;
    }
  }
  if (!anything && !reported) out.push({ t: 'fail', side });
}

// ------------------------------------------------------------------ catching / running

export function catchChance(target: Mon, ballBonus: number): { a: number; p: number } {
  const max = maxHp(target);
  const statusBonus = target.status === 'sleep' ? 2 : target.status ? 1.5 : 1;
  const a = Math.floor((((3 * max - 2 * target.hp) * creature(target.species).catchRate * ballBonus) / (3 * max)) * statusBonus);
  if (a >= 255) return { a, p: 1 };
  const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, a))));
  return { a, p: (b / 65536) ** 4 };
}

function throwBall(st: BattleState, ballId: string, out: Out) {
  if (st.kind !== 'wild') {
    out.push({ t: 'blocked' });
    return;
  }
  const target = activeMon(st.sides[1]);
  const bonus = item(ballId).amount / 10;
  const { a } = catchChance(target, bonus);
  let shakes = 0;
  if (a >= 255) shakes = 4;
  else {
    const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, a))));
    while (shakes < 4 && randomInt(st, 65536) < b) shakes++;
  }
  const caught = shakes === 4;
  out.push({ t: 'ball', item: ballId, shakes: Math.min(3, shakes), caught });
  if (caught) finish(st, 'capture', out);
}

function tryRun(st: BattleState, out: Out): boolean {
  if (st.kind !== 'wild') {
    out.push({ t: 'cantRun' });
    return false;
  }
  st.escapes++;
  const mine = effectiveStat(st.sides[0], 'spe');
  const theirs = effectiveStat(st.sides[1], 'spe');
  const ok = mine >= theirs || randomInt(st, 256) < Math.floor((mine * 128) / Math.max(1, theirs)) + 30 * st.escapes;
  out.push({ t: 'run', ok });
  if (ok) finish(st, 'flee', out);
  return ok;
}

// ------------------------------------------------------------------ items

export function itemUsable(st: BattleState, itemId: string, target: number): boolean {
  const def = item(itemId);
  const m = st.sides[0].party[target];
  if (def.kind === 'ball') return st.kind === 'wild';
  if (!m) return false;
  if (def.kind === 'heal') return alive(m) && m.hp < maxHp(m);
  if (def.kind === 'status') return alive(m) && !!m.status;
  if (def.kind === 'berry') {
    const confused = target === st.sides[0].active && st.sides[0].vol.confusion > 0;
    return alive(m) && ((def.amount > 0 && m.hp < maxHp(m)) || (!!m.status && !!def.cures?.includes(m.status)) || (confused && !!def.cures?.includes('confusion')));
  }
  if (def.kind === 'revive') return !alive(m);
  if (def.kind === 'battle') {
    const me = st.sides[0];
    if (target !== me.active || !alive(m)) return false;
    if (def.boost === 'crit') return !me.vol.focus;
    if (def.boost === 'mist') return me.mist === 0;
    return !!def.boost && me.vol.stages[def.boost] < 6;
  }
  return false;
}

function useItem(st: BattleState, itemId: string, target: number, out: Out) {
  const def = item(itemId);
  const m = st.sides[0].party[target];
  if (def.kind === 'heal') {
    const h = Math.min(def.amount, maxHp(m) - m.hp);
    m.hp += h;
    out.push({ t: 'useItem', item: itemId, target, amount: h });
  } else if (def.kind === 'status') {
    m.status = null;
    m.sleepTurns = 0;
    if (target === st.sides[0].active) st.sides[0].vol.confusion = 0;
    out.push({ t: 'useItem', item: itemId, target });
  } else if (def.kind === 'revive') {
    m.hp = Math.max(1, Math.floor((maxHp(m) * def.amount) / 100));
    m.status = null;
    out.push({ t: 'useItem', item: itemId, target, amount: m.hp });
  } else if (def.kind === 'berry') {
    const h = Math.min(def.amount, maxHp(m) - m.hp);
    m.hp += h;
    if (m.status && def.cures?.includes(m.status)) {
      m.status = null;
      m.sleepTurns = 0;
    }
    if (target === st.sides[0].active && def.cures?.includes('confusion')) st.sides[0].vol.confusion = 0;
    out.push({ t: 'useItem', item: itemId, target, amount: h || undefined });
  } else if (def.kind === 'battle') {
    out.push({ t: 'useItem', item: itemId, target });
    if (def.boost === 'crit') {
      st.sides[0].vol.focus = true;
      out.push({ t: 'focus', side: 0 });
    } else if (def.boost === 'mist') {
      st.sides[0].mist = 5;
      out.push({ t: 'guard', side: 0, on: true });
    } else if (def.boost) changeStage(st, 0, def.boost, 1, out);
  }
}

// ------------------------------------------------------------------ turn flow

function finish(st: BattleState, result: BattleResult, out: Out) {
  if (st.result) return;
  st.result = result;
  out.push({ t: 'end', result });
}

/**
 * Who gets XP for a knocked-out foe (Gen 3): the creatures that fought it share it; when some hold
 * the Tracing Paper (Exp. Share), fighters share one half and holders the other.
 */
function xpShares(st: BattleState, foeMon: Mon): { m: Mon; i: number; amount: number }[] {
  const party = st.sides[0].party.map((m, i) => ({ m, i })).filter(({ m }) => alive(m));
  const fighters = party.filter(({ m }) => st.participants.includes(m.uid));
  const holders = party.filter(({ m }) => m.item && ITEM_BY_ID[m.item]?.hold === 'expShare');
  const full = xpYield(foeMon, st.kind === 'trainer', 1);
  const part = (pool: number, n: number) => Math.max(1, Math.floor(pool / n));
  const gain = new Map<number, number>();
  if (!holders.length) for (const { i } of fighters) gain.set(i, part(full, fighters.length));
  else {
    for (const { i } of fighters) gain.set(i, part(Math.floor(full / 2), fighters.length));
    for (const { i } of holders) gain.set(i, (gain.get(i) ?? 0) + part(Math.floor(full / 2), holders.length));
  }
  return party.filter(({ i }) => gain.has(i)).map(({ m, i }) => ({ m, i, amount: gain.get(i)! }));
}

/** Handles fainted actives: XP, level-ups, replacements, end of battle. */
function checkFaints(st: BattleState, out: Out) {
  if (st.result) return;
  const foe = st.sides[1];
  const me = st.sides[0];
  const foeMon = activeMon(foe);
  if (!alive(foeMon)) {
    out.push({ t: 'faint', side: 1, idx: foe.active });
    for (const { m, i, amount } of xpShares(st, foeMon)) {
      gainEvs(m, foeMon.species);
      out.push({ t: 'xp', idx: i, amount });
      for (const up of addXp(m, amount)) {
        out.push({ t: 'levelUp', idx: i, level: up.level });
        for (const mv of up.learned) out.push({ t: 'learned', idx: i, move: mv });
        for (const mv of up.pending) {
          st.learnQueue.push({ uid: m.uid, move: mv });
          out.push({ t: 'learnPrompt', idx: i, move: mv });
        }
      }
    }
    const next = foe.party.findIndex((m) => alive(m));
    if (next < 0) {
      finish(st, 'win', out);
      return;
    }
    switchIn(st, 1, next, out);
    st.participants = alive(activeMon(me)) ? [activeMon(me).uid] : [];
  }
  const mine = activeMon(me);
  if (!alive(mine) && !st.needSwitch) {
    out.push({ t: 'faint', side: 0, idx: me.active });
    st.participants = st.participants.filter((u) => u !== mine.uid);
    if (!me.party.some(alive)) finish(st, 'lose', out);
    else st.needSwitch = true;
  }
}

type Planned = { side: Side; action: Action; prio: number; speed: number; uid: string; quick: boolean };

/** Applies the player's action (and the AI's answer when it is a full turn). */
export function act(prev: BattleState, action: Action, enemy: Action, withSnaps = false): Step {
  const st: BattleState = structuredClone(prev);
  const out = new Recorder(st, withSnaps);
  const me = st.sides[0];

  // learning a move can still happen after the last knockout
  if (action.type === 'learn') {
    const q = st.learnQueue.shift();
    if (!q) throw new IllegalAction('nothing to learn');
    const idx = me.party.findIndex((m) => m.uid === q.uid);
    const m = me.party[idx];
    if (action.forget === null || !m) out.push({ t: 'gaveUp', idx, move: q.move });
    else {
      const old = m.moves[action.forget].id;
      learnMove(m, action.forget, q.move);
      out.push({ t: 'forgot', idx, old, move: q.move });
    }
    return { state: st, events: out.events, snaps: out.snaps };
  }
  if (st.result) throw new IllegalAction('battle over');
  if (action.type === 'replace') {
    if (!st.needSwitch) throw new IllegalAction('no switch needed');
    if (!me.party[action.to] || !alive(me.party[action.to])) throw new IllegalAction('cannot send that one');
    st.needSwitch = false;
    switchIn(st, 0, action.to, out);
    return { state: st, events: out.events, snaps: out.snaps };
  }
  if (blocked(st)) throw new IllegalAction('blocked');
  validate(st, action);

  st.turn++;
  me.vol.flinch = false;
  st.sides[1].vol.flinch = false;

  // non-move actions resolve first
  if (action.type === 'run') {
    if (tryRun(st, out)) return { state: st, events: out.events, snaps: out.snaps };
  } else if (action.type === 'switch') {
    switchIn(st, 0, action.to, out);
  } else if (action.type === 'item') {
    useItem(st, action.item, action.target, out);
  } else if (action.type === 'ball') {
    throwBall(st, action.item, out);
    if (st.result) return { state: st, events: out.events, snaps: out.snaps };
  }

  if (enemy.type === 'switch' && st.sides[1].party[enemy.to] && alive(st.sides[1].party[enemy.to])) switchIn(st, 1, enemy.to, out);

  const plans: Planned[] = [];
  if (action.type === 'move') plans.push(plan(st, 0, action));
  if (enemy.type === 'move') plans.push(plan(st, 1, enemy));
  plans.sort((a, b) => b.prio - a.prio || Number(b.quick) - Number(a.quick) || b.speed - a.speed || (nextRandom(st) < 0.5 ? -1 : 1));

  for (const p of plans) {
    if (st.result || st.needSwitch) break;
    // a creature sent in to replace a fainted one doesn't act this turn
    if (activeMon(st.sides[p.side]).uid !== p.uid) continue;
    if (p.action.type === 'move') {
      const m = activeMon(st.sides[p.side]);
      if (p.quick && plans.length > 1 && p === plans[0] && plans[1].speed > p.speed) out.push({ t: 'quick', side: p.side, item: m.item! });
      useMove(st, p.side, p.action.slot, out);
      // the slower side can't flinch the faster one once it already moved
      st.sides[p.side].vol.flinch = false;
      checkFaints(st, out);
    }
  }

  // end of turn: poison / burn
  for (const side of [0, 1] as Side[]) {
    if (st.result) break;
    const s = st.sides[side];
    const m = activeMon(s);
    if (alive(m) && (m.status === 'poison' || m.status === 'burn')) {
      const amount = Math.min(m.hp, Math.max(1, Math.floor(maxHp(m) / 8)));
      m.hp -= amount;
      out.push({ t: 'residual', side, status: m.status, amount });
      checkBerry(st, side, out);
      checkFaints(st, out);
    }
  }
  // end of turn: held snacks (Leftovers)
  for (const side of [0, 1] as Side[]) {
    if (st.result) break;
    const m = activeMon(st.sides[side]);
    if (!alive(m) || m.hp >= maxHp(m) || !m.item || ITEM_BY_ID[m.item]?.hold !== 'leftovers') continue;
    const amount = Math.min(maxHp(m) - m.hp, Math.max(1, Math.floor(maxHp(m) / 16)));
    m.hp += amount;
    out.push({ t: 'leftovers', side, item: m.item, amount });
  }
  // end of turn: Guard Spec counts down
  for (const side of [0, 1] as Side[]) {
    const s = st.sides[side];
    if (st.result || s.mist <= 0) continue;
    s.mist--;
    if (s.mist === 0) out.push({ t: 'guard', side, on: false });
  }
  me.vol.flinch = false;
  st.sides[1].vol.flinch = false;
  return { state: st, events: out.events, snaps: out.snaps };
}

function plan(st: BattleState, side: Side, a: Action): Planned {
  const s = st.sides[side];
  const m = activeMon(s);
  const slot = a.type === 'move' ? a.slot : -1;
  const id = slot >= 0 && m.moves[slot] ? m.moves[slot].id : STRUGGLE;
  // Quick Claw: 20% chance to go first among moves of the same priority
  const quick = held(m) === 'quickClaw' && nextRandom(st) < 0.2;
  return { side, action: a, prio: move(id).priority ?? 0, speed: effectiveStat(s, 'spe'), uid: m.uid, quick };
}

function validate(st: BattleState, a: Action) {
  const me = st.sides[0];
  const m = activeMon(me);
  switch (a.type) {
    case 'move':
      if (a.slot >= 0 && (!m.moves[a.slot] || m.moves[a.slot].pp <= 0)) throw new IllegalAction('no PP');
      if (a.slot >= 0 && !usableSlots(m, me.vol).includes(a.slot)) throw new IllegalAction('move not allowed (Choice item or Assault Vest)');
      if (a.slot < 0 && usableSlots(m, me.vol).length) throw new IllegalAction('struggle only without PP');
      break;
    case 'switch':
      if (a.to === me.active || !me.party[a.to] || !alive(me.party[a.to])) throw new IllegalAction('cannot switch');
      break;
    case 'item':
      if (!itemUsable(st, a.item, a.target)) throw new IllegalAction('cannot use item');
      break;
  }
}
