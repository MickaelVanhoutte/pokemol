/**
 * Doors in the world: stepping in, the doorway opens dark before the screen fades; coming out, the player
 * appears in the doorway and takes one step out of it (as on the GBA) instead of standing outside already.
 */
import type { Dir } from '../save/schema';

/** How long the doorway shows open before the fade (ms). */
export const DOOR_OPEN_MS = 140;

/**
 * Arriving below a door, facing away from it (coming out of a building): where to start instead, in the
 * doorway, to step out from there. Null when there is no door just behind.
 */
export function stepOut(to: { x: number; y: number; facing?: Dir }, isDoor: (x: number, y: number) => boolean): { x: number; y: number } | null {
  if ((to.facing ?? 'down') !== 'down') return null;
  return isDoor(to.x, to.y - 1) ? { x: to.x, y: to.y - 1 } : null;
}
