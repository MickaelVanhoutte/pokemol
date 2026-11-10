import { describe, expect, it } from 'vitest';
import { CREATURE_BY_ID } from './creatures';
import { ITEM_BY_ID } from './items';
import { MAPS } from './maps';
import { MARKET_STOCK, SWARMS, isBal, marketItem, marketTown, swarmOf, swarmRow, todayNews } from './events';
import { wakesAtHome, ACTIVITIES, REAL_MAX } from './realLife';

const all = Object.fromEntries(SWARMS.map(([m]) => [`seen:${m}`, 1]));

describe('Papeterre’s calendar', () => {
  it('swarms a Bestiole already living on a visited route, from the second badge, the same all day', () => {
    for (const [map, sp] of SWARMS) {
      expect(CREATURE_BY_ID[sp], sp).toBeDefined();
      expect(MAPS[map]?.encounters?.table.some((r) => r.id === sp), `${map} ${sp}`).toBe(true);
    }
    expect(swarmOf(100, { flags: all, badges: ['pastel'] })).toBeNull();
    expect(swarmOf(100, { flags: {}, badges: ['pastel', 'plume'] })).toBeNull();
    const s = swarmOf(100, { flags: all, badges: ['pastel', 'plume'] });
    expect(s).not.toBeNull();
    expect(swarmOf(100, { flags: all, badges: ['pastel', 'plume'] })).toEqual(s);
    const days = new Set(Array.from({ length: 60 }, (_, d) => swarmOf(d, { flags: all, badges: ['pastel', 'plume'] })?.species));
    expect(days.size).toBeGreaterThan(4);
  });

  it('a swarm keeps to the route’s own levels (never above its trainers)', () => {
    for (const [map, sp] of SWARMS) {
      const r = swarmRow(map, sp);
      const t = MAPS[map].encounters!.table;
      expect(r.max).toBeLessThanOrEqual(Math.max(...t.map((x) => x.max)));
      expect(r.w).toBe(t.reduce((a, x) => a + x.w, 0));
    }
  });

  it('opens a market once a week in a town with a shop, selling something real', () => {
    const towns = Array.from({ length: 70 }, (_, d) => marketTown(d)).filter(Boolean);
    expect(towns.length).toBe(10);
    for (const t of towns) expect(MAPS[t!].buildings?.some((b) => b.kind === 'shop')).toBe(true);
    for (const [id, price] of MARKET_STOCK) {
      expect(ITEM_BY_ID[id], id).toBeDefined();
      expect(price).toBeGreaterThan(0);
    }
    expect(marketItem(0)).not.toEqual(marketItem(7));
  });

  it('dances the Star Ball three nights in December, and tells the news', () => {
    expect(isBal(new Date(2026, 11, 21))).toBe(true);
    expect(isBal(new Date(2026, 11, 24))).toBe(false);
    expect(isBal(new Date(2026, 5, 22))).toBe(false);
    const news = todayNews(5, { flags: { ...all, 'seen:paillette': 1 }, badges: ['pastel', 'plume'] }, new Date(2026, 11, 22));
    expect(news.length).toBe(3);
  });

  it('still wakes at home once a week when every real-house activity is done', () => {
    const maxed = Object.fromEntries(ACTIVITIES.map((a) => [`reel:${a.id}`, REAL_MAX]));
    expect(wakesAtHome({ ending: 1, ...maxed }, 70)).toBe(true);
    expect(wakesAtHome({ ending: 1, ...maxed, 'reel:jour': 69, 'reel:semaine': 10 }, 70)).toBe(false);
    expect(wakesAtHome({ ending: 1, ...maxed, 'reel:jour': 70, 'reel:semaine': 10 }, 77)).toBe(true);
  });
});
