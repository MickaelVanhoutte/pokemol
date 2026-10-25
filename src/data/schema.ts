import type { LText } from '../i18n';

export type TypeId =
  | 'plante' | 'feu' | 'eau' | 'electrique' | 'fee' | 'insecte'
  | 'normal' | 'spectre' | 'psy' | 'combat' | 'tenebres';
/** Battle background, drawn with colouring pencils (src/ui/battle/backdrops.ts). */
export type Backdrop = 'grass' | 'forest' | 'cave' | 'tower' | 'lab' | 'beach' | 'city' | 'volcano' | 'sketch';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
/** Major status, kept outside battles like in the GBA games. */
export type Major = 'sleep' | 'paralyze' | 'poison' | 'burn';
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
  | { kind: 'onlyAsleep' };

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
  base: Stats;
  /** 0–255, higher is easier (Gen 3 scale). */
  catchRate: number;
  baseExp: number;
  /** Effort points given to each creature that beats it (Gen 3: 1–3 points). */
  evYield: Partial<Stats>;
  /** Weight in the creature machine. */
  rarity: Rarity;
  /** [level, move id]; level 1 moves are known from the start. */
  learnset: [number, string][];
  evolvesTo?: string;
  evolveLevel?: number;
  evolvesFrom?: string;
  dex: LText;
  /** Kind of creature shown in the Bestiodex ("Bestiole Chaton"). */
  kind: LText;
  /** Which way the drawing looks (omitted = facing us). */
  faces?: 'left' | 'right';
}

export type ItemKind = 'heal' | 'status' | 'revive' | 'ball' | 'key';

export interface ItemDef {
  id: string;
  name: LText;
  desc: LText;
  price: number;
  kind: ItemKind;
  /** HP healed (heal), % HP on revive, or catch bonus ×10 for balls. */
  amount: number;
}
