import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { DIRS, bfs, busy, flipBarriers, solid, throughBarriers, tileOf } from '../puzzleSearch';

/** Atelier Fluo: a grid of rooms and three switches; each doorway opens only once the right switch is pressed. */
describe('Neon Atelier', () => {
  const def = MAPS.atelierFluo;
  const others = busy(def);
  const door: [number, number] = [5, 10];
  // in front of Zélie, on her stage
  const zelie: [number, number] = [5, 3];
  type S = { x: number; y: number; flip: boolean; presses: number };
  /** Walks with at most `max` switch presses; returns the steps to `to`, or null. */
  const walk = (max: number, from: [number, number], to: [number, number]) => bfs<S>(
    { x: from[0], y: from[1], flip: false, presses: 0 },
    (s) => `${s.x},${s.y},${s.flip},${s.presses}`,
    (st) => {
      const rows = flipBarriers(def.rows, st.flip);
      return DIRS.flatMap(([, dx, dy]): S[] => {
        const nx = st.x + dx, ny = st.y + dy, t = tileOf(rows, nx, ny);
        if (t === 'leverred' || t === 'leverblue') return st.presses < max ? [{ ...st, flip: !st.flip, presses: st.presses + 1 }] : [];
        return !solid(rows, nx, ny) && !others.has(`${nx},${ny}`) ? [{ ...st, x: nx, y: ny }] : [];
      });
    },
    (s) => s.x === to[0] && s.y === to[1],
  );

  it('lets the switches lead from the door round to Zélie, and none is not enough', () => {
    expect(throughBarriers(def, door, zelie)).not.toBeNull();
    expect(throughBarriers(def, door, zelie, false)).toBeNull();
  });

  it('takes the three switches, one after the other', () => {
    expect(walk(2, door, zelie)).toBeNull();
    expect(walk(3, door, zelie)).not.toBeNull();
  });

  it('always finds the way back to the door, even with the barriers back in place (a game saved inside)', () => {
    // every tile the player can reach, whatever the switches did
    const reached = new Set<string>();
    bfs<S>({ x: door[0], y: door[1], flip: false, presses: 0 }, (s) => `${s.x},${s.y},${s.flip}`, (st) => {
      reached.add(`${st.x},${st.y}`);
      const rows = flipBarriers(def.rows, st.flip);
      return DIRS.flatMap(([, dx, dy]): S[] => {
        const nx = st.x + dx, ny = st.y + dy, t = tileOf(rows, nx, ny);
        if (t === 'leverred' || t === 'leverblue') return [{ ...st, flip: !st.flip }];
        return !solid(rows, nx, ny) && !others.has(`${nx},${ny}`) ? [{ ...st, x: nx, y: ny }] : [];
      });
    }, () => false);
    expect(reached.has(zelie.join(','))).toBe(true);
    for (const k of reached) {
      const [x, y] = k.split(',').map(Number);
      expect(throughBarriers(def, [x, y], door), `stuck at ${k}`).not.toBeNull();
    }
  });

  it('never puts a crayon barrier next to a switch (pressing it must not trap the player)', () => {
    def.rows.forEach((r, y) => [...r].forEach((c, x) => {
      if (c !== 'L' && c !== 'l') return;
      for (const [, dx, dy] of DIRS) expect('ZzJj'.includes(def.rows[y + dy]?.[x + dx] ?? 'W'), `switch ${x},${y}`).toBe(false);
    }));
  });
});
