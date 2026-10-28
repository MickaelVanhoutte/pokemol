import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { applyPatches } from '../../overworld/patches';
import { bfs, blocksOf, busy, covers, DIRS, fresh, pushes, solid } from '../puzzleSearch';

/** Atelier Pastel, the first one and a gentle one: two eraser blocks on the two plates open Mireille's greenhouse. */
describe('Pastel Atelier', () => {
  const def = MAPS.atelierPastel;
  const door: [number, number] = [7, 15];
  // in front of Mireille
  const master: [number, number] = [7, 3];

  /** Steps from `from` to `to` on foot, around people and the blocks where they stand. */
  const walk = (rows: string[], blocks: [number, number][], from: [number, number], to: [number, number]) => {
    const taken = new Set([...busy(def), ...blocks.map(([x, y]) => `${x},${y}`)]);
    const next = ([x, y]: [number, number]) => DIRS
      .map(([, dx, dy]): [number, number] => [x + dx, y + dy])
      .filter(([nx, ny]) => !solid(rows, nx, ny) && !taken.has(`${nx},${ny}`));
    return bfs<[number, number]>(from, (p) => `${p}`, next, ([x, y]) => x === to[0] && y === to[1]);
  };

  it('opens the gate with a few pushes from the door', () => {
    const n = pushes(def, door, blocksOf(def), covers(def));
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(6);
  });

  it('leads to Mireille once the blocks sit on the plates, and never with the gate shut', () => {
    const open = applyPatches(def.rows, def.patches, () => true);
    const plates = def.puzzles!.flatMap((pz) => pz.plates);
    expect(walk(open, plates, door, master)).not.toBeNull();
    // shut, even with no block in the way at all
    expect(walk(fresh(def), [], door, master)).toBeNull();
  });
});
