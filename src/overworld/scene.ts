/**
 * Staging a cut-scene in the world: cinema bars slide in, the menu button, the place's name and the walking
 * hint step aside, and the camera is free to move (`getGame().camera`). `staged(fn)` wraps a scene and always
 * gives the camera back to the player and takes the bars away, even if the scene stops halfway.
 */
import { signal } from '@preact/signals';
import { getGame, refreshMap, wait } from './controller';
import { TILE, type Actor } from './game';
import { changedBounds, REDRAW_MS, type RedrawKind } from './redraw';
import type { Look } from './sprites';
import type { Dir } from '../save/schema';
import { sceneNow } from '../anim/sceneClock';
import { calmMotion } from '../anim/calm';
import { playSound, sfx } from '../audio/sfx';

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

/** The little sounds of each redraw (sound, ms after its start). */
const REDRAW_SOUNDS: Record<RedrawKind, [() => void, number][]> = {
  erase: [[sfx.rub, 0], [sfx.rub, 300], [sfx.rub, 650], [sfx.rub, 1000]],
  restore: [[() => playSound('shine'), 0], [() => playSound('twinkle'), 600], [() => playSound('shiny'), 1300]],
  sketch: [0, 250, 500, 800, 1100, 1450, 1800].map((at) => [() => sfx.pencil(), at] as [() => void, number]),
  rise: [[sfx.thud, 0], [() => playSound('quake'), 100]],
};

/**
 * The map changes in front of you: call it right after setting the flags that change the map (instead of letting
 * it change when the script ends). The camera first looks at `at` (a tile) if given; the old view is then taken
 * away the story's way (`redraw.ts`). With MOUVEMENTS : DOUX it is quicker.
 */
export async function redraw(kind: RedrawKind, o: { at?: { x: number; y: number }; ms?: number } = {}) {
  const g = getGame();
  if (o.at) {
    g.camera.panTo(o.at.x * TILE + 8, o.at.y * TILE + 8, 700);
    await wait(750);
  }
  const before = g.map.tiles.slice(), w = g.map.w;
  const snap = g.snapshotView(32);
  refreshMap();
  // where the map changed (the whole view for a sketch coloured in: its buildings change, not its tiles)
  const bounds = kind === 'sketch' ? null : changedBounds(before, g.map.tiles, w);
  const area = bounds
    ? { x: bounds.x * TILE - 8, y: bounds.y * TILE - 8, w: bounds.w * TILE + 16, h: bounds.h * TILE + 16 }
    : { x: snap.x, y: snap.y, w: snap.canvas.width, h: snap.canvas.height };
  const centre: [number, number] = o.at ? tileCentre(o.at.x, o.at.y) : [area.x + area.w / 2, area.y + area.h / 2];
  const ms = (o.ms ?? REDRAW_MS[kind]) * (calmMotion() ? 0.4 : 1);
  for (const [play, at] of REDRAW_SOUNDS[kind]) setTimeout(play, at * (ms / REDRAW_MS[kind]));
  await g.playRedraw({ kind, snap: snap.canvas, x: snap.x, y: snap.y, area, centre, ms });
  // back to the player, unless a staged scene keeps the camera (`staged` gives it back at its end)
  if (o.at && !cinemaOn.value) g.camera.follow(500);
}

/** Someone drawn into the scene in pencil, then coloured (a magical arrival: the Great Eraser…). */
export async function sketchIn(id: string, look: Look, x: number, y: number, dir: Dir, ms = 1000): Promise<Actor> {
  const g = getGame();
  const a = g.spawn(id, look, x, y, dir);
  const time = calmMotion() ? ms * 0.5 : ms;
  a.appear = { kind: 'in', start: sceneNow(), ms: time };
  for (let i = 0; i < 5; i++) setTimeout(() => sfx.pencil(), i * time * 0.11);
  await wait(time);
  a.appear = undefined;
  return a;
}

/** Someone rubbed out of the scene, from the top down, in crumbs; then gone. */
export async function eraseOut(who: Actor | string, ms = 900) {
  const g = getGame();
  const a = typeof who === 'string' ? g.npc(who) : who;
  if (!a) return;
  const time = calmMotion() ? ms * 0.5 : ms;
  a.appear = { kind: 'out', start: sceneNow(), ms: time };
  for (let i = 0; i < 3; i++) setTimeout(() => sfx.rub(), i * time * 0.3);
  await wait(time);
  g.remove(a.id);
}
