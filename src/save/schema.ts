import type { Mon } from '../engine/pk/creature';

export type Dir = 'down' | 'up' | 'left' | 'right';

export interface SaveData {
  version: 2;
  createdAt: number;
  playMs: number;
  player: { name: string; avatar: number; map: string; x: number; y: number; facing: Dir };
  /** Where you wake up after every creature fainted (last Centre de soin or home). */
  respawn: { map: string; x: number; y: number };
  /** Story progress, beaten trainers, picked-up items… */
  flags: Record<string, number>;
  /** Up to 6 creatures that travel with you; the first one leads battles. */
  party: Mon[];
  /** Creatures stored in the PC. */
  box: Mon[];
  bag: Record<string, number>;
  money: number;
  dex: { seen: string[]; caught: string[] };
  badges: string[];
  stats: { battles: number; captures: number };
}

export const SAVE_VERSION = 2;
export const PARTY_MAX = 6;
