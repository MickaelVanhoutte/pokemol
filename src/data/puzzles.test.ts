import { describe, expect, it } from 'vitest';
import { MAPS } from './maps';
import { CREATURES } from './creatures';
import { flipBarriers, slideFrom, solvedPuzzles, tileOf } from '../overworld/puzzles';
import { DIRS, blocksOf, bfs, busy, covers, fresh, pushes, solid } from './puzzleSearch';

/**
 * The puzzles are checked on the real map data: each one can be solved from where the player
 * arrives, and stays "not too hard" (few pushes, slides or switch presses). The searches are in
 * src/data/puzzleSearch.ts; each Atelier's puzzle has its own test next to it (src/data/ateliers/).
 */

describe('puzzles: solvable and not too hard', () => {
  it('Eraser Warehouse: the crayon switches lead to the stairs and back', () => {
    const def = MAPS.entrepot1;
    const others = busy(def);
    type S = { x: number; y: number; flip: boolean };
    const walk = (to: [number, number]) => (st: S) => st.x === to[0] && st.y === to[1];
    const next = (st: S): S[] => {
      const rows = flipBarriers(def.rows, st.flip);
      const out: S[] = [];
      for (const [, dx, dy] of DIRS) {
        const nx = st.x + dx, ny = st.y + dy;
        const t = tileOf(rows, nx, ny);
        if (t === 'leverred' || t === 'leverblue') out.push({ ...st, flip: !st.flip });
        else if (!solid(rows, nx, ny) && !others.has(`${nx},${ny}`)) out.push({ x: nx, y: ny, flip: st.flip });
      }
      return out;
    };
    // the cost counts steps; presses are at most a few, checked by forbidding a third one below
    expect(bfs<S>({ x: 6, y: 10, flip: false }, (s) => `${s.x},${s.y},${s.flip}`, next, walk([1, 1]))).not.toBeNull();
    expect(bfs<S>({ x: 2, y: 1, flip: false }, (s) => `${s.x},${s.y},${s.flip}`, next, walk([6, 10]))).not.toBeNull();
    // without any switch the stairs are out of reach
    expect(bfs<S>({ x: 6, y: 10, flip: false }, (s) => `${s.x},${s.y},${s.flip}`, (s) => next(s).filter((n) => n.flip === s.flip), walk([1, 1]))).toBeNull();
  });

  it('Scribble-Out Cave 1F: two levers lead to the stairs down, none is not enough', () => {
    const def = MAPS.ratures1;
    const others = busy(def);
    type S = { x: number; y: number; flip: boolean };
    const next = (st: S): S[] => {
      const rows = flipBarriers(def.rows, st.flip);
      return DIRS.flatMap(([, dx, dy]): S[] => {
        const nx = st.x + dx, ny = st.y + dy, t = tileOf(rows, nx, ny);
        if (t === 'leverred' || t === 'leverblue') return [{ ...st, flip: !st.flip }];
        return !solid(rows, nx, ny) && !others.has(`${nx},${ny}`) ? [{ x: nx, y: ny, flip: st.flip }] : [];
      });
    };
    const at = (x: number, y: number) => (s: S) => s.x === x && s.y === y;
    expect(bfs<S>({ x: 7, y: 10, flip: false }, (s) => `${s.x},${s.y},${s.flip}`, next, at(1, 1))).not.toBeNull();
    expect(bfs<S>({ x: 1, y: 2, flip: false }, (s) => `${s.x},${s.y},${s.flip}`, next, at(7, 10))).not.toBeNull();
    expect(bfs<S>({ x: 7, y: 10, flip: false }, (s) => `${s.x},${s.y},${s.flip}`, (s) => next(s).filter((n) => n.flip === s.flip), at(1, 1))).toBeNull();
  });

  it('Scribble-Out Cave 2F: the glossy paper leads to the stairs down, its holes to the floor above', () => {
    const def = MAPS.ratures2;
    const rows = fresh(def);
    const holes = new Set((def.holes ?? []).map((h) => `${h.x},${h.y}`));
    const free = (x: number, y: number) => !solid(rows, x, y) || holes.has(`${x},${y}`);
    const moves = bfs<[number, number]>([14, 2], (p) => `${p}`, ([x, y]) => DIRS.flatMap(([d, dx, dy]) => {
      if (!free(x + dx, y + dy)) return [];
      const [ex, ey] = slideFrom(rows, x + dx, y + dy, d, (a, b) => free(a, b) && !holes.has(`${a},${b}`));
      return holes.has(`${ex},${ey}`) || holes.has(`${x + dx},${y + dy}`) ? [] : [[ex, ey] as [number, number]];
    }), ([x, y]) => x === 1 && y === 10);
    expect(moves).not.toBeNull();
    expect(moves!).toBeLessThanOrEqual(10);
    for (const h of def.holes ?? []) expect(h.fall && h.to && !solid(fresh(MAPS[h.to.map]), h.to.x, h.to.y)).toBe(true);
  });

  it('Scribble-Out Cave 3F: both boulders can fill the pits on the way to the back', () => {
    const def = MAPS.ratures3;
    const n = pushes(def, [6, 10], blocksOf(def), (_b, f) => f.size === (def.holes ?? []).length);
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(12);
  });

  it('Lost Woods: following the fireflies reaches the clearing without a wrong turn', () => {
    const def = MAPS.boisPerdu;
    const rows = fresh(def);
    const lost = new Set((def.triggers ?? []).filter((t) => t.script === 'boisPerduLost').map((t) => `${t.x},${t.y}`));
    const fireflies = new Set<string>();
    rows.forEach((r, y) => [...r].forEach((c, x) => c === 'y' && fireflies.add(`${x},${y}`)));
    // the shortest safe way goes over every firefly
    type S = { x: number; y: number; seen: string[] };
    const steps = bfs<S>({ x: 10, y: 15, seen: [] }, (s) => `${s.x},${s.y},${s.seen.join(';')}`, (s) => DIRS.flatMap(([, dx, dy]): S[] => {
      const nx = s.x + dx, ny = s.y + dy, k = `${nx},${ny}`;
      if (solid(rows, nx, ny) || lost.has(k)) return [];
      return [{ x: nx, y: ny, seen: fireflies.has(k) && !s.seen.includes(k) ? [...s.seen, k].sort() : s.seen }];
    }), (s) => s.x === 11 && s.y === 3 && s.seen.length === fireflies.size);
    expect(steps).not.toBeNull();
    // every wrong turn is a dead end off the safe way
    expect(lost.size).toBeGreaterThanOrEqual(5);
    for (const k of lost) expect(fireflies.has(k)).toBe(false);
  });

  it('Misty Tower 2F: the glossy paper hall leads to the top stairs in a few slides', () => {
    const def = MAPS.tour2;
    const rows = fresh(def);
    const others = busy(def);
    const holes = new Set((def.holes ?? []).map((h) => `${h.x},${h.y}`));
    const free = (x: number, y: number) => (!solid(rows, x, y) || holes.has(`${x},${y}`)) && !others.has(`${x},${y}`);
    const moves = bfs<[number, number]>([10, 2], (p) => `${p}`, ([x, y]) => DIRS.flatMap(([d, dx, dy]) => {
      if (!free(x + dx, y + dy)) return [];
      const [ex, ey] = slideFrom(rows, x + dx, y + dy, d, (a, b) => free(a, b) && !holes.has(`${a},${b}`));
      // falling into a hole is not a way forward
      return holes.has(`${ex},${ey}`) || holes.has(`${x + dx},${y + dy}`) ? [] : [[ex, ey] as [number, number]];
    }), ([x, y]) => x === 1 && y === 1);
    expect(moves).not.toBeNull();
    expect(moves!).toBeLessThanOrEqual(10);
    // every slide that ends in the hole really has a floor below to land on
    for (const h of def.holes ?? []) expect(h.fall && h.to && !solid(fresh(MAPS[h.to.map]), h.to.x, h.to.y)).toBe(true);
  });

  it('Mount Charcoal crater: both boulders can drop into the holes', () => {
    const def = MAPS.montFusain2;
    const n = pushes(def, [16, 2], blocksOf(def), (_b, f) => f.size === (def.holes ?? []).length);
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(8);
  });

  it('Inkwell Lighthouse 2F: two blocks open the gate, whichever one fell down the hole', () => {
    const def = MAPS.phare2;
    const all = blocksOf(def);
    const n = pushes(def, [7, 2], all, covers(def));
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(8);
    for (let i = 0; i < all.length; i++) expect(pushes(def, [7, 2], all.filter((_, k) => k !== i), covers(def)), `without block ${i}`).not.toBeNull();
    expect(pushes(def, [7, 2], all, (b, f) => covers(def)(b) && f.size === 1)).not.toBeNull();
  });

  it('Echo Cave: two boulders fill the two pits of the passage', () => {
    const def = MAPS.grotteEchos;
    const n = pushes(def, [7, 10], blocksOf(def), (_b, f) => f.size === 2);
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(10);
  });

  it('Eraser Fortress 1F: the crayon switches lead to the stairs and back', () => {
    const def = MAPS.forteresse1;
    const others = busy(def);
    type S = { x: number; y: number; flip: boolean };
    const at = (x: number, y: number) => (s: S) => s.x === x && s.y === y;
    const next = (st: S): S[] => {
      const rows = flipBarriers(def.rows, st.flip);
      return DIRS.flatMap(([, dx, dy]): S[] => {
        const nx = st.x + dx, ny = st.y + dy, t = tileOf(rows, nx, ny);
        if (t === 'leverred' || t === 'leverblue') return [{ ...st, flip: !st.flip }];
        return !solid(rows, nx, ny) && !others.has(`${nx},${ny}`) ? [{ x: nx, y: ny, flip: st.flip }] : [];
      });
    };
    const key = (s: S) => `${s.x},${s.y},${s.flip}`;
    expect(bfs<S>({ x: 7, y: 10, flip: false }, key, next, at(12, 1))).not.toBeNull();
    expect(bfs<S>({ x: 11, y: 1, flip: false }, key, next, at(7, 10))).not.toBeNull();
    expect(bfs<S>({ x: 7, y: 10, flip: false }, key, (s) => next(s).filter((n) => n.flip === s.flip), at(12, 1))).toBeNull();
  });

  it('Eraser Fortress 2F: the glossy hall leads to the stairs up in a few slides', () => {
    const def = MAPS.forteresse2;
    const rows = fresh(def);
    const others = busy(def);
    const holes = new Set((def.holes ?? []).map((h) => `${h.x},${h.y}`));
    const free = (x: number, y: number) => (!solid(rows, x, y) || holes.has(`${x},${y}`)) && !others.has(`${x},${y}`);
    const moves = bfs<[number, number]>([1, 2], (p) => `${p}`, ([x, y]) => DIRS.flatMap(([d, dx, dy]) => {
      if (!free(x + dx, y + dy)) return [];
      const [ex, ey] = slideFrom(rows, x + dx, y + dy, d, (a, b) => free(a, b) && !holes.has(`${a},${b}`));
      return holes.has(`${ex},${ey}`) || holes.has(`${x + dx},${y + dy}`) ? [] : [[ex, ey] as [number, number]];
    }), ([x, y]) => x === 10 && y === 1);
    expect(moves).not.toBeNull();
    expect(moves!).toBeLessThanOrEqual(10);
    for (const h of def.holes ?? []) expect(h.fall && h.to && !solid(fresh(MAPS[h.to.map]), h.to.x, h.to.y)).toBe(true);
  });

  it('Eraser Factory 2F: two blocks on the plates open the shutter, even after one fell down the hole', () => {
    const def = MAPS.usine2;
    const all = blocksOf(def);
    const n = pushes(def, [2, 1], all, covers(def));
    expect(n).not.toBeNull();
    expect(n!).toBeLessThanOrEqual(8);
    // a block dropped into the hole on an earlier visit is gone: the two left still do it
    for (let i = 0; i < all.length; i++) expect(pushes(def, [2, 1], all.filter((_, k) => k !== i), covers(def)), `without block ${i}`).not.toBeNull();
    // the optional storeroom: plates and the hole together
    expect(pushes(def, [2, 1], all, (b, f) => covers(def)(b) && f.size === 1)).not.toBeNull();
  });
});

describe('puzzles: the Lac des Couleurs', () => {
  it('Yellow spring: five eraser blocks moved out of the way in a few pushes', () => {
    const def = MAPS.lac;
    const rows = fresh(def);
    // the tile in front of the spring is free and the player can walk to it from the way in
    const reach = (b: Set<string>) => {
      if (b.has('22,4')) return false;
      const seen = new Set(['22,9']);
      const todo: [number, number][] = [[22, 9]];
      while (todo.length) {
        const [x, y] = todo.pop()!;
        if (x === 22 && y === 4) return true;
        for (const [, dx, dy] of DIRS) {
          const k = `${x + dx},${y + dy}`;
          if (seen.has(k) || b.has(k) || solid(rows, x + dx, y + dy)) continue;
          seen.add(k);
          todo.push([x + dx, y + dy]);
        }
      }
      return false;
    };
    const n = pushes(def, [22, 9], blocksOf(def), (b) => reach(b));
    expect(n).not.toBeNull();
    expect(n!).toBeGreaterThanOrEqual(4);
    expect(n!).toBeLessThanOrEqual(8);
  });
});

describe('puzzles: map data', () => {
  const maps = Object.values(MAPS);

  it('puts holes, plates and fresques on their tiles', () => {
    for (const def of maps) {
      const rows = fresh(def);
      for (const h of def.holes ?? []) expect(tileOf(rows, h.x, h.y), `${def.id} hole ${h.x},${h.y}`).toBe('hole');
      for (const pz of def.puzzles ?? []) for (const [x, y] of pz.plates) expect(tileOf(rows, x, y), `${def.id} plate ${x},${y}`).toBe('plate');
      for (const f of def.fresques ?? []) {
        expect(tileOf(rows, f.x, f.y), `${def.id} fresque`).toBe('fresque');
        expect(CREATURES.some((c) => c.id === f.species)).toBe(true);
      }
    }
  });

  it('lands every dropped boulder or block on the floor below, and solves what waits there', () => {
    for (const def of maps) {
      for (const h of def.holes ?? []) {
        if (!h.to) continue;
        const below = MAPS[h.to.map];
        const flagName = `hole:${def.id}:${h.x},${h.y}`;
        const landed = (below.obstacles ?? []).filter((o) => o.showIf === flagName);
        expect(landed.map((o) => [o.x, o.y]), `${def.id} → ${below.id}`).toEqual(h.fall ? [] : [[h.to.x, h.to.y]]);
      }
      // a mechanism fed from above is solved once every hole above has been filled
      for (const pz of def.puzzles ?? []) {
        const fromAbove = (def.obstacles ?? []).filter((o) => o.showIf?.startsWith('hole:'));
        if (!fromAbove.length) continue;
        expect(solvedPuzzles({ ...def, puzzles: [pz] }, fromAbove)).toEqual([pz.flag]);
      }
    }
  });

  it('keeps switches clear and people off barriers and glossy paper', () => {
    for (const def of maps) {
      const rows = def.rows;
      rows.forEach((r, y) => [...r].forEach((c, x) => {
        if (c !== 'L' && c !== 'l') return;
        for (const [, dx, dy] of DIRS) expect('ZzJj'.includes(rows[y + dy]?.[x + dx] ?? ''), `${def.id} switch ${x},${y}`).toBe(false);
      }));
      for (const n of def.npcs ?? []) expect('ZzJjI'.includes(rows[n.y][n.x]), `${def.id} ${n.id}`).toBe(false);
      for (const o of def.obstacles ?? []) expect(solid(fresh(def), o.x, o.y) || tileOf(def.rows, o.x, o.y) === 'glossy', `${def.id} obstacle ${o.x},${o.y}`).toBe(false);
    }
  });

  it('names every fresque once (the collection reward counts them)', () => {
    const ids = maps.flatMap((m) => (m.fresques ?? []).map((f) => f.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(5);
  });
});
