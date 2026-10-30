import { describe, expect, it } from 'vitest';
import { FISH_TIERS, fishLevel, fishingTable } from './fishing';
import { MAPS } from './maps';

describe('fishing', () => {
  const plume = MAPS.plume.fishing!;

  it('picks the water’s list from the team’s level', () => {
    expect(fishingTable(plume, 8)).toBe(plume.low);
    expect(fishingTable(plume, 20)).toBe(plume.mid);
    expect(fishingTable(plume, 34)).toBe(plume.mid);
    expect(fishingTable(plume, 50)).toBe(plume.high);
    // a missing list falls back to the one below, or the first one there is
    expect(fishingTable({ low: plume.low }, 50)).toBe(plume.low);
    expect(fishingTable({ high: plume.high }, 5)).toBe(plume.high);
    expect(fishingTable(undefined, 30)).toBeNull();
  });

  it('hooks a Bestiole close under the team, within the spot’s range', () => {
    const e = { min: 14, max: 18 };
    expect(fishLevel(16, e, 0)).toBe(14);
    expect(fishLevel(16, e, 0.99)).toBe(16);
    expect(fishLevel(40, e, 0.5)).toBe(18);
    expect(fishLevel(5, e, 0.5)).toBe(14);
  });

  it('has only the three lists in the maps', () => {
    const keys = new Set<string>(FISH_TIERS.map((t) => t.key));
    for (const m of Object.values(MAPS)) for (const k of Object.keys(m.fishing ?? {})) expect(keys.has(k), `${m.id}.${k}`).toBe(true);
  });
});
