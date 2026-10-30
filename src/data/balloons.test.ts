import { describe, expect, it } from 'vitest';
import { BALLOONS } from './balloons';
import { MAPS } from './maps';
import { WORLD } from './worldmap';
import { LEGEND } from '../overworld/mapTypes';
import { tile } from '../overworld/tiles';
import { footprint } from '../overworld/buildings';

/** The Pencil Balloon moored in each town (src/data/balloons.ts): where it stands must not get in anyone's way. */
describe('Pencil Balloons', () => {
  it('stands in every town the balloon flies to, and only there', () => {
    const towns = Object.entries(WORLD).filter(([, w]) => w.fly).map(([id]) => id).sort();
    expect(Object.keys(BALLOONS).sort()).toEqual(towns);
  });

  for (const [id, b] of Object.entries(BALLOONS)) {
    it(`${id}: on free ground by its pilot, the landing tile next to it, every door and exit still reachable`, () => {
      const map = MAPS[id];
      const W = Math.max(...map.rows.map((r) => r.length)), H = map.rows.length;
      const buildings = new Set<string>(), doors: [number, number][] = [];
      for (const bd of map.buildings ?? []) for (const f of footprint(bd)) {
        if (f.door) doors.push([f.x, f.y]);
        else buildings.add(`${f.x},${f.y}`);
      }
      const taken = new Set<string>([
        ...(map.npcs ?? []).filter((n) => n.id !== 'pilot').map((n) => `${n.x},${n.y}`),
        ...(map.items ?? []).map((n) => `${n.x},${n.y}`),
        ...(map.warps ?? []).map((n) => `${n.x},${n.y}`),
        ...(map.triggers ?? []).map((n) => `${n.x},${n.y}`),
        ...(map.signs ?? []).map((n) => `${n.x},${n.y}`),
        ...(map.obstacles ?? []).map((n) => `${n.x},${n.y}`),
        ...doors.map(([x, y]) => `${x},${y}`),
      ]);
      const ground = (x: number, y: number) =>
        x >= 0 && y >= 0 && x < W && y < H && !tile(LEGEND[map.rows[y][x]] ?? 'void').solid && !buildings.has(`${x},${y}`);
      const free = (x: number, y: number) => ground(x, y) && !taken.has(`${x},${y}`);
      const basket = [[b.basket.x, b.basket.y], [b.basket.x + 1, b.basket.y]];
      for (const [x, y] of basket) expect(free(x, y), `basket ${x},${y}`).toBe(true);
      // the envelope, two tiles above the basket, never covers a building
      for (const [x] of basket) for (const y of [b.basket.y - 1, b.basket.y - 2]) expect(buildings.has(`${x},${y}`), `envelope ${x},${y}`).toBe(false);
      // the pilot right beside the basket
      expect(free(b.pilot.x, b.pilot.y), 'pilot').toBe(true);
      expect(b.pilot.y).toBe(b.basket.y);
      expect([b.basket.x - 1, b.basket.x + 2]).toContain(b.pilot.x);
      // the player steps out of the basket next to it
      const land = WORLD[id].fly!;
      expect(free(land.x, land.y), 'landing tile').toBe(true);
      expect(Math.abs(land.y - b.basket.y) <= 1 && land.x >= b.basket.x - 1 && land.x <= b.basket.x + 2, 'landing by the basket').toBe(true);
      // every door and exit reachable before is still reachable with the basket and the pilot there
      const reach = (blocked: Set<string>) => {
        const seen = new Set<string>([`${land.x},${land.y}`]);
        const todo = [[land.x, land.y]];
        while (todo.length) {
          const [x, y] = todo.pop()!;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const k = `${x + dx},${y + dy}`;
            if (seen.has(k) || blocked.has(k)) continue;
            const isDoor = doors.some(([u, v]) => u === x + dx && v === y + dy);
            if (!isDoor && !ground(x + dx, y + dy)) continue;
            seen.add(k);
            if (!isDoor) todo.push([x + dx, y + dy]);
          }
        }
        return [...doors.map(([x, y]) => `${x},${y}`), ...(map.warps ?? []).map((w) => `${w.x},${w.y}`)].filter((k) => seen.has(k));
      };
      const without = reach(new Set());
      const withIt = reach(new Set([...basket.map(([x, y]) => `${x},${y}`), `${b.pilot.x},${b.pilot.y}`]));
      expect(withIt.sort()).toEqual(without.sort());
    });
  }
});
