import { describe, expect, it } from 'vitest';
import { MAPS } from './maps';
import { CREATURE_BY_ID } from './creatures';
import { TRAINERS } from './trainers';
import { ITEM_BY_ID } from './items';
import { LEGEND, type MapDef } from '../overworld/mapTypes';
import { footprint } from '../overworld/buildings';
import { habitatsOf } from './habitats';
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

      it('puts signs on something solid (a sign post, a wall, a rock)', () => {
        for (const sg of map.signs ?? []) expect(TILES[LEGEND[map.rows[sg.y]?.[sg.x] ?? ' ']]?.solid, `sign ${sg.x},${sg.y}`).toBe(true);
      });

      it('has warps that land on walkable tiles', () => {
        for (const wp of map.warps ?? []) {
          expect(walkable(map, wp.x, wp.y), `warp tile ${wp.x},${wp.y}`).toBe(true);
          if (wp.to === 'back') {
            // only shared interiors send you back through the door you came in by
            expect(map.generic, `'back' warp outside a shared interior`).toBe(true);
            continue;
          }
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
        for (const p of map.items ?? []) {
          // hidden items are examined from the next tile, they may sit on a shelf or the sea
          if (p.hidden) expect(p.y < map.rows.length && p.x < map.rows[0].length, `hidden ${p.item}`).toBe(true);
          else expect(walkable(map, p.x, p.y, false), `item ${p.item} ${p.x},${p.y}`).toBe(true);
          expect(ITEM_BY_ID[p.item], p.item).toBeDefined();
        }
      });

      it('puts berry bushes on bushes you can stand next to', () => {
        for (const b of map.berries ?? []) {
          expect(map.rows[b.y]?.[b.x], `bush ${b.x},${b.y}`).toBe('B');
          expect(ITEM_BY_ID[b.item]?.kind, b.item).toBe('berry');
          expect([[0, 1], [1, 0], [0, -1], [-1, 0]].some(([dx, dy]) => walkable(map, b.x + dx, b.y + dy, false)), `reach ${b.x},${b.y}`).toBe(true);
        }
      });

      it('keeps patches inside the map with known tiles', () => {
        for (const p of map.patches ?? []) {
          p.rows.forEach((r, dy) => {
            expect(p.y + dy < map.rows.length, `patch ${p.id} row ${dy}`).toBe(true);
            expect(p.x + r.length <= map.rows[0].length, `patch ${p.id} width`).toBe(true);
            for (const ch of r) expect(ch === '?' || LEGEND[ch] !== undefined, `patch ${p.id} "${ch}"`).toBe(true);
          });
        }
        for (const it2 of map.interact ?? []) expect(it2.y < map.rows.length && it2.x < map.rows[0].length, `interact ${it2.script}`).toBe(true);
      });

      it('only lists known creatures in encounters, sailing and fishing', () => {
        const tables = [map.encounters?.table, map.surf?.table, ...Object.values(map.fishing ?? {})];
        for (const t of tables) for (const e of t ?? []) expect(CREATURE_BY_ID[e.id], e.id).toBeDefined();
        if (map.surf || map.fishing) expect(map.rows.some((r) => r.includes('~')), 'water tables need water').toBe(true);
      });

      it('gives encounter rates in FireRed units (21 on a route, 7 in a cave, 2 on water)', () => {
        for (const t of [map.encounters, map.surf]) if (t) expect(Number.isInteger(t.rate) && t.rate >= 1 && t.rate <= 30, `rate ${t.rate}`).toBe(true);
      });

      it('puts obstacles on free ground and never two pick-ups on one tile', () => {
        for (const o of map.obstacles ?? []) expect(walkable(map, o.x, o.y, false), `${o.kind} at ${o.x},${o.y}`).toBe(true);
        const spots = (map.items ?? []).map((p) => `${p.x},${p.y}`);
        expect(new Set(spots).size, spots.join(' ')).toBe(spots.length);
      });
    });
  }
});

describe('wild levels', () => {
  // the owner's rule (Oct 2026): a wild Bestiole is never stronger than the trainers of its area
  it('keeps the wild Bestioles at or under the ace of every trainer on the same map', () => {
    for (const m of Object.values(MAPS)) {
      const table = m.encounters?.table ?? [];
      const aces = (m.npcs ?? []).filter((n) => n.trainer && TRAINERS[n.trainer]).map((n) => Math.max(...TRAINERS[n.trainer!].party.map((p) => p.level)));
      if (!table.length || !aces.length) continue;
      expect(Math.max(...table.map((e) => e.max)), m.id).toBeLessThanOrEqual(Math.min(...aces));
    }
  });
});

describe('habitats', () => {
  it('finds wild places, sailing and fishing spots, gifts and the Tombola', () => {
    expect(habitatsOf('012').some((h) => h.map === 'route1' && h.how === 'grass')).toBe(true);
    expect(habitatsOf('003').some((h) => h.map === 'port' && h.how === 'surf')).toBe(true);
    expect(habitatsOf('003').some((h) => h.map === 'bourg' && h.how === 'old')).toBe(true);
    expect(habitatsOf('016').some((h) => h.how === 'gift' && h.map === 'ville')).toBe(true);
    expect(habitatsOf('011').at(-1)?.how).toBe('tombola');
  });
});
