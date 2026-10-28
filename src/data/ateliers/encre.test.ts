import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { bfs, busy, DIRS, fresh, slideFrom, solid, tileOf } from '../puzzleSearch';
import type { Dir } from '../../save/schema';

type P = [number, number];

/** Atelier Encre: Nocturne's library floor is glossy paper; its ink blots drop you back at the door. */
describe('Ink Atelier', () => {
  const def = MAPS.atelierEncre;
  const rows = fresh(def);
  const others = busy(def);
  const blots = new Set((def.holes ?? []).map((h) => `${h.x},${h.y}`));
  const door: P = [5, 10];
  const master: P = [10, 3]; // in front of Nocturne
  const free = (x: number, y: number) => !solid(rows, x, y) && !others.has(`${x},${y}`);
  /** One press as the game plays it: a step, then a slide while on glossy paper. Into a blot: null, you fall. */
  const press = ([x, y]: P, d: Dir, dx: number, dy: number): P | null => {
    const nx = x + dx, ny = y + dy;
    if (blots.has(`${nx},${ny}`)) return null;
    if (!free(nx, ny)) return [x, y];
    const end = slideFrom(rows, nx, ny, d, (a, b) => free(a, b) || blots.has(`${a},${b}`));
    return blots.has(`${end}`) ? null : end;
  };
  const next = (p: P) => DIRS.map(([d, dx, dy]) => press(p, d, dx, dy)).filter((n): n is P => !!n && `${n}` !== `${p}`);
  const reaches = (from: P, to: P) => bfs<P>(from, (p) => `${p}`, next, (p) => `${p}` === `${to}`);

  it('slides from the door to Nocturne past her four trainers', () => {
    const moves = reaches(door, master);
    expect(moves).not.toBeNull();
    // three steps along the hall, one into the gap, then seven slides
    expect(moves!).toBeLessThanOrEqual(12);
  });

  it('cannot be walked: the plain floor alone never leads to her', () => {
    const walk = bfs<P>(door, (p) => `${p}`, ([x, y]) => DIRS.map(([, dx, dy]): P => [x + dx, y + dy])
      .filter(([a, b]) => free(a, b) && tileOf(rows, a, b) !== 'glossy' && !blots.has(`${a},${b}`)), (p) => `${p}` === `${master}`);
    expect(walk).toBeNull();
  });

  it('drops you at the door from every blot, and never strands you on the paper', () => {
    for (const h of def.holes ?? []) {
      expect(tileOf(rows, h.x, h.y)).toBe('hole');
      expect(h.fall && h.to?.map === def.id && `${[h.to.x, h.to.y]}` === `${door}`).toBe(true);
    }
    // some slides end in a blot (a wrong one costs the walk back)…
    const seen = new Set<string>([`${door}`]);
    const todo: P[] = [door];
    let falls = 0;
    while (todo.length) {
      const p = todo.pop()!;
      for (const [d, dx, dy] of DIRS) {
        const n = press(p, d, dx, dy);
        if (!n) { falls++; continue; }
        if (!seen.has(`${n}`)) { seen.add(`${n}`); todo.push(n); }
      }
    }
    expect(falls).toBeGreaterThan(0);
    // …but from anywhere you can slide to, Nocturne is still in reach, counting the falls back to the door
    const orFall = (p: P) => DIRS.map(([d, dx, dy]) => press(p, d, dx, dy) ?? door);
    for (const k of seen) {
      const p = k.split(',').map(Number) as P;
      expect(bfs<P>(p, (q) => `${q}`, orFall, (q) => `${q}` === `${master}`), `stuck at ${k}`).not.toBeNull();
    }
  });

  it('keeps its trainers on plain floor, looking at plain floor (they never walk onto the paper)', () => {
    for (const n of def.npcs ?? []) {
      if (!n.trainer) continue;
      const [, dx, dy] = DIRS.find(([d]) => d === n.facing)!;
      for (let i = 0; i <= (n.sight ?? 3); i++) expect(tileOf(rows, n.x + dx * i, n.y + dy * i), `${n.id} +${i}`).not.toBe('glossy');
    }
  });
});
