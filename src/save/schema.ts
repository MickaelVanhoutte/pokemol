import type { Mon } from '../engine/pk/creature';
import type { HallEntry } from '../data/postgame';
import type { Appearance } from '../data/appearance';
import type { Difficulty } from '../state/prefs';

export type Dir = 'down' | 'up' | 'left' | 'right';

export interface Place { map: string; x: number; y: number; facing?: Dir }

export interface SaveData {
  version: 5;
  createdAt: number;
  playMs: number;
  player: {
    name: string;
    /** One of the four portraits of the first versions (kept to rebuild `look` for old saves). */
    avatar: number;
    /** How you look (prologue, trainer card): filled in by `repair` for older saves. */
    look?: Appearance;
    /** French texts agree with it ("endormie" / "endormi"). */
    gender: 'f' | 'm';
    map: string;
    x: number;
    y: number;
    facing: Dir;
    /** Outside door of the shared interior you are in (Inns and shops serve every town). */
    returnTo?: Place;
  };
  rivalName: string;
  /** Where you wake up after every creature fainted (last Inn or home). */
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
  /** Hours added to the device's clock by naps in the bed at home (day and night). */
  clockShift?: number;
  /** The Pension Crayonnée: up to 2 Bestioles (with their level when left), and an egg waiting. */
  daycare?: { slots: { mon: Mon; level: number }[]; egg: boolean };
  /** Teams that won the Grand Concours, oldest first. */
  hallOfFame?: HallEntry[];
  /** Tour des Défis: current win streak, best streak, points to spend. */
  tower?: { streak: number; best: number; points: number };
  /** Each game keeps its own difficulty (a parent's game and a child's on one device); filled by `repair`. */
  difficulty?: Difficulty;
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
