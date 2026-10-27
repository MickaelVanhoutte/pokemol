import { describe, expect, it } from 'vitest';
import { MAPS } from './maps';
import { NATURES, type BattleStat } from './natures';
import { WORLD, regionOf } from './worldmap';
import { onSale } from '../ui/screens/ShopScreen';
import { scripts } from '../overworld/controller';
import '../story';

/** Towns with a door into the shared Inn. */
const INN_TOWNS = Object.values(MAPS)
  .filter((m) => [...(m.buildings ?? []).map((b) => b.to?.map), ...(m.warps ?? []).map((w) => (w.to === 'back' ? null : w.to.map))].includes('centre'))
  .map((m) => m.id);
const npcs = MAPS.centre.npcs ?? [];

describe('Inns', () => {
  it('gives every Inn its own helpers, and only the innkeeper and the pilot are in all of them', () => {
    for (const n of npcs) {
      if (n.id === 'aubergiste' || n.id === 'pilot') expect(n.fromMap, n.id).toBeUndefined();
      else expect(n.fromMap?.length, n.id).toBeGreaterThan(0);
      for (const t of n.fromMap ?? []) expect(INN_TOWNS, `${n.id} in ${t}`).toContain(t);
    }
    for (const t of INN_TOWNS) {
      const mine = npcs.filter((n) => n.fromMap?.includes(t));
      expect(mine.length, t).toBeGreaterThan(0);
      const spots = [...npcs.filter((n) => !n.fromMap), ...mine].map((n) => `${n.x},${n.y}`);
      expect(new Set(spots).size, `${t}: ${spots.join(' ')}`).toBe(spots.length);
    }
  });

  it('offers each service in one Inn only, with a script behind it', () => {
    const services = npcs.filter((n) => n.service);
    for (const n of services) {
      expect(n.fromMap, n.id).toHaveLength(1);
      expect(scripts[n.script!], n.script).toBeDefined();
    }
    expect(new Set(services.map((n) => n.service!.fr)).size).toBe(services.length);
  });
});

describe('the Mood Teller', () => {
  it('finds a nature for every stat to raise and every stat to lower, and a balanced one', () => {
    const stats: BattleStat[] = ['atk', 'def', 'spa', 'spd', 'spe'];
    for (const up of stats) for (const down of stats) {
      if (up !== down) expect(NATURES.filter((n) => n.up === up && n.down === down), `${up}/${down}`).toHaveLength(1);
    }
    expect(NATURES.some((n) => !n.up && !n.down)).toBe(true);
  });
});

describe('Magic Lollipops', () => {
  // WORLD lists the places in story order: Port-Aquarelle holds the 3rd badge
  const order = Object.keys(WORLD);
  it('are never lying around before the 3rd badge', () => {
    for (const m of Object.values(MAPS)) {
      if (!(m.items ?? []).some((p) => p.item === 'sucette-magique')) continue;
      const place = regionOf(m.id);
      expect(place, m.id).not.toBeNull();
      expect(order.indexOf(place!), m.id).toBeGreaterThan(order.indexOf('port'));
    }
  });
  it('are only sold once the story is over', () => {
    const allBadges = { badges: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], flags: {} };
    expect(onSale('sucette-magique', allBadges)).toBe(false);
    expect(onSale('sucette-magique', { ...allBadges, flags: { ending: 1 } })).toBe(true);
    expect(onSale('biscuit-vitesse', { badges: ['a', 'b'], flags: {} })).toBe(false);
    expect(onSale('biscuit-vitesse', { badges: ['a', 'b', 'c'], flags: {} })).toBe(true);
  });
});
