import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import type { MapDef } from '../../overworld/mapTypes';
import { DIRS, bfs, blocksOf, busy, fresh, pushes, solid } from '../puzzleSearch';

type P = [number, number];

/** Walks from `from` to `to`, pushing the eraser blocks into the holes (as `pushes` does); steps, or null. */
function reach(def: MapDef, from: P, to: P, blocks: P[]): number | null {
  const rows = fresh(def);
  const others = busy(def);
  const holes = new Set((def.holes ?? []).map((h) => `${h.x},${h.y}`));
  type S = { p: P; b: string[]; f: string[] };
  return bfs<S>(
    { p: from, b: blocks.map(([x, y]) => `${x},${y}`).sort(), f: [] },
    (s) => `${s.p}|${s.b.join(';')}|${s.f.join(';')}`,
    (s) => DIRS.flatMap(([, dx, dy]): S[] => {
      const nx = s.p[0] + dx, ny = s.p[1] + dy, k = `${nx},${ny}`;
      if ((solid(rows, nx, ny) && !s.f.includes(k)) || others.has(k)) return [];
      if (!s.b.includes(k)) return [{ ...s, p: [nx, ny] }];
      const bx = nx + dx, by = ny + dy, bk = `${bx},${by}`;
      const rest = s.b.filter((b) => b !== k);
      if (holes.has(bk) && !s.f.includes(bk)) return [{ p: [nx, ny], b: rest, f: [...s.f, bk].sort() }];
      if ((!solid(rows, bx, by) || s.f.includes(bk)) && !others.has(bk) && !s.b.includes(bk)) return [{ p: [nx, ny], b: [...rest, bk].sort(), f: s.f }];
      return [];
    }),
    (s) => s.p[0] === to[0] && s.p[1] === to[1],
  );
}

/** Atelier Aquarelle: Marine's pool, two channels whose stepping stones are eraser blocks pushed into holes. */
describe('Watercolour Atelier', () => {
  const def = MAPS.atelierAquarelle;
  const door: P = [7, 17];
  // the tile in front of Marine
  const marine: P = [7, 3];
  const blocks = blocksOf(def);
  const [a, b, c, d] = blocks;

  it('has its door where the town sends you, and Marine at the end', () => {
    const gym = MAPS.port.buildings!.find((x) => x.kind === 'gym')!;
    expect(gym.to).toMatchObject({ map: 'atelierAquarelle', x: door[0], y: door[1] });
    const m = def.npcs!.find((n) => n.trainer === 'marine')!;
    expect([m.x, m.y + 1]).toEqual(marine);
  });

  it('lets the blocks make a path of stones to Marine, and none is not enough', () => {
    expect(reach(def, door, marine, blocks)).not.toBeNull();
    expect(reach(def, door, marine, [])).toBeNull();
    // each channel takes its own two blocks
    expect(reach(def, door, marine, [a, b])).toBeNull();
    expect(reach(def, door, marine, [a, c, d])).toBeNull();
  });

  it('stays a few pushes per channel', () => {
    const near = (n: number | null, max: number) => n !== null && n <= max;
    const pool1 = (_b: Set<string>, f: Set<string>) => f.has('4,11') && f.has('4,12');
    const pool2 = (_b: Set<string>, f: Set<string>) => f.has('10,4') && f.has('10,5');
    expect(near(pushes(def, door, [a, b], pool1), 10)).toBe(true);
    expect(near(pushes(def, [4, 10], [c, d], pool2), 12)).toBe(true);
  });
});
