import type { Dir } from '../save/schema';
import { LEGEND, type MapDef, type ObstacleDef } from './mapTypes';
import { tile } from './tiles';

/**
 * Pure puzzle rules shared by the game and the tests: crayon barriers, glossy paper slides and
 * weight plates.
 */

const STEP: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** Map rows with the crayon barriers and switches flipped (blue up, red down) when `swapped`. */
export function flipBarriers(rows: string[], swapped: boolean): string[] {
  if (!swapped) return rows;
  const swap: Record<string, string> = { Z: 'z', z: 'Z', J: 'j', j: 'J', L: 'l', l: 'L' };
  return rows.map((r) => r.replace(/[ZzJjLl]/g, (c) => swap[c]));
}

export const tileOf = (rows: string[], x: number, y: number): string => LEGEND[rows[y]?.[x] ?? ' '] ?? 'void';

/**
 * Where a slide on glossy paper ends: starting on (x, y) and moving `dir`, keep going while standing
 * on glossy paper and the next tile is free. `free` says whether a tile can be entered.
 */
export function slideFrom(rows: string[], x: number, y: number, dir: Dir, free: (x: number, y: number) => boolean): [number, number] {
  const [dx, dy] = STEP[dir];
  let cx = x, cy = y;
  for (let guard = 0; guard < 200 && tileOf(rows, cx, cy) === 'glossy' && free(cx + dx, cy + dy); guard++) {
    cx += dx;
    cy += dy;
  }
  return [cx, cy];
}

/** Whether a tile of the rows can be walked on (no obstacles, NPCs or buildings considered). */
export const walkableTile = (rows: string[], x: number, y: number) => y >= 0 && x >= 0 && y < rows.length && x < rows[y].length && !tile(tileOf(rows, x, y)).solid;

/** Pushables that weigh on plates. */
export const heavy = (o: ObstacleDef) => o.kind === 'boulder' || o.kind === 'block';

/** The mechanisms of a map whose plates are all covered by the given obstacles. */
export function solvedPuzzles(def: MapDef, obstacles: ObstacleDef[]): string[] {
  return (def.puzzles ?? [])
    .filter((pz) => pz.plates.every(([x, y]) => obstacles.some((o) => heavy(o) && o.x === x && o.y === y)))
    .map((pz) => pz.flag);
}
