import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { DIRS, busy, fresh, slideFrom, solid, tileOf } from '../puzzleSearch';

/**
 * Atelier Paillette: Celestine's starry floor is glossy paper. Two halls to slide across, where her drawings on easels
 * stop you, then her star-shaped dais.
 */
type P = [number, number];
const key = ([x, y]: P) => `${x},${y}`;

/** Where each direction takes you with one press: a step, or a whole slide on the glossy paper. */
function moves(rows: string[], others: Set<string>, [x, y]: P): { to: P; slide: boolean }[] {
  const free = (a: number, b: number) => !solid(rows, a, b) && !others.has(`${a},${b}`);
  return DIRS.flatMap(([d, dx, dy]) => {
    if (!free(x + dx, y + dy)) return [];
    return [{ to: slideFrom(rows, x + dx, y + dy, d, free), slide: tileOf(rows, x + dx, y + dy) === 'glossy' }];
  });
}

/** The fewest slides from `from` to `to` (walking is free), or null when there is no way. */
function slides(rows: string[], others: Set<string>, from: P, to: P): number | null {
  const best = new Map([[key(from), 0]]);
  const queue: [P, number][] = [[from, 0]];
  while (queue.length) {
    const [p, n] = queue.shift()!;
    if (n > best.get(key(p))!) continue;
    if (key(p) === key(to)) return n;
    for (const m of moves(rows, others, p)) {
      const c = n + (m.slide ? 1 : 0);
      if (c >= (best.get(key(m.to)) ?? Infinity)) continue;
      best.set(key(m.to), c);
      if (m.slide) queue.push([m.to, c]);
      else queue.unshift([m.to, c]);
    }
  }
  return null;
}

const def = MAPS.atelierPaillette;
const rows = fresh(def);
const others = busy(def);
const gym = MAPS.paillette.buildings!.find((b) => b.to?.map === 'atelierPaillette')!;
/** Where you arrive from the town's door, and the tile in front of Celestine. */
const DOOR: P = [gym.to!.x, gym.to!.y];
const master = def.npcs!.find((n) => n.trainer === 'celestine')!;
const FRONT: P = [master.x, master.y + 1];

describe('Glitter Atelier', () => {
  it('slides from the door to Celestine in a few turns, and not without the easels', () => {
    const n = slides(rows, others, DOOR, FRONT);
    expect(n).not.toBeNull();
    // more than a straight slide, still a child's puzzle
    expect(n!).toBeGreaterThanOrEqual(8);
    expect(n!).toBeLessThanOrEqual(12);
    // the way back to the door after the badge
    expect(slides(rows, others, FRONT, DOOR)).not.toBeNull();
    // with the easels on the glossy paper taken away, nothing stops you where you need to be
    const bare = rows.map((r, y) => [...r].map((c, x) => ('pq'.includes(c) && DIRS.some(([, dx, dy]) => rows[y + dy]?.[x + dx] === 'I') ? 'I' : c)).join(''));
    expect(slides(bare, others, DOOR, FRONT)).toBeNull();
  });

  it('never strands you: from any free tile (where a slide stops, or an older save put you), you can get back to the door', () => {
    rows.forEach((r, y) => [...r].forEach((_, x) => {
      if (!solid(rows, x, y) && !others.has(key([x, y]))) expect(slides(rows, others, [x, y], DOOR), `stuck at ${x},${y}`).not.toBeNull();
    }));
  });

  it('keeps the trainers off the glossy paper and out of the way, wherever they walk to battle', () => {
    for (const n of def.npcs ?? []) {
      expect(tileOf(rows, n.x, n.y), n.id).not.toBe('glossy');
      if (!n.trainer) continue;
      const [, dx, dy] = DIRS.find(([d]) => d === n.facing)!;
      // spotting you j + 1 tiles away, it walks j tiles to stand next to you, and stays there
      for (let j = 1; j < (n.sight ?? 3); j++) {
        const at: P = [n.x + dx * j, n.y + dy * j];
        if (solid(rows, at[0], at[1])) break;
        expect(tileOf(rows, at[0], at[1]), `${n.id} walks onto glossy paper`).not.toBe('glossy');
        const moved = new Set([...others].filter((k) => k !== key([n.x, n.y]))).add(key(at));
        expect(slides(rows, moved, DOOR, FRONT), `${n.id} at ${at}`).not.toBeNull();
        expect(slides(rows, moved, FRONT, DOOR), `${n.id} at ${at}`).not.toBeNull();
      }
    }
  });
});
