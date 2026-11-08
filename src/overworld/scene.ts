/**
 * Staging a cut-scene in the world: cinema bars slide in, the menu button, the place's name and the walking
 * hint step aside, and the camera is free to move (`getGame().camera`). `staged(fn)` wraps a scene and always
 * gives the camera back to the player and takes the bars away, even if the scene stops halfway.
 */
import { signal } from '@preact/signals';
import { getGame } from './controller';
import { TILE, type Actor } from './game';

/** The cinema bars are in (OverworldScreen draws them and hides the interface meanwhile). */
export const cinemaOn = signal(false);

export function cinema(on: boolean) {
  cinemaOn.value = on;
}

/** Runs a scene between cinema bars; the camera comes back to the player (`backMs`) when it ends. */
export async function staged<T>(fn: () => Promise<T>, backMs = 400): Promise<T> {
  cinema(true);
  try {
    return await fn();
  } finally {
    const cam = getGame().camera;
    cam.follow(backMs);
    cam.zoomTo(1, backMs);
    cinema(false);
  }
}

/** The middle of a tile, in map pixels (where the camera looks to show someone standing there). */
export const tileCentre = (x: number, y: number): [number, number] => [x * TILE + 8, y * TILE + 8];

/** Where someone is right now, in map pixels (between two tiles while walking). */
export function actorCentre(a: Actor): [number, number] {
  const t = a.moving ? a.t : 1;
  return [(a.fromX + (a.x - a.fromX) * t) * TILE + 8, (a.fromY + (a.y - a.fromY) * t) * TILE + 8];
}

/** The camera follows someone (and keeps following them as they walk). */
export function lookAt(a: Actor, ms = 600) {
  getGame().camera.look(() => actorCentre(a), ms);
}

/** The camera frames two people at once (the middle point between them). */
export function lookBetween(a: Actor, b: Actor, ms = 600) {
  getGame().camera.look(() => {
    const [ax, ay] = actorCentre(a), [bx, by] = actorCentre(b);
    return [(ax + bx) / 2, (ay + by) / 2];
  }, ms);
}
