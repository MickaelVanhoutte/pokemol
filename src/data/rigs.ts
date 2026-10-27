/**
 * How each Bestiole waits in battle (`BattleScene.tsx`): it breathes, or a flying one hovers on the spot,
 * and a Bestiole drawn with moving parts (`c.part()` in `tools/redraws`) moves them: its battle rig,
 * written by `npm run redraws` into `public/rigs/<id>-<slug>/` and `rigs.json`.
 */
import { creature } from './creatures';
import RIGS from './rigs.json';

export type Idle = 'breathe' | 'hover' | 'still';

export function idleOf(species: string): Idle {
  const sp = creature(species);
  return sp.type === 'vol' || sp.type2 === 'vol' ? 'hover' : 'breathe';
}

/**
 * - `flap`: beats around its pivot (wings seen from the side), `amp` degrees;
 * - `fold`: folds towards its pivot and opens again (butterfly wings), `amp` = how far it folds, in %;
 * - `swing`: sways around its pivot (a trunk, a tail), `amp` degrees;
 * - `nod`: a little bow of the head around its pivot;
 * - `peek`: slides by `to` (% of its own size) and back, hiding behind what is in front (a shell, a hole);
 * - `flicker`: flashes on and off (sparks, lightning);
 * - `blink`: shows for a blink now and then (closed eyelids drawn over the eyes).
 */
export type Motion = 'flap' | 'fold' | 'swing' | 'nod' | 'peek' | 'flicker' | 'blink';
export const MOTIONS: Motion[] = ['flap', 'fold', 'swing', 'nod', 'peek', 'flicker', 'blink'];

/** Defaults when a part doesn't say: [amp, seconds]. */
export const MOTION_DEFAULTS: Record<Motion, [number, number]> = {
  flap: [18, 0.5], fold: [55, 0.6], swing: [8, 2.6], nod: [6, 3.2], peek: [0, 4.2], flicker: [0, 2.4], blink: [0, 4.6],
};

/** How a part moves: what the drawing code gives `c.part()`, besides its name and pivot. */
export interface PartMove {
  motion: Motion;
  /** Degrees for flap, swing and nod; % for fold. */
  amp?: number;
  /** Seconds for one movement. */
  period?: number;
  /** Peek: where the part goes, in % of its own width and height… */
  to?: [number, number];
  /** …how small it gets there, and whether it fades away (hiding in a shell)… */
  shrink?: number;
  fade?: boolean;
  /** …and whether it slips behind the rest once small (in front at rest, inside the shell when hidden). */
  inside?: boolean;
  /** Where in its movement it starts (0–1): parts with the same phase move together. */
  phase?: number;
  /** Cut off at the edge of the drawing (a mole going down into its hole). */
  clip?: boolean;
}

/** One moving part of a rig: its picture, its box and its pivot in % (of the rig, and of its own box). */
export interface RigPart extends PartMove {
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Pivot inside the part's own box (transform-origin). */
  ox: number;
  oy: number;
  /** Under the body (a far wing), instead of over it. */
  behind?: boolean;
}

export interface Rig {
  slug: string;
  parts: RigPart[];
}

export const RIG_OF = RIGS as unknown as Record<string, Rig>;

export const rigFile = (id: string, rig: Rig, layer: string) => `${import.meta.env.BASE_URL}rigs/${id}-${rig.slug}/${layer}.webp`;
