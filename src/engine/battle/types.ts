import type { LText } from '../../i18n';
import type { StatusId } from '../../data/schema';

/** Side 0 is always the player, side 1 the opponent. */
export type Side = 0 | 1;

export interface Fighter {
  uid: string;
  defId: string;
  level: number;
  maxHp: number;
  hp: number;
  energy: number;
  /** sleep / paralyze / confuse exclude each other; poison and blind stack. */
  status: StatusId[];
  /** Damage reduction until the start of its owner's next turn. */
  protect: number;
  /** Can't retreat until the end of its owner's next turn. */
  noRetreat: boolean;
  /** Extra damage from level. */
  dmgBonus: number;
  ko: boolean;
}

export interface SideState {
  name: LText;
  fighters: Fighter[];
  active: number;
  deck: string[];
  hand: string[];
  discard: string[];
  energyAttached: boolean;
  trainerPlayed: boolean;
  retreated: boolean;
  luckyCoin: boolean;
  atkBonus: number;
  firstAtkBonus: number;
  isAI: boolean;
  /** Active creature was knocked out: owner must pick a new one before anything else. */
  mustChooseActive: boolean;
  talismans: string[];
}

export type BattleKind = 'wild' | 'trainer' | 'boss';
export type BattleResult = 'win' | 'lose' | 'capture' | 'flee';

export interface BattleState {
  kind: BattleKind;
  sides: [SideState, SideState];
  turn: Side;
  turnNumber: number;
  rng: number;
  winner: Side | null;
  /** Outcome from the player's point of view, set when the battle is over. */
  result: BattleResult | null;
}

export type Action =
  | { type: 'attachEnergy'; fighter: number }
  | { type: 'playCard'; hand: number; target?: number }
  | { type: 'retreat'; to: number }
  | { type: 'attack'; attack: number }
  | { type: 'endTurn' }
  | { type: 'chooseActive'; fighter: number }
  | { type: 'capture'; bonus?: number }
  | { type: 'flee' };

export type FailReason = 'confused' | 'blind' | 'tails' | 'asleep' | 'paralyzed';

export type BattleEvent =
  | { t: 'turn'; side: Side; n: number }
  | { t: 'draw'; side: Side; count: number }
  | { t: 'reshuffle'; side: Side }
  | { t: 'energy'; side: Side; f: number; amount: number }
  | { t: 'energyLoss'; side: Side; f: number; amount: number }
  | { t: 'play'; side: Side; card: string; target?: number }
  | { t: 'switch'; side: Side; from: number; to: number }
  | { t: 'attack'; side: Side; f: number; attack: number }
  | { t: 'coin'; side: Side; heads: boolean; lucky?: boolean }
  | { t: 'damage'; side: Side; f: number; amount: number; weak?: boolean; resist?: boolean; protected?: number }
  | { t: 'heal'; side: Side; f: number; amount: number }
  | { t: 'status'; side: Side; f: number; status: StatusId }
  | { t: 'cure'; side: Side; f: number }
  | { t: 'wake'; side: Side; f: number }
  | { t: 'fail'; side: Side; f: number; reason: FailReason }
  | { t: 'discard'; side: Side; card: string }
  | { t: 'protect'; side: Side; f: number; amount: number }
  | { t: 'noRetreat'; side: Side; f: number }
  | { t: 'lucky'; side: Side }
  | { t: 'atkBonus'; side: Side; amount: number }
  | { t: 'revive'; side: Side; f: number; hp: number }
  | { t: 'ko'; side: Side; f: number }
  | { t: 'chooseActive'; side: Side }
  | { t: 'capture'; success: boolean; chance: number }
  | { t: 'flee' }
  | { t: 'end'; result: BattleResult };

export interface TeamMember {
  defId: string;
  level: number;
  /** Current HP; defaults to max. 0 = knocked out. */
  hp?: number;
}

export interface SideSetup {
  name: LText;
  team: TeamMember[];
  deck: string[];
  isAI: boolean;
  talismans?: string[];
}

export interface BattleSetup {
  kind: BattleKind;
  seed: number;
  player: SideSetup;
  enemy: SideSetup;
}
