/**
 * Numbers that count in battle: HP running down (or up) with the bar, the stats a level brings, the
 * prize money counting up. Pure, so tests cover them.
 */
import { STAT_KEYS, statsOf, type Mon } from '../../engine/pk/creature';
import type { Stats } from '../../data/schema';

/** How long the HP takes to run from one value to another (ms at normal speed): longer for a bigger share. */
export function drainMs(delta: number, max: number): number {
  if (!delta || max <= 0) return 0;
  return Math.round(350 + 900 * Math.min(1, Math.abs(delta) / max));
}

/** Below this share of its HP a Bestiole is in danger: the bar blinks (and yours beeps once). */
export const LOW_HP = 0.2;
export const isLow = (hp: number, max: number) => hp > 0 && hp <= max * LOW_HP;

/** The stats before and after reaching `level`, and what each one gained (the GBA's level-up window). */
export function levelGains(m: Mon, level: number): { before: Stats; after: Stats; gain: Stats } {
  const after = statsOf({ ...m, level });
  const before = statsOf({ ...m, level: Math.max(1, level - 1) });
  const gain = {} as Stats;
  for (const k of STAT_KEYS) gain[k] = after[k] - before[k];
  return { before, after, gain };
}

/** The amounts a prize counter shows on its way up: at most `n` steps, ending on the prize. */
export function moneySteps(total: number, n = 12): number[] {
  if (total <= 0) return [0];
  const steps = Math.min(n, total);
  return Array.from({ length: steps }, (_, i) => Math.round((total * (i + 1)) / steps));
}
