import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { DIRS, bfs, busy, fresh, slideFrom, solid } from '../puzzleSearch';

/**
 * Atelier Plume: Gaspard opened every window, and the draughts are glossy paper. From the door, a few slides
 * lead to Nina's perch, then to Lou's, then to the gap in front of Gaspard; the way back is always open.
 */
describe('Feather Atelier', () => {
  const def = MAPS.atelierPlume;
  const rows = fresh(def);
  const others = busy(def);
  const door: [number, number] = [7, 14];
  const master: [number, number] = [7, 3];
  const perches = { nina: [[3, 9], [2, 10], [3, 10]], lou: [[10, 5], [11, 5], [10, 6]] };
  const free = (x: number, y: number) => !solid(rows, x, y) && !others.has(`${x},${y}`);
  /** Where one press of a direction takes the player (a step, and the slide that follows on glossy paper). */
  const moves = ([x, y]: [number, number]) => DIRS.flatMap(([d, dx, dy]) => (free(x + dx, y + dy) ? [slideFrom(rows, x + dx, y + dy, d, free)] : []));
  /** Fewest presses from `from` to `to`, never stopping on the `avoid` tiles. */
  const presses = (from: [number, number], to: [number, number], avoid: number[][] = []) => {
    const banned = new Set(avoid.map((p) => `${p}`));
    return bfs<[number, number]>(from, (p) => `${p}`, (p) => moves(p).filter((q) => !banned.has(`${q}`)), ([x, y]) => x === to[0] && y === to[1]);
  };

  it('leads from the door to Gaspard in a few slides, over both perches', () => {
    const n = presses(door, master);
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(12);
    // each perch (and the trainer standing on it) is on the way
    expect(presses(door, master, perches.nina)).toBeNull();
    expect(presses(door, master, perches.lou)).toBeNull();
  });

  it('cannot be crossed without sliding', () => {
    const walls = rows.map((r) => r.replace(/I/g, 'W'));
    const walk = bfs<[number, number]>(door, (p) => `${p}`, ([x, y]) => DIRS.flatMap(([, dx, dy]): [number, number][] =>
      (!solid(walls, x + dx, y + dy) && !others.has(`${x + dx},${y + dy}`) ? [[x + dx, y + dy]] : [])), ([x, y]) => x === master[0] && y === master[1]);
    expect(walk).toBeNull();
  });

  it('never strands the player: from every place a slide can reach, the door can be reached again', () => {
    const reached = new Set([`${door}`]);
    const todo = [door];
    while (todo.length) {
      for (const q of moves(todo.pop()!)) {
        if (!reached.has(`${q}`)) { reached.add(`${q}`); todo.push(q); }
      }
    }
    expect(reached.has(`${master}`)).toBe(true);
    for (const k of reached) expect(presses(k.split(',').map(Number) as [number, number], door), `stuck at ${k}`).not.toBeNull();
  });
});
