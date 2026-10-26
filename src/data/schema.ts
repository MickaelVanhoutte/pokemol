import type { LText } from '../i18n';

export type TypeId =
  | 'plante' | 'feu' | 'eau' | 'electrique' | 'fee' | 'insecte'
  | 'normal' | 'spectre' | 'psy' | 'combat' | 'tenebres'
  | 'vol' | 'sol' | 'roche' | 'glace' | 'poison' | 'dragon' | 'acier';
/** Battle background, drawn with colouring pencils (src/ui/battle/backdrops.ts). */
export type Backdrop = 'grass' | 'forest' | 'cave' | 'tower' | 'lab' | 'beach' | 'city' | 'volcano' | 'sketch';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
/** Major status, kept outside battles like in the GBA games. */
export type Major = 'sleep' | 'paralyze' | 'poison' | 'burn' | 'freeze';
/** Battle weather, set by moves for 5 turns. */
export type Weather = 'pluie' | 'soleil' | 'sable' | 'grele';
export type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
/** Stats that can be raised/lowered by stages in battle. */
export type StageKey = 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'acc' | 'eva';
export type Stats = Record<StatKey, number>;

export type MoveEffect =
  /** Inflicts a major status (chance in %). */
  | { kind: 'status'; status: Major; chance: number }
  | { kind: 'confuse'; chance: number }
  | { kind: 'flinch'; chance: number }
  /** Changes a stat stage of the user or the target (chance in %). */
  | { kind: 'stage'; target: 'self' | 'foe'; stat: StageKey; stages: number; chance: number }
  /** Heals the user by % of its max HP. */
  | { kind: 'heal'; pct: number }
  /** Heals the user by % of the damage dealt. */
  | { kind: 'drain'; pct: number }
  /** User takes % of the damage dealt. */
  | { kind: 'recoil'; pct: number }
  /** Heals % of max HP, then sleeps 2 turns. */
  | { kind: 'rest'; pct: number }
  | { kind: 'multi'; min: number; max: number }
  | { kind: 'highCrit' }
  | { kind: 'boostIfFoeAsleep'; mult: number }
  /** Only works while the user is asleep. */
  | { kind: 'onlyAsleep' }
  /** Badly poisons: the poison hurts more every turn (chance in %). */
  | { kind: 'toxic'; chance: number }
  /** Sets the weather for 5 turns. */
  | { kind: 'weather'; weather: Weather }
  /** Shields the user this turn (works less often when used again and again). */
  | { kind: 'protect' }
  /** Charges on the first turn and hits on the second; `invuln`: out of reach meanwhile; `sunSkips`: no charge in sunshine. */
  | { kind: 'charge'; invuln?: 'air' | 'ground'; sunSkips?: boolean }
  /** Ties up the target for 4–5 turns: it can't flee or switch and loses 1/16 of its HP each turn. */
  | { kind: 'trap' }
  /** Plants a greedy seed: the target loses 1/8 of its HP each turn, given to the other side. */
  | { kind: 'seed' }
  /** Spends a quarter of the user's HP on a paper doll that takes the hits for it. */
  | { kind: 'substitute' };

export interface MoveDef {
  id: string;
  name: LText;
  type: TypeId;
  cat: 'phys' | 'spec' | 'status';
  power: number;
  /** null = never misses. */
  acc: number | null;
  pp: number;
  priority?: number;
  effects?: MoveEffect[];
  desc: LText;
}

export interface SpeciesDef {
  id: string;
  slug: string;
  name: LText;
  type: TypeId;
  /** Second type (dual-type Bestioles). */
  type2?: TypeId;
  base: Stats;
  /** 0–255, higher is easier (Gen 3 scale). */
  catchRate: number;
  baseExp: number;
  /** Effort points given to each creature that beats it (Gen 3: 1–3 points). */
  evYield: Partial<Stats>;
  /** A wild one sometimes holds this item (chance in %). */
  wildItem?: { id: string; pct: number };
  /** Stencils (item ids) whose move it can learn. */
  stencils: string[];
  /** Weight in the creature machine. */
  rarity: Rarity;
  /** [level, move id]; level 1 moves are known from the start, level 0 ones are learned on evolving into it. */
  learnset: [number, string][];
  /** How it evolves (several rules = a branching evolution; none = final form). */
  evolutions?: EvolutionRule[];
  evolvesFrom?: string;
  dex: LText;
  /** Kind of creature shown in the Bestiodex ("Bestiole Chaton"). */
  kind: LText;
  /** Which way the drawing looks (omitted = facing us). */
  faces?: 'left' | 'right';
  /** Regular talents (src/data/talents.ts): one or two; evolutions keep the slot. */
  talents: [string] | [string, string];
  /** Rarer talent (1 chance in 4). */
  hiddenTalent: string;
}

/** What a held item does in battle (see `src/engine/pk/battle.ts`). */
export type HoldEffect =
  | 'regen' | 'shareXp' | 'typeBoost'
  | 'lockAtk' | 'lockSpe' | 'lockSpa' | 'powerCost' | 'specialGuard' | 'spikes' | 'holdOn'
  | 'quickStart' | 'critUp' | 'flinchUp' | 'drainHit'
  /** Everstone: no evolution, and an egg takes this parent's nature. */
  | 'everstone';

/**
 * `berry`: eaten by its holder in battle (or used from the bag); `hold`: works while held;
 * `battle`: boosts the creature fighting (syrups, sharpener, varnish), only in battle.
 */
export type ItemKind = 'heal' | 'status' | 'revive' | 'ball' | 'key' | 'berry' | 'hold' | 'battle' | 'stencil' | 'field' | 'evo';

/** One way to evolve. A rule with an `item` only works with that item; others work on levelling up. */
export interface EvolutionRule {
  to: string;
  /** Reaching this level. */
  level?: number;
  /** Using this item from the bag (the Crayons Magiques). */
  item?: string;
  /** At least this much friendship (0–255) when levelling up. */
  friendship?: number;
}

export interface ItemDef {
  id: string;
  name: LText;
  desc: LText;
  price: number;
  kind: ItemKind;
  /** HP healed (heal; berries: once at half HP or less), % HP on revive, or catch bonus ×10 for balls. */
  amount: number;
  /** Berries: what they cure. */
  cures?: (Major | 'confusion')[];
  /** Held items: their effect. */
  hold?: HoldEffect;
  /** Type boosters: moves of this type hit 20% harder. */
  type?: TypeId;
  /** Battle items: the stat raised one stage, `crit` (Pencil Sharpener) or `guard` (Protective Varnish, 5 turns). */
  boost?: StageKey | 'crit' | 'guard';
  /** Stencils: the move they teach (never used up). */
  move?: string;
  /** Field items (used from the bag on the map): Shoo Spray (`amount` steps) or Ariadne Thread. */
  field?: 'repel' | 'escape';
}
