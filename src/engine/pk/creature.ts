import { creature } from '../../data/creatures';
import { move } from '../../data/moves';
import type { Major, StatKey, Stats } from '../../data/schema';
import { randomInt } from '../rng';

export interface MoveSlot {
  id: string;
  pp: number;
}

/** One creature owned by someone (party, box, wild or trainer). */
export interface Mon {
  uid: string;
  species: string;
  level: number;
  /** Total experience points (medium-fast curve). */
  xp: number;
  ivs: Stats;
  /** Effort points from beaten creatures (Gen 3: 255 per stat, 510 in all). */
  evs: Stats;
  /** Held item id (berries are eaten in battle). */
  item: string | null;
  hp: number;
  status: Major | null;
  /** Remaining sleep turns while status is sleep. */
  sleepTurns: number;
  moves: MoveSlot[];
}

export const MAX_LEVEL = 50;
export const STAT_KEYS: StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

/** Total XP needed to reach a level (medium-fast: n³). */
export function xpAt(level: number): number {
  return level <= 1 ? 0 : level ** 3;
}

export const EV_STAT_MAX = 255;
export const EV_TOTAL_MAX = 510;
export const noStats = (): Stats => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

/** Gen 3 stat formula (no natures): every 4 effort points add one point at level 100. */
export function calcStat(key: StatKey, base: number, iv: number, ev: number, level: number): number {
  const core = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
  return key === 'hp' ? core + level + 10 : core + 5;
}

export function statsOf(m: Mon): Stats {
  const sp = creature(m.species);
  const out = {} as Stats;
  for (const k of STAT_KEYS) out[k] = calcStat(k, sp.base[k], m.ivs[k], m.evs[k], m.level);
  return out;
}

export const maxHp = (m: Mon) => statsOf(m).hp;

/** Moves known at a level: the last four learnt by level-up. */
export function movesAt(speciesId: string, level: number): string[] {
  const learnt: string[] = [];
  for (const [lvl, id] of creature(speciesId).learnset) {
    if (lvl > level) break;
    const i = learnt.indexOf(id);
    if (i >= 0) learnt.splice(i, 1);
    learnt.push(id);
  }
  return learnt.slice(-4);
}

let uidCounter = 0;
export function newUid(st?: { rng: number }): string {
  const r = st ? randomInt(st, 1e9) : Math.floor(Math.random() * 1e9);
  return `${Date.now().toString(36)}-${(uidCounter++).toString(36)}-${r.toString(36)}`;
}

export function createMon(speciesId: string, level: number, st: { rng: number }, ivs?: Partial<Stats>): Mon {
  const iv = {} as Stats;
  for (const k of STAT_KEYS) iv[k] = ivs?.[k] ?? randomInt(st, 32);
  const m: Mon = {
    uid: newUid(st),
    species: speciesId,
    level,
    xp: xpAt(level),
    ivs: iv,
    evs: noStats(),
    item: null,
    hp: 0,
    status: null,
    sleepTurns: 0,
    moves: movesAt(speciesId, level).map((id) => ({ id, pp: move(id).pp })),
  };
  m.hp = maxHp(m);
  return m;
}

export function healMon(m: Mon) {
  m.hp = maxHp(m);
  m.status = null;
  m.sleepTurns = 0;
  for (const s of m.moves) s.pp = move(s.id).pp;
}

/** XP a defeated creature gives to each participant (Gen 3 formula). */
export function xpYield(defeated: Mon, trainer: boolean, participants: number): number {
  const base = Math.floor((creature(defeated.species).baseExp * defeated.level) / 7);
  return Math.max(1, Math.floor((trainer ? Math.floor(base * 1.5) : base) / Math.max(1, participants)));
}

/** Adds the effort points of a beaten creature (capped); keeps the same missing HP. Mutates the creature. */
export function gainEvs(m: Mon, defeatedSpecies: string) {
  const before = maxHp(m);
  let total = STAT_KEYS.reduce((n, k) => n + m.evs[k], 0);
  for (const k of STAT_KEYS) {
    const add = Math.min(creature(defeatedSpecies).evYield[k] ?? 0, EV_STAT_MAX - m.evs[k], EV_TOTAL_MAX - total);
    if (add <= 0) continue;
    m.evs[k] += add;
    total += add;
  }
  if (m.hp > 0) m.hp += maxHp(m) - before;
}

export interface LevelUp {
  level: number;
  /** Moves learnt automatically (a free slot was available). */
  learned: string[];
  /** Moves waiting for a "forget a move?" choice. */
  pending: string[];
}

/** Adds XP, levelling up as needed; keeps the same missing HP. Mutates the creature. */
export function addXp(m: Mon, amount: number): LevelUp[] {
  const ups: LevelUp[] = [];
  if (m.level >= MAX_LEVEL) return ups;
  m.xp += amount;
  while (m.level < MAX_LEVEL && m.xp >= xpAt(m.level + 1)) {
    const before = maxHp(m);
    m.level++;
    if (m.hp > 0) m.hp += maxHp(m) - before;
    const up: LevelUp = { level: m.level, learned: [], pending: [] };
    for (const [lvl, id] of creature(m.species).learnset) {
      if (lvl !== m.level || m.moves.some((s) => s.id === id)) continue;
      if (m.moves.length < 4) {
        m.moves.push({ id, pp: move(id).pp });
        up.learned.push(id);
      } else {
        up.pending.push(id);
      }
    }
    ups.push(up);
  }
  if (m.level >= MAX_LEVEL) m.xp = xpAt(MAX_LEVEL);
  return ups;
}

/** Replaces the move in `slot` with `id` (full PP). */
export function learnMove(m: Mon, slot: number, id: string) {
  m.moves[slot] = { id, pp: move(id).pp };
}

export function evolutionOf(m: Mon): string | null {
  const sp = creature(m.species);
  return sp.evolvesTo && sp.evolveLevel && m.level >= sp.evolveLevel ? sp.evolvesTo : null;
}

/** Turns the creature into its evolution, keeping level, XP, moves and missing HP. */
export function evolve(m: Mon, into: string) {
  const before = maxHp(m);
  m.species = into;
  if (m.hp > 0) m.hp += maxHp(m) - before;
}
