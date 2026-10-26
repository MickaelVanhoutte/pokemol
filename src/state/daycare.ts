import { creature } from '../data/creatures';
import { move } from '../data/moves';
import { HIDDEN_TALENT_CHANCE } from '../data/talents';
import { nextRandom, randomInt } from '../engine/rng';
import { addXp, createMon, STAT_KEYS, type Mon } from '../engine/pk/creature';
import type { SaveData } from '../save/schema';

/** The Pension Crayonnée keeps two Bestioles; with no genders, two of one family can make an egg. */
export const DAYCARE_MAX = 2;
/** An egg can appear every this many steps. */
export const EGG_CHECK_STEPS = 256;

/** First form of a species' evolution family (Papivole → Chenillou). */
export function familyRoot(id: string): string {
  const from = creature(id).evolvesFrom;
  return from ? familyRoot(from) : id;
}

export function canBreed(a: Mon | undefined, b: Mon | undefined): boolean {
  return !!a && !!b && !a.egg && !b.egg && familyRoot(a.species) === familyRoot(b.species);
}

/** Taking a Bestiole back costs 100 ₽, plus 100 ₽ per level it gained. */
export function withdrawPrice(slot: { mon: Mon; level: number }): number {
  return 100 + 100 * Math.max(0, slot.mon.level - slot.level);
}

/** Steps an egg needs before it hatches (600–1200). */
export function hatchSteps(st: { rng: number }): number {
  return 600 + randomInt(st, 601);
}

/**
 * An egg from two Bestioles of one family: the base form at level 5, three IVs taken from the
 * parents, the nature of a parent holding the Everstone, the hidden talent one time in two when a
 * parent has it.
 */
export function makeEgg(a: Mon, b: Mon, st: { rng: number }): Mon {
  const m = createMon(familyRoot(a.species), 5, st);
  const keys = [...STAT_KEYS];
  for (let n = 0; n < 3; n++) {
    const k = keys.splice(randomInt(st, keys.length), 1)[0];
    m.ivs[k] = (nextRandom(st) < 0.5 ? a : b).ivs[k];
  }
  const stone = [a, b].find((p) => p.item === 'pierre-immuable');
  if (stone) m.nature = stone.nature;
  if ((a.talent === 2 || b.talent === 2) && nextRandom(st) < 0.5) m.talent = 2;
  else if (m.talent === 2 && nextRandom(st) >= HIDDEN_TALENT_CHANCE) m.talent = 0;
  m.friendship = 120;
  m.egg = { steps: hatchSteps(st) };
  return m;
}

/**
 * One step walked: Bestioles at the Pension gain 1 XP (learning moves on their own, the oldest
 * forgotten like in the GBA games), and every EGG_CHECK_STEPS steps an egg may appear.
 * Returns true when an egg just appeared.
 */
export function daycareStep(s: SaveData, steps: number, st: { rng: number }): boolean {
  const dc = s.daycare;
  if (!dc?.slots.length) return false;
  for (const { mon } of dc.slots) {
    for (const up of addXp(mon, 1)) {
      for (const id of up.pending) {
        mon.moves.shift();
        mon.moves.push({ id, pp: move(id).pp });
      }
    }
  }
  if (dc.egg || steps % EGG_CHECK_STEPS !== 0 || !canBreed(dc.slots[0]?.mon, dc.slots[1]?.mon)) return false;
  if (nextRandom(st) < 0.5) return false;
  dc.egg = true;
  return true;
}
