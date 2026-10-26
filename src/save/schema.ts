import type { Mon } from '../engine/pk/creature';

export type Dir = 'down' | 'up' | 'left' | 'right';

export interface Place { map: string; x: number; y: number; facing?: Dir }

export interface SaveData {
  version: 5;
  createdAt: number;
  playMs: number;
  player: {
    name: string;
    avatar: number;
    /** French texts agree with it ("endormie" / "endormi"). */
    gender: 'f' | 'm';
    map: string;
    x: number;
    y: number;
    facing: Dir;
    /** Outside door of the shared interior you are in (Healing Centers and shops serve every town). */
    returnTo?: Place;
  };
  rivalName: string;
  /** Where you wake up after every creature fainted (last Healing Center or home). */
  respawn: Place & { returnTo?: Place };
  /** Story progress, beaten trainers, picked-up items… */
  flags: Record<string, number>;
  /** Up to 6 creatures that travel with you; the first one leads battles. */
  party: Mon[];
  /** PC storage: BOX_COUNT boxes of BOX_SIZE creatures (v5; older saves had one `box`). */
  boxes: Mon[][];
  /** Steps left before the Shoo Spray wears off. */
  repel?: number;
  /** Steps walked in all (friendship, eggs…). */
  steps?: number;
  bag: Record<string, number>;
  money: number;
  dex: { seen: string[]; caught: string[] };
  badges: string[];
  stats: { battles: number; captures: number };
}

export const SAVE_VERSION = 5;
export const BOX_COUNT = 8;
export const BOX_SIZE = 30;
export const PARTY_MAX = 6;
