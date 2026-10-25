import type { RunState } from '../engine/dungeon/run';

export type Dir = 'down' | 'up' | 'left' | 'right';

export interface OwnedCreature {
  level: number;
  xp: number;
  copies: number;
}

export interface SaveData {
  version: 1;
  createdAt: number;
  playMs: number;
  player: { name: string; avatar: number; map: string; x: number; y: number; facing: Dir };
  /** Where you wake up after losing every creature (last Centre de soin visited). */
  respawn: { map: string; x: number; y: number };
  /** Story progress, beaten trainers, opened chests… */
  flags: Record<string, number>;
  collection: Record<string, OwnedCreature>;
  /** Current overworld HP per owned creature; missing = full. */
  hp: Record<string, number>;
  /** Creature ids in battle order (max 4). */
  team: string[];
  /** Support card ids used in battles (10–20). */
  deck: string[];
  /** Every support card owned (deck is a subset). */
  supplies: Record<string, number>;
  items: { blank: number };
  coins: number;
  glitter: number;
  pity: { creature: number; support: number };
  run: RunState | null;
  badges: string[];
  seen: string[];
  stats: { wins: number; captures: number; pulls: number; runs: number; runsWon: number };
  lastDailyBonus?: string;
}

export const SAVE_VERSION = 1;
export const TEAM_MAX = 4;
export const DECK_MIN = 10;
export const DECK_MAX = 20;
