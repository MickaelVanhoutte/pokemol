import { describe, expect, it } from 'vitest';
import { MAPS } from '../data/maps';
import { act, createBattle } from '../engine/pk/battle';
import { createMon } from '../engine/pk/creature';
import { L } from '../i18n';
import { SKIES, SNOWY, hasSky, skyOf, skyOver, skyToBattle } from './weather';

describe('the weather over Papeterre', () => {
  it('is the same all day, changes from day to day, and is mostly clear', () => {
    expect(skyOver('route3', 20000)).toBe(skyOver('route3', 20000));
    const days = Array.from({ length: 4000 }, (_, d) => skyOver('route3', 20000 + d));
    const share = (s: string) => days.filter((x) => x === s).length / days.length;
    expect(share('clear')).toBeGreaterThan(0.48);
    expect(share('clear')).toBeLessThan(0.62);
    expect(share('rain')).toBeGreaterThan(0.12);
    expect(share('fog')).toBeGreaterThan(0.06);
    // no snow where it can't snow
    expect(share('snow')).toBe(0);
    expect(new Set(Array.from({ length: 2000 }, (_, d) => skyOver([...SNOWY][0], d))).has('snow')).toBe(true);
  });

  it('leaves Act 1 under a clear sky, and has none indoors, under water or on the sketched edge of the page', () => {
    for (const id of ['bourg', 'route1', 'ville', 'route2', 'bois']) for (let d = 0; d < 300; d++) expect(skyOver(id, d)).toBe('clear');
    expect(hasSky(MAPS.labo)).toBe(false);
    expect(hasSky(MAPS.lacFonds)).toBe(false);
    expect(hasSky(MAPS.bordPage)).toBe(false);
    expect(hasSky(MAPS.route3)).toBe(true);
    expect(skyOf(MAPS.labo, 5)).toBe('clear');
  });

  it('brings rain and hail into battles, which last the whole fight', () => {
    expect(skyToBattle('rain')).toBe('pluie');
    expect(skyToBattle('snow')).toBe('grele');
    expect(skyToBattle('fog')).toBeNull();
    const mon = (sp: string) => createMon(sp, 30, { rng: 1 });
    let st = createBattle({ kind: 'wild', seed: 3, weather: 'pluie', player: { name: L('a', 'a'), party: [mon('008')], isAI: false }, enemy: { name: L('b', 'b'), party: [mon('008')], isAI: true } }).state;
    for (let i = 0; i < 8 && !st.result; i++) st = act(st, { type: 'move', slot: 0 }, { type: 'move', slot: 0 }).state;
    expect(st.weather?.kind).toBe('pluie');
  });

  it('only lists real skies on encounter rows', () => {
    for (const m of Object.values(MAPS)) for (const r of m.encounters?.table ?? []) if (r.sky) {
      expect(SKIES, `${m.id} ${r.id}`).toContain(r.sky);
      expect(hasSky(m), `${m.id}: a weather row on a map without weather`).toBe(true);
    }
  });
});
