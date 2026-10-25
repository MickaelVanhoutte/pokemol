import { creature } from '../../data/creatures';
import { support } from '../../data/supportCards';
import { TALISMAN_BY_ID } from '../../data/talismans';
import { RESISTANCE_AMOUNT, WEAKNESS_MULT } from '../../data/types';
import type { AttackDef, Effect, StatusId, SupportDef } from '../../data/schema';
import { nextRandom, randomInt, shuffle } from '../rng';
import { dmgBonusAt, maxHpAt } from '../progression';
import type {
  Action, BattleEvent, BattleSetup, BattleState, Fighter, Side, SideSetup, SideState,
} from './types';

export const START_HAND = 4;
export const HAND_MAX = 7;
export const POISON_DAMAGE = 10;
export const CONFUSION_DAMAGE = 20;
const SPECIAL: StatusId[] = ['sleep', 'paralyze', 'confuse'];

interface Out {
  push(e: BattleEvent): void;
}

/** Collects events and, for the UI, a snapshot of the state right after each one. */
class Recorder implements Out {
  events: BattleEvent[] = [];
  snaps: BattleState[] = [];
  constructor(private st: BattleState, private withSnaps: boolean) {}
  push(e: BattleEvent) {
    this.events.push(e);
    if (this.withSnaps) this.snaps.push(structuredClone(this.st));
  }
}

export interface Step {
  state: BattleState;
  events: BattleEvent[];
  /** State after each event (only when requested). */
  snaps: BattleState[];
}

const other = (s: Side): Side => (s === 0 ? 1 : 0);
export const activeOf = (side: SideState): Fighter => side.fighters[side.active];

// ---------------------------------------------------------------- setup

function makeSide(setup: SideSetup, sideIdx: Side, st: { rng: number }): SideState {
  const fighters: Fighter[] = setup.team.map((m, i) => {
    const maxHp = maxHpAt(m.defId, m.level);
    const hp = Math.max(0, Math.min(maxHp, m.hp ?? maxHp));
    return {
      uid: `${sideIdx}-${i}-${m.defId}`, defId: m.defId, level: m.level, maxHp, hp,
      energy: 0, status: [], protect: 0, noRetreat: false, dmgBonus: dmgBonusAt(m.level), ko: hp <= 0,
    };
  });
  const firstAlive = Math.max(0, fighters.findIndex((f) => !f.ko));
  const side: SideState = {
    name: setup.name, fighters, active: firstAlive,
    deck: shuffle(st, [...setup.deck]), hand: [], discard: [],
    energyAttached: false, trainerPlayed: false, retreated: false,
    luckyCoin: false, atkBonus: 0, firstAtkBonus: 0,
    isAI: setup.isAI, mustChooseActive: false, talismans: setup.talismans ?? [],
  };
  let hand = START_HAND;
  for (const id of side.talismans) {
    const b = TALISMAN_BY_ID[id]?.battle;
    if (!b) continue;
    hand += b.startHand ?? 0;
    if (b.luckyCoin) side.luckyCoin = true;
    side.firstAtkBonus += b.firstAtkBonus ?? 0;
    if (fighters.length) {
      fighters[firstAlive].energy += b.startEnergy ?? 0;
      fighters[firstAlive].protect += b.startProtect ?? 0;
    }
  }
  side.hand = side.deck.splice(0, hand);
  return side;
}

export function createBattle(setup: BattleSetup, withSnaps = false): Step {
  const seedHolder = { rng: setup.seed >>> 0 };
  const p = makeSide(setup.player, 0, seedHolder);
  const e = makeSide(setup.enemy, 1, seedHolder);
  const state: BattleState = {
    kind: setup.kind, sides: [p, e], turn: 0, turnNumber: 0, rng: seedHolder.rng, winner: null, result: null,
  };
  const out = new Recorder(state, withSnaps);
  startTurn(state, 0, out);
  return { state, events: out.events, snaps: out.snaps };
}

// ---------------------------------------------------------------- helpers

function flip(st: BattleState, side: Side, favorable: 'heads' | 'tails', out: Out): boolean {
  const s = st.sides[side];
  let heads: boolean;
  if (s.luckyCoin) {
    s.luckyCoin = false;
    heads = favorable === 'heads';
    out.push({ t: 'coin', side, heads, lucky: true });
  } else {
    heads = nextRandom(st) < 0.5;
    out.push({ t: 'coin', side, heads });
  }
  return heads;
}

function drawCards(st: BattleState, side: Side, n: number, out: Out) {
  const s = st.sides[side];
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (s.hand.length >= HAND_MAX) break;
    if (!s.deck.length) {
      if (!s.discard.length) break;
      s.deck = shuffle(st, s.discard);
      s.discard = [];
      out.push({ t: 'reshuffle', side });
    }
    s.hand.push(s.deck.shift()!);
    drawn++;
  }
  if (drawn) out.push({ t: 'draw', side, count: drawn });
}

function discardRandom(st: BattleState, side: Side, n: number, out: Out) {
  const s = st.sides[side];
  for (let i = 0; i < n && s.hand.length; i++) {
    const [card] = s.hand.splice(randomInt(st, s.hand.length), 1);
    s.discard.push(card);
    out.push({ t: 'discard', side, card });
  }
}

function applyStatus(st: BattleState, side: Side, fi: number, status: StatusId, out: Out) {
  const f = st.sides[side].fighters[fi];
  if (f.ko) return;
  if (SPECIAL.includes(status)) f.status = f.status.filter((x) => !SPECIAL.includes(x));
  if (!f.status.includes(status)) f.status.push(status);
  out.push({ t: 'status', side, f: fi, status });
}

function heal(st: BattleState, side: Side, fi: number, amount: number, out: Out) {
  const f = st.sides[side].fighters[fi];
  if (f.ko) return;
  const h = Math.min(amount, f.maxHp - f.hp);
  if (h > 0) {
    f.hp += h;
    out.push({ t: 'heal', side, f: fi, amount: h });
  }
}

function hurt(st: BattleState, side: Side, fi: number, amount: number, out: Out, extra: Partial<Extract<BattleEvent, { t: 'damage' }>> = {}) {
  const f = st.sides[side].fighters[fi];
  if (f.ko) return;
  const dmg = Math.min(f.hp, Math.max(0, amount));
  f.hp -= dmg;
  out.push({ t: 'damage', side, f: fi, amount: dmg, ...extra });
}

function switchActive(st: BattleState, side: Side, to: number, out: Out) {
  const s = st.sides[side];
  const from = s.active;
  const old = s.fighters[from];
  old.status = [];
  s.active = to;
  out.push({ t: 'switch', side, from, to });
}

function aliveBench(s: SideState): number[] {
  return s.fighters.map((_, i) => i).filter((i) => i !== s.active && !s.fighters[i].ko);
}

/** Marks knocked-out fighters, decides the winner, asks for replacements. */
function checkKOs(st: BattleState, out: Out) {
  for (const side of [0, 1] as Side[]) {
    const s = st.sides[side];
    s.fighters.forEach((f, i) => {
      if (!f.ko && f.hp <= 0) {
        f.ko = true;
        f.hp = 0;
        f.energy = 0;
        f.status = [];
        f.protect = 0;
        out.push({ t: 'ko', side, f: i });
      }
    });
  }
  const wiped = st.sides.map((s) => s.fighters.every((f) => f.ko));
  if (wiped[0] || wiped[1]) {
    // ties go to the player
    st.winner = wiped[1] ? 0 : 1;
    finish(st, st.winner === 0 ? 'win' : 'lose', out);
    return;
  }
  for (const side of [0, 1] as Side[]) {
    const s = st.sides[side];
    if (activeOf(s).ko && !s.mustChooseActive) {
      if (s.isAI) {
        const bench = aliveBench(s);
        const best = bench.reduce((a, b) => (s.fighters[b].hp > s.fighters[a].hp ? b : a), bench[0]);
        s.active = best;
        out.push({ t: 'switch', side, from: -1, to: best });
      } else {
        s.mustChooseActive = true;
        out.push({ t: 'chooseActive', side });
      }
    }
  }
}

function finish(st: BattleState, result: BattleState['result'] & string, out: Out) {
  st.result = result;
  out.push({ t: 'end', result });
}

const isOver = (st: BattleState) => st.result !== null;

// ---------------------------------------------------------------- turn flow

function startTurn(st: BattleState, side: Side, out: Out) {
  st.turn = side;
  st.turnNumber++;
  const s = st.sides[side];
  s.energyAttached = false;
  s.trainerPlayed = false;
  s.retreated = false;
  s.fighters.forEach((f) => (f.protect = 0));
  out.push({ t: 'turn', side, n: st.turnNumber });
  // the very first turn also gets its draw, so the player starts with START_HAND + 1 cards
  drawCards(st, side, 1, out);
  const a = activeOf(s);
  if (!a.ko && a.status.includes('sleep')) {
    if (flip(st, side, 'heads', out)) {
      a.status = a.status.filter((x) => x !== 'sleep');
      out.push({ t: 'wake', side, f: s.active });
    }
  }
}

function endTurn(st: BattleState, out: Out) {
  const side = st.turn;
  const s = st.sides[side];
  s.fighters.forEach((f) => {
    f.status = f.status.filter((x) => x !== 'paralyze');
    f.noRetreat = false;
  });
  s.atkBonus = 0;
  for (const sd of [0, 1] as Side[]) {
    const a = activeOf(st.sides[sd]);
    if (!a.ko && a.status.includes('poison')) hurt(st, sd, st.sides[sd].active, POISON_DAMAGE, out);
  }
  checkKOs(st, out);
  if (isOver(st)) return;
  startTurn(st, other(side), out);
}

// ---------------------------------------------------------------- legality helpers (used by UI + AI)

export function blocked(st: BattleState): boolean {
  return isOver(st) || st.sides[0].mustChooseActive || st.sides[1].mustChooseActive;
}

export function canAttachEnergy(st: BattleState, side: Side, fi: number): boolean {
  const s = st.sides[side];
  return !blocked(st) && st.turn === side && !s.energyAttached && !!s.fighters[fi] && !s.fighters[fi].ko;
}

export function attackProblem(st: BattleState, side: Side, ai: number): 'asleep' | 'paralyzed' | 'energy' | null {
  const s = st.sides[side];
  const f = activeOf(s);
  const a = creature(f.defId).attacks[ai];
  if (!a) return 'energy';
  if (f.status.includes('sleep')) return 'asleep';
  if (f.status.includes('paralyze')) return 'paralyzed';
  if (f.energy < a.cost) return 'energy';
  return null;
}

export function canAttack(st: BattleState, side: Side, ai: number): boolean {
  return !blocked(st) && st.turn === side && attackProblem(st, side, ai) === null;
}

export function retreatTargets(st: BattleState, side: Side): number[] {
  const s = st.sides[side];
  const f = activeOf(s);
  if (blocked(st) || st.turn !== side || s.retreated || f.noRetreat) return [];
  if (f.status.includes('sleep') || f.status.includes('paralyze')) return [];
  if (f.energy < creature(f.defId).retreat) return [];
  return aliveBench(s);
}

/** Valid targets for a hand card, `[]` when it can't be played, `null` when it needs no target. */
export function playTargets(st: BattleState, side: Side, hi: number): number[] | null {
  const s = st.sides[side];
  const id = s.hand[hi];
  if (!id || blocked(st) || st.turn !== side) return [];
  const def = support(id);
  if (def.kind === 'dresseur' && s.trainerPlayed) return [];
  const foe = st.sides[other(side)];
  for (const e of def.effects) {
    if (e.kind === 'gust' && !aliveBench(foe).length) return [];
    if (e.kind === 'scribble' && !foe.hand.length) return [];
  }
  switch (def.target) {
    case 'none': return null;
    case 'own': return s.fighters.map((_, i) => i).filter((i) => !s.fighters[i].ko);
    case 'ownBench': return aliveBench(s);
    case 'ownKO': return s.fighters.map((_, i) => i).filter((i) => s.fighters[i].ko);
  }
}

export function canPlay(st: BattleState, side: Side, hi: number): boolean {
  const t = playTargets(st, side, hi);
  return t === null || t.length > 0;
}

export function captureChance(st: BattleState, bonus = 0): number {
  const wild = activeOf(st.sides[1]);
  const def = creature(wild.defId);
  const hpRatio = wild.hp / wild.maxHp;
  const statusBonus = wild.status.some((s) => s === 'sleep' || s === 'paralyze') ? 1.5 : 1;
  const p = def.catchRate * (1.6 - 1.2 * hpRatio) * statusBonus + bonus;
  return Math.max(0.03, Math.min(0.95, p));
}

// ---------------------------------------------------------------- attack resolution

function computeDamage(st: BattleState, side: Side, a: AttackDef, out: Out): number | 'fail' {
  const s = st.sides[side];
  const atk = activeOf(s);
  const def = activeOf(st.sides[other(side)]);
  let dmg = a.damage;
  const m = a.mod;
  if (m) {
    switch (m.kind) {
      case 'perHeads': {
        let heads = 0;
        for (let i = 0; i < m.flips; i++) if (flip(st, side, 'heads', out)) heads++;
        dmg = a.damage * heads;
        break;
      }
      case 'flipOrFail':
        if (!flip(st, side, 'heads', out)) return 'fail';
        break;
      case 'bonusIfStatus':
        if (def.status.includes(m.status)) dmg += m.bonus;
        break;
      case 'bonusOnHeads':
        if (flip(st, side, 'heads', out)) dmg += m.bonus;
        break;
      case 'bonusPerExtraEnergy':
        dmg += m.bonus * Math.max(0, atk.energy - a.cost);
        break;
    }
  }
  if (a.damage > 0 && dmg > 0) dmg += atk.dmgBonus + s.atkBonus + s.firstAtkBonus;
  return dmg;
}

function dealAttackDamage(st: BattleState, side: Side, raw: number, out: Out) {
  const foeSide = other(side);
  const foe = st.sides[foeSide];
  const target = activeOf(foe);
  const atkDef = creature(activeOf(st.sides[side]).defId);
  const tDef = creature(target.defId);
  let dmg = raw;
  const weak = tDef.weakness === atkDef.type;
  const resist = tDef.resistance === atkDef.type;
  if (weak) dmg *= WEAKNESS_MULT;
  if (resist) dmg -= RESISTANCE_AMOUNT;
  const prot = Math.min(target.protect, Math.max(0, dmg));
  dmg -= prot;
  hurt(st, foeSide, foe.active, Math.max(0, dmg), out, { weak, resist, protected: prot || undefined });
}

function resolveEffects(st: BattleState, side: Side, effects: Effect[], out: Out) {
  const s = st.sides[side];
  const foeSide = other(side);
  const foe = st.sides[foeSide];
  for (const e of effects) {
    switch (e.kind) {
      case 'status':
        if (e.target === 'self') applyStatus(st, side, s.active, e.status, out);
        else applyStatus(st, foeSide, foe.active, e.status, out);
        break;
      case 'heal':
        if (e.target === 'self') heal(st, side, s.active, e.amount, out);
        else s.fighters.forEach((_, i) => heal(st, side, i, e.amount, out));
        break;
      case 'coin': {
        const heads = flip(st, side, e.heads ? 'heads' : 'tails', out);
        const branch = heads ? e.heads : e.tails;
        if (branch) resolveEffects(st, side, branch, out);
        break;
      }
      case 'discardHand':
        discardRandom(st, foeSide, e.count, out);
        break;
      case 'draw':
        drawCards(st, side, e.count, out);
        break;
      case 'selfDamage':
        hurt(st, side, s.active, e.amount, out);
        break;
      case 'benchDamage':
        aliveBench(foe).forEach((i) => hurt(st, foeSide, i, e.amount, out));
        break;
      case 'protect': {
        const a = activeOf(s);
        a.protect = Math.max(a.protect, e.amount);
        out.push({ t: 'protect', side, f: s.active, amount: e.amount });
        break;
      }
      case 'forceSwitch': {
        if (activeOf(foe).ko) break;
        const bench = aliveBench(foe);
        if (bench.length) switchActive(st, foeSide, bench[randomInt(st, bench.length)], out);
        break;
      }
      case 'discardEnergy': {
        const fs = e.target === 'self' ? side : foeSide;
        const f = activeOf(st.sides[fs]);
        const n = Math.min(e.count, f.energy);
        if (n > 0) {
          f.energy -= n;
          out.push({ t: 'energyLoss', side: fs, f: st.sides[fs].active, amount: n });
        }
        break;
      }
      case 'cure': {
        const a = activeOf(s);
        if (a.status.length) {
          a.status = [];
          out.push({ t: 'cure', side, f: s.active });
        }
        break;
      }
      case 'cantRetreat': {
        const d = activeOf(foe);
        if (!d.ko) {
          d.noRetreat = true;
          out.push({ t: 'noRetreat', side: foeSide, f: foe.active });
        }
        break;
      }
    }
  }
}

function doAttack(st: BattleState, side: Side, ai: number, out: Out) {
  const s = st.sides[side];
  const atk = activeOf(s);
  const a = creature(atk.defId).attacks[ai];
  out.push({ t: 'attack', side, f: s.active, attack: ai });
  if (atk.status.includes('confuse') && !flip(st, side, 'heads', out)) {
    out.push({ t: 'fail', side, f: s.active, reason: 'confused' });
    hurt(st, side, s.active, CONFUSION_DAMAGE, out);
    return;
  }
  if (atk.status.includes('blind')) {
    atk.status = atk.status.filter((x) => x !== 'blind');
    // Brumouille's card: "sa prochaine attaque rate sur face" — heads means a miss
    if (flip(st, side, 'tails', out)) {
      out.push({ t: 'fail', side, f: s.active, reason: 'blind' });
      return;
    }
  }
  const dmg = computeDamage(st, side, a, out);
  if (dmg === 'fail') {
    out.push({ t: 'fail', side, f: s.active, reason: 'tails' });
    return;
  }
  s.firstAtkBonus = 0;
  if (a.damage > 0) dealAttackDamage(st, side, dmg, out);
  if (a.effects) resolveEffects(st, side, a.effects, out);
}

// ---------------------------------------------------------------- support cards

function playSupport(st: BattleState, side: Side, def: SupportDef, target: number | undefined, out: Out) {
  const s = st.sides[side];
  const foeSide = other(side);
  const foe = st.sides[foeSide];
  const tgt = target ?? s.active;
  for (const e of def.effects) {
    switch (e.kind) {
      case 'heal': heal(st, side, tgt, e.amount, out); break;
      case 'healAll': s.fighters.forEach((_, i) => heal(st, side, i, e.amount, out)); break;
      case 'cure': {
        const f = s.fighters[tgt];
        if (f.status.length) { f.status = []; out.push({ t: 'cure', side, f: tgt }); }
        break;
      }
      case 'energy':
        s.fighters[tgt].energy += e.count;
        out.push({ t: 'energy', side, f: tgt, amount: e.count });
        break;
      case 'switch': switchActive(st, side, tgt, out); break;
      case 'luckyCoin': s.luckyCoin = true; out.push({ t: 'lucky', side }); break;
      case 'atkBonus': s.atkBonus += e.amount; out.push({ t: 'atkBonus', side, amount: e.amount }); break;
      case 'draw': drawCards(st, side, e.count, out); break;
      case 'protect': {
        const a = activeOf(s);
        a.protect = Math.max(a.protect, e.amount);
        out.push({ t: 'protect', side, f: s.active, amount: e.amount });
        break;
      }
      case 'revive': {
        const f = s.fighters[tgt];
        f.ko = false;
        f.hp = Math.max(10, Math.round((f.maxHp * e.pct) / 1000) * 10);
        out.push({ t: 'revive', side, f: tgt, hp: f.hp });
        break;
      }
      case 'gust': {
        const bench = aliveBench(foe);
        if (bench.length) switchActive(st, foeSide, bench[randomInt(st, bench.length)], out);
        break;
      }
      case 'glue': {
        const d = activeOf(foe);
        d.noRetreat = true;
        out.push({ t: 'noRetreat', side: foeSide, f: foe.active });
        break;
      }
      case 'scribble': discardRandom(st, foeSide, e.count, out); break;
      case 'reshuffle': {
        s.deck = shuffle(st, [...s.deck, ...s.hand]);
        s.hand = [];
        out.push({ t: 'reshuffle', side });
        drawCards(st, side, e.draw, out);
        break;
      }
    }
  }
}

// ---------------------------------------------------------------- dispatcher

export class IllegalAction extends Error {}

/** Applies one action for the side whose turn it is (or the side that must choose an active). */
export function applyAction(prev: BattleState, action: Action, withSnaps = false): Step {
  const st: BattleState = structuredClone(prev);
  const out = new Recorder(st, withSnaps);
  if (isOver(st)) throw new IllegalAction('battle over');
  const side = st.turn;
  const s = st.sides[side];
  switch (action.type) {
    case 'chooseActive': {
      const who = st.sides.findIndex((x) => x.mustChooseActive) as Side | -1;
      if (who === -1) throw new IllegalAction('no choice pending');
      const ws = st.sides[who];
      const f = ws.fighters[action.fighter];
      if (!f || f.ko) throw new IllegalAction('cannot choose that fighter');
      ws.active = action.fighter;
      ws.mustChooseActive = false;
      out.push({ t: 'switch', side: who, from: -1, to: action.fighter });
      break;
    }
    case 'attachEnergy': {
      if (!canAttachEnergy(st, side, action.fighter)) throw new IllegalAction('cannot attach energy');
      s.energyAttached = true;
      s.fighters[action.fighter].energy++;
      out.push({ t: 'energy', side, f: action.fighter, amount: 1 });
      break;
    }
    case 'playCard': {
      const targets = playTargets(st, side, action.hand);
      if (targets !== null && (!targets.length || action.target === undefined || !targets.includes(action.target))) {
        throw new IllegalAction('cannot play card');
      }
      const [id] = s.hand.splice(action.hand, 1);
      const def = support(id);
      if (def.kind === 'dresseur') s.trainerPlayed = true;
      s.discard.push(id);
      out.push({ t: 'play', side, card: id, target: action.target });
      playSupport(st, side, def, action.target, out);
      checkKOs(st, out);
      break;
    }
    case 'retreat': {
      if (!retreatTargets(st, side).includes(action.to)) throw new IllegalAction('cannot retreat');
      const f = activeOf(s);
      const cost = creature(f.defId).retreat;
      f.energy -= cost;
      if (cost) out.push({ t: 'energyLoss', side, f: s.active, amount: cost });
      s.retreated = true;
      switchActive(st, side, action.to, out);
      break;
    }
    case 'attack': {
      if (!canAttack(st, side, action.attack)) throw new IllegalAction('cannot attack');
      doAttack(st, side, action.attack, out);
      checkKOs(st, out);
      if (!isOver(st)) endTurn(st, out);
      break;
    }
    case 'endTurn': {
      if (blocked(st)) throw new IllegalAction('blocked');
      endTurn(st, out);
      break;
    }
    case 'capture': {
      if (st.kind !== 'wild' || side !== 0 || blocked(st)) throw new IllegalAction('cannot capture');
      const chance = captureChance(st, action.bonus ?? 0);
      const success = nextRandom(st) < chance;
      out.push({ t: 'capture', success, chance });
      if (success) {
        st.winner = 0;
        finish(st, 'capture', out);
      } else {
        endTurn(st, out);
      }
      break;
    }
    case 'flee': {
      if (st.kind !== 'wild' || side !== 0 || blocked(st)) throw new IllegalAction('cannot flee');
      out.push({ t: 'flee' });
      finish(st, 'flee', out);
      break;
    }
  }
  return { state: st, events: out.events, snaps: out.snaps };
}
