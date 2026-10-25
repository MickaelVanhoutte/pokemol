import { describe, expect, it } from 'vitest';
import { MAPS } from './maps';
import { CREATURE_BY_ID } from './creatures';
import { TRAINERS } from './trainers';
import { LEGEND, type MapDef } from '../overworld/mapTypes';
import { footprint } from '../overworld/buildings';
import { TILES } from '../overworld/tiles';

function walkable(map: MapDef, x: number, y: number, allowDoor = true): boolean {
  if (y < 0 || y >= map.rows.length || x < 0 || x >= map.rows[0].length) return false;
  const id = LEGEND[map.rows[y][x]];
  if (!id || TILES[id]?.solid) return false;
  for (const b of map.buildings ?? []) {
    for (const f of footprint(b)) if (f.x === x && f.y === y) return allowDoor && f.door;
  }
  return true;
}

describe('maps', () => {
  for (const map of Object.values(MAPS)) {
    describe(map.id, () => {
      it('has a rectangular grid of known tiles', () => {
        const w = map.rows[0].length;
        map.rows.forEach((r, y) => {
          expect(r.length, `row ${y}`).toBe(w);
          for (const ch of r) expect(LEGEND[ch], `char "${ch}" row ${y}`).toBeDefined();
        });
      });

      it('has warps that land on walkable tiles', () => {
        for (const wp of map.warps ?? []) {
          expect(walkable(map, wp.x, wp.y), `warp tile ${wp.x},${wp.y}`).toBe(true);
          const target = MAPS[wp.to.map];
          expect(target, wp.to.map).toBeDefined();
          expect(walkable(target, wp.to.x, wp.to.y, false), `${wp.to.map} ${wp.to.x},${wp.to.y}`).toBe(true);
        }
        for (const b of map.buildings ?? []) {
          expect(b.x + b.w <= map.rows[0].length && b.y + b.h <= map.rows.length, `building ${b.kind}`).toBe(true);
          const doorX = b.x + b.door, doorY = b.y + b.h - 1;
          expect(walkable(map, doorX, doorY + 1, false), `in front of ${b.kind} door`).toBe(true);
          if (b.to) {
            const target = MAPS[b.to.map];
            expect(target).toBeDefined();
            expect(walkable(target, b.to.x, b.to.y, false), `${b.to.map} ${b.to.x},${b.to.y}`).toBe(true);
          }
        }
      });

      it('places NPCs and triggers on free tiles', () => {
        for (const n of map.npcs ?? []) {
          expect(walkable(map, n.x, n.y, false), `npc ${n.id}`).toBe(true);
          if (n.trainer) expect(TRAINERS[n.trainer], n.trainer).toBeDefined();
        }
        for (const t of map.triggers ?? []) expect(walkable(map, t.x, t.y), `trigger ${t.script}`).toBe(true);
      });

      it('only lists known creatures in encounters', () => {
        for (const e of map.encounters?.table ?? []) expect(CREATURE_BY_ID[e.id], e.id).toBeDefined();
      });
    });
  }
});
