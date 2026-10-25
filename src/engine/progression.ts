import { creature } from '../data/creatures';
import type { Rarity } from '../data/schema';

export const MAX_LEVEL = 10;

export function maxHpAt(defId: string, level: number): number {
  return creature(defId).hp + (level - 1) * 5;
}

/** Bonus damage on damaging attacks: +10 at levels 4, 7 and 10. */
export function dmgBonusAt(level: number): number {
  return (level >= 4 ? 10 : 0) + (level >= 7 ? 10 : 0) + (level >= 10 ? 10 : 0);
}

/** XP needed to go from `level` to `level + 1`. */
export function xpToNext(level: number): number {
  return 20 + level * 15;
}

/** XP granted when pulling or catching a creature you already own. */
export const DUPLICATE_XP: Record<Rarity, number> = { common: 30, uncommon: 45, rare: 80, holo: 150 };

export interface LevelState {
  level: number;
  xp: number;
}

/** Adds XP and returns the new level state plus how many levels were gained. */
export function addXp(s: LevelState, xp: number): LevelState & { gained: number } {
  let { level, xp: cur } = s;
  cur += xp;
  let gained = 0;
  while (level < MAX_LEVEL && cur >= xpToNext(level)) {
    cur -= xpToNext(level);
    level++;
    gained++;
  }
  if (level >= MAX_LEVEL) cur = 0;
  return { level, xp: cur, gained };
}

/** Id of the evolution this creature can reach at its level, if any. */
export function evolutionAt(defId: string, level: number): string | null {
  const def = creature(defId);
  return def.evolvesTo && def.evolveLevel && level >= def.evolveLevel ? def.evolvesTo : null;
}
