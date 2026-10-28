import type { Backdrop } from '../data/schema';
import type { LText } from '../i18n';
import type { Dir } from '../save/schema';
import type { BuildingDef } from './buildings';
import type { Look } from './sprites';
import type { PatchDef } from './patches';

export interface WarpTarget {
  map: string;
  x: number;
  y: number;
  facing?: Dir;
}

export interface Warp {
  x: number;
  y: number;
  /** 'back' = out through the door you came in by (shared interiors). */
  to: WarpTarget | 'back';
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
  /** In a shared interior: only there when entered from one of these maps. */
  fromMap?: string[];
  /** In a shared house: only there when entered by this door (its map, and the tile in front of the door). */
  fromDoor?: [map: string, x: number, y: number][];
  /** What this character does for the player, shown on the Town Map for the town (Inn helpers). */
  service?: LText;
  /** A Bestiole standing there, drawn as its miniature instead of a person (`look` is then unused). */
  mon?: string;
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
  /** Only while this flag is set / not set. */
  if?: string;
  unless?: string;
}

/** Something to examine with A (a desk, a photo, a machine…). */
export interface InteractDef {
  x: number;
  y: number;
  script: string;
}

/** Something in the way that a key item clears: a thin bush (scissors), a round boulder (gloves,
 * pushed) or a cracked rock (mallet). They come back when the map is entered again. */
export interface ObstacleDef {
  x: number;
  y: number;
  /** `block`: a big Gomme eraser block, light enough to push without gloves. */
  kind: 'bush' | 'boulder' | 'rock' | 'block';
  /** Pushables that can fall through a hole need one (`fell:<id>` keeps them from coming back). */
  id?: string;
  /** Only there while this flag is set / not set (a boulder that fell from the floor above). */
  showIf?: string;
  hideIf?: string;
}

/** A pit (`O`): a boulder or block pushed in falls to `to` on the floor below; the player falls through when there is a `to`. */
export interface HoleDef {
  x: number;
  y: number;
  to?: WarpTarget;
  /** The player can fall through too (only where the landing is a normal place to be). */
  fall?: boolean;
}

/** Weight plates (`@`): once boulders or blocks cover all of them, `flag` is set for good (gates are patches with `unless: flag`). */
export interface PuzzleDef {
  flag: string;
  plates: [number, number][];
}

/** A fresque (`F`): a sliding picture puzzle examined with A; solving it sets `fresque:<id>`. */
export interface FresqueDef {
  x: number;
  y: number;
  id: string;
  species: string;
  /** Pieces per side (3 by default). */
  size?: number;
  /** Given when solved (otherwise a patch with `unless: 'fresque:<id>'` opens a passage). */
  reward?: { item: string; count?: number };
}

/** What bites with each fishing rod (Old, Good, Super). */
export type FishingTables = Partial<Record<'old' | 'good' | 'super', EncounterTable['table']>>;

export interface EncounterTable {
  /** FireRed's encounter rate (`encounterRate.ts`): 21 on a route, 14 in a wood, 7 in a cave, 2 on water. */
  rate: number;
  /** Encounters on every walkable tile (caves), not only tall grass. */
  anyTile?: boolean;
  /** `time`: only by day (evening included) or only at night. */
  table: { id: string; w: number; min: number; max: number; time?: 'day' | 'night' }[];
}

/** An item lying on the ground (picked up once). */
export interface PickupDef {
  x: number;
  y: number;
  item: string;
  count?: number;
  /** Not drawn: found by pressing A in front of it (torn pages…). */
  hidden?: boolean;
  /** Only there once this flag is set (behind a secret passage). */
  showIf?: string;
}

/** A bush on a solid tile that gives a few berries once a day (press A in front of it). */
export interface BerryBushDef {
  x: number;
  y: number;
  item: string;
}

export interface MapBuilding extends BuildingDef {
  /** Where the door leads; without it the door is locked. */
  to?: WarpTarget;
  /** Script run when entering the door instead of warping (dungeon gates). */
  script?: string;
  lockedText?: LText;
  /** Drawn in pencil only (not coloured in) until this flag is set (Hameau-Brouillon). */
  sketchUnless?: string;
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
  berries?: BerryBushDef[];
  encounters?: EncounterTable;
  backdrop?: Backdrop;
  /** Color wash drawn over the map (e.g. dusk in the woods). */
  tint?: string;
  /** Its colours sucked out by Team Gomme: drawn in greys (the `tint` washed over them). */
  drained?: boolean;
  /** The tint (and the drained greys) disappear once this story flag is set (colours brought back). */
  tintUnless?: string;
  /**
   * A town only sketched in pencil until this story flag is set: the shared rooms entered from it (the Inn, the
   * shop) are drawn in pencil too, the people in them included (`sketch`, set by the controller).
   */
  sketchUnless?: string;
  sketch?: boolean;
  /** Drifting fog wisps. */
  fog?: boolean;
  /** Story script id run every time the map is entered. */
  onEnter?: string;
  /** Shared interior (Inn, shop…): its exits lead back to the door used to enter. */
  generic?: boolean;
  /** Cave, tower or hideout: the Ariadne Thread works here. */
  dungeon?: boolean;
  /**
   * People living in this town's houses: each has a `fromDoor` of this map, and is put into the shared house room
   * its door leads to (src/data/maps/index.ts).
   */
  residents?: NpcDef[];
  /** Obstacles cleared with the scissors, gloves or mallet. */
  obstacles?: ObstacleDef[];
  /** Wild Bestioles met while sailing on water. */
  surf?: EncounterTable;
  /** Wild Bestioles caught with each fishing rod. */
  fishing?: FishingTables;
  /** Parts of the map redrawn while story flags are set (erased or restored areas). */
  patches?: PatchDef[];
  interact?: InteractDef[];
  /** Pits boulders and blocks fall into. */
  holes?: HoleDef[];
  /** Weight-plate mechanisms. */
  puzzles?: PuzzleDef[];
  fresques?: FresqueDef[];
}

export const LEGEND: Record<string, string> = {
  '.': 'grass', ',': 'grass2', '"': 'tallgrass', ':': 'path', '*': 'flowers', '~': 'water', 'T': 'tree',
  'B': 'bush', '#': 'fence', 'S': 'sign', 'M': 'mailbox', 'R': 'rock', '_': 'ledge', 's': 'sand',
  'f': 'floor', 'W': 'wall', 'w': 'window', 'C': 'counter', 'c': 'carpet', 'X': 'mat', 'b': 'bookshelf',
  't': 'table', 'p': 'plant', 'P': 'pc', 'h': 'bed', 'v': 'tv', 'm': 'machine', 'H': 'keyrack', 'U': 'stairs',
  'K': 'cavewall', 'k': 'cavefloor', 'r': 'caverock', 'o': 'towerfloor', 'Q': 'towerwall', 'D': 'stairsdown', 'E': 'caveexit', ' ': 'void',
  'e': 'erased', '=': 'bridge', 'n': 'paper', 'Y': 'sketchtree', '|': 'margin',
  // puzzles: pits, plates, gates, crayon barriers (red/blue, up/down) and their switch, glossy paper, fresques
  'O': 'hole', '0': 'holefilled', '@': 'plate', 'G': 'gate',
  'Z': 'redup', 'z': 'reddown', 'J': 'blueup', 'j': 'bluedown', 'L': 'leverred', 'l': 'leverblue',
  'I': 'glossy', 'F': 'fresque',
  // a framed drawing (the museum); fireflies showing the way through the Lost Woods
  'q': 'cadre', 'y': 'luciole',
  // a legendary Bestiole waiting in the dark
  '%': 'shadow',
  // the consequences of the story's choices: a bridge left runny, grey lines kept, Nocturne's fresco
  'u': 'bridgerun', 'x': 'greytrace', 'A': 'inkblot', 'V': 'inkfresco', 'N': 'inkmoon',
  // tall grass only sketched in pencil, beyond the margin
  'g': 'sketchgrass', 'a': 'bigeraser', 'i': 'sketchsign',
};
