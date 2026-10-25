import type { LText } from '../i18n';

export type TypeId =
  | 'plante' | 'feu' | 'eau' | 'electrique' | 'fee' | 'insecte'
  | 'normal' | 'spectre' | 'psy' | 'combat' | 'tenebres';
export type Stage = 'bebe' | 'grand' | 'maitre';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'holo';
export type StatusId = 'sleep' | 'paralyze' | 'poison' | 'confuse' | 'blind';

/** Changes how an attack's printed damage is computed (shown as "×" or "+" on the card). */
export type DamageMod =
  | { kind: 'perHeads'; flips: number }
  | { kind: 'flipOrFail' }
  | { kind: 'bonusIfStatus'; status: StatusId; bonus: number }
  | { kind: 'bonusOnHeads'; bonus: number }
  | { kind: 'bonusPerExtraEnergy'; bonus: number };

/** Attack side effects, resolved after damage. */
export type Effect =
  | { kind: 'status'; status: StatusId; target: 'defender' | 'self' }
  | { kind: 'heal'; amount: number; target: 'self' | 'team' }
  | { kind: 'coin'; heads?: Effect[]; tails?: Effect[] }
  | { kind: 'discardHand'; count: number }
  | { kind: 'draw'; count: number }
  | { kind: 'selfDamage'; amount: number }
  | { kind: 'benchDamage'; amount: number }
  | { kind: 'protect'; amount: number }
  | { kind: 'forceSwitch' }
  | { kind: 'discardEnergy'; count: number; target: 'self' | 'defender' }
  | { kind: 'cure' }
  | { kind: 'cantRetreat' };

export interface AttackDef {
  id: string;
  name: LText;
  cost: number;
  damage: number;
  mod?: DamageMod;
  effects?: Effect[];
  text?: LText;
}

export interface CreatureDef {
  id: string;
  slug: string;
  name: LText;
  type: TypeId;
  stage: Stage;
  hp: number;
  retreat: number;
  weakness?: TypeId;
  resistance?: TypeId;
  rarity: Rarity;
  attacks: AttackDef[];
  flavor: LText;
  evolvesFrom?: string;
  evolvesTo?: string;
  /** Level at which this creature evolves into `evolvesTo`. */
  evolveLevel?: number;
  series: number;
  /** Base capture chance at full HP is roughly catchRate × 0.4. */
  catchRate: number;
}

export type SupportEffect =
  | { kind: 'heal'; amount: number }
  | { kind: 'healAll'; amount: number }
  | { kind: 'cure' }
  | { kind: 'energy'; count: number }
  | { kind: 'switch' }
  | { kind: 'luckyCoin' }
  | { kind: 'atkBonus'; amount: number }
  | { kind: 'draw'; count: number }
  | { kind: 'protect'; amount: number }
  | { kind: 'revive'; pct: number }
  | { kind: 'gust' }
  | { kind: 'glue' }
  | { kind: 'scribble'; count: number }
  | { kind: 'reshuffle'; draw: number }
  /** Gives back this turn's energy (attach or swap again). */
  | { kind: 'refreshEnergy' };

/** Who a support card must be aimed at when played. */
export type SupportTarget = 'none' | 'own' | 'ownBench' | 'ownKO';

export interface SupportDef {
  id: string;
  name: LText;
  text: LText;
  /** "dresseur" cards are limited to one per turn. */
  kind: 'objet' | 'dresseur';
  rarity: Rarity;
  target: SupportTarget;
  effects: SupportEffect[];
  /** Id of the upgraded ("+") version. */
  upgrade?: string;
  icon: string;
  price: number;
}
