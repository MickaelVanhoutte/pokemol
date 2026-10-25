import type { Backdrop } from '../data/schema';
import type { LText } from '../i18n';
import type { Dir } from '../save/schema';
import type { BuildingDef } from './buildings';
import type { Look } from './sprites';

export interface WarpTarget {
  map: string;
  x: number;
  y: number;
  facing?: Dir;
}

export interface Warp {
  x: number;
  y: number;
  to: WarpTarget;
}

export interface NpcDef {
  id: string;
  x: number;
  y: number;
  look: Look;
  facing: Dir;
  wander?: boolean;
  /** Lines said in turn when talked to (if no script). */
  text?: LText[];
  /** Story script id run when talked to. */
  script?: string;
  /** Trainer id: battles once, can spot the player from `sight` tiles. */
  trainer?: string;
  sight?: number;
  /** Visible only when this flag is set / not set. */
  showIf?: string;
  hideIf?: string;
}

export interface SignDef {
  x: number;
  y: number;
  text: LText;
}

export interface TriggerDef {
  x: number;
  y: number;
  w?: number;
  h?: number;
  script: string;
}

export interface EncounterTable {
  rate: number;
  /** Encounters on every walkable tile (caves), not only tall grass. */
  anyTile?: boolean;
  table: { id: string; w: number; min: number; max: number }[];
}

/** An item lying on the ground (picked up once). */
export interface PickupDef {
  x: number;
  y: number;
  item: string;
  count?: number;
}

export interface MapBuilding extends BuildingDef {
  /** Where the door leads; without it the door is locked. */
  to?: WarpTarget;
  /** Script run when entering the door instead of warping (dungeon gates). */
  script?: string;
  lockedText?: LText;
}

export interface MapDef {
  id: string;
  name: LText;
  indoor?: boolean;
  /** Tile drawn outside the map. */
  border: string;
  rows: string[];
  buildings?: MapBuilding[];
  warps?: Warp[];
  npcs?: NpcDef[];
  signs?: SignDef[];
  triggers?: TriggerDef[];
  items?: PickupDef[];
  encounters?: EncounterTable;
  backdrop?: Backdrop;
  /** Color wash drawn over the map (e.g. dusk in the woods). */
  tint?: string;
  /** Drifting fog wisps. */
  fog?: boolean;
  /** Story script id run every time the map is entered. */
  onEnter?: string;
}

export const LEGEND: Record<string, string> = {
  '.': 'grass', ',': 'grass2', '"': 'tallgrass', ':': 'path', '*': 'flowers', '~': 'water', 'T': 'tree',
  'B': 'bush', '#': 'fence', 'S': 'sign', 'M': 'mailbox', 'R': 'rock', '_': 'ledge', 's': 'sand',
  'f': 'floor', 'W': 'wall', 'w': 'window', 'C': 'counter', 'c': 'carpet', 'X': 'mat', 'b': 'bookshelf',
  't': 'table', 'p': 'plant', 'P': 'pc', 'h': 'bed', 'v': 'tv', 'm': 'machine', 'H': 'healer', 'U': 'stairs',
  'K': 'cavewall', 'k': 'cavefloor', 'r': 'caverock', 'o': 'towerfloor', 'Q': 'towerwall', 'D': 'stairsdown', 'E': 'caveexit', ' ': 'void',
};
