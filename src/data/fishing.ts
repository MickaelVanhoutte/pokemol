import type { FishingTables } from '../overworld/mapTypes';

/**
 * One fishing rod: what bites depends on the water and on the team. Each fishing spot has up to three lists,
 * used from the team's level (the average of its three best, `teamLevel`): the low one at first, the mid one
 * from N.20, the high one (the rarest Bestioles) from N.35. A missing list falls back to the one below.
 */
export const FISH_TIERS = [
  { key: 'low', from: 1 },
  { key: 'mid', from: 20 },
  { key: 'high', from: 35 },
] as const;

export type FishTier = (typeof FISH_TIERS)[number]['key'];

/** The list that bites for a team of this level (null when the water holds nothing). */
export function fishingTable(tables: FishingTables | undefined, team: number): FishingTables[FishTier] | null {
  if (!tables) return null;
  for (let i = FISH_TIERS.length - 1; i >= 0; i--) {
    const t = FISH_TIERS[i];
    if (team >= t.from && tables[t.key]?.length) return tables[t.key]!;
  }
  for (const t of FISH_TIERS) if (tables[t.key]?.length) return tables[t.key]!;
  return null;
}

/** A Bestiole's level on the line: close under the team's (team −3 to team), within the spot's range. `r` in [0, 1). */
export function fishLevel(team: number, e: { min: number; max: number }, r: number): number {
  const want = team - 3 + Math.floor(r * 4);
  return Math.max(e.min, Math.min(e.max, want));
}
