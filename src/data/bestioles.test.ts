import { describe, expect, it } from 'vitest';
import { CREATURES, creature } from './creatures';
import { move } from './moves';
import { talent } from './talents';
import type { SpeciesDef } from './schema';

/**
 * The design rules every Bestiole follows (docs/bestioles.md). A new drawing or brouillon that
 * breaks one fails here with the rule it breaks, so it gets its stats, power and moves right.
 */

const bst = (c: SpeciesDef) => Object.values(c.base).reduce((a, b) => a + b, 0);
const root = (c: SpeciesDef): SpeciesDef => (c.evolvesFrom ? root(creature(c.evolvesFrom)) : c);
const family = (c: SpeciesDef) => CREATURES.filter((x) => root(x).id === root(c).id);
const depth = (c: SpeciesDef): number => (c.evolvesFrom ? 1 + depth(creature(c.evolvesFrom)) : 0);
const isFinal = (c: SpeciesDef) => !c.evolutions?.length;

/** Base-stat total bands by stage (docs/bestioles.md). */
export function band(c: SpeciesDef): [number, number] {
  // Coconfus, the cocoon both dream legendaries come from
  if (c.rarity === 'legendary' && !isFinal(c)) return [400, 440];
  if (c.rarity === 'legendary') return [560, 600];
  if (!c.evolvesFrom && isFinal(c)) return [450, 520];
  if (!c.evolvesFrom) return [190, 340];
  if (!isFinal(c)) return [200, 430];
  return [460, 545];
}

/** Talent kinds that count as a family's power (the iteration-8 powers, plus Peau de Mousse). */
const POWER_KINDS = new Set(['regen', 'statOnKO', 'fullHpGuard', 'prism', 'galeWings', 'ignoreImmunity', 'nightBoost', 'sleepTank',
  'phaseFirst', 'allStab', 'fluffy', 'flagBoost', 'entryWeather', 'touchStatus', 'parentalBond', 'badDreams']);
const POWER_TALENTS = new Set(['peau-de-mousse', 'gaz-piquant', 'coquille-de-fer', 'peinture-rupestre', 'chasse-cauchemar', 'atchoum', 'bouclier-punaise',
  'poisson-d-avril', 'soie-urticante', 'vernis', 'pelage-d-hiver', 'copeaux-amortis']);
const hasPowerTalent = (c: SpeciesDef) => c.talents.some((t) => POWER_KINDS.has(talent(t).effect.kind) || POWER_TALENTS.has(t));

/** Moves only one family learns by level-up: its signature moves. */
function signatureMoves(c: SpeciesDef): string[] {
  const mine = new Set(family(c).map((x) => x.id));
  return c.learnset.map(([, id]) => id).filter((id) => {
    const m = move(id);
    if (m.cat === 'status' || (m.power < 70 && !(m.priority ?? 0))) return false;
    return CREATURES.every((x) => mine.has(x.id) || !x.learnset.some(([, y]) => y === id));
  });
}

describe('Bestiole design rules (docs/bestioles.md)', () => {
  it('keeps each base-stat total in its band', () => {
    for (const c of CREATURES) {
      const [lo, hi] = band(c);
      expect(bst(c), `${c.id} ${c.slug}: total ${bst(c)} should be ${lo}–${hi} (stage ${depth(c)})`).toBeGreaterThanOrEqual(lo);
      expect(bst(c), `${c.id} ${c.slug}: total ${bst(c)} should be ${lo}–${hi}`).toBeLessThanOrEqual(hi);
    }
  });

  it('gives every family a power: a power talent for all its members, or a signature move', () => {
    for (const c of CREATURES) {
      const ok = hasPowerTalent(c) || signatureMoves(c).length > 0;
      expect(ok, `${c.id} ${c.slug} has no power: give its family a power talent or a signature move`).toBe(true);
    }
  });

  it('teaches every final form a same-type move of 80+ power by level 40', () => {
    for (const c of CREATURES.filter(isFinal)) {
      const types = [c.type, c.type2].filter(Boolean);
      const strong = c.learnset.some(([lv, id]) => {
        const m = move(id);
        return lv <= 40 && m.cat !== 'status' && types.includes(m.type) && m.power >= 80;
      });
      expect(strong, `${c.id} ${c.slug}: no same-type move of 80+ power by level 40`).toBe(true);
    }
  });

  it('draws every Bestiole in three-quarter view, looking to one side', () => {
    // a Bestiole drawn straight from the front looks silly in battle; turned to one side, battles mirror it
    for (const c of CREATURES) expect(c.faces, `${c.id} ${c.slug}: draw it three-quarters to the left and set faces: 'left'`).toBeDefined();
  });

  it('makes evolutions rarer to catch and worth more XP than their earlier form', () => {
    for (const c of CREATURES.filter((x) => x.evolvesFrom)) {
      const from = creature(c.evolvesFrom!);
      expect(c.catchRate, `${c.id} ${c.slug}: catch rate above ${from.slug}'s`).toBeLessThanOrEqual(from.catchRate);
      expect(c.baseExp, `${c.id} ${c.slug}: base XP not above ${from.slug}'s`).toBeGreaterThan(from.baseExp);
    }
  });
});
