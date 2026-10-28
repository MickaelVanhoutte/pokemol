import type { LText } from '../../i18n';
import { creature, typesOf } from '../../data/creatures';
import { ITEM_BY_ID, item } from '../../data/items';
import { move } from '../../data/moves';
import type { HoldEffect, Major, MoveDef, StageKey, Weather } from '../../data/schema';
import { effectiveness } from '../../data/types';
import { talentEffect, talentOf } from '../../data/talents';
import { nextRandom, randomInt } from '../rng';
import { addXp, gainEvs, learnMove, maxHp, statsOf, xpYield, type Mon } from './creature';

export type Side = 0 | 1;
export type BattleKind = 'wild' | 'trainer';
export type BattleResult = 'win' | 'lose' | 'capture' | 'flee';

export interface Volatile {
  stages: Record<StageKey, number>;
  confusion: number;
  flinch: boolean;
  /** Pencil Sharpener: one more critical-hit stage (lost when withdrawn). */
  focus: boolean;
  /** Stubborn items: the only move allowed until the creature is withdrawn. */
  lock: string | null;
  /** Shielded this turn (Paper Shield), and how many shields in a row (each one works less often). */
  protect: boolean;
  protectChain: number;
  /** A two-turn move charged on the last turn: it is used again (for free) this turn. */
  charging: { move: string; slot: number } | null;
  /** Out of reach while charging (up in the air, under the ground). */
  invuln: 'air' | 'ground' | null;
  /** Turns left tied up (Coil Thread): no fleeing, no switching, 1/16 HP lost each turn. */
  trap: number;
  /** A greedy seed drains 1/8 of its HP each turn. */
  seeded: boolean;
  /** HP left in its paper doll (0 = none). */
  sub: number;
  /** Badly poisoned: the poison hurts n/16 this turn (0 = ordinary poison). */
  toxic: number;
  /** Passe-Muraille: the next attack passes through it (set when it comes in). */
  phase: boolean;
}

export interface SideState {
  name: LText;
  party: Mon[];
  active: number;
  isAI: boolean;
  vol: Volatile;
  /** Protective Varnish: turns left during which the foe can't lower this side's stats (whole side). */
  guard: number;
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
  /** Rain, sunshine, sandstorm or hail, with the turns left. */
  weather: { kind: Weather; turns: number } | null;
  /** Night in Papeterre (Pleine Lune). */
  night?: boolean;
  /** A vision (the dream legendaries before the ending): balls go right through it. */
  noCatch?: boolean;
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
  /** A move that does nothing at all (Gigotage). */
  | { t: 'nothing' }
  | { t: 'noEffect'; side: Side }
  | { t: 'damage'; side: Side; amount: number; crit?: boolean; eff?: number }
  | { t: 'hits'; count: number }
  | { t: 'heal'; side: Side; amount: number }
  | { t: 'status'; side: Side; status: Major; bad?: boolean }
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
  | { t: 'regen'; side: Side; item: string; amount: number }
  | { t: 'focus'; side: Side }
  /** A held item restored HP (Greedy Bell) or cost HP (Fierce Marble, the foe's Spiky Helmet). */
  | { t: 'itemHeal'; side: Side; item: string; amount: number }
  | { t: 'itemHurt'; side: Side; item: string; amount: number }
  /** Steadfast Ribbon: hung on with 1 HP. */
  | { t: 'hangOn'; side: Side; item: string }
  /** Swift Quill: moves first. */
  | { t: 'quick'; side: Side; item: string }
  /** Protective Varnish starts (`on`) or wears off. */
  | { t: 'guard'; side: Side; on: boolean }
  /** A foe's stat drop was blocked by the varnish. */
  | { t: 'guarded'; side: Side }
  | { t: 'weather'; kind: Weather; on: boolean }
  | { t: 'weatherHurt'; side: Side; kind: Weather; amount: number }
  | { t: 'protect'; side: Side }
  /** The move hit a shield (`side`: the shielded creature). */
  | { t: 'protected'; side: Side }
  | { t: 'charge'; side: Side; move: string }
  | { t: 'trapped'; side: Side }
  | { t: 'trapHurt'; side: Side; amount: number }
  /** Mauvais Rêves: a sleeping Bestiole loses HP to nightmares (side = the sleeper). */
  | { t: 'nightmare'; side: Side; amount: number }
  | { t: 'freed'; side: Side }
  /** Tied up: it can't get away. */
  | { t: 'cantEscape'; side: Side }
  | { t: 'seeded'; side: Side }
  /** The seed drains `side` (the other side heals with a `heal` event). */
  | { t: 'seedDrain'; side: Side; amount: number }
  | { t: 'sub'; side: Side }
  | { t: 'subHit'; side: Side; crit?: boolean; eff?: number }
  | { t: 'subBroke'; side: Side }
  | { t: 'frozen'; side: Side }
  | { t: 'thaw'; side: Side }
  /** A talent acts. `note`: it endured a knockout, cured its status, or made a move useless. */
  | { t: 'talent'; side: Side; talent: string; note?: 'endure' | 'cured' | 'immune' | 'phased' }
  | { t: 'ball'; item: string; shakes: number; caught: boolean }
  | { t: 'blocked'; reflet?: boolean }
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
  night?: boolean;
  noCatch?: boolean;
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
export const freshVol = (): Volatile => ({
  stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }, confusion: 0, flinch: false, focus: false, lock: null,
  protect: false, protectChain: 0, charging: null, invuln: null, trap: 0, seeded: false, sub: 0, toxic: 0, phase: false,
});
/** Effect of the item a creature holds (undefined if none or not a held item). */
const held = (m: Mon): HoldEffect | undefined => (m.item ? ITEM_BY_ID[m.item]?.hold : undefined);
const LOCKING: HoldEffect[] = ['lockAtk', 'lockSpa', 'lockSpe'];
/** Stat multipliers of held items (Stubborn items, Painter’s Apron). */
const HELD_STAT: Partial<Record<HoldEffect, Partial<Record<'atk' | 'def' | 'spa' | 'spd' | 'spe', number>>>> = {
  lockAtk: { atk: 1.5 }, lockSpa: { spa: 1.5 }, lockSpe: { spe: 1.5 }, specialGuard: { spd: 1.5 },
};
/** Gen 3 critical-hit chance by stage (high-crit moves +1, Pencil Sharpener +1, Drafter’s Loupe +1). */
const CRIT = [1 / 16, 1 / 8, 1 / 4, 1 / 3, 1 / 2];
export const activeMon = (s: SideState): Mon => s.party[s.active];
const alive = (m: Mon) => m.hp > 0;

// ------------------------------------------------------------------ setup

export function createBattle(setup: BattleSetup, withSnaps = false): Step {
  const mk = (s: SideSetup): SideState => ({
    name: s.name, party: structuredClone(s.party), active: Math.max(0, s.party.findIndex(alive)), isAI: s.isAI, vol: freshVol(), guard: 0,
  });
  const state: BattleState = {
    kind: setup.kind, sides: [mk(setup.player), mk(setup.enemy)], rng: setup.seed >>> 0, turn: 0, result: null,
    needSwitch: false, learnQueue: [], participants: [], escapes: 0, weather: null, night: !!setup.night,
    ...(setup.noCatch ? { noCatch: true } : {}),
  };
  const out = new Recorder(state, withSnaps);
  out.push({ t: 'sendOut', side: 1, idx: state.sides[1].active });
  out.push({ t: 'sendOut', side: 0, idx: state.sides[0].active });
  state.participants = [activeMon(state.sides[0]).uid];
  onEntry(state, 1, out);
  onEntry(state, 0, out);
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

/**
 * A stat in battle (Gen 3): stages, paralysis and held items, floored after each step. On a critical
 * hit the attacker ignores its own drops and the defender its own raises (`crit`).
 */
export function effectiveStat(side: SideState, key: 'atk' | 'def' | 'spa' | 'spd' | 'spe', crit?: 'attacker' | 'defender', night = false): number {
  const m = activeMon(side);
  let stage = side.vol.stages[key];
  if ((crit === 'attacker' && stage < 0) || (crit === 'defender' && stage > 0)) stage = 0;
  let v = Math.floor(statsOf(m)[key] * stageMult(stage));
  if (key === 'spe' && m.status === 'paralyze') v = Math.floor(v / 4);
  const h = held(m);
  if (h) v = Math.floor(v * (HELD_STAT[h]?.[key] ?? 1));
  // Pleine Lune
  if (night && (key === 'spa' || key === 'spd') && talentEffect(m, 'nightBoost')) v = Math.floor(v * 1.3);
  return v;
}

/** Type effectiveness of a move used by `user` on `defender`, with Foudre Têtue (immunities ignored). */
export function moveEffectiveness(user: Mon, mv: MoveDef, defender: Mon): number {
  const types = typesOf(defender.species);
  const through = talentEffect(user, 'ignoreImmunity');
  if (through && through.type === mv.type) return types.reduce((e, t) => e * (effectiveness(mv.type, [t]) || 1), 1);
  return effectiveness(mv.type, types);
}

/** Same-type bonus of a move for `user` (Trait Assuré ×2, Arc-en-ciel: every move). */
export function stabOf(user: Mon, mv: MoveDef): number {
  if (mv.id === STRUGGLE) return 1;
  const own = typesOf(user.species).includes(mv.type) || !!talentEffect(user, 'allStab');
  return own ? (talentEffect(user, 'adaptability') ? 2 : 1.5) : 1;
}

/** Power multiplier from the user's talent for this move (Poings d’Acier, Ciseaux Affûtés). */
export function talentPowerMult(user: Mon, mv: MoveDef): number {
  const f = talentEffect(user, 'flagBoost');
  return f && mv[f.flag] ? f.mult : 1;
}

/**
 * Moves the creature may pick: some PP left, only the locked move after a Stubborn item was used,
 * and only attacking moves with the Painter’s Apron. Empty = Struggle.
 */
export function usableSlots(m: Mon, vol?: Pick<Volatile, 'lock'> & Partial<Pick<Volatile, 'charging'>>): number[] {
  // a two-turn move charged last turn must be released now
  if (vol?.charging && m.moves[vol.charging.slot]?.id === vol.charging.move) return [vol.charging.slot];
  let slots = m.moves.map((_, i) => i).filter((i) => m.moves[i].pp > 0);
  if (held(m) === 'specialGuard') slots = slots.filter((i) => move(m.moves[i].id).cat !== 'status');
  const lock = vol?.lock && m.moves.some((s) => s.id === vol.lock) ? vol.lock : null;
  return lock ? slots.filter((i) => m.moves[i].id === lock) : slots;
}

export function blocked(st: BattleState): boolean {
  return st.result !== null || st.needSwitch || st.learnQueue.length > 0;
}

function hurt(st: BattleState, side: Side, amount: number, out: Out, extra: Partial<Extract<BattleEvent, { t: 'damage' }>> = {}) {
  const m = activeMon(st.sides[side]);
  let dmg = Math.min(m.hp, Math.max(0, Math.round(amount)));
  const fromFull = dmg >= m.hp && m.hp === maxHp(m) && m.hp > 1;
  // Unbreakable talent, then the Steadfast Ribbon (once): a knockout from full HP leaves 1 HP
  const sturdy = fromFull && !!talentEffect(m, 'sturdy');
  const ribbon = fromFull && !sturdy && held(m) === 'holdOn' ? m.item! : null;
  if (sturdy || ribbon) dmg = m.hp - 1;
  m.hp -= dmg;
  out.push({ t: 'damage', side, amount: dmg, ...extra });
  if (sturdy) out.push({ t: 'talent', side, talent: talentOf(m).id, note: 'endure' });
  if (ribbon) {
    m.item = null;
    out.push({ t: 'hangOn', side, item: ribbon });
  }
  checkBerry(st, side, out);
  return dmg;
}

/** HP lost or regained because of a held item (Fierce Marble, Spiky Helmet, Greedy Bell). */
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

/** Types that can't get a status: Fire isn't burned, Ice isn't frozen, Poison and Metal aren't poisoned, Electric isn't paralysed. */
const STATUS_IMMUNE: Partial<Record<Major, string[]>> = { burn: ['feu'], freeze: ['glace'], poison: ['poison', 'acier'], paralyze: ['electrique'] };

function setStatus(st: BattleState, side: Side, status: Major, out: Out, fromMove: boolean, bad = false): boolean {
  const m = activeMon(st.sides[side]);
  if (!alive(m)) return false;
  if (m.status) {
    if (fromMove) out.push({ t: 'already', side, status: m.status });
    return false;
  }
  if (talentEffect(m, 'immune')?.status === status) {
    if (fromMove) out.push({ t: 'talent', side, talent: talentOf(m).id, note: 'immune' });
    return false;
  }
  if (typesOf(m.species).some((t) => STATUS_IMMUNE[status]?.includes(t)) || (status === 'freeze' && st.weather?.kind === 'soleil')) {
    if (fromMove) out.push({ t: 'noEffect', side });
    return false;
  }
  m.status = status;
  if (status === 'poison' && bad) st.sides[side].vol.toxic = 1;
  if (status === 'sleep') m.sleepTurns = 1 + randomInt(st, 3);
  out.push({ t: 'status', side, status, bad: bad || undefined });
  checkBerry(st, side, out);
  return true;
}

/** `byFoe`: the change comes from the other side (the varnish blocks those drops). */
function changeStage(st: BattleState, side: Side, stat: StageKey, delta: number, out: Out, byFoe = false) {
  if (byFoe && delta < 0 && st.sides[side].guard > 0) {
    out.push({ t: 'guarded', side });
    return;
  }
  const m = activeMon(st.sides[side]);
  if (byFoe && delta < 0 && stat === 'acc' && talentEffect(m, 'keenEye')) {
    out.push({ t: 'talent', side, talent: talentOf(m).id, note: 'immune' });
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
  const leaving = s.party[s.active];
  if (leaving && alive(leaving)) {
    out.push({ t: 'withdraw', side, idx: s.active });
    onLeave(leaving);
  }
  s.active = to;
  s.vol = freshVol();
  out.push({ t: 'sendOut', side, idx: to });
  if (side === 0 && !st.participants.includes(activeMon(s).uid)) st.participants.push(activeMon(s).uid);
  onEntry(st, side, out);
  checkBerry(st, side, out);
}

/** Talents that act as soon as the creature is sent out (Stink Eye, Thick Mist, Patinoire…). */
function onEntry(st: BattleState, side: Side, out: Out) {
  const m = activeMon(st.sides[side]);
  if (!alive(m)) return;
  if (talentEffect(m, 'phaseFirst')) st.sides[side].vol.phase = true;
  const w = talentEffect(m, 'entryWeather');
  if (w && st.weather?.kind !== w.weather) {
    out.push({ t: 'talent', side, talent: talentOf(m).id });
    st.weather = { kind: w.weather, turns: 5 };
    out.push({ t: 'weather', kind: w.weather, on: true });
  }
  const e = talentEffect(m, 'entryStage');
  if (!e) return;
  const targetSide = e.target === 'self' ? side : other(side);
  if (!alive(activeMon(st.sides[targetSide]))) return;
  out.push({ t: 'talent', side, talent: talentOf(m).id });
  changeStage(st, targetSide, e.stat, e.stages, out, e.target === 'foe');
}

/** Talents that act quietly when the creature is withdrawn (Recolor, Self-Care). */
function onLeave(m: Mon) {
  if (talentEffect(m, 'regenerator')) m.hp = Math.min(maxHp(m), m.hp + Math.floor(maxHp(m) / 3));
  if (talentEffect(m, 'naturalCure')) {
    m.status = null;
    m.sleepTurns = 0;
  }
}

// ------------------------------------------------------------------ damage

/** Gen 3 style damage for one hit. */
export function computeDamage(st: { rng: number; weather?: BattleState['weather']; night?: boolean }, atkSide: SideState, defSide: SideState, mv: MoveDef, power: number, forceCrit?: boolean) {
  const a = activeMon(atkSide), d = activeMon(defSide);
  const phys = mv.cat === 'phys';
  const h = held(a);
  const at = talentOf(a).effect, dt = talentOf(d).effect;
  const critStage = (mv.effects?.some((e) => e.kind === 'highCrit') ? 1 : 0) + (atkSide.vol.focus ? 1 : 0) + (h === 'critUp' ? 1 : 0) + (at.kind === 'superLuck' ? 1 : 0);
  const critChance = CRIT[Math.min(CRIT.length - 1, critStage)];
  // talents: stronger moves of its type when low on HP, stronger weak moves
  if (at.kind === 'pinch' && at.type === mv.type && a.hp * 3 <= maxHp(a)) power = Math.floor(power * 1.5);
  if (at.kind === 'technician' && mv.id !== STRUGGLE && power <= 60) power = Math.floor(power * 1.5);
  // coloured pencils: +20% power for their type
  if (h === 'typeBoost' && mv.id !== STRUGGLE && ITEM_BY_ID[a.item!]?.type === mv.type) power = Math.floor(power * 1.2);
  // Poings d’Acier, Ciseaux Affûtés
  power = Math.floor(power * talentPowerMult(a, mv));
  const crit = forceCrit ?? nextRandom(st) < critChance;
  const A = Math.floor(effectiveStat(atkSide, phys ? 'atk' : 'spa', crit ? 'attacker' : undefined, st.night) * (phys && a.status === 'burn' ? 0.5 : 1));
  const D = effectiveStat(defSide, phys ? 'def' : 'spd', crit ? 'defender' : undefined, st.night);
  // Gen 3 order: base damage, weather, +2, then crit, same-type bonus, type, random
  let dmg = Math.floor(Math.floor((Math.floor((2 * a.level) / 5 + 2) * power * A) / D) / 50);
  // rain helps Water and dampens Fire; sunshine does the opposite
  const w = st.weather?.kind;
  if ((w === 'pluie' && mv.type === 'eau') || (w === 'soleil' && mv.type === 'feu')) dmg = Math.floor(dmg * 1.5);
  if ((w === 'pluie' && mv.type === 'feu') || (w === 'soleil' && mv.type === 'eau')) dmg = Math.floor(dmg / 2);
  dmg += 2;
  if (crit) dmg *= 2;
  // Struggle is typeless: no STAB, hits everything
  const typeless = mv.id === STRUGGLE;
  dmg = Math.floor(dmg * stabOf(a, mv));
  const eff = typeless ? 1 : moveEffectiveness(a, mv, d);
  dmg = Math.floor(dmg * eff);
  if (!typeless && dt.kind === 'halve' && dt.types.includes(mv.type)) dmg = Math.floor(dmg / 2);
  // the defender's power: Ailes Prisme, Carapace Pleine, Gros Dodo, Fourrure Douce, Passe-Muraille
  if (dt.kind === 'prism' && eff > 1) dmg = Math.floor(dmg / 2);
  if (dt.kind === 'fullHpGuard' && d.hp >= maxHp(d)) dmg = Math.floor(dmg / 2);
  if (dt.kind === 'sleepTank' && d.status === 'sleep') dmg = Math.floor(dmg / 2);
  if (dt.kind === 'fluffy' && phys) dmg = Math.floor(dmg / 2);
  if (defSide.vol.phase) dmg = Math.floor(dmg / 2);
  if (dt.kind === 'filter' && eff > 1) dmg = Math.floor(dmg * 0.75);
  dmg = Math.floor((dmg * (85 + randomInt(st, 16))) / 100);
  if (h === 'powerCost' && mv.id !== STRUGGLE) dmg = Math.floor(dmg * 1.3);
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
  // second turn of a two-turn move (a lost turn also drops the charge)
  const releasing = s.vol.charging?.move === moveId;
  s.vol.charging = null;
  s.vol.invuln = null;

  // can the user act?
  if (user.status === 'freeze') {
    if (mv.type === 'feu' || nextRandom(st) < 0.2) {
      user.status = null;
      out.push({ t: 'thaw', side });
    } else {
      out.push({ t: 'frozen', side });
      return;
    }
  }
  if (user.status === 'sleep') {
    if (user.sleepTurns <= 0) {
      user.status = null;
      out.push({ t: 'wake', side });
    } else {
      user.sleepTurns = Math.max(0, user.sleepTurns - (talentEffect(user, 'earlyBird') ? 2 : 1));
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

  if (slot >= 0 && user.moves[slot] && !releasing) user.moves[slot].pp = Math.max(0, user.moves[slot].pp - 1);
  out.push({ t: 'move', side, move: moveId });
  if (moveId !== STRUGGLE && !s.vol.lock && LOCKING.includes(held(user)!)) s.vol.lock = moveId;
  if (!mv.effects?.some((e) => e.kind === 'protect')) s.vol.protectChain = 0;
  // two-turn moves charge first (no charge for a sun move in sunshine)
  const charge = mv.effects?.find((e) => e.kind === 'charge');
  if (charge && charge.kind === 'charge' && !releasing && !(charge.sunSkips && st.weather?.kind === 'soleil')) {
    s.vol.charging = { move: moveId, slot };
    s.vol.invuln = charge.invuln ?? null;
    out.push({ t: 'charge', side, move: moveId });
    return;
  }

  if (onlyAsleep && user.status !== 'sleep') {
    out.push({ t: 'fail', side });
    return;
  }
  const targetsFoe = mv.cat !== 'status' || (mv.effects ?? []).some((e) => e.kind === 'status' || e.kind === 'confuse' || e.kind === 'toxic' || e.kind === 'seed' || (e.kind === 'stage' && e.target === 'foe'));
  if (targetsFoe && !alive(target)) {
    out.push({ t: 'fail', side });
    return;
  }
  if (targetsFoe && foe.vol.protect) {
    out.push({ t: 'protected', side: foeSide });
    return;
  }
  // type immunity is announced before any accuracy roll
  if (mv.cat !== 'status' && moveId !== STRUGGLE && moveEffectiveness(user, mv, target) === 0) {
    out.push({ t: 'noEffect', side: foeSide });
    return;
  }
  // absorbing talents (Sponge, Battery Pack, Leaf Nibbler) turn a move of their type into healing
  const absorb = talentEffect(target, 'absorb');
  if (absorb && targetsFoe && moveId !== STRUGGLE && absorb.type === mv.type) {
    const full = target.hp >= maxHp(target);
    out.push({ t: 'talent', side: foeSide, talent: talentOf(target).id, note: full ? 'immune' : undefined });
    if (!full) healSide(st, foeSide, maxHp(target) / 4, out);
    return;
  }
  // out of reach: up in the air or under the ground
  if (targetsFoe && foe.vol.invuln) {
    out.push({ t: 'miss', side });
    return;
  }
  // accuracy
  if (mv.acc !== null && targetsFoe && !(mv.cat === 'status' && talentEffect(user, 'prism'))) {
    const eyes = talentEffect(user, 'compoundEyes') ? 1.3 : 1;
    const chance = (mv.acc / 100) * eyes * accMult(Math.max(-6, Math.min(6, s.vol.stages.acc - foe.vol.stages.eva)));
    if (nextRandom(st) >= chance) {
      out.push({ t: 'miss', side });
      return;
    }
  }

  if (mv.cat === 'status') {
    applyStatusMove(st, side, mv, out);
    return;
  }

  // damaging move: Passe-Muraille lets the first attack after it came in only half lands
  if (foe.vol.phase) out.push({ t: 'talent', side: foeSide, talent: talentOf(target).id, note: 'phased' });
  let power = mv.power;
  for (const e of mv.effects ?? []) if (e.kind === 'boostIfFoeAsleep' && target.status === 'sleep') power *= e.mult;
  const hits = hitCount(st, mv);
  // Bébé Poche: the little one hits again, at a quarter of the power
  const extra = hits === 1 && moveId !== STRUGGLE && talentEffect(user, 'parentalBond') ? 1 : 0;
  let total = 0;
  let done = 0;
  const behindDoll = foe.vol.sub > 0;
  for (let h = 0; h < hits + extra && alive(target) && alive(user); h++) {
    const { dmg, crit, eff } = computeDamage(st, s, foe, mv, h >= hits ? Math.max(1, Math.floor(power / 4)) : power);
    // a paper doll takes the hit instead
    if (foe.vol.sub > 0) {
      const taken = Math.min(foe.vol.sub, dmg);
      foe.vol.sub -= taken;
      out.push({ t: 'subHit', side: foeSide, crit, eff });
      if (foe.vol.sub <= 0) out.push({ t: 'subBroke', side: foeSide });
      total += taken;
      done++;
      continue;
    }
    const dealt = hurt(st, foeSide, dmg, out, { crit, eff });
    if (dealt > 0 && mv.type === 'feu' && target.status === 'freeze' && alive(target)) {
      target.status = null;
      out.push({ t: 'thaw', side: foeSide });
    }
    total += dealt;
    done++;
    // Spiky Helmet: hitting its holder up close hurts
    if (dealt > 0 && mv.cat === 'phys' && moveId !== STRUGGLE && held(target) === 'spikes') itemHp(st, side, target.item!, -Math.max(1, Math.floor(maxHp(user) / 6)), out);
    // Fuzzy Spark: touching it may paralyse
    const touch = talentEffect(target, 'contactStatus');
    if (touch && dealt > 0 && mv.cat === 'phys' && moveId !== STRUGGLE && alive(user) && !user.status && nextRandom(st) * 100 < touch.chance) {
      out.push({ t: 'talent', side: foeSide, talent: talentOf(target).id });
      setStatus(st, side, touch.status, out, false);
    }
    // Venin Frais: its own physical hits may poison
    const venom = talentEffect(user, 'touchStatus');
    if (venom && dealt > 0 && mv.cat === 'phys' && moveId !== STRUGGLE && alive(target) && !target.status && nextRandom(st) * 100 < venom.chance) {
      out.push({ t: 'talent', side, talent: talentOf(user).id });
      setStatus(st, foeSide, venom.status, out, false);
    }
  }
  foe.vol.phase = false;
  if (hits + extra > 1) out.push({ t: 'hits', count: done });
  const mine = held(user);
  if (total > 0 && mine === 'drainHit') itemHp(st, side, user.item!, Math.max(1, Math.floor(total / 8)), out);
  if (total > 0 && mine === 'powerCost' && moveId !== STRUGGLE) itemHp(st, side, user.item!, -Math.max(1, Math.floor(maxHp(user) / 10)), out);
  // Dust Coat keeps the foe's added effects away; Lucky Star doubles their chances
  const dust = !!talentEffect(target, 'shieldDust') || behindDoll;
  const grace = talentEffect(user, 'sereneGrace') ? 2 : 1;
  if (total > 0 && mine === 'flinchUp' && !dust && alive(target) && !mv.effects?.some((e) => e.kind === 'flinch') && nextRandom(st) < 0.1) foe.vol.flinch = true;

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
        if (!dust && alive(target) && nextRandom(st) * 100 < e.chance * grace) setStatus(st, foeSide, e.status, out, false);
        break;
      case 'toxic':
        if (!dust && alive(target) && nextRandom(st) * 100 < e.chance * grace) setStatus(st, foeSide, 'poison', out, false, true);
        break;
      case 'trap':
        if (!behindDoll && alive(target) && !foe.vol.trap) {
          foe.vol.trap = 4 + randomInt(st, 2);
          out.push({ t: 'trapped', side: foeSide });
        }
        break;
      case 'confuse':
        if (!dust && alive(target) && foe.vol.confusion === 0 && nextRandom(st) * 100 < e.chance * grace) {
          foe.vol.confusion = 2 + randomInt(st, 4);
          out.push({ t: 'confuse', side: foeSide });
          checkBerry(st, foeSide, out);
        }
        break;
      case 'flinch':
        if (!dust && alive(target) && nextRandom(st) * 100 < e.chance * grace) foe.vol.flinch = true;
        break;
      case 'stage':
        if (e.target === 'foe' && dust) break;
        if (nextRandom(st) * 100 < e.chance * grace) {
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
      case 'toxic':
        if (foe.vol.sub > 0) break;
        if (setStatus(st, foeSide, e.kind === 'toxic' ? 'poison' : e.status, out, true, e.kind === 'toxic')) anything = true;
        else reported = true;
        break;
      case 'weather':
        if (st.weather?.kind === e.weather) break;
        st.weather = { kind: e.weather, turns: 5 };
        out.push({ t: 'weather', kind: e.weather, on: true });
        anything = true;
        break;
      case 'protect':
        // each shield in a row works a third as often
        if (nextRandom(st) < 1 / 3 ** s.vol.protectChain) {
          s.vol.protect = true;
          s.vol.protectChain++;
          out.push({ t: 'protect', side });
          anything = true;
        } else s.vol.protectChain = 0;
        break;
      case 'seed':
        if (foe.vol.sub > 0 || foe.vol.seeded || typesOf(activeMon(foe).species).includes('plante')) break;
        foe.vol.seeded = true;
        out.push({ t: 'seeded', side: foeSide });
        anything = true;
        break;
      case 'substitute': {
        const cost = Math.floor(maxHp(user) / 4);
        if (s.vol.sub > 0 || user.hp <= cost) break;
        user.hp -= cost;
        s.vol.sub = cost;
        out.push({ t: 'sub', side });
        anything = true;
        break;
      }
      case 'confuse':
        if (foe.vol.sub > 0 || foe.vol.confusion > 0) break;
        foe.vol.confusion = 2 + randomInt(st, 4);
        out.push({ t: 'confuse', side: foeSide });
        checkBerry(st, foeSide, out);
        anything = true;
        break;
      case 'stage':
        if (e.target !== 'self' && foe.vol.sub > 0) break;
        changeStage(st, e.target === 'self' ? side : foeSide, e.stat, e.stages, out, e.target !== 'self');
        anything = true;
        break;
      case 'heal':
        anything = healSide(st, side, (maxHp(user) * e.pct) / 100, out) > 0;
        break;
      case 'nothing':
        out.push({ t: 'nothing' });
        anything = true;
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
  const statusBonus = target.status === 'sleep' || target.status === 'freeze' ? 2 : target.status ? 1.5 : 1;
  const a = Math.floor((((3 * max - 2 * target.hp) * creature(target.species).catchRate * ballBonus) / (3 * max)) * statusBonus);
  if (a >= 255) return { a, p: 1 };
  const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, a))));
  return { a, p: (b / 65536) ** 4 };
}

function throwBall(st: BattleState, ballId: string, out: Out) {
  if (st.kind !== 'wild' || st.noCatch) {
    out.push(st.noCatch ? { t: 'blocked', reflet: true } : { t: 'blocked' });
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
  if (!caught) return;
  // a catch counts like a win: XP and effort points for the Bestioles that fought it (Gen 6)
  awardXp(st, target, out);
  finish(st, 'capture', out);
}

function tryRun(st: BattleState, out: Out): boolean {
  if (st.kind !== 'wild') {
    out.push({ t: 'cantRun' });
    return false;
  }
  if (st.sides[0].vol.trap > 0 && !talentEffect(activeMon(st.sides[0]), 'runAway')) {
    out.push({ t: 'cantEscape', side: 0 });
    return false;
  }
  st.escapes++;
  const mine = effectiveStat(st.sides[0], 'spe');
  const theirs = effectiveStat(st.sides[1], 'spe');
  const ok = !!talentEffect(activeMon(st.sides[0]), 'runAway') || mine >= theirs || randomInt(st, 256) < Math.floor((mine * 128) / Math.max(1, theirs)) + 30 * st.escapes;
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
    if (def.boost === 'guard') return me.guard === 0;
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
    } else if (def.boost === 'guard') {
      st.sides[0].guard = 5;
      out.push({ t: 'guard', side: 0, on: true });
    } else if (def.boost) changeStage(st, 0, def.boost, 1, out);
  }
}

// ------------------------------------------------------------------ turn flow

function finish(st: BattleState, result: BattleResult, out: Out) {
  if (st.result) return;
  st.result = result;
  // Self-Care: the status goes away after the battle too
  const mine = activeMon(st.sides[0]);
  if (mine && alive(mine) && talentEffect(mine, 'naturalCure')) {
    mine.status = null;
    mine.sleepTurns = 0;
  }
  out.push({ t: 'end', result });
}

/**
 * Who gets XP for a knocked-out foe (Gen 3): the creatures that fought it share it; when some hold
 * the Tracing Paper, fighters share one half and holders the other.
 */
function xpShares(st: BattleState, foeMon: Mon): { m: Mon; i: number; amount: number }[] {
  const party = st.sides[0].party.map((m, i) => ({ m, i })).filter(({ m }) => alive(m));
  const fighters = party.filter(({ m }) => st.participants.includes(m.uid));
  const holders = party.filter(({ m }) => m.item && ITEM_BY_ID[m.item]?.hold === 'shareXp');
  // each Bestiole's share depends on its own level (catch-up XP)
  const full = (m: Mon) => xpYield(foeMon, st.kind === 'trainer', 1, m.level);
  const part = (pool: number, n: number) => Math.max(1, Math.floor(pool / n));
  const gain = new Map<number, number>();
  if (!holders.length) for (const { m, i } of fighters) gain.set(i, part(full(m), fighters.length));
  else {
    for (const { m, i } of fighters) gain.set(i, part(Math.floor(full(m) / 2), fighters.length));
    for (const { m, i } of holders) gain.set(i, (gain.get(i) ?? 0) + part(Math.floor(full(m) / 2), holders.length));
  }
  // a Bestiole received in a trade learns faster (Gen 3: ×1.5)
  return party.filter(({ i }) => gain.has(i)).map(({ m, i }) => ({ m, i, amount: m.ot ? Math.floor(gain.get(i)! * 1.5) : gain.get(i)! }));
}

/** Effort points, XP, level-ups and moves to learn for beating (or catching) `foeMon`. */
function awardXp(st: BattleState, foeMon: Mon, out: Out) {
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
}

/** Feu de Joie: the Bestiole that knocked a foe out gets a stage up. */
function koBoost(st: BattleState, side: Side, out: Out) {
  const m = activeMon(st.sides[side]);
  const e = talentEffect(m, 'statOnKO');
  if (!e || !alive(m) || st.sides[side].vol.stages[e.stat] >= 6) return;
  out.push({ t: 'talent', side, talent: talentOf(m).id });
  changeStage(st, side, e.stat, 1, out);
}

/** Handles fainted actives: XP, level-ups, replacements, end of battle. */
function checkFaints(st: BattleState, out: Out) {
  if (st.result) return;
  const foe = st.sides[1];
  const me = st.sides[0];
  const foeMon = activeMon(foe);
  if (!alive(foeMon)) {
    out.push({ t: 'faint', side: 1, idx: foe.active });
    koBoost(st, 0, out);
    awardXp(st, foeMon, out);
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
    koBoost(st, 1, out);
    mine.friendship = Math.max(0, (mine.friendship ?? 70) - 1);
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
  me.vol.protect = false;
  st.sides[1].vol.protect = false;
  // a charged two-turn move goes off whatever was chosen
  if (me.vol.charging && action.type === 'move') action = { type: 'move', slot: me.vol.charging.slot };
  if (st.sides[1].vol.charging) enemy = { type: 'move', slot: st.sides[1].vol.charging.slot };

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

  if (enemy.type === 'switch' && !st.sides[1].vol.trap && st.sides[1].party[enemy.to] && alive(st.sides[1].party[enemy.to])) switchIn(st, 1, enemy.to, out);

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
      const part = m.status === 'poison' && s.vol.toxic ? s.vol.toxic++ / 16 : 1 / 8;
      if (s.vol.toxic > 15) s.vol.toxic = 15;
      const amount = Math.min(m.hp, Math.max(1, Math.floor(maxHp(m) * part)));
      m.hp -= amount;
      out.push({ t: 'residual', side, status: m.status, amount });
      checkBerry(st, side, out);
      checkFaints(st, out);
    }
  }
  // end of turn: sandstorm and hail hurt, then the weather may end
  if (st.weather && !st.result) {
    const w = st.weather.kind;
    const safe: Record<Weather, string[] | null> = { sable: ['sol', 'roche', 'acier'], grele: ['glace'], pluie: null, soleil: null };
    for (const side of [0, 1] as Side[]) {
      const m = activeMon(st.sides[side]);
      const ok = safe[w];
      if (st.result || !ok || !alive(m) || typesOf(m.species).some((t) => ok.includes(t))) continue;
      const amount = Math.min(m.hp, Math.max(1, Math.floor(maxHp(m) / 16)));
      m.hp -= amount;
      out.push({ t: 'weatherHurt', side, kind: w, amount });
      checkBerry(st, side, out);
      checkFaints(st, out);
    }
    if (st.weather && --st.weather.turns <= 0) {
      out.push({ t: 'weather', kind: w, on: false });
      st.weather = null;
    }
  }
  // end of turn: greedy seeds drain, ties squeeze
  for (const side of [0, 1] as Side[]) {
    if (st.result) break;
    const s = st.sides[side];
    const m = activeMon(s);
    if (alive(m) && s.vol.seeded) {
      const amount = Math.min(m.hp, Math.max(1, Math.floor(maxHp(m) / 8)));
      m.hp -= amount;
      out.push({ t: 'seedDrain', side, amount });
      const o = other(side);
      if (alive(activeMon(st.sides[o]))) healSide(st, o, amount, out);
      checkBerry(st, side, out);
      checkFaints(st, out);
    }
    if (st.result || !alive(activeMon(s)) || !s.vol.trap) continue;
    const t = activeMon(s);
    const amount = Math.min(t.hp, Math.max(1, Math.floor(maxHp(t) / 16)));
    t.hp -= amount;
    out.push({ t: 'trapHurt', side, amount });
    if (--s.vol.trap <= 0) out.push({ t: 'freed', side });
    checkBerry(st, side, out);
    checkFaints(st, out);
  }
  // end of turn: held snacks heal a little
  for (const side of [0, 1] as Side[]) {
    if (st.result) break;
    const m = activeMon(st.sides[side]);
    if (!alive(m) || m.hp >= maxHp(m) || !m.item || ITEM_BY_ID[m.item]?.hold !== 'regen') continue;
    const amount = Math.min(maxHp(m) - m.hp, Math.max(1, Math.floor(maxHp(m) / 16)));
    m.hp += amount;
    out.push({ t: 'regen', side, item: m.item, amount });
  }
  // end of turn: talents (Momentum speeds up, Fresh Skin may shed a status)
  for (const side of [0, 1] as Side[]) {
    if (st.result) break;
    const s = st.sides[side];
    const m = activeMon(s);
    if (!alive(m)) continue;
    if (talentEffect(m, 'speedBoost') && s.vol.stages.spe < 6) {
      out.push({ t: 'talent', side, talent: talentOf(m).id });
      changeStage(st, side, 'spe', 1, out);
    }
    if (m.status && talentEffect(m, 'shedSkin') && nextRandom(st) < 1 / 3) {
      m.status = null;
      m.sleepTurns = 0;
      out.push({ t: 'talent', side, talent: talentOf(m).id, note: 'cured' });
    }
    // Mauvais Rêves: the sleeping foe has nightmares
    const foeSide = (1 - side) as Side;
    const sleeper = activeMon(st.sides[foeSide]);
    if (talentEffect(m, 'badDreams') && alive(sleeper) && sleeper.status === 'sleep') {
      const amount = Math.min(sleeper.hp, Math.max(1, Math.floor(maxHp(sleeper) / 8)));
      out.push({ t: 'talent', side, talent: talentOf(m).id });
      sleeper.hp -= amount;
      out.push({ t: 'nightmare', side: foeSide, amount });
      checkBerry(st, foeSide, out);
      checkFaints(st, out);
      if (st.result) break;
    }
    // Jardin Secret, Gros Dodo: a little healing each turn
    const regen = talentEffect(m, 'regen');
    const nap = talentEffect(m, 'sleepTank') && m.status === 'sleep';
    if ((regen || nap) && m.hp < maxHp(m)) {
      const pct = regen ? (st.weather?.kind === 'soleil' ? regen.sunPct : regen.pct) : 1 / 8;
      out.push({ t: 'talent', side, talent: talentOf(m).id });
      healSide(st, side, Math.max(1, Math.floor(maxHp(m) * pct)), out);
    }
  }
  // end of turn: the varnish wears off
  for (const side of [0, 1] as Side[]) {
    const s = st.sides[side];
    if (st.result || s.guard <= 0) continue;
    s.guard--;
    if (s.guard === 0) out.push({ t: 'guard', side, on: false });
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
  // Swift Quill: 20% chance to go first among moves of the same priority
  const quick = held(m) === 'quickStart' && nextRandom(st) < 0.2;
  // Premier Envol: its moves of that type go first while it has full HP
  const wings = talentEffect(m, 'galeWings');
  const prio = (move(id).priority ?? 0) + (wings && move(id).type === wings.type && m.hp >= maxHp(m) ? 1 : 0);
  return { side, action: a, prio, speed: effectiveStat(s, 'spe'), uid: m.uid, quick };
}

function validate(st: BattleState, a: Action) {
  const me = st.sides[0];
  const m = activeMon(me);
  switch (a.type) {
    case 'move':
      // a charged two-turn move goes off whatever was chosen, even if its last PP went into the charge
      if (me.vol.charging) break;
      if (a.slot >= 0 && (!m.moves[a.slot] || m.moves[a.slot].pp <= 0)) throw new IllegalAction('no PP');
      if (a.slot >= 0 && !usableSlots(m, me.vol).includes(a.slot)) throw new IllegalAction('move not allowed (Stubborn item or Painter’s Apron)');
      if (a.slot < 0 && usableSlots(m, me.vol).length) throw new IllegalAction('struggle only without PP');
      break;
    case 'switch':
      if (a.to === me.active || !me.party[a.to] || !alive(me.party[a.to])) throw new IllegalAction('cannot switch');
      if (me.vol.trap > 0) throw new IllegalAction('tied up');
      break;
    case 'item':
      if (!itemUsable(st, a.item, a.target)) throw new IllegalAction('cannot use item');
      break;
  }
}
