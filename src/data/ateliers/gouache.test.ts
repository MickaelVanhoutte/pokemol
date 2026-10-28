import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { DIRS, bfs, blocksOf, busy, covers, fresh, pushes, solid } from '../puzzleSearch';

/** Atelier Gouache: Basil's garden is closed by a hedge; two eraser blocks on the two plates open its gate. */
describe('Gouache Atelier', () => {
  const def = MAPS.atelierGouache;
  const door: [number, number] = [7, 16];
  // in front of Basil
  const basile: [number, number] = [7, 4];

  /** Steps from the door to Basil on these rows, the blocks where they start. */
  const walk = (rows: string[]) => {
    const blocked = new Set([...busy(def), ...blocksOf(def).map(([x, y]) => `${x},${y}`)]);
    return bfs<[number, number]>(door, (p) => `${p}`, ([x, y]) => DIRS.flatMap(([, dx, dy]): [number, number][] => {
      const nx = x + dx, ny = y + dy;
      return solid(rows, nx, ny) || blocked.has(`${nx},${ny}`) ? [] : [[nx, ny]];
    }), ([x, y]) => x === basile[0] && y === basile[1]);
  };

  it('opens the hedge gate with both blocks on the plates, in a few pushes', () => {
    const n = pushes(def, door, blocksOf(def), covers(def));
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(12);
  });

  it('keeps Basil out of reach until the gate opens', () => {
    expect(walk(fresh(def))).toBeNull();
    expect(walk(def.rows)).not.toBeNull();
  });
});
