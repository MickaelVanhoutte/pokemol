import { applyPatches } from '../overworld/patches';
import { flipBarriers, slideFrom, solvedPuzzles, tileOf } from '../overworld/puzzles';
import { tile } from '../overworld/tiles';
import type { MapDef } from '../overworld/mapTypes';
import type { Dir } from '../save/schema';

/**
 * Searches that solve the puzzles on the real map data, for the tests (src/data/puzzles.test.ts and each Atelier's
 * own test): each puzzle can be solved from where the player arrives, and stays "not too hard".
 */

export const DIRS: [Dir, number, number][] = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
/** Rows as the player first finds them: gates closed, fresques in place, nothing solved. */
export const fresh = (def: MapDef) => applyPatches(def.rows, def.patches, () => false);
export const solid = (rows: string[], x: number, y: number) => tile(tileOf(rows, x, y)).solid;
/** Things in the way besides tiles: people and items on the ground. */
export const busy = (def: MapDef) => new Set([...(def.npcs ?? []), ...(def.items ?? []).filter((p) => !p.hidden && !p.showIf)].map((a) => `${a.x},${a.y}`));

/** Breadth-first search; returns the cost (number of edges) to the goal, or null. */
export function bfs<T>(start: T, key: (s: T) => string, next: (s: T) => T[], goal: (s: T) => boolean, limit = 300000): number | null {
  const seen = new Map<string, number>([[key(start), 0]]);
  let frontier = [start];
  for (let d = 0; frontier.length; d++) {
    const out: T[] = [];
    for (const s of frontier) {
      if (goal(s)) return d;
      for (const n of next(s)) {
        const k = key(n);
        if (seen.has(k)) continue;
        seen.set(k, d + 1);
        out.push(n);
      }
    }
    if (seen.size > limit) return null;
    frontier = out;
  }
  return null;
}

/** Sokoban: pushes needed so that `goal(blocks, filled holes)` holds, starting from the player at `start`. */
export function pushes(def: MapDef, start: [number, number], blocks: [number, number][], goal: (b: Set<string>, f: Set<string>) => boolean): number | null {
  const rows = fresh(def);
  const others = busy(def);
  const holes = new Set((def.holes ?? []).map((h) => `${h.x},${h.y}`));
  type S = { p: [number, number]; b: string[]; f: string[]; n: number };
  // the search counts steps; pushes are tracked in the state and the smallest is kept by
  // exploring states in order of steps (good enough for these small rooms)
  let best: number | null = null;
  bfs<S>(
    { p: start, b: blocks.map(([x, y]) => `${x},${y}`).sort(), f: [], n: 0 },
    (s) => `${s.p}|${s.b.join(';')}|${s.f.join(';')}`,
    (s) => {
      const out: S[] = [];
      for (const [, dx, dy] of DIRS) {
        const nx = s.p[0] + dx, ny = s.p[1] + dy, k = `${nx},${ny}`;
        if (solid(rows, nx, ny) && !(holes.has(k) && s.f.includes(k))) continue;
        if (others.has(k)) continue;
        if (!s.b.includes(k)) { out.push({ ...s, p: [nx, ny] }); continue; }
        const bx = nx + dx, by = ny + dy, bk = `${bx},${by}`;
        const rest = s.b.filter((b) => b !== k);
        if (holes.has(bk) && !s.f.includes(bk)) out.push({ p: [nx, ny], b: rest, f: [...s.f, bk].sort(), n: s.n + 1 });
        else if ((!solid(rows, bx, by) || s.f.includes(bk)) && !others.has(bk) && !s.b.includes(bk)) out.push({ p: [nx, ny], b: [...rest, bk].sort(), f: s.f, n: s.n + 1 });
      }
      return out;
    },
    (s) => {
      const ok = goal(new Set(s.b), new Set(s.f));
      if (ok && (best === null || s.n < best)) best = s.n;
      return ok;
    },
  );
  return best;
}

export const blocksOf = (def: MapDef) => (def.obstacles ?? []).filter((o) => (o.kind === 'block' || o.kind === 'boulder') && !o.showIf).map((o): [number, number] => [o.x, o.y]);
export const covers = (def: MapDef) => (b: Set<string>) => def.puzzles!.every((pz) => pz.plates.every(([x, y]) => b.has(`${x},${y}`)));

/** Walks a room of crayon barriers from `from` to `to`, pressing switches (`flips: false` forbids them). */
export function throughBarriers(def: MapDef, from: [number, number], to: [number, number], flips = true): number | null {
  const others = busy(def);
  type S = { x: number; y: number; flip: boolean };
  const next = (st: S): S[] => {
    const rows = flipBarriers(def.rows, st.flip);
    return DIRS.flatMap(([, dx, dy]): S[] => {
      const nx = st.x + dx, ny = st.y + dy, t = tileOf(rows, nx, ny);
      if (t === 'leverred' || t === 'leverblue') return flips ? [{ ...st, flip: !st.flip }] : [];
      return !solid(rows, nx, ny) && !others.has(`${nx},${ny}`) ? [{ x: nx, y: ny, flip: st.flip }] : [];
    });
  };
  return bfs<S>({ x: from[0], y: from[1], flip: false }, (s) => `${s.x},${s.y},${s.flip}`, next, (s) => s.x === to[0] && s.y === to[1]);
}

export { slideFrom, solvedPuzzles, tileOf, flipBarriers };
