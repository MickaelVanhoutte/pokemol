import { describe, expect, it } from 'vitest';
import { MAPS } from './maps';
import { TOWNS, UNMAPPED, WORLD, WORLD_H, WORLD_W, playerSpot, regionOf, townOfTrainer, type Rect } from './worldmap';

const xo = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w;
const yo = (a: Rect, b: Rect) => a.y < b.y + b.h && b.y < a.y + a.h;
const touch = (a: Rect, b: Rect) => a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h;
const REL = {
  N: (a: Rect, b: Rect) => b.y + b.h === a.y && xo(a, b),
  S: (a: Rect, b: Rect) => a.y + a.h === b.y && xo(a, b),
  W: (a: Rect, b: Rect) => b.x + b.w === a.x && yo(a, b),
  E: (a: Rect, b: Rect) => a.x + a.w === b.x && yo(a, b),
};
const some = (a: string, b: string, f: (x: Rect, y: Rect) => boolean) => WORLD[a].rects.some((x) => WORLD[b].rects.some((y) => f(x, y)));

describe('world map', () => {
  it('gives every outdoor map a place', () => {
    for (const m of Object.values(MAPS)) if (!m.indoor) expect(WORLD[m.id], m.id).toBeDefined();
  });

  it('finds where you are from any map', () => {
    for (const m of Object.values(MAPS)) if (!UNMAPPED.has(m.id)) expect(regionOf(m.id, { map: 'port' }), m.id).toBeTruthy();
    expect(regionOf('centre', { map: 'encre' })).toBe('encre');
    expect(regionOf('labo')).toBe('bourg');
    expect(regionOf('atelierFluo')).toBe('feutre');
    expect(regionOf('tour2')).toBe('tour2');
    expect(regionOf('chambre')).toBeNull();
  });

  it('stays on the grid without overlaps (floors of one place share a rect)', () => {
    const all = Object.entries(WORLD).flatMap(([id, c]) => c.rects.map((r) => ({ id, r })));
    for (const { id, r } of all) expect(r.x >= 0 && r.y >= 0 && r.x + r.w <= WORLD_W && r.y + r.h <= WORLD_H, id).toBe(true);
    for (const a of all) for (const b of all) {
      if (a.id === b.id || JSON.stringify(a.r) === JSON.stringify(b.r)) continue;
      expect(xo(a.r, b.r) && yo(a.r, b.r), `${a.id}/${b.id}`).toBe(false);
    }
  });

  it('puts neighbours where the exits really lead', () => {
    for (const def of Object.values(MAPS)) {
      if (!WORLD[def.id]) continue;
      const w = def.rows[0].length, h = def.rows.length;
      for (const wp of def.warps ?? []) {
        if (wp.to === 'back' || !WORLD[wp.to.map]) continue;
        const dir = wp.y === 0 ? 'N' : wp.y === h - 1 ? 'S' : wp.x === 0 ? 'W' : wp.x === w - 1 ? 'E' : null;
        expect(some(def.id, wp.to.map, !def.indoor && dir ? REL[dir] : touch), `${def.id} ${dir} → ${wp.to.map}`).toBe(true);
      }
      for (const b of def.buildings ?? []) if (b.to && WORLD[b.to.map]) expect(some(def.id, b.to.map, touch), `${def.id} door → ${b.to.map}`).toBe(true);
    }
  });

  it('blinks the player at the right spot', () => {
    expect(playerSpot({ map: 'route1', x: 5, y: 1 })).toEqual({ place: 'route1', x: 11.5, y: 15.5 });
    expect(playerSpot({ map: 'route1', x: 5, y: 28 })).toEqual({ place: 'route1', x: 11.5, y: 17.5 });
    expect(playerSpot({ map: 'centre', x: 5, y: 4, returnTo: { map: 'port' } })?.place).toBe('port');
    expect(playerSpot({ map: 'labo', x: 3, y: 3 })).toEqual({ place: 'bourg', x: 11.5, y: 18.5 });
    expect(playerSpot({ map: 'chambre', x: 3, y: 3 })).toBeNull();
  });

  it('knows the town of every Atelier Master', () => {
    expect(townOfTrainer('mireille')).toBe('ville');
    expect(townOfTrainer('nocturne')).toBe('encre');
  });

  it('lands the balloon in front of each Inn', () => {
    expect(TOWNS.map((t) => t.map)).toEqual(['bourg', 'ville', 'plume', 'port', 'feutre', 'braise', 'paillette', 'gouache', 'encre', 'galerie']);
  });
});
